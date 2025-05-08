"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AppHeader } from "@/components/layout/app-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, ArrowLeft, Upload, RefreshCw, FileUp } from "lucide-react"
import Link from "next/link"

export default function ImportarDirectoPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const url = searchParams.get("url")

  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultado, setResultado] = useState<{
    success?: boolean
    message?: string
    incidenciasImportadas?: number
    errores?: string[]
  } | null>(null)
  const [newUrl, setNewUrl] = useState(url || "")
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [showFileInput, setShowFileInput] = useState(false)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUrl(e.target.value)
  }

  const importarDesdeURL = async (fileUrl: string) => {
    try {
      setIsLoading(true)
      setResultado(null)
      setShowUrlInput(false)
      setShowFileInput(false)

      const stopProgress = simulateProgress()

      const formData = new FormData()
      formData.append("fileUrl", fileUrl)

      const response = await fetch("/api/importar-csv", {
        method: "POST",
        body: formData,
      })

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}. ${errorText}`)
      }

      // Intentar parsear la respuesta como JSON
      let data
      try {
        data = await response.json()
      } catch (error) {
        throw new Error(`Error al parsear la respuesta: ${error.message}`)
      }

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

  const importarDesdeArchivo = async () => {
    if (!file) return

    try {
      setIsLoading(true)
      setResultado(null)
      setShowUrlInput(false)
      setShowFileInput(false)

      const stopProgress = simulateProgress()

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/importar-csv", {
        method: "POST",
        body: formData,
      })

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}. ${errorText}`)
      }

      // Intentar parsear la respuesta como JSON
      let data
      try {
        data = await response.json()
      } catch (error) {
        throw new Error(`Error al parsear la respuesta: ${error.message}`)
      }

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

  const handleImportarNuevaUrl = () => {
    if (newUrl) {
      router.push(`/importar-directo?url=${encodeURIComponent(newUrl)}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f7] dark:bg-[#000000]">
      <AppHeader activePage="importar" />

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full animate-fade-in">
        <div className="mb-8">
          <Link href="/incidencias" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Volver a incidencias
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Importar Excel</h1>
          <p className="mt-1 text-base text-gray-500 dark:text-gray-400">
            Importación de incidencias desde archivo Excel o CSV
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Importación desde URL</CardTitle>
            <CardDescription>
              {url
                ? `Importando desde: ${url.substring(0, 50)}${url.length > 50 ? "..." : ""}`
                : "No se ha proporcionado una URL para importar"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!url && !showFileInput && !showUrlInput && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  No se ha proporcionado una URL para importar. Utiliza el formato:
                  /importar-directo?url=https://ejemplo.com/archivo.csv
                </AlertDescription>
              </Alert>
            )}

            {isLoading && (
              <div className="my-8">
                <Progress value={progress} className="h-2" />
                <p className="mt-4 text-center text-muted-foreground">Importando... {progress}%</p>
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
                          {resultado.errores.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {resultado.errores.length > 5 && <li>Y {resultado.errores.length - 5} errores más...</li>}
                        </ul>
                      </details>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {showUrlInput && (
              <div className="mt-6 space-y-4">
                <div className="grid w-full gap-2">
                  <Label htmlFor="new-url">Nueva URL del archivo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="new-url"
                      type="url"
                      placeholder="https://ejemplo.com/archivo.csv"
                      value={newUrl}
                      onChange={handleUrlChange}
                      className="flex-1"
                    />
                    <Button onClick={handleImportarNuevaUrl} disabled={!newUrl}>
                      Importar
                    </Button>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setShowUrlInput(false)} className="w-full">
                  Cancelar
                </Button>
              </div>
            )}

            {showFileInput && (
              <div className="mt-6 space-y-4">
                <div className="grid w-full gap-2">
                  <Label htmlFor="file">Seleccionar archivo</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  {file && (
                    <p className="text-sm text-muted-foreground">
                      Archivo seleccionado: <span className="font-medium">{file.name}</span> (
                      {(file.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button onClick={importarDesdeArchivo} disabled={!file} className="flex-1">
                    Importar archivo
                  </Button>
                  <Button variant="outline" onClick={() => setShowFileInput(false)} className="flex-1">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-wrap gap-2">
            <Link href="/incidencias">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver a incidencias
              </Button>
            </Link>

            {resultado && !resultado.success && !isLoading && !showUrlInput && !showFileInput && (
              <>
                <Button onClick={() => url && importarDesdeURL(url)} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reintentar importación
                </Button>
                <Button onClick={() => setShowUrlInput(true)} variant="secondary" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Usar otra URL
                </Button>
                <Button onClick={() => setShowFileInput(true)} variant="secondary" className="gap-2">
                  <FileUp className="h-4 w-4" />
                  Subir archivo
                </Button>
              </>
            )}

            {resultado && resultado.success && !isLoading && (
              <Button onClick={() => setShowFileInput(true)} variant="secondary" className="gap-2">
                <FileUp className="h-4 w-4" />
                Importar otro archivo
              </Button>
            )}

            {!resultado && !isLoading && !url && !showUrlInput && !showFileInput && (
              <>
                <Button onClick={() => setShowUrlInput(true)} variant="secondary" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Importar desde URL
                </Button>
                <Button onClick={() => setShowFileInput(true)} variant="secondary" className="gap-2">
                  <FileUp className="h-4 w-4" />
                  Subir archivo
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </main>
    </div>
  )
}
