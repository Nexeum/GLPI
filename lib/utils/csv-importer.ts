"use server"

import { parse } from "papaparse"
import type { Incidencia } from "../types/incidencias"
import { crearIncidencia } from "../api/incidencias"
import { crearComentario } from "../api/comentarios" // Importamos la función para crear comentarios

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

// Función para extraer comentarios de la bitácora
function extraerComentarios(bitacora: string): string[] {
  if (!bitacora || bitacora.trim() === "") return []

  // Dividir por separadores comunes en bitácoras
  // Posibles separadores: nueva línea, punto y coma, guiones o barras seguidos de fechas
  const comentarios = bitacora
      .split(/\n+|;\s*|(?<=\d)\s*[-/]\s*(?=\d)/)
      .map(comentario => comentario.trim())
      .filter(comentario => comentario !== "")

  return comentarios
}

// Función para mapear una fila del CSV a un objeto Incidencia
function mapearFilaAIncidencia(fila: any): Partial<Incidencia> & { comentarios?: string[] } {
  const incidencia: Partial<Incidencia> & { comentarios?: string[] } = {}

  // Mapear campos según el mapeo definido
  for (const [csvField, incidenciaField] of Object.entries(FIELD_MAPPING)) {
    if (
        fila[csvField] !== undefined &&
        fila[csvField] !== null &&
        String(fila[csvField]).trim() !== ""
    ) {
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

  const fechas = [
    "hora_inicio",
    "fecha_creacion",
    "fecha_radicado",
    "fecha_diagnostico",
    "fecha_entrega_desarrollo",
    "fecha_entrega_qa",
    "fecha_entrega_uat",
    "fecha_aprobado_uat",
    "fecha_solucion",
  ]

  for (const campo of fechas) {
    if (incidencia[campo]) {
      incidencia[campo] = convertirFecha(incidencia[campo] as string)
    }
  }

  // Mapear tiene_script basado en el estado
  incidencia.tiene_script = incidencia.estado_andina === "Aprobado Script, Pendiente Ejecucion"

  // Asignar propietario (si no existe)
  if (!incidencia.propietario) {
    incidencia.propietario = "Sistema"
  }

  // Extraer comentarios de la bitácora
  if (incidencia.bitacora) {
    incidencia.comentarios = extraerComentarios(incidencia.bitacora as string)
    // Eliminamos la bitácora original ya que ahora tenemos los comentarios separados
    delete incidencia.bitacora
  }

  return incidencia
}

// Función principal para procesar el archivo CSV
export async function procesarArchivoCSV(fileContent: string): Promise<{
  success: boolean
  message: string
  incidenciasImportadas?: number
  comentariosImportados?: number
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

    // 🔍 Filtrar solo las filas del aplicativo "Core Rentas"
    const dataFiltrada = data.filter((fila: any) => fila["Aplicativo"]?.trim() === "Core de Rentas")

    if (dataFiltrada.length === 0) {
      return {
        success: false,
        message: "No se encontraron incidencias para el aplicativo 'Core Rentas'",
      }
    }

    // Mapear filas a incidencias
    const incidencias = dataFiltrada.map(mapearFilaAIncidencia)

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
    let comentariosGuardados = 0
    const erroresGuardado = []

    for (const incidencia of incidenciasValidas) {
      try {
        // Extraer comentarios antes de guardar la incidencia
        const comentarios = incidencia.comentarios || []
        delete incidencia.comentarios

        // Guardar la incidencia
        await crearIncidencia(incidencia as Incidencia)
        incidenciasGuardadas++

        // Guardar los comentarios asociados
        for (const textoComentario of comentarios) {
          try {
            await crearComentario({
              incidencia_id: incidencia.id,
              autor: "Sistema", // O el autor que corresponda
              texto: textoComentario,
              fecha: new Date().toISOString() // Usamos la fecha actual
            })
            comentariosGuardados++
          } catch (error) {
            erroresGuardado.push(`Error al guardar comentario para incidencia ${incidencia.id}: ${error.message}`)
          }
        }
      } catch (error) {
        erroresGuardado.push(`Error al guardar incidencia ${incidencia.id}: ${error.message}`)
      }
    }

    return {
      success: true,
      message: `Se importaron ${incidenciasGuardadas} incidencias con ${comentariosGuardados} comentarios`,
      incidenciasImportadas: incidenciasGuardadas,
      comentariosImportados: comentariosGuardados,
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