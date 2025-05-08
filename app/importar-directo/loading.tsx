import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7] dark:bg-[#000000]">
      <AppHeader activePage="importar" />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-48" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-full" />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="my-8">
              <Skeleton className="h-2 w-full mb-4" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>

            <div className="mt-6 flex justify-end">
              <Skeleton className="h-10 w-32 mr-2" />
              <Skeleton className="h-10 w-40" />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
