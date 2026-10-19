// Creación de elementos nuevos, lectura tolerante de datos guardados y copia
// de seguridad en JSON. Sin acceso al navegador: el guardado está en
// src/estado/almacen.ts.

import { estadoTrabajoVacio, rondaVacia } from "./checklist.ts";
import { esDia } from "./fechas.ts";
import type {
  Coleccion,
  Datos,
  EstadoTrabajo,
  Incidencia,
  Nota,
  Peticion,
  Proyecto,
  Recordatorio,
  Todo,
} from "./tipos.ts";

export function nuevoId(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export function datosVacios(): Datos {
  return {
    version: 1,
    todos: [],
    trabajos: {},
    proyectos: [],
    recordatorios: [],
    incidencias: [],
    peticiones: [],
    notas: [],
  };
}

// --- Elementos nuevos -------------------------------------------------------

function base(ahora: string) {
  return { id: nuevoId(), creado: ahora, editado: ahora };
}

export function nuevoProyecto(ahora: string, datos: Partial<Proyecto> = {}): Proyecto {
  return {
    ...base(ahora),
    nombre: "",
    estado: "abierto",
    proximoPaso: "",
    fechaProximo: "",
    conQuien: "",
    hitos: [],
    notas: "",
    ...datos,
  };
}

export function nuevoRecordatorio(ahora: string, hoy: string, datos: Partial<Recordatorio> = {}): Recordatorio {
  const fecha = datos.fecha ?? hoy;
  return {
    ...base(ahora),
    texto: "",
    fecha,
    hora: "",
    repetir: "no",
    ancla: fecha,
    prioridad: "normal",
    enlace: null,
    hecho: false,
    hechoEl: null,
    notas: "",
    ...datos,
  };
}

export function nuevaIncidencia(ahora: string, datos: Partial<Incidencia> = {}): Incidencia {
  return {
    ...base(ahora),
    titulo: "",
    sistema: "zoho_crm",
    estado: "abierta",
    descripcion: "",
    solucion: "",
    resueltaEl: null,
    ...datos,
  };
}

export function nuevaPeticion(ahora: string, datos: Partial<Peticion> = {}): Peticion {
  return {
    ...base(ahora),
    que: "",
    quien: "",
    canal: "cliq",
    fechaLimite: "",
    estado: "pendiente",
    trabajo: null,
    notas: "",
    hechaEl: null,
    ...datos,
  };
}

export function nuevoTodo(ahora: string, datos: Partial<Todo> = {}): Todo {
  return { id: nuevoId(), texto: "", hecho: false, creado: ahora, hechoEl: null, ...datos };
}

export function nuevaNota(ahora: string, datos: Partial<Nota> = {}): Nota {
  return { ...base(ahora), titulo: "", texto: "", ...datos };
}

/** Un elemento recién creado que se cierra sin escribir nada se borra solo. */
export function estaVacio(coleccion: Coleccion, x: Proyecto | Recordatorio | Incidencia | Peticion | Nota): boolean {
  const vacios = (...t: string[]) => t.every((s) => s.trim() === "");
  switch (coleccion) {
    case "proyectos": {
      const p = x as Proyecto;
      return vacios(p.nombre, p.proximoPaso, p.conQuien, p.notas) && p.hitos.length === 0;
    }
    case "recordatorios": {
      const r = x as Recordatorio;
      return vacios(r.texto, r.notas) && r.enlace === null;
    }
    case "incidencias": {
      const i = x as Incidencia;
      return vacios(i.titulo, i.descripcion, i.solucion);
    }
    case "peticiones": {
      const p = x as Peticion;
      return vacios(p.que, p.quien, p.notas);
    }
    case "notas": {
      const n = x as Nota;
      return vacios(n.titulo, n.texto);
    }
  }
}

// --- Lectura tolerante ------------------------------------------------------
// Los datos guardados pueden venir de una versión anterior de la app (o de una
// copia de seguridad): se completa lo que falte con los valores por defecto y
// se descarta lo que no tenga forma de elemento.

type Objeto = Record<string, unknown>;

const esObjeto = (x: unknown): x is Objeto => typeof x === "object" && x !== null && !Array.isArray(x);

function lista<T>(x: unknown, completar: (o: Objeto) => T): T[] {
  if (!Array.isArray(x)) return [];
  return x.filter((o): o is Objeto => esObjeto(o) && typeof o.id === "string").map(completar);
}

function trabajos(x: unknown): Record<string, EstadoTrabajo> {
  if (!esObjeto(x)) return {};
  const res: Record<string, EstadoTrabajo> = {};
  for (const [id, e] of Object.entries(x)) {
    if (!esObjeto(e)) continue;
    const vacio = estadoTrabajoVacio();
    const actual = esObjeto(e.actual) ? { ...rondaVacia(), ...e.actual } : vacio.actual;
    if (!esObjeto(actual.marcas)) actual.marcas = {};
    res[id] = {
      actual: actual as EstadoTrabajo["actual"],
      ultima: esObjeto(e.ultima) ? (e.ultima as unknown as EstadoTrabajo["ultima"]) : null,
    };
  }
  return res;
}

export function normalizar(x: unknown): Datos {
  if (!esObjeto(x)) return datosVacios();
  const ahora = new Date(0).toISOString();
  const hoy = "1970-01-01";
  return {
    version: 1,
    todos: lista(x.todos, (o) => nuevoTodo(ahora, o as Partial<Todo>)),
    trabajos: trabajos(x.trabajos),
    proyectos: lista(x.proyectos, (o) => {
      const p = nuevoProyecto(ahora, o as Partial<Proyecto>);
      return { ...p, hitos: Array.isArray(p.hitos) ? p.hitos : [] };
    }),
    recordatorios: lista(x.recordatorios, (o) => {
      const r = nuevoRecordatorio(ahora, hoy, o as Partial<Recordatorio>);
      return { ...r, ancla: esDia(r.ancla) ? r.ancla : r.fecha };
    }),
    incidencias: lista(x.incidencias, (o) => nuevaIncidencia(ahora, o as Partial<Incidencia>)),
    peticiones: lista(x.peticiones, (o) => nuevaPeticion(ahora, o as Partial<Peticion>)),
    notas: lista(x.notas, (o) => nuevaNota(ahora, o as Partial<Nota>)),
  };
}

// --- Copia de seguridad -----------------------------------------------------

const MARCA_COPIA = "Alex.ia";

export function aCopia(d: Datos, ahora: string): string {
  return JSON.stringify({ app: MARCA_COPIA, exportado: ahora, datos: d }, null, 2);
}

export interface Copia {
  exportado: string | null;
  datos: Datos;
}

/** Lee una copia de seguridad. Lanza un Error con el motivo si no lo es. */
export function deCopia(texto: string): Copia {
  let json: unknown;
  try {
    json = JSON.parse(texto);
  } catch {
    throw new Error("El fichero no es un JSON válido.");
  }
  if (!esObjeto(json) || json.app !== MARCA_COPIA || !esObjeto(json.datos)) {
    throw new Error("El fichero no es una copia de seguridad de Alex.ia.");
  }
  return {
    exportado: typeof json.exportado === "string" ? json.exportado : null,
    datos: normalizar(json.datos),
  };
}
