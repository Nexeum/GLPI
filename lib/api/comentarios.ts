"use server"

import { supabaseServer } from "../supabase/supabase-server"
import { revalidatePath } from "next/cache"

// Tipo para los comentarios
export type Comentario = {
  id?: string
  incidencia_id: string
  autor: string
  fecha?: string
  texto: string
}

// Obtener comentarios de una incidencia
export async function getComentariosPorIncidencia(incidenciaId: string) {
  // Si el ID es "nueva", devolver un array vacío
  if (incidenciaId === "nueva") {
    return []
  }

  const { data, error } = await supabaseServer
    .from("comentarios")
    .select("*")
    .eq("incidencia_id", incidenciaId)
    .order("fecha", { ascending: true })

  if (error) {
    console.error(`Error al obtener comentarios para incidencia ${incidenciaId}:`, error)
    throw new Error(`Error al obtener comentarios para incidencia ${incidenciaId}`)
  }

  return data || []
}

// Crear un nuevo comentario
export async function crearComentario(comentario: Comentario) {
  // Si no se proporciona fecha, usar la fecha actual
  if (!comentario.fecha) {
    comentario.fecha = new Date().toISOString()
  }

  const { data, error } = await supabaseServer.from("comentarios").insert(comentario).select()

  if (error) {
    console.error("Error al crear comentario:", error)
    throw new Error("Error al crear comentario")
  }

  revalidatePath(`/incidencias/${comentario.incidencia_id}`)
  return data[0]
}

// Eliminar un comentario
export async function eliminarComentario(id: string, incidenciaId: string) {
  const { error } = await supabaseServer.from("comentarios").delete().eq("id", id)

  if (error) {
    console.error(`Error al eliminar comentario ${id}:`, error)
    throw new Error(`Error al eliminar comentario ${id}`)
  }

  revalidatePath(`/incidencias/${incidenciaId}`)
  return true
}
