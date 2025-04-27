"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Colores predefinidos para las etiquetas
const COLORES_ETIQUETAS = [
  { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
  { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
  { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-200" },
]

// Etiquetas predefinidas comunes
const ETIQUETAS_PREDEFINIDAS = [
  { nombre: "Bug", color: 0 },
  { nombre: "Mejora", color: 2 },
  { nombre: "Crítico", color: 0 },
  { nombre: "Documentación", color: 7 },
  { nombre: "Frontend", color: 1 },
  { nombre: "Backend", color: 4 },
  { nombre: "Base de datos", color: 6 },
  { nombre: "UI/UX", color: 5 },
]

export type Etiqueta = {
  id?: string
  nombre: string
  color: number
}

interface EtiquetasProps {
  etiquetas: Etiqueta[]
  onAddEtiqueta?: (etiqueta: Etiqueta) => void
  onRemoveEtiqueta?: (index: number) => void
  className?: string
  editable?: boolean
}

export function Etiquetas({
  etiquetas = [],
  onAddEtiqueta,
  onRemoveEtiqueta,
  className,
  editable = true,
}: EtiquetasProps) {
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState("")
  const [colorSeleccionado, setColorSeleccionado] = useState(0)
  const [popoverOpen, setPopoverOpen] = useState(false)

  const handleAddEtiqueta = () => {
    if (nuevaEtiqueta.trim() && onAddEtiqueta) {
      onAddEtiqueta({
        nombre: nuevaEtiqueta.trim(),
        color: colorSeleccionado,
      })
      setNuevaEtiqueta("")
      setPopoverOpen(false)
    }
  }

  const handleAddPredefinida = (etiqueta: Etiqueta) => {
    if (onAddEtiqueta) {
      onAddEtiqueta(etiqueta)
      setPopoverOpen(false)
    }
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {etiquetas.map((etiqueta, index) => {
        const colorStyle = COLORES_ETIQUETAS[etiqueta.color % COLORES_ETIQUETAS.length]
        return (
          <Badge
            key={etiqueta.id || index}
            className={cn("px-2 py-1 border", colorStyle.bg, colorStyle.text, colorStyle.border)}
          >
            {etiqueta.nombre}
            {editable && onRemoveEtiqueta && (
              <button onClick={() => onRemoveEtiqueta(index)} className="ml-1 hover:text-gray-900 focus:outline-none">
                <X className="h-3 w-3" />
                <span className="sr-only">Eliminar etiqueta</span>
              </button>
            )}
          </Badge>
        )
      })}

      {editable && onAddEtiqueta && (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-6 gap-1">
              <Plus className="h-3 w-3" />
              <span className="text-xs">Añadir etiqueta</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4">
            <div className="space-y-4">
              <h4 className="font-medium">Añadir etiqueta</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Nombre de la etiqueta"
                  value={nuevaEtiqueta}
                  onChange={(e) => setNuevaEtiqueta(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddEtiqueta} disabled={!nuevaEtiqueta.trim()}>
                  Añadir
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORES_ETIQUETAS.map((color, index) => (
                    <button
                      key={index}
                      className={cn(
                        "w-6 h-6 rounded-full border-2",
                        color.bg,
                        colorSeleccionado === index ? "ring-2 ring-offset-2 ring-primary" : "",
                      )}
                      onClick={() => setColorSeleccionado(index)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Etiquetas predefinidas</label>
                <div className="flex flex-wrap gap-2">
                  {ETIQUETAS_PREDEFINIDAS.map((etiqueta, index) => {
                    const colorStyle = COLORES_ETIQUETAS[etiqueta.color]
                    return (
                      <Badge
                        key={index}
                        className={cn(
                          "px-2 py-1 border cursor-pointer",
                          colorStyle.bg,
                          colorStyle.text,
                          colorStyle.border,
                        )}
                        onClick={() => handleAddPredefinida(etiqueta)}
                      >
                        {etiqueta.nombre}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
