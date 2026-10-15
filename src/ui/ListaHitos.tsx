// Checklist corta que se escribe desde la app (los hitos de un proyecto).

import { useState } from "react";
import { nuevoId } from "../lib/datos.ts";
import type { Hito } from "../lib/tipos.ts";
import { Casilla } from "./basicos.tsx";
import { Icono } from "./Icono.tsx";

export function ListaHitos({ hitos, onCambiar }: { hitos: Hito[]; onCambiar: (h: Hito[]) => void }) {
  const [nuevo, setNuevo] = useState("");

  const anadir = () => {
    const texto = nuevo.trim();
    if (!texto) return;
    onCambiar([...hitos, { id: nuevoId(), texto, hecho: false }]);
    setNuevo("");
  };
  const cambiar = (id: string, c: Partial<Hito>) => onCambiar(hitos.map((h) => (h.id === id ? { ...h, ...c } : h)));

  return (
    <div className="text-[15px]">
      {hitos.map((h) => (
        <div key={h.id} className="group flex min-h-[30px] items-center gap-2 rounded px-1.5 hover:bg-hover">
          <Casilla marcada={h.hecho} onCambiar={(v) => cambiar(h.id, { hecho: v })} etiqueta={`Hecho: ${h.texto}`} />
          <input
            value={h.texto}
            onChange={(e) => cambiar(h.id, { texto: e.target.value })}
            aria-label="Hito"
            className={`min-w-0 flex-1 bg-transparent py-1 outline-none ${h.hecho ? "text-tinta-2 line-through" : ""}`}
          />
          <button
            type="button"
            onClick={() => onCambiar(hitos.filter((x) => x.id !== h.id))}
            aria-label={`Quitar «${h.texto}»`}
            title="Quitar"
            className="rounded p-0.5 text-tinta-2 opacity-0 hover:bg-hover hover:text-tinta focus:opacity-100 group-hover:opacity-100"
          >
            <Icono nombre="papelera" className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="flex min-h-[30px] items-center gap-2 px-1.5">
        <Icono nombre="mas" className="h-4 w-4 text-tinta-3" />
        <input
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") anadir();
          }}
          onBlur={anadir}
          placeholder="Añadir hito y pulsar Intro"
          aria-label="Nuevo hito"
          className="min-w-0 flex-1 bg-transparent py-1 outline-none placeholder:text-tinta-3"
        />
      </div>
    </div>
  );
}
