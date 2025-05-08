"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, AlertCircle, ArrowLeft, FileSpreadsheet } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/layout/app-header"

export default function ImportarPage({ searchParams }) {
  const router = useRouter()
  // const searchParams = useSearchParams()
  const url = searchParams?.url || ""

  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultado, setResultado] = useState<{
    success?: boolean
    message?: string
    incidenciasImportadas?: number
    errores?: string[]
  } | null>(null)

  useEffect(() => {
    if (url) {
      importarDesdeURL(url)
    }
  }, [url])

  const simulateProgress = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return prev
        }
        return prev + 5
      })
    }, 300)

    return () => clearInterval(interval)
  }

  const importarDesdeURL = async (fileUrl: string) => {
    try {
      setIsLoading(true)
      setResultado(null)

      const stopProgress = simulateProgress()

      const response = await fetch(`/api/importar-csv-url?url=${encodeURIComponent(fileUrl)}`)
      const data = await response.json()

      stopProgress()
      setProgress(100)

      setResultado(data)
    } catch (error) {
      console.error("Error al importar:", error)
      setResultado({
        success: false,
        message: `Error al importar: ${error.message}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7] dark:bg-[#000000]">
      <AppHeader activePage="incidencias" />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
            Importar Incidencias desde Excel
          </h1>
          <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
            Importa incidencias desde un archivo Excel o CSV
          </p>
        </div>

        {/* Aquí iría el componente de importación */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p>URL: {url}</p>
          {/* Componente de importación */}
          <div className="mb-8">
            <Link
              href="/incidencias"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a incidencias
            </Link>
          </div>

          <Card className="apple-glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Importar incidencias desde Excel
              </CardTitle>
              <CardDescription>Importando incidencias desde el archivo proporcionado</CardDescription>
            </CardHeader>

            <CardContent>
              {url && (
                <div className="mb-4 text-sm">
                  <p className="font-medium">URL del archivo:</p>
                  <p className="mt-1 text-muted-foreground break-all">{url}</p>
                </div>
              )}

              {isLoading && (
                <div className="my-6">
                  <Progress value={progress} className="h-2" />
                  <p className="mt-2 text-sm text-center text-muted-foreground">Importando... {progress}%</p>
                </div>
              )}

              {resultado && (
                <Alert className="mt-4" variant={resultado.success ? "default" : "destructive"}>
                  {resultado.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{resultado.success ? "Importación exitosa" : "Error en la importación"}</AlertTitle>
                  <AlertDescription>
                    {resultado.message}

                    {resultado.errores && resultado.errores.length > 0 && (
                      <div className="mt-2">
                        <details>
                          <summary className="cursor-pointer font-medium">
                            Ver detalles ({resultado.errores.length} errores)
                          </summary>
                          <ul className="mt-2 ml-6 text-sm list-disc">
                            {resultado.errores.slice(0, 10).map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                            {resultado.errores.length > 10 && <li>Y {resultado.errores.length - 10} errores más...</li>}
                          </ul>
                        </details>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => router.push("/incidencias")} disabled={isLoading}>
                {resultado && resultado.success ? "Ir a incidencias" : "Cancelar"}
              </Button>

              {!url && !isLoading && !resultado && (
                <Button onClick={() => router.push("/incidencias")}>Seleccionar archivo</Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
