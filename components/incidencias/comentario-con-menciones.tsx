"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare } from "lucide-react"

// Lista de usuarios para mencionar
const USUARIOS = [
  { id: "u1", nombre: "Ana Gómez", correo: "AG45678@andinavidaseguros.com.co" },
  { id: "u2", nombre: "Juan Pérez", correo: "JP12345@andinavidaseguros.com.co" },
  { id: "u3", nombre: "María López", correo: "ML56789@andinavidaseguros.com.co" },
  { id: "u4", nombre: "Pedro Sánchez", correo: "PS98765@andinavidaseguros.com.co" },
  { id: "u5", nombre: "Carlos Ramírez", correo: "CR24680@andinavidaseguros.com.co" },
]

interface ComentarioConMencionesProps {
  onSubmit: (texto: string) => Promise<void>
  isSubmitting: boolean
  placeholder?: string
}

export function ComentarioConMenciones({
  onSubmit,
  isSubmitting,
  placeholder = "Escribe tu comentario aquí...",
}: ComentarioConMencionesProps) {
  const [texto, setTexto] = useState("")
  const [mostrarMenciones, setMostrarMenciones] = useState(false)
  const [posicionCursor, setPosicionCursor] = useState(0)
  const [usuariosFiltrados, setUsuariosFiltrados] = useState(USUARIOS)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Detectar cuando se escribe '@' para mostrar el popover de menciones
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setTexto(value)

    const cursorPos = e.target.selectionStart || 0
    setPosicionCursor(cursorPos)

    // Buscar '@' antes del cursor
    const textoPrevio = value.substring(0, cursorPos)
    const ultimaArroba = textoPrevio.lastIndexOf("@")

    if (ultimaArroba !== -1 && cursorPos - ultimaArroba <= 15) {
      // Si hay un '@' y no hay espacio entre @ y el cursor
      const busqueda = textoPrevio.substring(ultimaArroba + 1).toLowerCase()

      // Filtrar usuarios que coincidan con la búsqueda
      const filtrados = USUARIOS.filter((usuario) => usuario.nombre.toLowerCase().includes(busqueda))

      setUsuariosFiltrados(filtrados)
      setMostrarMenciones(true)
    } else {
      setMostrarMenciones(false)
    }
  }

  // Insertar mención de usuario en el texto
  const insertarMencion = (usuario: any) => {
    if (!textareaRef.current) return

    const textoPrevio = texto.substring(0, posicionCursor)
    const ultimaArroba = textoPrevio.lastIndexOf("@")

    if (ultimaArroba !== -1) {
      const inicio = texto.substring(0, ultimaArroba)
      const fin = texto.substring(posicionCursor)

      const nuevoTexto = `${inicio}@${usuario.nombre} ${fin}`
      setTexto(nuevoTexto)

      // Calcular nueva posición del cursor
      const nuevaPosicion = ultimaArroba + usuario.nombre.length + 2 // +2 por @ y espacio

      // Establecer foco y posición del cursor después de actualizar el texto
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.setSelectionRange(nuevaPosicion, nuevaPosicion)
        }
      }, 0)
    }

    setMostrarMenciones(false)
  }

  // Cerrar el popover al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setMostrarMenciones(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Enviar comentario
  const handleSubmit = async () => {
    if (texto.trim()) {
      await onSubmit(texto)
      setTexto("")
    }
  }

  // Formatear texto con menciones resaltadas
  const formatearTextoConMenciones = (texto: string) => {
    let resultado = texto

    // Reemplazar @nombre con span resaltado
    USUARIOS.forEach((usuario) => {
      const regex = new RegExp(`@${usuario.nombre}\\b`, "g")
      resultado = resultado.replace(regex, `<span class="text-primary font-medium">@${usuario.nombre}</span>`)
    })

    return resultado
  }

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        placeholder={placeholder}
        value={texto}
        onChange={handleChange}
        className="min-h-[100px] resize-none"
      />

      {mostrarMenciones && usuariosFiltrados.length > 0 && (
        <div
          ref={popoverRef}
          className="absolute z-10 mt-1 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg border overflow-hidden"
        >
          <div className="p-2 border-b text-xs font-medium text-gray-500">Mencionar a un usuario</div>
          <div className="max-h-48 overflow-y-auto">
            {usuariosFiltrados.map((usuario) => (
              <div
                key={usuario.id}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => insertarMencion(usuario)}
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs">
                    {usuario.nombre
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">{usuario.nombre}</div>
                  <div className="text-xs text-gray-500">{usuario.correo}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-2 flex justify-between items-center">
        <div className="text-xs text-gray-500">Usa @ para mencionar a un usuario</div>
        <Button onClick={handleSubmit} disabled={isSubmitting || !texto.trim()}>
          <MessageSquare className="mr-2 h-4 w-4" />
          {isSubmitting ? "Enviando..." : "Enviar comentario"}
        </Button>
      </div>

      {texto && (
        <div className="mt-4 p-3 border rounded-md bg-gray-50 dark:bg-gray-900">
          <div className="text-xs font-medium text-gray-500 mb-1">Vista previa:</div>
          <div className="text-sm" dangerouslySetInnerHTML={{ __html: formatearTextoConMenciones(texto) }} />
        </div>
      )}
    </div>
  )
}
