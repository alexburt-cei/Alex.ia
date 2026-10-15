// Campos editables sin borde (se notan al pasar el ratón) y el desplegable de
// opciones con etiquetas de color.

import { useCallback, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Opcion } from "../lib/opciones.ts";
import { Etiqueta } from "./basicos.tsx";
import { Flotante } from "./Flotante.tsx";

export function CampoTexto({
  valor,
  onCambiar,
  placeholder = "Vacío",
  etiqueta,
  autoFocus,
  className = "",
}: {
  valor: string;
  onCambiar: (v: string) => void;
  placeholder?: string;
  etiqueta: string;
  autoFocus?: boolean;
  className?: string;
}) {
  return (
    <input
      type="text"
      value={valor}
      onChange={(e) => onCambiar(e.target.value)}
      placeholder={placeholder}
      aria-label={etiqueta}
      autoFocus={autoFocus}
      className={`campo ${className}`}
    />
  );
}

function ajustarAltura(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/** Texto de varias líneas que crece con lo escrito. */
export function AreaTexto({
  valor,
  onCambiar,
  placeholder = "Vacío",
  etiqueta,
  filas = 1,
  autoFocus,
  className = "",
}: {
  valor: string;
  onCambiar: (v: string) => void;
  placeholder?: string;
  etiqueta: string;
  filas?: number;
  autoFocus?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => ajustarAltura(ref.current), [valor]);
  return (
    <textarea
      ref={ref}
      value={valor}
      rows={filas}
      onChange={(e) => onCambiar(e.target.value)}
      placeholder={placeholder}
      aria-label={etiqueta}
      autoFocus={autoFocus}
      className={`campo block leading-relaxed ${className}`}
    />
  );
}

export function CampoFecha({
  valor,
  onCambiar,
  etiqueta,
  obligatoria = false,
  className = "",
}: {
  valor: string;
  onCambiar: (v: string) => void;
  etiqueta: string;
  /** Si no se puede dejar vacía (la fecha de un recordatorio). */
  obligatoria?: boolean;
  className?: string;
}) {
  return (
    <input
      type="date"
      value={valor}
      required={obligatoria}
      onChange={(e) => {
        if (obligatoria && !e.target.value) return;
        onCambiar(e.target.value);
      }}
      aria-label={etiqueta}
      className={`campo w-auto ${valor ? "" : "text-tinta-3"} ${className}`}
    />
  );
}

export function CampoHora({
  valor,
  onCambiar,
  etiqueta,
}: {
  valor: string;
  onCambiar: (v: string) => void;
  etiqueta: string;
}) {
  return (
    <input
      type="time"
      value={valor}
      onChange={(e) => onCambiar(e.target.value)}
      aria-label={etiqueta}
      className={`campo w-auto ${valor ? "" : "text-tinta-3"}`}
    />
  );
}

/** Desplegable de opciones con etiqueta de color, como el «Select» de Notion. */
export function Selector<V extends string>({
  opciones,
  valor,
  onCambiar,
  etiqueta,
  vacio = "Vacío",
}: {
  opciones: Opcion<V>[];
  valor: V | null;
  onCambiar: (v: V) => void;
  etiqueta: string;
  vacio?: string;
}) {
  const [ancla, setAncla] = useState<DOMRect | null>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const cerrar = useCallback(() => setAncla(null), []);
  const actual = opciones.find((o) => o.valor === valor) ?? null;

  const elegir = (v: V) => {
    onCambiar(v);
    setAncla(null);
    boton.current?.focus();
  };

  const moverFoco = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const botones = Array.from(e.currentTarget.querySelectorAll("button"));
    const i = botones.indexOf(document.activeElement as HTMLButtonElement);
    const sig = e.key === "ArrowDown" ? (i + 1) % botones.length : (i - 1 + botones.length) % botones.length;
    botones[sig]?.focus();
  };

  return (
    // Los clics dentro (también los del menú flotante) no abren la fila de la tabla.
    <span className="inline-flex max-w-full" onClick={(e) => e.stopPropagation()}>
      <button
        ref={boton}
        type="button"
        aria-label={`${etiqueta}: ${actual?.texto ?? vacio}`}
        aria-haspopup="listbox"
        aria-expanded={ancla !== null}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setAncla((a) => (a ? null : r));
        }}
        className="campo-boton"
      >
        {actual ? (
          <Etiqueta color={actual.color}>{actual.texto}</Etiqueta>
        ) : (
          <span className="text-sm text-tinta-3">{vacio}</span>
        )}
      </button>
      {ancla && (
        <Flotante ancla={ancla} boton={boton} onCerrar={cerrar}>
          <div className="px-3 pb-1 pt-1.5 text-xs text-tinta-2">{etiqueta}</div>
          <ul role="listbox" aria-label={etiqueta} onKeyDown={moverFoco}>
            {opciones.map((o) => (
              <li key={o.valor}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.valor === valor}
                  autoFocus={o.valor === (actual?.valor ?? opciones[0]?.valor)}
                  onClick={() => elegir(o.valor)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-1 text-left hover:bg-hover focus:bg-hover focus:outline-none"
                >
                  <Etiqueta color={o.color}>{o.texto}</Etiqueta>
                  {o.valor === valor && <span className="text-tinta-2">✓</span>}
                </button>
              </li>
            ))}
          </ul>
        </Flotante>
      )}
    </span>
  );
}

export interface OpcionLista {
  valor: string;
  texto: string;
  grupo?: string;
}

/** Desplegable con buscador, para elegir entre muchas cosas (a qué enlazar un
 *  recordatorio). */
export function SelectorBuscable({
  opciones,
  valor,
  onCambiar,
  etiqueta,
  vacio = "Vacío",
}: {
  opciones: OpcionLista[];
  valor: string | null;
  onCambiar: (v: string | null) => void;
  etiqueta: string;
  vacio?: string;
}) {
  const [ancla, setAncla] = useState<DOMRect | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const boton = useRef<HTMLButtonElement>(null);
  const cerrar = useCallback(() => {
    setAncla(null);
    setBusqueda("");
  }, []);
  const actual = opciones.find((o) => o.valor === valor) ?? null;

  const elegir = (v: string | null) => {
    onCambiar(v);
    cerrar();
    boton.current?.focus();
  };

  const b = busqueda.trim().toLocaleLowerCase("es");
  const filtradas = b ? opciones.filter((o) => o.texto.toLocaleLowerCase("es").includes(b)) : opciones;
  const grupos = [...new Set(filtradas.map((o) => o.grupo ?? ""))];

  return (
    <span className="inline-flex max-w-full" onClick={(e) => e.stopPropagation()}>
      <button
        ref={boton}
        type="button"
        aria-label={`${etiqueta}: ${actual?.texto ?? vacio}`}
        aria-haspopup="listbox"
        aria-expanded={ancla !== null}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          if (ancla) cerrar();
          else setAncla(r);
        }}
        className="campo-boton"
      >
        {actual ? (
          <span className="truncate">{actual.texto}</span>
        ) : (
          <span className="text-sm text-tinta-3">{vacio}</span>
        )}
      </button>
      {ancla && (
        <Flotante ancla={ancla} boton={boton} onCerrar={cerrar} ancho={300}>
          <div className="px-2 pb-1 pt-1">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && filtradas[0]) elegir(filtradas[0].valor);
              }}
              placeholder="Buscar…"
              aria-label={`Buscar en ${etiqueta}`}
              autoFocus
              className="campo bg-fondo-2"
            />
          </div>
          {valor !== null && (
            <button
              type="button"
              onClick={() => elegir(null)}
              className="w-full px-3 py-1 text-left text-tinta-2 hover:bg-hover"
            >
              Quitar
            </button>
          )}
          {grupos.map((g) => (
            <div key={g} role="group" aria-label={g || etiqueta}>
              {g && <div className="px-3 pb-0.5 pt-2 text-xs text-tinta-2">{g}</div>}
              {filtradas
                .filter((o) => (o.grupo ?? "") === g)
                .map((o) => (
                  <button
                    key={o.valor}
                    type="button"
                    role="option"
                    aria-selected={o.valor === valor}
                    onClick={() => elegir(o.valor)}
                    className="flex w-full items-center justify-between gap-2 px-3 py-1 text-left hover:bg-hover focus:bg-hover focus:outline-none"
                  >
                    <span className="truncate">{o.texto}</span>
                    {o.valor === valor && <span className="text-tinta-2">✓</span>}
                  </button>
                ))}
            </div>
          ))}
          {filtradas.length === 0 && <div className="px-3 py-1.5 text-tinta-2">Nada coincide.</div>}
        </Flotante>
      )}
    </span>
  );
}
