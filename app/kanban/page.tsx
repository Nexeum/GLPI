import { getIncidencias } from "@/lib/api/incidencias"
import { AppHeader } from "@/components/layout/app-header"
import { KanbanBoard } from "./kanban-board"

export default async function KanbanPage() {
  // Obtener todas las incidencias
  const incidencias = await getIncidencias()

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7] dark:bg-[#000000]">
      <AppHeader activePage="kanban" />

      <main className="flex-1 p-4 md:p-6 max-w-full mx-auto w-full overflow-hidden animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Tablero Kanban</h1>
          <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
            Gestiona el flujo de trabajo de las incidencias
          </p>
        </div>

        <KanbanBoard incidencias={incidencias} />
      </main>
    </div>
  )
}
