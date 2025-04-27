"use server"

import { supabaseServer } from "../supabase/supabase-server"
import { revalidatePath } from "next/cache"

export type Adjunto = {
  id?: string
  incidencia_id: string
  nombre: string
  tipo?: string
  tamano?: string
  url?: string
  es_script?: boolean
}

// Obtener adjuntos de una incidencia
export async function getAdjuntosPorIncidencia(incidenciaId: string) {
  // Si el ID es "nueva", devolver un array vacío
  if (incidenciaId === "nueva") {
    return []
  }

  const { data, error } = await supabaseServer.from("adjuntos").select("*").eq("incidencia_id", incidenciaId)

  if (error) {
    console.error(`Error al obtener adjuntos para incidencia ${incidenciaId}:`, error)
    throw new Error(`Error al obtener adjuntos para incidencia ${incidenciaId}`)
  }

  return data || []
}

// Crear un nuevo adjunto
export async function crearAdjunto(adjunto: Adjunto) {
  const { data, error } = await supabaseServer.from("adjuntos").insert(adjunto).select()

  if (error) {
    console.error("Error al crear adjunto:", error)
    throw new Error("Error al crear adjunto")
  }

  revalidatePath(`/incidencias/${adjunto.incidencia_id}`)
  return data[0]
}

// Eliminar un adjunto
export async function eliminarAdjunto(id: string, incidenciaId: string) {
  const { error } = await supabaseServer.from("adjuntos").delete().eq("id", id)

  if (error) {
    console.error(`Error al eliminar adjunto ${id}:`, error)
    throw new Error(`Error al eliminar adjunto ${id}`)
  }

  revalidatePath(`/incidencias/${incidenciaId}`)
  return true
}
