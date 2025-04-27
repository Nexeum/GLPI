import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, FileCheck, AlertTriangle, CheckCircle } from "lucide-react"

export function DashboardStats({ estadisticas }) {
  // Calcular porcentajes
  const porcentajeResueltas =
    estadisticas.totalIncidencias > 0
      ? Math.round((estadisticas.incidenciasResueltas / estadisticas.totalIncidencias) * 100)
      : 0

  const porcentajeCumplimientoANS =
    estadisticas.incidenciasPorANS["En tiempo"] + estadisticas.incidenciasPorANS["En riesgo"] > 0
      ? Math.round(
          (estadisticas.incidenciasPorANS["En tiempo"] /
            (estadisticas.incidenciasPorANS["En tiempo"] + estadisticas.incidenciasPorANS["En riesgo"])) *
            100,
        )
      : 100

  const incidenciasCriticas =
    (estadisticas.incidenciasPorPrioridad["CRÍTICA"] || 0) +
    (estadisticas.incidenciasPorPrioridad["INDISPONIBILIDAD"] || 0)

  const criticasFueraANS = estadisticas.incidenciasPorANS["En riesgo"] || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-blue-50 dark:bg-blue-900/20 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Incidencias</CardTitle>
          <FileCheck className="h-4 w-4 text-blue-700 dark:text-blue-300" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{estadisticas.totalIncidencias}</div>
          <div className="mt-1 flex items-center text-xs text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-1">
              <span className="font-medium">{estadisticas.incidenciasActivas}</span> activas
            </div>
            <span className="mx-1">•</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">{estadisticas.incidenciasResueltas}</span> resueltas
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-green-50 dark:bg-green-900/20 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Cumplimiento ANS</CardTitle>
          <Clock className="h-4 w-4 text-green-700 dark:text-green-300" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-3xl font-bold text-green-700 dark:text-green-300">{porcentajeCumplimientoANS}%</div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: `${porcentajeCumplimientoANS}%`,
                backgroundColor:
                  porcentajeCumplimientoANS > 80 ? "#10b981" : porcentajeCumplimientoANS > 50 ? "#f59e0b" : "#ef4444",
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-red-50 dark:bg-red-900/20 pb-2">
          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Incidencias Críticas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-700 dark:text-red-300" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-3xl font-bold text-red-700 dark:text-red-300">{incidenciasCriticas}</div>
          <div className="mt-1 flex items-center text-xs text-red-600 dark:text-red-400">
            <div className="flex items-center gap-1">
              <span className="font-medium">{criticasFueraANS}</span> fuera de ANS
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-purple-50 dark:bg-purple-900/20 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Resueltas</CardTitle>
          <CheckCircle className="h-4 w-4 text-purple-700 dark:text-purple-300" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">
            {estadisticas.incidenciasResueltas}
          </div>
          <div className="mt-1 flex items-center text-xs text-purple-600 dark:text-purple-400">
            <div className="flex items-center gap-1">
              <span className="font-medium">{porcentajeResueltas}%</span> del total
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
