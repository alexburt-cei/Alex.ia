import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Puerto fijo. Los datos de la app viven en el navegador (localStorage), que los
// guarda por dirección: http://localhost:5173. Si Vite arrancara en otro puerto,
// la app saldría vacía; con strictPort, si el 5173 está ocupado, Vite se para y
// lo dice en vez de cambiar de puerto en silencio. `npm run preview` usa el
// mismo puerto para ver los mismos datos.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  preview: { port: 5173, strictPort: true },
})
