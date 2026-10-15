// Lo que enseña Inicio: qué está abierto, qué vence y en qué orden.

import { esDia, sumarDias } from "./fechas.ts";
import type { Incidencia, Nota, Peticion, Proyecto, Recordatorio } from "./tipos.ts";

/** Por fecha ascendente; los que no tienen fecha, al final. */
function porFecha(a: string, b: string): number {
  const fa = esDia(a) ? a : "9999-12-31";
  const fb = esDia(b) ? b : "9999-12-31";
  return fa.localeCompare(fb);
}

export function proyectosAbiertos(lista: Proyecto[]): Proyecto[] {
  return lista
    .filter((p) => p.estado !== "cerrado")
    .sort((a, b) => porFecha(a.fechaProximo, b.fechaProximo) || b.editado.localeCompare(a.editado));
}

export function peticionesPendientes(lista: Peticion[]): Peticion[] {
  return lista
    .filter((p) => p.estado !== "hecha")
    .sort((a, b) => porFecha(a.fechaLimite, b.fechaLimite) || a.creado.localeCompare(b.creado));
}

export function incidenciasAbiertas(lista: Incidencia[]): Incidencia[] {
  return lista.filter((i) => i.estado !== "resuelta").sort((a, b) => b.creado.localeCompare(a.creado));
}

export function notasRecientes(lista: Nota[], cuantas: number): Nota[] {
  return [...lista].sort((a, b) => b.editado.localeCompare(a.editado)).slice(0, cuantas);
}

/** Recordatorios sin hacer de mañana a dentro de una semana. */
export function proximosSieteDias(lista: Recordatorio[], hoy: string): number {
  const limite = sumarDias(hoy, 7);
  return lista.filter((r) => !r.hecho && r.fecha > hoy && r.fecha <= limite).length;
}

export function vencidas(fechas: string[], hoy: string): number {
  return fechas.filter((f) => esDia(f) && f < hoy).length;
}
