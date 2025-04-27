import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { getIncidenciasActivas, getIncidenciasResueltas } from "@/lib/api/incidencias"
import { IncidenciasFiltradas } from "./incidencias-filtradas"
import { ModernHeader } from "@/components/layout/modern-header"
import { ExportarDialog } from "@/components/incidencias/exportar-dialog"

export default async function IncidenciasPage() {
  // Obtener datos reales de Supabase
  const incidenciasActivas = await getIncidenciasActivas()
  const incidenciasResueltas = await getIncidenciasResueltas()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <ModernHeader activePage="incidencias" />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Card className="shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Gestión de Incidencias</CardTitle>
            <div className="flex gap-2">
              <ExportarDialog />
              <Link href="/incidencias/nueva">
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Nueva Incidencia
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <IncidenciasFiltradas incidenciasActivas={incidenciasActivas} incidenciasResueltas={incidenciasResueltas} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
