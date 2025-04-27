import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Send, Download, History, AlertTriangle, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DashboardIncidencias({ incidenciasANSRiesgo, ultimasResueltas }) {
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "N/A"
    try {
      return new Date(fechaStr).toLocaleDateString()
    } catch (error) {
      return fechaStr
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between bg-amber-50 dark:bg-amber-900/20 pb-2">
          <div>
            <CardTitle className="text-amber-700 dark:text-amber-300">ANS por Vencer</CardTitle>
            <CardDescription className="text-amber-600 dark:text-amber-400">
              Incidencias con ANS próximo a vencer
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-200 bg-white text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/40"
          >
            <Send className="mr-2 h-4 w-4" />
            Notificar
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {incidenciasANSRiesgo.length === 0 ? (
              <div className="text-center p-6 text-gray-500">No hay incidencias con ANS próximo a vencer</div>
            ) : (
              incidenciasANSRiesgo.map((incidencia) => (
                <div
                  key={incidencia.id}
                  className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="mr-4">
                    <AlertTriangle className="h-8 w-8 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/incidencias/${incidencia.id}`}
                      className="font-medium hover:underline text-blue-600 dark:text-blue-400"
                    >
                      {incidencia.titulo}
                    </Link>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span>{incidencia.id}</span>
                      <span>•</span>
                      <span>Prioridad: {incidencia.prioridad}</span>
                      <span>•</span>
                      <span>Propietario: {incidencia.propietario || "Sin asignar"}</span>
                    </div>
                  </div>
                  <div className="px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    {incidencia.tiempo_restante}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t p-4 bg-gray-50 dark:bg-gray-900">
          <Link href="/incidencias" className="w-full">
            <Button variant="outline" className="w-full">
              Ver todas
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between bg-green-50 dark:bg-green-900/20 pb-2">
          <div>
            <CardTitle className="text-green-700 dark:text-green-300">Histórico Reciente</CardTitle>
            <CardDescription className="text-green-600 dark:text-green-400">
              Últimas incidencias resueltas
            </CardDescription>
          </div>
          <Link href="/api/exportar-excel">
            <Button
              variant="outline"
              size="sm"
              className="border-green-200 bg-white text-green-700 hover:bg-green-50 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/40"
            >
              <Download className="mr-2 h-4 w-4" />
              Exportar Excel
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {ultimasResueltas.length === 0 ? (
              <div className="text-center p-6 text-gray-500">No hay incidencias resueltas recientemente</div>
            ) : (
              ultimasResueltas.map((incidencia) => (
                <div
                  key={incidencia.id}
                  className="flex items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="mr-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/incidencias/${incidencia.id}`}
                      className="font-medium hover:underline text-blue-600 dark:text-blue-400"
                    >
                      {incidencia.titulo}
                    </Link>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span>{incidencia.id}</span>
                      <span>•</span>
                      <span>{formatearFecha(incidencia.fecha_solucion || incidencia.fecha_creacion)}</span>
                    </div>
                  </div>
                  <Badge variant="success">Resuelto</Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="border-t p-4 bg-gray-50 dark:bg-gray-900">
          <Link href="/historico" className="w-full">
            <Button variant="outline" className="w-full">
              <History className="mr-2 h-4 w-4" />
              Ver histórico
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
