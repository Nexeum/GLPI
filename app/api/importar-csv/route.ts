import { type NextRequest, NextResponse } from "next/server"
import { procesarArchivoCSV, descargarArchivoDesdeURL } from "@/lib/utils/csv-importer"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const fileUrl = formData.get("fileUrl") as string | null

    let fileContent: string

    if (file) {
      // Procesar archivo subido
      fileContent = await file.text()
    } else if (fileUrl) {
      // Descargar archivo desde URL
      try {
        fileContent = await descargarArchivoDesdeURL(fileUrl)
      } catch (error) {
        console.error("Error al descargar el archivo desde URL:", error)
        return NextResponse.json(
          {
            success: false,
            message: `Error al descargar el archivo desde URL: ${error.message}`,
          },
          { status: 400 },
        )
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "No se proporcionó ningún archivo o URL",
        },
        { status: 400 },
      )
    }

    // Procesar el archivo CSV
    const resultado = await procesarArchivoCSV(fileContent)

    // Revalidar rutas para actualizar los datos
    revalidatePath("/incidencias")
    revalidatePath("/historico")
    revalidatePath("/kanban")

    return NextResponse.json(resultado)
  } catch (error) {
    console.error("Error en la ruta de importación:", error)
    return NextResponse.json(
      {
        success: false,
        message: `Error al procesar la solicitud: ${error.message}`,
      },
      { status: 500 },
    )
  }
}
