# CLAUDE.md

## Qué es esto

**Alex.ia**: el centro de tareas del trabajo de Alexander. App web (React + Vite + TypeScript +
Tailwind) que se usa en local, con los datos guardados en el navegador (localStorage), sin servidor.
Pestañas: Inicio (mini dashboard) · Tareas (trabajos con checklist) · Proyectos abiertos ·
Recordatorios · Incidencias · Peticiones · Notas. Estilo parecido a Notion.

El plan vivo, con las decisiones y lo pendiente, está en `_plan.md`.

## Regla principal

**Preguntar a Alexander ante cualquier duda.** Los pasos de los trabajos de Tareas se escriben solo con
lo que él explique, nunca inventados. Las decisiones que se toman por defecto se apuntan en `_plan.md`
para que les dé el visto bueno.

## Comandos

- `npm install`
- `npm run dev`: abre la app en http://localhost:5173 (puerto fijo: los datos van ligados a esa
  dirección)
- `npm run build` (= `tsc -b && vite build`)
- `npm run lint`
- `npm run verificar`: comprobaciones de las reglas de `src/lib`

## Estructura

- `src/lib/`: lógica pura, sin React ni navegador. `tipos.ts` los datos, `checklist.ts` las
  checklists, `recordatorios.ts` las repeticiones y cuándo toca cada uno, `fechas.ts`, `opciones.ts`
  las listas de opciones con su color, `datos.ts` los elementos nuevos, la lectura tolerante y la copia
  de seguridad, `inicio.ts` lo que enseña Inicio, `enlaces.ts` los enlaces de los recordatorios.
- `src/trabajos/`: un fichero por trabajo de Tareas, con sus variantes y sus pasos.
- `src/estado/`: el guardado en el navegador (`almacen.ts`), la pestaña abierta en la dirección
  (`navegacion.ts`) y la hora (`reloj.ts`).
- `src/ui/`: piezas de interfaz tipo Notion (etiquetas, campos, desplegables, panel lateral, tabla y
  tablero).
- `src/vistas/`: una pestaña por fichero. `App.tsx`: la barra superior y el menú ···.
- `scripts/verificar.ts`: comprobaciones.

## Convenciones

- Commits conventional por tarea y `vX.Y.Z — descripción` al cerrar cada versión, subiendo
  `APP_VERSION` en `src/version.ts` y añadiendo la entrada en `_cambios.md`.
- Lógica en `src/lib/`, nunca en los componentes.
- Cero dependencias nuevas sin acuerdo previo.
- Textos de la app en español, sin «(s)»: con `plural()` de `src/lib/texto.ts`.
- **Los ids de los pasos (`Paso.id`) no se cambian nunca**: las marcas guardadas van por ellos. Si
  cambia el texto de un paso, el id se queda.
- **Los datos guardados no se rompen**: un campo nuevo necesita su valor por defecto en
  `src/lib/datos.ts` (los `nuevo…()`), que es lo que completa los datos antiguos al leerlos.
- Colores solo con las variables de `src/index.css` (claro y oscuro), con contraste AA en los textos.
