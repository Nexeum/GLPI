"use server"

import { parse } from "papaparse"
import type { Incidencia } from "../types/incidencias"
import { crearIncidencia } from "../api/incidencias"

// Mapeo de campos del CSV a campos de Incidencia
const FIELD_MAPPING = {
  Id: "id",
  "Hora de inicio": "hora_inicio",
  "Fecha hora de creacion": "fecha_creacion",
  "Correo electrónico": "correo",
  Nombre: "nombre",
  "Descripción de la solicitud": "descripcion",
  "Tipo Solicitud": "tipo_solicitud",
  "Prioridad del Caso": "prioridad",
  Aplicativo: "aplicativo",
  "Del Core, ¿en qué módulo requiere soporte?": "modulo",
  "De ERP, ¿en qué módulo requiere soporte?": "modulo",
  "De Inversiones, ¿en qué módulo requiere soporte?": "modulo",
  "De Nómina, ¿en qué módulo requiere soporte?": "modulo",
  "De Prophet, ¿en qué módulo requiere soporte?": "modulo",
  "Id Proveedor": "glpi",
  "Id Azure\nLinktic": "azure",
  "Fecha Radicado Proveedor": "fecha_radicado",
  "Estado Andina": "estado_andina",
  "Estado proveedor": "estado_proveedor",
  Bitácora: "bitacora",
  Cumple: "cumple",
  "Aplica Solución de raiz": "solucion_raiz",
  "Aplica Stock": "aplica_stock",
  "Fecha Diagnostico, Plan y Criterios": "fecha_diagnostico",
  "Fecha Entrega Desarrollo\nlinktic": "fecha_entrega_desarrollo",
  "Fecha Entrega FIN QA\nLinktic": "fecha_entrega_qa",
  "Fecha Entrega UAT": "fecha_entrega_uat",
  "Fecha FIN UAT (DG)": "fecha_aprobado_uat",
  "Fecha Solución": "fecha_solucion",
}

// Mapeo de prioridades del CSV a prioridades del sistema
const PRIORITY_MAPPING = {
  "Crítico (operación detenida, requiere atención inmediata": "CRÍTICA",
  "Alto (operación afectada, requiere atención urgente)": "ALTA",
  "Medio (operación parcialmente afectada)": "ESTÁNDAR",
  "Bajo (no afecta la operación)": "BAJA",
}

// Mapeo de estados del CSV a estados del sistema
const STATUS_MAPPING = {
  "Aprobado Script, Pendiente Ejecucion": "En Desarrollo",
  Pendiente: "Pendiente",
  "En Proceso": "En Proceso",
  Resuelto: "Resuelto",
  Cerrado: "Resuelto",
}

// Función para convertir fechas del formato DD/MM/YYYY a YYYY-MM-DD
function convertirFecha(fecha: string): string | null {
  if (!fecha || fecha.trim() === "") return null

  // Intentar diferentes formatos de fecha
  try {
    // Formato D/M/YYYY
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(fecha)) {
      const [dia, mes, anio] = fecha.split("/").map(Number)
      return `${anio}-${mes.toString().padStart(2, "0")}-${dia.toString().padStart(2, "0")}`
    }

    // Formato YYYY-MM-DD (ya está en formato ISO)
    if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return fecha
    }

    // Intentar parsear con Date
    const fechaObj = new Date(fecha)
    if (!isNaN(fechaObj.getTime())) {
      return fechaObj.toISOString().split("T")[0]
    }
  } catch (error) {
    console.error(`Error al convertir fecha ${fecha}:`, error)
  }

  return null
}

// Función para generar un ID único para incidencias
function generarIdIncidencia(id: string): string {
  // Si el ID ya tiene el formato INC-XXXX, lo usamos
  if (/^INC-\d+$/.test(id)) {
    return id
  }

  // Si es solo un número, le añadimos el prefijo
  if (/^\d+$/.test(id)) {
    return `INC-${id.padStart(4, "0")}`
  }

  // Si no tiene un formato reconocible, generamos uno nuevo
  return `INC-${Math.floor(1000 + Math.random() * 9000)}`
}

// Función para mapear una fila del CSV a un objeto Incidencia
function mapearFilaAIncidencia(fila: any): Partial<Incidencia> {
  const incidencia: Partial<Incidencia> = {}

  // Mapear campos según el mapeo definido
  for (const [csvField, incidenciaField] of Object.entries(FIELD_MAPPING)) {
    if (fila[csvField] !== undefined && fila[csvField] !== null) {
      incidencia[incidenciaField] = fila[csvField]
    }
  }

  // Generar ID único
  incidencia.id = generarIdIncidencia(incidencia.id || "")

  // Mapear título (si no existe, usar los primeros 100 caracteres de la descripción)
  incidencia.titulo =
    incidencia.titulo ||
    (incidencia.descripcion
      ? incidencia.descripcion.substring(0, 100) + (incidencia.descripcion.length > 100 ? "..." : "")
      : "Sin título")

  // Mapear prioridad
  if (incidencia.prioridad) {
    incidencia.prioridad = PRIORITY_MAPPING[incidencia.prioridad] || "ESTÁNDAR"
  } else {
    incidencia.prioridad = "ESTÁNDAR"
  }

  // Mapear estado
  if (incidencia.estado_proveedor) {
    incidencia.estado = STATUS_MAPPING[incidencia.estado_proveedor] || "Pendiente"
  } else {
    incidencia.estado = "Pendiente"
  }

  // Convertir fechas
  if (incidencia.fecha_creacion) {
    incidencia.fecha_creacion = convertirFecha(incidencia.fecha_creacion)
  }

  if (incidencia.fecha_diagnostico) {
    incidencia.fecha_diagnostico = convertirFecha(incidencia.fecha_diagnostico)
  }

  if (incidencia.fecha_entrega_desarrollo) {
    incidencia.fecha_entrega_desarrollo = convertirFecha(incidencia.fecha_entrega_desarrollo)
  }

  if (incidencia.fecha_entrega_qa) {
    incidencia.fecha_entrega_qa = convertirFecha(incidencia.fecha_entrega_qa)
  }

  if (incidencia.fecha_entrega_uat) {
    incidencia.fecha_entrega_uat = convertirFecha(incidencia.fecha_entrega_uat)
  }

  if (incidencia.fecha_aprobado_uat) {
    incidencia.fecha_aprobado_uat = convertirFecha(incidencia.fecha_aprobado_uat)
  }

  if (incidencia.fecha_solucion) {
    incidencia.fecha_solucion = convertirFecha(incidencia.fecha_solucion)
  }

  // Mapear tiene_script basado en el estado
  incidencia.tiene_script = incidencia.estado_andina === "Aprobado Script, Pendiente Ejecucion"

  // Asignar propietario (si no existe)
  if (!incidencia.propietario) {
    incidencia.propietario = "Sistema"
  }

  return incidencia
}

// Función principal para procesar el archivo CSV
export async function procesarArchivoCSV(fileContent: string): Promise<{
  success: boolean
  message: string
  incidenciasImportadas?: number
  errores?: string[]
}> {
  try {
    // Parsear el CSV
    const { data, errors } = parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    })

    if (errors.length > 0) {
      return {
        success: false,
        message: "Error al parsear el archivo CSV",
        errores: errors.map((e) => e.message),
      }
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        message: "El archivo no contiene datos",
      }
    }

    // Mapear filas a incidencias
    const incidencias = data.map(mapearFilaAIncidencia)

    // Validar incidencias
    const errores = []
    const incidenciasValidas = []

    for (const [index, incidencia] of incidencias.entries()) {
      // Validar campos obligatorios
      if (!incidencia.titulo) {
        errores.push(`Fila ${index + 2}: Falta el título`)
        continue
      }

      incidenciasValidas.push(incidencia)
    }

    // Guardar incidencias en la base de datos
    let incidenciasGuardadas = 0
    const erroresGuardado = []

    for (const incidencia of incidenciasValidas) {
      try {
        await crearIncidencia(incidencia as Incidencia)
        incidenciasGuardadas++
      } catch (error) {
        erroresGuardado.push(`Error al guardar incidencia ${incidencia.id}: ${error.message}`)
      }
    }

    return {
      success: true,
      message: `Se importaron ${incidenciasGuardadas} de ${incidenciasValidas.length} incidencias`,
      incidenciasImportadas: incidenciasGuardadas,
      errores: [...errores, ...erroresGuardado],
    }
  } catch (error) {
    console.error("Error al procesar el archivo CSV:", error)
    return {
      success: false,
      message: `Error al procesar el archivo: ${error.message}`,
    }
  }
}

// Función para descargar el archivo desde una URL
export async function descargarArchivoDesdeURL(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.statusText}`)
    }

    const contenido = await response.text()
    return contenido
  } catch (error) {
    console.error("Error al descargar el archivo:", error)
    throw error
  }
}
