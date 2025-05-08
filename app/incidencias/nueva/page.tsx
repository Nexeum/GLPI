import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { NuevaIncidenciaForm } from "./nueva-incidencia-form"
import { AppHeader } from "@/components/layout/app-header"

export default function NuevaIncidenciaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7] dark:bg-[#000000]">
      <AppHeader activePage="incidencias" />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full animate-fade-in">
        <div className="mb-6">
          <Link
            href="/incidencias"
            className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 dark:text-primary-300 dark:hover:text-primary-200 transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Volver a Incidencias
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Nueva Incidencia</h1>
          <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
            Complete el formulario para crear un nuevo caso de incidencia
          </p>
        </div>

        <Card className="apple-glass-card overflow-hidden">
          <NuevaIncidenciaForm />
        </Card>
      </main>
    </div>
  )
}
