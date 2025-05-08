import type { Incidencia } from "../types/incidencias"

// Festivos colombianos 2024
const FESTIVOS_COLOMBIA_2024 = [
  new Date(2024, 0, 1), // Año Nuevo
  new Date(2024, 0, 8), // Día de los Reyes Magos
  new Date(2024, 2, 25), // Día de San José
  new Date(2024, 2, 28), // Jueves Santo
  new Date(2024, 2, 29), // Viernes Santo
  new Date(2024, 4, 1), // Día del Trabajo
  new Date(2024, 4, 13), // Día de la Ascensión
  new Date(2024, 5, 3), // Corpus Christi
  new Date(2024, 5, 10), // Sagrado Corazón
  new Date(2024, 6, 1), // San Pedro y San Pablo
  new Date(2024, 6, 20), // Día de la Independencia
  new Date(2024, 7, 7), // Batalla de Boyacá
  new Date(2024, 7, 19), // La Asunción
  new Date(2024, 9, 14), // Día de la Raza
  new Date(2024, 10, 4), // Todos los Santos
  new Date(2024, 10, 11), // Independencia de Cartagena
  new Date(2024, 11, 8), // Día de la Inmaculada Concepción
  new Date(2024, 11, 25), // Navidad
]

// Festivos colombianos 2025
const FESTIVOS_COLOMBIA_2025 = [
  new Date(2025, 0, 1), // Año Nuevo
  new Date(2025, 0, 6), // Día de los Reyes Magos
  new Date(2025, 2, 24), // Día de San José
  new Date(2025, 3, 17), // Jueves Santo
  new Date(2025, 3, 18), // Viernes Santo
  new Date(2025, 4, 1), // Día del Trabajo
  new Date(2025, 5, 2), // Día de la Ascensión
  new Date(2025, 5, 23), // Corpus Christi
  new Date(2025, 5, 30), // Sagrado Corazón
  new Date(2025, 5, 30), // San Pedro y San Pablo
  new Date(2025, 6, 20), // Día de la Independencia
  new Date(2025, 7, 7), // Batalla de Boyacá
  new Date(2025, 7, 18), // La Asunción
  new Date(2025, 9, 13), // Día de la Raza
  new Date(2025, 10, 3), // Todos los Santos
  new Date(2025, 10, 17), // Independencia de Cartagena
  new Date(2025, 11, 8), // Día de la Inmaculada Concepción
  new Date(2025, 11, 25), // Navidad
]

// Combinar todos los festivos
const FESTIVOS = [...FESTIVOS_COLOMBIA_2024, ...FESTIVOS_COLOMBIA_2025]

// Horas laborales: 8am a 6pm (10 horas por día)
const HORA_INICIO = 8 // 8:00 AM
const HORA_FIN = 18 // 6:00 PM
const HORAS_LABORALES_POR_DIA = HORA_FIN - HORA_INICIO

/**
 * Verifica si una fecha es un día festivo
 */
export function esFestivo(fecha: Date): boolean {
  return FESTIVOS.some(
    (festivo) =>
      festivo.getDate() === fecha.getDate() &&
      festivo.getMonth() === fecha.getMonth() &&
      festivo.getFullYear() === fecha.getFullYear(),
  )
}

/**
 * Verifica si una fecha es un día laboral (no es fin de semana ni festivo)
 */
export function esDiaLaboral(fecha: Date): boolean {
  const diaSemana = fecha.getDay()
  // 0 es domingo, 6 es sábado
  if (diaSemana === 0 || diaSemana === 6) {
    return false
  }

  // Verificar si es festivo
  return !esFestivo(fecha)
}

/**
 * Calcula las horas laborales entre dos fechas
 */
export function calcularHorasLaborales(fechaInicio: Date, fechaFin: Date): number {
  // Si la fecha de fin es anterior a la de inicio, retornar 0
  if (fechaFin < fechaInicio) {
    return 0
  }

  let horasLaborales = 0
  const fechaActual = new Date(fechaInicio)

  // Ajustar la fecha de inicio si está fuera del horario laboral
  if (fechaActual.getHours() < HORA_INICIO) {
    fechaActual.setHours(HORA_INICIO, 0, 0, 0)
  } else if (fechaActual.getHours() >= HORA_FIN) {
    // Si es después del horario laboral, avanzar al siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1)
    fechaActual.setHours(HORA_INICIO, 0, 0, 0)
  }

  while (fechaActual < fechaFin) {
    if (esDiaLaboral(fechaActual)) {
      const horaActual = fechaActual.getHours()

      // Si estamos dentro del horario laboral
      if (horaActual >= HORA_INICIO && horaActual < HORA_FIN) {
        // Añadir una hora
        horasLaborales += 1
      }
    }

    // Avanzar una hora
    fechaActual.setHours(fechaActual.getHours() + 1)

    // Si llegamos al final del día laboral, avanzar al siguiente día
    if (fechaActual.getHours() >= HORA_FIN) {
      fechaActual.setDate(fechaActual.getDate() + 1)
      fechaActual.setHours(HORA_INICIO, 0, 0, 0)
    }
  }

  return horasLaborales
}

/**
 * Calcula el tiempo restante de ANS en horas laborales
 */
export function calcularTiempoRestanteANS(incidencia: Incidencia): number {
  if (!incidencia || !incidencia.fecha_creacion || !incidencia.tiempoANS) {
    return 0
  }

  const fechaCreacion = new Date(incidencia.fecha_creacion)
  const horasANS = incidencia.tiempoANS

  // Si la incidencia está resuelta, el tiempo restante es 0
  if (incidencia.estado === "Resuelto") {
    return 0
  }

  // Calcular la fecha límite de ANS (en horas laborales)
  const fechaLimite = new Date(fechaCreacion)
  let horasAgregadas = 0

  while (horasAgregadas < horasANS) {
    // Avanzar una hora
    fechaLimite.setHours(fechaLimite.getHours() + 1)

    // Verificar si estamos en horario laboral
    const hora = fechaLimite.getHours()
    const esDiaLab = esDiaLaboral(fechaLimite)

    if (esDiaLab && hora >= HORA_INICIO && hora < HORA_FIN) {
      horasAgregadas += 1
    }

    // Si llegamos al final del día laboral, avanzar al siguiente día
    if (hora >= HORA_FIN) {
      fechaLimite.setDate(fechaLimite.getDate() + 1)
      fechaLimite.setHours(HORA_INICIO, 0, 0, 0)
    }
  }

  // Calcular horas laborales consumidas hasta ahora
  const ahora = new Date()
  const horasConsumidas = calcularHorasLaborales(fechaCreacion, ahora)

  // Calcular tiempo restante
  const tiempoRestante = horasANS - horasConsumidas

  return tiempoRestante > 0 ? tiempoRestante : 0
}

/**
 * Calcula el porcentaje de tiempo ANS consumido
 */
export function calcularPorcentajeANSConsumido(incidencia: Incidencia): number {
  if (!incidencia || !incidencia.fecha_creacion || !incidencia.tiempoANS) {
    return 0
  }

  const fechaCreacion = new Date(incidencia.fecha_creacion)
  const horasANS = incidencia.tiempoANS

  // Si la incidencia está resuelta, el porcentaje es 100%
  if (incidencia.estado === "Resuelto") {
    return 100
  }

  // Calcular horas laborales consumidas hasta ahora
  const ahora = new Date()
  const horasConsumidas = calcularHorasLaborales(fechaCreacion, ahora)

  // Calcular porcentaje
  const porcentaje = (horasConsumidas / horasANS) * 100

  return Math.min(porcentaje, 100) // No permitir que supere el 100%
}

/**
 * Determina si una incidencia está en riesgo de incumplir el ANS
 * (más del 80% del tiempo consumido)
 */
export function incidenciaEnRiesgo(incidencia: Incidencia): boolean {
  if (!incidencia) return false
  const porcentajeConsumido = calcularPorcentajeANSConsumido(incidencia)
  return porcentajeConsumido >= 80 && porcentajeConsumido < 100
}

/**
 * Determina si una incidencia ha incumplido el ANS
 * (100% o más del tiempo consumido)
 */
export function incidenciaIncumplida(incidencia: Incidencia): boolean {
  if (!incidencia) return false
  const porcentajeConsumido = calcularPorcentajeANSConsumido(incidencia)
  return porcentajeConsumido >= 100
}
