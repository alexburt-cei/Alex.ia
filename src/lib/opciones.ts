// Las listas de opciones de cada campo con su texto y su color de etiqueta.
// Los colores son los de las etiquetas de Notion (ver .etiqueta-* en index.css).

import type { Cuando } from "./recordatorios.ts";
import type {
  CanalPeticion,
  EstadoIncidencia,
  EstadoPaso,
  EstadoPeticion,
  EstadoProyecto,
  Prioridad,
  Repeticion,
  SistemaIncidencia,
  TipoEnlace,
} from "./tipos.ts";

export type ColorEtiqueta =
  | "default"
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red";

export interface Opcion<V extends string = string> {
  valor: V;
  texto: string;
  color: ColorEtiqueta;
}

export const ESTADOS_PASO: Opcion<EstadoPaso>[] = [
  { valor: "pendiente", texto: "Pendiente", color: "default" },
  { valor: "en_curso", texto: "En curso", color: "blue" },
  { valor: "hecho", texto: "Hecho", color: "green" },
  { valor: "problema", texto: "Problema", color: "red" },
  { valor: "bloqueado", texto: "Bloqueado", color: "orange" },
];

export const ESTADOS_PROYECTO: Opcion<EstadoProyecto>[] = [
  { valor: "abierto", texto: "Abierto", color: "blue" },
  { valor: "pausa", texto: "En pausa", color: "gray" },
  { valor: "esperando", texto: "Esperando a alguien", color: "yellow" },
  { valor: "cerrado", texto: "Cerrado", color: "green" },
];

export const ESTADOS_INCIDENCIA: Opcion<EstadoIncidencia>[] = [
  { valor: "abierta", texto: "Abierta", color: "red" },
  { valor: "en_curso", texto: "En curso", color: "blue" },
  { valor: "esperando", texto: "Esperando a alguien", color: "yellow" },
  { valor: "resuelta", texto: "Resuelta", color: "green" },
];

export const ESTADOS_PETICION: Opcion<EstadoPeticion>[] = [
  { valor: "pendiente", texto: "Pendiente", color: "default" },
  { valor: "en_curso", texto: "En curso", color: "blue" },
  { valor: "esperando", texto: "Esperando a alguien", color: "yellow" },
  { valor: "hecha", texto: "Hecha", color: "green" },
];

export const SISTEMAS: Opcion<SistemaIncidencia>[] = [
  { valor: "zoho_crm", texto: "Zoho CRM", color: "orange" },
  { valor: "web", texto: "Web / WooCommerce", color: "purple" },
  { valor: "sage", texto: "SAGE", color: "brown" },
  { valor: "otro", texto: "Otro", color: "gray" },
];

export const CANALES: Opcion<CanalPeticion>[] = [
  { valor: "cliq", texto: "Cliq", color: "blue" },
  { valor: "correo", texto: "Correo", color: "brown" },
  { valor: "persona", texto: "En persona", color: "pink" },
  { valor: "telefono", texto: "Teléfono", color: "purple" },
  { valor: "otro", texto: "Otro", color: "gray" },
];

export const PRIORIDADES: Opcion<Prioridad>[] = [
  { valor: "normal", texto: "Normal", color: "default" },
  { valor: "urgente", texto: "Urgente", color: "red" },
];

export const REPETICIONES: Opcion<Repeticion>[] = [
  { valor: "no", texto: "No se repite", color: "default" },
  { valor: "diario", texto: "Cada día", color: "gray" },
  { valor: "laborables", texto: "Cada día laborable", color: "gray" },
  { valor: "semanal", texto: "Cada semana", color: "gray" },
  { valor: "mensual", texto: "Cada mes", color: "gray" },
];

export const CUANDO: Opcion<Cuando>[] = [
  { valor: "atrasados", texto: "Atrasados", color: "red" },
  { valor: "hoy", texto: "Hoy", color: "blue" },
  { valor: "manana", texto: "Mañana", color: "purple" },
  { valor: "adelante", texto: "Más adelante", color: "gray" },
  { valor: "hechos", texto: "Hechos", color: "green" },
];

export const TIPOS_ENLACE: Opcion<TipoEnlace>[] = [
  { valor: "tarea", texto: "Tarea", color: "default" },
  { valor: "proyecto", texto: "Proyecto", color: "default" },
  { valor: "incidencia", texto: "Incidencia", color: "default" },
  { valor: "peticion", texto: "Petición", color: "default" },
];

export function opcion<V extends string>(lista: Opcion<V>[], valor: V): Opcion<V> {
  return lista.find((o) => o.valor === valor) ?? lista[0];
}
