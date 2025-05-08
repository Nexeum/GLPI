"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Incidencia } from "@/lib/types/incidencias"
import { incidenciaEnRiesgo, incidenciaIncumplida } from "@/lib/utils/ans-calculator"
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react"
import Link from "next/link"

interface IncidenciasFiltradas {
  incidenciasActivas?: Incidencia[]
  incidenciasResueltas?: Incidencia[]
}

export function IncidenciasFiltradas({ incidenciasActivas = [], incidenciasResueltas = [] }: IncidenciasFiltradas) {
  const searchParams = useSearchParams()
  const [incidencias, setIncidencias] = useState<Incidencia[]>([...incidenciasActivas, ...incidenciasResueltas])
  const [filteredIncidencias, setFilteredIncidencias] = useState<Incidencia[]>(incidencias)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("todas")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    prioridad: "",
    estado: "",
    modulo: "",
    asignado: "",
  })

  // Aplicar filtros cuando cambian
  useEffect(() => {
    let filtered = [...incidencias]

    // Filtrar por tab activo
    if (activeTab === "pendientes") {
      filtered = filtered.filter((inc) => inc.estado !== "Resuelto")
    } else if (activeTab === "resueltas") {
      filtered = filtered.filter((inc) => inc.estado === "Resuelto")
    } else if (activeTab === "riesgo") {
      filtered = filtered.filter((inc) => incidenciaEnRiesgo(inc) || incidenciaIncumplida(inc))
    }

    // Aplicar filtros adicionales
    if (filters.prioridad) {
      filtered = filtered.filter((inc) => inc.prioridad === filters.prioridad)
    }
    if (filters.estado) {
      filtered = filtered.filter((inc) => inc.estado === filters.estado)
    }
    if (filters.modulo) {
      filtered = filtered.filter((inc) => inc.modulo === filters.modulo)
    }
    if (filters.asignado) {
      filtered = filtered.filter((inc) => inc.asignadoA === filters.asignado)
    }

    // Aplicar búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (inc) =>
          inc.titulo.toLowerCase().includes(term) ||
          (inc.descripcion && inc.descripcion.toLowerCase().includes(term)) ||
          inc.id.toString().includes(term),
      )
    }

    setFilteredIncidencias(filtered)
  }, [incidencias, activeTab, searchTerm, filters])

  // Opciones para los filtros
  const prioridadOptions = ["Alta", "Media", "Baja"]
  const estadoOptions = ["Nuevo", "En Progreso", "Pendiente", "Resuelto"]
  const moduloOptions = ["Ventas", "Compras", "Inventario", "Contabilidad", "RRHH"]
  const asignadoOptions = ["Ana García", "Carlos López", "María Rodríguez", "Juan Pérez"]

  // Limpiar todos los filtros
  const limpiarFiltros = () => {
    setFilters({
      prioridad: "",
      estado: "",
      modulo: "",
      asignado: "",
    })
    setSearchTerm("")
  }

  // Renderizar skeleton loader
  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Card key={i} className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 w-full">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar incidencias..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className={showFilters ? "bg-accent" : ""}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtros
            {Object.values(filters).some((f) => f) && (
              <Badge variant="secondary" className="ml-2 px-1 py-0 h-5">
                {Object.values(filters).filter((f) => f).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Filtros</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={limpiarFiltros}
                disabled={!Object.values(filters).some((f) => f)}
              >
                Limpiar filtros
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Prioridad</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.prioridad || "Seleccionar"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {prioridadOptions.map((option) => (
                      <DropdownMenuItem key={option} onClick={() => setFilters({ ...filters, prioridad: option })}>
                        {option}
                      </DropdownMenuItem>
                    ))}
                    {filters.prioridad && (
                      <DropdownMenuItem
                        onClick={() => setFilters({ ...filters, prioridad: "" })}
                        className="text-destructive"
                      >
                        Limpiar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Estado</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.estado || "Seleccionar"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {estadoOptions.map((option) => (
                      <DropdownMenuItem key={option} onClick={() => setFilters({ ...filters, estado: option })}>
                        {option}
                      </DropdownMenuItem>
                    ))}
                    {filters.estado && (
                      <DropdownMenuItem
                        onClick={() => setFilters({ ...filters, estado: "" })}
                        className="text-destructive"
                      >
                        Limpiar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Módulo</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.modulo || "Seleccionar"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {moduloOptions.map((option) => (
                      <DropdownMenuItem key={option} onClick={() => setFilters({ ...filters, modulo: option })}>
                        {option}
                      </DropdownMenuItem>
                    ))}
                    {filters.modulo && (
                      <DropdownMenuItem
                        onClick={() => setFilters({ ...filters, modulo: "" })}
                        className="text-destructive"
                      >
                        Limpiar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Asignado a</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between">
                      {filters.asignado || "Seleccionar"}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    {asignadoOptions.map((option) => (
                      <DropdownMenuItem key={option} onClick={() => setFilters({ ...filters, asignado: option })}>
                        {option}
                      </DropdownMenuItem>
                    ))}
                    {filters.asignado && (
                      <DropdownMenuItem
                        onClick={() => setFilters({ ...filters, asignado: "" })}
                        className="text-destructive"
                      >
                        Limpiar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="todas" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="resueltas">
            Resueltas
            {incidencias.filter((inc) => inc.estado === "Resuelto").length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {incidencias.filter((inc) => inc.estado === "Resuelto").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="riesgo">
            En Riesgo
            {incidencias.filter((inc) => incidenciaEnRiesgo(inc) || incidenciaIncumplida(inc)).length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {incidencias.filter((inc) => incidenciaEnRiesgo(inc) || incidenciaIncumplida(inc)).length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          <ScrollArea className="h-[calc(100vh-280px)]">
            {isLoading ? (
              renderSkeletons()
            ) : filteredIncidencias.length > 0 ? (
              filteredIncidencias.map((incidencia) => (
                <Link href={`/incidencias/${incidencia.id}`} key={incidencia.id} className="block mb-4">
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="font-medium">#{incidencia.id}</div>
                          <CardTitle className="text-lg">{incidencia.titulo}</CardTitle>
                        </div>
                        <Badge
                          variant={
                            incidencia.prioridad === "Alta"
                              ? "destructive"
                              : incidencia.prioridad === "Media"
                                ? "default"
                                : "outline"
                          }
                        >
                          {incidencia.prioridad}
                        </Badge>
                      </div>
                      <CardDescription>
                        {incidencia.fecha_creacion && new Date(incidencia.fecha_creacion).toLocaleDateString()}
                        {incidencia.modulo && ` • ${incidencia.modulo}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div>
                          <Badge variant="outline" className="mr-2">
                            {incidencia.estado}
                          </Badge>
                          {incidencia.tiempo_restante && (
                            <span className="text-sm text-muted-foreground">{incidencia.tiempo_restante}</span>
                          )}
                        </div>
                        {incidencia.asignado && (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                              {incidencia.asignado.charAt(0)}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No se encontraron incidencias</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  )
}
