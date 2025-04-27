import { type NextRequest, NextResponse } from "next/server"
import { getIncidencias } from "@/lib/api/incidencias"
import { exportarIncidenciasAExcel } from "@/lib/utils/excel"

// Tipos para las opciones de exportación
type ExportOptions = {
    formato: "xlsx" | "csv";
    incluirEstadisticas: boolean;
    filtros: {
        estado?: string;
        prioridad?: string;
        propietario?: string;
        fechaDesde?: string;
        fechaHasta?: string;
    };
    columnas?: string[];
}

// Función auxiliar para manejar errores
function handleError(error: unknown) {
    console.error("Error en la API de exportación:", error)
    const errorMessage = error instanceof Error ? error.message : "Error desconocido al generar el archivo Excel"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
}

// Función común para procesar la exportación
async function processExport(options: ExportOptions) {
    console.log("Obteniendo incidencias...")
    const incidencias = await getIncidencias()
    console.log(`Se obtuvieron ${incidencias.length} incidencias`)

    console.log("Exportando a Excel...")
    const exportResult = await exportarIncidenciasAExcel(incidencias, {
        filtros: options.filtros,
        columnas: options.columnas,
        formato: options.formato,
        incluirEstadisticas: options.incluirEstadisticas,
    })
    console.log("Exportación completada")

    return new NextResponse(exportResult.buffer, {
        headers: {
            "Content-Type": exportResult.contentType,
            "Content-Disposition": `attachment; filename="${exportResult.filename}"`,
        },
    })
}

export async function GET(request: NextRequest) {
    console.log("GET /api/exportar-excel - Iniciando")
    try {
        // Obtener parámetros de la URL
        const searchParams = request.nextUrl.searchParams
        console.log("Parámetros recibidos:", Object.fromEntries(searchParams.entries()))

        // Extraer opciones de los parámetros de búsqueda
        const options: ExportOptions = {
            formato: (searchParams.get("formato") as "xlsx" | "csv") || "xlsx",
            incluirEstadisticas: searchParams.get("estadisticas") === "true",
            filtros: {
                estado: searchParams.get("estado") || undefined,
                prioridad: searchParams.get("prioridad") || undefined,
                propietario: searchParams.get("propietario") || undefined,
                fechaDesde: searchParams.get("fechaDesde") || undefined,
                fechaHasta: searchParams.get("fechaHasta") || undefined,
            },
            columnas: searchParams.get("columnas")?.split(","),
        }

        return await processExport(options)
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

        // Extraer opciones del cuerpo
        const options: ExportOptions = {
            formato: (data.formato as "xlsx" | "csv") || "xlsx",
            incluirEstadisticas: data.estadisticas === true,
            filtros: {
                estado: data.estado || undefined,
                prioridad: data.prioridad || undefined,
                propietario: data.propietario || undefined,
                fechaDesde: data.fechaDesde || undefined,
                fechaHasta: data.fechaHasta || undefined,
            },
            columnas: data.columnas,
        }

        return await processExport(options)
    } catch (error) {
        return handleError(error)
    }
}