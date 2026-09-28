export type MacroZone = 'Norte Grande' | 'Norte Chico' | 'Centro' | 'Sur' | 'Austral';

export type OrganizationType = 'Startup' | 'Scaleup' | 'PyME' | 'Gran Empresa' | 'Centro I+D' | 'Universidad';

export type Sector =
  | 'Minería & Energía'
  | 'Fintech & Banca'
  | 'Biotech & Agro'
  | 'Retail & E-commerce'
  | 'Salud & MedTech'
  | 'Logística & Transporte'
  | 'GovTech & Legal'
  | 'Clima & Sustentabilidad'
  | 'Educación & Investigación'
  | 'Tecnología & Software';

/** Región de Chile: solo datos geográficos verificables. Las cifras se calculan con los datos cargados. */
export interface ChileRegion {
  id: string;
  name: string;
  shortName: string;
  romanNumeral: string;
  zone: MacroZone;
  capital: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  regionId: string;
  city: string;
  sector: Sector;
  website: string;
  tagline: string;
  aiUseCase: string; // Cómo usan la IA en su operación
  toolsUsed: string[];
  fundingStage?: string;
  hiringStatus: boolean;
  openRoles?: string[];
  foundedYear: number;
  contactEmail?: string;
  verified: boolean;
  createdAt?: string;
}

export type EventType = 'Hackathon' | 'Cumbre / Conferencia' | 'Datathon' | 'Meetup Comunitario' | 'Taller Práctico';
export type EventStatus = 'Próximo' | 'En Curso' | 'Finalizado';

export interface EcosystemEvent {
  id: string;
  title: string;
  type: EventType;
  organizer: string;
  /** Fecha legible, por ejemplo "14 - 16 de Octubre, 2026". */
  dateStr: string;
  /** Se recalcula a partir de fechaInicio y fechaFin cuando existen. */
  status: EventStatus;
  regionId: string;
  locationName: string;
  isVirtual: boolean;
  /** Fechas ISO (AAAA-MM-DD) para calcular el estado y los días al cierre. */
  fechaInicio?: string;
  fechaFin?: string;
  fechaCierre?: string;
  /** Un administrador puede ocultar un evento sin borrarlo. */
  oculto?: boolean;
  prizePool?: string;
  participantsCount?: number;
  tags: string[];
  registrationUrl?: string;
  registrationDeadline?: string;
  isRegistrationUrgent?: boolean;
  daysUntilDeadline?: number;
  notificationText?: string;
  createdAt?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  frequency: 'semanal' | 'inmediata';
  preferredRegionId: string; // 'all' or specific region id
  interests: ('hackathons' | 'eventos' | 'inversion' | 'startups')[];
  active: boolean;
}

/** Evento u organización enviada por el público; se publica cuando un administrador la aprueba. */
export type PropuestaPublica =
  | { id: string; tipo: 'evento'; datos: EcosystemEvent; createdAt: string }
  | { id: string; tipo: 'organizacion'; datos: Organization; createdAt: string };

// ==========================================
// Cotizador WebMCP (pre-cotización y solicitudes)
// ==========================================

/** Estado de una solicitud en el mapa: postulando hasta que Browns Studio la conecta. */
export type EstadoSolicitud = 'postulando' | 'conectada';

export type PaqueteId = 'pack-starter' | 'pack-scale' | 'pack-enterprise';

/** Método MCP propuesto para una empresa. */
export interface MetodoMcp {
  name: string;          // identificador técnico, snake_case (ej: consultar_stock)
  title: string;         // nombre legible (ej: Consultar stock)
  description: string;
  benefit?: string;      // trabajo manual que deja de hacerse
}

/** Propuesta generada por la IA para una empresa. */
export interface PropuestaMcp {
  headline: string;
  summary: string;
  suggestedTools: MetodoMcp[];
  recommendedPackageId: PaqueteId;
  justification: string;
  outreachMessage: string;
  openQuestions: string[];
}

/** Datos que la empresa entrega en el cotizador. */
export interface SolicitudCotizador {
  companyName: string;
  regionId: string;
  tareas: string[];
  tareasExtra: string;
  soluciones: string[];
  solucionesExtra: string;
  dondeInfo: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  industry: string;
  consiente: boolean;
}

/**
 * Documento público de la colección `mcp_solicitudes`.
 * No contiene datos de contacto; el nombre de la empresa solo se guarda si autorizó aparecer.
 */
export interface McpSolicitud {
  id: string;
  regionId: string;
  estado: EstadoSolicitud;
  consiente: boolean;
  empresa?: string;
  metodos: string[];      // identificadores de los métodos MCP propuestos
  categorias?: string[];  // tareas marcadas en el formulario
  paquete?: PaqueteId;
  submissionId?: string;  // lead privado asociado en business_submissions, si dejó contacto
  createdAt: string;
}

/** Conteo de solicitudes por región para la capa del mapa. */
export type SolicitudesPorRegion = Record<string, { postulando: number; conectadas: number }>;

/** Capas del mapa de coropletas (pestaña Mapa). */
export type CapaMapa = 'conectadas' | 'solicitudes' | 'eventos' | 'organizaciones' | 'universidades';
