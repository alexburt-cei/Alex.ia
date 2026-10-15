import { useCallback } from "react";
import { nuevaIncidencia } from "../lib/datos.ts";
import { diaCorto, diaDe, momentoLegible } from "../lib/fechas.ts";
import { incidenciasAbiertas } from "../lib/inicio.ts";
import { ESTADOS_INCIDENCIA, SISTEMAS, opcion } from "../lib/opciones.ts";
import type { EstadoIncidencia, Incidencia } from "../lib/tipos.ts";
import { actualizar, crear, eliminar, useDatos } from "../estado/almacen.ts";
import { ir } from "../estado/navegacion.ts";
import { useAhora } from "../estado/reloj.ts";
import { BaseDeDatos, type Columna } from "../ui/BaseDeDatos.tsx";
import { Etiqueta } from "../ui/basicos.tsx";
import { AreaTexto, Selector } from "../ui/campos.tsx";
import { Pagina } from "../ui/Pagina.tsx";
import { BloquePeek, Peek, Propiedad, Propiedades, TituloPeek } from "../ui/Peek.tsx";
import { SinTitulo } from "./comun.tsx";

/** Al pasar a «Resuelta» se apunta cuándo; si se reabre, se borra. */
function cambioDeEstado(estado: EstadoIncidencia): Partial<Incidencia> {
  return { estado, resueltaEl: estado === "resuelta" ? new Date().toISOString() : null };
}

function ordenar(lista: Incidencia[]): Incidencia[] {
  const resueltas = lista
    .filter((i) => i.estado === "resuelta")
    .sort((a, b) => (b.resueltaEl ?? b.editado).localeCompare(a.resueltaEl ?? a.editado));
  return [...incidenciasAbiertas(lista), ...resueltas];
}

export function Incidencias({ abierto }: { abierto: string | null }) {
  const datos = useDatos();
  const hoy = diaDe(useAhora());
  const actual = datos.incidencias.find((i) => i.id === abierto) ?? null;
  const cerrar = useCallback(() => ir("incidencias"), []);

  const nueva = (grupo?: string) => {
    const i = nuevaIncidencia(new Date().toISOString(), grupo ? cambioDeEstado(grupo as EstadoIncidencia) : {});
    crear("incidencias", i);
    ir("incidencias", i.id);
  };

  const columnas: Columna<Incidencia>[] = [
    {
      id: "titulo",
      titulo: "Incidencia",
      icono: "texto",
      ancho: 260,
      celda: (i) => i.titulo || <SinTitulo texto="Sin título" />,
    },
    {
      id: "sistema",
      titulo: "Sistema",
      icono: "sistema",
      ancho: 170,
      celda: (i) => (
        <Selector
          opciones={SISTEMAS}
          valor={i.sistema}
          onCambiar={(sistema) => actualizar("incidencias", i.id, { sistema })}
          etiqueta="Sistema"
        />
      ),
    },
    {
      id: "estado",
      titulo: "Estado",
      icono: "estado",
      ancho: 170,
      celda: (i) => (
        <Selector
          opciones={ESTADOS_INCIDENCIA}
          valor={i.estado}
          onCambiar={(e) => actualizar("incidencias", i.id, cambioDeEstado(e))}
          etiqueta="Estado"
        />
      ),
    },
    {
      id: "alta",
      titulo: "Alta",
      icono: "fecha",
      ancho: 110,
      celda: (i) => <span className="whitespace-nowrap">{diaCorto(diaDe(new Date(i.creado)), hoy)}</span>,
    },
    {
      id: "solucion",
      titulo: "Solución",
      icono: "texto",
      ancho: 240,
      celda: (i) => <span className="line-clamp-2 text-tinta-2">{i.solucion}</span>,
    },
  ];

  return (
    <Pagina
      icono="🐞"
      titulo="Incidencias"
      descripcion="Problemas que te llegan, hasta que se resuelven, y cómo se resolvieron.">
      <BaseDeDatos
        clave="incidencias"
        elementos={ordenar(datos.incidencias)}
        columnas={columnas}
        agrupacion={{
          opciones: ESTADOS_INCIDENCIA,
          grupo: (i) => i.estado,
          mover: (i, estado) => actualizar("incidencias", i.id, cambioDeEstado(estado as EstadoIncidencia)),
          terminadas: ["resuelta"],
        }}
        terminado={(i) => i.estado === "resuelta"}
        textoVerTerminados="Ver resueltas"
        abierto={abierto}
        onAbrir={(id) => ir("incidencias", id)}
        onNuevo={nueva}
        textoNuevo="Nueva incidencia"
        textoVacio="No hay incidencias."
        tarjeta={(i) => {
          const s = opcion(SISTEMAS, i.sistema);
          return (
            <p className="flex flex-wrap items-center gap-2">
              <Etiqueta color={s.color}>{s.texto}</Etiqueta>
              <span>{diaCorto(diaDe(new Date(i.creado)), hoy)}</span>
            </p>
          );
        }}
      />

      {actual && (
        <Peek
          key={actual.id}
          onCerrar={cerrar}
          onEliminar={() => {
            eliminar("incidencias", actual.id);
            cerrar();
          }}
          textoEliminar={`¿Eliminar la incidencia «${actual.titulo || "sin título"}»?`}
        >
          <PanelIncidencia i={actual} />
        </Peek>
      )}
    </Pagina>
  );
}

function PanelIncidencia({ i }: { i: Incidencia }) {
  const cambiar = (c: Partial<Incidencia>) => actualizar("incidencias", i.id, c);
  return (
    <>
      <TituloPeek icono="🐞" valor={i.titulo} onCambiar={(titulo) => cambiar({ titulo })} placeholder="¿Qué falla?" />
      <Propiedades>
        <Propiedad icono="sistema" nombre="Sistema">
          <Selector opciones={SISTEMAS} valor={i.sistema} onCambiar={(sistema) => cambiar({ sistema })} etiqueta="Sistema" />
        </Propiedad>
        <Propiedad icono="estado" nombre="Estado">
          <Selector
            opciones={ESTADOS_INCIDENCIA}
            valor={i.estado}
            onCambiar={(e) => cambiar(cambioDeEstado(e))}
            etiqueta="Estado"
          />
        </Propiedad>
        <Propiedad icono="hora" nombre="Alta">
          <span className="block px-1.5 pt-1.5 text-tinta-2">{momentoLegible(i.creado)}</span>
        </Propiedad>
        {i.resueltaEl && (
          <Propiedad icono="hora" nombre="Resuelta">
            <span className="block px-1.5 pt-1.5 text-tinta-2">{momentoLegible(i.resueltaEl)}</span>
          </Propiedad>
        )}
      </Propiedades>

      <BloquePeek titulo="Qué pasa">
        <AreaTexto
          valor={i.descripcion}
          onCambiar={(descripcion) => cambiar({ descripcion })}
          etiqueta="Qué pasa"
          placeholder="Qué falla, a quién afecta, desde cuándo…"
          filas={3}
        />
      </BloquePeek>

      <BloquePeek titulo="Solución">
        <AreaTexto
          valor={i.solucion}
          onCambiar={(solucion) => cambiar({ solucion })}
          etiqueta="Solución"
          placeholder="Cómo se ha resuelto, para la próxima vez"
          filas={3}
        />
      </BloquePeek>
    </>
  );
}
