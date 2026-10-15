// Fechas como texto "YYYY-MM-DD" (día local). Las cuentas se hacen en UTC para
// que el cambio de hora no descuadre los días.

const DIA_MS = 86_400_000;

function aUTC(dia: string): number {
  const [a, m, d] = dia.split("-").map(Number);
  return Date.UTC(a, m - 1, d);
}

function deUTC(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

const dos = (n: number) => String(n).padStart(2, "0");

/** El día local de un momento, como "YYYY-MM-DD". */
export function diaDe(momento: Date): string {
  return `${momento.getFullYear()}-${dos(momento.getMonth() + 1)}-${dos(momento.getDate())}`;
}

/** La hora local de un momento, como "HH:MM". */
export function horaDe(momento: Date): string {
  return `${dos(momento.getHours())}:${dos(momento.getMinutes())}`;
}

export function esDia(texto: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(texto) && !isNaN(aUTC(texto));
}

export function sumarDias(dia: string, n: number): string {
  return deUTC(aUTC(dia) + n * DIA_MS);
}

/** Días de `desde` a `hasta` (negativo si `hasta` es anterior). */
export function diasEntre(desde: string, hasta: string): number {
  return Math.round((aUTC(hasta) - aUTC(desde)) / DIA_MS);
}

/** 0 domingo … 6 sábado. */
export function diaSemana(dia: string): number {
  return new Date(aUTC(dia)).getUTCDay();
}

export function diasDelMes(anio: number, mes: number): number {
  return new Date(Date.UTC(anio, mes, 0)).getUTCDate();
}

/** El primer lunes después de `dia`. */
export function proximoLunes(dia: string): string {
  const faltan = ((8 - diaSemana(dia)) % 7) || 7;
  return sumarDias(dia, faltan);
}

const fmtCorto = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});
const fmtCortoAnio = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const fmtLargo = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** «hoy», «mañana», «ayer» o «jue, 22 oct» (con el año si no es el actual). */
export function diaCorto(dia: string, hoy: string): string {
  if (!esDia(dia)) return "";
  const d = diasEntre(hoy, dia);
  if (d === 0) return "hoy";
  if (d === 1) return "mañana";
  if (d === -1) return "ayer";
  const fmt = dia.slice(0, 4) === hoy.slice(0, 4) ? fmtCorto : fmtCortoAnio;
  return fmt.format(new Date(aUTC(dia)));
}

/** «jueves, 15 de octubre». */
export function diaLargo(dia: string): string {
  return fmtLargo.format(new Date(aUTC(dia)));
}

/** Un momento ISO como «15/10/2026, 12:30». */
export function momentoLegible(iso: string | null): string {
  if (!iso) return "";
  const m = new Date(iso);
  if (isNaN(m.getTime())) return "";
  return `${dos(m.getDate())}/${dos(m.getMonth() + 1)}/${m.getFullYear()}, ${horaDe(m)}`;
}

export type Plazo = "sin" | "vencido" | "hoy" | "pronto" | "normal";

/** Cómo de cerca está una fecha límite: vencida, hoy, en los próximos dos días… */
export function plazo(dia: string, hoy: string): Plazo {
  if (!esDia(dia)) return "sin";
  const d = diasEntre(hoy, dia);
  if (d < 0) return "vencido";
  if (d === 0) return "hoy";
  if (d <= 2) return "pronto";
  return "normal";
}
