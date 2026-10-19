/** @type {import('tailwindcss').Config} */
export default {
  // El tema lo elige la app (botón de la barra superior), que pone o quita la
  // clase `dark` en <html>.
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Colores de la interfaz, definidos como variables en src/index.css para
      // que cambien solos con el modo oscuro.
      colors: {
        fondo: "var(--fondo)",
        "fondo-2": "var(--fondo-2)",
        caja: "var(--caja)",
        tinta: "var(--tinta)",
        "tinta-2": "var(--tinta-2)",
        "tinta-3": "var(--tinta-3)",
        linea: "var(--linea)",
        hover: "var(--hover)",
        activo: "var(--activo)",
        acento: "var(--acento)",
        "acento-texto": "var(--acento-texto)",
        rojo: "var(--rojo)",
        naranja: "var(--naranja)",
        progreso: "var(--progreso)",
      },
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica",
          "Apple Color Emoji",
          "Arial",
          "sans-serif",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
        ],
      },
      boxShadow: {
        flotante: "var(--sombra-flotante)",
        peek: "var(--sombra-peek)",
      },
    },
  },
  plugins: [],
}
