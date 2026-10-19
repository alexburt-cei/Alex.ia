import type { Trabajo } from "../lib/tipos.ts";

const PAGINA_BECAS = { texto: "Becas y descuentos", url: "https://cei.es/informacion-becas-descuentos/" };

// Explicado por Alexander el 16/10/2026 (plan, C2). Los ids no se cambian:
// las marcas guardadas van por ellos.
export const DESCUENTOS: Trabajo = {
  id: "descuentos",
  nombre: "Cambio de descuentos",
  icono: "🏷️",
  descripcion: "Cambiar la fecha de un descuento, o los porcentajes de los cupones y sus fechas.",
  vista: "cards",
  enlaces: [{ texto: "JS Cupones", url: "https://cei.es/wp-admin/theme-editor.php?file=js%2Ffc_js.js&theme=betheme-child" }],
  proximoCambio: { etiqueta: "Próximo cambio", texto: "Cambio de descuentos" },
  variantes: [
    { id: "fecha", nombre: "Cambiar fecha" },
    { id: "porcentajes", nombre: "Cambiar porcentajes y fechas" },
  ],
  secciones: [
    {
      titulo: "",
      pasos: [
        {
          id: "fecha-web",
          titulo: "Aplazar la fecha de validez de los cupones en la web",
          como: "En la página de becas y descuentos, cambiar la fecha de validez de los cupones al día que te han indicado.",
          enlace: PAGINA_BECAS,
          variantes: ["fecha"],
        },
        {
          id: "fecha-crm",
          titulo: "Actualizar la fecha de validez de los descuentos en todos los Productos de Zoho CRM",
          variantes: ["fecha"],
        },
        {
          id: "porcentajes-web",
          titulo: "Cambiar las fechas y los porcentajes de la primera convocatoria en la web",
          como: "En la página de becas y descuentos, los cupones de la primera convocatoria que aparece.",
          enlace: PAGINA_BECAS,
          variantes: ["porcentajes"],
        },
        {
          id: "porcentajes-woo",
          titulo: "Actualizar los porcentajes de los cupones en WooCommerce",
          como: "Solo los cupones que cambian.",
          importante: "Se suele olvidar",
          enlace: { texto: "Cupones", url: "https://cei.es/wp-admin/edit.php?post_type=shop_coupon&acfw" },
          variantes: ["porcentajes"],
        },
        {
          id: "porcentajes-crm",
          titulo: "Actualizar la nueva fecha de validez de los cupones en todos los Productos de Zoho CRM",
          variantes: ["porcentajes"],
        },
        {
          id: "porcentajes-pricing",
          titulo: "Cambiar los porcentajes de la próxima convocatoria en CEI Pricing",
          variantes: ["porcentajes"],
        },
      ],
    },
  ],
};
