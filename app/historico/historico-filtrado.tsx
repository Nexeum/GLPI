"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DatePickerWithRange } from "./date-range-picker"
import { Search, FileText, CheckCircle, Clock, FileCode, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, parseISO, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function HistoricoFiltrado({ incidenciasResueltas }) {
  const [filtro, setFiltro] = useState("")
  const [prioridadFiltro, setPrioridadFiltro] = useState("todas")
  const [cumplimientoFiltro, setCumplimientoFiltro] = useState("todos")
  const [propietarioFiltro, setPropietarioFiltro] = useState("todos")
  const [fechaRango, setFechaRango] = useState({ from: undefined, to: undefined })
  const [showFilters, setShowFilters] = useState(false)

  // Filtrar incidencias según los criterios
  const incidenciasFiltradas = incidenciasResueltas.filter((inc) => {
    const matchFiltro =
      inc.titulo?.toLowerCase().includes(filtro.toLowerCase()) ||
      inc.id.toLowerCase().includes(filtro.toLowerCase()) ||
      inc.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
      inc.correo?.toLowerCase().includes(filtro.toLowerCase())

    const matchPrioridad = prioridadFiltro === "todas" || inc.prioridad?.toLowerCase() === prioridadFiltro.toLowerCase()

    const matchCumplimiento =
      cumplimientoFiltro === "todos" ||
      (cumplimientoFiltro === "si" && inc.ans_estado === "En tiempo") ||
      (cumplimientoFiltro === "no" && inc.ans_estado === "En riesgo")

    const matchPropietario = propietarioFiltro === "todos" || inc.propietario === propietarioFiltro

    // Filtro de fecha
    let matchFecha = true
    if (fechaRango.from && fechaRango.to) {
      try {
        const fechaIncidencia = parseISO(inc.fecha_creacion)
        matchFecha = isWithinInterval(fechaIncidencia, {
          start: fechaRango.from,
          end: fechaRango.to,
        })
      } catch (error) {
        console.error("Error al filtrar por fecha:", error)
      }
    }

    return matchFiltro && matchPrioridad && matchCumplimiento && matchPropietario && matchFecha
  })

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "N/A"
    try {
      return format(parseISO(fechaStr), "dd/MM/yyyy", { locale: es })
    } catch (error) {
      return fechaStr
    }
  }

  const calcularTiempoResolucion = (fechaCreacion, fechaSolucion) => {
    if (!fechaCreacion || !fechaSolucion) return "N/A"
    try {
      const inicio = parseISO(fechaCreacion)
      const fin = parseISO(fechaSolucion)
      const diffTime = Math.abs(fin - inicio)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} ${diffDays === 1 ? "día" : "días"}`
    } catch (error) {
      return "N/A"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
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
        <Button variant="outline" className="flex items-center gap-2" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
          <Select value={prioridadFiltro} onValueChange={setPrioridadFiltro}>
            <SelectTrigger>
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

          <Select value={cumplimientoFiltro} onValueChange={setCumplimientoFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Cumplimiento ANS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="si">Cumplió ANS</SelectItem>
              <SelectItem value="no">No cumplió ANS</SelectItem>
            </SelectContent>
          </Select>

          <Select value={propietarioFiltro} onValueChange={setPropietarioFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Propietario" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="Andina">Andina</SelectItem>
              <SelectItem value="Nosotros">Nosotros</SelectItem>
            </SelectContent>
          </Select>

          <DatePickerWithRange date={fechaRango} setDate={setFechaRango} />
        </div>
      )}

      <Tabs defaultValue="todas" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="criticas">Críticas</TabsTrigger>
          <TabsTrigger value="ans-cumplido">ANS Cumplido</TabsTrigger>
          <TabsTrigger value="ans-excedido">ANS Excedido</TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="space-y-4">
          {incidenciasFiltradas.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No se encontraron incidencias que coincidan con los criterios de búsqueda
            </div>
          ) : (
            incidenciasFiltradas.map((incidencia) => (
              <Card key={incidencia.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/incidencias/${incidencia.id}`}
                              className="font-medium text-lg hover:underline"
                            >
                              #{incidencia.id}
                            </Link>
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
                          <h3 className="text-base font-medium mt-1">{incidencia.titulo}</h3>
                        </div>
                        <Badge variant={incidencia.estado === "Resuelto" ? "success" : "destructive"}>
                          {incidencia.estado}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Fechas</span>
                          <div className="text-sm">
                            <div>Creado: {formatearFecha(incidencia.fecha_creacion)}</div>
                            <div>Resuelto: {formatearFecha(incidencia.fecha_solucion)}</div>
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Propietario</span>
                          <Badge
                            variant={incidencia.propietario === "Andina" ? "outline" : "secondary"}
                            className="w-fit mt-1"
                          >
                            {incidencia.propietario || "Sin asignar"}
                          </Badge>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Tiempo de resolución</span>
                          <div className="flex items-center gap-1 text-sm mt-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {calcularTiempoResolucion(incidencia.fecha_creacion, incidencia.fecha_solucion)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col justify-between items-center p-4 bg-muted/30 border-t md:border-t-0 md:border-l">
                      <div
                        className={`flex items-center gap-1 text-sm ${
                          incidencia.ans_estado === "En tiempo"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {incidencia.ans_estado === "En tiempo" ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                        <span>{incidencia.ans_estado === "En tiempo" ? "Cumplió ANS" : "Excedió ANS"}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        {incidencia.tiene_script && (
                          <Button variant="ghost" size="sm">
                            <FileCode className="h-4 w-4" />
                            <span className="sr-only">Ver script</span>
                          </Button>
                        )}
                        <Link href={`/incidencias/${incidencia.id}`}>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>Ver detalles</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="criticas" className="space-y-4">
          {incidenciasFiltradas.filter((inc) => inc.prioridad === "Crítica" || inc.prioridad === "Indisponible")
            .length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">No se encontraron incidencias críticas</div>
          ) : (
            incidenciasFiltradas
              .filter((inc) => inc.prioridad === "Crítica" || inc.prioridad === "Indisponible")
              .map((incidencia) => (
                <Card key={incidencia.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {/* Mismo contenido que en "todas" */}
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/incidencias/${incidencia.id}`}
                                className="font-medium text-lg hover:underline"
                              >
                                #{incidencia.id}
                              </Link>
                              <Badge variant="destructive">{incidencia.prioridad}</Badge>
                            </div>
                            <h3 className="text-base font-medium mt-1">{incidencia.titulo}</h3>
                          </div>
                          <Badge variant={incidencia.estado === "Resuelto" ? "success" : "destructive"}>
                            {incidencia.estado}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Fechas</span>
                            <div className="text-sm">
                              <div>Creado: {formatearFecha(incidencia.fecha_creacion)}</div>
                              <div>Resuelto: {formatearFecha(incidencia.fecha_solucion)}</div>
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Propietario</span>
                            <Badge
                              variant={incidencia.propietario === "Andina" ? "outline" : "secondary"}
                              className="w-fit mt-1"
                            >
                              {incidencia.propietario || "Sin asignar"}
                            </Badge>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Tiempo de resolución</span>
                            <div className="flex items-center gap-1 text-sm mt-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {calcularTiempoResolucion(incidencia.fecha_creacion, incidencia.fecha_solucion)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col justify-between items-center p-4 bg-muted/30 border-t md:border-t-0 md:border-l">
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            incidencia.ans_estado === "En tiempo"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {incidencia.ans_estado === "En tiempo" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                          <span>{incidencia.ans_estado === "En tiempo" ? "Cumplió ANS" : "Excedió ANS"}</span>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          {incidencia.tiene_script && (
                            <Button variant="ghost" size="sm">
                              <FileCode className="h-4 w-4" />
                              <span className="sr-only">Ver script</span>
                            </Button>
                          )}
                          <Link href={`/incidencias/${incidencia.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Ver detalles</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="ans-cumplido" className="space-y-4">
          {incidenciasFiltradas.filter((inc) => inc.ans_estado === "En tiempo").length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No se encontraron incidencias que hayan cumplido el ANS
            </div>
          ) : (
            incidenciasFiltradas
              .filter((inc) => inc.ans_estado === "En tiempo")
              .map((incidencia) => (
                <Card key={incidencia.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {/* Mismo contenido que en "todas" */}
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/incidencias/${incidencia.id}`}
                                className="font-medium text-lg hover:underline"
                              >
                                #{incidencia.id}
                              </Link>
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
                            <h3 className="text-base font-medium mt-1">{incidencia.titulo}</h3>
                          </div>
                          <Badge variant="success">{incidencia.estado}</Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Fechas</span>
                            <div className="text-sm">
                              <div>Creado: {formatearFecha(incidencia.fecha_creacion)}</div>
                              <div>Resuelto: {formatearFecha(incidencia.fecha_solucion)}</div>
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Propietario</span>
                            <Badge
                              variant={incidencia.propietario === "Andina" ? "outline" : "secondary"}
                              className="w-fit mt-1"
                            >
                              {incidencia.propietario || "Sin asignar"}
                            </Badge>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Tiempo de resolución</span>
                            <div className="flex items-center gap-1 text-sm mt-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {calcularTiempoResolucion(incidencia.fecha_creacion, incidencia.fecha_solucion)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col justify-between items-center p-4 bg-muted/30 border-t md:border-t-0 md:border-l">
                        <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                          <CheckCircle className="h-4 w-4" />
                          <span>Cumplió ANS</span>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          {incidencia.tiene_script && (
                            <Button variant="ghost" size="sm">
                              <FileCode className="h-4 w-4" />
                              <span className="sr-only">Ver script</span>
                            </Button>
                          )}
                          <Link href={`/incidencias/${incidencia.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Ver detalles</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>

        <TabsContent value="ans-excedido" className="space-y-4">
          {incidenciasFiltradas.filter((inc) => inc.ans_estado !== "En tiempo").length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No se encontraron incidencias que hayan excedido el ANS
            </div>
          ) : (
            incidenciasFiltradas
              .filter((inc) => inc.ans_estado !== "En tiempo")
              .map((incidencia) => (
                <Card key={incidencia.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  {/* Mismo contenido que en "todas" */}
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/incidencias/${incidencia.id}`}
                                className="font-medium text-lg hover:underline"
                              >
                                #{incidencia.id}
                              </Link>
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
                            <h3 className="text-base font-medium mt-1">{incidencia.titulo}</h3>
                          </div>
                          <Badge variant={incidencia.estado === "Resuelto" ? "success" : "destructive"}>
                            {incidencia.estado}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Fechas</span>
                            <div className="text-sm">
                              <div>Creado: {formatearFecha(incidencia.fecha_creacion)}</div>
                              <div>Resuelto: {formatearFecha(incidencia.fecha_solucion)}</div>
                            </div>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Propietario</span>
                            <Badge
                              variant={incidencia.propietario === "Andina" ? "outline" : "secondary"}
                              className="w-fit mt-1"
                            >
                              {incidencia.propietario || "Sin asignar"}
                            </Badge>
                          </div>

                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Tiempo de resolución</span>
                            <div className="flex items-center gap-1 text-sm mt-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {calcularTiempoResolucion(incidencia.fecha_creacion, incidencia.fecha_solucion)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col justify-between items-center p-4 bg-muted/30 border-t md:border-t-0 md:border-l">
                        <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                          <Clock className="h-4 w-4" />
                          <span>Excedió ANS</span>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          {incidencia.tiene_script && (
                            <Button variant="ghost" size="sm">
                              <FileCode className="h-4 w-4" />
                              <span className="sr-only">Ver script</span>
                            </Button>
                          )}
                          <Link href={`/incidencias/${incidencia.id}`}>
                            <Button variant="outline" size="sm" className="flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              <span>Ver detalles</span>
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
