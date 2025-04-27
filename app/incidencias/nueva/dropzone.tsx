"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Dropzone({ onDrop, files = [], accept = {}, maxFiles = 0, icon = null, text = "", subText = "" }) {
  // Modified onDrop handler to avoid creating blob URLs
  const handleDrop = useCallback(
    (acceptedFiles) => {
      // Process files without creating blob URLs
      const processedFiles = acceptedFiles.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        // Don't create preview URLs that might cause issues
        // preview: URL.createObjectURL(file),
      }))

      onDrop(processedFiles)
    },
    [onDrop],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept,
    maxFiles: maxFiles || undefined,
  })

  const removeFile = useCallback(
    (index) => {
      const newFiles = [...files]
      newFiles.splice(index, 1)
      onDrop(newFiles)
    },
    [files, onDrop],
  )

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-8 hover:border-primary transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-muted"}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center">
          {icon || <Upload className="h-10 w-10 text-muted-foreground mb-2" />}
          <h3 className="font-medium text-lg">{text || "Arrastre archivos aquí o haga clic para seleccionar"}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {subText || "Soporta: Imágenes, PDF, Word y archivos de texto"}
          </p>
          <div className="mt-4">
            <Button type="button" variant="outline" size="sm">
              Seleccionar archivos
            </Button>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between border rounded-md p-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs text-muted-foreground">({Math.round(file.size / 1024)} KB)</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => removeFile(index)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Eliminar archivo</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
