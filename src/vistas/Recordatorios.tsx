import { useCallback, useState } from "react";
import { nuevoRecordatorio } from "../lib/datos.ts";
import { claveEnlace, destinos, enlaceDeClave } from "../lib/enlaces.ts";
import { diaCorto, diaDe, momentoLegible, proximoLunes, sumarDias } from "../lib/fechas.ts";
import { CUANDO, PRIORIDADES, REPETICIONES, opcion } from "../lib/opciones.ts";
import { completar, cuando, ordenPorFecha, posponer, reprogramar, vencido } from "../lib/recordatorios.ts";
import type { Recordatorio } from "../lib/tipos.ts";
import { actualizar, crear, eliminar, useDatos } from "../estado/almacen.ts";
import { ir, irAEnlace } from "../estado/navegacion.ts";
import { useAhora } from "../estado/reloj.ts";
import { Boton, Casilla, Etiqueta } from "../ui/basicos.tsx";
import { BaseDeDatos, type Columna } from "../ui/BaseDeDatos.tsx";
import { AreaTexto, CampoFecha, CampoHora, Selector, SelectorBuscable } from "../ui/campos.tsx";
import { Pagina } from "../ui/Pagina.tsx";
import { BloquePeek, Peek, Propiedad, Propiedades, TituloPeek } from "../ui/Peek.tsx";
import { ChipEnlace, SinTitulo } from "./comun.tsx";

/** La casilla de un recordatorio: lo completa (o lo desmarca, si no se repite). */
export function CasillaRecordatorio({ r }: { r: Recordatorio }) {
  return (
    <Casilla
      marcada={r.hecho}
      etiqueta={r.hecho ? "Desmarcar" : r.repetir === "no" ? "Marcar como hecho" : "Hecho: pasar a la siguiente vez"}
      onCambiar={(marcar) =>
        actualizar("recordatorios", r.id, marcar ? completar(r, new Date()) : { hecho: false })
      }
    />
  );
}

/** Fecha y hora, en rojo si ya ha pasado. */
export function CuandoRecordatorio({ r, ahora }: { r: Recordatorio; ahora: Date }) {
  const hoy = diaDe(ahora);
  return (
    <span className={`whitespace-nowrap ${vencido(r, ahora) ? "text-rojo" : r.hecho ? "text-tinta-2" : ""}`}>
      {diaCorto(r.fecha, hoy)}
      {r.hora && ` · ${r.hora}`}
    </span>
  );
}

export function Recordatorios({ abierto }: { abierto: string | null }) {
  const datos = useDatos();
  const ahora = useAhora();
  const hoy = diaDe(ahora);
  const actual = datos.recordatorios.find((r) => r.id === abierto) ?? null;
  const cerrar = useCallback(() => ir("recordatorios"), []);

  const nuevo = (grupo?: string) => {
    const fecha = grupo === "manana" ? sumarDias(hoy, 1) : hoy;
    const r = nuevoRecordatorio(new Date().toISOString(), hoy, { fecha, ancla: fecha });
    crear("recordatorios", r);
    ir("recordatorios", r.id);
  };

  const columnas: Columna<Recordatorio>[] = [
    {
      id: "texto",
      titulo: "Recordatorio",
      icono: "texto",
      ancho: 260,
      celda: (r) => (
        <span className={r.hecho ? "text-tinta-2 line-through" : ""}>
          {r.texto || <SinTitulo texto="Sin texto" />}
        </span>
      ),
    },
    { id: "cuando", titulo: "Cuándo", icono: "fecha", ancho: 140, celda: (r) => <CuandoRecordatorio r={r} ahora={ahora} /> },
    {
      id: "repetir",
      titulo: "Repetir",
      icono: "repetir",
      ancho: 150,
      celda: (r) =>
        r.repetir !== "no" ? (
          <Etiqueta color="gray">{opcion(REPETICIONES, r.repetir).texto}</Etiqueta>
        ) : null,
    },
    {
      id: "prioridad",
      titulo: "Prioridad",
      icono: "prioridad",
      ancho: 120,
      celda: (r) => (
        <Selector
          opciones={PRIORIDADES}
          valor={r.prioridad}
          onCambiar={(prioridad) => actualizar("recordatorios", r.id, { prioridad })}
          etiqueta="Prioridad"
        />
      ),
    },
    {
      id: "enlace",
      titulo: "Enlazado a",
      icono: "enlace",
      ancho: 190,
      celda: (r) => (r.enlace ? <ChipEnlace enlace={r.enlace} datos={datos} /> : null),
    },
  ];

  return (
    <Pagina
      titulo="Recordatorios"
      descripcion="Salen en Inicio el día que tocan, y en rojo si se pasan.">
      <BaseDeDatos
        clave="recordatorios"
        elementos={[...datos.recordatorios].sort(ordenPorFecha)}
        columnas={columnas}
        antes={(r) => <CasillaRecordatorio r={r} />}
        agrupacion={{
          opciones: CUANDO,
          grupo: (r) => cuando(r, hoy),
          mover: (r, grupo) => {
            if (grupo === "hoy") actualizar("recordatorios", r.id, posponer(hoy));
            if (grupo === "manana") actualizar("recordatorios", r.id, posponer(sumarDias(hoy, 1)));
            if (grupo === "hechos") actualizar("recordatorios", r.id, completar(r, new Date()));
          },
          noSoltar: ["atrasados", "adelante"],
          terminadas: ["hechos"],
        }}
        terminado={(r) => r.hecho}
        textoVerTerminados="Ver hechos"
        abierto={abierto}
        onAbrir={(id) => ir("recordatorios", id)}
        onNuevo={nuevo}
        textoNuevo="Nuevo recordatorio"
        textoVacio="Aún no hay recordatorios."
        tarjeta={(r) => (
          <>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <CuandoRecordatorio r={r} ahora={ahora} />
              {r.repetir !== "no" && <span>{opcion(REPETICIONES, r.repetir).texto}</span>}
              {r.prioridad === "urgente" && <Etiqueta color="red">Urgente</Etiqueta>}
            </p>
            {r.enlace && <ChipEnlace enlace={r.enlace} datos={datos} />}
          </>
        )}
      />

      {actual && (
        <Peek
          key={actual.id}
          onCerrar={cerrar}
          onEliminar={() => {
            eliminar("recordatorios", actual.id);
            cerrar();
          }}
          textoEliminar={`¿Eliminar el recordatorio «${actual.texto || "sin texto"}»?`}
        >
          <PanelRecordatorio r={actual} hoy={hoy} />
        </Peek>
      )}
    </Pagina>
  );
}

function PanelRecordatorio({ r, hoy }: { r: Recordatorio; hoy: string }) {
  const datos = useDatos();
  const cambiar = (c: Partial<Recordatorio>) => actualizar("recordatorios", r.id, c);
  const opcionesEnlace = destinos(datos, r.enlace).map((d) => ({ valor: d.clave, texto: d.texto, grupo: d.grupo }));
  const manana = sumarDias(hoy, 1);
  const lunes = proximoLunes(hoy);
  const enUnaSemana = sumarDias(r.fecha > hoy ? r.fecha : hoy, 7);

  return (
    <>
      <TituloPeek valor={r.texto} onCambiar={(texto) => cambiar({ texto })} placeholder="¿Qué tienes que recordar?" />
      <Propiedades>
        <Propiedad icono="fecha" nombre="Fecha">
          <CampoFecha valor={r.fecha} onCambiar={(f) => cambiar(reprogramar(f))} etiqueta="Fecha" obligatoria />
        </Propiedad>
        <Propiedad icono="hora" nombre="Hora">
          <div className="flex items-center gap-1">
            <CampoHora valor={r.hora} onCambiar={(hora) => cambiar({ hora })} etiqueta="Hora" />
            {r.hora && (
              <Boton onClick={() => cambiar({ hora: "" })} title="Quitar la hora">
                Todo el día
              </Boton>
            )}
          </div>
        </Propiedad>
        <Propiedad icono="repetir" nombre="Repetir">
          <Selector
            opciones={REPETICIONES}
            valor={r.repetir}
            onCambiar={(repetir) => cambiar({ repetir, ancla: r.fecha, hecho: false })}
            etiqueta="Repetir"
          />
        </Propiedad>
        <Propiedad icono="prioridad" nombre="Prioridad">
          <Selector opciones={PRIORIDADES} valor={r.prioridad} onCambiar={(prioridad) => cambiar({ prioridad })} etiqueta="Prioridad" />
        </Propiedad>
        <Propiedad icono="enlace" nombre="Enlazado a">
          <div className="flex flex-wrap items-center gap-1">
            <SelectorBuscable
              opciones={opcionesEnlace}
              valor={r.enlace ? claveEnlace(r.enlace) : null}
              onCambiar={(clave) => cambiar({ enlace: clave ? enlaceDeClave(clave) : null })}
              etiqueta="Enlazado a"
            />
            {r.enlace && (
              <Boton icono="abrir" title="Abrir" onClick={() => r.enlace && irAEnlace(r.enlace)} />
            )}
          </div>
        </Propiedad>
        <Propiedad icono="estado" nombre="Hecho">
          <div className="flex min-h-[28px] items-center gap-2 px-1.5">
            <CasillaRecordatorio r={r} />
            <span className="text-tinta-2">
              {r.hecho
                ? `Hecho el ${momentoLegible(r.hechoEl)}`
                : r.repetir !== "no" && r.hechoEl
                  ? `La última vez, el ${momentoLegible(r.hechoEl)}`
                  : r.repetir !== "no"
                    ? "Al marcarlo, pasa a la siguiente vez"
                    : ""}
            </span>
          </div>
        </Propiedad>
      </Propiedades>

      <BloquePeek titulo="Posponer">
        <div className="flex flex-wrap items-center gap-1.5 px-1.5">
          <Boton tipo="borde" onClick={() => cambiar(posponer(manana))}>
            Mañana
          </Boton>
          <Boton tipo="borde" onClick={() => cambiar(posponer(lunes))}>
            El lunes ({diaCorto(lunes, hoy)})
          </Boton>
          <Boton tipo="borde" onClick={() => cambiar(posponer(enUnaSemana))}>
            Una semana más
          </Boton>
        </div>
        <PosponerOtroDia onPosponer={(f) => cambiar(posponer(f))} />
        {r.repetir !== "no" && (
          <p className="mt-1.5 px-1.5 text-xs text-tinta-2">Posponer mueve solo esta vez; la repetición sigue igual.</p>
        )}
      </BloquePeek>

      <BloquePeek titulo="Notas">
        <AreaTexto valor={r.notas} onCambiar={(notas) => cambiar({ notas })} etiqueta="Notas" placeholder="Escribe aquí…" filas={3} />
      </BloquePeek>
    </>
  );
}

function PosponerOtroDia({ onPosponer }: { onPosponer: (dia: string) => void }) {
  const [dia, setDia] = useState("");
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1 px-1.5">
      <span className="whitespace-nowrap text-sm text-tinta-2">Otro día:</span>
      <CampoFecha valor={dia} onCambiar={setDia} etiqueta="Posponer a otro día" />
      <Boton
        tipo="borde"
        disabled={!dia}
        onClick={() => {
          onPosponer(dia);
          setDia("");
        }}
      >
        Posponer
      </Boton>
    </div>
  );
}
