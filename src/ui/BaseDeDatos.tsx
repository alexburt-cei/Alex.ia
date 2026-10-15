// Una lista de elementos con dos vistas, como una base de datos de Notion:
// Tabla (una fila por elemento) y Tablero (columnas por estado; las tarjetas se
// arrastran de una a otra). Al pulsar un elemento se abre en el panel lateral.

import { useState, type DragEvent, type ReactNode } from "react";
import type { Opcion } from "../lib/opciones.ts";
import { plural } from "../lib/texto.ts";
import { Boton, Etiqueta, Pestanas } from "./basicos.tsx";
import { Icono, type NombreIcono } from "./Icono.tsx";

export interface Columna<T> {
  id: string;
  titulo: string;
  icono: NombreIcono;
  /** Ancho mínimo de la columna, en píxeles. */
  ancho: number;
  celda: (x: T) => ReactNode;
}

export interface Agrupacion<T> {
  opciones: Opcion[];
  grupo: (x: T) => string;
  /** Qué pasa al soltar una tarjeta en otra columna. */
  mover: (x: T, grupo: string) => void;
  /** Columnas donde no se puede soltar (p. ej. «Atrasados»). */
  noSoltar?: string[];
  /** Columnas de lo terminado: su contenido se oculta salvo con «Ver …». */
  terminadas: string[];
}

type Vista = "tabla" | "tablero";

function vistaGuardada(clave: string): Vista {
  try {
    return localStorage.getItem(`alexia.vista.${clave}`) === "tablero" ? "tablero" : "tabla";
  } catch {
    return "tabla";
  }
}

export function BaseDeDatos<T extends { id: string }>({
  clave,
  elementos,
  columnas,
  agrupacion,
  terminado,
  textoVerTerminados,
  abierto,
  onAbrir,
  onNuevo,
  textoNuevo,
  textoVacio,
  tarjeta,
  antes,
}: {
  /** Para recordar la vista elegida de cada lista. */
  clave: string;
  elementos: T[];
  columnas: Columna<T>[];
  /** Sin agrupación, solo hay vista Tabla. */
  agrupacion?: Agrupacion<T>;
  terminado?: (x: T) => boolean;
  textoVerTerminados?: string;
  abierto: string | null;
  onAbrir: (id: string) => void;
  /** Crear uno nuevo; desde el tablero, en esa columna. */
  onNuevo: (grupo?: string) => void;
  textoNuevo: string;
  textoVacio: string;
  /** Contenido de la tarjeta en el tablero. */
  tarjeta?: (x: T) => ReactNode;
  /** Un control delante del nombre (la casilla de los recordatorios). */
  antes?: (x: T) => ReactNode;
}) {
  const [vista, setVista] = useState<Vista>(() => (agrupacion ? vistaGuardada(clave) : "tabla"));
  const [verTerminados, setVerTerminados] = useState(false);

  const cambiarVista = (v: Vista) => {
    setVista(v);
    try {
      localStorage.setItem(`alexia.vista.${clave}`, v);
    } catch {
      /* sin recordar la vista */
    }
  };

  const nTerminados = terminado ? elementos.filter(terminado).length : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-linea">
        {agrupacion ? (
          <Pestanas
            etiqueta="Vista"
            tamano="pequeno"
            valor={vista}
            onCambiar={cambiarVista}
            opciones={[
              { valor: "tabla", texto: "Tabla", icono: <Icono nombre="tabla" /> },
              { valor: "tablero", texto: "Tablero", icono: <Icono nombre="tablero" /> },
            ]}
          />
        ) : (
          <span />
        )}
        <div className="flex items-center gap-1 pb-1.5">
          {terminado && textoVerTerminados && nTerminados > 0 && (
            <Boton onClick={() => setVerTerminados((v) => !v)}>
              {verTerminados ? "Ocultar" : textoVerTerminados} ({nTerminados})
            </Boton>
          )}
          <Boton tipo="primario" icono="mas" onClick={() => onNuevo()}>
            {textoNuevo}
          </Boton>
        </div>
      </div>

      {vista === "tablero" && agrupacion ? (
        <Tablero
          elementos={elementos}
          columnas={columnas}
          agrupacion={agrupacion}
          verTerminados={verTerminados}
          onVerTerminados={() => setVerTerminados(true)}
          abierto={abierto}
          onAbrir={onAbrir}
          onNuevo={onNuevo}
          tarjeta={tarjeta}
          antes={antes}
        />
      ) : (
        <Tabla
          elementos={verTerminados || !terminado ? elementos : elementos.filter((x) => !terminado(x))}
          columnas={columnas}
          abierto={abierto}
          onAbrir={onAbrir}
          onNuevo={() => onNuevo()}
          textoNuevo={textoNuevo}
          textoVacio={elementos.length === 0 ? textoVacio : "Todo está terminado."}
          antes={antes}
        />
      )}
    </div>
  );
}

function Tabla<T extends { id: string }>({
  elementos,
  columnas,
  abierto,
  onAbrir,
  onNuevo,
  textoNuevo,
  textoVacio,
  antes,
}: {
  elementos: T[];
  columnas: Columna<T>[];
  abierto: string | null;
  onAbrir: (id: string) => void;
  onNuevo: () => void;
  textoNuevo: string;
  textoVacio: string;
  antes?: (x: T) => ReactNode;
}) {
  return (
    <div className="desplazable overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-linea">
            {columnas.map((c, i) => (
              <th
                key={c.id}
                scope="col"
                style={{ minWidth: c.ancho }}
                className={`h-9 px-2 text-left font-normal text-tinta-2 ${i > 0 ? "border-l border-linea" : ""}`}
              >
                <span className="flex items-center gap-1.5">
                  <Icono nombre={c.icono} />
                  {c.titulo}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {elementos.map((x) => (
            <tr
              key={x.id}
              onClick={() => onAbrir(x.id)}
              className={`cursor-pointer border-b border-linea ${x.id === abierto ? "bg-activo" : "hover:bg-hover"}`}
            >
              {columnas.map((c, i) => (
                <td
                  key={c.id}
                  className={`h-[38px] px-2 py-1 align-middle ${i > 0 ? "border-l border-linea" : ""}`}
                >
                  {i === 0 ? (
                    // El primer campo es el nombre: es el que se alcanza con el teclado.
                    <div className="flex items-center gap-2">
                      {antes?.(x)}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAbrir(x.id);
                        }}
                        className="min-w-0 flex-1 text-left font-medium"
                      >
                        {c.celda(x)}
                      </button>
                    </div>
                  ) : (
                    c.celda(x)
                  )}
                </td>
              ))}
            </tr>
          ))}
          {elementos.length === 0 && (
            <tr className="border-b border-linea">
              <td colSpan={columnas.length} className="px-2 py-3 text-tinta-2">
                {textoVacio}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <button
        type="button"
        onClick={onNuevo}
        className="flex h-9 w-full items-center gap-1.5 px-2 text-sm text-tinta-2 hover:bg-hover"
      >
        <Icono nombre="mas" />
        {textoNuevo}
      </button>
    </div>
  );
}

function Tablero<T extends { id: string }>({
  elementos,
  columnas,
  agrupacion,
  verTerminados,
  onVerTerminados,
  abierto,
  onAbrir,
  onNuevo,
  tarjeta,
  antes,
}: {
  elementos: T[];
  columnas: Columna<T>[];
  agrupacion: Agrupacion<T>;
  verTerminados: boolean;
  onVerTerminados: () => void;
  abierto: string | null;
  onAbrir: (id: string) => void;
  onNuevo: (grupo?: string) => void;
  tarjeta?: (x: T) => ReactNode;
  antes?: (x: T) => ReactNode;
}) {
  const [sobre, setSobre] = useState<string | null>(null);
  const [arrastrando, setArrastrando] = useState<string | null>(null);

  const soltar = (e: DragEvent, grupo: string) => {
    e.preventDefault();
    setSobre(null);
    setArrastrando(null);
    const x = elementos.find((el) => el.id === e.dataTransfer.getData("text/plain"));
    if (x && agrupacion.grupo(x) !== grupo) agrupacion.mover(x, grupo);
  };

  return (
    <div className="desplazable flex gap-3 overflow-x-auto pb-4 pt-3">
      {agrupacion.opciones.map((o) => {
        const todos = elementos.filter((x) => agrupacion.grupo(x) === o.valor);
        const terminada = agrupacion.terminadas.includes(o.valor);
        const visibles = terminada && !verTerminados ? [] : todos;
        const admite = !agrupacion.noSoltar?.includes(o.valor);
        const resaltada = admite && sobre === o.valor && arrastrando !== null;
        return (
          <section
            key={o.valor}
            aria-label={o.texto}
            onDragOver={(e) => {
              if (!admite) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (sobre !== o.valor) setSobre(o.valor);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSobre(null);
            }}
            onDrop={(e) => admite && soltar(e, o.valor)}
            className={`flex min-w-[210px] max-w-[300px] flex-1 flex-col rounded-lg p-1.5 transition-colors ${
              resaltada ? "bg-activo" : "bg-fondo-2"
            }`}
          >
            <header className="flex items-center gap-2 px-1.5 pb-2 pt-1">
              <Etiqueta color={o.color}>{o.texto}</Etiqueta>
              <span className="text-sm text-tinta-2">{todos.length}</span>
            </header>
            <div className="flex flex-col gap-1.5">
              {visibles.map((x) => (
                <article
                  key={x.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", x.id);
                    e.dataTransfer.effectAllowed = "move";
                    setArrastrando(x.id);
                  }}
                  onDragEnd={() => {
                    setArrastrando(null);
                    setSobre(null);
                  }}
                  onClick={() => onAbrir(x.id)}
                  className={`cursor-pointer rounded-md border bg-fondo p-2.5 text-sm shadow-sm transition-colors hover:bg-hover ${
                    x.id === abierto ? "border-acento" : "border-linea"
                  } ${arrastrando === x.id ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start gap-2">
                    {antes && <span className="pt-0.5">{antes(x)}</span>}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAbrir(x.id);
                      }}
                      className="min-w-0 flex-1 text-left font-medium"
                    >
                      {columnas[0].celda(x)}
                    </button>
                  </div>
                  {tarjeta && <div className="mt-1.5 space-y-1 text-xs text-tinta-2">{tarjeta(x)}</div>}
                </article>
              ))}
              {terminada && !verTerminados && todos.length > 0 && (
                <button
                  type="button"
                  onClick={onVerTerminados}
                  className="rounded px-2 py-1.5 text-left text-sm text-tinta-2 hover:bg-hover"
                >
                  {plural(todos.length, "oculto", "ocultos")} · Ver
                </button>
              )}
              {admite && !terminada && (
                <button
                  type="button"
                  onClick={() => onNuevo(o.valor)}
                  className="flex items-center gap-1.5 rounded px-2 py-1.5 text-sm text-tinta-2 hover:bg-hover"
                >
                  <Icono nombre="mas" />
                  Nuevo
                </button>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
