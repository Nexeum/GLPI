"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload } from "lucide-react"

interface DropzoneProps {
  onFilesDrop: (files: File[]) => void
}

export function Dropzone({ onFilesDrop }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesDrop(acceptedFiles)
    },
    [onFilesDrop],
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
      "application/pdf": [],
      "application/msword": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [],
      "application/vnd.ms-excel": [],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [],
    },
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  })

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
        isDragging
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-300 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Upload className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Arrastre archivos aquí o haga clic para seleccionar
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Formatos permitidos: imágenes, PDF, Word, Excel (máx. 10MB)
        </p>
      </div>
    </div>
  )
}
