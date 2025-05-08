import { getIncidenciaPorId } from "@/lib/api/incidencias"
import { getComentariosPorIncidencia } from "@/lib/api/comentarios"
import { getAdjuntosPorIncidencia } from "@/lib/api/adjuntos"
import { DetalleIncidencia } from "./detalle-incidencia"
import { notFound } from "next/navigation"
import { AppHeader } from "@/components/layout/app-header"

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
      <div className="flex min-h-screen flex-col bg-[#f5f5f7] dark:bg-[#000000]">
        <AppHeader activePage="incidencias" />

        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full animate-fade-in">
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
