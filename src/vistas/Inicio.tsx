// El mini dashboard: una cifra por pestaña y, debajo, lo que hay que mirar de
// cada una (recordatorios de hoy, trabajos a medias, peticiones pendientes…).

import { useState, type ReactNode } from "react";
import { estadoTrabajoVacio, recuento, rondaTocada, totalPasos } from "../lib/checklist.ts";
import { nuevoRecordatorio, nuevoTodo } from "../lib/datos.ts";
import { diaCorto, diaDe, diaLargo, momentoLegible, sumarDias } from "../lib/fechas.ts";
import {
  incidenciasAbiertas,
  notasRecientes,
  peticionesPendientes,
  proximosSieteDias,
  proyectosAbiertos,
  vencidas,
} from "../lib/inicio.ts";
import { ESTADOS_INCIDENCIA, ESTADOS_PETICION, ESTADOS_PROYECTO, SISTEMAS, opcion } from "../lib/opciones.ts";
import { pendientesHoy, posponer } from "../lib/recordatorios.ts";
import { plural } from "../lib/texto.ts";
import {
  actualizar,
  cambiarTodo,
  crear,
  crearTodo,
  eliminarTodo,
  limpiarTodosHechos,
  useDatos,
} from "../estado/almacen.ts";
import { ir, type Pagina as IdPagina } from "../estado/navegacion.ts";
import { useAhora } from "../estado/reloj.ts";
import { TRABAJOS } from "../trabajos/index.ts";
import { Avance, Casilla, Etiqueta } from "../ui/basicos.tsx";
import { Icono } from "../ui/Icono.tsx";
import { Pagina } from "../ui/Pagina.tsx";
import { FechaConPlazo } from "./comun.tsx";
import { CasillaRecordatorio, CuandoRecordatorio } from "./Recordatorios.tsx";

const MAX_FILAS = 6;

export function Inicio() {
  const datos = useDatos();
  const ahora = useAhora();
  const hoy = diaDe(ahora);

  const recordatorios = pendientesHoy(datos.recordatorios, hoy);
  const atrasados = recordatorios.filter((r) => r.fecha < hoy).length;
  const proximos = proximosSieteDias(datos.recordatorios, hoy);
  const proyectos = proyectosAbiertos(datos.proyectos);
  const esperando = proyectos.filter((p) => p.estado === "esperando").length;
  const peticiones = peticionesPendientes(datos.peticiones);
  const peticionesVencidas = vencidas(
    peticiones.map((p) => p.fechaLimite),
    hoy,
  );
  const incidencias = incidenciasAbiertas(datos.incidencias);
  const notas = notasRecientes(datos.notas, 4);
  const trabajos = TRABAJOS.map((t) => {
    const e = datos.trabajos[t.id] ?? estadoTrabajoVacio();
    return { t, e, c: recuento(t, e.actual), enMarcha: rondaTocada(e.actual) };
  });
  const enMarcha = trabajos.filter((x) => x.enMarcha).length;
  const conPega = trabajos.reduce((n, x) => n + x.c.problema + x.c.bloqueado, 0);

  const titulo = diaLargo(hoy);

  return (
    <Pagina titulo="Inicio" descripcion={titulo.charAt(0).toUpperCase() + titulo.slice(1)}>
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <GrupoTodo />

        <Bloque titulo="Tareas"
          pills={
            <>
              <Etiqueta color="default">{plural(enMarcha, "en marcha", "en marcha")}</Etiqueta>
              {conPega > 0 && <Etiqueta color="red">{plural(conPega, "paso con problemas", "pasos con problemas")}</Etiqueta>}
            </>
          } pagina="tareas">
          {trabajos.map(({ t, e, c, enMarcha: marcha }) => (
            <button
              key={t.id}
              type="button"
              onClick={() => ir("tareas", t.id)}
              className="flex w-full items-start gap-2.5 rounded px-1.5 py-1.5 text-left hover:bg-hover"
            >
              <span aria-hidden="true">{t.icono}</span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-medium">{t.nombre}</span>
                  {c.total > 0 ? (
                    <Avance hechos={c.hecho} total={c.total} />
                  ) : totalPasos(t) > 0 ? null : (
                    <span className="text-xs text-tinta-2">Sin pasos todavía</span>
                  )}
                  {c.problema > 0 && <Etiqueta color="red">{c.problema} con problema</Etiqueta>}
                  {c.bloqueado > 0 && <Etiqueta color="orange">{plural(c.bloqueado, "bloqueado", "bloqueados")}</Etiqueta>}
                </span>
                <span className="mt-0.5 block truncate text-sm text-tinta-2">
                  {marcha
                    ? e.actual.notas.split("\n")[0] || "En marcha"
                    : e.ultima
                      ? `Última vez: ${momentoLegible(e.ultima.terminada)}`
                      : "Sin empezar"}
                </span>
              </span>
            </button>
          ))}
        </Bloque>

        <Bloque
          titulo="Recordatorios"
          pills={
            <>
              <Etiqueta color="default">{plural(recordatorios.length, "para hoy", "para hoy")}</Etiqueta>
              {atrasados > 0 && <Etiqueta color="red">{plural(atrasados, "atrasado", "atrasados")}</Etiqueta>}
            </>
          }
          pagina="recordatorios"
          pie={proximos > 0 ? `${proximos} más en los próximos 7 días` : undefined}
        >
          {recordatorios.length === 0 && <Vacio>Nada para hoy.</Vacio>}
          {recordatorios.slice(0, MAX_FILAS).map((r) => (
            <div key={r.id} className="group flex min-h-[34px] items-center gap-2.5 rounded px-1.5 hover:bg-hover">
              <CasillaRecordatorio r={r} />
              <button
                type="button"
                onClick={() => ir("recordatorios", r.id)}
                className="min-w-0 flex-1 truncate py-1 text-left"
              >
                {r.texto || "Sin texto"}
              </button>
              {r.prioridad === "urgente" && <Etiqueta color="red">Urgente</Etiqueta>}
              {r.repetir !== "no" && (
                <span title="Se repite" className="text-tinta-2">
                  <Icono nombre="repetir" className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="text-sm">
                <CuandoRecordatorio r={r} ahora={ahora} />
              </span>
              <button
                type="button"
                onClick={() => actualizar("recordatorios", r.id, posponer(sumarDias(hoy, 1)))}
                className="rounded px-1.5 py-0.5 text-xs text-tinta-2 opacity-0 hover:bg-hover hover:text-tinta focus:opacity-100 group-hover:opacity-100"
                title="Posponer a mañana"
              >
                Mañana
              </button>
            </div>
          ))}
          <Mas total={recordatorios.length} pagina="recordatorios" />
          <AnadirRecordatorio hoy={hoy} />
        </Bloque>

        <Bloque titulo="Proyectos abiertos"
          pills={
            <>
              <Etiqueta color="default">{plural(proyectos.length, "abierto", "abiertos")}</Etiqueta>
              {esperando > 0 && <Etiqueta color="yellow">{plural(esperando, "esperando a alguien", "esperando a alguien")}</Etiqueta>}
            </>
          } pagina="proyectos">
          {proyectos.length === 0 && <Vacio>No hay proyectos abiertos.</Vacio>}
          {proyectos.slice(0, MAX_FILAS).map((p) => {
            const e = opcion(ESTADOS_PROYECTO, p.estado);
            return (
              <Fila key={p.id} onClick={() => ir("proyectos", p.id)}>
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{p.nombre || "Sin nombre"}</span>
                  {p.proximoPaso && (
                    <span className="block truncate text-sm text-tinta-2">→ {p.proximoPaso}</span>
                  )}
                </span>
                <span className="text-sm">
                  <FechaConPlazo dia={p.fechaProximo} hoy={hoy} />
                </span>
                <Etiqueta color={e.color}>{e.texto}</Etiqueta>
              </Fila>
            );
          })}
          <Mas total={proyectos.length} pagina="proyectos" />
        </Bloque>

        <Bloque titulo="Peticiones"
          pills={
            <>
              <Etiqueta color="default">{plural(peticiones.length, "pendiente", "pendientes")}</Etiqueta>
              {peticionesVencidas > 0 && <Etiqueta color="red">{plural(peticionesVencidas, "vencida", "vencidas")}</Etiqueta>}
            </>
          } pagina="peticiones">
          {peticiones.length === 0 && <Vacio>No hay peticiones pendientes.</Vacio>}
          {peticiones.slice(0, MAX_FILAS).map((p) => {
            const e = opcion(ESTADOS_PETICION, p.estado);
            return (
              <Fila key={p.id} onClick={() => ir("peticiones", p.id)}>
                <span className="min-w-0 flex-1 truncate">
                  {p.que || "Sin título"}
                  {p.quien && <span className="text-tinta-2"> · {p.quien}</span>}
                </span>
                <span className="text-sm">
                  <FechaConPlazo dia={p.fechaLimite} hoy={hoy} />
                </span>
                <Etiqueta color={e.color}>{e.texto}</Etiqueta>
              </Fila>
            );
          })}
          <Mas total={peticiones.length} pagina="peticiones" />
        </Bloque>

        <Bloque titulo="Notas"
          pills={<Etiqueta color="default">{plural(datos.notas.length, "nota", "notas")}</Etiqueta>} pagina="notas">
          {notas.length === 0 && <Vacio>Aún no hay notas.</Vacio>}
          {notas.map((n) => (
            <Fila key={n.id} onClick={() => ir("notas", n.id)}>
              <span aria-hidden="true">📄</span>
              <span className="min-w-0 flex-1 truncate">{n.titulo || "Sin título"}</span>
              <span className="text-sm text-tinta-2">{diaCorto(diaDe(new Date(n.editado)), hoy)}</span>
            </Fila>
          ))}
        </Bloque>
        <Bloque titulo="Incidencias"
          pills={<Etiqueta color="default">{plural(incidencias.length, "abierta", "abiertas")}</Etiqueta>} pagina="incidencias">
          {incidencias.length === 0 && <Vacio>No hay incidencias abiertas.</Vacio>}
          {incidencias.slice(0, MAX_FILAS).map((i) => {
            const s = opcion(SISTEMAS, i.sistema);
            const e = opcion(ESTADOS_INCIDENCIA, i.estado);
            return (
              <Fila key={i.id} onClick={() => ir("incidencias", i.id)}>
                <span className="min-w-0 flex-1 truncate">{i.titulo || "Sin título"}</span>
                <Etiqueta color={s.color}>{s.texto}</Etiqueta>
                <Etiqueta color={e.color}>{e.texto}</Etiqueta>
              </Fila>
            );
          })}
          <Mas total={incidencias.length} pagina="incidencias" />
        </Bloque>

      </div>
    </Pagina>
  );
}

/** Un grupo de Inicio: su cuadro, su título con sus cifras en pills y lo
 *  que hay que mirar. */
function Bloque({
  titulo,
  subtitulo,
  pills,
  pagina,
  pie,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  pills?: ReactNode;
  pagina: IdPagina;
  pie?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={titulo} className="rounded-lg border border-linea bg-fondo-2 p-4">
      <header className="flex items-start justify-between gap-2 border-b border-linea pb-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          {subtitulo && <span className="text-sm text-tinta-2">· {subtitulo}</span>}
          {pills}
        </div>
        <button
          type="button"
          onClick={() => ir(pagina)}
          className="shrink-0 rounded px-1.5 py-0.5 text-sm text-tinta-2 hover:bg-hover hover:text-tinta"
        >
          Ver todo →
        </button>
      </header>
      <div className="pt-1.5">{children}</div>
      {pie && <p className="px-1.5 pt-1.5 text-xs text-tinta-2">{pie}</p>}
    </section>
  );
}

function Fila({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[34px] w-full items-center gap-2.5 rounded px-1.5 py-1 text-left hover:bg-hover"
    >
      {children}
    </button>
  );
}

function Vacio({ children }: { children: ReactNode }) {
  return <p className="px-1.5 py-1.5 text-sm text-tinta-2">{children}</p>;
}

function Mas({ total, pagina }: { total: number; pagina: IdPagina }) {
  if (total <= MAX_FILAS) return null;
  return (
    <button
      type="button"
      onClick={() => ir(pagina)}
      className="px-1.5 py-1 text-sm text-tinta-2 hover:text-tinta hover:underline"
    >
      y {total - MAX_FILAS} más
    </button>
  );
}

/** Añadir un recordatorio para hoy sin salir de Inicio. */
function AnadirRecordatorio({ hoy }: { hoy: string }) {
  const [texto, setTexto] = useState("");
  const anadir = () => {
    const t = texto.trim();
    if (!t) return;
    crear("recordatorios", nuevoRecordatorio(new Date().toISOString(), hoy, { texto: t }));
    setTexto("");
  };
  return (
    <div className="flex min-h-[34px] items-center gap-2.5 px-1.5">
      <Icono nombre="mas" className="h-4 w-4 text-tinta-3" />
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") anadir();
        }}
        placeholder="Añadir un recordatorio para hoy y pulsar Intro"
        aria-label="Nuevo recordatorio para hoy"
        className="min-w-0 flex-1 bg-transparent py-1 text-[15px] outline-none placeholder:text-tinta-3"
      />
    </div>
  );
}

/** «To do»: cosas sueltas por hacer. Se añaden escribiendo y pulsando Intro;
 *  las hechas bajan al final tachadas hasta que se limpian. */
function GrupoTodo() {
  const datos = useDatos();
  const [texto, setTexto] = useState("");
  const pendientes = datos.todos.filter((t) => !t.hecho);
  const hechos = datos.todos.filter((t) => t.hecho);
  const anadir = () => {
    const t = texto.trim();
    if (!t) return;
    crearTodo(nuevoTodo(new Date().toISOString(), { texto: t }));
    setTexto("");
  };

  return (
    <section aria-label="To do" className="rounded-lg border border-linea bg-fondo-2 p-4">
      <header className="flex items-start justify-between gap-2 border-b border-linea pb-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h2 className="text-lg font-semibold">To do</h2>
          <Etiqueta color="default">{plural(pendientes.length, "pendiente", "pendientes")}</Etiqueta>
        </div>
        {hechos.length > 0 && (
          <button
            type="button"
            onClick={limpiarTodosHechos}
            className="shrink-0 rounded px-1.5 py-0.5 text-sm text-tinta-2 hover:bg-hover hover:text-tinta"
          >
            Limpiar hechos ({hechos.length})
          </button>
        )}
      </header>
      <div className="pt-1.5">
        {[...pendientes, ...hechos].map((t) => (
          <div key={t.id} className="group flex min-h-[34px] items-center gap-2.5 rounded px-1.5 hover:bg-hover">
            <Casilla
              marcada={t.hecho}
              onCambiar={(hecho) => cambiarTodo(t.id, { hecho, hechoEl: hecho ? new Date().toISOString() : null })}
              etiqueta={`Hecho: ${t.texto}`}
            />
            <input
              value={t.texto}
              onChange={(e) => cambiarTodo(t.id, { texto: e.target.value })}
              aria-label="To do"
              className={`min-w-0 flex-1 bg-transparent py-1 outline-none ${t.hecho ? "text-tinta-2 line-through" : ""}`}
            />
            <button
              type="button"
              onClick={() => eliminarTodo(t.id)}
              aria-label={`Quitar «${t.texto}»`}
              title="Quitar"
              className="rounded p-0.5 text-tinta-2 opacity-0 hover:bg-hover hover:text-tinta focus:opacity-100 group-hover:opacity-100"
            >
              <Icono nombre="papelera" className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        <div className="flex min-h-[34px] items-center gap-2.5 px-1.5">
          <Icono nombre="mas" className="h-4 w-4 text-tinta-3" />
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") anadir();
            }}
            placeholder="Añadir y pulsar Intro"
            aria-label="Nuevo to do"
            className="min-w-0 flex-1 bg-transparent py-1 text-[15px] outline-none placeholder:text-tinta-3"
          />
        </div>
      </div>
    </section>
  );
}
