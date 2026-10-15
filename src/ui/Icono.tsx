// Iconos de línea pequeños, en el gris de los textos secundarios, como los de
// las propiedades de Notion.

const TRAZOS = {
  estado: (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <circle cx="8" cy="8" r="2" fill="currentColor" stroke="none" />
    </>
  ),
  texto: <path d="M3 4.5h10M3 8h10M3 11.5h6" />,
  fecha: (
    <>
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" />
    </>
  ),
  hora: (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5v3.2l2 1.3" />
    </>
  ),
  persona: (
    <>
      <circle cx="8" cy="5.5" r="2.5" />
      <path d="M3 13.5c.6-2.6 2.6-4 5-4s4.4 1.4 5 4" />
    </>
  ),
  enlace: <path d="M7 9a2.5 2.5 0 0 0 3.5 0l2-2A2.5 2.5 0 0 0 9 3.5l-.7.7M9 7a2.5 2.5 0 0 0-3.5 0l-2 2A2.5 2.5 0 0 0 7 12.5l.7-.7" />,
  repetir: <path d="M3 7V6a2 2 0 0 1 2-2h7l-2-2M13 9v1a2 2 0 0 1-2 2H4l2 2" />,
  prioridad: <path d="M4 14V2.5M4 3h7.5l-1.5 2.5L11.5 8H4" />,
  sistema: (
    <>
      <path d="M8 2l5.5 3v6L8 14l-5.5-3V5z" />
      <path d="M2.5 5L8 8l5.5-3M8 8v6" />
    </>
  ),
  canal: <path d="M3 3.5h10a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H7l-3 2.5v-2.5H3a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1z" />,
  lista: <path d="M2.5 4l1 1 2-2M2.5 9l1 1 2-2M8 4.5h5.5M8 9.5h5.5M8 13h5.5" />,
  tabla: (
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.5" />
      <path d="M2 6.5h12M2 10h12M6.5 6.5V13" />
    </>
  ),
  tablero: (
    <>
      <rect x="2" y="3" width="3.5" height="10" rx="1" />
      <rect x="6.25" y="3" width="3.5" height="7" rx="1" />
      <rect x="10.5" y="3" width="3.5" height="5" rx="1" />
    </>
  ),
  mas: <path d="M8 3v10M3 8h10" />,
  cerrar: <path d="M4 4l4 4-4 4M9 4l4 4-4 4" />,
  papelera: <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 9h5.8l.6-9" />,
  puntos: (
    <>
      <circle cx="3.5" cy="8" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="8" cy="8" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12.5" cy="8" r="1.1" fill="currentColor" stroke="none" />
    </>
  ),
  luna: <path d="M12.5 10A5.5 5.5 0 0 1 6 3.5a5.5 5.5 0 1 0 6.5 6.5z" />,
  sol: (
    <>
      <circle cx="8" cy="8" r="2.75" />
      <path d="M8 1.5v1.5M8 13v1.5M1.5 8H3M13 8h1.5M3.4 3.4l1 1M11.6 11.6l1 1M3.4 12.6l1-1M11.6 4.4l1-1" />
    </>
  ),
  abrir: <path d="M6 3.5H3.5v9h9V10M9 3h4v4M13 3L7.5 8.5" />,
  descargar: <path d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10" />,
  subir: <path d="M8 10.5v-8M4.5 6L8 2.5 11.5 6M3 13.5h10" />,
  aviso: <path d="M8 2l6 11H2zM8 6.5v3M8 11.5v.01" />,
} as const;

export type NombreIcono = keyof typeof TRAZOS;

export function Icono({ nombre, className = "h-4 w-4" }: { nombre: NombreIcono; className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {TRAZOS[nombre]}
    </svg>
  );
}
