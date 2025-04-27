"use server"

import { supabaseServer } from "./supabase/supabase-server"
import { revalidatePath } from "next/cache"

export async function seedIncidencias() {
  // Verificar si ya hay datos
  const { count } = await supabaseServer.from("incidencias").select("*", { count: "exact", head: true })

  if (count && count > 0) {
    return { message: "Ya existen datos en la tabla de incidencias" }
  }

  // Primero, insertar usuarios
  const usuarios = [
    {
      nombre: "Marcelo Arturo Duarte Avendano",
      correo: "MD78344@andinavidaseguros.com.co",
    },
    {
      nombre: "Ana Gómez",
      correo: "AG45678@andinavidaseguros.com.co",
    },
    {
      nombre: "Juan Pérez",
      correo: "JP12345@andinavidaseguros.com.co",
    },
    {
      nombre: "María López",
      correo: "ML56789@andinavidaseguros.com.co",
    },
    {
      nombre: "Pedro Sánchez",
      correo: "PS98765@andinavidaseguros.com.co",
    },
  ]

  const { error: usuariosError } = await supabaseServer.from("usuarios").insert(usuarios)

  if (usuariosError) {
    console.error("Error al insertar usuarios:", usuariosError)
    throw new Error("Error al insertar usuarios")
  }

  // Datos de ejemplo para incidencias
  const incidencias = [
    {
      id: "INC-1234",
      titulo: "Error en formato plano del reporte F394",
      descripcion: "Existen errores en el formato plano del reporte F394",
      prioridad: "Media",
      estado: "Devuelto/cancelado",
      fecha_creacion: new Date().toISOString(),
      hora_inicio: "11:32:40 AM",
      correo: "MD78344@andinavidaseguros.com.co",
      nombre: "Marcelo Arturo Duarte Avendano",
      tipo_solicitud: "Incidencia",
      aplicativo: "Core de Rentas",
      modulo: "Reservas",
      azure: "",
      glpi: "N/A",
      fecha_radicado: new Date().toISOString(),
      estado_andina: "Devuelto/cancelado",
      estado_proveedor: "Devuelto/cancelado",
      bitacora: "Cancelado por Marcelo Duarte porque no es un error. Se va a tramitar como un requerimiento nuevo.",
      cumple: "",
      solucion_raiz: "NO",
      aplica_stock: "",
      fecha_diagnostico: null,
      fecha_entrega_desarrollo: null,
      fecha_entrega_qa: null,
      fecha_entrega_uat: null,
      fecha_solucion: new Date().toISOString(),
      asignado: "Carlos Ramírez",
      ans_estado: "En riesgo",
      cumplimiento_adjuntos: false,
      tiempo_restante: "1 día",
      propietario: "Andina",
      tiene_script: false,
    },
    {
      id: "INC-1235",
      titulo: "Fallo en módulo de pagos",
      descripcion: "Error al procesar pagos con tarjeta de crédito",
      prioridad: "Crítica",
      estado: "En progreso",
      fecha_creacion: new Date(Date.now() - 86400000).toISOString(), // 1 día atrás
      hora_inicio: "09:15:22 AM",
      correo: "AG45678@andinavidaseguros.com.co",
      nombre: "Ana Gómez",
      tipo_solicitud: "Incidencia",
      aplicativo: "Core de Pagos",
      modulo: "Transacciones",
      azure: "AZ-12345",
      glpi: "GL-5678",
      fecha_radicado: new Date(Date.now() - 86400000).toISOString(),
      estado_andina: "En progreso",
      estado_proveedor: "En desarrollo",
      bitacora: "Se está trabajando en la solución. Prioridad alta.",
      cumple: "SI",
      solucion_raiz: "SI",
      aplica_stock: "NO",
      fecha_diagnostico: new Date(Date.now() - 43200000).toISOString(), // 12 horas atrás
      fecha_entrega_desarrollo: null,
      fecha_entrega_qa: null,
      fecha_entrega_uat: null,
      fecha_solucion: null,
      asignado: "Juan Pérez",
      ans_estado: "En tiempo",
      cumplimiento_adjuntos: true,
      tiempo_restante: "2 días",
      propietario: "Nosotros",
      tiene_script: true,
    },
    {
      id: "INC-1236",
      titulo: "Error en carga de imágenes",
      descripcion: "No se pueden subir imágenes al sistema",
      prioridad: "Baja",
      estado: "En progreso",
      fecha_creacion: new Date(Date.now() - 172800000).toISOString(), // 2 días atrás
      hora_inicio: "14:30:10 PM",
      correo: "JP12345@andinavidaseguros.com.co",
      nombre: "Juan Pérez",
      tipo_solicitud: "Incidencia",
      aplicativo: "Portal Web",
      modulo: "Carga de Archivos",
      azure: "AZ-67890",
      glpi: "GL-1234",
      fecha_radicado: new Date(Date.now() - 172800000).toISOString(),
      estado_andina: "En progreso",
      estado_proveedor: "En análisis",
      bitacora: "Se está analizando el problema con el equipo de desarrollo.",
      cumple: "SI",
      solucion_raiz: "SI",
      aplica_stock: "NO",
      fecha_diagnostico: new Date(Date.now() - 86400000).toISOString(),
      fecha_entrega_desarrollo: null,
      fecha_entrega_qa: null,
      fecha_entrega_uat: null,
      fecha_solucion: null,
      asignado: "María López",
      ans_estado: "En tiempo",
      cumplimiento_adjuntos: true,
      tiempo_restante: "3 días",
      propietario: "Andina",
      tiene_script: false,
    },
    {
      id: "INC-1237",
      titulo: "Lentitud en carga de reportes",
      descripcion: "Los reportes tardan más de 30 segundos en generarse",
      prioridad: "Indisponible",
      estado: "Abierto",
      fecha_creacion: new Date(Date.now() - 259200000).toISOString(), // 3 días atrás
      hora_inicio: "10:45:30 AM",
      correo: "ML56789@andinavidaseguros.com.co",
      nombre: "María López",
      tipo_solicitud: "Incidencia",
      aplicativo: "Sistema de Reportes",
      modulo: "Generación",
      azure: "AZ-54321",
      glpi: "GL-9876",
      fecha_radicado: new Date(Date.now() - 259200000).toISOString(),
      estado_andina: "Abierto",
      estado_proveedor: "Pendiente",
      bitacora: "Pendiente de asignación al equipo de desarrollo.",
      cumple: "",
      solucion_raiz: "",
      aplica_stock: "",
      fecha_diagnostico: null,
      fecha_entrega_desarrollo: null,
      fecha_entrega_qa: null,
      fecha_entrega_uat: null,
      fecha_solucion: null,
      asignado: "Pedro Sánchez",
      ans_estado: "En tiempo",
      cumplimiento_adjuntos: false,
      tiempo_restante: "3 días",
      propietario: "Nosotros",
      tiene_script: false,
    },
    {
      id: "INC-1238",
      titulo: "Problema con notificaciones",
      descripcion: "Las notificaciones no llegan a todos los usuarios",
      prioridad: "Media",
      estado: "Abierto",
      fecha_creacion: new Date(Date.now() - 345600000).toISOString(), // 4 días atrás
      hora_inicio: "08:20:15 AM",
      correo: "PS98765@andinavidaseguros.com.co",
      nombre: "Pedro Sánchez",
      tipo_solicitud: "Incidencia",
      aplicativo: "Sistema de Notificaciones",
      modulo: "Envío",
      azure: "AZ-13579",
      glpi: "GL-24680",
      fecha_radicado: new Date(Date.now() - 345600000).toISOString(),
      estado_andina: "Abierto",
      estado_proveedor: "Pendiente",
      bitacora: "Se está recopilando información adicional.",
      cumple: "",
      solucion_raiz: "",
      aplica_stock: "",
      fecha_diagnostico: null,
      fecha_entrega_desarrollo: null,
      fecha_entrega_qa: null,
      fecha_entrega_uat: null,
      fecha_solucion: null,
      asignado: "Ana Gómez",
      ans_estado: "En tiempo",
      cumplimiento_adjuntos: true,
      tiempo_restante: "5 días",
      propietario: "Andina",
      tiene_script: true,
    },
  ]

  // Insertar incidencias
  const { error: incidenciasError } = await supabaseServer.from("incidencias").insert(incidencias)

  if (incidenciasError) {
    console.error("Error al insertar incidencias:", incidenciasError)
    throw new Error("Error al insertar incidencias")
  }

  // Insertar comentarios
  const comentarios = [
    {
      incidencia_id: "INC-1234",
      autor: "Marcelo Arturo Duarte",
      fecha: new Date(Date.now() - 259200000).toISOString(),
      texto: "Creación del caso. Existen errores en el formato plano del reporte F394.",
    },
    {
      incidencia_id: "INC-1234",
      autor: "Carlos Ramírez",
      fecha: new Date(Date.now() - 172800000).toISOString(),
      texto: "Estoy revisando el problema. Parece estar relacionado con el formato de exportación.",
    },
    {
      incidencia_id: "INC-1234",
      autor: "Marcelo Arturo Duarte",
      fecha: new Date(Date.now() - 86400000).toISOString(),
      texto:
        "Después de revisar, no es un error sino una funcionalidad que debe ser implementada. Solicito cancelar esta incidencia y tramitarla como un requerimiento nuevo.",
    },
    {
      incidencia_id: "INC-1235",
      autor: "Ana Gómez",
      fecha: new Date(Date.now() - 86400000).toISOString(),
      texto: "Creación del caso. Error al procesar pagos con tarjeta de crédito.",
    },
    {
      incidencia_id: "INC-1235",
      autor: "Juan Pérez",
      fecha: new Date(Date.now() - 43200000).toISOString(),
      texto: "Estoy analizando el problema. Parece ser un error en la integración con la pasarela de pagos.",
    },
  ]

  const { error: comentariosError } = await supabaseServer.from("comentarios").insert(comentarios)

  if (comentariosError) {
    console.error("Error al insertar comentarios:", comentariosError)
    throw new Error("Error al insertar comentarios")
  }

  // Insertar adjuntos
  const adjuntos = [
    {
      incidencia_id: "INC-1234",
      nombre: "Detalle del bug_Marcelo Arturo Duart.docx",
      tipo: "documento",
      tamano: "250 KB",
      url: "",
      es_script: false,
    },
    {
      incidencia_id: "INC-1235",
      nombre: "Captura de error.png",
      tipo: "imagen",
      tamano: "120 KB",
      url: "",
      es_script: false,
    },
    {
      incidencia_id: "INC-1235",
      nombre: "script_solucion.sql",
      tipo: "script",
      tamano: "15 KB",
      url: "",
      es_script: true,
    },
  ]

  const { error: adjuntosError } = await supabaseServer.from("adjuntos").insert(adjuntos)

  if (adjuntosError) {
    console.error("Error al insertar adjuntos:", adjuntosError)
    throw new Error("Error al insertar adjuntos")
  }

  revalidatePath("/")
  revalidatePath("/incidencias")
  revalidatePath("/historico")

  return { message: "Datos de prueba insertados correctamente" }
}
