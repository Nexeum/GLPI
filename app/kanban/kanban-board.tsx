"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, AlertTriangle } from "lucide-react"
import { actualizarIncidencia } from "@/lib/api/incidencias"
import { useToast } from "@/hooks/use-toast"

// Columnas del tablero Kanban con los pasos específicos
const COLUMNAS = [
  { id: "recepcion", titulo: "Recepción del caso", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "diagnostico", titulo: "Generación de diagnóstico", color: "bg-blue-50 dark:bg-blue-950/30" },
  { id: "desarrollo", titulo: "Desarrollo del ajuste", color: "bg-indigo-50 dark:bg-indigo-950/30" },
  { id: "qa", titulo: "Evidencias y pruebas QA", color: "bg-purple-50 dark:bg-purple-950/30" },
  { id: "envio-correo", titulo: "Envío correo Andina", color: "bg-yellow-50 dark:bg-yellow-950/30" },
  { id: "aprobado-uat", titulo: "Aprobado para UAT", color: "bg-amber-50 dark:bg-amber-950/30" },
  { id: "pruebas-uat", titulo: "Pruebas UAT", color: "bg-orange-50 dark:bg-orange-950/30" },
  { id: "despliegue", titulo: "Despliegue a PROD", color: "bg-green-50 dark:bg-green-950/30" },
]

// Mapeo de estados de incidencias a columnas
const ESTADO_A_COLUMNA = {
  "Recepción del caso": "recepcion",
  "Generación de diagnóstico": "diagnostico",
  "Desarrollo del ajuste": "desarrollo",
  "Evidencias y pruebas QA": "qa",
  "Envío correo Andina": "envio-correo",
  "Aprobado para UAT": "aprobado-uat",
  "Pruebas UAT": "pruebas-uat",
  "Despliegue a PROD": "despliegue",
  // Mantener compatibilidad con estados anteriores
  Abierto: "recepcion",
  "En progreso": "desarrollo",
  "En revisión": "qa",
  Resuelto: "despliegue",
}

// Mapeo de columnas a estados de incidencias
const COLUMNA_A_ESTADO = {
  recepcion: "Recepción del caso",
  diagnostico: "Generación de diagnóstico",
  desarrollo: "Desarrollo del ajuste",
  qa: "Evidencias y pruebas QA",
  "envio-correo": "Envío correo Andina",
  "aprobado-uat": "Aprobado para UAT",
  "pruebas-uat": "Pruebas UAT",
  despliegue: "Despliegue a PROD",
}

export function KanbanBoard({ incidencias }) {
  const { toast } = useToast()
  const [tablero, setTablero] = useState({})
  const [cargando, setCargando] = useState(true)

  // Inicializar el tablero con las incidencias
  useEffect(() => {
    const nuevoTablero = {}

    // Inicializar columnas vacías
    COLUMNAS.forEach((columna) => {
      nuevoTablero[columna.id] = []
    })

    // Distribuir incidencias en columnas según su estado
    incidencias.forEach((incidencia) => {
      const columnaId = ESTADO_A_COLUMNA[incidencia.estado] || "recepcion"
      if (nuevoTablero[columnaId]) {
        nuevoTablero[columnaId].push(incidencia)
      }
    })

    setTablero(nuevoTablero)
    setCargando(false)
  }, [incidencias])

  // Manejar el arrastre de tarjetas
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result

    // Si no hay destino o el destino es el mismo que el origen, no hacer nada
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // Encontrar la incidencia que se está moviendo
    const incidencia = tablero[source.droppableId].find((inc) => inc.id === draggableId)

    if (!incidencia) return

    // Crear nuevo estado del tablero
    const nuevoTablero = { ...tablero }

    // Eliminar de la columna origen
    nuevoTablero[source.droppableId] = nuevoTablero[source.droppableId].filter((inc) => inc.id !== draggableId)

    // Añadir a la columna destino
    nuevoTablero[destination.droppableId] = [
      ...nuevoTablero[destination.droppableId].slice(0, destination.index),
      incidencia,
      ...nuevoTablero[destination.droppableId].slice(destination.index),
    ]

    // Actualizar el estado local inmediatamente para una UI responsiva
    setTablero(nuevoTablero)

    try {
      // Actualizar el estado de la incidencia en la base de datos
      const nuevoEstado = COLUMNA_A_ESTADO[destination.droppableId]

      // Actualizar fechas según el estado
      const actualizacion = {
        estado: nuevoEstado,
      }

      // Actualizar fechas específicas según la columna de destino
      if (destination.droppableId === "diagnostico") {
        actualizacion.fecha_diagnostico = new Date().toISOString()
      } else if (destination.droppableId === "desarrollo") {
        actualizacion.fecha_entrega_desarrollo = new Date().toISOString()
      } else if (destination.droppableId === "qa") {
        actualizacion.fecha_entrega_qa = new Date().toISOString()
      } else if (destination.droppableId === "envio-correo") {
        actualizacion.fecha_envio_correo = new Date().toISOString()
      } else if (destination.droppableId === "aprobado-uat") {
        actualizacion.fecha_aprobado_uat = new Date().toISOString()
      } else if (destination.droppableId === "pruebas-uat") {
        actualizacion.fecha_entrega_uat = new Date().toISOString()
      } else if (destination.droppableId === "despliegue") {
        actualizacion.fecha_solucion = new Date().toISOString()
      }

      await actualizarIncidencia(incidencia.id, actualizacion)

      toast({
        title: "Incidencia actualizada",
        description: `La incidencia ${incidencia.id} ha sido movida a ${nuevoEstado}`,
      })
    } catch (error) {
      console.error("Error al actualizar la incidencia:", error)

      // Revertir cambios en caso de error
      setTablero({ ...tablero })

      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la incidencia",
        variant: "destructive",
      })
    }
  }

  if (cargando) {
    return <div className="flex justify-center p-8">Cargando tablero...</div>
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6">
        {COLUMNAS.map((columna) => (
          <div key={columna.id} className="flex-shrink-0 w-80">
            <div className={`rounded-t-lg p-3 ${columna.color}`}>
              <h3 className="font-medium flex items-center justify-between">
                {columna.titulo}
                <Badge variant="outline" className="ml-2">
                  {tablero[columna.id]?.length || 0}
                </Badge>
              </h3>
            </div>

            <Droppable droppableId={columna.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`min-h-[500px] p-2 rounded-b-lg border-2 ${
                    snapshot.isDraggingOver ? "border-primary/50 bg-primary/5" : "border-transparent"
                  } ${columna.color}`}
                >
                  {tablero[columna.id]?.map((incidencia, index) => (
                    <Draggable key={incidencia.id} draggableId={incidencia.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-3 ${snapshot.isDragging ? "ring-2 ring-primary shadow-lg" : ""}`}
                        >
                          <CardContent className="p-3">
                            <Link
                              href={`/incidencias/${incidencia.id}`}
                              className="block hover:underline font-medium mb-1"
                            >
                              {incidencia.id}
                            </Link>
                            <p className="text-sm line-clamp-2 mb-2">{incidencia.titulo}</p>

                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Badge
                                  variant={
                                    incidencia.prioridad === "CRÍTICA" || incidencia.prioridad === "INDISPONIBILIDAD"
                                      ? "destructive"
                                      : incidencia.prioridad === "ALTA"
                                        ? "warning"
                                        : "outline"
                                  }
                                  className="text-[10px] h-5"
                                >
                                  {incidencia.prioridad}
                                </Badge>
                              </div>

                              {incidencia.ans_estado === "En riesgo" && (
                                <div className="flex items-center text-red-600">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  <span>ANS</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-gray-400" />
                                <span className="text-xs text-gray-500">
                                  {new Date(incidencia.fecha_creacion).toLocaleDateString()}
                                </span>
                              </div>

                              {incidencia.asignado && (
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-[10px]">
                                    {incidencia.asignado
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  )
}
