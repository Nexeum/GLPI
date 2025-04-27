"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { format, subMonths, getMonth, getYear } from "date-fns"
import { es } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart, PieChart, LineChart } from "@/components/ui/charts"

export function DashboardCharts({ estadisticas }) {
  const [timeRange, setTimeRange] = useState("6m")
  const [chartData, setChartData] = useState({
    tendencia: [],
    prioridad: [],
    modulo: [],
    estado: [],
    ans: [],
  })

  // Preparar datos para gráficas
  useEffect(() => {
    if (!estadisticas) {
      return
    }

    // Datos de prioridad
    const prioridadData = Object.entries(estadisticas?.incidenciasPorPrioridad || {}).map(([key, value]) => ({
      name: key,
      value: value,
    }))

    // Datos de módulo
    const moduloData = Object.entries(estadisticas?.incidenciasPorModulo || {})
      .filter(([_, value]) => value > 0)
      .map(([key, value]) => ({
        name: key,
        value: value,
      }))

    // Datos de estado
    const estadoData = Object.entries(estadisticas?.incidenciasPorEstado || {}).map(([key, value]) => ({
      name: key,
      value: value,
    }))

    // Datos de ANS
    const ansData = [
      { name: "En tiempo", value: estadisticas?.incidenciasPorANS?.["En tiempo"] || 0 },
      { name: "En riesgo", value: estadisticas?.incidenciasPorANS?.["En riesgo"] || 0 },
    ]

    // Generar datos de tendencia basados en el rango de tiempo seleccionado
    const now = new Date()
    const months = Number.parseInt(timeRange.replace("m", ""))
    const tendenciaData = []

    for (let i = months - 1; i >= 0; i--) {
      const date = subMonths(now, i)
      const monthName = format(date, "MMM", { locale: es })
      const year = getYear(date)
      const month = getMonth(date)

      // Simulamos datos basados en el mes y año
      const seed = month + (year % 10)
      const abiertas = Math.max(5, Math.floor(15 + seed * 1.5 + Math.sin(seed) * 5))
      const resueltas = Math.max(3, Math.floor(abiertas * (0.7 + Math.sin(seed * 0.5) * 0.2)))

      tendenciaData.push({
        name: `${monthName} ${year}`,
        Abiertas: abiertas,
        Resueltas: resueltas,
      })
    }

    setChartData({
      tendencia: tendenciaData,
      prioridad: prioridadData,
      modulo: moduloData,
      estado: estadoData,
      ans: ansData,
    })
  }, [estadisticas, timeRange])

  // Función para formatear valores
  const valueFormatter = (value) => `${value} inc.`

  return (
    <Card className="shadow-sm border-none">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
        <div>
          <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Análisis de Incidencias</CardTitle>
          <CardDescription>Distribución y tendencias de incidencias</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3m">3 meses</SelectItem>
            <SelectItem value="6m">6 meses</SelectItem>
            <SelectItem value="12m">12 meses</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="tendencia" className="h-[400px]">
          <TabsList className="grid grid-cols-5 h-9 mx-4 mt-4 mb-2 bg-gray-100 dark:bg-gray-800">
            <TabsTrigger value="tendencia">Tendencia</TabsTrigger>
            <TabsTrigger value="prioridad">Prioridad</TabsTrigger>
            <TabsTrigger value="modulo">Módulo</TabsTrigger>
            <TabsTrigger value="estado">Estado</TabsTrigger>
            <TabsTrigger value="ans">ANS</TabsTrigger>
          </TabsList>

          <TabsContent value="tendencia" className="h-[350px] px-4 pb-4">
            <LineChart
              data={chartData.tendencia}
              index="name"
              categories={["Abiertas", "Resueltas"]}
              colors={["blue", "green"]}
              valueFormatter={valueFormatter}
              showLegend={true}
              showXAxis={true}
              showYAxis={true}
              showGridLines={true}
            />
          </TabsContent>

          <TabsContent value="prioridad" className="h-[350px] px-4 pb-4">
            <BarChart
              data={chartData.prioridad}
              index="name"
              categories={["value"]}
              colors={["blue"]}
              valueFormatter={valueFormatter}
              showLegend={false}
            />
          </TabsContent>

          <TabsContent value="modulo" className="h-[350px] px-4 pb-4">
            <PieChart
              data={chartData.modulo}
              index="name"
              category="value"
              colors={["blue", "cyan", "indigo", "violet", "purple", "pink", "rose", "orange"]}
              valueFormatter={valueFormatter}
            />
          </TabsContent>

          <TabsContent value="estado" className="h-[350px] px-4 pb-4">
            <BarChart
              data={chartData.estado}
              index="name"
              categories={["value"]}
              colors={["green"]}
              valueFormatter={valueFormatter}
              showLegend={false}
            />
          </TabsContent>

          <TabsContent value="ans" className="h-[350px] px-4 pb-4">
            <PieChart
              data={chartData.ans}
              index="name"
              category="value"
              colors={["green", "red"]}
              valueFormatter={valueFormatter}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
