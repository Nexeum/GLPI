import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getIncidenciasResueltas } from "@/lib/api/incidencias"
import { HistoricoFiltrado } from "./historico-filtrado"
import { ModernHeader } from "@/components/layout/modern-header"
import { ExportarDialog } from "@/components/incidencias/exportar-dialog"

export default async function HistoricoPage() {
  // Obtener datos reales de Supabase
  const incidenciasResueltas = await getIncidenciasResueltas()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <ModernHeader activePage="historico" />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <Card className="shadow-sm border-none">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Histórico de Incidencias</CardTitle>
            <ExportarDialog />
          </CardHeader>
          <CardContent>
            <HistoricoFiltrado incidenciasResueltas={incidenciasResueltas} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
