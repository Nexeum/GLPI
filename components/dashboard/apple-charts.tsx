"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState, useEffect } from "react"
import { format, subMonths, getMonth, getYear } from "date-fns"
import { es } from "date-fns/locale"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
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
  Bar,
  Pie,
  Line,
  Cell,
} from "recharts"

export function AppleCharts({ estadisticas }) {
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

  // Colores para los gráficos al estilo Apple
  const APPLE_COLORS = [
    "#0071e3", // Azul Apple
    "#34c759", // Verde Apple
    "#ff9500", // Naranja Apple
    "#ff3b30", // Rojo Apple
    "#5ac8fa", // Azul claro Apple
    "#af52de", // Púrpura Apple
    "#ffcc00", // Amarillo Apple
    "#5856d6", // Índigo Apple
  ]

  return (
    <Card className="apple-glass-card overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/50">
        <div>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">Análisis de Incidencias</CardTitle>
          <CardDescription>Distribución y tendencias de incidencias</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[120px] apple-input">
            <SelectValue placeholder="Periodo" />
          </SelectTrigger>
          <SelectContent className="apple-glass-card">
            <SelectItem value="3m">3 meses</SelectItem>
            <SelectItem value="6m">6 meses</SelectItem>
            <SelectItem value="12m">12 meses</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="tendencia" className="h-[400px]">
          <TabsList className="flex h-10 mx-4 mt-4 mb-2 bg-gray-100/50 dark:bg-gray-800/30 rounded-full p-1 space-x-1">
            <TabsTrigger value="tendencia" className="rounded-full flex-1">
              Tendencia
            </TabsTrigger>
            <TabsTrigger value="prioridad" className="rounded-full flex-1">
              Prioridad
            </TabsTrigger>
            <TabsTrigger value="modulo" className="rounded-full flex-1">
              Módulo
            </TabsTrigger>
            <TabsTrigger value="estado" className="rounded-full flex-1">
              Estado
            </TabsTrigger>
            <TabsTrigger value="ans" className="rounded-full flex-1">
              ANS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tendencia" className="h-[350px] px-4 pb-4">
            <ChartContainer
              config={{
                Abiertas: {
                  label: "Abiertas",
                  color: "#0071e3", // Azul Apple
                },
                Resueltas: {
                  label: "Resueltas",
                  color: "#34c759", // Verde Apple
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.tendencia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Abiertas"
                    stroke="#0071e3"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Resueltas"
                    stroke="#34c759"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="prioridad" className="h-[350px] px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.prioridad} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [`${value} incidencias`, "Cantidad"]}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.prioridad.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={APPLE_COLORS[index % APPLE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  paddingAngle={2}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.modulo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={APPLE_COLORS[index % APPLE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} incidencias`, "Cantidad"]}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="estado" className="h-[350px] px-4 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.estado} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [`${value} incidencias`, "Cantidad"]}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.estado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={APPLE_COLORS[index % APPLE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  paddingAngle={2}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.ans.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.name === "En tiempo" ? "#34c759" : "#ff3b30"} // Verde y Rojo Apple
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} incidencias`, "Cantidad"]}
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
