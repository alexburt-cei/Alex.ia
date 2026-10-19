// Qué pestaña está abierta, guardado en la dirección (#/proyectos/<id>): así
// recargar deja la app donde estaba y el botón «atrás» del navegador funciona.

import { useMemo, useSyncExternalStore } from "react";
import type { Enlace } from "../lib/tipos.ts";

export type Pagina =
  | "inicio"
  | "todo"
  | "tareas"
  | "proyectos"
  | "recordatorios"
  | "incidencias"
  | "peticiones"
  | "notas";

export const PAGINAS: { id: Pagina; nombre: string; icono: string }[] = [
  { id: "inicio", nombre: "Inicio", icono: "🏠" },
  { id: "todo", nombre: "To do", icono: "📌" },
  { id: "tareas", nombre: "Tareas", icono: "✅" },
  { id: "proyectos", nombre: "Proyectos abiertos", icono: "📁" },
  { id: "recordatorios", nombre: "Recordatorios", icono: "⏰" },
  { id: "incidencias", nombre: "Incidencias", icono: "🐞" },
  { id: "peticiones", nombre: "Peticiones", icono: "📨" },
  { id: "notas", nombre: "Notas", icono: "📝" },
];

export interface Ruta {
  pagina: Pagina;
  /** En Tareas, el trabajo; en las demás, el elemento abierto en el panel. */
  sub: string | null;
}

export function leerRuta(hash: string): Ruta {
  const [p, s] = hash.replace(/^#\/?/, "").split("/");
  const pagina = PAGINAS.find((x) => x.id === p)?.id ?? "inicio";
  return { pagina, sub: s ? decodeURIComponent(s) : null };
}

export function hashDe(r: Ruta): string {
  return `#/${r.pagina}${r.sub ? `/${encodeURIComponent(r.sub)}` : ""}`;
}

export function ir(pagina: Pagina, sub: string | null = null) {
  const h = hashDe({ pagina, sub });
  if (window.location.hash !== h) window.location.hash = h;
}

function suscribir(f: () => void) {
  window.addEventListener("hashchange", f);
  return () => window.removeEventListener("hashchange", f);
}

export function useRuta(): Ruta {
  const hash = useSyncExternalStore(suscribir, () => window.location.hash);
  return useMemo(() => leerRuta(hash), [hash]);
}

/** Abre lo enlazado a un recordatorio. */
export function irAEnlace(e: Enlace) {
  const pagina = {
    tarea: "tareas",
    proyecto: "proyectos",
    incidencia: "incidencias",
    peticion: "peticiones",
  } as const;
  ir(pagina[e.tipo], e.id);
}
