# Plan 1: Alex.ia, el centro de tareas del trabajo de Alexander
Revisiones: 1 · Repositorio: `alexburt-cei/Alex.ia` · Rama: `claude/stoic-babbage-66fmko` · Creado: 15/10/2026

## 0. Registro de cambios

| # | Fecha | Instrucción recibida | Tareas afectadas | Estado |
|---|-------|----------------------|------------------|--------|
| C1 | 15/10/2026 | Centralizar todas las tareas del trabajo, con los pasos de cada una para saber que se hacen bien y no olvidar nada: cada trabajo en una pestaña, con checklists y selectores de estado. Después: un mini dashboard inicial que no se llame «Resumen» y que recoja todas las pestañas («Tareas», «Proyectos abiertos», «Recordatorios»…), y una interfaz parecida a Notion. Respuestas: las de D1-D17 | B1 (T1.1-T1.8), B2-B4 | B1 aplicado (v0.1.0); B2-B4, pendientes de que Alexander explique cada trabajo |

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
| D3 | Se abre en local con `npm run dev` (http://localhost:5173, con el puerto fijo para no «perder» los datos) | Respuesta, 15/10 |
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

### Bloque B2 — Pasos de «Cambio de descuentos» *(pendiente de la explicación de Alexander)*

Ya están sus dos variantes: «Cambiar fecha» y «Cambiar porcentajes y fechas». Falta todo lo demás (ver
el guion de la sección 6).

### Bloque B3 — Pasos de «Importar al CRM» *(pendiente)*

Importar archivos al CRM y editar los registros creados. Falta saber de qué ficheros y registros se
trata y si tiene relación con CEI Import.

### Bloque B4 — Pasos de «SAGE» *(pendiente)*

Falta saber qué es este trabajo: qué lo dispara y qué se hace.

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
- Abrir `npm run dev` en http://localhost:5173: en Inicio y en cada pestaña, crear, editar y cerrar
  elementos, y comprobar que siguen ahí al recargar.

## 8. Checklist de cierre

- [x] B1: build, lint y verificar correctos; recorrido en el navegador sin errores
- [ ] Visto bueno de Alexander abriendo la app (v0.1.0)
- [ ] Visto bueno de Alexander a las decisiones por defecto P1-P12
- [ ] B2, B3 y B4: pasos escritos con la explicación de Alexander
