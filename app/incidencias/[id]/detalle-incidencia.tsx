"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Save, FileCode, Edit, MessageSquare, Paperclip, History, ArrowLeft } from "lucide-react"
import { actualizarIncidencia } from "@/lib/api/incidencias"
import { crearComentario } from "@/lib/api/comentarios"
import { Timeline } from "@/components/incidencias/timeline"
import { CountdownTimer } from "@/components/incidencias/countdown-timer"
import { MODULOS } from "@/lib/types/incidencias"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Etiquetas, type Etiqueta } from "@/components/incidencias/etiquetas"
import { HistorialCambios, type CambioIncidencia } from "@/components/incidencias/historial-cambios"
import { ComentarioConMenciones } from "@/components/incidencias/comentario-con-menciones"
import { AsignacionAutomatica } from "@/components/incidencias/asignacion-automatica"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { cn } from "@/lib/utils"

export function DetalleIncidencia({ incidencia, comentarios: comentariosIniciales, adjuntos }) {
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({ ...incidencia })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("detalles")
  const [comentarios, setComentarios] = useState(comentariosIniciales || [])
  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([])

  // Historial de cambios (vacío inicialmente)
  const [historialCambios, setHistorialCambios] = useState<CambioIncidencia[]>([])

  useEffect(() => {
    setFormData({ ...incidencia })
  }, [incidencia])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  const handleToggleEdit = () => {
    setEditMode(!editMode)
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await actualizarIncidencia(incidencia.id, formData)
      setEditMode(false)

      // Añadir al historial de cambios
      const nuevoCambio: CambioIncidencia = {
        id: `c${historialCambios.length + 1}`,
        fecha: new Date().toISOString(),
        usuario: {
          nombre: "Usuario Actual",
          correo: "usuario@andinavidaseguros.com.co",
        },
        tipo: "otro",
        descripcion: "Actualizó la información de la incidencia",
      }

      setHistorialCambios([nuevoCambio, ...historialCambios])
    } catch (error) {
      console.error("Error al actualizar la incidencia:", error)
      alert("Error al actualizar la incidencia. Por favor, inténtelo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddComment = async (texto) => {
    setIsSubmitting(true)
    try {
      const nuevoComentario = await crearComentario({
        incidencia_id: incidencia.id,
        autor: "Usuario Actual", // En una app real, obtendríamos el usuario actual
        texto: texto,
      })

      // Actualizar la lista de comentarios
      setComentarios([...comentarios, nuevoComentario])

      // Añadir al historial de cambios
      const nuevoCambio: CambioIncidencia = {
        id: `c${historialCambios.length + 1}`,
        fecha: new Date().toISOString(),
        usuario: {
          nombre: "Usuario Actual",
          correo: "usuario@andinavidaseguros.com.co",
        },
        tipo: "comentario",
        descripcion: "Añadió un comentario a la incidencia",
      }

      setHistorialCambios([nuevoCambio, ...historialCambios])
    } catch (error) {
      console.error("Error al añadir comentario:", error)
      alert("Error al añadir comentario. Por favor, inténtelo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAsignarUsuario = async (usuarioId) => {
    setIsSubmitting(true)
    try {
      // En una app real, obtendríamos los datos del usuario por su ID
      const nombreUsuario = "Carlos Ramírez" // Simulado

      await actualizarIncidencia(incidencia.id, {
        asignado: nombreUsuario,
      })

      // Actualizar el formulario
      setFormData((prev) => ({
        ...prev,
        asignado: nombreUsuario,
      }))

      // Añadir al historial de cambios
      const nuevoCambio: CambioIncidencia = {
        id: `c${historialCambios.length + 1}`,
        fecha: new Date().toISOString(),
        usuario: {
          nombre: "Usuario Actual",
          correo: "usuario@andinavidaseguros.com.co",
        },
        tipo: "asignacion",
        campo: "Asignado",
        valorAnterior: incidencia.asignado || "Sin asignar",
        valorNuevo: nombreUsuario,
        descripcion: `Asignó la incidencia a ${nombreUsuario}`,
      }

      setHistorialCambios([nuevoCambio, ...historialCambios])
    } catch (error) {
      console.error("Error al asignar usuario:", error)
      alert("Error al asignar usuario. Por favor, inténtelo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddEtiqueta = (etiqueta: Etiqueta) => {
    setEtiquetas([...etiquetas, etiqueta])

    // Añadir al historial de cambios
    const nuevoCambio: CambioIncidencia = {
      id: `c${historialCambios.length + 1}`,
      fecha: new Date().toISOString(),
      usuario: {
        nombre: "Usuario Actual",
        correo: "usuario@andinavidaseguros.com.co",
      },
      tipo: "otro",
      descripcion: `Añadió la etiqueta "${etiqueta.nombre}"`,
    }

    setHistorialCambios([nuevoCambio, ...historialCambios])
  }

  const handleRemoveEtiqueta = (index: number) => {
    const etiquetaEliminada = etiquetas[index]
    const nuevasEtiquetas = [...etiquetas]
    nuevasEtiquetas.splice(index, 1)
    setEtiquetas(nuevasEtiquetas)

    // Añadir al historial de cambios
    const nuevoCambio: CambioIncidencia = {
      id: `c${historialCambios.length + 1}`,
      fecha: new Date().toISOString(),
      usuario: {
        nombre: "Usuario Actual",
        correo: "usuario@andinavidaseguros.com.co",
      },
      tipo: "otro",
      descripcion: `Eliminó la etiqueta "${etiquetaEliminada.nombre}"`,
    }

    setHistorialCambios([nuevoCambio, ...historialCambios])
  }

  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "N/A"
    try {
      return format(new Date(fechaStr), "dd MMM yyyy, HH:mm", { locale: es })
    } catch (error) {
      return fechaStr
    }
  }

  // Pasos para el timeline
  const getTimelineSteps = () => {
    const steps = [
      {
        id: "recepcion",
        title: "Recepción del caso",
        description: `Por ${incidencia.nombre || "Usuario"}`,
        date: formatearFecha(incidencia.fecha_creacion),
        status: "completed",
      },
      {
        id: "diagnostico",
        title: "Generación de diagnóstico",
        description: incidencia.fecha_diagnostico ? "Completado" : "Pendiente",
        date: formatearFecha(incidencia.fecha_diagnostico),
        status: "completed",
      },
      {
        id: "desarrollo",
        title: "Desarrollo del ajuste",
        description: incidencia.fecha_entrega_desarrollo ? "Completado" : "Pendiente",
        date: formatearFecha(incidencia.fecha_entrega_desarrollo),
        status: incidencia.fecha_entrega_desarrollo
          ? "completed"
          : incidencia.fecha_diagnostico
            ? "current"
            : "pending",
      },
      {
        id: "qa",
        title: "Evidencias y pruebas QA",
        description: incidencia.fecha_entrega_qa ? "Completado" : "Pendiente",
        date: formatearFecha(incidencia.fecha_entrega_qa),
        status: incidencia.fecha_entrega_qa ? "completed" : incidencia.fecha_entrega_desarrollo ? "current" : "pending",
      },
      {
        id: "envio-correo",
        title: "Envío correo Andina",
        description: incidencia.fecha_envio_correo ? "Completado" : "Pendiente",
        date: formatearFecha(incidencia.fecha_envio_correo),
        status: incidencia.fecha_envio_correo ? "completed" : incidencia.fecha_entrega_qa ? "current" : "pending",
      },
      {
        id: "aprobado-uat",
        title: "Aprobado para UAT",
        description: incidencia.fecha_aprobado_uat ? "Completado" : "Pendiente",
        date: formatearFecha(incidencia.fecha_aprobado_uat),
        status: incidencia.fecha_aprobado_uat ? "completed" : incidencia.fecha_envio_correo ? "current" : "pending",
      },
      {
        id: "pruebas-uat",
        title: "Pruebas UAT",
        description: incidencia.fecha_entrega_uat ? "Completado" : "Pendiente",
        date: formatearFecha(incidencia.fecha_entrega_uat),
        status: incidencia.fecha_entrega_uat ? "completed" : incidencia.fecha_aprobado_uat ? "current" : "pending",
      },
      {
        id: "despliegue",
        title: "Despliegue a PROD",
        description: incidencia.fecha_solucion ? "Completado" : "Pendiente",
        date: formatearFecha(incidencia.fecha_solucion),
        status: incidencia.fecha_solucion ? "completed" : incidencia.fecha_entrega_uat ? "current" : "pending",
      },
    ]

    return steps
  }

  // Determinar el color de la prioridad
  const getPriorityColor = (prioridad: string) => {
    switch (prioridad?.toUpperCase()) {
      case "CRÍTICA":
      case "INDISPONIBILIDAD":
        return "material-chip-destructive"
      case "ALTA":
        return "material-chip-warning"
      case "MEDIA":
        return "material-chip-primary"
      default:
        return "material-chip-default"
    }
  }

  // Determinar el color del estado
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Abierto":
        return "material-chip-default"
      case "En progreso":
        return "material-chip-primary"
      case "Resuelto":
        return "material-chip-success"
      case "Devuelto/cancelado":
        return "material-chip-destructive"
      default:
        return "material-chip-default"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/incidencias" className="flex items-center text-gray-500 hover:text-primary transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" />
          <span>Volver a incidencias</span>
        </Link>

        <div className="flex items-center gap-2">
          {!editMode ? (
            <Button onClick={handleToggleEdit} className="material-button material-button-outline h-9 px-4">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleToggleEdit}
                className="material-button material-button-outline h-9 px-4"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSubmitting}
                className="material-button material-button-primary h-9 px-4"
              >
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="material-card overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-xl font-google font-medium text-gray-900 dark:text-white">{incidencia.id}</h1>
                <span className={cn("material-chip", getStatusColor(incidencia.estado))}>{incidencia.estado}</span>
                <span className={cn("material-chip", getPriorityColor(incidencia.prioridad))}>
                  {incidencia.prioridad}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{incidencia.titulo}</p>
            </div>

            <div className="flex items-center gap-2">
              <AsignacionAutomatica incidencia={incidencia} onAsignar={handleAsignarUsuario} />
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-100 dark:border-gray-800">
            <TabsList className="h-12 p-0 bg-transparent">
              <TabsTrigger
                value="detalles"
                className="h-12 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                Detalles
              </TabsTrigger>
              <TabsTrigger
                value="comentarios"
                className="h-12 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <div className="flex items-center">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Comentarios
                  <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs">
                    {comentarios.length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="adjuntos"
                className="h-12 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <div className="flex items-center">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Adjuntos
                  <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs">
                    {adjuntos.length}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger
                value="historial"
                className="h-12 px-6 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
              >
                <div className="flex items-center">
                  <History className="mr-2 h-4 w-4" />
                  Historial
                </div>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="detalles" className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-google font-medium mb-4 text-gray-900 dark:text-white">
                    Información General
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400">Solicitante</Label>
                      {editMode ? (
                        <Input
                          name="nombre"
                          value={formData.nombre || ""}
                          onChange={handleChange}
                          className="material-input mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{incidencia.nombre || "Sin especificar"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400">Correo</Label>
                      {editMode ? (
                        <Input
                          name="correo"
                          value={formData.correo || ""}
                          onChange={handleChange}
                          className="material-input mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{incidencia.correo || "Sin especificar"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400">Tipo de Solicitud</Label>
                      {editMode ? (
                        <Select
                          value={formData.tipo_solicitud || ""}
                          onValueChange={(value) => handleSelectChange("tipo_solicitud", value)}
                        >
                          <SelectTrigger className="material-input mt-1">
                            <SelectValue placeholder="Seleccione tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Incidencia">Incidencia</SelectItem>
                            <SelectItem value="Requerimiento">Requerimiento</SelectItem>
                            <SelectItem value="Consulta">Consulta</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {incidencia.tipo_solicitud || "Sin especificar"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400">Fecha de Creación</Label>
                      <p className="mt-1 text-gray-900 dark:text-white">{formatearFecha(incidencia.fecha_creacion)}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-google font-medium text-gray-900 dark:text-white">Etiquetas</h3>
                  </div>
                  <Etiquetas
                    etiquetas={etiquetas}
                    onAddEtiqueta={handleAddEtiqueta}
                    onRemoveEtiqueta={handleRemoveEtiqueta}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-google font-medium mb-4 text-gray-900 dark:text-white">Descripción</h3>
                  {editMode ? (
                    <Textarea
                      name="descripcion"
                      value={formData.descripcion || ""}
                      onChange={handleChange}
                      rows={5}
                      className="material-input w-full"
                    />
                  ) : (
                    <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      {incidencia.descripcion || "Sin descripción"}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-google font-medium mb-4 text-gray-900 dark:text-white">
                    Detalles Técnicos
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400">Aplicativo</Label>
                      {editMode ? (
                        <Select
                          value={formData.aplicativo || ""}
                          onValueChange={(value) => handleSelectChange("aplicativo", value)}
                        >
                          <SelectTrigger className="material-input mt-1">
                            <SelectValue placeholder="Seleccione aplicativo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Core de Rentas">Core de Rentas</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {incidencia.aplicativo || "Sin especificar"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400">Módulo</Label>
                      {editMode ? (
                        <Select
                          value={formData.modulo || ""}
                          onValueChange={(value) => handleSelectChange("modulo", value)}
                        >
                          <SelectTrigger className="material-input mt-1">
                            <SelectValue placeholder="Seleccione módulo" />
                          </SelectTrigger>
                          <SelectContent>
                            {MODULOS.map((modulo) => (
                              <SelectItem key={modulo} value={modulo}>
                                {modulo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{incidencia.modulo || "Sin especificar"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400">ID Azure</Label>
                      {editMode ? (
                        <Input
                          name="azure"
                          value={formData.azure || ""}
                          onChange={handleChange}
                          className="material-input mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{incidencia.azure || "N/A"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400">ID GLPI</Label>
                      {editMode ? (
                        <Input
                          name="glpi"
                          value={formData.glpi || ""}
                          onChange={handleChange}
                          className="material-input mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{incidencia.glpi || "N/A"}</p>
                      )}
                    </div>
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400">Propietario</Label>
                      {editMode ? (
                        <Select
                          value={formData.propietario || ""}
                          onValueChange={(value) => handleSelectChange("propietario", value)}
                        >
                          <SelectTrigger className="material-input mt-1">
                            <SelectValue placeholder="Seleccione propietario" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Andina">Andina</SelectItem>
                            <SelectItem value="LinkTIC">LinkTIC</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">
                          {incidencia.propietario || "Sin especificar"}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label className="text-gray-500 dark:text-gray-400">Tiene Script</Label>
                      {editMode ? (
                        <div className="flex items-center mt-2">
                          <Checkbox
                            id="tiene_script"
                            checked={formData.tiene_script || false}
                            onCheckedChange={(checked) => handleCheckboxChange("tiene_script", checked)}
                          />
                          <label htmlFor="tiene_script" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Esta incidencia requiere un script
                          </label>
                        </div>
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{incidencia.tiene_script ? "Sí" : "No"}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <Card className="material-card overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-base font-google font-medium text-gray-900 dark:text-white">
                      Tiempo Restante ANS
                    </h3>
                  </div>
                  <div className="p-4">
                    <CountdownTimer
                      deadline={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Simulado: 24 horas desde ahora
                      createdAt={incidencia.fecha_creacion ? new Date(incidencia.fecha_creacion) : undefined}
                      isCompleted={incidencia.estado === "Resuelto"}
                      ansEstado={incidencia.ans_estado}
                      tiempoRestante={incidencia.tiempo_restante}
                    />
                  </div>
                </Card>

                <Card className="material-card overflow-hidden">
                  <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-base font-google font-medium text-gray-900 dark:text-white">Progreso</h3>
                  </div>
                  <div className="p-4">
                    <Timeline steps={getTimelineSteps()} />
                  </div>
                </Card>

                {incidencia.tiene_script && (
                  <Card className="material-card overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="text-base font-google font-medium text-gray-900 dark:text-white">Script</h3>
                      <Button variant="ghost" size="sm" className="text-primary">
                        <FileCode className="mr-2 h-4 w-4" />
                        Ver Script
                      </Button>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Esta incidencia tiene un script asociado. Haga clic en "Ver Script" para visualizarlo.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comentarios" className="p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-google font-medium mb-4 text-gray-900 dark:text-white">
                  Añadir Comentario
                </h3>
                <ComentarioConMenciones
                  onSubmit={handleAddComment}
                  isSubmitting={isSubmitting}
                  placeholder="Escribe tu comentario aquí. Usa @ para mencionar a un usuario."
                />
              </div>

              <div>
                <h3 className="text-lg font-google font-medium mb-4 text-gray-900 dark:text-white">
                  Comentarios ({comentarios.length})
                </h3>
                {comentarios.length === 0 ? (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                    No hay comentarios para esta incidencia
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comentarios.map((comentario) => (
                      <Card key={comentario.id} className="material-card overflow-hidden">
                        <div className="p-4 flex items-start gap-4">
                          <Avatar className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {comentario.autor
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium text-gray-900 dark:text-white">{comentario.autor}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatearFecha(comentario.fecha)}
                              </div>
                            </div>
                            <div className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {comentario.texto}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="adjuntos" className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-google font-medium text-gray-900 dark:text-white">
                  Adjuntos ({adjuntos.length})
                </h3>
                <Button className="material-button material-button-primary h-9 px-4">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Añadir Adjunto
                </Button>
              </div>

              {adjuntos.length === 0 ? (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  No hay archivos adjuntos para esta incidencia
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {adjuntos.map((adjunto) => (
                    <Card key={adjunto.id} className="material-card overflow-hidden">
                      <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/20">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                              {adjunto.nombre}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{adjunto.tamano}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 flex justify-between">
                        <Button variant="ghost" size="sm" className="text-primary">
                          <FileText className="mr-2 h-4 w-4" />
                          Vista previa
                        </Button>
                        <Button variant="ghost" size="sm" className="text-primary">
                          <FileText className="mr-2 h-4 w-4" />
                          Descargar
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="historial" className="p-6">
            <HistorialCambios cambios={historialCambios} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
