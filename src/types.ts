export type MacroZone = 'Norte Grande' | 'Norte Chico' | 'Centro' | 'Sur' | 'Austral';

export type OrganizationType = 'Startup' | 'Scaleup' | 'PyME' | 'Gran Empresa' | 'Centro I+D';

export type Sector = 
  | 'Minería & Energía' 
  | 'Fintech & Banca' 
  | 'Biotech & Agro' 
  | 'Retail & E-commerce' 
  | 'Salud & MedTech' 
  | 'Logística & Transporte' 
  | 'GovTech & Legal' 
  | 'Clima & Sustentabilidad';

export interface RegionalInvestmentBreakdown {
  totalInvestmentUSD: number; // In Millions USD, e.g. 520 for Santiago RM, 98 for Antofagasta
  investmentTier: 'Epicentro Tier 1' | 'Alto Flujo Tier 2' | 'Crecimiento Tier 3' | 'Emergente Semilla';
  yoyGrowthPercent: number; // e.g. 28 for +28%
  publicFundingUSD: number; // Corfo, ANID, Ley I+D (in Millions USD)
  privateFundingUSD: number; // VC, CVC, Angels (in Millions USD)
  topFundingSectors: Sector[];
  keyFundsOrBackers: string[];
}

export interface RegionalTalentBreakdown {
  totalDevs: number; // Estimated active AI/ML developers in region
  densityTier: 'Polo Crítico (Tier 1)' | 'Alta Densidad (Tier 2)' | 'Densidad Media (Tier 3)' | 'Polo Emergente';
  topAISpecialties: string[]; // e.g. ['GenAI & LLMs', 'Computer Vision', 'MLOps & Cloud', 'Data Science', 'Edge AI & Robótica']
  seniorityRatio: { junior: number; mid: number; senior: number; lead: number }; // percentages sum to 100
  averageSalaryCLP: string; // e.g. '$3.8M CLP / mes'
  openTechRolesCount: number;
  hiringCompaniesCount: number;
  keyUniversities: string[];
  topSpecialtySummary: string;
  recruiterNotes?: string;
  topTechStack: string[];
}

export interface ChileRegion {
  id: string;
  name: string;
  shortName: string;
  romanNumeral: string;
  zone: MacroZone;
  capital: string;
  startupsCount: number;
  aiHubsCount: number;
  hackathonsCount: number;
  keySectors: Sector[];
  topSpecialty: string;
  dataCenters: number;
  universitiesWithAI: string[];
  description: string;
  mapY: number; // approximate latitude percentage for visual placement
  mapX: number; // relative width placement
  investmentUSD?: number; // Total tech investment in Millions USD
  investmentBreakdown?: RegionalInvestmentBreakdown;
  activeDevelopers?: number;
  talentBreakdown?: RegionalTalentBreakdown;
  webmcpCount?: number; // Companies with active WebMCP agent integrations
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
  aiUseCase: string; // How they actually use AI in their operations
  toolsUsed: string[]; // e.g. ['Gemini API', 'PyTorch', 'LangChain', 'Vertex AI']
  fundingStage?: string; // Seed, Series A, Bootstrapped, Corporativo
  hiringStatus: boolean;
  openRoles?: string[];
  foundedYear: number;
  contactEmail?: string;
  verified: boolean;
}

export interface TechTool {
  id: string;
  name: string;
  category: 'Modelos & LLMs' | 'Orquestación & Frameworks' | 'Visión & Audio' | 'Vector DBs & Datos' | 'Infraestructura & MLOps';
  description: string;
  adoptionPercentage: number;
  usedByCount: number;
  companiesUsing: string[];
  docUrl: string;
  badgeColor: string;
}

export interface EcosystemEvent {
  id: string;
  title: string;
  type: 'Hackathon' | 'Cumbre / Conferencia' | 'Datathon' | 'Meetup Comunitario' | 'Taller Práctico';
  organizer: string;
  dateStr: string;
  status: 'Próximo' | 'En Curso' | 'Finalizado';
  regionId: string;
  locationName: string;
  isVirtual: boolean;
  prizePool?: string;
  participantsCount: number;
  tags: string[];
  registrationUrl?: string;
  registrationDeadline?: string;
  isRegistrationUrgent?: boolean;
  daysUntilDeadline?: number;
  notificationText?: string;
  winnerProject?: {
    name: string;
    description: string;
    team: string;
  };
}

export interface CourseResource {
  id: string;
  title: string;
  provider: string;
  level: 'Introductorio' | 'Intermedio' | 'Avanzado';
  duration: string;
  format: 'Tutorial Paso a Paso' | 'Curso Online' | 'Workshop Grabado' | 'Guía de Arquitectura';
  description: string;
  skills: string[];
  url: string;
  isFree: boolean;
  chileRelevance: string;
}

export interface MacroInvestmentStats {
  ventureCapitalUSD: string;
  totalAICompanies: number;
  activeDevelopers: number;
  iliaRank: number; // Chile #1 en Índice Latinoamericano de IA (CENIA)
  iliaScore: string;
  corfoRDIncentive: string; // 35% crédito tributario
  dataCentersTotal: number;
  fiberOpticCapacity: string; // Cable Humboldt & submarinos
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

export type WebMcpProtocol = 
  | 'Model Context Protocol (MCP / Anthropic)' 
  | 'Gemini Function Calling Tools' 
  | 'OpenAI Agents SDK' 
  | 'LangGraph / CrewAI Agent' 
  | 'Browser-Use / Agentic Web';

export type WebMcpStatus = 'En Producción' | 'Piloto Activo' | 'Sandbox / Homologación';

export interface WebMcpToolDefinition {
  name: string;
  description: string;
  category: 'Consulta' | 'Transaccional' | 'Automatización' | 'Agendamiento';
  parametersSchema: Record<string, any>;
  sampleResponse: Record<string, any>;
}

export interface WebMcpCompany {
  id: string;
  name: string;
  sector: Sector;
  regionId: string;
  city: string;
  status: WebMcpStatus;
  compatibleProtocols: WebMcpProtocol[];
  tagline: string;
  description: string;
  useCase: string;
  endpointUrl: string;
  monthlyAgentRequests: string;
  latencyAvgMs: number;
  exposedToolsCount: number;
  tools: WebMcpToolDefinition[];
  manifestJson: Record<string, any>;
  contactLeadEmail?: string;
  website?: string;
  businessImpact: string;
}

export interface WebMcpServicePackage {
  id: string;
  name: string;
  badge: string;
  priceCLP: string;
  priceUSD: string;
  targetAudience: string;
  timeline: string;
  features: string[];
  recommended?: boolean;
}


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
