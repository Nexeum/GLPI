import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getIncidenciaPorId } from "@/lib/api/incidencias"
import { getComentariosPorIncidencia } from "@/lib/api/comentarios"
import { getAdjuntosPorIncidencia } from "@/lib/api/adjuntos"
import { DetalleIncidencia } from "./detalle-incidencia"
import { notFound } from "next/navigation"
import { ModernHeader } from "@/components/layout/modern-header"

export default async function DetalleIncidenciaPage({ params }) {
  const { id } = params

  // Redirigir a la página correcta si el ID es "nueva"
  if (id === "nueva") {
    notFound()
    return null
  }

  try {
    // Obtener datos de la incidencia desde Supabase
    const incidencia = await getIncidenciaPorId(id)
    const comentarios = await getComentariosPorIncidencia(id)
    const adjuntos = await getAdjuntosPorIncidencia(id)

    return (
      <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
        <ModernHeader activePage="incidencias" />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/incidencias"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Volver a Incidencias
            </Link>
          </div>

          <DetalleIncidencia incidencia={incidencia} comentarios={comentarios} adjuntos={adjuntos} />
        </main>
      </div>
    )
  } catch (error) {
    console.error(`Error al cargar la incidencia ${id}:`, error)
    notFound()
    return null
  }
}
