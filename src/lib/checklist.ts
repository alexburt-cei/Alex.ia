// Reglas de las checklists de Tareas: qué pasos se ven según la variante,
// cuánto falta y qué se guarda al pulsar «Terminar».

import type {
  EstadoPaso,
  EstadoTrabajo,
  MarcaPaso,
  Paso,
  Ronda,
  RondaTerminada,
  Seccion,
  Trabajo,
} from "./tipos.ts";

export function rondaVacia(): Ronda {
  return { referencia: "", notas: "", variante: null, marcas: {}, empezada: null };
}

export function estadoTrabajoVacio(): EstadoTrabajo {
  return { actual: rondaVacia(), ultima: null };
}

const SIN_MARCA: MarcaPaso = { estado: "pendiente", nota: "" };

export function marcaDe(r: Ronda, pasoId: string): MarcaPaso {
  return r.marcas[pasoId] ?? SIN_MARCA;
}

function pasoVisible(p: Paso, variante: string | null): boolean {
  if (!p.variantes || p.variantes.length === 0) return true;
  return variante !== null && p.variantes.includes(variante);
}

/** Las secciones con los pasos que tocan para la variante elegida. Sin
 *  variante elegida, solo los pasos comunes. Las secciones vacías no salen. */
export function seccionesVisibles(t: Trabajo, variante: string | null): Seccion[] {
  return t.secciones
    .map((s) => ({ ...s, pasos: s.pasos.filter((p) => pasoVisible(p, variante)) }))
    .filter((s) => s.pasos.length > 0);
}

export function totalPasos(t: Trabajo): number {
  return t.secciones.reduce((n, s) => n + s.pasos.length, 0);
}

export type Recuento = Record<EstadoPaso, number> & { total: number };

export function recuento(t: Trabajo, r: Ronda): Recuento {
  const c: Recuento = { total: 0, pendiente: 0, en_curso: 0, hecho: 0, problema: 0, bloqueado: 0 };
  for (const s of seccionesVisibles(t, r.variante)) {
    for (const p of s.pasos) {
      c.total += 1;
      c[marcaDe(r, p.id).estado] += 1;
    }
  }
  return c;
}

/** Hay algo escrito o marcado en la lista de esta vez. */
export function rondaTocada(r: Ronda): boolean {
  return (
    r.referencia.trim() !== "" ||
    r.notas.trim() !== "" ||
    r.variante !== null ||
    Object.values(r.marcas).some((m) => m.estado !== "pendiente" || m.nota.trim() !== "")
  );
}

/** Cambia la marca de un paso y apunta cuándo se empezó, si es el primer cambio. */
export function marcar(r: Ronda, pasoId: string, cambios: Partial<MarcaPaso>, ahora: string): Ronda {
  return {
    ...r,
    marcas: { ...r.marcas, [pasoId]: { ...marcaDe(r, pasoId), ...cambios } },
    empezada: r.empezada ?? ahora,
  };
}

/** Cambia los datos de esta vez (referencia, notas, variante). */
export function editarRonda(r: Ronda, cambios: Partial<Omit<Ronda, "marcas" | "empezada">>, ahora: string): Ronda {
  return { ...r, ...cambios, empezada: r.empezada ?? ahora };
}

/** «Terminar»: la lista de esta vez pasa a «Última vez» y empieza una vacía. */
export function terminar(t: Trabajo, e: EstadoTrabajo, ahora: string): EstadoTrabajo {
  const r = e.actual;
  const variante = t.variantes.find((v) => v.id === r.variante)?.nombre ?? null;
  const ultima: RondaTerminada = {
    referencia: r.referencia,
    notas: r.notas,
    variante,
    empezada: r.empezada,
    terminada: ahora,
    pasos: seccionesVisibles(t, r.variante).flatMap((s) =>
      s.pasos.map((p) => ({ seccion: s.titulo, titulo: p.titulo, ...marcaDe(r, p.id) })),
    ),
  };
  return { actual: rondaVacia(), ultima };
}
