import { useCallback } from "react";
import { nuevaPeticion } from "../lib/datos.ts";
import { diaDe, momentoLegible } from "../lib/fechas.ts";
import { peticionesPendientes } from "../lib/inicio.ts";
import { CANALES, ESTADOS_PETICION, opcion, type Opcion } from "../lib/opciones.ts";
import type { EstadoPeticion, Peticion } from "../lib/tipos.ts";
import { actualizar, crear, eliminar, useDatos } from "../estado/almacen.ts";
import { ir } from "../estado/navegacion.ts";
import { useAhora } from "../estado/reloj.ts";
import { TRABAJOS, trabajoPorId } from "../trabajos/index.ts";
import { Boton, Etiqueta } from "../ui/basicos.tsx";
import { BaseDeDatos, type Columna } from "../ui/BaseDeDatos.tsx";
import { AreaTexto, CampoFecha, CampoTexto, Selector } from "../ui/campos.tsx";
import { Icono } from "../ui/Icono.tsx";
import { Pagina } from "../ui/Pagina.tsx";
import { BloquePeek, Peek, Propiedad, Propiedades, TituloPeek } from "../ui/Peek.tsx";
import { FechaConPlazo, SinTitulo } from "./comun.tsx";

const SIN_TRABAJO = "_ninguno";
const OPCIONES_TRABAJO: Opcion[] = [
  { valor: SIN_TRABAJO, texto: "Ninguno", color: "default" },
  ...TRABAJOS.map((t) => ({ valor: t.id, texto: `${t.icono} ${t.nombre}`, color: "default" as const })),
];

function cambioDeEstado(estado: EstadoPeticion): Partial<Peticion> {
  return { estado, hechaEl: estado === "hecha" ? new Date().toISOString() : null };
}

function ordenar(lista: Peticion[]): Peticion[] {
  const hechas = lista
    .filter((p) => p.estado === "hecha")
    .sort((a, b) => (b.hechaEl ?? b.editado).localeCompare(a.hechaEl ?? a.editado));
  return [...peticionesPendientes(lista), ...hechas];
}

/** Botón que abre en Tareas el trabajo de una petición. */
export function AbrirTarea({ trabajo }: { trabajo: string | null }) {
  const t = trabajoPorId(trabajo);
  if (!t) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        ir("tareas", t.id);
      }}
      title="Abrir su tarea"
      className="inline-flex max-w-full items-center gap-1 rounded px-1 text-left underline decoration-linea underline-offset-2 hover:bg-hover"
    >
      <Icono nombre="abrir" className="h-3.5 w-3.5 text-tinta-2" />
      <span className="truncate">
        {t.icono} {t.nombre}
      </span>
    </button>
  );
}

export function Peticiones({ abierto }: { abierto: string | null }) {
  const datos = useDatos();
  const hoy = diaDe(useAhora());
  const actual = datos.peticiones.find((p) => p.id === abierto) ?? null;
  const cerrar = useCallback(() => ir("peticiones"), []);

  const nueva = (grupo?: string) => {
    const p = nuevaPeticion(new Date().toISOString(), grupo ? cambioDeEstado(grupo as EstadoPeticion) : {});
    crear("peticiones", p);
    ir("peticiones", p.id);
  };

  const columnas: Columna<Peticion>[] = [
    {
      id: "que",
      titulo: "Petición",
      icono: "texto",
      ancho: 250,
      celda: (p) => p.que || <SinTitulo texto="Sin título" />,
    },
    { id: "quien", titulo: "Quién", icono: "persona", ancho: 140, celda: (p) => p.quien },
    {
      id: "canal",
      titulo: "Por dónde",
      icono: "canal",
      ancho: 130,
      celda: (p) => (
        <Selector
          opciones={CANALES}
          valor={p.canal}
          onCambiar={(canal) => actualizar("peticiones", p.id, { canal })}
          etiqueta="Por dónde"
        />
      ),
    },
    {
      id: "limite",
      titulo: "Fecha límite",
      icono: "fecha",
      ancho: 120,
      celda: (p) => <FechaConPlazo dia={p.fechaLimite} hoy={hoy} activa={p.estado !== "hecha"} />,
    },
    {
      id: "estado",
      titulo: "Estado",
      icono: "estado",
      ancho: 170,
      celda: (p) => (
        <Selector
          opciones={ESTADOS_PETICION}
          valor={p.estado}
          onCambiar={(e) => actualizar("peticiones", p.id, cambioDeEstado(e))}
          etiqueta="Estado"
        />
      ),
    },
    { id: "trabajo", titulo: "Tarea", icono: "lista", ancho: 180, celda: (p) => <AbrirTarea trabajo={p.trabajo} /> },
  ];

  return (
    <Pagina
      titulo="Peticiones"
      descripcion="Lo que te piden: quién, por dónde, para cuándo y si ya está hecho.">
      <BaseDeDatos
        clave="peticiones"
        elementos={ordenar(datos.peticiones)}
        columnas={columnas}
        agrupacion={{
          opciones: ESTADOS_PETICION,
          grupo: (p) => p.estado,
          mover: (p, estado) => actualizar("peticiones", p.id, cambioDeEstado(estado as EstadoPeticion)),
          terminadas: ["hecha"],
        }}
        terminado={(p) => p.estado === "hecha"}
        textoVerTerminados="Ver hechas"
        abierto={abierto}
        onAbrir={(id) => ir("peticiones", id)}
        onNuevo={nueva}
        textoNuevo="Nueva petición"
        textoVacio="No hay peticiones."
        tarjeta={(p) => {
          const c = opcion(CANALES, p.canal);
          return (
            <>
              <p className="flex flex-wrap items-center gap-2">
                {p.quien && <span>{p.quien}</span>}
                <Etiqueta color={c.color}>{c.texto}</Etiqueta>
                <FechaConPlazo dia={p.fechaLimite} hoy={hoy} activa={p.estado !== "hecha"} />
              </p>
              <AbrirTarea trabajo={p.trabajo} />
            </>
          );
        }}
      />

      {actual && (
        <Peek
          key={actual.id}
          onCerrar={cerrar}
          onEliminar={() => {
            eliminar("peticiones", actual.id);
            cerrar();
          }}
          textoEliminar={`¿Eliminar la petición «${actual.que || "sin título"}»?`}
        >
          <PanelPeticion p={actual} />
        </Peek>
      )}
    </Pagina>
  );
}

function PanelPeticion({ p }: { p: Peticion }) {
  const cambiar = (c: Partial<Peticion>) => actualizar("peticiones", p.id, c);
  return (
    <>
      <TituloPeek valor={p.que} onCambiar={(que) => cambiar({ que })} placeholder="¿Qué te piden?" />
      <Propiedades>
        <Propiedad icono="persona" nombre="Quién">
          <CampoTexto valor={p.quien} onCambiar={(quien) => cambiar({ quien })} etiqueta="Quién" placeholder="Quién lo pide" />
        </Propiedad>
        <Propiedad icono="canal" nombre="Por dónde">
          <Selector opciones={CANALES} valor={p.canal} onCambiar={(canal) => cambiar({ canal })} etiqueta="Por dónde" />
        </Propiedad>
        <Propiedad icono="fecha" nombre="Fecha límite">
          <CampoFecha valor={p.fechaLimite} onCambiar={(fechaLimite) => cambiar({ fechaLimite })} etiqueta="Fecha límite" />
        </Propiedad>
        <Propiedad icono="estado" nombre="Estado">
          <Selector opciones={ESTADOS_PETICION} valor={p.estado} onCambiar={(e) => cambiar(cambioDeEstado(e))} etiqueta="Estado" />
        </Propiedad>
        <Propiedad icono="lista" nombre="Tarea">
          <div className="flex flex-wrap items-center gap-1">
            <Selector
              opciones={OPCIONES_TRABAJO}
              valor={p.trabajo ?? SIN_TRABAJO}
              onCambiar={(v) => cambiar({ trabajo: v === SIN_TRABAJO ? null : v })}
              etiqueta="Tarea"
            />
            {p.trabajo && (
              <Boton tipo="borde" icono="abrir" onClick={() => ir("tareas", p.trabajo)}>
                Abrir su tarea
              </Boton>
            )}
          </div>
        </Propiedad>
        <Propiedad icono="hora" nombre="Recibida">
          <span className="block px-1.5 pt-1.5 text-tinta-2">{momentoLegible(p.creado)}</span>
        </Propiedad>
        {p.hechaEl && (
          <Propiedad icono="hora" nombre="Hecha">
            <span className="block px-1.5 pt-1.5 text-tinta-2">{momentoLegible(p.hechaEl)}</span>
          </Propiedad>
        )}
      </Propiedades>

      <BloquePeek titulo="Notas">
        <AreaTexto valor={p.notas} onCambiar={(notas) => cambiar({ notas })} etiqueta="Notas" placeholder="Escribe aquí…" filas={4} />
      </BloquePeek>
    </>
  );
}
