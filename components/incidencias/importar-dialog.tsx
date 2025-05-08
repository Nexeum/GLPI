"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, FileUp, LinkIcon, Upload, RefreshCw } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

export function ImportarDialog() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("archivo")
  const [file, setFile] = useState<File | null>(null)
  const [fileUrl, setFileUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [resultado, setResultado] = useState<{
    success?: boolean
    message?: string
    incidenciasImportadas?: number
    errores?: string[]
  } | null>(null)

  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileUrl(e.target.value)
  }

  const resetForm = () => {
    setFile(null)
    setFileUrl("")
    setResultado(null)
    setProgress(0)
  }

  const handleClose = () => {
    if (!isLoading) {
      setOpen(false)
      setTimeout(resetForm, 300)
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === "archivo" && !file) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo",
        variant: "destructive",
      })
      return
    }

    if (activeTab === "url" && !fileUrl) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL válida",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      setResultado(null)

      const stopProgress = simulateProgress()

      const formData = new FormData()

      if (activeTab === "archivo" && file) {
        formData.append("file", file)
      } else if (activeTab === "url") {
        formData.append("fileUrl", fileUrl)
      }

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

      if (data.success) {
        toast({
          title: "Importación exitosa",
          description: data.message,
        })
      } else {
        toast({
          title: "Error en la importación",
          description: data.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al importar:", error)
      setResultado({
        success: false,
        message: `Error al importar: ${error.message}`,
      })

      toast({
        title: "Error",
        description: `Error al importar: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    resetForm()
    setResultado(null)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Upload className="h-4 w-4" />
          Importar Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Importar incidencias desde Excel</DialogTitle>
          <DialogDescription>
            Importa incidencias desde un archivo Excel o CSV. El sistema intentará mapear los campos automáticamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {!resultado && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="archivo" disabled={isLoading}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Subir archivo
                </TabsTrigger>
                <TabsTrigger value="url" disabled={isLoading}>
                  <LinkIcon className="mr-2 h-4 w-4" />
                  Desde URL
                </TabsTrigger>
              </TabsList>

              <TabsContent value="archivo" className="mt-4">
                <div className="grid w-full gap-4">
                  <Label htmlFor="file" className="text-left">
                    Selecciona un archivo Excel o CSV
                  </Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                  {file && (
                    <div className="text-sm text-muted-foreground">
                      Archivo seleccionado: <span className="font-medium">{file.name}</span> (
                      {(file.size / 1024).toFixed(2)} KB)
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="url" className="mt-4">
                <div className="grid w-full gap-4">
                  <Label htmlFor="url" className="text-left">
                    URL del archivo Excel o CSV
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://ejemplo.com/archivo.csv"
                    value={fileUrl}
                    onChange={handleUrlChange}
                    disabled={isLoading}
                  />
                </div>
              </TabsContent>
            </Tabs>
          )}

          {isLoading && (
            <div className="mt-4">
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

          <DialogFooter className="mt-6">
            {!resultado ? (
              <>
                <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || (activeTab === "archivo" && !file) || (activeTab === "url" && !fileUrl)}
                >
                  {isLoading ? "Importando..." : "Importar"}
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cerrar
                </Button>
                {!resultado.success && (
                  <Button type="button" onClick={handleSubmit} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </Button>
                )}
                <Button type="button" onClick={handleReset} variant="secondary" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Nuevo archivo
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
