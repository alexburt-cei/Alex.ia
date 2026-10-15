// Los trabajos de la pestaña Tareas, en el orden de sus sub-pestañas.
//
// Los pasos de cada trabajo se escriben a partir de lo que explica Alexander:
// no se inventan. Cada paso necesita un `id` estable, porque las marcas que se
// guardan en el navegador van por él; si se cambia el texto de un paso, el id
// se deja igual.

import type { Trabajo } from "../lib/tipos.ts";
import { DESCUENTOS } from "./descuentos.ts";
import { IMPORTAR_CRM } from "./importar-crm.ts";
import { SAGE } from "./sage.ts";

export const TRABAJOS: Trabajo[] = [DESCUENTOS, IMPORTAR_CRM, SAGE];

export function trabajoPorId(id: string | null): Trabajo | undefined {
  return TRABAJOS.find((t) => t.id === id);
}
