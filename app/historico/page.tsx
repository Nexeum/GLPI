import { Card, CardContent } from "@/components/ui/card"
import { getIncidenciasResueltas } from "@/lib/api/incidencias"
import { HistoricoFiltrado } from "./historico-filtrado"
import { AppHeader } from "@/components/layout/app-header"
import { ExportarDialog } from "@/components/incidencias/exportar-dialog"

export default async function HistoricoPage() {
  // Obtener datos reales de Supabase
  const incidenciasResueltas = await getIncidenciasResueltas()

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7] dark:bg-[#000000]">
      <AppHeader activePage="historico" />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full animate-fade-in">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Histórico</h1>
            <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
              Consulta el historial completo de incidencias resueltas
            </p>
          </div>
          <ExportarDialog />
        </div>

        <Card>
          <CardContent className="p-6">
            <HistoricoFiltrado incidenciasResueltas={incidenciasResueltas} />
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
