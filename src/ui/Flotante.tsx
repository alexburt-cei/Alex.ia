// Menú flotante (desplegables, menú ···). Se pinta encima de todo, pegado al
// botón que lo abre, para que no lo recorten las tablas con desplazamiento.
// Si la página se desplaza, sigue al botón; se cierra al hacer clic fuera, con
// Esc o cuando el botón sale de la pantalla.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

interface Props {
  /** Posición del botón que lo abre (getBoundingClientRect al pulsarlo). */
  ancla: DOMRect;
  /** El botón que lo abre: pulsarlo no cuenta como clic fuera. */
  boton: RefObject<HTMLElement | null>;
  onCerrar: () => void;
  ancho?: number;
  children: ReactNode;
}

export function Flotante({ ancla, boton, onCerrar, ancho = 220, children }: Props) {
  const caja = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState(ancla);

  useEffect(() => {
    const dentro = (n: EventTarget | null) =>
      n instanceof Node && (caja.current?.contains(n) || boton.current?.contains(n));
    const clic = (e: MouseEvent) => {
      if (!dentro(e.target)) onCerrar();
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Que no cierre también el panel lateral.
        e.stopPropagation();
        onCerrar();
        boton.current?.focus();
      }
    };
    const recolocar = (e: Event) => {
      if (e.target instanceof Node && caja.current?.contains(e.target)) return;
      const r = boton.current?.getBoundingClientRect();
      if (!r || r.bottom < 0 || r.top > window.innerHeight) onCerrar();
      else setRect(r);
    };
    document.addEventListener("mousedown", clic);
    document.addEventListener("keydown", tecla, true);
    window.addEventListener("scroll", recolocar, true);
    window.addEventListener("resize", recolocar);
    return () => {
      document.removeEventListener("mousedown", clic);
      document.removeEventListener("keydown", tecla, true);
      window.removeEventListener("scroll", recolocar, true);
      window.removeEventListener("resize", recolocar);
    };
  }, [boton, onCerrar]);

  const alto = window.innerHeight;
  const abajo = alto - rect.bottom;
  const haciaArriba = abajo < 260 && rect.top > abajo;
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - ancho - 8));
  const estilo: CSSProperties = haciaArriba
    ? { bottom: alto - rect.top + 4, left, width: ancho, maxHeight: rect.top - 12 }
    : { top: rect.bottom + 4, left, width: ancho, maxHeight: abajo - 12 };

  return createPortal(
    <div
      ref={caja}
      data-flotante=""
      style={estilo}
      className="desplazable fixed z-50 overflow-y-auto rounded-xl bg-caja py-1 text-sm text-tinta shadow-flotante"
    >
      {children}
    </div>,
    document.body,
  );
}
