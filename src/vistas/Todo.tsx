// «To do»: cosas sueltas por hacer, sin fecha. Se añaden escribiendo y
// pulsando Intro; las hechas bajan al final tachadas hasta «Limpiar hechos».
// Sale en su pestaña y como primer grupo de Inicio.

import { useState } from "react";
import { nuevoTodo } from "../lib/datos.ts";
import { plural } from "../lib/texto.ts";
import { cambiarTodo, crearTodo, eliminarTodo, limpiarTodosHechos, useDatos } from "../estado/almacen.ts";
import { Casilla, Etiqueta } from "../ui/basicos.tsx";
import { Icono } from "../ui/Icono.tsx";
import { Pagina } from "../ui/Pagina.tsx";

export function ListaTodo() {
  const datos = useDatos();
  const [texto, setTexto] = useState("");
  const pendientes = datos.todos.filter((t) => !t.hecho);
  const hechos = datos.todos.filter((t) => t.hecho);
  const anadir = () => {
    const t = texto.trim();
    if (!t) return;
    crearTodo(nuevoTodo(new Date().toISOString(), { texto: t }));
    setTexto("");
  };

  return (
    <div>
      {[...pendientes, ...hechos].map((t) => (
        <div key={t.id} className="group flex min-h-[34px] items-center gap-2.5 rounded px-1.5 hover:bg-hover">
          <Casilla
            marcada={t.hecho}
            onCambiar={(hecho) => cambiarTodo(t.id, { hecho, hechoEl: hecho ? new Date().toISOString() : null })}
            etiqueta={`Hecho: ${t.texto}`}
          />
          <input
            value={t.texto}
            onChange={(e) => cambiarTodo(t.id, { texto: e.target.value })}
            aria-label="To do"
            className={`min-w-0 flex-1 bg-transparent py-1 outline-none ${t.hecho ? "text-tinta-2 line-through" : ""}`}
          />
          <button
            type="button"
            onClick={() => eliminarTodo(t.id)}
            aria-label={`Quitar «${t.texto}»`}
            title="Quitar"
            className="rounded p-0.5 text-tinta-2 opacity-0 hover:bg-hover hover:text-tinta focus:opacity-100 group-hover:opacity-100"
          >
            <Icono nombre="papelera" className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
      <div className="flex min-h-[34px] items-center gap-2.5 px-1.5">
        <Icono nombre="mas" className="h-4 w-4 text-tinta-3" />
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") anadir();
          }}
          placeholder="Añadir y pulsar Intro"
          aria-label="Nuevo to do"
          className="min-w-0 flex-1 bg-transparent py-1 text-[15px] outline-none placeholder:text-tinta-3"
        />
      </div>
      {hechos.length > 0 && (
        <button
          type="button"
          onClick={limpiarTodosHechos}
          className="mt-1 rounded px-1.5 py-0.5 text-sm text-tinta-2 hover:bg-hover hover:text-tinta"
        >
          Limpiar hechos ({hechos.length})
        </button>
      )}
    </div>
  );
}

export function PendientesTodo() {
  const datos = useDatos();
  const n = datos.todos.filter((t) => !t.hecho).length;
  return <Etiqueta color="default">{plural(n, "pendiente", "pendientes")}</Etiqueta>;
}

export function Todo() {
  return (
    <Pagina titulo="To do" descripcion="Cosas sueltas por hacer. Escribe y pulsa Intro para añadir.">
      <div className="max-w-[760px] rounded-2xl border border-linea bg-fondo-2 p-4">
        <ListaTodo />
      </div>
    </Pagina>
  );
}
