"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Clock, AlertTriangle, CheckCircle } from "lucide-react"

interface CountdownTimerProps {
  deadline?: Date
  createdAt?: Date
  isCompleted?: boolean
  ansEstado?: string
  tiempoRestante?: string
}

export function CountdownTimer({
  deadline,
  createdAt,
  isCompleted = false,
  ansEstado,
  tiempoRestante,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("")
  const [progress, setProgress] = useState<number>(100)
  const [status, setStatus] = useState<"normal" | "warning" | "danger" | "completed">("normal")

  useEffect(() => {
    // Si tenemos ansEstado y tiempoRestante directamente, usamos esos valores
    if (ansEstado && tiempoRestante) {
      setTimeLeft(tiempoRestante)
      setStatus(ansEstado === "En riesgo" ? "danger" : isCompleted ? "completed" : "normal")

      // Calcular un progreso aproximado basado en el estado
      if (isCompleted) {
        setProgress(100)
      } else if (ansEstado === "En riesgo") {
        setProgress(25)
      } else {
        setProgress(75)
      }

      return
    }

    // Si no tenemos los valores directos, calculamos basados en deadline y createdAt
    if (!deadline || isCompleted) {
      setTimeLeft(isCompleted ? "Completado" : "No disponible")
      setProgress(isCompleted ? 100 : 0)
      setStatus(isCompleted ? "completed" : "normal")
      return
    }

    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = deadline.getTime() - now.getTime()

      if (difference <= 0) {
        setTimeLeft("Vencido")
        setProgress(0)
        setStatus("danger")
        return
      }

      // Calcular tiempo total desde creación hasta deadline
      let totalTime = 0
      if (createdAt) {
        totalTime = deadline.getTime() - createdAt.getTime()
      } else {
        totalTime = deadline.getTime() - now.getTime() + 86400000 // Asumimos 24 horas si no hay fecha de creación
      }

      // Calcular tiempo transcurrido
      const elapsed = totalTime - difference
      const progressValue = Math.max(0, Math.min(100, 100 - (elapsed / totalTime) * 100))
      setProgress(progressValue)

      // Calcular días, horas y minutos restantes
      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))

      // Determinar el estado basado en el tiempo restante
      if (days === 0 && hours < 12) {
        setStatus(hours < 4 ? "danger" : "warning")
      } else {
        setStatus("normal")
      }

      // Formatear el tiempo restante
      if (days > 0) {
        setTimeLeft(`${days} día${days !== 1 ? "s" : ""}`)
      } else if (hours > 0) {
        setTimeLeft(`${hours} hora${hours !== 1 ? "s" : ""}`)
      } else {
        setTimeLeft(`${minutes} minuto${minutes !== 1 ? "s" : ""}`)
      }
    }

    // Actualizar cada minuto
    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000)

    return () => clearInterval(timer)
  }, [deadline, createdAt, isCompleted, ansEstado, tiempoRestante])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {status === "completed" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : status === "danger" ? (
            <AlertTriangle className="h-5 w-5 text-red-500" />
          ) : (
            <Clock className="h-5 w-5 text-blue-500" />
          )}
          <span
            className={`font-medium ${
              status === "completed"
                ? "text-green-600"
                : status === "danger"
                  ? "text-red-600"
                  : status === "warning"
                    ? "text-amber-600"
                    : "text-blue-600"
            }`}
          >
            {timeLeft}
          </span>
        </div>
        <span className="text-xs text-gray-500">ANS</span>
      </div>

      <Progress
        value={progress}
        className={`h-2 ${
          status === "completed"
            ? "bg-green-100"
            : status === "danger"
              ? "bg-red-100"
              : status === "warning"
                ? "bg-amber-100"
                : "bg-blue-100"
        }`}
        indicatorClassName={
          status === "completed"
            ? "bg-green-500"
            : status === "danger"
              ? "bg-red-500"
              : status === "warning"
                ? "bg-amber-500"
                : "bg-blue-500"
        }
      />
    </div>
  )
}
