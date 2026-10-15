import type { Trabajo } from "../lib/tipos.ts";

// Pendiente de que Alexander explique los pasos (plan, bloque B2). De momento
// solo están las dos variantes que nombró: cambiar la fecha de un descuento, o
// cambiar los porcentajes de los cupones y sus fechas.
export const DESCUENTOS: Trabajo = {
  id: "descuentos",
  nombre: "Cambio de descuentos",
  icono: "🏷️",
  descripcion: "Cambiar la fecha de un descuento, o los porcentajes de los cupones y sus fechas.",
  ejemploReferencia: "Qué descuento o qué cupones",
  variantes: [
    { id: "fecha", nombre: "Cambiar fecha" },
    { id: "porcentajes", nombre: "Cambiar porcentajes y fechas" },
  ],
  secciones: [],
};
