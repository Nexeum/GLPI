"use server"

import { supabaseServer } from "../supabase/supabase-server"

export type Usuario = {
  id?: string
  nombre: string
  correo: string
  creado_en?: string
}

// Obtener un usuario por correo
export async function getUsuarioPorCorreo(correo: string) {
  const { data, error } = await supabaseServer.from("usuarios").select("*").eq("correo", correo).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 es el código de error cuando no se encuentra un registro
    console.error(`Error al obtener usuario con correo ${correo}:`, error)
    throw new Error(`Error al obtener usuario con correo ${correo}`)
  }

  return data
}

// Crear un nuevo usuario
export async function crearUsuario(usuario: Usuario) {
  // Verificar si el usuario ya existe
  const usuarioExistente = await getUsuarioPorCorreo(usuario.correo)

  if (usuarioExistente) {
    return usuarioExistente
  }

  const { data, error } = await supabaseServer.from("usuarios").insert(usuario).select()

  if (error) {
    console.error("Error al crear usuario:", error)
    throw new Error("Error al crear usuario")
  }

  return data[0]
}

// Actualizar un usuario
export async function actualizarUsuario(correo: string, usuario: Partial<Usuario>) {
  const { data, error } = await supabaseServer.from("usuarios").update(usuario).eq("correo", correo).select()

  if (error) {
    console.error(`Error al actualizar usuario con correo ${correo}:`, error)
    throw new Error(`Error al actualizar usuario con correo ${correo}`)
  }

  return data[0]
}
