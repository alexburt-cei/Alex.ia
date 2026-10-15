// Comprobaciones de las reglas de src/lib (fechas, repeticiones de los
// recordatorios, checklists y copia de seguridad). Ejecutar con:
//   npm run verificar

import assert from "node:assert/strict";
import {
  editarRonda,
  estadoTrabajoVacio,
  marcar,
  recuento,
  rondaTocada,
  seccionesVisibles,
  terminar,
} from "../src/lib/checklist.ts";
import { aCopia, datosVacios, deCopia, estaVacio, normalizar, nuevaNota, nuevoProyecto, nuevoRecordatorio } from "../src/lib/datos.ts";
import { diaCorto, diasEntre, plazo, proximoLunes, sumarDias } from "../src/lib/fechas.ts";
import { completar, cuando, pendientesHoy, posponer, reprogramar, siguienteOcurrencia, vencido } from "../src/lib/recordatorios.ts";
import type { Recordatorio, Trabajo } from "../src/lib/tipos.ts";

let pruebas = 0;
function prueba(nombre: string, f: () => void) {
  try {
    f();
    pruebas += 1;
  } catch (e) {
    console.error(`✗ ${nombre}`);
    throw e;
  }
}

// --- Fechas ----------------------------------------------------------------

prueba("sumar días cruzando meses, años y el cambio de hora", () => {
  assert.equal(sumarDias("2026-10-31", 1), "2026-11-01");
  assert.equal(sumarDias("2026-12-31", 1), "2027-01-01");
  assert.equal(sumarDias("2026-10-24", 2), "2026-10-26"); // cambio de hora del 25/10
  assert.equal(sumarDias("2028-02-28", 1), "2028-02-29");
  assert.equal(diasEntre("2026-10-15", "2026-10-12"), -3);
});

prueba("próximo lunes", () => {
  assert.equal(proximoLunes("2026-10-15"), "2026-10-19"); // jueves
  assert.equal(proximoLunes("2026-10-19"), "2026-10-26"); // lunes: el siguiente
  assert.equal(proximoLunes("2026-10-18"), "2026-10-19"); // domingo
});

prueba("día corto y plazos", () => {
  const hoy = "2026-10-15";
  assert.equal(diaCorto(hoy, hoy), "hoy");
  assert.equal(diaCorto("2026-10-16", hoy), "mañana");
  assert.equal(diaCorto("2026-10-14", hoy), "ayer");
  assert.match(diaCorto("2026-10-22", hoy), /22 oct/);
  assert.match(diaCorto("2027-01-05", hoy), /2027/);
  assert.equal(diaCorto("", hoy), "");
  assert.equal(plazo("2026-10-14", hoy), "vencido");
  assert.equal(plazo(hoy, hoy), "hoy");
  assert.equal(plazo("2026-10-17", hoy), "pronto");
  assert.equal(plazo("2026-10-18", hoy), "normal");
  assert.equal(plazo("", hoy), "sin");
});

// --- Recordatorios ---------------------------------------------------------

prueba("siguiente vez según la repetición", () => {
  assert.equal(siguienteOcurrencia("diario", "2026-10-15", "2026-10-15"), "2026-10-16");
  // Laborables: del viernes al lunes.
  assert.equal(siguienteOcurrencia("laborables", "2026-10-16", "2026-10-16"), "2026-10-19");
  // Semanal: el mismo día de la semana que el ancla (lunes 12/10).
  assert.equal(siguienteOcurrencia("semanal", "2026-10-12", "2026-10-15"), "2026-10-19");
  assert.equal(siguienteOcurrencia("semanal", "2026-10-12", "2026-10-19"), "2026-10-26");
  // Mensual: el día 31 cae en el último día de los meses cortos y vuelve al 31.
  assert.equal(siguienteOcurrencia("mensual", "2026-01-31", "2026-01-31"), "2026-02-28");
  assert.equal(siguienteOcurrencia("mensual", "2026-01-31", "2026-02-28"), "2026-03-31");
  assert.equal(siguienteOcurrencia("mensual", "2026-10-15", "2026-10-10"), "2026-10-15");
  assert.equal(siguienteOcurrencia("mensual", "2026-12-15", "2026-12-15"), "2027-01-15");
});

const base = (datos: Partial<Recordatorio>): Recordatorio =>
  nuevoRecordatorio("2026-10-01T08:00:00.000Z", "2026-10-15", { texto: "x", ...datos });
const el = (dia: string, hora = "10:00") => new Date(`${dia}T${hora}:00`);

prueba("completar uno que no se repite lo deja hecho", () => {
  const c = completar(base({}), el("2026-10-15"));
  assert.equal(c.hecho, true);
  assert.ok(c.hechoEl);
});

prueba("completar uno que se repite salta a la siguiente vez después de hoy", () => {
  // Semanal de los lunes, atrasado dos semanas: pasa al próximo lunes.
  const r = base({ fecha: "2026-10-05", ancla: "2026-10-05", repetir: "semanal" });
  const c = completar(r, el("2026-10-15"));
  assert.equal(c.fecha, "2026-10-19");
  assert.equal(c.hecho, false);
  // Si se hace por adelantado, salta desde su fecha.
  const r2 = base({ fecha: "2026-10-19", ancla: "2026-10-05", repetir: "semanal" });
  assert.equal(completar(r2, el("2026-10-15")).fecha, "2026-10-26");
});

prueba("posponer mueve solo esta vez; reprogramar mueve la repetición", () => {
  const r = base({ fecha: "2026-10-12", ancla: "2026-10-12", repetir: "semanal" });
  const pospuesto = { ...r, ...posponer("2026-10-14") };
  assert.equal(pospuesto.ancla, "2026-10-12");
  // Al completarlo el miércoles, vuelve a su lunes.
  assert.equal(completar(pospuesto, el("2026-10-14")).fecha, "2026-10-19");
  const reprogramado = { ...r, ...reprogramar("2026-10-14") };
  assert.equal(completar(reprogramado, el("2026-10-14")).fecha, "2026-10-21");
});

prueba("grupos del tablero y vencidos", () => {
  const hoy = "2026-10-15";
  assert.equal(cuando(base({ fecha: "2026-10-14" }), hoy), "atrasados");
  assert.equal(cuando(base({ fecha: hoy }), hoy), "hoy");
  assert.equal(cuando(base({ fecha: "2026-10-16" }), hoy), "manana");
  assert.equal(cuando(base({ fecha: "2026-10-20" }), hoy), "adelante");
  assert.equal(cuando(base({ fecha: "2026-10-14", hecho: true }), hoy), "hechos");
  assert.equal(vencido(base({ fecha: hoy, hora: "09:00" }), el(hoy, "09:30")), true);
  assert.equal(vencido(base({ fecha: hoy, hora: "11:00" }), el(hoy, "09:30")), false);
  assert.equal(vencido(base({ fecha: hoy }), el(hoy, "23:59")), false);
});

prueba("los de hoy: atrasados y de hoy, los urgentes primero", () => {
  const hoy = "2026-10-15";
  const lista = [
    base({ id: "a", fecha: hoy, hora: "09:00" }),
    base({ id: "b", fecha: "2026-10-16" }),
    base({ id: "c", fecha: "2026-10-10" }),
    base({ id: "d", fecha: hoy, prioridad: "urgente", hora: "18:00" }),
    base({ id: "e", fecha: "2026-10-01", hecho: true }),
  ];
  assert.deepEqual(
    pendientesHoy(lista, hoy).map((r) => r.id),
    ["d", "c", "a"],
  );
});

// --- Checklists ------------------------------------------------------------

const TRABAJO: Trabajo = {
  id: "prueba",
  nombre: "Prueba",
  icono: "🧪",
  descripcion: "",
  ejemploReferencia: "",
  variantes: [
    { id: "a", nombre: "Tipo A" },
    { id: "b", nombre: "Tipo B" },
  ],
  secciones: [
    { titulo: "Antes", pasos: [{ id: "comun", titulo: "Paso común" }] },
    {
      titulo: "Según el tipo",
      pasos: [
        { id: "solo-a", titulo: "Solo A", variantes: ["a"] },
        { id: "solo-b", titulo: "Solo B", variantes: ["b"] },
      ],
    },
  ],
};

prueba("pasos visibles según la variante", () => {
  assert.deepEqual(
    seccionesVisibles(TRABAJO, null).flatMap((s) => s.pasos.map((p) => p.id)),
    ["comun"],
  );
  assert.deepEqual(
    seccionesVisibles(TRABAJO, "b").flatMap((s) => s.pasos.map((p) => p.id)),
    ["comun", "solo-b"],
  );
});

prueba("marcar, contar y terminar", () => {
  const t0 = "2026-10-15T09:00:00.000Z";
  let e = estadoTrabajoVacio();
  assert.equal(rondaTocada(e.actual), false);
  e = { ...e, actual: editarRonda(e.actual, { variante: "a", referencia: "Cupón OTOÑO" }, t0) };
  e = { ...e, actual: marcar(e.actual, "comun", { estado: "hecho" }, "2026-10-15T09:05:00.000Z") };
  e = { ...e, actual: marcar(e.actual, "solo-a", { estado: "problema", nota: "No carga" }, t0) };
  assert.equal(e.actual.empezada, t0);
  const c = recuento(TRABAJO, e.actual);
  assert.deepEqual([c.total, c.hecho, c.problema], [2, 1, 1]);

  const fin = terminar(TRABAJO, e, "2026-10-15T10:00:00.000Z");
  assert.equal(rondaTocada(fin.actual), false);
  assert.equal(fin.ultima?.variante, "Tipo A");
  assert.equal(fin.ultima?.referencia, "Cupón OTOÑO");
  assert.deepEqual(
    fin.ultima?.pasos.map((p) => [p.seccion, p.titulo, p.estado, p.nota]),
    [
      ["Antes", "Paso común", "hecho", ""],
      ["Según el tipo", "Solo A", "problema", "No carga"],
    ],
  );
});

// --- Datos y copia de seguridad --------------------------------------------

prueba("lectura tolerante de datos antiguos o incompletos", () => {
  assert.deepEqual(normalizar(null), datosVacios());
  const d = normalizar({
    proyectos: [{ id: "p1", nombre: "Migración" }, { sin: "id" }, "basura"],
    recordatorios: [{ id: "r1", texto: "Llamar", fecha: "2026-10-20" }],
    trabajos: { descuentos: { actual: { referencia: "X" } } },
  });
  assert.equal(d.proyectos.length, 1);
  assert.equal(d.proyectos[0].estado, "abierto");
  assert.deepEqual(d.proyectos[0].hitos, []);
  assert.equal(d.recordatorios[0].ancla, "2026-10-20");
  assert.equal(d.trabajos.descuentos.actual.referencia, "X");
  assert.deepEqual(d.trabajos.descuentos.actual.marcas, {});
});

prueba("copia de seguridad: ida y vuelta, y ficheros que no lo son", () => {
  const d = datosVacios();
  d.notas.push(nuevaNota("2026-10-15T09:00:00.000Z", { titulo: "Hola" }));
  const copia = deCopia(aCopia(d, "2026-10-15T10:00:00.000Z"));
  assert.equal(copia.exportado, "2026-10-15T10:00:00.000Z");
  assert.deepEqual(copia.datos, d);
  assert.throws(() => deCopia("no es json"), /JSON/);
  assert.throws(() => deCopia('{"otra":"cosa"}'), /copia de seguridad de Alex\.ia/);
});

prueba("elementos vacíos", () => {
  assert.equal(estaVacio("proyectos", nuevoProyecto("t")), true);
  assert.equal(estaVacio("proyectos", nuevoProyecto("t", { conQuien: "Andrea" })), false);
  assert.equal(estaVacio("notas", nuevaNota("t", { texto: " " })), true);
});

console.log(`✓ ${pruebas} comprobaciones correctas`);
