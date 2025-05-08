import { type NextRequest, NextResponse } from "next/server"
import { procesarArchivoCSV, descargarArchivoDesdeURL } from "@/lib/utils/csv-importer"
import { revalidatePath } from "next/cache"

export async function GET(request: NextRequest) {
  try {
    // Obtener la URL del archivo desde los parámetros de consulta
    const url = request.nextUrl.searchParams.get("url")

    if (!url) {
      return NextResponse.json({ success: false, message: "No se proporcionó una URL" }, { status: 400 })
    }

    // Descargar el archivo desde la URL
    const fileContent = await descargarArchivoDesdeURL(url)

    // Procesar el archivo CSV
    const resultado = await procesarArchivoCSV(fileContent)

    // Revalidar rutas para actualizar los datos
    revalidatePath("/incidencias")
    revalidatePath("/historico")
    revalidatePath("/kanban")

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Error en la ruta de importación desde URL:", error)
    return NextResponse.json(
      { success: false, message: `Error al procesar la solicitud: ${error.message}` },
      { status: 500 },
    )
  }
}
