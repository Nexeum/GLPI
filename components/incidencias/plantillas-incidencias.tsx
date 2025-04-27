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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, ChevronRight } from "lucide-react"

// Tipos de plantillas
export type PlantillaIncidencia = {
  id: string
  titulo: string
  descripcion: string
  tipo_solicitud: string
  prioridad: string
  aplicativo: string
  modulo: string
  etiquetas: string[]
  categoria: string
}

// Categorías de plantillas
const CATEGORIAS_PLANTILLAS = [
  "Errores comunes",
  "Problemas de rendimiento",
  "Solicitudes de acceso",
  "Problemas de datos",
  "Problemas de interfaz",
  "Otros",
]

// Plantillas predefinidas
const PLANTILLAS_PREDEFINIDAS: PlantillaIncidencia[] = [
  {
    id: "p1",
    titulo: "Error en la carga de datos del reporte",
    descripcion:
      "El reporte no carga correctamente los datos. Al intentar generar el reporte, se muestra una pantalla en blanco o aparece un mensaje de error.\n\n" +
      "Pasos para reproducir:\n" +
      "1. Acceder al módulo de reportes\n" +
      "2. Seleccionar el reporte específico\n" +
      "3. Configurar los filtros\n" +
      "4. Hacer clic en 'Generar reporte'\n\n" +
      "Comportamiento esperado: El reporte debería mostrarse con los datos correspondientes.",
    tipo_solicitud: "Incidencia",
    prioridad: "ALTA",
    aplicativo: "Core de Rentas",
    modulo: "Reportes",
    etiquetas: ["Bug", "Reportes", "Datos"],
    categoria: "Errores comunes",
  },
  {
    id: "p2",
    titulo: "Lentitud en procesamiento de transacciones",
    descripcion:
      "El sistema está experimentando lentitud al procesar transacciones. Las operaciones que normalmente toman segundos están tardando minutos en completarse.\n\n" +
      "Detalles adicionales:\n" +
      "- Hora de inicio del problema: [COMPLETAR]\n" +
      "- Número aproximado de usuarios afectados: [COMPLETAR]\n" +
      "- ¿El problema es intermitente o constante?: [COMPLETAR]\n\n" +
      "Impacto en el negocio: Los usuarios no pueden completar sus tareas en tiempo y forma, afectando la operativa diaria.",
    tipo_solicitud: "Incidencia",
    prioridad: "CRÍTICA",
    aplicativo: "Core de Rentas",
    modulo: "Transacciones",
    etiquetas: ["Rendimiento", "Crítico", "Transacciones"],
    categoria: "Problemas de rendimiento",
  },
  {
    id: "p3",
    titulo: "Solicitud de acceso a módulo",
    descripcion:
      "Solicito acceso al módulo de [NOMBRE DEL MÓDULO] para el usuario [NOMBRE DEL USUARIO].\n\n" +
      "Información del usuario:\n" +
      "- Nombre completo: [COMPLETAR]\n" +
      "- Correo electrónico: [COMPLETAR]\n" +
      "- Cargo: [COMPLETAR]\n" +
      "- Justificación: [COMPLETAR]\n\n" +
      "Nivel de acceso requerido: [Lectura/Escritura/Administrador]",
    tipo_solicitud: "Requerimiento",
    prioridad: "ESTÁNDAR",
    aplicativo: "Core de Rentas",
    modulo: "Seguridad",
    etiquetas: ["Acceso", "Seguridad"],
    categoria: "Solicitudes de acceso",
  },
  {
    id: "p4",
    titulo: "Inconsistencia en datos de cliente",
    descripcion:
      "Se ha detectado una inconsistencia en los datos de un cliente en el sistema.\n\n" +
      "Detalles del problema:\n" +
      "- ID del cliente: [COMPLETAR]\n" +
      "- Campo(s) con inconsistencia: [COMPLETAR]\n" +
      "- Valor actual: [COMPLETAR]\n" +
      "- Valor esperado: [COMPLETAR]\n\n" +
      "Esta inconsistencia está afectando [describir el impacto].",
    tipo_solicitud: "Incidencia",
    prioridad: "MEDIA",
    aplicativo: "Core de Rentas",
    modulo: "Clientes",
    etiquetas: ["Datos", "Inconsistencia", "Cliente"],
    categoria: "Problemas de datos",
  },
  {
    id: "p5",
    titulo: "Error en la interfaz de usuario",
    descripcion:
      "La interfaz de usuario presenta errores visuales o de funcionamiento.\n\n" +
      "Detalles del problema:\n" +
      "- Página o sección afectada: [COMPLETAR]\n" +
      "- Descripción del error visual: [COMPLETAR]\n" +
      "- Navegador y versión: [COMPLETAR]\n" +
      "- Resolución de pantalla: [COMPLETAR]\n\n" +
      "Adjunto capturas de pantalla que muestran el problema.",
    tipo_solicitud: "Incidencia",
    prioridad: "BAJA",
    aplicativo: "Core de Rentas",
    modulo: "UI",
    etiquetas: ["UI", "Frontend", "Visual"],
    categoria: "Problemas de interfaz",
  },
]

interface PlantillasIncidenciasProps {
  onSelectPlantilla: (plantilla: PlantillaIncidencia) => void
}

export function PlantillasIncidencias({ onSelectPlantilla }: PlantillasIncidenciasProps) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>("Todas")
  const [dialogOpen, setDialogOpen] = useState(false)

  // Filtrar plantillas por categoría
  const plantillasFiltradas =
    categoriaSeleccionada === "Todas"
      ? PLANTILLAS_PREDEFINIDAS
      : PLANTILLAS_PREDEFINIDAS.filter((p) => p.categoria === categoriaSeleccionada)

  const handleSelectPlantilla = (plantilla: PlantillaIncidencia) => {
    onSelectPlantilla(plantilla)
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileText className="mr-2 h-4 w-4" />
          Usar plantilla
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Plantillas de incidencias</DialogTitle>
          <DialogDescription>Seleccione una plantilla para agilizar la creación de la incidencia</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Categoría:</span>
            <Select value={categoriaSeleccionada} onValueChange={setCategoriaSeleccionada}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todas">Todas las categorías</SelectItem>
                {CATEGORIAS_PLANTILLAS.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-2">
              {plantillasFiltradas.map((plantilla) => (
                <div
                  key={plantilla.id}
                  className="border rounded-md p-3 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                  onClick={() => handleSelectPlantilla(plantilla)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{plantilla.titulo}</h4>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="text-sm text-gray-500 mt-1 line-clamp-2">{plantilla.descripcion}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                      {plantilla.tipo_solicitud}
                    </span>
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">
                      {plantilla.prioridad}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
