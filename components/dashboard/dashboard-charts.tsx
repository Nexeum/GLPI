"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { format, subMonths, getMonth, getYear } from "date-fns"
import { es } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, Line, Pie } from "recharts"
import {
  ResponsiveContainer,
  BarChart,
  PieChart,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

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
            <ChartContainer
              config={{
                Abiertas: {
                  label: "Abiertas",
                  color: "hsl(var(--chart-1))",
                },
                Resueltas: {
                  label: "Resueltas",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.tendencia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="Abiertas" stroke="var(--color-Abiertas)" />
                  <Line type="monotone" dataKey="Resueltas" stroke="var(--color-Resueltas)" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="prioridad" className="h-[350px] px-4 pb-4">
            <ChartContainer
              config={{
                value: {
                  label: "Incidencias",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.prioridad}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="modulo" className="h-[350px] px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.modulo}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.modulo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} incidencias`, "Cantidad"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="estado" className="h-[350px] px-4 pb-4">
            <ChartContainer
              config={{
                value: {
                  label: "Incidencias",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.estado}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="ans" className="h-[350px] px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.ans}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.ans.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === "En tiempo" ? "#4ade80" : "#ef4444"} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} incidencias`, "Cantidad"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Colores para los gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d", "#ffc658", "#8dd1e1"]

// Componente Cell para los gráficos de tipo Pie
function Cell({ fill, children }) {
  return <g fill={fill}>{children}</g>
}
