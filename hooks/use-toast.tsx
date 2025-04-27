"use client"

import { useState } from "react"

type ToastVariant = "default" | "destructive" | "success"

type ToastProps = {
  title: string
  description?: string
  variant?: ToastVariant
  id?: string
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = (props: ToastProps) => {
    const id = props.id || Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...props, id }])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 5000)
  }

  return { toast, toasts }
}
