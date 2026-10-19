// Notas: cada una es un documento. En la página salen como tarjetas con su
// texto; al abrir una, aparece entera por la derecha para leerla y escribirla.

import { useCallback } from "react";
import { nuevaNota } from "../lib/datos.ts";
import { diaCorto, diaDe } from "../lib/fechas.ts";
import { actualizar, crear, eliminar, useDatos } from "../estado/almacen.ts";
import { ir } from "../estado/navegacion.ts";
import { useAhora } from "../estado/reloj.ts";
import { Boton } from "../ui/basicos.tsx";
import { Icono } from "../ui/Icono.tsx";
import { Pagina } from "../ui/Pagina.tsx";
import { Peek, TituloPeek } from "../ui/Peek.tsx";

export function Notas({ abierto }: { abierto: string | null }) {
  const datos = useDatos();
  const hoy = diaDe(useAhora());
  const actual = datos.notas.find((n) => n.id === abierto) ?? null;
  const cerrar = useCallback(() => ir("notas"), []);
  const notas = [...datos.notas].sort((a, b) => b.editado.localeCompare(a.editado));

  const nueva = () => {
    const n = nuevaNota(new Date().toISOString());
    crear("notas", n);
    ir("notas", n.id);
  };

  return (
    <Pagina titulo="Notas" descripcion="Apuntes sueltos que no son tarea ni proyecto. Cada nota es un documento.">
      <div className="mb-3 flex justify-end">
        <Boton tipo="primario" icono="mas" onClick={nueva}>
          Nueva nota
        </Boton>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {notas.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => ir("notas", n.id)}
            className={`flex h-[220px] flex-col rounded-lg border bg-caja p-4 text-left transition-colors hover:border-tinta-3 ${
              n.id === abierto ? "border-tinta-2" : "border-linea"
            }`}
          >
            <span className="line-clamp-2 text-[15px] font-semibold">
              {n.titulo || <span className="text-tinta-3">Sin título</span>}
            </span>
            <span className="mt-2 line-clamp-6 min-h-0 flex-1 whitespace-pre-line text-sm leading-relaxed text-tinta-2">
              {n.texto || "Vacía"}
            </span>
            <span className="mt-2 text-xs text-tinta-2">Editada {diaCorto(diaDe(new Date(n.editado)), hoy)}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={nueva}
          className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-linea text-sm text-tinta-2 hover:bg-hover hover:text-tinta"
        >
          <Icono nombre="mas" />
          Nueva nota
        </button>
      </div>

      {actual && (
        <Peek
          key={actual.id}
          documento
          onCerrar={cerrar}
          onEliminar={() => {
            eliminar("notas", actual.id);
            cerrar();
          }}
          textoEliminar={`¿Eliminar la nota «${actual.titulo || "sin título"}»?`}
        >
          <TituloPeek
            valor={actual.titulo}
            onCambiar={(titulo) => actualizar("notas", actual.id, { titulo })}
            placeholder="Título"
          />
          <p className="mt-1 text-xs text-tinta-2">Editada {diaCorto(diaDe(new Date(actual.editado)), hoy)}</p>
          <textarea
            value={actual.texto}
            onChange={(e) => actualizar("notas", actual.id, { texto: e.target.value })}
            placeholder="Escribe aquí…"
            aria-label="Texto de la nota"
            className="mt-5 block min-h-[60vh] w-full flex-1 resize-none bg-transparent text-base leading-relaxed outline-none placeholder:text-tinta-3 focus-visible:outline-none"
          />
        </Peek>
      )}
    </Pagina>
  );
}
