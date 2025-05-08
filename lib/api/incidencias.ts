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

// Función para calcular el tiempo restante
function actualizarTiempoRestante(incidencia: Incidencia): Incidencia {
  const prioridad = incidencia.prioridad
  const fechaCreacion = new Date(incidencia.fecha_creacion)
  let tiempoLimiteEnHoras = 0

  switch (prioridad) {
    case ANS_PRIORIDAD.ALTA:
      tiempoLimiteEnHoras = 4
      break
    case ANS_PRIORIDAD.MEDIA:
      tiempoLimiteEnHoras = 8
      break
    case ANS_PRIORIDAD.BAJA:
      tiempoLimiteEnHoras = 24
      break
    default:
      tiempoLimiteEnHoras = 24 // Valor por defecto
  }

  const fechaLimite = new Date(fechaCreacion)
  let horasAgregadas = 0

  while (horasAgregadas < tiempoLimiteEnHoras) {
    fechaLimite.setHours(fechaLimite.getHours() + 1)
    const fechaTemporal = new Date(fechaLimite) // Crear una nueva instancia de Date

    if (!esFinDeSemana(fechaTemporal) && !esFestivoEnColombia(fechaTemporal)) {
      horasAgregadas++
    }
  }

  const ahora = new Date()
  const tiempoRestanteEnMilisegundos = fechaLimite.getTime() - ahora.getTime()
  const tiempoRestanteEnHoras = tiempoRestanteEnMilisegundos / (1000 * 60 * 60)

  // Formatear el tiempo restante
  let tiempoRestanteFormateado = ""
  if (tiempoRestanteEnHoras >= 24) {
    tiempoRestanteFormateado = `${Math.floor(tiempoRestanteEnHoras / 24)} días`
  } else if (tiempoRestanteEnHoras >= 1) {
    tiempoRestanteFormateado = `${Math.floor(tiempoRestanteEnHoras)} horas`
  } else if (tiempoRestanteEnMilisegundos > 0) {
    tiempoRestanteFormateado = "Menos de 1 hora"
  } else {
    tiempoRestanteFormateado = "Tiempo excedido"
  }

  return {
    ...incidencia,
    tiempo_restante: tiempoRestanteFormateado,
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

// Crear una nueva incidencia
export async function crearIncidencia(incidencia: Incidencia) {
  const { data, error } = await executeSupabaseQuery(() =>
    supabaseServer.from("incidencias").insert([incidencia]).select().single(),
  )

  if (error) {
    console.error("Error al crear incidencia:", error)
    throw new Error(`Error al crear incidencia: ${error.message}`)
  }

  revalidatePath("/incidencias")
  return data
}

// Actualizar una incidencia
export async function actualizarIncidencia(id: string, updates: Partial<Incidencia>) {
  const { data, error } = await executeSupabaseQuery(() =>
    supabaseServer.from("incidencias").update(updates).eq("id", id).select().single(),
  )

  if (error) {
    console.error(`Error al actualizar incidencia ${id}:`, error)
    throw new Error(`Error al actualizar incidencia ${id}: ${error.message}`)
  }

  revalidatePath(`/incidencias/${id}`)
  revalidatePath("/incidencias")
  revalidatePath("/kanban")
  return data
}

// Eliminar una incidencia
export async function eliminarIncidencia(id: string) {
  const { error } = await executeSupabaseQuery(() => supabaseServer.from("incidencias").delete().eq("id", id))

  if (error) {
    console.error(`Error al eliminar incidencia ${id}:`, error)
    throw new Error(`Error al eliminar incidencia ${id}: ${error.message}`)
  }

  revalidatePath("/incidencias")
  return true
}

// Función para obtener estadísticas de incidencias
export async function getEstadisticasIncidencias() {
  try {
    // Total de incidencias
    const { count: totalIncidencias, error: totalError } = await supabaseServer
      .from("incidencias")
      .select("*", { count: "exact", head: true })

    if (totalError) {
      console.error("Error al obtener total de incidencias:", totalError)
      throw new Error(`Error al obtener total de incidencias: ${totalError.message}`)
    }

    // Incidencias resueltas
    const { count: incidenciasResueltas, error: resueltasError } = await supabaseServer
      .from("incidencias")
      .select("*", { count: "exact", head: true })
      .eq("estado", "Resuelto")

    if (resueltasError) {
      console.error("Error al obtener incidencias resueltas:", resueltasError)
      throw new Error(`Error al obtener incidencias resueltas: ${resueltasError.message}`)
    }

    // Incidencias activas
    const { count: incidenciasActivas, error: activasError } = await supabaseServer
      .from("incidencias")
      .select("*", { count: "exact", head: true })
      .not("estado", "eq", "Resuelto")

    if (activasError) {
      console.error("Error al obtener incidencias activas:", activasError)
      throw new Error(`Error al obtener incidencias activas: ${activasError.message}`)
    }

    // Incidencias por prioridad
    const { data: incidenciasPorPrioridadData, error: prioridadError } = await supabaseServer
      .from("incidencias")
      .select("prioridad")

    if (prioridadError) {
      console.error("Error al obtener incidencias por prioridad:", prioridadError)
      throw new Error(`Error al obtener incidencias por prioridad: ${prioridadError.message}`)
    }

    const incidenciasPorPrioridad = {}
    incidenciasPorPrioridadData.forEach((item) => {
      const prioridad = item.prioridad || "Sin prioridad"
      incidenciasPorPrioridad[prioridad] = (incidenciasPorPrioridad[prioridad] || 0) + 1
    })

    // Incidencias por módulo
    const { data: incidenciasPorModuloData, error: moduloError } = await supabaseServer
      .from("incidencias")
      .select("modulo")

    if (moduloError) {
      console.error("Error al obtener incidencias por módulo:", moduloError)
      throw new Error(`Error al obtener incidencias por módulo: ${moduloError.message}`)
    }

    const incidenciasPorModulo = {}
    incidenciasPorModuloData.forEach((item) => {
      const modulo = item.modulo || "Sin módulo"
      incidenciasPorModulo[modulo] = (incidenciasPorModulo[modulo] || 0) + 1
    })

    // Incidencias por estado
    const { data: incidenciasPorEstadoData, error: estadoError } = await supabaseServer
      .from("incidencias")
      .select("estado")

    if (estadoError) {
      console.error("Error al obtener incidencias por estado:", estadoError)
      throw new Error(`Error al obtener incidencias por estado: ${estadoError.message}`)
    }

    const incidenciasPorEstado = {}
    incidenciasPorEstadoData.forEach((item) => {
      const estado = item.estado || "Sin estado"
      incidenciasPorEstado[estado] = (incidenciasPorEstado[estado] || 0) + 1
    })

    // Incidencias por ANS
    const { data: incidenciasPorANSData, error: ansError } = await supabaseServer
      .from("incidencias")
      .select("ans_estado")

    if (ansError) {
      console.error("Error al obtener incidencias por ANS:", ansError)
      throw new Error(`Error al obtener incidencias por ANS: ${ansError.message}`)
    }

    const incidenciasPorANS = {
      "En tiempo": 0,
      "En riesgo": 0,
    }
    incidenciasPorANSData.forEach((item) => {
      const ansEstado = item.ans_estado
      if (ansEstado === "En tiempo") {
        incidenciasPorANS["En tiempo"]++
      } else if (ansEstado === "En riesgo") {
        incidenciasPorANS["En riesgo"]++
      }
    })

    return {
      totalIncidencias: totalIncidencias || 0,
      incidenciasResueltas: incidenciasResueltas || 0,
      incidenciasActivas: incidenciasActivas || 0,
      incidenciasPorPrioridad: incidenciasPorPrioridad,
      incidenciasPorModulo: incidenciasPorModulo,
      incidenciasPorEstado: incidenciasPorEstado,
      incidenciasPorANS: incidenciasPorANS,
    }
  } catch (error) {
    console.error("Error al obtener estadísticas de incidencias:", error)
    return {
      totalIncidencias: 0,
      incidenciasResueltas: 0,
      incidenciasActivas: 0,
      incidenciasPorPrioridad: {},
      incidenciasPorModulo: {},
      incidenciasPorEstado: {},
      incidenciasPorANS: { "En tiempo": 0, "En riesgo": 0 },
    }
  }
}

// Función para verificar si una fecha es fin de semana (sábado o domingo)
function esFinDeSemana(fecha) {
  const dia = fecha.getDay()
  return dia === 0 || dia === 6 // 0 es domingo, 6 es sábado
}

// Función para verificar si una fecha es festivo en Colombia
function esFestivoEnColombia(fecha) {
  // Lista de festivos en Colombia para 2023-2024
  // Formato: "MM-DD"
  const festivosColombia = [
    // 2023
    "01-01",
    "01-09",
    "03-20",
    "04-06",
    "04-07",
    "04-09",
    "05-01",
    "05-22",
    "06-12",
    "06-19",
    "07-03",
    "07-20",
    "08-07",
    "08-21",
    "10-16",
    "11-06",
    "11-13",
    "12-08",
    "12-25",
    // 2024
    "01-01",
    "01-08",
    "03-25",
    "03-28",
    "03-29",
    "03-31",
    "05-01",
    "05-13",
    "06-03",
    "06-10",
    "07-01",
    "07-20",
    "08-07",
    "08-19",
    "10-14",
    "11-04",
    "11-11",
    "12-08",
    "12-25",
  ]
  const fechaFormateada = `${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`
  return festivosColombia.includes(fechaFormateada)
}

// Obtener todas las incidencias
export async function obtenerIncidencias() {
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
