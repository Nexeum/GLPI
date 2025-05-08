"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dropzone } from "./dropzone"
import { FilePreview } from "./file-preview"
import Link from "next/link"
import { crearIncidencia } from "@/lib/api/incidencias"
import { ANS_PRIORIDAD, MODULOS } from "@/lib/types/incidencias"
import { useToast } from "@/hooks/use-toast"

export function NuevaIncidenciaForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [archivos, setArchivos] = useState([])
  const [scriptArchivo, setScriptArchivo] = useState(null)
  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    prioridad: "",
    tipo_solicitud: "Incidencia",
    aplicativo: "Core de Rentas",
    modulo: "",
    correo: "",
    nombre: "",
    propietario: "LinkTIC",
    azure: "",
    glpi: "",
    tiene_script: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const onDrop = (acceptedFiles) => {
    setArchivos(acceptedFiles)
  }

  const onDropScript = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setScriptArchivo({
        name: file.name,
        size: file.size,
        type: file.type,
      })
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validación básica
      if (!formData.titulo || !formData.descripcion || !formData.modulo || !formData.prioridad) {
        toast({
          title: "Error",
          description: "Por favor complete todos los campos obligatorios",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Crear la incidencia en Supabase
      const nuevaIncidencia = await crearIncidencia({
        ...formData,
        estado: "Abierto",
        ans_estado: "En tiempo",
        tiempo_restante: ANS_PRIORIDAD[formData.prioridad] || "24h",
        hora_inicio: new Date().toLocaleTimeString(),
      })

      toast({
        title: "Éxito",
        description: "Incidencia creada correctamente",
      })

      // Redirigir a la lista de incidencias tras el envío exitoso
      router.push("/incidencias")
    } catch (error) {
      console.error("Error al crear incidencia:", error)
      toast({
        title: "Error",
        description: "Error al crear la incidencia. Por favor, inténtelo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre del solicitante <span className="text-red-500">*</span>
            </label>
            <Input
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              className="material-input"
              required
            />
          </div>

          <div>
            <label htmlFor="correo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <Input
              id="correo"
              name="correo"
              type="email"
              value={formData.correo}
              onChange={handleChange}
              placeholder="correo@andinavidaseguros.com.co"
              className="material-input"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título de la incidencia <span className="text-red-500">*</span>
          </label>
          <Input
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            placeholder="Describa brevemente el problema"
            className="material-input"
            required
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción detallada <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            placeholder="Explique en detalle el problema, incluyendo pasos para reproducir"
            rows={5}
            className="material-input resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="tipo_solicitud" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Solicitud <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.tipo_solicitud}
              onValueChange={(value) => handleSelectChange("tipo_solicitud", value)}
            >
              <SelectTrigger className="material-input">
                <SelectValue placeholder="Seleccione tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Incidencia">Incidencia</SelectItem>
                <SelectItem value="Requerimiento">Requerimiento</SelectItem>
                <SelectItem value="Consulta">Consulta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prioridad <span className="text-red-500">*</span>
            </label>
            <Select value={formData.prioridad} onValueChange={(value) => handleSelectChange("prioridad", value)}>
              <SelectTrigger className="material-input">
                <SelectValue placeholder="Seleccione prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INDISPONIBILIDAD">INDISPONIBILIDAD (1h)</SelectItem>
                <SelectItem value="CRÍTICA">CRÍTICA (2h)</SelectItem>
                <SelectItem value="ALTA">ALTA (8h)</SelectItem>
                <SelectItem value="ESTÁNDAR">ESTÁNDAR (12h)</SelectItem>
                <SelectItem value="BAJA">BAJA (24h)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="propietario" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Propietario <span className="text-red-500">*</span>
            </label>
            <Select value={formData.propietario} onValueChange={(value) => handleSelectChange("propietario", value)}>
              <SelectTrigger className="material-input">
                <SelectValue placeholder="Seleccione propietario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Andina">Andina</SelectItem>
                <SelectItem value="LinkTIC">LinkTIC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="aplicativo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Aplicativo <span className="text-red-500">*</span>
            </label>
            <Select value={formData.aplicativo} onValueChange={(value) => handleSelectChange("aplicativo", value)}>
              <SelectTrigger className="material-input">
                <SelectValue placeholder="Seleccione aplicativo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Core de Rentas">Core de Rentas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label htmlFor="modulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Módulo <span className="text-red-500">*</span>
            </label>
            <Select value={formData.modulo} onValueChange={(value) => handleSelectChange("modulo", value)}>
              <SelectTrigger className="material-input">
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
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="azure" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID Azure
            </label>
            <Input
              id="azure"
              name="azure"
              value={formData.azure}
              onChange={handleChange}
              placeholder="Ej: AZ-12345"
              className="material-input"
            />
          </div>

          <div>
            <label htmlFor="glpi" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ID GLPI
            </label>
            <Input
              id="glpi"
              name="glpi"
              value={formData.glpi}
              onChange={handleChange}
              placeholder="Ej: GL-5678"
              className="material-input"
            />
          </div>
        </div>

        <div className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <Checkbox
            id="tiene_script"
            checked={formData.tiene_script}
            onCheckedChange={(checked) => handleSelectChange("tiene_script", checked)}
            className="mt-1"
          />
          <div>
            <label
              htmlFor="tiene_script"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Esta incidencia requiere un script
            </label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Marque esta opción si necesita adjuntar un script SQL o de otro tipo
            </p>
          </div>
        </div>

        {formData.tiene_script && (
          <div className="p-4 border rounded-lg border-gray-200 dark:border-gray-700">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Adjuntar Script</label>
            <Dropzone
              onDrop={onDropScript}
              files={scriptArchivo ? [scriptArchivo] : []}
              accept={{
                "text/plain": [".txt", ".sql"],
                "application/javascript": [".js"],
                "application/x-sh": [".sh"],
                "application/x-bat": [".bat"],
              }}
              maxFiles={1}
              icon={null}
              text="Arrastre el archivo de script aquí o haga clic para seleccionar"
              subText="Soporta: SQL, JavaScript, Shell, Batch y archivos de texto"
            />
            {scriptArchivo && (
              <div className="mt-4">
                <FilePreview file={scriptArchivo} />
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Documentos de soporte
          </label>
          <Dropzone
            onDrop={onDrop}
            files={archivos}
            accept={{
              "image/*": [],
              "application/pdf": [],
              "application/msword": [],
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
              "text/plain": [],
            }}
          />
          {archivos.length > 0 && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {archivos.map((file, index) => (
                <FilePreview
                  key={index}
                  file={file}
                  onRemove={() => {
                    const newFiles = [...archivos]
                    newFiles.splice(index, 1)
                    setArchivos(newFiles)
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
        <Link href="/incidencias">
          <Button variant="outline" className="material-button material-button-outline">
            Cancelar
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} className="material-button material-button-primary">
          {isSubmitting ? "Guardando..." : "Guardar Incidencia"}
        </Button>
      </div>
    </form>
  )
}
