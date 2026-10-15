// Enlaces de un recordatorio a una tarea, un proyecto, una incidencia o una
// petición: su nombre legible y la lista de cosas a las que se puede enlazar.

import { TRABAJOS } from "../trabajos/index.ts";
import type { Datos, Enlace, TipoEnlace } from "./tipos.ts";

export interface Destino {
  /** "tipo:id" */
  clave: string;
  tipo: TipoEnlace;
  id: string;
  texto: string;
  grupo: string;
}

export const claveEnlace = (e: Enlace) => `${e.tipo}:${e.id}`;

export function enlaceDeClave(clave: string): Enlace | null {
  const i = clave.indexOf(":");
  if (i < 0) return null;
  const tipo = clave.slice(0, i) as TipoEnlace;
  if (!["tarea", "proyecto", "incidencia", "peticion"].includes(tipo)) return null;
  return { tipo, id: clave.slice(i + 1) };
}

/** El nombre de lo enlazado, o null si ya no existe. */
export function nombreEnlace(e: Enlace, d: Datos): string | null {
  switch (e.tipo) {
    case "tarea":
      return TRABAJOS.find((t) => t.id === e.id)?.nombre ?? null;
    case "proyecto": {
      const p = d.proyectos.find((x) => x.id === e.id);
      return p ? p.nombre || "Proyecto sin nombre" : null;
    }
    case "incidencia": {
      const i = d.incidencias.find((x) => x.id === e.id);
      return i ? i.titulo || "Incidencia sin título" : null;
    }
    case "peticion": {
      const p = d.peticiones.find((x) => x.id === e.id);
      return p ? p.que || "Petición sin título" : null;
    }
  }
}

/** A qué se puede enlazar: los trabajos y lo que sigue abierto (y lo ya
 *  enlazado, aunque se haya cerrado). */
export function destinos(d: Datos, actual: Enlace | null): Destino[] {
  const sigue = (tipo: TipoEnlace, id: string, abierto: boolean) =>
    abierto || (actual?.tipo === tipo && actual.id === id);
  return [
    ...TRABAJOS.map((t) => ({ tipo: "tarea" as const, id: t.id, texto: `${t.icono} ${t.nombre}`, grupo: "Tareas" })),
    ...d.proyectos
      .filter((p) => sigue("proyecto", p.id, p.estado !== "cerrado"))
      .map((p) => ({ tipo: "proyecto" as const, id: p.id, texto: p.nombre || "Proyecto sin nombre", grupo: "Proyectos" })),
    ...d.incidencias
      .filter((i) => sigue("incidencia", i.id, i.estado !== "resuelta"))
      .map((i) => ({ tipo: "incidencia" as const, id: i.id, texto: i.titulo || "Incidencia sin título", grupo: "Incidencias" })),
    ...d.peticiones
      .filter((p) => sigue("peticion", p.id, p.estado !== "hecha"))
      .map((p) => ({ tipo: "peticion" as const, id: p.id, texto: p.que || "Petición sin título", grupo: "Peticiones" })),
  ].map((x) => ({ ...x, clave: `${x.tipo}:${x.id}` }));
}
