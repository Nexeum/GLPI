"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Wand2 } from "lucide-react"

// Usuarios disponibles para asignación
const USUARIOS_ASIGNABLES = [
  {
    id: "u1",
    nombre: "Ana Gómez",
    correo: "AG45678@andinavidaseguros.com.co",
    rol: "Desarrollador",
    especialidades: ["Frontend", "UI/UX"],
    cargaActual: 3,
    modulos: ["Cotizacion", "Emision"],
  },
  {
    id: "u2",
    nombre: "Juan Pérez",
    correo: "JP12345@andinavidaseguros.com.co",
    rol: "Desarrollador Senior",
    especialidades: ["Backend", "Base de datos"],
    cargaActual: 5,
    modulos: ["Recaudo", "Facturación"],
  },
  {
    id: "u3",
    nombre: "María López",
    correo: "ML56789@andinavidaseguros.com.co",
    rol: "QA",
    especialidades: ["Testing", "Automatización"],
    cargaActual: 2,
    modulos: ["Siniestros", "Reserva"],
  },
  {
    id: "u4",
    nombre: "Pedro Sánchez",
    correo: "PS98765@andinavidaseguros.com.co",
    rol: "Analista",
    especialidades: ["Análisis", "Documentación"],
    cargaActual: 4,
    modulos: ["OBP", "Novedades"],
  },
  {
    id: "u5",
    nombre: "Carlos Ramírez",
    correo: "CR24680@andinavidaseguros.com.co",
    rol: "Desarrollador",
    especialidades: ["Backend", "Integración"],
    cargaActual: 1,
    modulos: ["Cotizacion", "Siniestros"],
  },
]

// Reglas de asignación
const REGLAS_ASIGNACION = [
  {
    id: "r1",
    nombre: "Por módulo",
    descripcion: "Asigna según el módulo de la incidencia",
    activa: true,
  },
  {
    id: "r2",
    nombre: "Por carga de trabajo",
    descripcion: "Asigna al usuario con menor carga de trabajo",
    activa: true,
  },
  {
    id: "r3",
    nombre: "Por prioridad",
    descripcion: "Asigna incidencias críticas a desarrolladores senior",
    activa: true,
  },
  {
    id: "r4",
    nombre: "Por tipo de incidencia",
    descripcion: "Asigna según el tipo de incidencia",
    activa: false,
  },
]

interface AsignacionAutomaticaProps {
  incidencia: any
  onAsignar: (usuarioId: string) => Promise<void>
}

export function AsignacionAutomatica({ incidencia, onAsignar }: AsignacionAutomaticaProps) {
  const [asignando, setAsignando] = useState(false)
  const [usuarioRecomendado, setUsuarioRecomendado] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Calcular puntuación de cada usuario para esta incidencia
  const calcularPuntuaciones = () => {
    const puntuaciones = USUARIOS_ASIGNABLES.map((usuario) => {
      let puntos = 0

      // Regla 1: Por módulo
      if (incidencia.modulo && usuario.modulos.includes(incidencia.modulo)) {
        puntos += 30
      }

      // Regla 2: Por carga de trabajo (inverso)
      puntos += (10 - usuario.cargaActual) * 5

      // Regla 3: Por prioridad
      if (
        (incidencia.prioridad === "CRÍTICA" || incidencia.prioridad === "INDISPONIBILIDAD") &&
        usuario.rol.includes("Senior")
      ) {
        puntos += 25
      }

      // Regla 4: Por tipo de incidencia
      if (incidencia.tipo_solicitud === "Incidencia" && usuario.rol === "Desarrollador") {
        puntos += 15
      } else if (incidencia.tipo_solicitud === "Requerimiento" && usuario.rol === "Analista") {
        puntos += 20
      }

      return {
        usuario,
        puntos,
      }
    })

    // Ordenar por puntuación (mayor a menor)
    return puntuaciones.sort((a, b) => b.puntos - a.puntos)
  }

  // Realizar asignación automática
  const realizarAsignacionAutomatica = async () => {
    setAsignando(true)

    try {
      const puntuaciones = calcularPuntuaciones()
      const mejorUsuario = puntuaciones[0].usuario

      setUsuarioRecomendado(mejorUsuario)

      // Simular un pequeño retraso para mostrar el proceso
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Error en asignación automática:", error)
    } finally {
      setAsignando(false)
    }
  }

  // Confirmar asignación
  const confirmarAsignacion = async (usuarioId) => {
    try {
      await onAsignar(usuarioId)
      setDialogOpen(false)
    } catch (error) {
      console.error("Error al asignar:", error)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wand2 className="h-4 w-4" />
          Asignación automática
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Asignación automática de incidencia</DialogTitle>
          <DialogDescription>
            El sistema asignará automáticamente esta incidencia según las reglas configuradas
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="recomendacion">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="recomendacion">Recomendación</TabsTrigger>
            <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
            <TabsTrigger value="reglas">Reglas</TabsTrigger>
          </TabsList>

          <TabsContent value="recomendacion" className="space-y-4">
            {!usuarioRecomendado ? (
              <div className="text-center p-8">
                <Button onClick={realizarAsignacionAutomatica} disabled={asignando} className="mx-auto">
                  {asignando ? "Calculando..." : "Calcular asignación óptima"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-green-50 dark:bg-green-900/20">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-1">Usuario recomendado</h4>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {usuarioRecomendado.nombre
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{usuarioRecomendado.nombre}</div>
                      <div className="text-sm text-gray-500">{usuarioRecomendado.rol}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">Carga actual: {usuarioRecomendado.cargaActual}</Badge>
                      <Badge variant="outline">Módulos: {usuarioRecomendado.modulos.join(", ")}</Badge>
                    </div>
                    <div>Especialidades: {usuarioRecomendado.especialidades.join(", ")}</div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setUsuarioRecomendado(null)}>
                    Recalcular
                  </Button>
                  <Button onClick={() => confirmarAsignacion(usuarioRecomendado.id)}>Confirmar asignación</Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="usuarios">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {USUARIOS_ASIGNABLES.map((usuario) => (
                  <div key={usuario.id} className="p-3 border rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {usuario.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{usuario.nombre}</div>
                        <div className="text-sm text-gray-500">{usuario.rol}</div>
                        <div className="text-xs text-gray-500 mt-1">Módulos: {usuario.modulos.join(", ")}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={usuario.cargaActual > 4 ? "destructive" : "outline"}>
                        {usuario.cargaActual} incidencias
                      </Badge>
                      <Button size="sm" onClick={() => confirmarAsignacion(usuario.id)}>
                        Asignar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="reglas">
            <div className="space-y-3">
              {REGLAS_ASIGNACION.map((regla) => (
                <div key={regla.id} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{regla.nombre}</div>
                    <Badge variant={regla.activa ? "success" : "outline"}>{regla.activa ? "Activa" : "Inactiva"}</Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">{regla.descripcion}</div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
