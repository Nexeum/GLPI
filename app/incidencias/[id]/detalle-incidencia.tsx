"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FileText, Save, Clock, CheckCircle, AlertTriangle, FileCode } from "lucide-react"
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
        status: incidencia.fecha_diagnostico ? "completed" : "pending",
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

  return (
    <div className="space-y-6">
      <Card className="shadow-sm border-none">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div>
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>{incidencia.id}</span>
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
              <Badge
                variant={
                  incidencia.prioridad === "CRÍTICA" || incidencia.prioridad === "INDISPONIBILIDAD"
                    ? "destructive"
                    : incidencia.prioridad === "ALTA"
                      ? "warning"
                      : "outline"
                }
              >
                {incidencia.prioridad}
              </Badge>
            </CardTitle>
            <p className="mt-1">{incidencia.titulo}</p>
          </div>
          <div className="flex items-center gap-2">
            {!editMode ? (
              <Button onClick={handleToggleEdit}>Editar</Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleToggleEdit}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full rounded-none border-b">
              <TabsTrigger value="detalles">Detalles</TabsTrigger>
              <TabsTrigger value="comentarios">
                Comentarios{" "}
                <Badge variant="secondary" className="ml-2">
                  {comentarios.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="adjuntos">
                Adjuntos{" "}
                <Badge variant="secondary" className="ml-2">
                  {adjuntos.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="historial">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="detalles" className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Información General</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Solicitante</Label>
                        {editMode ? (
                          <Input name="nombre" value={formData.nombre || ""} onChange={handleChange} className="mt-1" />
                        ) : (
                          <p className="text-sm mt-1">{incidencia.nombre || "Sin especificar"}</p>
                        )}
                      </div>
                      <div>
                        <Label>Correo</Label>
                        {editMode ? (
                          <Input name="correo" value={formData.correo || ""} onChange={handleChange} className="mt-1" />
                        ) : (
                          <p className="text-sm mt-1">{incidencia.correo || "Sin especificar"}</p>
                        )}
                      </div>
                      <div>
                        <Label>Tipo de Solicitud</Label>
                        {editMode ? (
                          <Select
                            value={formData.tipo_solicitud || ""}
                            onValueChange={(value) => handleSelectChange("tipo_solicitud", value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Incidencia">Incidencia</SelectItem>
                              <SelectItem value="Requerimiento">Requerimiento</SelectItem>
                              <SelectItem value="Consulta">Consulta</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm mt-1">{incidencia.tipo_solicitud || "Sin especificar"}</p>
                        )}
                      </div>
                      <div>
                        <Label>Fecha de Creación</Label>
                        <p className="text-sm mt-1">{formatearFecha(incidencia.fecha_creacion)}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium">Etiquetas</h3>
                    </div>
                    <Etiquetas
                      etiquetas={etiquetas}
                      onAddEtiqueta={handleAddEtiqueta}
                      onRemoveEtiqueta={handleRemoveEtiqueta}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Descripción</h3>
                    {editMode ? (
                      <Textarea
                        name="descripcion"
                        value={formData.descripcion || ""}
                        onChange={handleChange}
                        rows={5}
                        className="w-full"
                      />
                    ) : (
                      <div className="text-sm whitespace-pre-wrap border rounded-md p-3 bg-gray-50 dark:bg-gray-900">
                        {incidencia.descripcion || "Sin descripción"}
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Detalles Técnicos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Aplicativo</Label>
                        {editMode ? (
                          <Select
                            value={formData.aplicativo || ""}
                            onValueChange={(value) => handleSelectChange("aplicativo", value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Seleccione aplicativo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Core de Rentas">Core de Rentas</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm mt-1">{incidencia.aplicativo || "Sin especificar"}</p>
                        )}
                      </div>
                      <div>
                        <Label>Módulo</Label>
                        {editMode ? (
                          <Select
                            value={formData.modulo || ""}
                            onValueChange={(value) => handleSelectChange("modulo", value)}
                          >
                            <SelectTrigger className="mt-1">
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
                          <p className="text-sm mt-1">{incidencia.modulo || "Sin especificar"}</p>
                        )}
                      </div>
                      <div>
                        <Label>ID Azure</Label>
                        {editMode ? (
                          <Input name="azure" value={formData.azure || ""} onChange={handleChange} className="mt-1" />
                        ) : (
                          <p className="text-sm mt-1">{incidencia.azure || "N/A"}</p>
                        )}
                      </div>
                      <div>
                        <Label>ID GLPI</Label>
                        {editMode ? (
                          <Input name="glpi" value={formData.glpi || ""} onChange={handleChange} className="mt-1" />
                        ) : (
                          <p className="text-sm mt-1">{incidencia.glpi || "N/A"}</p>
                        )}
                      </div>
                      <div>
                        <Label>Propietario</Label>
                        {editMode ? (
                          <Select
                            value={formData.propietario || ""}
                            onValueChange={(value) => handleSelectChange("propietario", value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Seleccione propietario" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Andina">Andina</SelectItem>
                              <SelectItem value="LinkTIC">LinkTIC</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm mt-1">{incidencia.propietario || "Sin especificar"}</p>
                        )}
                      </div>
                      <div>
                        <Label>Tiene Script</Label>
                        {editMode ? (
                          <div className="flex items-center mt-2">
                            <Checkbox
                              id="tiene_script"
                              checked={formData.tiene_script || false}
                              onCheckedChange={(checked) => handleCheckboxChange("tiene_script", checked)}
                            />
                            <label htmlFor="tiene_script" className="ml-2 text-sm">
                              Esta incidencia requiere un script
                            </label>
                          </div>
                        ) : (
                          <p className="text-sm mt-1">{incidencia.tiene_script ? "Sí" : "No"}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Estado y Seguimiento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Estado</Label>
                        {editMode ? (
                          <Select
                            value={formData.estado || ""}
                            onValueChange={(value) => handleSelectChange("estado", value)}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Seleccione estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Abierto">Abierto</SelectItem>
                              <SelectItem value="En progreso">En progreso</SelectItem>
                              <SelectItem value="En revisión">En revisión</SelectItem>
                              <SelectItem value="Resuelto">Resuelto</SelectItem>
                              <SelectItem value="Devuelto/cancelado">Devuelto/cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm mt-1">{incidencia.estado || "Sin especificar"}</p>
                        )}
                      </div>
                      <div>
                        <Label>Asignado a</Label>
                        <div className="flex items-center gap-2 mt-1">
                          {editMode ? (
                            <Input
                              name="asignado"
                              value={formData.asignado || ""}
                              onChange={handleChange}
                              className="flex-1"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {incidencia.asignado
                                    ? incidencia.asignado
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                    : "NA"}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{incidencia.asignado || "Sin asignar"}</span>
                            </div>
                          )}
                          <AsignacionAutomatica incidencia={incidencia} onAsignar={handleAsignarUsuario} />
                        </div>
                      </div>
                      <div>
                        <Label>Fecha de Solución</Label>
                        <p className="text-sm mt-1">{formatearFecha(incidencia.fecha_solucion) || "Pendiente"}</p>
                      </div>
                      <div>
                        <Label>ANS</Label>
                        <div className="mt-1">
                          {incidencia.estado === "Resuelto" ? (
                            <Badge variant="success" className="flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" />
                              Completado
                            </Badge>
                          ) : (
                            <Badge
                              variant={incidencia.ans_estado === "En riesgo" ? "destructive" : "outline"}
                              className="flex items-center gap-1 w-fit"
                            >
                              {incidencia.ans_estado === "En riesgo" ? (
                                <AlertTriangle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {incidencia.tiempo_restante || "N/A"}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {incidencia.bitacora && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Bitácora</h3>
                      {editMode ? (
                        <Textarea
                          name="bitacora"
                          value={formData.bitacora || ""}
                          onChange={handleChange}
                          rows={3}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-sm whitespace-pre-wrap border rounded-md p-3 bg-gray-50 dark:bg-gray-900">
                          {incidencia.bitacora}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Tiempo Restante ANS</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CountdownTimer
                        deadline={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Simulado: 24 horas desde ahora
                        createdAt={new Date(incidencia.fecha_creacion)}
                        isCompleted={incidencia.estado === "Resuelto"}
                        ansEstado={incidencia.ans_estado}
                        tiempoRestante={incidencia.tiempo_restante}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Progreso</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Timeline steps={getTimelineSteps()} />
                    </CardContent>
                  </Card>

                  {incidencia.tiene_script && (
                    <Card>
                      <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-base">Script</CardTitle>
                        <Button variant="ghost" size="sm">
                          <FileCode className="mr-2 h-4 w-4" />
                          Ver Script
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Esta incidencia tiene un script asociado. Haga clic en "Ver Script" para visualizarlo.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comentarios" className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Añadir Comentario</h3>
                  <ComentarioConMenciones
                    onSubmit={handleAddComment}
                    isSubmitting={isSubmitting}
                    placeholder="Escribe tu comentario aquí. Usa @ para mencionar a un usuario."
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-4">Comentarios ({comentarios.length})</h3>
                  {comentarios.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">No hay comentarios para esta incidencia</div>
                  ) : (
                    <div className="space-y-4">
                      {comentarios.map((comentario) => (
                        <div key={comentario.id} className="border rounded-md p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Avatar>
                                <AvatarFallback>
                                  {comentario.autor
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{comentario.autor}</div>
                                <div className="text-xs text-muted-foreground">{formatearFecha(comentario.fecha)}</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm whitespace-pre-wrap">{comentario.texto}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="adjuntos" className="p-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Adjuntos ({adjuntos.length})</h3>
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Añadir Adjunto
                  </Button>
                </div>

                {adjuntos.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No hay archivos adjuntos para esta incidencia
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {adjuntos.map((adjunto) => (
                      <Card key={adjunto.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800">
                            <div className="flex items-center gap-2 truncate">
                              <FileText className="h-5 w-5 text-blue-500" />
                              <span className="font-medium text-sm truncate">{adjunto.nombre}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">{adjunto.tamano}</span>
                            </div>
                          </div>

                          <div className="p-3 flex justify-between">
                            <Button variant="ghost" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              Vista previa
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="mr-2 h-4 w-4" />
                              Descargar
                            </Button>
                          </div>
                        </CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
