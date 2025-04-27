"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Activity, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

// Tipo para los cambios
export type CambioIncidencia = {
  id: string
  fecha: string
  usuario: {
    nombre: string
    correo: string
  }
  tipo: "estado" | "prioridad" | "asignacion" | "comentario" | "adjunto" | "otro"
  campo?: string
  valorAnterior?: string
  valorNuevo?: string
  descripcion: string
}

interface HistorialCambiosProps {
  cambios: CambioIncidencia[]
  className?: string
}

export function HistorialCambios({ cambios, className = "" }: HistorialCambiosProps) {
  const [mostrarTodo, setMostrarTodo] = useState(false)

  // Ordenar cambios por fecha (más reciente primero)
  const cambiosOrdenados = [...cambios].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  // Limitar la cantidad de cambios mostrados si no se muestra todo
  const cambiosMostrados = mostrarTodo ? cambiosOrdenados : cambiosOrdenados.slice(0, 5)

  // Formatear fecha
  const formatearFecha = (fechaStr: string) => {
    try {
      const fecha = new Date(fechaStr)
      return format(fecha, "dd MMM yyyy, HH:mm", { locale: es })
    } catch (error) {
      return fechaStr
    }
  }

  // Obtener color según el tipo de cambio
  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case "estado":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "prioridad":
        return "bg-red-100 text-red-800 border-red-200"
      case "asignacion":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "comentario":
        return "bg-green-100 text-green-800 border-green-200"
      case "adjunto":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Historial de cambios
        </h3>
        {cambios.length > 5 && (
          <Button variant="ghost" size="sm" onClick={() => setMostrarTodo(!mostrarTodo)} className="text-xs">
            {mostrarTodo ? (
              <>
                <ChevronUp className="mr-1 h-3 w-3" />
                Mostrar menos
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-3 w-3" />
                Ver todo ({cambios.length})
              </>
            )}
          </Button>
        )}
      </div>

      <ScrollArea className={mostrarTodo ? "h-[400px]" : "max-h-[400px]"}>
        <div className="space-y-3">
          {cambiosMostrados.map((cambio) => (
            <div key={cambio.id} className="flex gap-3 p-3 border rounded-md bg-white dark:bg-gray-900">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {cambio.usuario.nombre
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{cambio.usuario.nombre}</div>
                  <div className="text-xs text-gray-500">{formatearFecha(cambio.fecha)}</div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`border ${getColorTipo(cambio.tipo)}`}>
                    {cambio.tipo.charAt(0).toUpperCase() + cambio.tipo.slice(1)}
                  </Badge>

                  {cambio.campo && <span className="text-xs text-gray-500">Campo: {cambio.campo}</span>}
                </div>

                <div className="mt-2 text-sm">{cambio.descripcion}</div>

                {(cambio.valorAnterior || cambio.valorNuevo) && (
                  <div className="mt-2 text-xs border-t pt-2">
                    {cambio.valorAnterior && (
                      <div className="text-gray-500">
                        Anterior: <span className="font-medium">{cambio.valorAnterior}</span>
                      </div>
                    )}
                    {cambio.valorNuevo && (
                      <div className="text-gray-500">
                        Nuevo: <span className="font-medium">{cambio.valorNuevo}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {cambios.length === 0 && <div className="text-center p-4 text-gray-500">No hay cambios registrados</div>}
        </div>
      </ScrollArea>
    </div>
  )
}
