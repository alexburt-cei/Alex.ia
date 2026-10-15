import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { aCopia, deCopia } from "./lib/datos.ts";
import { diaDe, momentoLegible } from "./lib/fechas.ts";
import { pendientesHoy } from "./lib/recordatorios.ts";
import { cambiarDatos, leerDatos, limpiarVacios, useDatos, useErrorGuardado } from "./estado/almacen.ts";
import { PAGINAS, ir, useRuta, type Ruta } from "./estado/navegacion.ts";
import { useAhora } from "./estado/reloj.ts";
import { APP_VERSION } from "./version.ts";
import { Boton, Pestanas } from "./ui/basicos.tsx";
import { Flotante } from "./ui/Flotante.tsx";
import { Icono } from "./ui/Icono.tsx";
import { Incidencias } from "./vistas/Incidencias.tsx";
import { Inicio } from "./vistas/Inicio.tsx";
import { Notas } from "./vistas/Notas.tsx";
import { Peticiones } from "./vistas/Peticiones.tsx";
import { Proyectos } from "./vistas/Proyectos.tsx";
import { Recordatorios } from "./vistas/Recordatorios.tsx";
import { Tareas } from "./vistas/Tareas.tsx";

export default function App() {
  const ruta = useRuta();
  const error = useErrorGuardado();

  // Lo creado y dejado en blanco se borra al cerrarlo o al cambiar de pestaña.
  useEffect(() => {
    limpiarVacios(ruta.sub);
  }, [ruta]);

  return (
    <div className="min-h-screen bg-fondo text-tinta">
      <BarraSuperior ruta={ruta} />
      {error && (
        <div role="alert" className="border-b border-linea bg-[var(--e-red-bg)] text-[var(--e-red-tx)]">
          <p className="mx-auto flex max-w-[1240px] items-center gap-2 px-4 py-2 text-sm sm:px-12">
            <Icono nombre="aviso" />
            {error}
          </p>
        </div>
      )}
      <main>
        <Contenido ruta={ruta} />
      </main>
    </div>
  );
}

function Contenido({ ruta }: { ruta: Ruta }) {
  switch (ruta.pagina) {
    case "inicio":
      return <Inicio />;
    case "tareas":
      return <Tareas trabajo={ruta.sub} />;
    case "proyectos":
      return <Proyectos abierto={ruta.sub} />;
    case "recordatorios":
      return <Recordatorios abierto={ruta.sub} />;
    case "incidencias":
      return <Incidencias abierto={ruta.sub} />;
    case "peticiones":
      return <Peticiones abierto={ruta.sub} />;
    case "notas":
      return <Notas abierto={ruta.sub} />;
  }
}

function BarraSuperior({ ruta }: { ruta: Ruta }) {
  const datos = useDatos();
  const hoy = diaDe(useAhora());
  const paraHoy = pendientesHoy(datos.recordatorios, hoy).length;

  return (
    <header className="sticky top-0 z-30 border-b border-linea bg-fondo">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-3 pt-2 sm:px-11">
        <a
          href="#/inicio"
          className="flex items-center gap-2 rounded px-1.5 py-1 text-[15px] font-semibold hover:bg-hover"
        >
          <span
            aria-hidden="true"
            className="flex h-5 w-5 items-center justify-center rounded bg-tinta text-[11px] font-bold text-fondo"
          >
            A
          </span>
          Alex.ia
        </a>
        <div className="flex items-center gap-0.5">
          <BotonTema />
          <MenuMas />
        </div>
      </div>
      <nav aria-label="Pestañas" className="mx-auto max-w-[1240px] px-2 pt-1 sm:px-10">
        <Pestanas
          etiqueta="Pestañas"
          valor={ruta.pagina}
          onCambiar={(p) => {
            // En Tareas, volver a pulsar la pestaña no cambia de trabajo.
            if (!(p === "tareas" && ruta.pagina === "tareas")) ir(p);
          }}
          opciones={PAGINAS.map((p) => ({
            valor: p.id,
            texto: p.nombre,
            icono: <span aria-hidden="true">{p.icono}</span>,
            cuenta: p.id === "recordatorios" ? paraHoy : undefined,
          }))}
        />
      </nav>
    </header>
  );
}

const CLAVE_TEMA = "alexia.tema";

function BotonTema() {
  const [oscuro, setOscuro] = useState(() => document.documentElement.classList.contains("dark"));
  const cambiar = () => {
    const v = !oscuro;
    setOscuro(v);
    document.documentElement.classList.toggle("dark", v);
    try {
      localStorage.setItem(CLAVE_TEMA, v ? "oscuro" : "claro");
    } catch {
      /* sin recordar el tema */
    }
  };
  return <Boton icono={oscuro ? "sol" : "luna"} title={oscuro ? "Modo claro" : "Modo oscuro"} onClick={cambiar} />;
}

/** Menú ···: copia de seguridad de los datos y versión de la app. */
function MenuMas() {
  const [ancla, setAncla] = useState<DOMRect | null>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const fichero = useRef<HTMLInputElement>(null);
  const cerrar = useCallback(() => setAncla(null), []);

  const descargar = () => {
    const ahora = new Date();
    const blob = new Blob([aCopia(leerDatos(), ahora.toISOString())], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Alex.ia - copia ${diaDe(ahora)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    cerrar();
  };

  const restaurar = async (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    try {
      const copia = deCopia(await f.text());
      const de = copia.exportado ? ` del ${momentoLegible(copia.exportado)}` : "";
      if (window.confirm(`Esto cambia todo lo que hay ahora en la app por la copia${de}. ¿Seguir?`)) {
        cambiarDatos(() => copia.datos);
      }
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "No se ha podido leer la copia.");
    }
  };

  return (
    <>
      <button
        ref={boton}
        type="button"
        title="Más"
        aria-label="Más opciones"
        aria-haspopup="menu"
        aria-expanded={ancla !== null}
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setAncla((a) => (a ? null : r));
        }}
        className="inline-flex h-7 items-center rounded px-2 text-tinta-2 hover:bg-hover hover:text-tinta"
      >
        <Icono nombre="puntos" />
      </button>
      {ancla && (
        <Flotante ancla={ancla} boton={boton} onCerrar={cerrar} ancho={290}>
          <div role="menu" aria-label="Más opciones">
            <button
              type="button"
              role="menuitem"
              onClick={descargar}
              autoFocus
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-hover focus:bg-hover focus:outline-none"
            >
              <Icono nombre="descargar" className="h-4 w-4 text-tinta-2" />
              Descargar copia de seguridad
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                fichero.current?.click();
                cerrar();
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-hover focus:bg-hover focus:outline-none"
            >
              <Icono nombre="subir" className="h-4 w-4 text-tinta-2" />
              Restaurar una copia…
            </button>
            <p className="mt-1 border-t border-linea px-3 pb-1 pt-2 text-xs leading-relaxed text-tinta-2">
              Los datos se guardan solo en este navegador, en {window.location.host}. Descarga una copia de vez en
              cuando.
              <br />
              Alex.ia v{APP_VERSION}
            </p>
          </div>
        </Flotante>
      )}
      <input
        ref={fichero}
        type="file"
        accept=".json,application/json"
        onChange={restaurar}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />
    </>
  );
}
