"use client"

import { useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DatePickerWithRange } from "./date-range-picker"
import { Search, FileText, CheckCircle, Clock, FileCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, parseISO, isWithinInterval } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import type { Incidencia } from "@/lib/types/incidencias"

interface HistoricoFiltradoProps {
  incidenciasResueltas: Incidencia[];
}

export function HistoricoFiltrado({ incidenciasResueltas }: HistoricoFiltradoProps) {
  const [filtro, setFiltro] = useState("")
  const [prioridadFiltro, setPrioridadFiltro] = useState("todas")
  const [cumplimientoFiltro, setCumplimientoFiltro] = useState("todos")
  const [propietarioFiltro, setPropietarioFiltro] = useState("todos")
  const [fechaRango, setFechaRango] = useState<DateRange | undefined>(undefined)

  const incidenciasFiltradas = incidenciasResueltas.filter((inc: Incidencia) => {
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
    if (fechaRango?.from && fechaRango?.to) {
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

  const formatearFecha = (fechaStr: string | undefined): string => {
    if (!fechaStr) return "N/A"
    try {
      return format(parseISO(fechaStr), "dd/MM/yyyy", { locale: es })
    } catch (error) {
      return fechaStr
    }
  }

  const calcularTiempoResolucion = (fechaCreacion: string | undefined, fechaSolucion: string | undefined): string => {
    if (!fechaCreacion || !fechaSolucion) return "N/A"
    try {
      const inicio = parseISO(fechaCreacion)
      const fin = parseISO(fechaSolucion)
      // Convert dates to timestamp numbers to perform arithmetic
      const diffTime = Math.abs(Number(fin) - Number(inicio))
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return `${diffDays} ${diffDays === 1 ? "día" : "días"}`
    } catch (error) {
      return "N/A"
    }
  }

  // Custom type for badge variants
  type BadgeVariant = "default" | "destructive" | "outline" | "secondary";

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

            <Select value={cumplimientoFiltro} onValueChange={setCumplimientoFiltro}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Cumplimiento ANS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="si">Cumplió ANS</SelectItem>
                <SelectItem value="no">No cumplió ANS</SelectItem>
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

            <DatePickerWithRange date={fechaRango} setDateAction={setFechaRango} />
          </div>
        </div>

        <div className="rounded-md border">
          <div className="grid grid-cols-12 gap-2 border-b px-4 py-3 font-medium">
            <div className="col-span-3">ID / Título</div>
            <div className="col-span-2">Fechas</div>
            <div className="col-span-1">Prioridad</div>
            <div className="col-span-1">Estado</div>
            <div className="col-span-1">Propietario</div>
            <div className="col-span-2">Tiempo resolución</div>
            <div className="col-span-1">ANS</div>
            <div className="col-span-1">Acciones</div>
          </div>

          {incidenciasFiltradas.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No se encontraron incidencias que coincidan con los criterios de búsqueda
              </div>
          ) : (
              incidenciasFiltradas.map((incidencia: Incidencia) => {
                // Determine badge variant based on priority
                let prioridadVariant: BadgeVariant = "outline";
                if (incidencia.prioridad === "Crítica" || incidencia.prioridad === "Indisponible") {
                  prioridadVariant = "destructive";
                } else if (incidencia.prioridad === "Media") {
                  // Use outline instead of "warning" since it's not in available variants
                  prioridadVariant = "secondary";
                }

                return (
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

                      <div className="col-span-2 flex items-center">
                        <div className="text-sm">
                          <div>Creado: {formatearFecha(incidencia.fecha_creacion)}</div>
                          <div>Resuelto: {formatearFecha(incidencia.fecha_solucion)}</div>
                        </div>
                      </div>

                      <div className="col-span-1 flex items-center">
                        <Badge variant={prioridadVariant}>
                          {incidencia.prioridad}
                        </Badge>
                      </div>

                      <div className="col-span-1 flex items-center">
                        <Badge variant={incidencia.estado === "Resuelto" ? "secondary" : "destructive"}>
                          {incidencia.estado}
                        </Badge>
                      </div>

                      <div className="col-span-1 flex items-center">
                        <Badge variant={incidencia.propietario === "Andina" ? "outline" : "secondary"}>
                          {incidencia.propietario || "Sin asignar"}
                        </Badge>
                      </div>

                      <div className="col-span-2 flex items-center">
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{calcularTiempoResolucion(incidencia.fecha_creacion, incidencia.fecha_solucion)}</span>
                        </div>
                      </div>

                      <div className="col-span-1 flex items-center">
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
                          <span>{incidencia.ans_estado === "En tiempo" ? "Cumplió" : "Excedió"}</span>
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
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Ver detalles</span>
                          </Button>
                        </Link>
                      </div>
                    </div>
                );
              })
          )}
        </div>
      </>
  )
}