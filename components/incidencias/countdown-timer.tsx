"use client"

import { useEffect, useState } from "react"
import { Clock, AlertTriangle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  deadline?: Date
  createdAt?: Date
  isCompleted?: boolean
  ansEstado?: string
  tiempoRestante?: string
  className?: string
}

export function CountdownTimer({
  deadline,
  createdAt,
  isCompleted = false,
  ansEstado,
  tiempoRestante,
  className,
}: CountdownTimerProps) {
  const [tiempo, setTiempo] = useState<string>(tiempoRestante || "Calculando...")
  const [estado, setEstado] = useState<"normal" | "riesgo" | "excedido" | "completado">(
    isCompleted ? "completado" : "normal",
  )
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)

    // Determinar el estado basado en los props
    if (isCompleted) {
      setEstado("completado")
    } else if (ansEstado === "Excedido") {
      setEstado("excedido")
    } else if (ansEstado === "En riesgo") {
      setEstado("riesgo")
    } else {
      setEstado("normal")
    }

    // Usar el tiempo restante proporcionado
    if (tiempoRestante) {
      setTiempo(tiempoRestante)
    }
    // O calcular basado en deadline y createdAt si están disponibles
    else if (deadline && createdAt) {
      const ahora = new Date()
      const tiempoRestanteMs = deadline.getTime() - ahora.getTime()

      if (tiempoRestanteMs <= 0) {
        setTiempo("Tiempo excedido")
        setEstado("excedido")
      } else {
        // Convertir a horas
        const horas = Math.floor(tiempoRestanteMs / (1000 * 60 * 60))
        const minutos = Math.floor((tiempoRestanteMs % (1000 * 60 * 60)) / (1000 * 60))

        setTiempo(`${horas}h ${minutos}m`)

        // Si queda menos del 20% del tiempo, está en riesgo
        const tiempoTotal = deadline.getTime() - createdAt.getTime()
        const porcentajeRestante = (tiempoRestanteMs / tiempoTotal) * 100

        if (porcentajeRestante < 20) {
          setEstado("riesgo")
        }
      }
    }

    // Actualizar cada minuto
    const interval = setInterval(() => {
      if (deadline && !isCompleted) {
        const ahora = new Date()
        const tiempoRestanteMs = deadline.getTime() - ahora.getTime()

        if (tiempoRestanteMs <= 0) {
          setTiempo("Tiempo excedido")
          setEstado("excedido")
        } else {
          const horas = Math.floor(tiempoRestanteMs / (1000 * 60 * 60))
          const minutos = Math.floor((tiempoRestanteMs % (1000 * 60 * 60)) / (1000 * 60))

          setTiempo(`${horas}h ${minutos}m`)

          // Si queda menos del 20% del tiempo, está en riesgo
          if (createdAt) {
            const tiempoTotal = deadline.getTime() - createdAt.getTime()
            const porcentajeRestante = (tiempoRestanteMs / tiempoTotal) * 100

            if (porcentajeRestante < 20) {
              setEstado("riesgo")
            }
          }
        }
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [deadline, createdAt, isCompleted, ansEstado, tiempoRestante])

  // Si estamos en el servidor o el componente acaba de montar, mostrar un placeholder
  if (!isClient) {
    return <div className={cn("text-gray-400", className)}>Calculando...</div>
  }

  // Renderizar según el estado
  if (estado === "completado") {
    return (
      <div className={cn("flex items-center text-green-600 dark:text-green-400", className)}>
        <Clock className="mr-1 h-4 w-4" />
        <span>Completado</span>
      </div>
    )
  }

  if (estado === "excedido") {
    return (
      <div className={cn("flex items-center text-red-600 dark:text-red-400", className)}>
        <AlertCircle className="mr-1 h-4 w-4" />
        <span>ANS Incumplido</span>
      </div>
    )
  }

  if (estado === "riesgo") {
    return (
      <div className={cn("flex items-center text-amber-600 dark:text-amber-400", className)}>
        <AlertTriangle className="mr-1 h-4 w-4" />
        <span>En riesgo: {tiempo}</span>
      </div>
    )
  }

  // Caso normal
  return (
    <div className={cn("flex items-center", className)}>
      <Clock className="mr-1 h-4 w-4" />
      <span>{tiempo}</span>
    </div>
  )
}
