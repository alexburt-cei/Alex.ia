// La hora actual para lo que depende de ella (qué recordatorios tocan hoy, qué
// está vencido). Se actualiza cada medio minuto y al volver a la pestaña.

import { useSyncExternalStore } from "react";

let ahora = new Date();
const oyentes = new Set<() => void>();

function tic() {
  ahora = new Date();
  for (const f of oyentes) f();
}

setInterval(tic, 30_000);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") tic();
});

function suscribir(f: () => void) {
  oyentes.add(f);
  return () => {
    oyentes.delete(f);
  };
}

export function useAhora(): Date {
  return useSyncExternalStore(suscribir, () => ahora);
}
