"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DatePickerWithRange } from "@/app/historico/date-range-picker"
import type { DateRange } from "react-day-picker"
import { Download } from "lucide-react"

// Componente simple de toast para asegurarnos de que funcione
function Toast({
  message,
  type = "info",
  onClose,
}: { message: string; type?: "info" | "success" | "error"; onClose: () => void }) {
  return (
    <div
      className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg z-50 ${
        type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"
      } text-white`}
    >
      <div className="flex justify-between items-center">
        <p>{message}</p>
        <button onClick={onClose} className="ml-4 text-white">
          ×
        </button>
      </div>
    </div>
  )
}

export function ExportarDialog() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [tipoExportacion, setTipoExportacion] = useState("todas")
  const [incluirComentarios, setIncluirComentarios] = useState(true)
  const [incluirAdjuntos, setIncluirAdjuntos] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "info" | "success" | "error" } | null>(null)

  // Función para mostrar toast
  const showToast = useCallback((message: string, type: "info" | "success" | "error" = "info") => {
    setToast({ message, type })
    // Auto-cerrar después de 5 segundos
    setTimeout(() => setToast(null), 5000)
  }, [])

  // Función para cerrar toast
  const closeToast = useCallback(() => {
    setToast(null)
  }, [])

  // Función simplificada para exportar
  const handleExport = useCallback(async () => {
    console.log("Iniciando exportación...")
    setIsLoading(true)
    showToast("Generando exportación...", "info")

    try {
      // Construir la URL con los parámetros de filtrado
      const params = new URLSearchParams()
      params.append("formato", "xlsx")
      params.append("estadisticas", "true")

      if (dateRange?.from) {
        params.append("fechaDesde", dateRange.from.toISOString())
      }
      if (dateRange?.to) {
        params.append("fechaHasta", dateRange.to.toISOString())
      }

      if (tipoExportacion === "activas") {
        params.append("estado", "activas")
      } else if (tipoExportacion === "resueltas") {
        params.append("estado", "resuelto")
      }

      params.append("incluirComentarios", incluirComentarios.toString())
      params.append("incluirAdjuntos", incluirAdjuntos.toString())

      const url = `/api/exportar-excel?${params.toString()}`
      console.log("URL de exportación:", url)

      // Crear un enlace temporal y hacer clic en él para descargar
      const link = document.createElement("a")
      link.href = url
      link.download = `incidencias_${new Date().toISOString().split("T")[0]}.xlsx`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      console.log("Enlace de descarga creado y activado")
      showToast("Exportación iniciada. La descarga comenzará en breve.", "success")
      setOpen(false)
    } catch (error) {
      console.error("Error al exportar:", error)
      showToast("Error al exportar. Inténtelo de nuevo.", "error")
    } finally {
      setIsLoading(false)
    }
  }, [dateRange, tipoExportacion, incluirComentarios, incluirAdjuntos, showToast])

  return (
    <>
      {/* Toast simple */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {/* Botón de exportar fuera del Dialog para probar si funciona independientemente */}
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Exportar
      </Button>

      {/* Dialog para configurar la exportación */}
      {open && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Exportar a Excel</DialogTitle>
              <DialogDescription>
                Configure las opciones para exportar los datos de incidencias a un archivo Excel.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date-range">Rango de fechas</Label>
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              </div>
              <div className="grid gap-2">
                <Label>Tipo de incidencias</Label>
                <RadioGroup defaultValue="todas" value={tipoExportacion} onValueChange={setTipoExportacion}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="todas" id="todas" />
                    <Label htmlFor="todas">Todas las incidencias</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="activas" id="activas" />
                    <Label htmlFor="activas">Solo incidencias activas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="resueltas" id="resueltas" />
                    <Label htmlFor="resueltas">Solo incidencias resueltas</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid gap-2">
                <Label>Opciones adicionales</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluir-comentarios"
                    checked={incluirComentarios}
                    onCheckedChange={(checked) => setIncluirComentarios(!!checked)}
                  />
                  <Label htmlFor="incluir-comentarios">Incluir comentarios</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incluir-adjuntos"
                    checked={incluirAdjuntos}
                    onCheckedChange={(checked) => setIncluirAdjuntos(!!checked)}
                  />
                  <Label htmlFor="incluir-adjuntos">Incluir lista de adjuntos</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  console.log("Botón de exportar clickeado")
                  handleExport()
                }}
                disabled={isLoading}
              >
                {isLoading ? "Exportando..." : "Exportar a Excel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
