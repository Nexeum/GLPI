"use server"

import { supabaseServer } from "../supabase/supabase-server"
import { revalidatePath } from "next/cache"
import { type Incidencia, ANS_PRIORIDAD } from "../types/incidencias"

// Helper function to handle Supabase queries with retry logic
async function executeSupabaseQuery(queryFn) {
  const MAX_RETRIES = 3
  let retries = 0

  while (retries < MAX_RETRIES) {
    try {
      return await queryFn()
    } catch (error) {
      retries++
      if (retries >= MAX_RETRIES) {
        console.error("Max retries reached, failing query:", error)
        throw error
      }
      console.warn(`Query failed, retrying (${retries}/${MAX_RETRIES})...`)
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 500 * Math.pow(2, retries)))
    }
  }
}

// Obtener todas las incidencias
export async function getIncidencias() {
  try {
    const { data, error } = await executeSupabaseQuery(() =>
      supabaseServer.from("incidencias").select("*").order("fecha_creacion", { ascending: false }),
    )

    if (error) {
      console.error("Error al obtener incidencias:", error)
      throw new Error(`Error al obtener incidencias: ${error.message}`)
    }

    // Actualizar el tiempo restante para cada incidencia
    const incidenciasConTiempoActualizado = data.map(actualizarTiempoRestante)

    return incidenciasConTiempoActualizado
  } catch (error) {
    console.error("Error inesperado al obtener incidencias:", error)
    // Return empty array instead of throwing to prevent page crashes
    return []
  }
}

// Obtener incidencias activas (no resueltas)
export async function getIncidenciasActivas() {
  try {
    const { data, error } = await executeSupabaseQuery(() =>
      supabaseServer
        .from("incidencias")
        .select("*")
        .not("estado", "eq", "Resuelto")
        .order("fecha_creacion", { ascending: false }),
    )

    if (error) {
      console.error("Error al obtener incidencias activas:", error)
      throw new Error(`Error al obtener incidencias activas: ${error.message}`)
    }

    // Actualizar el tiempo restante para cada incidencia
    const incidenciasConTiempoActualizado = data.map(actualizarTiempoRestante)

    return incidenciasConTiempoActualizado
  } catch (error) {
    console.error("Error inesperado al obtener incidencias activas:", error)
    // Return empty array instead of throwing to prevent page crashes
    return []
  }
}

// Obtener incidencias resueltas (histórico)
export async function getIncidenciasResueltas() {
  try {
    const { data, error } = await executeSupabaseQuery(() =>
      supabaseServer
        .from("incidencias")
        .select("*")
        .eq("estado", "Resuelto")
        .order("fecha_creacion", { ascending: false }),
    )

    if (error) {
      console.error("Error al obtener incidencias resueltas:", error)
      throw new Error(`Error al obtener incidencias resueltas: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error("Error inesperado al obtener incidencias resueltas:", error)
    // Return empty array instead of throwing to prevent page crashes
    return []
  }
}

// Obtener una incidencia por ID
export async function getIncidenciaPorId(id: string) {
  // Verificar si el ID es "nueva" y manejar este caso especial
  if (id === "nueva") {
    throw new Error("ID 'nueva' es una ruta reservada, no un ID de incidencia")
  }

  try {
    const { data, error } = await executeSupabaseQuery(() =>
      supabaseServer.from("incidencias").select("*").eq("id", id).single(),
    )

    if (error) {
      console.error(`Error al obtener incidencia ${id}:`, error)
      throw new Error(`Error al obtener incidencia ${id}: ${error.message}`)
    }

    // Actualizar el tiempo restante
    const incidenciaActualizada = actualizarTiempoRestante(data)

    return incidenciaActualizada
  } catch (error) {
    console.error(`Error inesperado al obtener incidencia ${id}:`, error)
    throw error
  }
}

// Modificar la función actualizarTiempoRestante para cambiar "Nosotros" por "LinkTIC"
function actualizarTiempoRestante(incidencia: Incidencia): Incidencia {
  if (!incidencia) {
    return null
  }

  // Primero, cambiamos "Nosotros" por "LinkTIC" si es necesario
  if (incidencia.propietario === "Nosotros") {
    incidencia.propietario = "LinkTIC"
  }

  if (incidencia.estado === "Resuelto" || !incidencia.fecha_creacion) {
    return incidencia
  }

  // El resto de la función sigue igual...
  const ahora = new Date()
  const fechaCreacion = new Date(incidencia.fecha_creacion)

  // Obtener el ANS en horas según la prioridad
  let horasANS = 24 // Por defecto 24 horas

  if (incidencia.prioridad === "INDISPONIBILIDAD") horasANS = 1
  else if (incidencia.prioridad === "CRÍTICA") horasANS = 2
  else if (incidencia.prioridad === "ALTA") horasANS = 8
  else if (incidencia.prioridad === "ESTÁNDAR") horasANS = 12
  else if (incidencia.prioridad === "BAJA") horasANS = 24

  // Calcular la fecha límite
  const fechaLimite = new Date(fechaCreacion)
  fechaLimite.setHours(fechaLimite.getHours() + horasANS)

  // Calcular la diferencia en milisegundos
  const diferencia = fechaLimite.getTime() - ahora.getTime()

  // Si ya pasó el tiempo, está en riesgo
  if (diferencia <= 0) {
    const tiempoExcedido = Math.abs(diferencia)
    const horasExcedidas = Math.floor(tiempoExcedido / (1000 * 60 * 60))
    const minutosExcedidos = Math.floor((tiempoExcedido % (1000 * 60 * 60)) / (1000 * 60))

    return {
      ...incidencia,
      tiempo_restante: `Excedido por ${horasExcedidas}h ${minutosExcedidos}m`,
      ans_estado: "En riesgo",
    }
  }

  // Calcular horas y minutos restantes
  const horasRestantes = Math.floor(diferencia / (1000 * 60 * 60))
  const minutosRestantes = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60))

  // Determinar el estado del ANS
  let ansEstado = "En tiempo"

  // Si queda menos del 25% del tiempo, está en riesgo
  const tiempoTotal = horasANS * 60 * 60 * 1000
  const porcentajeRestante = (diferencia / tiempoTotal) * 100

  if (porcentajeRestante < 25) {
    ansEstado = "En riesgo"
  }

  return {
    ...incidencia,
    tiempo_restante: `${horasRestantes}h ${minutosRestantes}m`,
    ans_estado: ansEstado,
  }
}

// Modificar la función crearIncidencia para manejar la creación de usuarios
export async function crearIncidencia(incidencia: Omit<Incidencia, "id">) {
  try {
    // Si se proporciona un correo, verificar si el usuario existe
    if (incidencia.correo) {
      const { data: usuarioExistente } = await executeSupabaseQuery(() =>
        supabaseServer.from("usuarios").select("*").eq("correo", incidencia.correo).single(),
      )

      // Si el usuario no existe, crearlo primero
      if (!usuarioExistente) {
        const { error: errorUsuario } = await executeSupabaseQuery(() =>
          supabaseServer.from("usuarios").insert({
            correo: incidencia.correo,
            nombre: incidencia.nombre || "Usuario sin nombre",
          }),
        )

        if (errorUsuario) {
          console.error("Error al crear usuario:", errorUsuario)
          throw new Error(`Error al crear usuario: ${errorUsuario.message}`)
        }
      }
    }

    // Generar ID para la incidencia (formato INC-XXXX)
    const { count } = await executeSupabaseQuery(() =>
      supabaseServer.from("incidencias").select("*", { count: "exact", head: true }),
    )

    const nuevoId = `INC-${(count || 0) + 1000 + 1}`

    // Asignar ANS según prioridad
    const tiempoANS = ANS_PRIORIDAD[incidencia.prioridad] || "24h"

    const nuevaIncidencia = {
      ...incidencia,
      id: nuevoId,
      fecha_creacion: new Date().toISOString(),
      fecha_radicado: new Date().toISOString(),
      tiempo_restante: tiempoANS,
      ans_estado: "En tiempo",
    }

    const { data, error } = await executeSupabaseQuery(() =>
      supabaseServer.from("incidencias").insert(nuevaIncidencia).select(),
    )

    if (error) {
      console.error("Error al crear incidencia:", error)
      throw new Error(`Error al crear incidencia: ${error.message}`)
    }

    revalidatePath("/incidencias")
    revalidatePath("/")
    return data[0]
  } catch (error) {
    console.error("Error inesperado al crear incidencia:", error)
    throw error
  }
}

// Actualizar una incidencia
export async function actualizarIncidencia(id: string, incidencia: Partial<Incidencia>) {
  try {
    // Si se actualiza la prioridad, actualizar el tiempo ANS
    if (incidencia.prioridad && ANS_PRIORIDAD[incidencia.prioridad]) {
      incidencia.tiempo_restante = ANS_PRIORIDAD[incidencia.prioridad]
    }

    // Si se cambia el estado a "Resuelto", establecer la fecha de solución
    if (incidencia.estado === "Resuelto" && !incidencia.fecha_solucion) {
      incidencia.fecha_solucion = new Date().toISOString()
    }

    const { data, error } = await executeSupabaseQuery(() =>
      supabaseServer.from("incidencias").update(incidencia).eq("id", id).select(),
    )

    if (error) {
      console.error(`Error al actualizar incidencia ${id}:`, error)
      throw new Error(`Error al actualizar incidencia ${id}: ${error.message}`)
    }

    revalidatePath(`/incidencias/${id}`)
    revalidatePath("/incidencias")
    revalidatePath("/historico")
    revalidatePath("/")

    return data[0]
  } catch (error) {
    console.error(`Error inesperado al actualizar incidencia ${id}:`, error)
    throw error
  }
}

// Eliminar una incidencia
export async function eliminarIncidencia(id: string) {
  try {
    const { error } = await executeSupabaseQuery(() => supabaseServer.from("incidencias").delete().eq("id", id))

    if (error) {
      console.error(`Error al eliminar incidencia ${id}:`, error)
      throw new Error(`Error al eliminar incidencia ${id}: ${error.message}`)
    }

    revalidatePath("/incidencias")
    revalidatePath("/historico")
    revalidatePath("/")
    return true
  } catch (error) {
    console.error(`Error inesperado al eliminar incidencia ${id}:`, error)
    throw error
  }
}

// Obtener estadísticas para el dashboard
export async function getEstadisticasIncidencias() {
  try {
    const incidenciasActivas = await getIncidenciasActivas()
    const incidenciasResueltas = await getIncidenciasResueltas()

    // Total de incidencias
    const totalIncidencias = incidenciasActivas.length + incidenciasResueltas.length

    // Incidencias por prioridad
    const incidenciasPorPrioridad = {
      INDISPONIBILIDAD: 0,
      CRÍTICA: 0,
      ALTA: 0,
      ESTÁNDAR: 0,
      BAJA: 0,
    }

    incidenciasActivas.forEach((inc) => {
      if (inc.prioridad && incidenciasPorPrioridad[inc.prioridad] !== undefined) {
        incidenciasPorPrioridad[inc.prioridad]++
      }
    })

    // Incidencias por módulo
    const incidenciasPorModulo = {}
    // Inicializar contadores para cada módulo
    const modulos = ["Cotizacion", "Emision", "Recaudo", "Facturación", "Siniestros", "Reserva", "OBP", "Novedades"]
    modulos.forEach((modulo) => {
      incidenciasPorModulo[modulo] = 0
    })

    incidenciasActivas.forEach((inc) => {
      if (inc.modulo && incidenciasPorModulo[inc.modulo] !== undefined) {
        incidenciasPorModulo[inc.modulo]++
      }
    })

    // Incidencias por estado
    const incidenciasPorEstado = {
      Abierto: 0,
      "En progreso": 0,
      Resuelto: incidenciasResueltas.length,
      "Devuelto/cancelado": 0,
    }

    incidenciasActivas.forEach((inc) => {
      if (inc.estado && incidenciasPorEstado[inc.estado] !== undefined) {
        incidenciasPorEstado[inc.estado]++
      }
    })

    // Incidencias por ANS
    const incidenciasPorANS = {
      "En tiempo": 0,
      "En riesgo": 0,
    }

    incidenciasActivas.forEach((inc) => {
      if (inc.ans_estado === "En tiempo") {
        incidenciasPorANS["En tiempo"]++
      } else if (inc.ans_estado === "En riesgo") {
        incidenciasPorANS["En riesgo"]++
      }
    })

    return {
      totalIncidencias,
      incidenciasActivas: incidenciasActivas.length,
      incidenciasResueltas: incidenciasResueltas.length,
      incidenciasPorPrioridad,
      incidenciasPorModulo,
      incidenciasPorEstado,
      incidenciasPorANS,
    }
  } catch (error) {
    console.error("Error al obtener estadísticas:", error)
    // Return default values to prevent page crashes
    return {
      totalIncidencias: 0,
      incidenciasActivas: 0,
      incidenciasResueltas: 0,
      incidenciasPorPrioridad: {
        INDISPONIBILIDAD: 0,
        CRÍTICA: 0,
        ALTA: 0,
        ESTÁNDAR: 0,
        BAJA: 0,
      },
      incidenciasPorModulo: {},
      incidenciasPorEstado: {
        Abierto: 0,
        "En progreso": 0,
        Resuelto: 0,
        "Devuelto/cancelado": 0,
      },
      incidenciasPorANS: {
        "En tiempo": 0,
        "En riesgo": 0,
      },
    }
  }
}

export type { Incidencia }
