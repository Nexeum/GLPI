"use client"

import { X, FileText, FileSpreadsheet, FileIcon as FilePdf } from "lucide-react"
import Image from "next/image"

interface FilePreviewProps {
  file: File
  onRemove: () => void
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.type.startsWith("image/")
  const isPdf = file.type === "application/pdf"
  const isExcel =
    file.type === "application/vnd.ms-excel" ||
    file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

  // Función para formatear el tamaño del archivo
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  // Función para obtener el icono según el tipo de archivo
  const getFileIcon = () => {
    if (isPdf) return <FilePdf className="h-8 w-8 text-red-500" />
    if (isExcel) return <FileSpreadsheet className="h-8 w-8 text-green-500" />
    return <FileText className="h-8 w-8 text-blue-500" />
  }

  return (
    <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
      {isImage ? (
        <div className="relative h-12 w-12 rounded overflow-hidden bg-gray-200 dark:bg-gray-700">
          <Image
            src={URL.createObjectURL(file) || "/placeholder.svg"}
            alt={file.name}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-12 w-12 rounded bg-gray-200 dark:bg-gray-700">
          {getFileIcon()}
        </div>
      )}

      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{file.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(file.size)}</p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="ml-2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        <span className="sr-only">Eliminar archivo</span>
      </button>
    </div>
  )
}
