"use client"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type TimelineStep = {
  id: string
  title: string
  description?: string
  date?: string
  status: "completed" | "current" | "pending" | "error"
}

interface TimelineProps {
  steps: TimelineStep[]
  className?: string
}

export function Timeline({ steps, className }: TimelineProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.id} className="mb-8 flex items-start last:mb-0">
            <div className="flex flex-col items-center mr-4">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2",
                  step.status === "completed" && "border-green-500 bg-green-50 text-green-500",
                  step.status === "current" && "border-blue-500 bg-blue-50 text-blue-500",
                  step.status === "pending" && "border-gray-300 bg-gray-50 text-gray-500",
                  step.status === "error" && "border-red-500 bg-red-50 text-red-500",
                )}
              >
                {step.status === "completed" ? (
                  <CheckCircle2 className="h-6 w-6" />
                ) : step.status === "current" ? (
                  <Clock className="h-6 w-6" />
                ) : step.status === "error" ? (
                  <AlertCircle className="h-6 w-6" />
                ) : (
                  <div className="h-3 w-3 rounded-full bg-gray-300" />
                )}
              </div>
              {index < steps.length - 1 && <div className="h-full w-0.5 bg-gray-200 dark:bg-gray-700" />}
            </div>
            <div className="flex-1 pt-1.5">
              <h3
                className={cn(
                  "text-lg font-medium",
                  step.status === "completed" && "text-green-600",
                  step.status === "current" && "text-blue-600",
                  step.status === "pending" && "text-gray-600",
                  step.status === "error" && "text-red-600",
                )}
              >
                {step.title}
              </h3>
              {step.description && <p className="mt-1 text-sm text-gray-500">{step.description}</p>}
              {step.date && <p className="mt-1 text-xs text-gray-400">{step.date}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
