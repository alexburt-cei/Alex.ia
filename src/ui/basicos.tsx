// Piezas pequeñas con el aire de Notion: etiquetas, casillas, botones,
// avisos, bloques plegables y pestañas.

import { useState, type ReactNode } from "react";
import type { ColorEtiqueta } from "../lib/opciones.ts";
import { Icono, type NombreIcono } from "./Icono.tsx";

export function Etiqueta({ color, children }: { color: ColorEtiqueta; children: ReactNode }) {
  return <span className={`etiqueta etiqueta-${color}`}>{children}</span>;
}

export function Casilla({
  marcada,
  onCambiar,
  etiqueta,
}: {
  marcada: boolean;
  onCambiar: (marcada: boolean) => void;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={marcada}
      aria-label={etiqueta}
      title={etiqueta}
      onClick={(e) => {
        e.stopPropagation();
        onCambiar(!marcada);
      }}
      className={`casilla ${marcada ? "casilla-marcada" : ""}`}
    >
      {marcada && (
        <svg viewBox="0 0 14 14" className="h-3 w-3" aria-hidden="true">
          <path
            d="M2.5 7.5l3 3 6-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

type TipoBoton = "primario" | "suave" | "borde";

const CLASES_BOTON: Record<TipoBoton, string> = {
  primario: "bg-acento text-sobre-acento hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100",
  suave: "text-tinta-2 hover:bg-hover hover:text-tinta disabled:opacity-40",
  borde: "border border-linea text-tinta hover:bg-hover disabled:opacity-40",
};

export function Boton({
  tipo = "suave",
  icono,
  children,
  onClick,
  disabled,
  title,
}: {
  tipo?: TipoBoton;
  icono?: NombreIcono;
  children?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={children ? undefined : title}
      className={`inline-flex h-7 shrink-0 items-center gap-1.5 rounded px-2 text-sm font-medium transition-colors ${CLASES_BOTON[tipo]}`}
    >
      {icono && <Icono nombre={icono} />}
      {children}
    </button>
  );
}

export function Aviso({ icono, children }: { icono: string; children: ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl bg-fondo-2 px-4 py-3 text-sm leading-relaxed">
      <span className="text-base leading-snug" aria-hidden="true">
        {icono}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function Plegable({
  titulo,
  children,
  abierto: abiertoInicial = false,
}: {
  titulo: ReactNode;
  children: ReactNode;
  abierto?: boolean;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  return (
    <div>
      <button
        type="button"
        aria-expanded={abierto}
        onClick={() => setAbierto((a) => !a)}
        className="flex w-full items-center gap-1.5 rounded px-1 py-1 text-left hover:bg-hover"
      >
        <svg
          viewBox="0 0 10 10"
          className={`h-2.5 w-2.5 shrink-0 text-tinta-2 transition-transform ${abierto ? "rotate-90" : ""}`}
          aria-hidden="true"
        >
          <path d="M3 1.5L7.5 5 3 8.5z" fill="currentColor" />
        </svg>
        <span className="min-w-0 flex-1">{titulo}</span>
      </button>
      {abierto && <div className="pl-5 pt-1">{children}</div>}
    </div>
  );
}

export interface PestanaOpcion<V extends string> {
  valor: V;
  texto: string;
  icono?: ReactNode;
  cuenta?: number;
}

/** Fila de pestañas: la elegida, subrayada. */
export function Pestanas<V extends string>({
  opciones,
  valor,
  onCambiar,
  etiqueta,
  tamano = "normal",
}: {
  opciones: PestanaOpcion<V>[];
  valor: V;
  onCambiar: (v: V) => void;
  etiqueta: string;
  tamano?: "normal" | "pequeno";
}) {
  return (
    <div role="tablist" aria-label={etiqueta} className="sin-barra flex items-end gap-1 overflow-x-auto">
      {opciones.map((o) => {
        const activa = o.valor === valor;
        return (
          <button
            key={o.valor}
            type="button"
            role="tab"
            aria-selected={activa}
            onClick={() => onCambiar(o.valor)}
            className={`relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t px-2 pb-2 pt-1.5 transition-colors ${
              tamano === "pequeno" ? "text-sm" : "text-[14.5px]"
            } ${activa ? "font-medium text-tinta" : "text-tinta-2 hover:bg-hover hover:text-tinta"}`}
          >
            {o.icono}
            {o.texto}
            {o.cuenta !== undefined && o.cuenta > 0 && (
              <span className="rounded-full bg-[#b23a35] px-1.5 text-[11px] font-semibold leading-4 text-white">
                {o.cuenta}
              </span>
            )}
            {activa && <span className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-tinta" />}
          </button>
        );
      })}
    </div>
  );
}

/** Barra de avance de una checklist o de unos hitos. */
export function Avance({ hechos, total }: { hechos: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((hechos / total) * 100);
  return (
    <span className="inline-flex items-center gap-2 text-xs text-tinta-2">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-linea" aria-hidden="true">
        <span className="block h-full rounded-full bg-progreso" style={{ width: `${pct}%` }} />
      </span>
      {hechos}/{total}
    </span>
  );
}
