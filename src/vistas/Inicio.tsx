// El mini dashboard: una cifra por pestaña y, debajo, lo que hay que mirar de
// cada una (recordatorios de hoy, trabajos a medias, peticiones pendientes…).

import { useState, type ReactNode } from "react";
import { estadoTrabajoVacio, recuento, rondaTocada, totalPasos } from "../lib/checklist.ts";
import { nuevoRecordatorio } from "../lib/datos.ts";
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
import { actualizar, crear, useDatos } from "../estado/almacen.ts";
import { ir, type Pagina as IdPagina } from "../estado/navegacion.ts";
import { useAhora } from "../estado/reloj.ts";
import { TRABAJOS } from "../trabajos/index.ts";
import { Avance, Etiqueta } from "../ui/basicos.tsx";
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
    <Pagina icono="🏠" titulo="Inicio" descripcion={titulo.charAt(0).toUpperCase() + titulo.slice(1)}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Cifra
          icono="⏰"
          nombre="Recordatorios"
          valor={recordatorios.length}
          detalle={atrasados > 0 ? plural(atrasados, "atrasado", "atrasados") : "para hoy"}
          alerta={atrasados > 0}
          pagina="recordatorios"
        />
        <Cifra
          icono="✅"
          nombre="Tareas en marcha"
          valor={enMarcha}
          detalle={conPega > 0 ? plural(conPega, "paso con problemas", "pasos con problemas") : `de ${TRABAJOS.length} trabajos`}
          alerta={conPega > 0}
          pagina="tareas"
        />
        <Cifra
          icono="📁"
          nombre="Proyectos abiertos"
          valor={proyectos.length}
          detalle={esperando > 0 ? `${esperando} esperando a alguien` : "en marcha"}
          pagina="proyectos"
        />
        <Cifra
          icono="📨"
          nombre="Peticiones"
          valor={peticiones.length}
          detalle={peticionesVencidas > 0 ? plural(peticionesVencidas, "vencida", "vencidas") : "pendientes"}
          alerta={peticionesVencidas > 0}
          pagina="peticiones"
        />
        <Cifra icono="🐞" nombre="Incidencias" valor={incidencias.length} detalle="abiertas" pagina="incidencias" />
        <Cifra
          icono="📝"
          nombre="Notas"
          valor={datos.notas.length}
          detalle={notas[0] ? `última, ${diaCorto(diaDe(new Date(notas[0].editado)), hoy)}` : "ninguna"}
          pagina="notas"
        />
      </div>

      <div className="mt-10 grid gap-x-12 gap-y-10 lg:grid-cols-2">
        <Bloque
          icono="⏰"
          titulo="Recordatorios"
          subtitulo="Hoy y atrasados"
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

        <Bloque icono="✅" titulo="Tareas" pagina="tareas">
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
                  {totalPasos(t) > 0 ? (
                    <Avance hechos={c.hecho} total={c.total} />
                  ) : (
                    <span className="text-xs text-tinta-2">Sin pasos todavía</span>
                  )}
                  {c.problema > 0 && <Etiqueta color="red">{c.problema} con problema</Etiqueta>}
                  {c.bloqueado > 0 && <Etiqueta color="orange">{plural(c.bloqueado, "bloqueado", "bloqueados")}</Etiqueta>}
                </span>
                <span className="mt-0.5 block truncate text-sm text-tinta-2">
                  {marcha
                    ? e.actual.referencia || "En marcha"
                    : e.ultima
                      ? `Última vez: ${momentoLegible(e.ultima.terminada)}`
                      : "Sin empezar"}
                </span>
              </span>
            </button>
          ))}
        </Bloque>

        <Bloque icono="📨" titulo="Peticiones" subtitulo="Pendientes" pagina="peticiones">
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

        <Bloque icono="📁" titulo="Proyectos abiertos" pagina="proyectos">
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

        <Bloque icono="🐞" titulo="Incidencias" subtitulo="Abiertas" pagina="incidencias">
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

        <Bloque icono="📝" titulo="Notas" subtitulo="Recientes" pagina="notas">
          {notas.length === 0 && <Vacio>Aún no hay notas.</Vacio>}
          {notas.map((n) => (
            <Fila key={n.id} onClick={() => ir("notas", n.id)}>
              <span aria-hidden="true">📄</span>
              <span className="min-w-0 flex-1 truncate">{n.titulo || "Sin título"}</span>
              <span className="text-sm text-tinta-2">{diaCorto(diaDe(new Date(n.editado)), hoy)}</span>
            </Fila>
          ))}
        </Bloque>
      </div>
    </Pagina>
  );
}

function Cifra({
  icono,
  nombre,
  valor,
  detalle,
  alerta = false,
  pagina,
}: {
  icono: string;
  nombre: string;
  valor: number;
  detalle: string;
  alerta?: boolean;
  pagina: IdPagina;
}) {
  return (
    <button
      type="button"
      onClick={() => ir(pagina)}
      className="flex flex-col items-start rounded-lg border border-linea px-3.5 py-3 text-left transition-colors hover:bg-hover"
    >
      <span className="flex items-center gap-1.5 text-sm text-tinta-2">
        <span aria-hidden="true">{icono}</span>
        {nombre}
      </span>
      <span className="mt-1 text-[26px] font-semibold leading-tight">{valor}</span>
      <span className={`text-xs ${alerta ? "font-medium text-rojo" : "text-tinta-2"}`}>{detalle}</span>
    </button>
  );
}

function Bloque({
  icono,
  titulo,
  subtitulo,
  pagina,
  pie,
  children,
}: {
  icono: string;
  titulo: string;
  subtitulo?: string;
  pagina: IdPagina;
  pie?: string;
  children: ReactNode;
}) {
  return (
    <section aria-label={titulo}>
      <header className="flex items-baseline justify-between gap-2 border-b border-linea pb-1.5">
        <h2 className="flex items-baseline gap-2 text-lg font-semibold">
          <span aria-hidden="true">{icono}</span>
          {titulo}
          {subtitulo && <span className="text-sm font-normal text-tinta-2">· {subtitulo}</span>}
        </h2>
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
