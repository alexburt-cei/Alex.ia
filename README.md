# Alex.ia

El centro de tareas del trabajo de Alexander: sus trabajos de siempre con checklists paso a paso,
proyectos abiertos, recordatorios, incidencias, peticiones y notas, con un mini dashboard de inicio.
Estilo parecido a Notion, con modo claro y oscuro.

## Cómo abrirla

Hace falta [Node.js](https://nodejs.org) 22 (o 20.19 o posterior).

```bash
git clone https://github.com/alexburt-cei/Alex.ia.git
cd Alex.ia
npm install
npm run dev
```

Y abrir **http://localhost:5180** en el navegador. Para cerrarla, `Ctrl + C` en la terminal.

## Dónde se guardan los datos

En el propio navegador, solo en ese ordenador y en esa dirección (`http://localhost:5180`). Por eso:

- Ábrela siempre en el mismo navegador y en `localhost:5180` (no en `127.0.0.1` ni en otro puerto).
- Si borras los datos de navegación de ese sitio, se borra lo que hayas apuntado.
- De vez en cuando, **descarga una copia de seguridad** desde el menú ··· (arriba a la derecha). Desde
  el mismo menú se restaura.

## Para desarrollar

- `npm run build`: comprueba los tipos y genera `dist/`.
- `npm run lint`
- `npm run verificar`: comprobaciones de las reglas (fechas, repeticiones, checklists, copia).

El plan con las decisiones y lo pendiente está en `_plan.md`; los cambios de cada versión, en
`_cambios.md`.
