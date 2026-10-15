// Los datos de la app, guardados en el navegador (localStorage) con cada
// cambio. Los componentes los leen con useDatos() y los cambian con las
// funciones de abajo; no hay servidor.

import { useSyncExternalStore } from "react";
import { estadoTrabajoVacio } from "../lib/checklist.ts";
import { datosVacios, estaVacio, normalizar } from "../lib/datos.ts";
import type { Coleccion, Datos, EstadoTrabajo } from "../lib/tipos.ts";

export const CLAVE_DATOS = "alexia.datos";

interface Estado {
  datos: Datos;
  error: string | null;
}

function cargar(): Estado {
  let texto: string | null;
  try {
    texto = localStorage.getItem(CLAVE_DATOS);
  } catch {
    return {
      datos: datosVacios(),
      error: "Este navegador no deja guardar datos: lo que hagas se perderá al cerrar la pestaña.",
    };
  }
  if (!texto) return { datos: datosVacios(), error: null };
  try {
    return { datos: normalizar(JSON.parse(texto)), error: null };
  } catch {
    // No se pisa lo guardado: se aparta para poder recuperarlo a mano.
    try {
      localStorage.setItem(`${CLAVE_DATOS}.danados.${Date.now()}`, texto);
    } catch {
      /* sin espacio: se queda donde está */
    }
    return {
      datos: datosVacios(),
      error: "Los datos guardados estaban dañados. Se han apartado sin borrarlos y la app empieza vacía.",
    };
  }
}

function guardar(d: Datos): string | null {
  try {
    localStorage.setItem(CLAVE_DATOS, JSON.stringify(d));
    return null;
  } catch {
    return "No se han podido guardar los últimos cambios en este navegador. Descarga una copia de seguridad desde el menú ···.";
  }
}

let estado: Estado = cargar();
const oyentes = new Set<() => void>();

function avisar() {
  for (const f of oyentes) f();
}

function suscribir(f: () => void) {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
}

// Si la app está abierta en otra pestaña y cambia algo, esta se pone al día.
window.addEventListener("storage", (e) => {
  if (e.key === CLAVE_DATOS) {
    estado = cargar();
    avisar();
  }
});

export function useDatos(): Datos {
  return useSyncExternalStore(suscribir, () => estado.datos);
}

export function useErrorGuardado(): string | null {
  return useSyncExternalStore(suscribir, () => estado.error);
}

export function leerDatos(): Datos {
  return estado.datos;
}

export function cambiarDatos(f: (d: Datos) => Datos) {
  const datos = f(estado.datos);
  if (datos === estado.datos) return;
  estado = { datos, error: guardar(datos) };
  avisar();
}

// --- Atajos ----------------------------------------------------------------

type Elemento<K extends Coleccion> = Datos[K][number];

export function crear<K extends Coleccion>(k: K, x: Elemento<K>) {
  cambiarDatos((d) => ({ ...d, [k]: [...d[k], x] }));
}

export function actualizar<K extends Coleccion>(k: K, id: string, cambios: Partial<Elemento<K>>) {
  const editado = new Date().toISOString();
  cambiarDatos((d) => ({
    ...d,
    [k]: (d[k] as Elemento<K>[]).map((x) => (x.id === id ? { ...x, ...cambios, editado } : x)),
  }));
}

export function eliminar(k: Coleccion, id: string) {
  cambiarDatos((d) => ({ ...d, [k]: (d[k] as { id: string }[]).filter((x) => x.id !== id) }));
}

export function cambiarTrabajo(id: string, f: (e: EstadoTrabajo) => EstadoTrabajo) {
  cambiarDatos((d) => ({
    ...d,
    trabajos: { ...d.trabajos, [id]: f(d.trabajos[id] ?? estadoTrabajoVacio()) },
  }));
}

const COLECCIONES: Coleccion[] = ["proyectos", "recordatorios", "incidencias", "peticiones", "notas"];

/** Borra lo creado y dejado en blanco (sin título ni nada escrito), salvo lo
 *  que está abierto. Se llama al cambiar de pestaña o cerrar el panel. */
export function limpiarVacios(abierto: string | null) {
  cambiarDatos((d) => {
    let cambiado = false;
    const res = { ...d };
    for (const k of COLECCIONES) {
      const lista = d[k] as Elemento<typeof k>[];
      const quedan = lista.filter((x) => x.id === abierto || !estaVacio(k, x));
      if (quedan.length !== lista.length) {
        (res as Record<Coleccion, unknown>)[k] = quedan;
        cambiado = true;
      }
    }
    return cambiado ? res : d;
  });
}
