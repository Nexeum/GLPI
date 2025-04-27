import { getIncidencias } from "@/lib/api/incidencias"
import { ModernHeader } from "@/components/layout/modern-header"
import { KanbanBoard } from "./kanban-board"

export default async function KanbanPage() {
  // Obtener todas las incidencias
  const incidencias = await getIncidencias()

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <ModernHeader activePage="kanban" />

      <main className="flex-1 p-4 md:p-6 max-w-full mx-auto w-full overflow-hidden">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Tablero Kanban</h2>
          <p className="text-muted-foreground">Gestiona el flujo de trabajo de las incidencias</p>
        </div>

        <KanbanBoard incidencias={incidencias} />
      </main>
    </div>
  )
}
