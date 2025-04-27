import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, BarChart3, LineChart, PieChart } from "lucide-react"
import { getIncidenciasActivas, getIncidenciasResueltas, getEstadisticasIncidencias } from "@/lib/api/incidencias"
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { DashboardIncidencias } from "@/components/dashboard/dashboard-incidencias"
import { ModernHeader } from "@/components/layout/modern-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function Dashboard() {
  try {
    // Obtener datos reales de Supabase
    const incidenciasActivas = await getIncidenciasActivas()
    const incidenciasResueltas = await getIncidenciasResueltas()
    const estadisticas = await getEstadisticasIncidencias()

    // Obtener incidencias con ANS próximo a vencer
    const incidenciasANSRiesgo = incidenciasActivas.filter((inc) => inc.ans_estado === "En riesgo").slice(0, 3)

    // Obtener últimas incidencias resueltas
    const ultimasResueltas = incidenciasResueltas
      .sort(
        (a, b) =>
          new Date(b.fecha_solucion || b.fecha_creacion).getTime() -
          new Date(a.fecha_solucion || a.fecha_creacion).getTime(),
      )
      .slice(0, 3)

    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <ModernHeader activePage="dashboard" />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Resumen de incidencias y estadísticas del sistema</p>
            </div>
            <Link href="/incidencias/nueva">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Incidencia
              </Button>
            </Link>
          </div>

          <DashboardStats estadisticas={estadisticas} />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7 mt-6">
            <div className="md:col-span-2 lg:col-span-4">
              <DashboardCharts estadisticas={estadisticas} />
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <DashboardIncidencias incidenciasANSRiesgo={incidenciasANSRiesgo} ultimasResueltas={ultimasResueltas} />
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error en el Dashboard:", error)

    // Render a fallback UI
    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <ModernHeader activePage="dashboard" />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">Resumen de incidencias y estadísticas del sistema</p>
            </div>
            <Link href="/incidencias/nueva">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Incidencia
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-blue-50 dark:bg-blue-900/20 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Sin datos</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-700 dark:text-blue-300" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">0</div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-green-50 dark:bg-green-900/20 pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Sin datos</CardTitle>
                <LineChart className="h-4 w-4 text-green-700 dark:text-green-300" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-700 dark:text-green-300">0%</div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-red-50 dark:bg-red-900/20 pb-2">
                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">Sin datos</CardTitle>
                <PieChart className="h-4 w-4 text-red-700 dark:text-red-300" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-red-700 dark:text-red-300">0</div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-none shadow-md transition-all hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-purple-50 dark:bg-purple-900/20 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Sin datos</CardTitle>
                <BarChart3 className="h-4 w-4 text-purple-700 dark:text-purple-300" />
              </CardHeader>
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300">0</div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-lg border bg-card p-6 shadow-sm mt-6">
            <h3 className="text-lg font-medium">Error al cargar datos</h3>
            <p className="text-muted-foreground mt-2">
              No se pudieron cargar los datos del dashboard. Por favor, intente recargar la página.
            </p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Recargar página
            </Button>
          </div>
        </main>
      </div>
    )
  }
}
