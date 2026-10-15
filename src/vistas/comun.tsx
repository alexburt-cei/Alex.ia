// Piezas que comparten varias pestañas.

import { nombreEnlace } from "../lib/enlaces.ts";
import { diaCorto, esDia, plazo } from "../lib/fechas.ts";
import type { Datos, Enlace } from "../lib/tipos.ts";
import { irAEnlace } from "../estado/navegacion.ts";
import { Icono } from "../ui/Icono.tsx";

/** Una fecha límite: en rojo si se ha pasado y en naranja si es hoy o en los
 *  dos días siguientes. `activa` en falso (algo ya cerrado) la deja en gris. */
export function FechaConPlazo({ dia, hoy, activa = true }: { dia: string; hoy: string; activa?: boolean }) {
  if (!esDia(dia)) return null;
  const p = plazo(dia, hoy);
  const color = !activa
    ? "text-tinta-2"
    : p === "vencido"
      ? "text-rojo"
      : p === "hoy" || p === "pronto"
        ? "text-naranja"
        : "";
  return <span className={`whitespace-nowrap ${color}`}>{diaCorto(dia, hoy)}</span>;
}

export function SinTitulo({ texto }: { texto: string }) {
  return <span className="text-tinta-3">{texto}</span>;
}

/** Lo enlazado a un recordatorio, como un enlace que lo abre. */
export function ChipEnlace({ enlace, datos }: { enlace: Enlace; datos: Datos }) {
  const nombre = nombreEnlace(enlace, datos);
  if (nombre === null) return <span className="text-tinta-2">(eliminado)</span>;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        irAEnlace(enlace);
      }}
      className="inline-flex max-w-full items-center gap-1 rounded px-1 text-left text-tinta underline decoration-linea underline-offset-2 hover:bg-hover"
      title="Abrir"
    >
      <Icono nombre="abrir" className="h-3.5 w-3.5 text-tinta-2" />
      <span className="truncate">{nombre}</span>
    </button>
  );
}
