/**
 * Datos del cotizador WebMCP: catálogo de paquetes, opciones del formulario,
 * empresas de referencia y sus propuestas de ejemplo.
 * El catálogo de paquetes lo comparten la página y el servidor (server/cotizar.ts).
 */
import type { PaqueteId, PropuestaMcp, SolicitudCotizador } from '../types.ts';

export interface Paquete {
  nombre: string;
  /** Rango referencial en CLP, ya formateado: "$500.000 – $1.500.000" o "Desde $3.000.000". */
  precio: string;
  desde: number;
  /** Sin tope: el plan se cotiza a medida desde `desde`. */
  hasta?: number;
  plazo: string;
  paraQuien: string;
  incluye: string[];
}

const clp = (n: number) => `$${n.toLocaleString('es-CL')}`;
const paquete = (p: Omit<Paquete, 'precio'>): Paquete =>
  ({ ...p, precio: p.hasta ? `${clp(p.desde)} – ${clp(p.hasta)}` : `Desde ${clp(p.desde)}` });

/** Los precios son rangos referenciales: el valor final se fija en la primera reunión. */
export const PAQUETES: Record<PaqueteId, Paquete> = {
  'pack-starter': paquete({
    nombre: 'Starter WebMCP', desde: 500_000, hasta: 1_500_000, plazo: '2 semanas de entrega',
    paraQuien: 'Empresas que parten con consultas simples: stock, precios u horas disponibles.',
    incluye: ['Hasta 3 métodos MCP', 'Revisión de la información que ya tiene', 'Taller para su equipo'],
  }),
  'pack-scale': paquete({
    nombre: 'Scale Agent-Ready', desde: 1_500_000, hasta: 3_000_000, plazo: '4 semanas de entrega',
    paraQuien: 'Empresas con un sistema propio que necesitan reservar, cotizar o registrar pedidos.',
    incluye: ['Hasta 10 métodos MCP', 'Permisos por cliente y registro de uso', '3 meses de soporte'],
  }),
  'pack-enterprise': paquete({
    nombre: 'Enterprise Autonomous Architecture', desde: 3_000_000, plazo: '8 semanas de entrega',
    paraQuien: 'Organizaciones que integran un ERP o software de terceros con control de accesos estricto.',
    incluye: ['Métodos MCP sin tope', 'Integración con ERP o CRM', 'Monitoreo y soporte continuo'],
  }),
};

export const NOTA_PRECIO = 'Rango referencial; el valor final se define en la primera reunión.';

/** Tareas repetitivas típicas: se marcan con un clic, para quien prefiere no escribir. */
export const TAREAS_COMUNES = [
  'Consultas de disponibilidad o stock',
  'Consultas de precios',
  'Agendamiento de horas o citas',
  'Seguimiento de pedidos o estado',
  'Crear cotizaciones',
  'Envío de recordatorios',
  'Copiar datos entre sistemas',
  'Cobranza o facturación',
];

/** Formas habituales de resolver cada tarea; se ofrecen según lo marcado. */
export const SOLUCIONES_POR_TAREA: Record<string, string[]> = {
  'Consultas de disponibilidad o stock': ['Reviso la planilla o el sistema', 'Voy a bodega a revisar'],
  'Consultas de precios': ['Busco en la lista de precios', 'Le pregunto al encargado'],
  'Agendamiento de horas o citas': ['Reviso la agenda y anoto a mano', 'Confirmo por teléfono o WhatsApp'],
  'Seguimiento de pedidos o estado': ['Busco el estado en el sistema', 'Le pregunto al equipo'],
  'Crear cotizaciones': ['Copio una plantilla en Word o Excel', 'Armo un PDF a mano'],
  'Envío de recordatorios': ['Mando mensajes uno por uno', 'Llamo por teléfono'],
  'Copiar datos entre sistemas': ['Digito la información a mano', 'Copio y pego entre programas'],
  'Cobranza o facturación': ['Reviso las cartolas del banco', 'Emito las facturas a mano'],
};

/** Métodos MCP típicos para cada tarea: solo como vista previa mientras se completa el formulario. */
export const METODOS_EJEMPLO: Record<string, string[]> = {
  'Consultas de disponibilidad o stock': ['consultar_disponibilidad', 'apartar_unidades'],
  'Consultas de precios': ['consultar_precio'],
  'Agendamiento de horas o citas': ['consultar_horas_libres', 'agendar_hora'],
  'Seguimiento de pedidos o estado': ['consultar_estado_pedido'],
  'Crear cotizaciones': ['solicitar_cotizacion'],
  'Envío de recordatorios': ['enviar_recordatorio'],
  'Copiar datos entre sistemas': ['registrar_pedido'],
  'Cobranza o facturación': ['consultar_estado_de_pago'],
};

export const DONDE_INFO = [
  { valor: 'Planillas, papel o WhatsApp', ayuda: 'Excel, cuadernos o mensajes' },
  { valor: 'Un sistema propio de la empresa', ayuda: 'Hecho a la medida del negocio' },
  { valor: 'Un software que contratamos', ayuda: 'Punto de venta, agenda en línea, ERP' },
  { valor: 'No estoy seguro', ayuda: 'Lo revisamos en la reunión' },
];

export const SOLICITUD_VACIA: SolicitudCotizador = {
  companyName: '', regionId: '', tareas: [], tareasExtra: '', soluciones: [], solucionesExtra: '',
  dondeInfo: '', contactName: '', role: '', email: '', phone: '', industry: '', consiente: false,
};

export interface PresetCotizador {
  etiqueta: string;
  datos: SolicitudCotizador;
}

export const PRESETS: PresetCotizador[] = [
  {
    etiqueta: 'Vende productos',
    datos: {
      ...SOLICITUD_VACIA,
      companyName: 'Comercial del Valle', regionId: 'metropolitana',
      tareas: ['Consultas de disponibilidad o stock', 'Consultas de precios', 'Copiar datos entre sistemas'],
      soluciones: ['Reviso la planilla o el sistema', 'Digito la información a mano'],
      solucionesExtra: 'Respondo por WhatsApp uno por uno.',
      dondeInfo: 'Un sistema propio de la empresa',
      contactName: 'Paula Riquelme', role: 'Gerente comercial', industry: 'Venta y despacho de productos',
      consiente: true,
    },
  },
  {
    etiqueta: 'Atiende con hora',
    datos: {
      ...SOLICITUD_VACIA,
      companyName: 'Servicios Aurora', regionId: 'biobio',
      tareas: ['Agendamiento de horas o citas', 'Envío de recordatorios'],
      soluciones: ['Reviso la agenda y anoto a mano', 'Confirmo por teléfono o WhatsApp', 'Llamo por teléfono'],
      dondeInfo: 'Planillas, papel o WhatsApp',
      contactName: 'Rodrigo Fuentes', role: 'Dueño', industry: 'Atención con hora agendada',
      consiente: false,
    },
  },
  {
    etiqueta: 'Presta servicios',
    datos: {
      ...SOLICITUD_VACIA,
      companyName: 'Soluciones Pacífico', regionId: 'antofagasta',
      tareas: ['Crear cotizaciones', 'Seguimiento de pedidos o estado', 'Agendamiento de horas o citas'],
      soluciones: ['Copio una plantilla en Word o Excel', 'Busco el estado en el sistema'],
      solucionesExtra: 'Respondo por correo.',
      dondeInfo: 'Un software que contratamos',
      contactName: 'Carla Medina', role: 'Jefa de operaciones', industry: 'Servicios a empresas',
      consiente: true,
    },
  },
  { etiqueta: 'En blanco', datos: SOLICITUD_VACIA },
];

/**
 * Propuestas guardadas para las empresas de referencia.
 * Solo se muestran cuando la IA no está disponible y los datos no se modificaron, y siempre marcadas como ejemplo.
 */
export const EJEMPLOS: Record<string, PropuestaMcp> = {
  'Comercial del Valle': {
    headline: 'Que sus clientes sepan qué hay disponible sin tener que escribirle',
    summary: 'Cada consulta de disponibilidad o precio termina en alguien abriendo la planilla y respondiendo por WhatsApp. Si esas consultas quedan disponibles como métodos MCP, el cliente obtiene el dato al momento y el equipo comercial solo interviene cuando hay una excepción.',
    suggestedTools: [
      { name: 'consultar_disponibilidad', title: 'Consultar disponibilidad', description: 'Unidades disponibles y sucursal de un producto.', benefit: 'buscar el producto en la planilla para contestar un WhatsApp' },
      { name: 'consultar_precio', title: 'Consultar el precio', description: 'Precio vigente de un producto.', benefit: 'repetir el mismo precio por teléfono todo el día' },
      { name: 'reservar_unidades', title: 'Apartar unidades', description: 'Aparta unidades de un producto y descuenta lo disponible.', benefit: 'anotar la reserva y avisarle a bodega por separado' },
    ],
    recommendedPackageId: 'pack-scale',
    justification: 'La información ya vive en un sistema propio y apartar unidades modifica el inventario, por lo que no basta con consultas de lectura.',
    outreachMessage: 'Estimada Paula: revisamos la postulación de Comercial del Valle. Por lo que nos describe, podríamos comenzar por disponibilidad y reserva, para que sus clientes resuelvan por sí mismos lo que hoy pasa por WhatsApp. ¿Tendría 20 minutos esta semana para conversarlo?',
    openQuestions: ['¿Lo disponible se actualiza al momento o una vez al día?', '¿El descuento por cantidad es una tabla fija o se conversa caso a caso?'],
  },
  'Servicios Aurora': {
    headline: 'Que las horas que se liberan no queden vacías',
    summary: 'La agenda se mueve por teléfono y la revisa una sola persona, así que las horas que se liberan tarde quedan sin ocupar. Poner la agenda a disposición como métodos MCP permite que el propio cliente consulte, reserve y reciba recordatorios.',
    suggestedTools: [
      { name: 'consultar_horas_libres', title: 'Consultar horas libres', description: 'Bloques libres por día o por profesional.', benefit: 'revisar la agenda cada vez que alguien llama' },
      { name: 'agendar_hora', title: 'Agendar una hora', description: 'Reserva un bloque libre para un cliente.', benefit: 'anotar la hora a mano y confirmarla por teléfono' },
      { name: 'enviar_recordatorio', title: 'Enviar un recordatorio', description: 'Avisa al cliente su hora el día anterior.', benefit: 'llamar uno por uno para confirmar asistencia' },
    ],
    recommendedPackageId: 'pack-starter',
    justification: 'La información vive en planillas, por lo que conviene comenzar con un conjunto acotado de métodos antes de integrar más.',
    outreachMessage: 'Estimado Rodrigo: recibimos la postulación de Servicios Aurora. Lo más directo sería habilitar la agenda para que sus clientes consulten y reserven sin llamar. ¿Le acomoda una llamada breve esta semana?',
    openQuestions: ['¿La agenda está en una planilla o en un programa?', '¿Quién confirma hoy una reserva y en qué momento?'],
  },
  'Soluciones Pacífico': {
    headline: 'Que sus clientes coticen y agenden sin esperar una respuesta',
    summary: 'Cada cotización se arma copiando una plantilla y cada consulta de estado termina en un correo respondido a mano. Poner esas acciones a disposición permite que el cliente cotice, agende y siga su trabajo sin intermediarios.',
    suggestedTools: [
      { name: 'solicitar_cotizacion', title: 'Solicitar una cotización', description: 'Genera una cotización a partir del servicio y los datos del cliente.', benefit: 'copiar la plantilla y completar la cotización a mano' },
      { name: 'consultar_estado_trabajo', title: 'Consultar el estado de un trabajo', description: 'Estado actual y responsable de un servicio en curso.', benefit: 'buscar el trabajo y responder el correo de seguimiento' },
      { name: 'agendar_visita', title: 'Agendar una visita técnica', description: 'Reserva un horario disponible del equipo para una visita.', benefit: 'coordinar la visita por teléfono y anotarla en el sistema' },
    ],
    recommendedPackageId: 'pack-enterprise',
    justification: 'El software es de un proveedor externo y cada cliente debe ver solo sus propios trabajos, por lo que la integración exige control de accesos y registro desde el inicio.',
    outreachMessage: 'Estimada Carla: revisamos la postulación de Soluciones Pacífico. El caso implica conectar el software que ya utilizan y definir qué ve cada cliente, por lo que conviene revisarlo con quien lo administra. ¿Podríamos coordinar una reunión esta semana?',
    openQuestions: ['¿El software que utilizan permite conectarse desde otros programas?', '¿Una cotización generada automáticamente debe aprobarse antes de enviarse?'],
  },
};

/** Soluciones ofrecidas para las tareas marcadas, sin repetir. */
export const solucionesPara = (tareas: string[]): string[] =>
  [...new Set(tareas.flatMap(t => SOLUCIONES_POR_TAREA[t] || []))];

/** true si los datos son exactamente los de una empresa de referencia (condición para mostrar su ejemplo). */
export function esPresetIntacto(datos: SolicitudCotizador): boolean {
  const iguales = (a: SolicitudCotizador, b: SolicitudCotizador) =>
    JSON.stringify({ ...a, consiente: false }) === JSON.stringify({ ...b, consiente: false });
  return PRESETS.some(p => p.datos.companyName && iguales(p.datos, datos));
}
