// Los pasos de un trabajo como cards cuadradas: un clic la pone en verde
// (hecha) y otro la desmarca. La primera que falta sale en blanco («en curso»)
// y las siguientes, semitransparentes. Con «···» se marca Problema (rojo) o
// Bloqueado (gris), con una nota de qué ha pasado.

import { useCallback, useRef, useState, type KeyboardEvent } from "react";
import type { AspectoCard } from "../lib/checklist.ts";
import type { EstadoPaso, MarcaPaso, Paso } from "../lib/tipos.ts";
import { Flotante } from "../ui/Flotante.tsx";
import { Icono } from "../ui/Icono.tsx";

const ESTILO: Record<AspectoCard, string> = {
  hecho: "border-transparent bg-[var(--e-green-bg)] text-[var(--e-green-tx)] cursor-pointer",
  en_curso: "border-tinta-2 bg-caja shadow-md cursor-pointer",
  pendiente: "border-linea bg-caja opacity-50 hover:opacity-80 cursor-pointer",
  problema: "border-transparent bg-[var(--e-red-bg)] text-[var(--e-red-tx)] cursor-pointer",
  bloqueado: "border-transparent bg-[var(--e-gray-bg)] text-[var(--e-gray-tx)] opacity-75 cursor-not-allowed",
};

const TEXTO: Record<AspectoCard, string> = {
  hecho: "Hecho",
  en_curso: "En curso",
  pendiente: "Pendiente",
  problema: "Problema",
  bloqueado: "Bloqueado",
};

const MENU: { valor: EstadoPaso; texto: string }[] = [
  { valor: "hecho", texto: "Hecho" },
  { valor: "problema", texto: "Problema" },
  { valor: "bloqueado", texto: "Bloqueado" },
  { valor: "pendiente", texto: "Pendiente" },
];

export function TarjetasPasos({
  pasos,
  aspecto,
  marcas,
  onCambiar,
}: {
  pasos: Paso[];
  aspecto: Record<string, AspectoCard>;
  marcas: (id: string) => MarcaPaso;
  onCambiar: (id: string, c: Partial<MarcaPaso>) => void;
}) {
  return (
    // Todas en una fila a lo ancho de la página (en pantallas estrechas, de dos en dos).
    <div className="grid grid-cols-2 gap-3 md:auto-cols-fr md:grid-flow-col md:grid-cols-none">
      {pasos.map((p, i) => (
        <Tarjeta
          key={p.id}
          numero={i + 1}
          paso={p}
          aspecto={aspecto[p.id] ?? "pendiente"}
          marca={marcas(p.id)}
          onCambiar={(c) => onCambiar(p.id, c)}
        />
      ))}
    </div>
  );
}

/** Los controles de dentro de la card no la marcan al pulsarlos. */
const parar = {
  onClick: (e: { stopPropagation: () => void }) => e.stopPropagation(),
  onKeyDown: (e: { stopPropagation: () => void }) => e.stopPropagation(),
};

function Tarjeta({
  numero,
  paso,
  aspecto,
  marca,
  onCambiar,
}: {
  numero: number;
  paso: Paso;
  aspecto: AspectoCard;
  marca: MarcaPaso;
  onCambiar: (c: Partial<MarcaPaso>) => void;
}) {
  const [ancla, setAncla] = useState<DOMRect | null>(null);
  const [enfocarNota, setEnfocarNota] = useState(false);
  const boton = useRef<HTMLButtonElement>(null);
  const cerrar = useCallback(() => setAncla(null), []);
  const conNota = aspecto === "problema" || aspecto === "bloqueado" || marca.nota !== "";

  const alternar = () => {
    if (aspecto === "bloqueado") return;
    onCambiar({ estado: aspecto === "hecho" ? "pendiente" : "hecho" });
  };
  const tecla = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      alternar();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={aspecto === "hecho"}
      aria-disabled={aspecto === "bloqueado"}
      aria-label={`Paso ${numero}: ${paso.titulo}. ${TEXTO[aspecto]}`}
      onClick={alternar}
      onKeyDown={tecla}
      className={`flex h-[240px] flex-col overflow-hidden rounded-2xl border p-3 text-left transition ${ESTILO[aspecto]}`}
    >
      <div className="flex items-center gap-2 text-xs font-medium">
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[rgba(0,0,0,0.08)] px-1.5 dark:bg-[rgba(255,255,255,0.12)]">
          {aspecto === "hecho" ? "✓" : numero}
        </span>
        <span className="flex-1">{TEXTO[aspecto]}</span>
        <button
          ref={boton}
          type="button"
          title="Cambiar estado"
          aria-label="Cambiar estado"
          aria-haspopup="menu"
          aria-expanded={ancla !== null}
          {...parar}
          onClick={(e) => {
            e.stopPropagation();
            const r = e.currentTarget.getBoundingClientRect();
            setAncla((a) => (a ? null : r));
          }}
          className="rounded p-0.5 opacity-70 hover:bg-[rgba(0,0,0,0.08)] hover:opacity-100 dark:hover:bg-[rgba(255,255,255,0.12)]"
        >
          <Icono nombre="puntos" />
        </button>
      </div>

      <div className="desplazable mt-2 min-h-0 flex-1 overflow-y-auto">
        <p className={`text-[15px] font-medium leading-snug ${aspecto === "hecho" ? "line-through decoration-1" : ""}`}>
          {paso.titulo}
        </p>
        {paso.importante && (
          <p className="mt-1.5 inline-block rounded bg-[var(--e-yellow-bg)] px-1.5 text-xs font-medium text-[var(--e-yellow-tx)]">
            ⚠ {paso.importante}
          </p>
        )}
        {paso.como && <p className="mt-1.5 text-[13px] leading-snug opacity-80">{paso.como}</p>}
        {conNota && (
          <textarea
            {...parar}
            value={marca.nota}
            onChange={(e) => onCambiar({ nota: e.target.value })}
            placeholder={aspecto === "bloqueado" ? "¿Qué lo bloquea?" : "¿Qué ha pasado?"}
            aria-label={`Nota del paso ${numero}`}
            autoFocus={enfocarNota && marca.nota === ""}
            rows={3}
            className="mt-2 block w-full resize-none rounded bg-[rgba(255,255,255,0.6)] px-2 py-1 text-[13px] text-tinta outline-none placeholder:text-tinta-2 focus:ring-2 focus:ring-[rgba(35,131,226,0.35)] dark:bg-[rgba(0,0,0,0.25)]"
          />
        )}
      </div>

      {paso.enlace && (
        <a
          {...parar}
          href={paso.enlace.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 self-start text-[13px] font-medium underline underline-offset-2"
        >
          <Icono nombre="abrir" className="h-3.5 w-3.5" />
          {paso.enlace.texto}
        </a>
      )}

      <span {...parar}>
      {ancla && (
        <Flotante ancla={ancla} boton={boton} onCerrar={cerrar} ancho={180}>
          <div role="menu" aria-label="Estado del paso" {...parar}>
            {MENU.map((o) => (
              <button
                key={o.valor}
                type="button"
                role="menuitem"
                autoFocus={o.valor === marca.estado}
                onClick={(e) => {
                  e.stopPropagation();
                  setEnfocarNota(o.valor === "problema" || o.valor === "bloqueado");
                  onCambiar({ estado: o.valor });
                  setAncla(null);
                }}
                className="flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-hover focus:bg-hover focus:outline-none"
              >
                {o.texto}
                {o.valor === marca.estado && <span className="text-tinta-2">✓</span>}
              </button>
            ))}
          </div>
        </Flotante>
      )}
      </span>
    </div>
  );
}
