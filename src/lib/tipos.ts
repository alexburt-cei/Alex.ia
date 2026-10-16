// Tipos de los datos de la app. Todo lo que escribe Alexander (marcas de las
// checklists, proyectos, recordatorios…) se guarda en un único objeto `Datos`
// en el navegador (ver src/estado/almacen.ts). Las fechas van como texto:
// "YYYY-MM-DD" para los días y ISO completo para los momentos.

// ---------------------------------------------------------------------------
// Tareas: trabajos con checklist. Los pasos se escriben en código
// (src/trabajos/); aquí solo se guardan las marcas.
// ---------------------------------------------------------------------------

export type EstadoPaso = "pendiente" | "en_curso" | "hecho" | "problema" | "bloqueado";

export interface Paso {
  /** Identificador estable: las marcas guardadas van por él. No cambiarlo. */
  id: string;
  titulo: string;
  /** Cómo se hace, si hace falta explicarlo. */
  como?: string;
  /** Cómo saber que ha salido bien. */
  comprobar?: string;
  /** Si solo vale para algunas variantes del trabajo, sus ids. */
  variantes?: string[];
  /** Página donde se hace el paso; la card la enlaza. */
  enlace?: { texto: string; url: string };
  /** Un paso que se suele olvidar: la card lo avisa. */
  importante?: string;
}

export interface Seccion {
  titulo: string;
  pasos: Paso[];
}

export interface Variante {
  id: string;
  nombre: string;
}

export interface Trabajo {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  /** «cards»: un cuadrado por paso que se pone en verde al pulsarlo; «lista»:
   *  una fila por paso con su estado. */
  vista: "cards" | "lista";
  /** Si tiene el campo para crear el recordatorio del próximo cambio. */
  proximoCambio?: { etiqueta: string; texto: string };
  variantes: Variante[];
  secciones: Seccion[];
}

export interface MarcaPaso {
  estado: EstadoPaso;
  nota: string;
}

/** La lista en curso de un trabajo. */
export interface Ronda {
  /** Ya no se pide en la app (C2); se conserva por los datos antiguos. */
  referencia: string;
  notas: string;
  variante: string | null;
  marcas: Record<string, MarcaPaso>;
  /** Momento del primer cambio de esta vez. */
  empezada: string | null;
}

/** La lista tal como quedó al pulsar «Terminar». Guarda los textos de los
 *  pasos para que se pueda leer aunque luego cambien. */
export interface RondaTerminada {
  referencia: string;
  notas: string;
  /** Nombre de la variante, si el trabajo las tiene. */
  variante: string | null;
  empezada: string | null;
  terminada: string;
  pasos: { seccion: string; titulo: string; estado: EstadoPaso; nota: string }[];
}

export interface EstadoTrabajo {
  actual: Ronda;
  ultima: RondaTerminada | null;
}

// ---------------------------------------------------------------------------
// Proyectos, recordatorios, incidencias, peticiones y notas: se crean desde
// la app.
// ---------------------------------------------------------------------------

interface Base {
  id: string;
  creado: string;
  editado: string;
}

export type EstadoProyecto = "abierto" | "pausa" | "esperando" | "cerrado";

export interface Hito {
  id: string;
  texto: string;
  hecho: boolean;
}

export interface Proyecto extends Base {
  nombre: string;
  estado: EstadoProyecto;
  proximoPaso: string;
  /** "" si no tiene fecha. */
  fechaProximo: string;
  conQuien: string;
  hitos: Hito[];
  notas: string;
}

export type Repeticion = "no" | "diario" | "laborables" | "semanal" | "mensual";
export type Prioridad = "normal" | "urgente";
export type TipoEnlace = "tarea" | "proyecto" | "incidencia" | "peticion";

export interface Enlace {
  tipo: TipoEnlace;
  /** Id del trabajo (si es una tarea) o del elemento. */
  id: string;
}

export interface Recordatorio extends Base {
  texto: string;
  fecha: string;
  /** "HH:MM" o "" si es para todo el día. */
  hora: string;
  repetir: Repeticion;
  /** Fecha de referencia de la repetición (el día de la semana o del mes).
   *  Cambia al reprogramar desde el campo Fecha, no al posponer. */
  ancla: string;
  prioridad: Prioridad;
  enlace: Enlace | null;
  /** Solo los que no se repiten llegan a quedar hechos. */
  hecho: boolean;
  /** Última vez que se marcó como hecho (también en los que se repiten). */
  hechoEl: string | null;
  notas: string;
}

export type SistemaIncidencia = "zoho_crm" | "web" | "sage" | "otro";
export type EstadoIncidencia = "abierta" | "en_curso" | "esperando" | "resuelta";

export interface Incidencia extends Base {
  titulo: string;
  sistema: SistemaIncidencia;
  estado: EstadoIncidencia;
  descripcion: string;
  solucion: string;
  resueltaEl: string | null;
}

export type CanalPeticion = "cliq" | "correo" | "persona" | "telefono" | "otro";
export type EstadoPeticion = "pendiente" | "en_curso" | "esperando" | "hecha";

export interface Peticion extends Base {
  que: string;
  quien: string;
  canal: CanalPeticion;
  fechaLimite: string;
  estado: EstadoPeticion;
  /** Id del trabajo de Tareas al que corresponde, si hay. */
  trabajo: string | null;
  notas: string;
  hechaEl: string | null;
}

export interface Nota extends Base {
  titulo: string;
  texto: string;
}

export interface Datos {
  version: 1;
  trabajos: Record<string, EstadoTrabajo>;
  proyectos: Proyecto[];
  recordatorios: Recordatorio[];
  incidencias: Incidencia[];
  peticiones: Peticion[];
  notas: Nota[];
}

/** Las listas de elementos que se crean desde la app. */
export type Coleccion = "proyectos" | "recordatorios" | "incidencias" | "peticiones" | "notas";
