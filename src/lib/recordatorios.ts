// Reglas de los recordatorios: cuándo toca el siguiente, qué pasa al marcarlo
// como hecho o al posponerlo, y en qué grupo sale («Atrasados», «Hoy»…).

import { diaDe, diaSemana, diasDelMes, esDia, horaDe, sumarDias } from "./fechas.ts";
import type { Recordatorio, Repeticion } from "./tipos.ts";

/** El primer día posterior a `despuesDe` en que toca, según la repetición.
 *  `ancla` da el día de la semana (semanal) o del mes (mensual). */
export function siguienteOcurrencia(repetir: Repeticion, ancla: string, despuesDe: string): string {
  switch (repetir) {
    case "no":
    case "diario":
      return sumarDias(despuesDe, 1);
    case "laborables": {
      let d = sumarDias(despuesDe, 1);
      while (diaSemana(d) === 0 || diaSemana(d) === 6) d = sumarDias(d, 1);
      return d;
    }
    case "semanal": {
      const objetivo = diaSemana(ancla);
      let d = sumarDias(despuesDe, 1);
      while (diaSemana(d) !== objetivo) d = sumarDias(d, 1);
      return d;
    }
    case "mensual": {
      const dia = Number(ancla.slice(8, 10));
      let anio = Number(despuesDe.slice(0, 4));
      let mes = Number(despuesDe.slice(5, 7));
      for (let i = 0; i < 2; i++) {
        const d = `${anio}-${String(mes).padStart(2, "0")}-${String(Math.min(dia, diasDelMes(anio, mes))).padStart(2, "0")}`;
        if (d > despuesDe) return d;
        mes += 1;
        if (mes === 13) {
          mes = 1;
          anio += 1;
        }
      }
      // No se llega aquí: el mes siguiente siempre es posterior.
      return sumarDias(despuesDe, 1);
    }
  }
}

/** Marcar como hecho. Si se repite, pasa a la siguiente vez que toque después
 *  de hoy (o de su fecha, si se adelanta), y sigue sin estar hecho. */
export function completar(r: Recordatorio, ahora: Date): Partial<Recordatorio> {
  const hechoEl = ahora.toISOString();
  if (r.repetir === "no") return { hecho: true, hechoEl };
  const hoy = diaDe(ahora);
  const desde = r.fecha > hoy ? r.fecha : hoy;
  return { fecha: siguienteOcurrencia(r.repetir, r.ancla || r.fecha, desde), hecho: false, hechoEl };
}

/** Posponer: solo cambia la fecha de esta vez; la repetición sigue igual. */
export function posponer(nuevaFecha: string): Partial<Recordatorio> {
  return { fecha: nuevaFecha, hecho: false };
}

/** Reprogramar desde el campo Fecha: cambia también la base de la repetición. */
export function reprogramar(nuevaFecha: string): Partial<Recordatorio> {
  return { fecha: nuevaFecha, ancla: nuevaFecha };
}

export type Cuando = "atrasados" | "hoy" | "manana" | "adelante" | "hechos";

export function cuando(r: Recordatorio, hoy: string): Cuando {
  if (r.hecho) return "hechos";
  if (!esDia(r.fecha) || r.fecha > sumarDias(hoy, 1)) return "adelante";
  if (r.fecha < hoy) return "atrasados";
  return r.fecha === hoy ? "hoy" : "manana";
}

/** Se le ha pasado el día, o la hora si es de hoy. */
export function vencido(r: Recordatorio, ahora: Date): boolean {
  if (r.hecho || !esDia(r.fecha)) return false;
  const hoy = diaDe(ahora);
  if (r.fecha < hoy) return true;
  return r.fecha === hoy && r.hora !== "" && r.hora < horaDe(ahora);
}

/** Los que hay que mirar hoy: los de hoy y los atrasados. */
export function pendientesHoy(lista: Recordatorio[], hoy: string): Recordatorio[] {
  return lista
    .filter((r) => !r.hecho && esDia(r.fecha) && r.fecha <= hoy)
    .sort(ordenUrgentesPrimero);
}

/** Por fecha y hora (los de todo el día, primero); los hechos, al final. */
export function ordenPorFecha(a: Recordatorio, b: Recordatorio): number {
  if (a.hecho !== b.hecho) return a.hecho ? 1 : -1;
  return (a.fecha + a.hora).localeCompare(b.fecha + b.hora);
}

/** Los urgentes primero y, dentro de cada prioridad, por fecha y hora. */
export function ordenUrgentesPrimero(a: Recordatorio, b: Recordatorio): number {
  if (a.prioridad !== b.prioridad) return a.prioridad === "urgente" ? -1 : 1;
  return ordenPorFecha(a, b);
}

/** Todos los que faltan, del más antiguo al más lejano: primero los atrasados,
 *  luego los de hoy y después los que vienen. */
export function pendientesPorFecha(lista: Recordatorio[]): Recordatorio[] {
  return lista.filter((r) => !r.hecho).sort(ordenPorFecha);
}
