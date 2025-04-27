"use server"

import * as XLSX from "xlsx"
import type { Incidencia } from "@/lib/types/incidencias"

interface ExportOptions {
  filtros?: {
    estado?: string
    prioridad?: string
    propietario?: string
    fechaDesde?: string
    fechaHasta?: string
  }
  columnas?: string[]
  formato?: "xlsx" | "csv"
  incluirEstadisticas?: boolean
}

export async function exportarIncidenciasAExcel(incidencias: Incidencia[], options: ExportOptions = {}) {
  try {
    // Aplicar filtros si existen
    let incidenciasFiltradas = [...incidencias]

    if (options.filtros) {
      const { estado, prioridad, propietario, fechaDesde, fechaHasta } = options.filtros

      if (estado && estado !== "todos") {
        incidenciasFiltradas = incidenciasFiltradas.filter((inc) => inc.estado?.toLowerCase() === estado.toLowerCase())
      }

      if (prioridad && prioridad !== "todas") {
        incidenciasFiltradas = incidenciasFiltradas.filter(
          (inc) => inc.prioridad?.toLowerCase() === prioridad.toLowerCase(),
        )
      }

      if (propietario && propietario !== "todos") {
        incidenciasFiltradas = incidenciasFiltradas.filter((inc) => inc.propietario === propietario)
      }

      if (fechaDesde) {
        const desde = new Date(fechaDesde)
        incidenciasFiltradas = incidenciasFiltradas.filter((inc) => {
          if (!inc.fecha_creacion) return false
          const fechaInc = new Date(inc.fecha_creacion)
          return fechaInc >= desde
        })
      }

      if (fechaHasta) {
        const hasta = new Date(fechaHasta)
        hasta.setHours(23, 59, 59, 999) // Fin del día
        incidenciasFiltradas = incidenciasFiltradas.filter((inc) => {
          if (!inc.fecha_creacion) return false
          const fechaInc = new Date(inc.fecha_creacion)
          return fechaInc <= hasta
        })
      }
    }

    // Definir todas las columnas disponibles
    const todasLasColumnas = {
      ID: (inc: Incidencia) => inc.id,
      Título: (inc: Incidencia) => inc.titulo,
      Descripción: (inc: Incidencia) => inc.descripcion,
      Estado: (inc: Incidencia) => inc.estado,
      Prioridad: (inc: Incidencia) => inc.prioridad,
      "Fecha Creación": (inc: Incidencia) =>
        inc.fecha_creacion ? new Date(inc.fecha_creacion).toLocaleDateString() : "",
      "Fecha Solución": (inc: Incidencia) =>
        inc.fecha_solucion ? new Date(inc.fecha_solucion).toLocaleDateString() : "",
      Solicitante: (inc: Incidencia) => inc.nombre,
      Correo: (inc: Incidencia) => inc.correo,
      Aplicativo: (inc: Incidencia) => inc.aplicativo,
      Módulo: (inc: Incidencia) => inc.modulo,
      "ID Azure": (inc: Incidencia) => inc.azure,
      "ID GLPI": (inc: Incidencia) => inc.glpi,
      Propietario: (inc: Incidencia) => inc.propietario,
      "Estado ANS": (inc: Incidencia) => inc.ans_estado,
      "Tiempo Restante": (inc: Incidencia) => inc.tiempo_restante,
      "Fecha Diagnóstico": (inc: Incidencia) =>
        inc.fecha_diagnostico ? new Date(inc.fecha_diagnostico).toLocaleDateString() : "",
      "Fecha Desarrollo": (inc: Incidencia) =>
        inc.fecha_entrega_desarrollo ? new Date(inc.fecha_entrega_desarrollo).toLocaleDateString() : "",
      "Fecha QA": (inc: Incidencia) =>
        inc.fecha_entrega_qa ? new Date(inc.fecha_entrega_qa).toLocaleDateString() : "",
      "Fecha UAT": (inc: Incidencia) =>
        inc.fecha_entrega_uat ? new Date(inc.fecha_entrega_uat).toLocaleDateString() : "",
      Asignado: (inc: Incidencia) => inc.asignado,
      "Tiene Script": (inc: Incidencia) => (inc.tiene_script ? "Sí" : "No"),
      Bitácora: (inc: Incidencia) => inc.bitacora,
    }

    // Seleccionar columnas a incluir
    const columnasSeleccionadas = options.columnas || Object.keys(todasLasColumnas)

    // Preparar los datos para Excel
    const data = incidenciasFiltradas.map((inc) => {
      const fila = {}
      columnasSeleccionadas.forEach((columna) => {
        if (todasLasColumnas[columna]) {
          fila[columna] = todasLasColumnas[columna](inc)
        }
      })
      return fila
    })

    // Crear libro de Excel
    const workbook = XLSX.utils.book_new()

    // Hoja principal de incidencias
    const worksheet = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(workbook, worksheet, "Incidencias")

    // Ajustar anchos de columna
    const columnsWidth = columnasSeleccionadas.map((col) => ({
      wch: col === "Descripción" || col === "Bitácora" ? 50 : 15,
    }))
    worksheet["!cols"] = columnsWidth

    // Agregar hoja de estadísticas si se solicita
    if (options.incluirEstadisticas) {
      // Estadísticas por prioridad
      const prioridadStats = {}
      incidenciasFiltradas.forEach((inc) => {
        if (inc.prioridad) {
          prioridadStats[inc.prioridad] = (prioridadStats[inc.prioridad] || 0) + 1
        }
      })

      const prioridadData = Object.entries(prioridadStats).map(([prioridad, cantidad]) => ({
        Prioridad: prioridad,
        Cantidad: cantidad,
      }))

      // Estadísticas por estado
      const estadoStats = {}
      incidenciasFiltradas.forEach((inc) => {
        if (inc.estado) {
          estadoStats[inc.estado] = (estadoStats[inc.estado] || 0) + 1
        }
      })

      const estadoData = Object.entries(estadoStats).map(([estado, cantidad]) => ({
        Estado: estado,
        Cantidad: cantidad,
      }))

      // Estadísticas por ANS
      const ansStats = {
        "En tiempo": 0,
        "En riesgo": 0,
      }

      incidenciasFiltradas.forEach((inc) => {
        if (inc.ans_estado === "En tiempo") ansStats["En tiempo"]++
        else if (inc.ans_estado === "En riesgo") ansStats["En riesgo"]++
      })

      const ansData = Object.entries(ansStats).map(([estado, cantidad]) => ({
        "Estado ANS": estado,
        Cantidad: cantidad,
      }))

      // Crear hojas de estadísticas
      const prioridadSheet = XLSX.utils.json_to_sheet(prioridadData)
      const estadoSheet = XLSX.utils.json_to_sheet(estadoData)
      const ansSheet = XLSX.utils.json_to_sheet(ansData)

      XLSX.utils.book_append_sheet(workbook, prioridadSheet, "Por Prioridad")
      XLSX.utils.book_append_sheet(workbook, estadoSheet, "Por Estado")
      XLSX.utils.book_append_sheet(workbook, ansSheet, "Por ANS")
    }

    // Convertir a buffer según el formato solicitado
    const formato = options.formato || "xlsx"
    const excelBuffer = XLSX.write(workbook, { bookType: formato, type: "buffer" })

    return {
      buffer: excelBuffer,
      filename: `incidencias.${formato}`,
      contentType:
        formato === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv",
    }
  } catch (error) {
    console.error("Error en exportarIncidenciasAExcel:", error)
    throw new Error(`Error al exportar a Excel: ${error.message || "Error desconocido"}`)
  }
}
