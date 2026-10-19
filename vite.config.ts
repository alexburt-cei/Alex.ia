import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Puerto fijo y propio (5180), distinto del 5173 que usan CEI Import y otras
// apps de Vite, para poder tenerlas abiertas a la vez. Los datos de la app viven en el navegador (localStorage), que los
// guarda por dirección: http://localhost:5180. Si Vite arrancara en otro puerto,
// la app saldría vacía; con strictPort, si el 5180 está ocupado, Vite se para y
// lo dice en vez de cambiar de puerto en silencio. `npm run preview` usa el
// mismo puerto para ver los mismos datos.
export default defineConfig({
  plugins: [react()],
  server: { port: 5180, strictPort: true },
  preview: { port: 5180, strictPort: true },
})
