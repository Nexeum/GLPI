"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, AlertCircle } from "lucide-react"
import { Dropzone } from "./dropzone"
import { FilePreview } from "./file-preview"
import Link from "next/link"
import { crearIncidencia } from "@/lib/api/incidencias"
import { ANS_PRIORIDAD, MODULOS } from "@/lib/types/incidencias"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PlantillasIncidencias } from "@/components/incidencias/plantillas-incidencias"
import { Etiquetas } from "@/components/incidencias/etiquetas"

// Esquema de validación con Zod
const formSchema = z.object({
  titulo: z.string().min(5, { message: "El título debe tener al menos 5 caracteres" }).max(100, {
    message: "El título no puede exceder los 100 caracteres",
  }),
  descripcion: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres" }),
  prioridad: z.string({ required_error: "Seleccione una prioridad" }),
  tipo_solicitud: z.string().default("Incidencia"),
  aplicativo: z.string({ required_error: "Seleccione un aplicativo" }),
  modulo: z.string({ required_error: "Seleccione un módulo" }),
  correo: z.string().email({ message: "Ingrese un correo electrónico válido" }),
  nombre: z.string().min(3, { message: "Ingrese un nombre válido" }),
  propietario: z.string({ required_error: "Seleccione un propietario" }),
  azure: z.string().optional(),
  glpi: z.string().optional(),
  tiene_script: z.boolean().default(false),
})

export function NuevaIncidenciaForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [archivos, setArchivos] = useState([])
  const [scriptArchivo, setScriptArchivo] = useState(null)
  const [submitError, setSubmitError] = useState("")
  const [etiquetas, setEtiquetas] = useState([])

  // Inicializar React Hook Form con Zod
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      descripcion: "",
      prioridad: "",
      tipo_solicitud: "Incidencia",
      aplicativo: "",
      modulo: "",
      correo: "",
      nombre: "",
      propietario: "",
      azure: "",
      glpi: "",
      tiene_script: false,
    },
  })

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

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true)
    setSubmitError("")

    try {
      // Crear la incidencia en Supabase
      const nuevaIncidencia = await crearIncidencia({
        ...data,
        estado: "Abierto",
        ans_estado: "En tiempo",
        tiempo_restante: ANS_PRIORIDAD[data.prioridad] || "24h",
        hora_inicio: new Date().toLocaleTimeString(),
      })

      // En una aplicación real, aquí manejaríamos la carga de archivos
      // y los asociaríamos a la incidencia recién creada

      // Redirigir a la lista de incidencias tras el envío exitoso
      router.push("/incidencias")
    } catch (error) {
      console.error("Error al crear incidencia:", error)
      setSubmitError("Error al crear la incidencia. Por favor, inténtelo de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Manejar la selección de una plantilla
  const handleSelectPlantilla = (plantilla) => {
    form.setValue("titulo", plantilla.titulo)
    form.setValue("descripcion", plantilla.descripcion)
    form.setValue("tipo_solicitud", plantilla.tipo_solicitud)
    form.setValue("prioridad", plantilla.prioridad)
    form.setValue("aplicativo", plantilla.aplicativo)
    form.setValue("modulo", plantilla.modulo)

    // Establecer etiquetas
    const nuevasEtiquetas = plantilla.etiquetas.map((nombre, index) => ({
      nombre,
      color: index % 8,
    }))
    setEtiquetas(nuevasEtiquetas)
  }

  // Manejar la adición de etiquetas
  const handleAddEtiqueta = (etiqueta) => {
    setEtiquetas([...etiquetas, etiqueta])
  }

  // Manejar la eliminación de etiquetas
  const handleRemoveEtiqueta = (index) => {
    const nuevasEtiquetas = [...etiquetas]
    nuevasEtiquetas.splice(index, 1)
    setEtiquetas(nuevasEtiquetas)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white dark:bg-gray-950 rounded-lg">
        <CardContent className="space-y-6 p-6">
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <PlantillasIncidencias onSelectPlantilla={handleSelectPlantilla} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del solicitante</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre completo" {...field} className="border-gray-300 focus:border-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="correo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="correo@andinavidaseguros.com.co"
                      {...field}
                      className="border-gray-300 focus:border-primary"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="titulo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título de la incidencia</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Describa brevemente el problema"
                    {...field}
                    className="border-gray-300 focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Label className="mb-2 block">Etiquetas</Label>
            <Etiquetas
              etiquetas={etiquetas}
              onAddEtiqueta={handleAddEtiqueta}
              onRemoveEtiqueta={handleRemoveEtiqueta}
            />
          </div>

          <FormField
            control={form.control}
            name="descripcion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción detallada</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Explique en detalle el problema, incluyendo pasos para reproducir"
                    rows={5}
                    {...field}
                    className="border-gray-300 focus:border-primary resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="tipo_solicitud"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Solicitud</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-primary">
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Incidencia">Incidencia</SelectItem>
                      <SelectItem value="Requerimiento">Requerimiento</SelectItem>
                      <SelectItem value="Consulta">Consulta</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prioridad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridad</FormLabel>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-gray-300 focus:border-primary">
                                <SelectValue placeholder="Seleccione prioridad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INDISPONIBILIDAD">INDISPONIBILIDAD (1h)</SelectItem>
                              <SelectItem value="CRÍTICA">CRÍTICA (2h)</SelectItem>
                              <SelectItem value="ALTA">ALTA (8h)</SelectItem>
                              <SelectItem value="ESTÁNDAR">ESTÁNDAR (12h)</SelectItem>
                              <SelectItem value="BAJA">BAJA (24h)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Tiempo de respuesta según ANS</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propietario"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propietario</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-primary">
                        <SelectValue placeholder="Seleccione propietario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Andina">Andina</SelectItem>
                      <SelectItem value="LinkTIC">LinkTIC</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="aplicativo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aplicativo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-primary">
                        <SelectValue placeholder="Seleccione aplicativo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Core de Rentas">Core de Rentas</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Módulo</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:border-primary">
                        <SelectValue placeholder="Seleccione módulo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MODULOS.map((modulo) => (
                        <SelectItem key={modulo} value={modulo}>
                          {modulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="azure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Azure</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: AZ-12345" {...field} className="border-gray-300 focus:border-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="glpi"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID GLPI</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: GL-5678" {...field} className="border-gray-300 focus:border-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tiene_script"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-medium">Esta incidencia requiere un script</FormLabel>
                  <FormDescription>
                    Marque esta opción si necesita adjuntar un script SQL o de otro tipo
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {form.watch("tiene_script") && (
            <div className="mt-4 p-4 border rounded-md border-gray-300">
              <Label className="mb-2 block">Adjuntar Script</Label>
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

          <div className="space-y-2">
            <Label>Documentos de soporte</Label>
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
        </CardContent>
        <CardFooter className="flex justify-between p-6 border-t">
          <Link href="/incidencias">
            <Button variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Guardar Incidencia"}
          </Button>
        </CardFooter>
      </form>
    </Form>
  )
}
