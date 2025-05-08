"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, BarChart3, Zap, Clock, CheckCircle, ArrowRight } from "lucide-react"
import { getIncidenciasActivas, getIncidenciasResueltas, getEstadisticasIncidencias } from "@/lib/api/incidencias"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AppleCharts } from "@/components/dashboard/apple-charts"
import { Progress } from "@/components/ui/progress"

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
      <div className="flex min-h-screen flex-col bg-[#f5f5f7] dark:bg-[#000000]">
        <AppHeader activePage="dashboard" />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full animate-fade-in">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
              <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                Bienvenido al panel de control de incidencias
              </p>
            </div>
            <Link href="/incidencias/nueva">
              <Button className="apple-button apple-button-primary h-10 px-6">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Incidencia
              </Button>
            </Link>
          </div>

          {/* Estadísticas principales */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <AppleStatCard
              title="Total Incidencias"
              value={estadisticas.totalIncidencias}
              icon={<BarChart3 className="h-5 w-5 text-primary" />}
              description={`${estadisticas.incidenciasActivas} activas • ${estadisticas.incidenciasResueltas} resueltas`}
              color="blue"
            />

            <AppleStatCard
              title="Cumplimiento ANS"
              value={`${Math.round((estadisticas.incidenciasPorANS["En tiempo"] / (estadisticas.incidenciasPorANS["En tiempo"] + estadisticas.incidenciasPorANS["En riesgo"] || 1)) * 100)}%`}
              icon={<Clock className="h-5 w-5 text-[#34c759]" />}
              description={`${estadisticas.incidenciasPorANS["En tiempo"]} en tiempo • ${estadisticas.incidenciasPorANS["En riesgo"]} en riesgo`}
              color="green"
              progress={
                (estadisticas.incidenciasPorANS["En tiempo"] /
                  (estadisticas.incidenciasPorANS["En tiempo"] + estadisticas.incidenciasPorANS["En riesgo"] || 1)) *
                100
              }
            />

            <AppleStatCard
              title="Incidencias Críticas"
              value={
                (estadisticas.incidenciasPorPrioridad["CRÍTICA"] || 0) +
                (estadisticas.incidenciasPorPrioridad["INDISPONIBILIDAD"] || 0)
              }
              icon={<Zap className="h-5 w-5 text-[#ff3b30]" />}
              description={`${estadisticas.incidenciasPorANS["En riesgo"]} fuera de ANS`}
              color="red"
            />

            <AppleStatCard
              title="Resueltas"
              value={estadisticas.incidenciasResueltas}
              icon={<CheckCircle className="h-5 w-5 text-[#af52de]" />}
              description={`${Math.round((estadisticas.incidenciasResueltas / estadisticas.totalIncidencias) * 100)}% del total`}
              color="purple"
            />
          </div>

          {/* Gráficos y listas */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Gráfico principal */}
            <div className="lg:col-span-2">
              <AppleCharts estadisticas={estadisticas} />
            </div>

            {/* Incidencias en riesgo */}
            <div>
              <Card className="apple-glass-card h-full">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800/50">
                  <CardTitle className="text-lg font-semibold">ANS en Riesgo</CardTitle>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Incidencias con ANS próximo a vencer</p>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
                    {incidenciasANSRiesgo.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        No hay incidencias con ANS en riesgo
                      </div>
                    ) : (
                      incidenciasANSRiesgo.map((incidencia) => (
                        <div
                          key={incidencia.id}
                          className="p-4 hover:bg-gray-100/50 dark:hover:bg-gray-800/30 transition-colors"
                        >
                          <Link href={`/incidencias/${incidencia.id}`} className="block">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-full bg-red-50 dark:bg-red-900/20">
                                <Clock className="h-5 w-5 text-[#ff3b30] dark:text-[#ff453a]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                  {incidencia.titulo}
                                </p>
                                <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="font-medium text-gray-900 dark:text-white">{incidencia.id}</span>
                                  <span className="mx-1.5">•</span>
                                  <span>{incidencia.prioridad}</span>
                                </div>
                              </div>
                              <div className="apple-chip apple-chip-destructive">{incidencia.tiempo_restante}</div>
                            </div>
                          </Link>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100 dark:border-gray-800/50">
                    <Link href="/incidencias">
                      <Button variant="ghost" className="w-full text-primary hover:bg-primary/5 flex justify-between">
                        Ver todas las incidencias
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error("Error en el Dashboard:", error)

    // Render a fallback UI
    return (
      <div className="flex min-h-screen flex-col bg-[#f5f5f7] dark:bg-[#000000]">
        <AppHeader activePage="dashboard" />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Dashboard</h1>
              <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
                Bienvenido al panel de control de incidencias
              </p>
            </div>
            <Link href="/incidencias/nueva">
              <Button className="apple-button apple-button-primary h-10 px-6">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Incidencia
              </Button>
            </Link>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50/50 p-6 dark:border-red-900/50 dark:bg-red-900/10 apple-glass-card">
            <h2 className="text-lg font-medium text-red-800 dark:text-red-300">Error al cargar datos</h2>
            <p className="mt-2 text-red-700 dark:text-red-400">
              No se pudieron cargar los datos del dashboard. Por favor, intente recargar la página.
            </p>
            <Button
              className="mt-4 bg-[#ff3b30] hover:bg-[#ff3b30]/90 text-white"
              onClick={() => window.location.reload()}
            >
              Recargar página
            </Button>
          </div>
        </main>
      </div>
    )
  }
}

// Componente de tarjeta de estadísticas al estilo Apple
function AppleStatCard({ title, value, icon, description, color = "blue", progress = null }) {
  const colorMap = {
    blue: {
      bg: "bg-primary/10 dark:bg-primary/20",
      text: "text-primary dark:text-primary-300",
      icon: "text-primary",
      progress: "bg-primary",
    },
    green: {
      bg: "bg-[#34c759]/10 dark:bg-[#34c759]/20",
      text: "text-[#34c759] dark:text-[#30d158]",
      icon: "text-[#34c759]",
      progress: "bg-[#34c759]",
    },
    red: {
      bg: "bg-[#ff3b30]/10 dark:bg-[#ff3b30]/20",
      text: "text-[#ff3b30] dark:text-[#ff453a]",
      icon: "text-[#ff3b30]",
      progress: "bg-[#ff3b30]",
    },
    purple: {
      bg: "bg-[#af52de]/10 dark:bg-[#af52de]/20",
      text: "text-[#af52de] dark:text-[#bf5af2]",
      icon: "text-[#af52de]",
      progress: "bg-[#af52de]",
    },
    yellow: {
      bg: "bg-[#ffcc00]/10 dark:bg-[#ffcc00]/20",
      text: "text-[#ffcc00] dark:text-[#ffd60a]",
      icon: "text-[#ffcc00]",
      progress: "bg-[#ffcc00]",
    },
  }

  return (
    <Card className="apple-glass-card overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <div className={cn("p-2 rounded-full", colorMap[color].bg)}>{icon}</div>
        </div>
        <div className="flex flex-col">
          <span className="text-3xl font-semibold text-gray-900 dark:text-white">{value}</span>
          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{description}</span>
        </div>
        {progress !== null && (
          <div className="mt-4">
            <Progress value={progress} className="h-1.5 bg-gray-200/50 dark:bg-gray-700/50">
              <div className={cn("h-full rounded-full", colorMap[color].progress)} />
            </Progress>
          </div>
        )}
      </div>
    </Card>
  )
}
