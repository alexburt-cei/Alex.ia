# Plan 1: Alex.ia, el centro de tareas del trabajo de Alexander
Revisiones: 13 · Repositorio: `alexburt-cei/Alex.ia` · Rama de trabajo: `main` (creada el 16/10/2026 desde `claude/stoic-babbage-66fmko`) · Creado: 15/10/2026

## 0. Registro de cambios

| # | Fecha | Instrucción recibida | Tareas afectadas | Estado |
|---|-------|----------------------|------------------|--------|
| C1 | 15/10/2026 | Centralizar todas las tareas del trabajo, con los pasos de cada una para saber que se hacen bien y no olvidar nada: cada trabajo en una pestaña, con checklists y selectores de estado. Después: un mini dashboard inicial que no se llame «Resumen» y que recoja todas las pestañas («Tareas», «Proyectos abiertos», «Recordatorios»…), y una interfaz parecida a Notion. Respuestas: las de D1-D17 | B1 (T1.1-T1.8), B2-B4 | B1 aplicado (v0.1.0) |
| C2 | 16/10/2026 | Cambio de descuentos: quitar «A qué se refiere»; con «Cambiar fecha», aplazar la fecha de validez de los cupones en cei.es/informacion-becas-descuentos y actualizar la fecha de validez de los descuentos en todos los Productos de Zoho CRM; con «Cambiar porcentajes y fechas», cambiar fechas y porcentajes de la primera convocatoria en esa página, los porcentajes de los cupones en WooCommerce (se suele olvidar), la fecha de validez en los Productos de Zoho CRM y los porcentajes de la próxima convocatoria en CEI Pricing; guardar desde la tarea el recordatorio del próximo cambio; los pasos, como cards cuadradas que se ponen en verde, y «Terminar» solo con todas. Respuestas: las de D19-D23 | B2 (T2.1-T2.5) | aplicado (v0.2.0) |
| C3 | 19/10/2026 | Sin enlaces en las cards (bastan los que hay) y sin «cómo comprobarlo»: la revisión es manual. Aprovechar todo el ancho siempre que se pueda: los pasos de las tareas en una sola fila y lo pequeño, en la mitad derecha | B2 (T2.6) | aplicado (v0.2.1) |
| C4 | 19/10/2026 | Enlace «JS Cupones» (editor del tema, `fc_js.js`) justo antes de la checklist, en un recuadro gris claro con texto gris oscuro; enlace a los cupones de WooCommerce en su paso; las opciones del trabajo, en una sola columna arriba a la derecha, en un cuadro blanco, reutilizable; nunca #FFF ni #000 de fondo de página (gris muy claro y muy oscuro) y sí para cuadros especiales | B2 (T2.7-T2.9) | aplicado (v0.3.0) |
| C5 | 19/10/2026 | «Tipo», como un desplegable (select) con sus opciones en vez de botones | B2 (T2.10) | aplicado (v0.3.1) |
| C6 | 19/10/2026 | El 5173 estaba ocupado (CEI Import): la app pasa al puerto 5180. Los datos del 5173 se llevan con una copia de seguridad (descargar en el 5173 y restaurar en el 5180) | D3 | aplicado (v0.3.2) |
| C7 | 19/10/2026 | Sin iconos grandes en los títulos; modo claro por defecto; en Inicio, los grupos en orden Tareas, Recordatorios, Proyectos abiertos, Peticiones, Notas e Incidencias, cada uno en su cuadro (no blanco), sin la fila de cifras (pasan a pills en cada grupo); tonos crema, beige y grises en toda la app. Después: un grupo nuevo «To do», siempre el primero | B5 (T5.1-T5.5) | aplicado (v0.4.0) |
| C8 | 19/10/2026 | Las notas, individuales: cada una, un documento entero que aparece por la derecha al abrirla. Y en los cuadros de grupos de Inicio se mantienen los iconos | B5 (T5.6-T5.7) | aplicado (v0.4.1) |
| C9 | 19/10/2026 | Las pestañas de arriba, sin iconos, en la barra superior junto al logo, centradas y con estilo de menú web; la tipografía Inter en toda la app | B5 (T5.8-T5.9) | aplicado (v0.5.0) |
| C10 | 19/10/2026 | Más redondeo en las cards en general | B5 (T5.10) | aplicado (v0.5.1) |
| C11 | 19/10/2026 | En Inicio, Recordatorios con todos los creados y su fecha, no solo los de hoy; «To do» también en el menú de arriba | B5 (T5.11-T5.12) | aplicado (v0.5.2) |
| C12 | 22/10/2026 | Importar al CRM, con un selector de contenido: Alumnxs, Profesores y Empleo (este, de momento, desactivado) | B3 (T3.1) | aplicado (v0.5.3) |
| C13 | 22/10/2026 | Que lo escrito se guarde y se vea desde cualquier dispositivo (dos portátiles). Respuesta: app en Vercel con los datos en la nube, pero queda aparcado porque Alexander no tiene cuenta de Vercel | B6 | aparcado |

## 1. Objetivo

Un sitio único donde Alexander tiene su trabajo:

- **Tareas**: sus trabajos de siempre, cada uno con una checklist de pasos y, en cada paso, cómo se hace
  y cómo saber que ha salido bien. Sirve para hacerlo bien y no olvidar nada.
- **Proyectos abiertos, Recordatorios, Incidencias, Peticiones y Notas**: lo que tiene entre manos, lo
  que no puede olvidar, los problemas que le llegan, lo que le piden y sus apuntes.
- **Inicio**: un mini dashboard con todo lo anterior de un vistazo.

Regla de la sesión, pedida por Alexander: **preguntar siempre ante cualquier duda**. Los pasos de cada
trabajo se escriben con lo que él explique, nunca inventados.

## 2. Decisiones confirmadas

| # | Decisión | Origen |
|---|----------|--------|
| D1 | App nueva en el repositorio `Alex.ia`, separada de CEI Import (que sigue siendo el conversor de ficheros) | Respuesta, 15/10 |
| D2 | La usa solo Alexander, en un ordenador. Los datos se guardan en el navegador (localStorage), sin servidor | Respuesta, 15/10 |
| D3 | Se abre en local con `npm run dev` en http://localhost:5180 (puerto fijo y propio para no «perder» los datos; hasta la v0.3.1 era el 5173, que choca con CEI Import) | Respuestas, 15/10 y 19/10 |
| D4 | Se llama **Alex.ia** | Respuesta, 15/10 |
| D5 | Pestañas arriba (no barra lateral), con estilo parecido a Notion: tipografía, tablas, casillas, desplegables y panel lateral. Modo claro y oscuro | Respuestas, 15/10 |
| D6 | Estados y prioridades en etiquetas de color suave, como las de Notion; el resto, en blanco y grises | Respuesta, 15/10 |
| D7 | Pestañas: **Inicio** · Tareas · Proyectos abiertos · Recordatorios · Incidencias · Peticiones · Notas. Inicio es el mini dashboard (no se llama «Resumen») | Mensaje y respuestas, 15/10 |
| D8 | Trabajos de Tareas, cada uno en su sub-pestaña: **Cambio de descuentos** (cambiar la fecha, o cambiar los porcentajes de los cupones y las fechas), **Importar al CRM** (importar archivos y editar los registros creados) y **SAGE** | Respuesta, 15/10 |
| D9 | Cada trabajo tiene una checklist fija que se vacía con el botón **«Terminar»**; la lista terminada se puede ver en **«Última vez»** (solo la última) | Respuestas, 15/10 |
| D10 | Estados de cada paso: Pendiente · En curso · Hecho · Problema · Bloqueado, cada uno con su nota | Respuesta, 15/10 |
| D11 | Por cada vez se apunta **«A qué se refiere»** y unas notas, que pasan también a «Última vez» | Respuesta, 15/10 |
| D12 | Los pasos los escribe Claude en el código a partir de lo que explica Alexander; desde la app solo se marca y se anota | Respuesta, 15/10 |
| D13 | Proyectos, Recordatorios, Incidencias y Peticiones se ven en **Tabla** y en **Tablero** (columnas por estado; las tarjetas se arrastran), y al pulsar uno se abre un **panel a la derecha** | Respuestas, 15/10 |
| D14 | Recordatorios: se programan (fecha y, si se quiere, hora), se repiten, se posponen, se enlazan a una tarea, un proyecto, una incidencia o una petición, y tienen prioridad (normal o urgente). Salen en Inicio el día que tocan, y en rojo si se pasan. Sin avisos del navegador | Respuestas, 15/10 |
| D15 | Proyectos: estado (Abierto, En pausa, Esperando a alguien, Cerrado; los cerrados no se borran), próximo paso y su fecha, con quién y sus hitos | Respuesta, 15/10 |
| D16 | Incidencias: sistema, estado y solución | Respuesta, 15/10 |
| D17 | Peticiones: quién y por dónde, fecha límite, estado y un botón para abrir su tarea | Respuesta, 15/10 |
| D19 | Cards cuadradas en Descuentos e Importar al CRM (SAGE, de momento, con la lista) | Respuesta, 16/10 |
| D20 | Aspecto de las cards: Hecho en verde; la primera que falta, «En curso», en blanco; las siguientes, semitransparentes («Pendiente»); Problema en rojo; Bloqueado en gris (no se puede pulsar). Problema y Bloqueado se marcan con «···» y llevan nota | Respuestas, 16/10 |
| D21 | «Terminar» se activa solo cuando todas las cards están en verde | Mensaje, 16/10 |
| D22 | Sin «A qué se refiere» en ningún trabajo | Respuesta, 16/10 |
| D23 | En Descuentos, «Próximo cambio»: una fecha y «Crear recordatorio», que crea «Cambio de descuentos» para ese día enlazado a la tarea | Respuesta, 16/10 |
| D24 | Sin más enlaces en las cards ni «cómo comprobarlo»: la revisión es manual | Respuesta, 19/10 |
| D25 | Aprovechar todo el ancho de la pantalla siempre que se pueda | Mensaje, 19/10 |
| D26 | Nunca blanco ni negro puros de fondo de página; sí en cuadros especiales | Mensaje, 19/10 |
| D27 | Las opciones de una página, en una columna arriba a la derecha en un cuadro blanco | Mensaje, 19/10 |
| D28 | Modo claro por defecto (el oscuro, solo si se elige) | Mensaje, 19/10 |
| D29 | Paleta crema, beige y grises cálidos; el blanco puro, para los cuadros especiales | Mensaje, 19/10 |
| D30 | Inicio: To do (siempre el primero), Tareas, Recordatorios, Proyectos abiertos, Peticiones, Notas e Incidencias, cada grupo en su cuadro con sus cifras en pills | Mensajes, 19/10 |
| D31 | Menú en la barra superior, centrado, sin iconos y con estilo de menú web | Mensaje, 19/10 |
| D32 | Tipografía Inter en toda la app | Mensaje, 19/10 |
| D18 | Se trabaja siempre en la rama `main`, que Alexander actualiza en su ordenador con `git pull` | Respuesta, 16/10 |

## 3. Decisiones por defecto (pendientes del visto bueno de Alexander)

Las tomé para no parar la primera versión. Cada una se cambia sin tocar los datos guardados.

| # | Decisión |
|---|----------|
| P1 | **Copia de seguridad** en el menú ···: descargar y restaurar un `.json`. Los datos solo viven en ese navegador; si se borran los datos del navegador, se pierden |
| P2 | El tablero de Recordatorios se agrupa por cuándo tocan: Atrasados · Hoy · Mañana · Más adelante · Hechos. Arrastrar a Hoy o a Mañana lo reprograma; arrastrar a Hechos lo completa |
| P3 | Repeticiones: cada día, cada día laborable, cada semana o cada mes. Al marcar como hecho uno que se repite, pasa a la siguiente vez; «Posponer» mueve solo esa vez |
| P4 | Atajos para posponer: Mañana, El lunes, Una semana más u otro día |
| P5 | Lo cerrado, resuelto o hecho se oculta (botón «Ver cerrados», «Ver resueltas»…) |
| P6 | Opciones: incidencias (Abierta, En curso, Esperando a alguien, Resuelta), peticiones (Pendiente, En curso, Esperando a alguien, Hecha), sistemas (Zoho CRM, Web / WooCommerce, SAGE, Otro) y canales (Cliq, Correo, En persona, Teléfono, Otro). Las incidencias llevan además «Qué pasa» |
| P7 | En cada trabajo de Tareas se ven sus peticiones abiertas |
| P8 | La pestaña Recordatorios muestra cuántos hay para hoy o atrasados |
| P9 | Lo que se crea y se cierra sin escribir nada se borra solo |
| P10 | En Inicio se puede añadir un recordatorio para hoy escribiéndolo y pulsando Intro |
| P11 | Al marcar un paso como Problema o Bloqueado, el cursor salta a su nota |
| P12 | «Terminar» pregunta antes; si quedan pasos sin «Hecho», lo avisa |
| P13 | «To do» sin fechas; lo hecho queda tachado hasta «Limpiar hechos» (con pestaña propia desde C11) |

## 4. Fuera de alcance (de momento)

- Avisos del navegador a una hora (descartado en D14).
- Varios dispositivos o compañeros (D2): necesitaría guardar los datos en la nube.
- Editar los pasos de los trabajos desde la app (D12).
- Historial de más de una vez por trabajo (D9).

## 5. Bloques y micro-tareas

### Bloque B1 — Esqueleto de la app, Inicio y todas las pestañas *(v0.1.0)*

- [x] T1.1 Proyecto Vite + React + TypeScript + Tailwind, con puerto fijo y `npm run verificar`.
- [x] T1.2 Datos en el navegador: lectura tolerante (lo que falte se completa), aviso si no se puede
  guardar, y los datos dañados se apartan en vez de pisarse. Copia de seguridad (P1).
- [x] T1.3 Interfaz tipo Notion: colores en claro y oscuro con contraste AA en los textos, etiquetas,
  casillas, campos sin borde, desplegables, panel lateral, tabla y tablero con arrastre.
- [x] T1.4 Tareas: sub-pestañas, «A qué se refiere», variantes, checklist con estados y notas, ayuda de
  cada paso (cómo se hace y cómo comprobarlo), «Terminar» y «Última vez».
- [x] T1.5 Proyectos, Recordatorios, Incidencias, Peticiones y Notas, con sus campos (D14-D17, P2-P6).
- [x] T1.6 Inicio: una cifra por pestaña y un bloque por pestaña con lo que hay que mirar.
- [x] T1.7 Comprobaciones: 14 reglas en `scripts/verificar.ts` (fechas, repeticiones, checklists,
  copia) en cuatro husos horarios; recorrido en el navegador con capturas (terminar, arrastrar, borrar
  lo vacío, repetición, Esc, nota al marcar Problema) sin errores en la consola.
- [x] T1.8 Documentación: este plan, `CLAUDE.md`, `README.md` y `_cambios.md`.

### Bloque B2 — Cambio de descuentos con cards *(v0.2.0)*

- [x] T2.1 Pasos de las dos variantes (ids `fecha-*` y `porcentajes-*`), con enlace a la página de
  becas y descuentos y el aviso «Se suele olvidar» en WooCommerce.
- [x] T2.2 Cards (`src/vistas/TarjetasPasos.tsx`) con el aspecto de D20 y su regla en
  `aspectoCards()` (`src/lib/checklist.ts`); «Terminar» con `completa()`.
- [x] T2.3 «A qué se refiere» fuera de la app (el dato se conserva en los datos antiguos).
- [x] T2.4 «Próximo cambio» con su recordatorio enlazado, y los que ya hay, a la vista.
- [x] T2.5 Comprobaciones: 15 reglas; recorrido en el navegador (marcar, problema con nota, Terminar
  solo con todo, recordatorio) sin errores.

- [x] T2.6 Todo el ancho (C3): sin tope de ancho en las páginas; las cards, en una sola fila (de dos
  en dos en pantallas estrechas) y de 240 px de alto en vez de cuadradas, para que no crezcan sin
  medida; en Tareas, Tipo y Próximo cambio a la izquierda y Empezada, Notas y peticiones a la derecha;
  «Terminar» y «Última vez», lado a lado; Inicio, en tres columnas en pantallas muy anchas.
- [x] T2.7 `Trabajo.enlaces` (accesos antes de la checklist): «JS Cupones» en Descuentos; y el
  enlace «Cupones» en la card de WooCommerce.
- [x] T2.8 `Pagina` con `lateral`: un cuadro blanco arriba a la derecha (fijo al desplazar). En Tareas
  lleva Tipo, Próximo cambio, Empezada, Notas y las peticiones del trabajo, una debajo de otra.
- [x] T2.9 Fondos: página en gris muy claro (#f7f7f5) o muy oscuro (#191919); `--caja` (#fff / #000)
  para el cuadro de opciones, el panel lateral, los menús y las tarjetas. Contraste AA revisado con
  los fondos nuevos.
- [x] T2.10 «Tipo», un `<select>` con «Elige el tipo…» y una opción por variante (C5).

### Bloque B3 — Pasos de «Importar al CRM» *(pendiente; ya sale con cards, D19)*

- [x] T3.1 Selector «Contenido» (`Trabajo.etiquetaVariante`): Alumnxs, Profesores y Empleo, este
  desactivado («próximamente», `Variante.deshabilitada`). Faltan los pasos de cada uno.

Importar archivos al CRM y editar los registros creados. Falta saber de qué ficheros y registros se
trata y si tiene relación con CEI Import.

### Bloque B4 — Pasos de «SAGE» *(pendiente)*

Falta saber qué es este trabajo: qué lo dispara y qué se hace.

### Bloque B5 — Inicio por grupos, To do y paleta crema *(v0.4.0)*

- [x] T5.1 Sin iconos grandes en los títulos de página, del panel lateral ni de los trabajos.
- [x] T5.2 Modo claro por defecto, aunque el sistema esté en oscuro.
- [x] T5.3 Inicio: un cuadro por grupo (`bg-fondo-2`) con sus cifras en pills, en el orden de D30;
  fuera la fila de cifras.
- [x] T5.4 «To do»: cosas sueltas por hacer (`Datos.todos`), que se añaden con Intro, se marcan, se
  editan y se quitan; las hechas, tachadas al final hasta «Limpiar hechos». Solo en Inicio (D31 por
  confirmar).
- [x] T5.5 Paleta crema y gris cálido en claro y oscuro, con el botón principal en marrón oscuro;
  contraste AA revisado.
- [x] T5.6 Notas como tarjetas con su texto (y una tarjeta «Nueva nota»); al abrir una, el panel de
  la derecha se abre en modo documento (`<Peek documento>`, más ancho, con el texto a toda la altura).
- [x] T5.7 Iconos de vuelta en los títulos de los grupos de Inicio (📌 To do).
- [x] T5.8 Una sola barra arriba: logo a la izquierda, menú centrado (enlaces sin iconos; la página
  abierta, en una pastilla) y acciones a la derecha. En pantallas estrechas, el menú baja a una fila.
- [x] T5.9 Inter (Google Fonts, pesos 400-700) como tipografía de toda la app; sin conexión, la del
  sistema.
- [x] T5.10 Esquinas más redondeadas: 16 px en cuadros y cards grandes (Inicio, pasos, notas,
  opciones, columnas del tablero); 12 px en tarjetas del tablero, avisos y menús.
- [x] T5.11 Inicio, Recordatorios: todos los pendientes por fecha (`pendientesPorFecha()`), con pills
  de pendientes, para hoy y atrasados.
- [x] T5.12 Pestaña «To do» (después de Inicio), con la misma lista que el grupo de Inicio
  (`src/vistas/Todo.tsx`).

### Bloque B6 — Datos en la nube *(aparcado: falta una cuenta de Vercel)*

Elegido (C13): publicar Alex.ia en Vercel con contraseña, como CEI Import, y guardar los datos en una
base de datos de Vercel (Upstash Redis), con aviso si dos dispositivos cambian lo mismo a la vez y una
copia en el navegador para cortes de conexión. Los datos actuales se pasan con la copia de seguridad.
Cuando Alexander tenga la cuenta: crear el proyecto desde GitHub, poner la contraseña y añadir la
base de datos desde Storage; el código lo hace Claude. Mientras, entre portátiles: descargar la copia
de seguridad en uno y restaurarla en el otro.

## 6. Guion para explicar cada trabajo

Para cada trabajo de Tareas:

1. **Qué lo dispara**: quién lo pide, por dónde y cada cuánto.
2. **Qué necesitas antes de empezar**: ficheros, accesos, datos.
3. **Los pasos, en orden**, y dónde se hace cada uno (Zoho, WooCommerce, SAGE, Excel…).
4. Para cada paso, **cómo sabes que ha salido bien**.
5. **Lo que suele fallar** y qué haces cuando pasa.
6. **Cómo cierras**: a quién avisas y cómo.
7. Si tiene **variantes** (como Descuentos), qué pasos cambian en cada una.

## 7. Cómo verificar

- `npm run build`, `npm run lint` y `npm run verificar`, sin errores.
- Abrir `npm run dev` en http://localhost:5180: en Inicio y en cada pestaña, crear, editar y cerrar
  elementos, y comprobar que siguen ahí al recargar.

## 8. Checklist de cierre

- [x] B1: build, lint y verificar correctos; recorrido en el navegador sin errores
- [ ] Visto bueno de Alexander abriendo la app (v0.1.0)
- [ ] Visto bueno de Alexander a las decisiones por defecto P1-P12
- [ ] Visto bueno de Alexander a las cards de Descuentos (v0.2.0)
- [ ] B3 y B4: pasos escritos con la explicación de Alexander
