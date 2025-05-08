import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle, Download } from "lucide-react"
import { getIncidenciasActivas, getIncidenciasResueltas } from "@/lib/api/incidencias"
import { IncidenciasFiltradas } from "./incidencias-filtradas"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent } from "@/components/ui/card"
import { ImportarDialog } from "@/components/incidencias/importar-dialog"

export default async function IncidenciasPage() {
  // Obtener datos reales de Supabase
  const incidenciasActivas = await getIncidenciasActivas()
  const incidenciasResueltas = await getIncidenciasResueltas()

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7] dark:bg-[#000000]">
      <AppHeader activePage="incidencias" />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full animate-fade-in">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Incidencias</h1>
            <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
              Gestiona y monitorea todas las incidencias activas
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <ImportarDialog />
            <Link href="/api/exportar-excel">
              <Button variant="outline" className="apple-button h-10 px-4 border border-gray-200 dark:border-gray-800">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </Link>
            <Link href="/incidencias/nueva">
              <Button className="apple-button apple-button-primary h-10 px-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nueva Incidencia
              </Button>
            </Link>
          </div>
        </div>

        <Card className="apple-glass-card overflow-hidden">
          <CardContent className="p-0">
            <IncidenciasFiltradas incidenciasActivas={incidenciasActivas} incidenciasResueltas={incidenciasResueltas} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
