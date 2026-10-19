import type { ReactNode } from "react";

/** Una página: icono y título grandes y su contenido, como en Notion. */
export function Pagina({
  icono,
  titulo,
  descripcion,
  children,
}: {
  icono: string;
  titulo: string;
  descripcion?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full px-4 pb-24 sm:px-12">
      <header className="pb-5 pt-10">
        <div className="text-5xl leading-none" aria-hidden="true">
          {icono}
        </div>
        <h1 className="mt-4 text-[34px] font-bold leading-tight tracking-tight">{titulo}</h1>
        {descripcion && <p className="mt-1.5 text-[15px] text-tinta-2">{descripcion}</p>}
      </header>
      {children}
    </div>
  );
}
