import type { ReactNode } from "react";

/** Una página: icono y título grandes y su contenido, como en Notion. Con
 *  `lateral`, una columna arriba a la derecha en un cuadro blanco (opciones de
 *  la página), y el contenido ocupa el resto del ancho. */
export function Pagina({
  icono,
  titulo,
  descripcion,
  lateral,
  children,
}: {
  icono: string;
  titulo: string;
  descripcion?: ReactNode;
  lateral?: ReactNode;
  children: ReactNode;
}) {
  const cabecera = (
    <header className="pb-5 pt-10">
      <div className="text-5xl leading-none" aria-hidden="true">
        {icono}
      </div>
      <h1 className="mt-4 text-[34px] font-bold leading-tight tracking-tight">{titulo}</h1>
      {descripcion && <p className="mt-1.5 text-[15px] text-tinta-2">{descripcion}</p>}
    </header>
  );
  if (!lateral) {
    return (
      <div className="w-full px-4 pb-24 sm:px-12">
        {cabecera}
        {children}
      </div>
    );
  }
  return (
    <div className="grid w-full items-start gap-x-8 px-4 pb-24 sm:px-12 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
      <div className="min-w-0">
        {cabecera}
        {children}
      </div>
      <aside
        aria-label="Opciones"
        className="mb-6 rounded-lg border border-linea bg-caja p-4 lg:sticky lg:top-[104px] lg:mt-10"
      >
        {lateral}
      </aside>
    </div>
  );
}
