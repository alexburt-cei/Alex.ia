import type { Trabajo } from "../lib/tipos.ts";

// Pendiente de que Alexander explique los pasos (plan, bloque B3). El contenido
// (Alumnxs, Profesores o Empleo, este aún sin activar) lo pidió el 22/10/2026.
export const IMPORTAR_CRM: Trabajo = {
  id: "importar-crm",
  nombre: "Importar al CRM",
  icono: "📥",
  descripcion: "Importar archivos al CRM y editar los registros creados.",
  vista: "cards",
  etiquetaVariante: "Contenido",
  variantes: [
    { id: "alumnxs", nombre: "Alumnxs" },
    { id: "profesores", nombre: "Profesores" },
    { id: "empleo", nombre: "Empleo", deshabilitada: true },
  ],
  secciones: [],
};
