// Tipos para las incidencias
export type Incidencia = {
  id: string
  titulo: string
  descripcion?: string
  prioridad: string
  estado: string
  fecha_creacion: string
  hora_inicio?: string
  correo?: string
  nombre?: string
  tipo_solicitud?: string
  aplicativo?: string
  modulo?: string
  azure?: string
  glpi?: string
  fecha_radicado?: string
  estado_andina?: string
  estado_proveedor?: string
  bitacora?: string
  cumple?: string
  solucion_raiz?: string
  aplica_stock?: string
  fecha_diagnostico?: string
  fecha_entrega_desarrollo?: string
  fecha_entrega_qa?: string
  fecha_envio_correo?: string
  fecha_aprobado_uat?: string
  fecha_entrega_uat?: string
  fecha_solucion?: string
  asignado?: string
  ans_estado?: string
  cumplimiento_adjuntos?: boolean
  tiempo_restante?: string
  propietario?: string
  tiene_script?: boolean
}

// ANS según prioridad
export const ANS_PRIORIDAD = {
  INDISPONIBILIDAD: "1h",
  CRÍTICA: "2h",
  ALTA: "8h",
  ESTÁNDAR: "12h",
  BAJA: "24h",
}

// Módulos disponibles
export const MODULOS = [
  "Reservas",
  "Transacciones",
  "Carga de Archivos",
  "Generación",
  "Envío",
  "Reportes",
  "Administración",
  "Configuración",
  "Usuarios",
  "Seguridad",
  "Cotizacion",
  "Emision",
  "Recaudo",
  "Facturación",
  "Siniestros",
  "Reserva",
  "OBP",
  "Novedades",
]
