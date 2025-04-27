"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, ImageIcon, File, X, Eye, Download } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface FilePreviewProps {
  file: {
    name: string
    size: number
    type: string
    preview?: string
  }
  onRemove?: () => void
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const isImage = file.type.startsWith("image/")
  const isText = file.type === "text/plain" || file.type.includes("javascript") || file.name.endsWith(".sql")
  const isPdf = file.type === "application/pdf"

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-6 w-6 text-blue-500" />
    if (isText) return <FileText className="h-6 w-6 text-green-500" />
    if (isPdf) return <FileText className="h-6 w-6 text-red-500" />
    return <File className="h-6 w-6 text-gray-500" />
  }

  const getFileSize = () => {
    if (file.size < 1024) return `${file.size} B`
    if (file.size < 1024 * 1024) return `${Math.round(file.size / 1024)} KB`
    return `${Math.round(file.size / (1024 * 1024))} MB`
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center gap-2 truncate">
            {getFileIcon()}
            <span className="font-medium text-sm truncate">{file.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500">{getFileSize()}</span>
            {onRemove && (
              <Button variant="ghost" size="sm" onClick={onRemove} className="h-7 w-7 p-0">
                <X className="h-4 w-4" />
                <span className="sr-only">Eliminar</span>
              </Button>
            )}
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <div className="relative group cursor-pointer">
              {isImage ? (
                <div className="h-32 bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  {/* Replace direct image with placeholder or icon to avoid blob URL issues */}
                  <div className="flex items-center justify-center w-full h-full">
                    <ImageIcon className="h-12 w-12 text-blue-500/50" />
                  </div>
                </div>
              ) : (
                <div className="h-32 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  {getFileIcon()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Eye className="h-6 w-6 text-white" />
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getFileIcon()}
                <span>{file.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {isImage && (
                <div className="max-h-[70vh] max-w-full mx-auto flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
                  <ImageIcon className="h-24 w-24 text-blue-500/50" />
                  <p className="text-sm text-gray-500 mt-2">Vista previa no disponible en este entorno</p>
                </div>
              )}
              {isText && (
                <div className="max-h-[70vh] overflow-auto bg-gray-100 dark:bg-gray-900 p-4 rounded-md">
                  <pre className="text-sm">
                    <code>
                      {/* En una aplicación real, aquí cargaríamos el contenido del archivo */}
                      {`-- Ejemplo de contenido del script
SELECT * FROM incidencias 
WHERE estado = 'Abierto'
AND prioridad = 'CRÍTICA'
ORDER BY fecha_creacion DESC;

-- Actualizar estado de incidencia
UPDATE incidencias
SET estado = 'En progreso',
    fecha_diagnostico = CURRENT_TIMESTAMP
WHERE id = 'INC-1235';`}
                    </code>
                  </pre>
                </div>
              )}
              {isPdf && (
                <div className="h-[70vh] flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-md">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Vista previa de PDF no disponible</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar PDF
                    </Button>
                  </div>
                </div>
              )}
              {!isImage && !isText && !isPdf && (
                <div className="h-[70vh] flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-md">
                  <div className="text-center">
                    <File className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Vista previa no disponible para este tipo de archivo</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="mr-2 h-4 w-4" />
                      Descargar archivo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <div className="p-3 flex justify-between">
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            Vista previa
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Descargar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
