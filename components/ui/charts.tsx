"use client"

import { BarChart as TremorBarChart, DonutChart, LineChart as TremorLineChart } from "@tremor/react"

export function BarChart({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
  startEndOnly = false,
  showAnimation = false,
}) {
  return (
    <TremorBarChart
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      showLegend={showLegend}
      showXAxis={showXAxis}
      showYAxis={showYAxis}
      showGridLines={showGridLines}
      startEndOnly={startEndOnly}
      showAnimation={showAnimation}
      className="h-full"
    />
  )
}

// Cambiamos PieChart por DonutChart que es lo que ofrece Tremor
export function PieChart({
  data,
  index,
  category,
  colors,
  valueFormatter,
  showAnimation = false,
  showTooltip = true,
  showLegend = true,
}) {
  return (
    <DonutChart
      data={data}
      index={index}
      category={category}
      colors={colors}
      valueFormatter={valueFormatter}
      showAnimation={showAnimation}
      showTooltip={showTooltip}
      showLegend={showLegend}
      className="h-full"
    />
  )
}

export function LineChart({
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showLegend = true,
  showXAxis = true,
  showYAxis = true,
  showGridLines = true,
  startEndOnly = false,
  showAnimation = false,
}) {
  return (
    <TremorLineChart
      data={data}
      index={index}
      categories={categories}
      colors={colors}
      valueFormatter={valueFormatter}
      showLegend={showLegend}
      showXAxis={showXAxis}
      showYAxis={showYAxis}
      showGridLines={showGridLines}
      startEndOnly={startEndOnly}
      showAnimation={showAnimation}
      className="h-full"
    />
  )
}
