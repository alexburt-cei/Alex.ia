import { useCallback } from "react";
import { nuevaNota } from "../lib/datos.ts";
import { diaCorto, diaDe } from "../lib/fechas.ts";
import type { Nota } from "../lib/tipos.ts";
import { actualizar, crear, eliminar, useDatos } from "../estado/almacen.ts";
import { ir } from "../estado/navegacion.ts";
import { useAhora } from "../estado/reloj.ts";
import { BaseDeDatos, type Columna } from "../ui/BaseDeDatos.tsx";
import { AreaTexto } from "../ui/campos.tsx";
import { Pagina } from "../ui/Pagina.tsx";
import { Peek, TituloPeek } from "../ui/Peek.tsx";
import { SinTitulo } from "./comun.tsx";

export function Notas({ abierto }: { abierto: string | null }) {
  const datos = useDatos();
  const hoy = diaDe(useAhora());
  const actual = datos.notas.find((n) => n.id === abierto) ?? null;
  const cerrar = useCallback(() => ir("notas"), []);

  const nueva = () => {
    const n = nuevaNota(new Date().toISOString());
    crear("notas", n);
    ir("notas", n.id);
  };

  const columnas: Columna<Nota>[] = [
    {
      id: "titulo",
      titulo: "Nota",
      icono: "texto",
      ancho: 260,
      celda: (n) => (
        <span className="flex items-center gap-2">
          <span aria-hidden="true">📄</span>
          {n.titulo || <SinTitulo texto="Sin título" />}
        </span>
      ),
    },
    {
      id: "texto",
      titulo: "Contenido",
      icono: "texto",
      ancho: 320,
      celda: (n) => <span className="line-clamp-1 text-tinta-2">{n.texto}</span>,
    },
    {
      id: "editada",
      titulo: "Editada",
      icono: "hora",
      ancho: 120,
      celda: (n) => <span className="whitespace-nowrap">{diaCorto(diaDe(new Date(n.editado)), hoy)}</span>,
    },
  ];

  return (
    <Pagina icono="📝" titulo="Notas" descripcion="Apuntes sueltos que no son tarea ni proyecto.">
      <BaseDeDatos
        clave="notas"
        elementos={[...datos.notas].sort((a, b) => b.editado.localeCompare(a.editado))}
        columnas={columnas}
        abierto={abierto}
        onAbrir={(id) => ir("notas", id)}
        onNuevo={nueva}
        textoNuevo="Nueva nota"
        textoVacio="Aún no hay notas."
      />

      {actual && (
        <Peek
          key={actual.id}
          onCerrar={cerrar}
          onEliminar={() => {
            eliminar("notas", actual.id);
            cerrar();
          }}
          textoEliminar={`¿Eliminar la nota «${actual.titulo || "sin título"}»?`}
        >
          <TituloPeek
            icono="📝"
            valor={actual.titulo}
            onCambiar={(titulo) => actualizar("notas", actual.id, { titulo })}
            placeholder="Título"
          />
          <div className="mt-4">
            <AreaTexto
              valor={actual.texto}
              onCambiar={(texto) => actualizar("notas", actual.id, { texto })}
              etiqueta="Texto de la nota"
              placeholder="Escribe aquí…"
              filas={12}
              className="text-[15px]"
            />
          </div>
        </Peek>
      )}
    </Pagina>
  );
}
