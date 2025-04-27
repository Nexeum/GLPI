import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { NuevaIncidenciaForm } from "./nueva-incidencia-form"
import { ModernHeader } from "@/components/layout/modern-header"

export default function NuevaIncidenciaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <ModernHeader activePage="incidencias" />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="mb-4">
          <Link
            href="/incidencias"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver a Incidencias
          </Link>
        </div>

        <Card className="shadow-sm border-none">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                Radicar Nueva Incidencia
              </CardTitle>
              <CardDescription>Complete el formulario para crear un nuevo caso de incidencia</CardDescription>
            </div>
          </CardHeader>
          <NuevaIncidenciaForm />
        </Card>
      </main>
    </div>
  )
}
