import { useCallback } from "react";
import { nuevoProyecto } from "../lib/datos.ts";
import { diaDe, momentoLegible } from "../lib/fechas.ts";
import { proyectosAbiertos } from "../lib/inicio.ts";
import { ESTADOS_PROYECTO } from "../lib/opciones.ts";
import type { EstadoProyecto, Proyecto } from "../lib/tipos.ts";
import { actualizar, crear, eliminar, useDatos } from "../estado/almacen.ts";
import { ir } from "../estado/navegacion.ts";
import { useAhora } from "../estado/reloj.ts";
import { Avance } from "../ui/basicos.tsx";
import { BaseDeDatos, type Columna } from "../ui/BaseDeDatos.tsx";
import { AreaTexto, CampoFecha, CampoTexto, Selector } from "../ui/campos.tsx";
import { ListaHitos } from "../ui/ListaHitos.tsx";
import { Pagina } from "../ui/Pagina.tsx";
import { BloquePeek, Peek, Propiedad, Propiedades, TituloPeek } from "../ui/Peek.tsx";
import { FechaConPlazo, SinTitulo } from "./comun.tsx";

function ordenar(lista: Proyecto[]): Proyecto[] {
  const cerrados = lista.filter((p) => p.estado === "cerrado").sort((a, b) => b.editado.localeCompare(a.editado));
  return [...proyectosAbiertos(lista), ...cerrados];
}

export function Proyectos({ abierto }: { abierto: string | null }) {
  const datos = useDatos();
  const hoy = diaDe(useAhora());
  const actual = datos.proyectos.find((p) => p.id === abierto) ?? null;
  const cerrar = useCallback(() => ir("proyectos"), []);

  const nuevo = (grupo?: string) => {
    const p = nuevoProyecto(new Date().toISOString(), grupo ? { estado: grupo as EstadoProyecto } : {});
    crear("proyectos", p);
    ir("proyectos", p.id);
  };

  const columnas: Columna<Proyecto>[] = [
    {
      id: "nombre",
      titulo: "Nombre",
      icono: "texto",
      ancho: 220,
      celda: (p) => p.nombre || <SinTitulo texto="Sin nombre" />,
    },
    {
      id: "estado",
      titulo: "Estado",
      icono: "estado",
      ancho: 170,
      celda: (p) => (
        <Selector
          opciones={ESTADOS_PROYECTO}
          valor={p.estado}
          onCambiar={(estado) => actualizar("proyectos", p.id, { estado })}
          etiqueta="Estado"
        />
      ),
    },
    {
      id: "proximo",
      titulo: "Próximo paso",
      icono: "texto",
      ancho: 240,
      celda: (p) => <span className="line-clamp-2">{p.proximoPaso}</span>,
    },
    {
      id: "fecha",
      titulo: "Fecha",
      icono: "fecha",
      ancho: 120,
      celda: (p) => <FechaConPlazo dia={p.fechaProximo} hoy={hoy} activa={p.estado !== "cerrado"} />,
    },
    { id: "quien", titulo: "Con quién", icono: "persona", ancho: 150, celda: (p) => p.conQuien },
    {
      id: "hitos",
      titulo: "Hitos",
      icono: "lista",
      ancho: 120,
      celda: (p) =>
        p.hitos.length > 0 ? <Avance hechos={p.hitos.filter((h) => h.hecho).length} total={p.hitos.length} /> : null,
    },
  ];

  return (
    <Pagina titulo="Proyectos abiertos" descripcion="Lo que tienes entre manos y su próximo paso.">
      <BaseDeDatos
        clave="proyectos"
        elementos={ordenar(datos.proyectos)}
        columnas={columnas}
        agrupacion={{
          opciones: ESTADOS_PROYECTO,
          grupo: (p) => p.estado,
          mover: (p, estado) => actualizar("proyectos", p.id, { estado: estado as EstadoProyecto }),
          terminadas: ["cerrado"],
        }}
        terminado={(p) => p.estado === "cerrado"}
        textoVerTerminados="Ver cerrados"
        abierto={abierto}
        onAbrir={(id) => ir("proyectos", id)}
        onNuevo={nuevo}
        textoNuevo="Nuevo proyecto"
        textoVacio="Aún no hay proyectos."
        tarjeta={(p) => (
          <>
            {p.proximoPaso && <p className="line-clamp-2 text-tinta">{p.proximoPaso}</p>}
            {(p.fechaProximo || p.conQuien) && (
              <p className="flex flex-wrap gap-x-2">
                <FechaConPlazo dia={p.fechaProximo} hoy={hoy} activa={p.estado !== "cerrado"} />
                {p.conQuien && <span>{p.conQuien}</span>}
              </p>
            )}
            {p.hitos.length > 0 && (
              <Avance hechos={p.hitos.filter((h) => h.hecho).length} total={p.hitos.length} />
            )}
          </>
        )}
      />

      {actual && (
        <Peek
          key={actual.id}
          onCerrar={cerrar}
          onEliminar={() => {
            eliminar("proyectos", actual.id);
            cerrar();
          }}
          textoEliminar={`¿Eliminar el proyecto «${actual.nombre || "sin nombre"}»?`}
        >
          <PanelProyecto p={actual} />
        </Peek>
      )}
    </Pagina>
  );
}

function PanelProyecto({ p }: { p: Proyecto }) {
  const cambiar = (c: Partial<Proyecto>) => actualizar("proyectos", p.id, c);
  return (
    <>
      <TituloPeek valor={p.nombre} onCambiar={(nombre) => cambiar({ nombre })} placeholder="Nombre del proyecto" />
      <Propiedades>
        <Propiedad icono="estado" nombre="Estado">
          <Selector opciones={ESTADOS_PROYECTO} valor={p.estado} onCambiar={(estado) => cambiar({ estado })} etiqueta="Estado" />
        </Propiedad>
        <Propiedad icono="texto" nombre="Próximo paso">
          <AreaTexto
            valor={p.proximoPaso}
            onCambiar={(proximoPaso) => cambiar({ proximoPaso })}
            etiqueta="Próximo paso"
            placeholder="Qué toca hacer ahora"
          />
        </Propiedad>
        <Propiedad icono="fecha" nombre="Para cuándo">
          <CampoFecha valor={p.fechaProximo} onCambiar={(fechaProximo) => cambiar({ fechaProximo })} etiqueta="Fecha del próximo paso" />
        </Propiedad>
        <Propiedad icono="persona" nombre="Con quién">
          <CampoTexto
            valor={p.conQuien}
            onCambiar={(conQuien) => cambiar({ conQuien })}
            etiqueta="Con quién"
            placeholder="Persona o departamento"
          />
        </Propiedad>
        <Propiedad icono="hora" nombre="Creado">
          <span className="block px-1.5 pt-1.5 text-tinta-2">{momentoLegible(p.creado)}</span>
        </Propiedad>
      </Propiedades>

      <BloquePeek titulo="Hitos">
        <ListaHitos hitos={p.hitos} onCambiar={(hitos) => cambiar({ hitos })} />
      </BloquePeek>

      <BloquePeek titulo="Notas">
        <AreaTexto
          valor={p.notas}
          onCambiar={(notas) => cambiar({ notas })}
          etiqueta="Notas"
          placeholder="Escribe aquí…"
          filas={4}
        />
      </BloquePeek>
    </>
  );
}
