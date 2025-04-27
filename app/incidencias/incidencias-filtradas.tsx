"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, AlertTriangle, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Incidencia } from "@/lib/api/incidencias"

interface IncidenciasFiltradas {
  incidenciasActivas: Incidencia[]
  incidenciasResueltas: Incidencia[]
}

export function IncidenciasFiltradas({ incidenciasActivas, incidenciasResueltas }: IncidenciasFiltradas) {
  const [filtro, setFiltro] = useState("")
  const [estadoFiltro, setEstadoFiltro] = useState("todos")
  const [prioridadFiltro, setPrioridadFiltro] = useState("todas")
  const [ansFiltro, setAnsFiltro] = useState("todos")
  const [propietarioFiltro, setPropietarioFiltro] = useState("todos")

  // Filtrar incidencias según los criterios
  const incidenciasActivasFiltradas = incidenciasActivas.filter((inc) => {
    const matchFiltro =
      inc.titulo?.toLowerCase().includes(filtro.toLowerCase()) ||
      inc.id.toLowerCase().includes(filtro.toLowerCase()) ||
      inc.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
      inc.correo?.toLowerCase().includes(filtro.toLowerCase())

    const matchEstado = estadoFiltro === "todos" || inc.estado.toLowerCase() === estadoFiltro.toLowerCase()
    const matchPrioridad = prioridadFiltro === "todas" || inc.prioridad?.toLowerCase() === prioridadFiltro.toLowerCase()
    const matchAns =
      ansFiltro === "todos" ||
      (ansFiltro === "en-riesgo" && inc.ans_estado === "En riesgo") ||
      (ansFiltro === "en-tiempo" && inc.ans_estado === "En tiempo")
    const matchPropietario = propietarioFiltro === "todos" || inc.propietario === propietarioFiltro

    return matchFiltro && matchEstado && matchPrioridad && matchAns && matchPropietario
  })

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por ID, título, nombre o correo..."
            className="pl-8"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={estadoFiltro} onValueChange={setEstadoFiltro}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los estados</SelectItem>
              <SelectItem value="abierto">Abierto</SelectItem>
              <SelectItem value="en progreso">En progreso</SelectItem>
              <SelectItem value="resuelto">Resuelto</SelectItem>
              <SelectItem value="devuelto/cancelado">Devuelto/Cancelado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={prioridadFiltro} onValueChange={setPrioridadFiltro}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las prioridades</SelectItem>
              <SelectItem value="baja">Baja</SelectItem>
              <SelectItem value="media">Media</SelectItem>
              <SelectItem value="crítica">Crítica</SelectItem>
              <SelectItem value="indisponible">Indisponible</SelectItem>
            </SelectContent>
          </Select>

          <Select value={ansFiltro} onValueChange={setAnsFiltro}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Estado ANS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="en-riesgo">En riesgo</SelectItem>
              <SelectItem value="en-tiempo">En tiempo</SelectItem>
            </SelectContent>
          </Select>

          <Select value={propietarioFiltro} onValueChange={setPropietarioFiltro}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Propietario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Andina">Andina</SelectItem>
              <SelectItem value="Nosotros">Nosotros</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="activas" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="activas">Activas ({incidenciasActivas.length})</TabsTrigger>
          <TabsTrigger value="resueltas">Resueltas ({incidenciasResueltas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="activas" className="space-y-4">
          {incidenciasActivasFiltradas.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No se encontraron incidencias que coincidan con los criterios de búsqueda
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-2 border-b px-4 py-3 font-medium">
                <div className="col-span-3">ID / Título</div>
                <div className="col-span-2">Solicitante</div>
                <div className="col-span-1">Prioridad</div>
                <div className="col-span-2">Estado</div>
                <div className="col-span-1">Propietario</div>
                <div className="col-span-1">ANS</div>
                <div className="col-span-1">Azure/GLPI</div>
                <div className="col-span-1">Acciones</div>
              </div>

              {incidenciasActivasFiltradas.map((incidencia) => (
                <div
                  key={incidencia.id}
                  className="grid grid-cols-12 gap-2 border-b px-4 py-3 last:border-b-0 hover:bg-muted/50"
                >
                  <div className="col-span-3">
                    <div className="font-medium">
                      <Link href={`/incidencias/${incidencia.id}`} className="hover:underline">
                        {incidencia.id}
                      </Link>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">{incidencia.titulo}</div>
                  </div>

                  <div className="col-span-2 flex flex-col justify-center">
                    <div className="truncate text-sm font-medium">{incidencia.nombre || "Sin asignar"}</div>
                    <div className="truncate text-xs text-muted-foreground">{incidencia.correo || "Sin correo"}</div>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <Badge
                      variant={
                        incidencia.prioridad === "Crítica" || incidencia.prioridad === "Indisponible"
                          ? "destructive"
                          : incidencia.prioridad === "Media"
                            ? "warning"
                            : "outline"
                      }
                    >
                      {incidencia.prioridad}
                    </Badge>
                  </div>

                  <div className="col-span-2 flex items-center">
                    <Badge
                      variant={
                        incidencia.estado === "Abierto"
                          ? "outline"
                          : incidencia.estado === "En progreso"
                            ? "secondary"
                            : incidencia.estado === "Resuelto"
                              ? "success"
                              : "destructive"
                      }
                    >
                      {incidencia.estado}
                    </Badge>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <Badge variant={incidencia.propietario === "Andina" ? "outline" : "secondary"}>
                      {incidencia.propietario || "Sin asignar"}
                    </Badge>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <div
                      className={`flex items-center gap-1 text-sm ${
                        incidencia.ans_estado === "En riesgo"
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {incidencia.ans_estado === "En riesgo" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                      <span>{incidencia.tiempo_restante || "N/A"}</span>
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center">
                    <div className="text-sm">
                      {incidencia.azure && <div>Azure: {incidencia.azure}</div>}
                      {incidencia.glpi && <div>GLPI: {incidencia.glpi}</div>}
                    </div>
                  </div>

                  <div className="col-span-1 flex items-center justify-end gap-2">
                    {incidencia.tiene_script && (
                      <Button variant="ghost" size="sm">
                        <FileCode className="h-4 w-4" />
                        <span className="sr-only">Ver script</span>
                      </Button>
                    )}
                    <Link href={`/incidencias/${incidencia.id}`}>
                      <Button variant="outline" size="sm">
                        Detalles
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="resueltas">
          <div className="text-center p-8 text-muted-foreground">
            Las incidencias resueltas se pueden consultar en la sección de histórico
          </div>
        </TabsContent>
      </Tabs>
    </>
  )
}
