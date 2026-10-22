import { useState } from "react";
import {
  aspectoCards,
  completa,
  editarRonda,
  estadoTrabajoVacio,
  marcaDe,
  marcar,
  recuento,
  rondaTocada,
  seccionesVisibles,
  terminar,
  totalPasos,
} from "../lib/checklist.ts";
import { diaCorto, diaDe, momentoLegible } from "../lib/fechas.ts";
import { nuevoRecordatorio } from "../lib/datos.ts";
import { peticionesPendientes } from "../lib/inicio.ts";
import { ESTADOS_PASO, opcion } from "../lib/opciones.ts";
import { plural } from "../lib/texto.ts";
import type { MarcaPaso, Paso, RondaTerminada, Ronda, Trabajo } from "../lib/tipos.ts";
import { cambiarTrabajo, crear, useDatos } from "../estado/almacen.ts";
import { useAhora } from "../estado/reloj.ts";
import { ir } from "../estado/navegacion.ts";
import { TRABAJOS, trabajoPorId } from "../trabajos/index.ts";
import { Avance, Aviso, Boton, Casilla, Etiqueta, Pestanas, Plegable } from "../ui/basicos.tsx";
import { AreaTexto, CampoFecha, Selector } from "../ui/campos.tsx";
import { TarjetasPasos } from "./TarjetasPasos.tsx";
import { Pagina } from "../ui/Pagina.tsx";
import { Propiedad } from "../ui/Peek.tsx";
import { Icono } from "../ui/Icono.tsx";

export function Tareas({ trabajo }: { trabajo: string | null }) {
  const t = trabajoPorId(trabajo) ?? TRABAJOS[0];
  return (
    <Pagina
      titulo="Tareas"
      descripcion="Tus trabajos de siempre, paso a paso. Al acabar, «Terminar» guarda la lista en «Última vez» y la deja vacía para la próxima."
      lateral={<PanelTrabajo key={t.id} t={t} />}
    >
      <div className="border-b border-linea">
        <Pestanas
          etiqueta="Trabajos"
          valor={t.id}
          onCambiar={(id) => ir("tareas", id)}
          opciones={TRABAJOS.map((x) => ({
            valor: x.id,
            texto: x.nombre,
            icono: <span aria-hidden="true">{x.icono}</span>,
          }))}
        />
      </div>
      <VistaTrabajo key={t.id} t={t} />
    </Pagina>
  );
}

const ahoraISO = () => new Date().toISOString();

function VistaTrabajo({ t }: { t: Trabajo }) {
  const datos = useDatos();
  const estado = datos.trabajos[t.id] ?? estadoTrabajoVacio();
  const r = estado.actual;
  const secciones = seccionesVisibles(t, r.variante);
  const c = recuento(t, r);
  const [ayudaAbierta, setAyudaAbierta] = useState(false);
  const hayAyuda = t.secciones.some((s) => s.pasos.some((p) => p.como || p.comprobar));

  const marcarPaso = (id: string, cambios: Partial<MarcaPaso>) =>
    cambiarTrabajo(t.id, (e) => ({ ...e, actual: marcar(e.actual, id, cambios, ahoraISO()) }));

  const conCards = t.vista === "cards";
  const puedeTerminar = conCards ? completa(t, r) : rondaTocada(r);

  const pulsarTerminar = () => {
    const faltan = c.total - c.hecho;
    const pregunta =
      faltan > 0
        ? `Quedan ${faltan} ${faltan === 1 ? "paso" : "pasos"} sin «Hecho». ¿Terminar igualmente? La lista se guarda en «Última vez» y se vacía.`
        : "La lista se guarda en «Última vez» y se vacía para la próxima vez. ¿Terminar?";
    if (window.confirm(pregunta)) cambiarTrabajo(t.id, (e) => terminar(t, e, ahoraISO()));
  };


  return (
    <div className="pt-7">
      <h2 className="text-2xl font-semibold">{t.nombre}</h2>
      {t.descripcion && <p className="mt-1 text-[15px] text-tinta-2">{t.descripcion}</p>}

      {t.enlaces && t.enlaces.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {t.enlaces.map((e) => (
            <a
              key={e.url}
              href={e.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--e-gray-bg)] px-3 py-1.5 text-sm font-medium text-[var(--e-gray-tx)] hover:underline"
            >
              <Icono nombre="abrir" className="h-3.5 w-3.5" />
              {e.texto}
            </a>
          ))}
        </div>
      )}

      <section className="mt-6" aria-label="Checklist">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold">Checklist</h3>
            {c.total > 0 && <Avance hechos={c.hecho} total={c.total} />}
            {c.en_curso > 0 && <Etiqueta color="blue">{c.en_curso} en curso</Etiqueta>}
            {c.problema > 0 && <Etiqueta color="red">{c.problema} con problema</Etiqueta>}
            {c.bloqueado > 0 && <Etiqueta color="orange">{plural(c.bloqueado, "bloqueado", "bloqueados")}</Etiqueta>}
          </div>
          {hayAyuda && !conCards && (
            <Boton onClick={() => setAyudaAbierta((a) => !a)}>
              {ayudaAbierta ? "Ocultar la ayuda" : "Ver la ayuda de todos los pasos"}
            </Boton>
          )}
        </div>

        {/* Tras «Terminar», las filas empiezan de cero (sin notas ni ayudas abiertas). */}
        <div className="mt-2" key={estado.ultima?.terminada ?? "primera"}>
          {totalPasos(t) === 0 ? (
            <Aviso icono="💬">
              Este trabajo aún no tiene pasos. Explícamelo en la sesión de Claude (qué lo dispara, los pasos en
              orden, dónde se hace cada uno y cómo sabes que ha salido bien) y los escribo aquí.
            </Aviso>
          ) : secciones.length === 0 ? (
            <Aviso icono="👆">Elige {(t.etiquetaVariante ?? "el tipo").toLowerCase()} para ver sus pasos.</Aviso>
          ) : conCards ? (
            <TarjetasPasos
              pasos={secciones.flatMap((s) => s.pasos)}
              aspecto={aspectoCards(t, r)}
              marcas={(id) => marcaDe(r, id)}
              onCambiar={marcarPaso}
            />
          ) : (
            secciones.map((s, i) => (
              <div key={s.titulo || i} className="mt-3 first:mt-0">
                {s.titulo && <h4 className="px-1.5 pb-1 pt-2 text-[15px] font-semibold">{s.titulo}</h4>}
                {s.pasos.map((p) => (
                  <FilaPaso
                    key={p.id}
                    paso={p}
                    marca={marcaDe(r, p.id)}
                    ayudaAbierta={ayudaAbierta}
                    onCambiar={(cambios) => marcarPaso(p.id, cambios)}
                  />
                ))}
              </div>
            ))
          )}
        </div>
        {t.variantes.length > 0 && r.variante === null && totalPasos(t) > 0 && secciones.length > 0 && (
          <p className="mt-2 px-1.5 text-sm text-tinta-2">Elige el tipo para ver también sus pasos propios.</p>
        )}
      </section>

      {/* Terminar a la izquierda y «Última vez» a la derecha. */}
      <div className="mt-6 grid gap-x-12 gap-y-6 border-t border-linea pt-4 lg:grid-cols-2">
      <div className="flex flex-wrap items-start gap-3 px-1.5">
        <Boton tipo="primario" onClick={pulsarTerminar} disabled={!puedeTerminar}>
          Terminar
        </Boton>
        <span className="text-sm text-tinta-2">
          {conCards && !puedeTerminar
            ? "Se activa cuando todos los pasos están en verde."
            : "Guarda esta lista en «Última vez» y la deja vacía."}
        </span>
      </div>

      <div>
        {estado.ultima ? (
          <Plegable
            titulo={
              <span className="font-medium">
                Última vez{" "}
                <span className="font-normal text-tinta-2">
                  · terminada el {momentoLegible(estado.ultima.terminada)}
                </span>
              </span>
            }
          >
            <UltimaVez u={estado.ultima} />
          </Plegable>
        ) : (
          <p className="px-1.5 text-sm text-tinta-2">Aún no has terminado este trabajo ninguna vez.</p>
        )}
      </div>
      </div>
    </div>
  );
}

function FilaPaso({
  paso,
  marca,
  ayudaAbierta,
  onCambiar,
}: {
  paso: Paso;
  marca: MarcaPaso;
  ayudaAbierta: boolean;
  onCambiar: (c: Partial<MarcaPaso>) => void;
}) {
  const [verNota, setVerNota] = useState(false);
  const [verAyuda, setVerAyuda] = useState(false);
  // Al marcar «Problema» o «Bloqueado», el cursor salta a la nota para contar qué pasa.
  const [enfocarNota, setEnfocarNota] = useState(false);
  const hecho = marca.estado === "hecho";
  const conPega = marca.estado === "problema" || marca.estado === "bloqueado";
  const notaVisible = verNota || marca.nota !== "" || conPega;
  const tieneAyuda = Boolean(paso.como || paso.comprobar);
  const ayudaVisible = tieneAyuda && (ayudaAbierta || verAyuda);

  return (
    <div className="group rounded px-1.5 py-1 hover:bg-hover">
      <div className="flex items-start gap-2.5">
        <span className="pt-[6px]">
          <Casilla
            marcada={hecho}
            onCambiar={(v) => onCambiar({ estado: v ? "hecho" : "pendiente" })}
            etiqueta={`Hecho: ${paso.titulo}`}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className={`pt-[3px] text-[15px] leading-relaxed ${hecho ? "text-tinta-2 line-through" : ""}`}>
            {paso.titulo}
          </p>
          {tieneAyuda && !ayudaAbierta && (
            <button
              type="button"
              onClick={() => setVerAyuda((v) => !v)}
              className="text-xs text-tinta-2 hover:text-tinta hover:underline"
              aria-expanded={verAyuda}
            >
              {verAyuda ? "Ocultar ayuda" : "Cómo se hace y cómo comprobarlo"}
            </button>
          )}
          {ayudaVisible && (
            <div className="mt-1.5 space-y-1.5 rounded-xl bg-fondo-2 px-3 py-2 text-sm leading-relaxed">
              {paso.como && (
                <p>
                  <span className="font-medium">Cómo: </span>
                  {paso.como}
                </p>
              )}
              {paso.comprobar && (
                <p>
                  <span className="font-medium">Para saber que está bien: </span>
                  {paso.comprobar}
                </p>
              )}
            </div>
          )}
          {notaVisible && (
            <div className="mt-1">
              <AreaTexto
                valor={marca.nota}
                onCambiar={(nota) => onCambiar({ nota })}
                etiqueta={`Nota de «${paso.titulo}»`}
                placeholder={
                  marca.estado === "problema"
                    ? "¿Qué problema ha habido?"
                    : marca.estado === "bloqueado"
                      ? "¿Qué lo bloquea? ¿A quién esperas?"
                      : "Nota"
                }
                autoFocus={(verNota || enfocarNota) && marca.nota === ""}
                className="bg-fondo-2 text-sm"
              />
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {!notaVisible && (
            <button
              type="button"
              onClick={() => setVerNota(true)}
              className="rounded px-1.5 py-1 text-xs text-tinta-2 opacity-0 hover:bg-hover hover:text-tinta focus:opacity-100 group-hover:opacity-100"
            >
              + Nota
            </button>
          )}
          <Selector
            opciones={ESTADOS_PASO}
            valor={marca.estado}
            onCambiar={(estado) => {
              setEnfocarNota(estado === "problema" || estado === "bloqueado");
              onCambiar({ estado });
            }}
            etiqueta="Estado del paso"
          />
        </div>
      </div>
    </div>
  );
}

function UltimaVez({ u }: { u: RondaTerminada }) {
  const filas: [string, string][] = [
    ["A qué se refería", u.referencia],
    ["Tipo", u.variante ?? ""],
    ["Empezada", momentoLegible(u.empezada)],
    ["Terminada", momentoLegible(u.terminada)],
  ];
  return (
    <div className="space-y-4 pb-2 text-sm">
      <dl className="grid grid-cols-[150px_1fr] gap-x-3 gap-y-1">
        {filas
          .filter(([, v]) => v)
          .map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-tinta-2">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
      </dl>
      {u.notas && (
        <div>
          <p className="text-tinta-2">Notas</p>
          <p className="whitespace-pre-wrap">{u.notas}</p>
        </div>
      )}
      {u.pasos.length > 0 && (
        <ul className="space-y-1">
          {u.pasos.map((p, i) => {
            const e = opcion(ESTADOS_PASO, p.estado);
            const nuevaSeccion = p.seccion && p.seccion !== u.pasos[i - 1]?.seccion;
            return (
              <li key={i}>
                {nuevaSeccion && <p className="pb-0.5 pt-2 font-semibold">{p.seccion}</p>}
                <div className="flex items-start gap-2">
                  <span className="w-24 shrink-0">
                    <Etiqueta color={e.color}>{e.texto}</Etiqueta>
                  </span>
                  <div className="min-w-0">
                    <p>{p.titulo}</p>
                    {p.nota && <p className="whitespace-pre-wrap text-tinta-2">{p.nota}</p>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Las opciones del trabajo, en el cuadro de arriba a la derecha: tipo,
 *  próximo cambio, cuándo empezó, notas y peticiones abiertas. */
function PanelTrabajo({ t }: { t: Trabajo }) {
  const datos = useDatos();
  const r = (datos.trabajos[t.id] ?? estadoTrabajoVacio()).actual;
  const peticiones = peticionesPendientes(datos.peticiones).filter((p) => p.trabajo === t.id);
  const editar = (cambios: Partial<Pick<Ronda, "notas" | "variante">>) =>
    cambiarTrabajo(t.id, (e) => ({ ...e, actual: editarRonda(e.actual, cambios, ahoraISO()) }));

  return (
    <div className="space-y-2">
        {t.variantes.length > 0 && (
          <Propiedad icono="estado" nombre={t.etiquetaVariante ?? "Tipo"} apilada>
            <select
              value={r.variante ?? ""}
              onChange={(e) => editar({ variante: e.target.value || null })}
              aria-label={t.etiquetaVariante ?? "Tipo"}
              className={`campo cursor-pointer border border-linea bg-caja ${r.variante ? "" : "text-tinta-2"}`}
            >
              <option value="">{t.etiquetaVariante ? `Elige ${t.etiquetaVariante.toLowerCase()}…` : "Elige el tipo…"}</option>
              {t.variantes.map((v) => (
                <option key={v.id} value={v.id} disabled={v.deshabilitada}>
                  {v.nombre}
                  {v.deshabilitada ? " (próximamente)" : ""}
                </option>
              ))}
            </select>
          </Propiedad>
        )}
      {t.proximoCambio && <ProximoCambio t={t} />}
      <Propiedad icono="hora" nombre="Empezada" apilada>
        <span className="block px-1.5 pt-0.5 text-tinta-2">{r.empezada ? momentoLegible(r.empezada) : "—"}</span>
      </Propiedad>
      <Propiedad icono="texto" nombre="Notas" apilada>
        <AreaTexto valor={r.notas} onCambiar={(notas) => editar({ notas })} etiqueta="Notas de esta vez" placeholder="Notas de esta vez" filas={2} />
      </Propiedad>
      {peticiones.length > 0 && (
        <div className="pt-2">
          <Aviso icono="📨">
            <p className="font-medium">
              {peticiones.length === 1 ? "1 petición abierta" : `${peticiones.length} peticiones abiertas`} de este
              trabajo
            </p>
            <ul className="mt-1">
              {peticiones.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => ir("peticiones", p.id)}
                    className="text-left underline decoration-linea underline-offset-2 hover:decoration-tinta-2"
                  >
                    {p.que || "Sin título"}
                    {p.quien && <span className="text-tinta-2"> · {p.quien}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </Aviso>
        </div>
      )}

    </div>
  );
}

/** Fecha del próximo cambio que te han anunciado: crea el recordatorio,
 *  enlazado a este trabajo, y enseña los que ya hay. */
function ProximoCambio({ t }: { t: Trabajo }) {
  const datos = useDatos();
  const hoy = diaDe(useAhora());
  const [dia, setDia] = useState("");
  const config = t.proximoCambio;
  if (!config) return null;
  const pendientes = datos.recordatorios
    .filter((x) => !x.hecho && x.enlace?.tipo === "tarea" && x.enlace.id === t.id)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const crearRecordatorio = () => {
    if (!dia) return;
    crear(
      "recordatorios",
      nuevoRecordatorio(new Date().toISOString(), hoy, {
        texto: config.texto,
        fecha: dia,
        ancla: dia,
        enlace: { tipo: "tarea", id: t.id },
      }),
    );
    setDia("");
  };

  return (
    <Propiedad icono="fecha" nombre={config.etiqueta} apilada>
      <div className="flex flex-wrap items-center gap-1">
        <CampoFecha valor={dia} onCambiar={setDia} etiqueta={config.etiqueta} />
        <Boton tipo="borde" icono="mas" disabled={!dia} onClick={crearRecordatorio}>
          Crear recordatorio
        </Boton>
      </div>
      {pendientes.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5 px-1.5">
          {pendientes.map((x) => (
            <button
              key={x.id}
              type="button"
              onClick={() => ir("recordatorios", x.id)}
              className="rounded bg-[var(--e-purple-bg)] px-1.5 text-xs leading-5 text-[var(--e-purple-tx)] hover:underline"
              title="Abrir el recordatorio"
            >
              ⏰ {diaCorto(x.fecha, hoy)}
            </button>
          ))}
        </div>
      )}
    </Propiedad>
  );
}
