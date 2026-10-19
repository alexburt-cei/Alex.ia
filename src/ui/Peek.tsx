// Panel a la derecha para ver y editar un elemento sin perder la tabla de vista,
// como el «side peek» de Notion. Se cierra con Esc o con el botón ».

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Boton } from "./basicos.tsx";
import { Icono, type NombreIcono } from "./Icono.tsx";

export function Peek({
  onCerrar,
  onEliminar,
  textoEliminar,
  children,
}: {
  onCerrar: () => void;
  onEliminar: () => void;
  /** Pregunta antes de eliminar, p. ej. «¿Eliminar este proyecto?». */
  textoEliminar: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", tecla);
    return () => document.removeEventListener("keydown", tecla);
  }, [onCerrar]);

  return createPortal(
    <aside
      aria-label="Detalle"
      className="desplazable fixed inset-y-0 right-0 z-40 w-full overflow-y-auto bg-caja shadow-peek sm:w-[580px]"
    >
      <div className="sticky top-0 z-10 flex h-11 items-center justify-between bg-caja px-2">
        <Boton icono="cerrar" title="Cerrar (Esc)" onClick={onCerrar} />
        <Boton
          icono="papelera"
          title="Eliminar"
          onClick={() => {
            if (window.confirm(textoEliminar)) onEliminar();
          }}
        />
      </div>
      <div className="px-6 pb-20 sm:px-12">{children}</div>
    </aside>,
    document.body,
  );
}

/** El título grande del elemento, editable. */
export function TituloPeek({
  valor,
  onCambiar,
  placeholder,
}: {
  valor: string;
  onCambiar: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="pt-6">
      <textarea
        value={valor}
        rows={1}
        onChange={(e) => onCambiar(e.target.value.replace(/\n/g, " "))}
        placeholder={placeholder}
        aria-label="Título"
        autoFocus={valor === ""}
        ref={(el) => {
          if (!el) return;
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
        }}
        className="block w-full resize-none bg-transparent text-[30px] font-bold leading-tight outline-none placeholder:text-tinta-3"
      />
    </div>
  );
}

export function Propiedades({ children }: { children: ReactNode }) {
  return <div className="mt-4 space-y-0.5 border-b border-linea pb-4">{children}</div>;
}

export function Propiedad({
  icono,
  nombre,
  apilada = false,
  children,
}: {
  icono: NombreIcono;
  nombre: string;
  /** El nombre encima del valor (en columnas estrechas). */
  apilada?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex min-h-[34px] flex-col gap-0.5 ${apilada ? "" : "sm:flex-row sm:items-start sm:gap-1"}`}
    >
      <div className="flex w-44 shrink-0 items-center gap-2 px-1.5 pt-1.5 text-sm text-tinta-2">
        <Icono nombre={icono} />
        {nombre}
      </div>
      <div className="min-w-0 flex-1 text-sm">{children}</div>
    </div>
  );
}

/** Un bloque con título dentro del panel (Hitos, Solución, Notas…). */
export function BloquePeek({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="mb-1.5 px-1.5 text-sm font-semibold text-tinta-2">{titulo}</h3>
      {children}
    </section>
  );
}
