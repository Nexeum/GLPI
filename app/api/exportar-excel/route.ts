import { type NextRequest, NextResponse } from "next/server"
import { getIncidencias } from "@/lib/api/incidencias"
import { exportarIncidenciasAExcel } from "@/lib/utils/excel"

// Función auxiliar para manejar errores
function handleError(error: unknown) {
  console.error("Error en la API de exportación:", error)
  const errorMessage = error instanceof Error ? error.message : "Error desconocido al generar el archivo Excel"
  return NextResponse.json({ error: errorMessage }, { status: 500 })
}

export async function GET(request: NextRequest) {
  console.log("GET /api/exportar-excel - Iniciando")
  try {
    // Obtener parámetros de la URL
    const searchParams = request.nextUrl.searchParams
    console.log("Parámetros recibidos:", Object.fromEntries(searchParams.entries()))

    const formato = (searchParams.get("formato") as "xlsx" | "csv") || "xlsx"
    const incluirEstadisticas = searchParams.get("estadisticas") === "true"

    // Filtros
    const estado = searchParams.get("estado") || undefined
    const prioridad = searchParams.get("prioridad") || undefined
    const propietario = searchParams.get("propietario") || undefined
    const fechaDesde = searchParams.get("fechaDesde") || undefined
    const fechaHasta = searchParams.get("fechaHasta") || undefined

    // Columnas (separadas por comas)
    const columnasParam = searchParams.get("columnas")
    const columnas = columnasParam ? columnasParam.split(",") : undefined

    console.log("Obteniendo incidencias...")
    // Obtener todas las incidencias
    const incidencias = await getIncidencias()
    console.log(`Se obtuvieron ${incidencias.length} incidencias`)

    console.log("Exportando a Excel...")
    // Exportar a Excel con opciones
    const exportResult = await exportarIncidenciasAExcel(incidencias, {
      filtros: {
        estado,
        prioridad,
        propietario,
        fechaDesde,
        fechaHasta,
      },
      columnas,
      formato,
      incluirEstadisticas,
    })
    console.log("Exportación completada")

    // Configurar la respuesta
    return new NextResponse(exportResult.buffer, {
      headers: {
        "Content-Type": exportResult.contentType,
        "Content-Disposition": `attachment; filename="${exportResult.filename}"`,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  console.log("POST /api/exportar-excel - Iniciando")
  try {
    // Obtener datos del cuerpo de la solicitud
    const data = await request.json()
    console.log("Datos recibidos:", data)

    // Extraer opciones
    const formato = (data.formato as "xlsx" | "csv") || "xlsx"
    const incluirEstadisticas = data.estadisticas === true

    // Filtros
    const estado = data.estado || undefined
    const prioridad = data.prioridad || undefined
    const propietario = data.propietario || undefined
    const fechaDesde = data.fechaDesde || undefined
    const fechaHasta = data.fechaHasta || undefined

    // Columnas
    const columnas = data.columnas || undefined

    console.log("Obteniendo incidencias...")
    // Obtener todas las incidencias
    const incidencias = await getIncidencias()
    console.log(`Se obtuvieron ${incidencias.length} incidencias`)

    console.log("Exportando a Excel...")
    // Exportar a Excel con opciones
    const exportResult = await exportarIncidenciasAExcel(incidencias, {
      filtros: {
        estado,
        prioridad,
        propietario,
        fechaDesde,
        fechaHasta,
      },
      columnas,
      formato,
      incluirEstadisticas,
    })
    console.log("Exportación completada")

    // Configurar la respuesta
    return new NextResponse(exportResult.buffer, {
      headers: {
        "Content-Type": exportResult.contentType,
        "Content-Disposition": `attachment; filename="${exportResult.filename}"`,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}
