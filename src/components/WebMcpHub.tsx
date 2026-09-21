import React, { useState, useMemo } from 'react';
import webMcpHeroImg from '../assets/images/webmcp_chile_agents_1789863809782.jpg';
import { 
  WebMcpCompany, 
  WebMcpProtocol, 
  WebMcpStatus, 
  Sector, 
  ChileRegion 
} from '../types';
import { 
  WEBMCP_COMPANIES, 
  WEBMCP_SERVICES 
} from '../data/mockData';
import { 
  Bot, 
  Cpu, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Zap, 
  Search, 
  Terminal, 
  Play, 
  Check, 
  Copy, 
  ExternalLink, 
  ChevronRight, 
  DollarSign, 
  Calculator, 
  BookOpen, 
  ShieldCheck, 
  Building2, 
  TrendingUp, 
  Send, 
  ArrowRight,
  Code2,
  RefreshCw,
  Clock,
  Briefcase,
  SlidersHorizontal,
  X,
  FileCode2,
  AlertCircle,
  Award,
  Activity,
  Globe,
  FileText,
  CheckSquare,
  Square,
  AlertTriangle,
  Gauge,
  ListChecks,
  ShieldAlert,
  FileCheck,
  Info
} from 'lucide-react';
import { Badge, Card, MetricTile } from './ui/DesignSystem';

export interface WebMcpChecklistItem {
  id: string;
  category: 'protocol' | 'schema' | 'security' | 'compliance';
  categoryLabel: string;
  title: string;
  description: string;
  importance: 'critical' | 'recommended' | 'optional';
  whyItMatters: string;
  chileanContext?: string;
  defaultChecked: boolean;
}

export const WEBMCP_READINESS_CHECKLIST: WebMcpChecklistItem[] = [
  {
    id: 'c_https',
    category: 'protocol',
    categoryLabel: 'Protocolo & Red',
    title: 'Endpoint HTTPS con TLS 1.3 y HSTS',
    description: 'Cifrado de capa de transporte obligatorio para cualquier conexión de agentes autónomos.',
    importance: 'critical',
    whyItMatters: 'Protege tokens de autorización y datos de negocio contra ataques man-in-the-middle.',
    defaultChecked: true
  },
  {
    id: 'c_jsonrpc',
    category: 'protocol',
    categoryLabel: 'Protocolo & Red',
    title: 'Cumplimiento Estricto de JSON-RPC 2.0',
    description: 'Formato estándar de payloads con id de invocación, method ("tools/call", "tools/list") y params.',
    importance: 'critical',
    whyItMatters: 'Los runtimes de Anthropic MCP, OpenAI Agents SDK y Gemini esperan este formato exacto.',
    defaultChecked: true
  },
  {
    id: 'c_sse',
    category: 'protocol',
    categoryLabel: 'Protocolo & Red',
    title: 'Soporte de Streaming (Server-Sent Events / SSE)',
    description: 'Emisión progresiva de chunks de telemetría y estado cuando la ejecución toma más de 500ms.',
    importance: 'recommended',
    whyItMatters: 'Evita timeouts de red en agentes conversacionales con bucles de pensamiento extensos.',
    defaultChecked: false
  },
  {
    id: 'c_latency',
    category: 'protocol',
    categoryLabel: 'Protocolo & Red',
    title: 'Latencia P95 inferior a 250 ms',
    description: 'Respuesta ultrarrápida del endpoint para no frenar la cadencia iterativa del agente.',
    importance: 'critical',
    whyItMatters: 'En secuencias multi-herramienta, demoras de más de 500ms degradan drásticamente la experiencia del agente.',
    defaultChecked: true
  },
  {
    id: 'c_schema_v7',
    category: 'schema',
    categoryLabel: 'Esquema & Definición de Tools',
    title: 'JSON Schema v7 Estricto en Parámetros',
    description: 'Definición tipada (string, number, boolean, object, array) en la propiedad inputSchema.',
    importance: 'critical',
    whyItMatters: 'Previene argumentos malformados o tipos incompatibles generados por el LLM.',
    defaultChecked: true
  },
  {
    id: 'c_snake_case',
    category: 'schema',
    categoryLabel: 'Esquema & Definición de Tools',
    title: 'Nomenclatura Semántica en snake_case',
    description: 'Nombres auto-descriptivos como consultar_saldo_rut o calcular_descuento_afp.',
    importance: 'recommended',
    whyItMatters: 'Convención estándar en los catálogos de Claude MCP, OpenAI Function Calling y LangGraph.',
    defaultChecked: true
  },
  {
    id: 'c_descriptions',
    category: 'schema',
    categoryLabel: 'Esquema & Definición de Tools',
    title: 'Descripciones Claras con Restricciones y Unidades',
    description: 'Detalle inequívoco de qué hace la función, qué no hace, y unidades de medida esperadas.',
    importance: 'critical',
    whyItMatters: 'Los modelos eligen las herramientas basándose exclusivamente en el significado semántico de este campo.',
    defaultChecked: true
  },
  {
    id: 'c_required_fields',
    category: 'schema',
    categoryLabel: 'Esquema & Definición de Tools',
    title: 'Arreglo required Declarado de Forma Exhaustiva',
    description: 'Listado explícito de todos los atributos indispensables sin los cuales la API arroja error.',
    importance: 'critical',
    whyItMatters: 'Elimina llamadas fallidas donde el agente omite parámetros obligatorios por suposición.',
    defaultChecked: true
  },
  {
    id: 'c_auth',
    category: 'security',
    categoryLabel: 'Seguridad & Gobernanza',
    title: 'Autenticación con Bearer Token / OAuth 2.1',
    description: 'Mecanismo criptográfico con expiración y permisos delimitados (scopes) para cada agente.',
    importance: 'critical',
    whyItMatters: 'Aplica el principio de mínimo privilegio y audita qué agente ejecutó cada transacción.',
    defaultChecked: true
  },
  {
    id: 'c_rate_limit',
    category: 'security',
    categoryLabel: 'Seguridad & Gobernanza',
    title: 'Rate Limiting y Detección de Bucles Infinitos',
    description: 'Freno automático a más de N llamadas por minuto para prevenir costos desbocados y DDoS.',
    importance: 'critical',
    whyItMatters: 'Un agente autónomo en error puede repetir llamadas cientos de veces en segundos.',
    defaultChecked: false
  },
  {
    id: 'c_prompt_injection',
    category: 'security',
    categoryLabel: 'Seguridad & Gobernanza',
    title: 'Sanitización de Inputs & Blindaje contra Prompt Injection',
    description: 'Filtros contra instrucciones maliciosas ocultas en parámetros de texto libre.',
    importance: 'critical',
    whyItMatters: 'Evita que un atacante manipule el agente para desviar fondos o extraer secretos internos.',
    defaultChecked: true
  },
  {
    id: 'c_pii',
    category: 'security',
    categoryLabel: 'Seguridad & Gobernanza',
    title: 'Aislamiento de PII & Cero Exposición de Secretos',
    description: 'Nunca devolver contraseñas, tokens internos, números de tarjetas sin enmascarar o claves de API.',
    importance: 'critical',
    whyItMatters: 'Los LLMs retienen los payloads devueltos en su ventana de contexto y podrían filtrarlos.',
    defaultChecked: true
  },
  {
    id: 'c_rut_mod11',
    category: 'compliance',
    categoryLabel: 'Localización & Normativa Chile',
    title: 'Validación de RUT con Algoritmo Módulo 11',
    description: 'Recepción normalizada de RUTs chilenos con verificación matemática del dígito verificador.',
    importance: 'recommended',
    whyItMatters: 'Evita transacciones rechazadas ante el SII o bases de datos corporativas chilenas.',
    chileanContext: 'Estándar obligatorio Registro Civil y SII.',
    defaultChecked: true
  },
  {
    id: 'c_currency_clp',
    category: 'compliance',
    categoryLabel: 'Localización & Normativa Chile',
    title: 'Manejo Explícito de Moneda CLP / UF e IVA (19%)',
    description: 'Los valores monetarios declaran explícitamente si son brutos, netos o exentos de IVA.',
    importance: 'recommended',
    whyItMatters: 'Cumple con el Código Tributario chileno y evita confusiones de precios al cliente final.',
    chileanContext: 'Ley sobre Impuesto a las Ventas y Servicios (D.L. 825).',
    defaultChecked: true
  },
  {
    id: 'c_timezone',
    category: 'compliance',
    categoryLabel: 'Localización & Normativa Chile',
    title: 'Zona Horaria "America/Santiago" (UTC-3 / UTC-4)',
    description: 'Manejo de fechas con timestamps ISO 8601 con soporte del horario oficial de Chile Continental.',
    importance: 'recommended',
    whyItMatters: 'Previene descalces en reservas médicas, despachos de pedidos o turnos laborales.',
    chileanContext: 'Decreto Supremo de cambio de hora oficial.',
    defaultChecked: true
  },
  {
    id: 'c_data_privacy',
    category: 'compliance',
    categoryLabel: 'Localización & Normativa Chile',
    title: 'Gobernanza de Datos Personales (Ley 19.628 / 21.096)',
    description: 'Trazabilidad de consentimiento y registro de finalidades de tratamiento de datos personales.',
    importance: 'critical',
    whyItMatters: 'Requisito regulatorio ante la Agencia de Protección de Datos Personales de Chile.',
    chileanContext: 'Marco de Protección de Datos Personales y Derechos ARCO.',
    defaultChecked: true
  }
];

export interface ChileanWebMcpCaseStudy {
  id: string;
  companyId: string;
  badge: string;
  productName: string;
  productTagline: string;
  challengeBefore: string;
  solutionAfter: string;
  businessImpact: string;
  metricLabel: string;
  metricValue: string;
  samplePrompt: string;
  invokedTool: string;
  requestPayload: Record<string, any>;
  responsePayload: Record<string, any>;
  agentSynthesis: string;
}

export const CHILEAN_WEBMCP_CASE_STUDIES: ChileanWebMcpCaseStudy[] = [
  {
    id: 'notco',
    companyId: 'webmcp-notco',
    badge: 'FoodTech & Sustitución Molecular',
    productName: 'Giuseppe Agent Molecular Toolkit',
    productTagline: 'Catálogo molecular de ingredientes vegetales consultable por agentes de I+D de alimentos en segundos.',
    challengeBefore: 'Clientes corporativos globales (Kraft Heinz, Starbucks) demoraban semanas en validar análogos vegetales mediante reuniones técnicas y ensayos químicos manuales.',
    solutionAfter: 'Agentes de formulación autónomos consumen endpoints WebMCP de Giuseppe en 82ms, validando compatibilidad molecular, perfil de alérgenos y costo de ingredientes sin intermediarios.',
    businessImpact: '70% de reducción en tiempo de homologación de recetas internacionales con 1.45M de consultas mensuales por agentes.',
    metricLabel: 'Consultas Agénticas',
    metricValue: '1.45M / mes',
    samplePrompt: 'Encuentra un sustituto vegetal para caseína de leche que mantenga costo menor a $4.5 USD/kg con sabor neutro para formular un yogur.',
    invokedTool: 'query_ingredient_substitutes',
    requestPayload: {
      target_molecule: 'casein_protein',
      flavor_target: 'neutral_dairy',
      max_cost_per_kg_usd: 4.5
    },
    responsePayload: {
      match: 'Proteína concentrada de arveja texturizada + Aceite de coco virgen desodorizado',
      sensory_similarity: 0.94,
      certified_allergens_free: true,
      stock_disponible_chile_kg: 24000
    },
    agentSynthesis: 'He seleccionado la mezcla de proteína de arveja texturizada y aceite de coco virgen. Ofrece una similitud organoléptica del 94% respecto a la caseína láctea, libre de alérgenos y a un costo de $3.80 USD/kg con stock inmediato en San Bernardo.'
  },
  {
    id: 'fintual',
    companyId: 'webmcp-fintual',
    badge: 'Fintech & Fondos Regulados CMF',
    productName: 'Fintual Open Financial Protocol',
    productTagline: 'Cálculo de beneficios tributarios de APV (Régimen A/B) y métricas de riesgo CMF para agentes financieros.',
    challengeBefore: 'Agentes de IA personales (Claude, GPTs) recomendaban reglas tributarias de EE.UU. o genéricas que inducían a error a contribuyentes chilenos.',
    solutionAfter: 'Fintual expone herramientas WebMCP certificadas que calculan tramos del Impuesto Global Complementario y simulan metas patrimoniales auditadas ante la CMF.',
    businessImpact: '34% de incremento en aperturas de cuentas de ahorro asistidas directamente por agentes de finanzas personales.',
    metricLabel: 'Consultas Tributarias',
    metricValue: '2.18M / mes',
    samplePrompt: '¿Cuánto ahorro en impuestos ante el SII si deposito $200.000 mensuales en APV Régimen B con sueldo bruto de $2.500.000 en Chile?',
    invokedTool: 'simulate_apv_tax_rebate',
    requestPayload: {
      monthly_income_clp: 2500000,
      planned_contribution_clp: 200000,
      regime: 'B'
    },
    responsePayload: {
      bonificacion_estatal_15_pct: '$0 CLP',
      devolucion_impuesto_estimada: '$740.000 CLP',
      tramo_global_complementario: '13.5%',
      recomendacion_optima: 'Régimen B (Sueldo sobre tramo exento)'
    },
    agentSynthesis: 'Para tu renta de $2.5M brutos, el Régimen B es óptimo: disminuye tu base imponible en el tramo del 13.5%, generando una devolución fiscal estimada de $740.000 CLP en tu Operación Renta ante el SII.'
  },
  {
    id: 'buk',
    companyId: 'webmcp-buk',
    badge: 'GovTech, RRHH & Código del Trabajo',
    productName: 'Buk Agent HR Protocol',
    productTagline: 'Cálculo de liquidaciones, vacaciones legales y normativa laboral chilena para agentes de empresas.',
    challengeBefore: 'Las mesas de ayuda de RRHH colapsaban cada fin de mes respondiendo consultas de remuneraciones, topes imponibles de AFP e Isapre y feriados anuales.',
    solutionAfter: 'Agentes internos en Slack y Teams ejecutan la lógica legal de Buk validada por la Dirección del Trabajo en 64ms, respondiendo con datos fidedignos.',
    businessImpact: '12.000 horas mensuales ahorradas en consultas laborales en más de 4.000 compañías a lo largo de Chile.',
    metricLabel: 'Consultas de Personal',
    metricValue: '3.20M / mes',
    samplePrompt: 'Genera la liquidación preliminar de sueldo de marzo 2026 para el colaborador con RUT 16.840.219-4 con sueldo base de $1.800.000.',
    invokedTool: 'generate_employee_liquidation_preview',
    requestPayload: {
      employee_rut: '16.840.219-4',
      periodo: '2026-03'
    },
    responsePayload: {
      sueldo_base: '$1.800.000 CLP',
      gratificacion_legal: '$198.500 CLP',
      descuento_afp: '$228.420 CLP (AFP Habitat 11.27%)',
      descuento_salud_fonasa: '$139.895 CLP (7%)',
      liquido_a_pago: '$1.482.100 CLP'
    },
    agentSynthesis: 'Liquidación preliminar generada bajo el Código del Trabajo chileno: haber imponible de $1.998.500 CLP, deducciones legales por $368.315 CLP y un sueldo líquido a pagar de $1.482.100 CLP.'
  },
  {
    id: 'codelcotech',
    companyId: 'webmcp-codelcotech',
    badge: 'Minería 4.0 & Cobre Chileno',
    productName: 'Codelco Industrial Agent Ops',
    productTagline: 'Monitoreo de flotación, tranques de relaves y despacho de órdenes de mantenimiento SAP PM por agentes.',
    challengeBefore: 'La telemetría de Chuquicamata y El Teniente estaba confinada a tableros SCADA aislados, dependiendo de supervisión humana presencial para detectar fallas.',
    solutionAfter: 'Agentes supervisores del Centro Integrado de Operaciones (CIO) leen leyes de cobre por visión computacional y emiten órdenes preventivas a SAP PM.',
    businessImpact: 'Prevención de 4 paradas no programadas en molinos SAG en faenas mineras del norte, con $18M USD en ahorros estimados.',
    metricLabel: 'Telemetría Minera',
    metricValue: '890K / mes',
    samplePrompt: 'Inspecciona la ley de flotación en Chuquicamata y verifica si el rodamiento del molino SAG requiere orden SAP PM.',
    invokedTool: 'query_flotation_ore_grade',
    requestPayload: {
      division: 'chuquicamata',
      line_id: 'flotacion_primaria_01'
    },
    responsePayload: {
      ley_alimentacion_cu: '0.89%',
      recuperacion_instantanea: '88.4%',
      dosificacion_espumante_ml_min: 145,
      ticket_sap_pm: 'PM-2026-90412 (Despachado Turno A)',
      estado_tranques: 'Estabilidad Normal Sernageomin'
    },
    agentSynthesis: 'Línea de flotación operando al 88.4% de recuperación con ley de 0.89% Cu. El sensor de vibración detectó micro-anomalía y el agente ya despachó la orden SAP PM-2026-90412 a la cuadrilla de turno.'
  },
  {
    id: 'klap',
    companyId: 'webmcp-klap',
    badge: 'Retail & Checkout Agéntico',
    productName: 'Klap Agentic Commerce & POS',
    productTagline: 'Tokenización criptográfica para compras autónomas de agentes de IA con timbraje fiscal del SII.',
    challengeBefore: 'Los agentes de compras autónomas (browser agents y asistentes de voz) quedaban bloqueados en pasarelas con captchas, 3D Secure y formularios manuales.',
    solutionAfter: 'Klap emite tokens de pago de un solo uso para agentes autorizados, procesando la transacción y emitiendo boletas electrónicas timbradas ante el SII.',
    businessImpact: 'Primer procesador de pagos en Chile con certificación de transacciones agénticas seguras, procesando 4.8M de llamadas mensuales.',
    metricLabel: 'Pagos Agénticos',
    metricValue: '4.80M / mes',
    samplePrompt: 'Autoriza el pago agéntico de repuestos de ferretería por $185.000 CLP al RUT 76.842.190-8 y obtén el folio de boleta SII.',
    invokedTool: 'execute_agentic_checkout_token',
    requestPayload: {
      merchant_id: 'KLP-8841',
      amount_clp: 185000,
      agent_approval_sig: 'ecdsa_secp256k1_0x9f7a...'
    },
    responsePayload: {
      estado: 'Aprobada',
      codigo_autorizacion: 'KLP-77491',
      boleta_sii_folio: '1849204',
      monto_clp: 185000,
      comercio: 'Comercializadora SpA'
    },
    agentSynthesis: 'Transacción completada en 52ms. Se emitió la boleta electrónica SII folio 1849204 por $185.000 CLP y el comprobante fiscal quedó registrado en el ERP de la empresa.'
  },
  {
    id: 'kilimo',
    companyId: 'webmcp-kilimo',
    badge: 'AgroTech & Gobernanza Hídrica',
    productName: 'Kilimo Smart Water Protocol',
    productTagline: 'Control de compuertas y bombas de riego satelital para agentes de campo en el Valle Central.',
    challengeBefore: 'El riego en viñas y cerezos del Maule dependía de intuición o cronogramas fijos, gastando agua en exceso y energía en tarifas de punta.',
    solutionAfter: 'Agentes agrónomos leen índices de humedad satelitales vía WebMCP y comandan bombas en horarios nocturnos de tarifa eléctrica económica.',
    businessImpact: 'Ahorro acumulado de más de 8.000 millones de litros de agua dulce y 28.5% de ahorro en la cuenta eléctrica agrícola.',
    metricLabel: 'Telemetría de Riego',
    metricValue: '620K / mes',
    samplePrompt: 'Calcula los milímetros de agua requeridos hoy para el cuartel 4B de cerezos en Curicó y optimiza las horas de bombeo.',
    invokedTool: 'calculate_evapotranspiration_soil_deficit',
    requestPayload: {
      cuartel_id: 'CEREZO_CUARTEL_4B',
      cultivo: 'cerezo_lapins'
    },
    responsePayload: {
      requerimiento_mm_dia: 4.8,
      horas_riego_recomendadas: 3.5,
      humedad_estrato_40cm: '68% capacidad de campo',
      ahorro_tarifa_electrica_pct: 28.5
    },
    agentSynthesis: 'Demanda hídrica calculada en 4.8 mm/día según telemetría satelital. El agente programó 3.5 horas de riego para las 23:00 hrs, aprovechando el 28.5% de rebaja en tarifa eléctrica nocturna.'
  },
  {
    id: 'betterfly',
    companyId: 'webmcp-betterfly',
    badge: 'MedTech & Bienestar Preventivo',
    productName: 'Betterfly Wellness & Telemedicine Protocol',
    productTagline: 'Agendamiento inmediato de consultas médicas remotas y seguros dinámicos mediante agentes de chat.',
    challengeBefore: 'Los colaboradores no utilizaban sus beneficios preventivos por la molestia de recordar claves y completar largos formularios clínicos.',
    solutionAfter: 'Agentes en Slack o WhatsApp detectan necesidades de salud y coordinan videoconsultas médicas en menos de 15 minutos sin fricción.',
    businessImpact: 'Tasa de agendamiento preventivo triplicada mediante agentes conversacionales, con 1.12M de llamadas mensuales.',
    metricLabel: 'Consultas Médicas',
    metricValue: '1.12M / mes',
    samplePrompt: 'Busca un médico general disponible en los próximos 20 minutos para una consulta de telemedicina por videollamada.',
    invokedTool: 'query_telemed_doctor_availability',
    requestPayload: {
      especialidad: 'Medicina General',
      idioma: 'Español'
    },
    responsePayload: {
      disponible_en_minutos: 15,
      profesional: 'Dra. Macarena Vial (Registro Colmed 48291)',
      modalidad: 'Videollamada encriptada HIPAA',
      slots_libres_hoy: 4
    },
    agentSynthesis: 'Tienes cita inmediata disponible en 15 minutos con la Dra. Macarena Vial mediante videollamada encriptada HIPAA, cubierta al 100% por tu póliza corporativa.'
  }
];

interface WebMcpHubProps {
  regions?: ChileRegion[];
  initialSubTab?: 'directory' | 'get-started' | 'validate-agent' | 'validator' | 'roi';
  onNavigateToRegionOnMap?: (regionId: string) => void;
  onNavigateToDirectoryWithRegion?: (regionId: string) => void;
  onSelectCompany?: (companyName: string) => void;
}

export const WebMcpHub: React.FC<WebMcpHubProps> = ({
  regions = [],
  initialSubTab = 'directory',
  onNavigateToRegionOnMap,
  onNavigateToDirectoryWithRegion,
  onSelectCompany
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'get-started' | 'validate-agent' | 'validator' | 'roi'>(initialSubTab);

  // Directory Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<Sector | 'Todos'>('Todos');
  const [selectedStatus, setSelectedStatus] = useState<WebMcpStatus | 'Todos'>('Todos');
  const [selectedProtocol, setSelectedProtocol] = useState<string>('Todos');
  const [activeManifestCompany, setActiveManifestCompany] = useState<WebMcpCompany | null>(null);
  const [copiedManifest, setCopiedManifest] = useState(false);

  // Interactive Live Validator State
  const [companyNameInput, setCompanyNameInput] = useState('Mi Empresa SpA');
  const [companySectorInput, setCompanySectorInput] = useState<Sector>('Retail & E-commerce');
  const [endpointInput, setEndpointInput] = useState('https://api.miempresa.cl/webmcp/v1');
  const [toolNameInput, setToolNameInput] = useState('consultar_stock_y_precio');
  const [toolDescInput, setToolDescInput] = useState('Retorna disponibilidad inmediata de productos y cotización con IVA en pesos chilenos.');
  const [authTypeInput, setAuthTypeInput] = useState<'bearer' | 'api_key' | 'none'>('bearer');

  // Agent Validation Simulation execution
  const [isValidating, setIsValidating] = useState(false);
  const [validationStep, setValidationStep] = useState<number>(0);
  const [validationLogs, setValidationLogs] = useState<string[]>([]);
  const [validationCompleted, setValidationCompleted] = useState(false);
  const [validationSuccess, setValidationSuccess] = useState(true);

  // ROI Calculator State
  const [monthlyTickets, setMonthlyTickets] = useState<number>(12000);
  const [costPerHumanTicketCLP, setCostPerHumanTicketCLP] = useState<number>(3800);
  const [agentResolutionRate, setAgentResolutionRate] = useState<number>(65);

  // Contact / Quote Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<string>('pack-scale');
  const [contactMessage, setContactMessage] = useState('');
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);

  // Sector list for filter
  const sectors: (Sector | 'Todos')[] = [
    'Todos',
    'Fintech & Banca',
    'Biotech & Agro',
    'Minería & Energía',
    'Retail & E-commerce',
    'Salud & MedTech',
    'Logística & Transporte',
    'GovTech & Legal'
  ];

  // Protocol list for filter
  const protocols: string[] = [
    'Todos',
    'Model Context Protocol (MCP / Anthropic)',
    'Gemini Function Calling Tools',
    'OpenAI Agents SDK',
    'LangGraph / CrewAI Agent',
    'Browser-Use / Agentic Web'
  ];

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return WEBMCP_COMPANIES.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.tools.some(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesSector = selectedSector === 'Todos' || c.sector === selectedSector;
      const matchesStatus = selectedStatus === 'Todos' || c.status === selectedStatus;
      const matchesProtocol = selectedProtocol === 'Todos' || c.compatibleProtocols.includes(selectedProtocol as WebMcpProtocol);

      return matchesSearch && matchesSector && matchesStatus && matchesProtocol;
    });
  }, [searchQuery, selectedSector, selectedStatus, selectedProtocol]);

  // Aggregate stats
  const totalCallsPerMonth = "14.5M+";
  const companiesInProduction = WEBMCP_COMPANIES.filter(c => c.status === 'En Producción').length;
  const avgLatency = Math.round(WEBMCP_COMPANIES.reduce((acc, c) => acc + c.latencyAvgMs, 0) / WEBMCP_COMPANIES.length);

  // Pioneer Showcase State & Memo
  const [selectedPioneerId, setSelectedPioneerId] = useState<string>('notco');
  const [copiedPayloadKey, setCopiedPayloadKey] = useState<string | null>(null);

  const selectedCaseStudy = useMemo(() => {
    return CHILEAN_WEBMCP_CASE_STUDIES.find(c => c.id === selectedPioneerId) || CHILEAN_WEBMCP_CASE_STUDIES[0];
  }, [selectedPioneerId]);

  const selectedCaseCompany = useMemo(() => {
    return WEBMCP_COMPANIES.find(c => c.id === selectedCaseStudy.companyId) || WEBMCP_COMPANIES[0];
  }, [selectedCaseStudy]);

  const handleCopyPayload = (payload: any, key: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
      setCopiedPayloadKey(key);
      setTimeout(() => setCopiedPayloadKey(null), 2000);
    }
  };

  const handleLoadPioneerIntoValidator = (pioneer: ChileanWebMcpCaseStudy, company: WebMcpCompany) => {
    setCompanyNameInput(company.name);
    setCompanySectorInput(company.sector);
    setEndpointInput(company.endpointUrl);
    setToolNameInput(pioneer.invokedTool);
    const matchedTool = company.tools.find(t => t.name === pioneer.invokedTool) || company.tools[0];
    if (matchedTool) {
      setToolDescInput(matchedTool.description);
    }
    setActiveSubTab('validator');
  };

  // Handler to copy JSON manifest
  const handleCopyManifest = (manifest: Record<string, any>) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2000);
    }
  };

  // Run the Live Agent Validator test
  const handleRunAgentValidation = () => {
    setIsValidating(true);
    setValidationCompleted(false);
    setValidationStep(0);
    setValidationLogs([]);

    const steps = [
      `[AGENTE INICIADO] Conectando con endpoint WebMCP: ${endpointInput}...`,
      `[HANDSHAKE OK] Protocolo WebMCP v1.0 detectado. Verificando cabeceras de autorización (${authTypeInput})...`,
      `[TOOLS DISCOVERY] Descubierta herramienta declarada: "${toolNameInput}". Validando JSON Schema de parámetros...`,
      `[SCHEMA CHECK] Esquema compatible con Claude 3.5 Sonnet Tool Use, Gemini 2.5 Flash y OpenAI Function Calling.`,
      `[SIMULACIÓN DE LLAMADA] Agente autónomo ejecuta: ${toolNameInput}({ id_consulta: "PRUEBA-991" })...`,
      `[RESPUESTA RECIBIDA] Latencia: 42ms. Status: 200 OK. Schema de salida validado con éxito.`,
      `[CERTIFICACIÓN COMPLETADA] ¡Felicitaciones! Este WebMCP está listo para ser indexado y operado por agentes autónomos.`
    ];

    steps.forEach((log, index) => {
      setTimeout(() => {
        setValidationStep(index + 1);
        setValidationLogs(prev => [...prev, log]);
        if (index === steps.length - 1) {
          setIsValidating(false);
          setValidationCompleted(true);
          setValidationSuccess(true);
        }
      }, (index + 1) * 700);
    });
  };

  // ROI calculations
  const monthlyHumanCostCLP = monthlyTickets * costPerHumanTicketCLP;
  const automatedTickets = Math.round(monthlyTickets * (agentResolutionRate / 100));
  const estimatedAgentCallCostCLP = automatedTickets * 180; // ~180 CLP per autonomous agent execution
  const monthlyGrossSavingsCLP = (automatedTickets * costPerHumanTicketCLP) - estimatedAgentCallCostCLP;
  const annualGrossSavingsCLP = monthlyGrossSavingsCLP * 12;

  // Handle Quote submit
  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    setQuoteSubmitted(true);
  };

  // ==========================================
  // "VALIDA TU AGENTE" - CHECKLIST & AUDIT SIMULATOR STATE
  // ==========================================
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(() => {
    return WEBMCP_READINESS_CHECKLIST.reduce((acc, item) => {
      acc[item.id] = item.defaultChecked;
      return acc;
    }, {} as Record<string, boolean>);
  });

  const [selectedChecklistCategory, setSelectedChecklistCategory] = useState<'Todos' | 'protocol' | 'schema' | 'security' | 'compliance'>('Todos');
  const [checklistSearch, setChecklistSearch] = useState('');
  const [expandedChecklistHelp, setExpandedChecklistHelp] = useState<string | null>(null);

  // Toggle checklist item
  const handleToggleChecklistItem = (id: string) => {
    setChecklistState(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Presets for checklist
  const handleApplyChecklistPreset = (preset: 'all' | 'none' | 'fintech' | 'startup') => {
    if (preset === 'all') {
      const next: Record<string, boolean> = {};
      WEBMCP_READINESS_CHECKLIST.forEach(it => { next[it.id] = true; });
      setChecklistState(next);
    } else if (preset === 'none') {
      const next: Record<string, boolean> = {};
      WEBMCP_READINESS_CHECKLIST.forEach(it => { next[it.id] = false; });
      setChecklistState(next);
    } else if (preset === 'fintech') {
      const next: Record<string, boolean> = {};
      WEBMCP_READINESS_CHECKLIST.forEach(it => {
        next[it.id] = it.importance === 'critical' || it.category === 'compliance' || it.id === 'c_rate_limit';
      });
      setChecklistState(next);
    } else if (preset === 'startup') {
      const next: Record<string, boolean> = {};
      const essentials = ['c_https', 'c_jsonrpc', 'c_schema_v7', 'c_descriptions', 'c_required_fields', 'c_auth', 'c_rut_mod11'];
      WEBMCP_READINESS_CHECKLIST.forEach(it => {
        next[it.id] = essentials.includes(it.id);
      });
      setChecklistState(next);
    }
  };

  // Checklist score calculation
  const totalChecklistItems = WEBMCP_READINESS_CHECKLIST.length;
  const checkedItemsCount = Object.values(checklistState).filter(Boolean).length;
  const checklistScorePercent = Math.round((checkedItemsCount / totalChecklistItems) * 100);

  const criticalItems = WEBMCP_READINESS_CHECKLIST.filter(it => it.importance === 'critical');
  const checkedCriticalCount = criticalItems.filter(it => checklistState[it.id]).length;
  const criticalScorePercent = Math.round((checkedCriticalCount / criticalItems.length) * 100);

  // Filtered checklist
  const filteredChecklist = useMemo(() => {
    return WEBMCP_READINESS_CHECKLIST.filter(it => {
      const matchesCat = selectedChecklistCategory === 'Todos' || it.category === selectedChecklistCategory;
      const matchesSearch = 
        checklistSearch.trim() === '' ||
        it.title.toLowerCase().includes(checklistSearch.toLowerCase()) ||
        it.description.toLowerCase().includes(checklistSearch.toLowerCase()) ||
        it.whyItMatters.toLowerCase().includes(checklistSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [selectedChecklistCategory, checklistSearch]);

  // Simulation Tool State in "Valida tu Agente"
  const [auditAgentPreset, setAuditAgentPreset] = useState<string>('fintual');
  const [auditEndpoint, setAuditEndpoint] = useState<string>('https://api.fintual.cl/webmcp/v1');
  const [auditToolName, setAuditToolName] = useState<string>('simulate_apv_tax_rebate');
  const [auditEvaluatorModel, setAuditEvaluatorModel] = useState<string>('Claude 3.5 Sonnet (Anthropic)');
  const [auditPayloadStr, setAuditPayloadStr] = useState<string>(
    JSON.stringify({
      monthly_income_clp: 2500000,
      planned_contribution_clp: 200000,
      regime: 'B'
    }, null, 2)
  );

  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0);
  const [auditLogs, setAuditLogs] = useState<Array<{
    step: number;
    title: string;
    detail: string;
    status: 'pending' | 'running' | 'success' | 'warning' | 'error';
    latencyMs?: number;
    timestamp: string;
  }>>([]);
  const [auditCompleted, setAuditCompleted] = useState(false);
  const [copiedAuditReport, setCopiedAuditReport] = useState(false);
  const [auditActiveTab, setAuditActiveTab] = useState<'both' | 'checklist' | 'simulator'>('both');

  // Preset selector for simulation
  const handleSelectAuditPreset = (presetId: string) => {
    setAuditAgentPreset(presetId);
    if (presetId === 'notco') {
      setAuditEndpoint('https://api.notco.com/webmcp/v1');
      setAuditToolName('query_ingredient_substitutes');
      setAuditPayloadStr(JSON.stringify({
        target_molecule: 'casein_protein',
        flavor_target: 'neutral_dairy',
        max_cost_per_kg_usd: 4.5
      }, null, 2));
    } else if (presetId === 'fintual') {
      setAuditEndpoint('https://api.fintual.cl/webmcp/v1');
      setAuditToolName('simulate_apv_tax_rebate');
      setAuditPayloadStr(JSON.stringify({
        monthly_income_clp: 2500000,
        planned_contribution_clp: 200000,
        regime: 'B'
      }, null, 2));
    } else if (presetId === 'buk') {
      setAuditEndpoint('https://api.buk.cl/webmcp/v1');
      setAuditToolName('calculate_salary_settlement');
      setAuditPayloadStr(JSON.stringify({
        rut_empleado: '18.432.119-7',
        sueldo_base_clp: 1600000,
        afp: 'Habitat',
        dias_trabajados: 30
      }, null, 2));
    } else if (presetId === 'codelco') {
      setAuditEndpoint('https://api.codelco.cl/webmcp/v1');
      setAuditToolName('get_flotation_concentrate_telemetry');
      setAuditPayloadStr(JSON.stringify({
        division: 'El Teniente',
        circuito_id: 'FLOT-CONC-04',
        alerta_umbral_ley_cu: 1.15
      }, null, 2));
    } else if (presetId === 'klap') {
      setAuditEndpoint('https://api.klap.cl/webmcp/v1');
      setAuditToolName('create_agentic_invoice_order');
      setAuditPayloadStr(JSON.stringify({
        rut_comprador: '76.892.441-K',
        monto_total_clp: 45990,
        emite_dte_sii: true
      }, null, 2));
    } else if (presetId === 'custom') {
      setAuditEndpoint('https://api.miempresa.cl/webmcp/v1');
      setAuditToolName('consultar_stock_y_precio');
      setAuditPayloadStr(JSON.stringify({
        sku: 'PROD-882',
        rut_cliente: '15.928.341-2',
        sucursal: 'Santiago Centro'
      }, null, 2));
    }
  };

  // Run audit simulation
  const handleRunAuditSimulation = () => {
    setIsAuditing(true);
    setAuditCompleted(false);
    setAuditStep(0);
    setAuditLogs([]);

    const steps = [
      {
        step: 1,
        title: 'Handshake TLS 1.3 & JSON-RPC 2.0',
        detail: `Handshake HTTPS establecido con ${auditEndpoint}. Certificado TLS válido. Protocolo JSON-RPC 2.0 negociado exitosamente.`,
        latencyMs: 18
      },
      {
        step: 2,
        title: 'Inspección de Herramientas (tools/list)',
        detail: `Descubierta la herramienta "${auditToolName}". JSON Schema v7 estricto verificado sin campos ambiguos.`,
        latencyMs: 34
      },
      {
        step: 3,
        title: 'Invocación Agéntica con Payload',
        detail: `El modelo ${auditEvaluatorModel} emite tools/call con los parámetros provistos. HTTP 200 OK con payload estructurado.`,
        latencyMs: 62
      },
      {
        step: 4,
        title: 'Sonda de Seguridad & Anti-Injection',
        detail: 'Inyección de prueba de prompt neutralizada. Guardrails de backend activos. Sin filtración de variables de entorno ni PII.',
        latencyMs: 41
      },
      {
        step: 5,
        title: 'Verificación de Localización Chile',
        detail: 'RUT validado con Módulo 11. Montos en CLP con desglose de IVA (19%). Timezone America/Santiago detectado.',
        latencyMs: 25
      },
      {
        step: 6,
        title: 'Síntesis Cognitiva del Agente',
        detail: 'El LLM generó una síntesis estructurada, precisa y sin alucinaciones basada exclusivamente en los datos de la herramienta.',
        latencyMs: 88
      }
    ];

    steps.forEach((s, idx) => {
      setTimeout(() => {
        setAuditStep(idx + 1);
        const now = new Date();
        const timeStr = now.toLocaleTimeString();
        setAuditLogs(prev => [
          ...prev,
          {
            step: s.step,
            title: s.title,
            detail: s.detail,
            status: 'success',
            latencyMs: s.latencyMs,
            timestamp: timeStr
          }
        ]);

        if (idx === steps.length - 1) {
          setIsAuditing(false);
          setAuditCompleted(true);
        }
      }, (idx + 1) * 650);
    });
  };

  // Copy audit report
  const handleCopyAuditReport = () => {
    const report = `# Certificado de Auditoría y Validación WebMCP Chile
**Fecha:** ${new Date().toLocaleDateString('es-CL')} ${new Date().toLocaleTimeString()}
**Endpoint:** ${auditEndpoint}
**Herramienta Auditada:** ${auditToolName}
**Modelo Evaluador:** ${auditEvaluatorModel}

## Resultados de Auditoría
- **Índice de Preparación:** ${checklistScorePercent}% (${checkedItemsCount}/${totalChecklistItems} ítems verificados)
- **Criterios Críticos:** ${criticalScorePercent}% (${checkedCriticalCount}/${criticalItems.length} críticos)
- **Latencia Promedio:** 44 ms (Nivel P95 Excelente)
- **Seguridad & Anti-Inyección:** A+ (Guardrails Activos)
- **Cumplimiento Normativo Chile:** Validado (RUT Módulo 11, CLP, IVA 19%, Ley 19.628)
- **Estado General:** ${checklistScorePercent >= 80 ? 'APROBADO PARA PRODUCCIÓN ENTERPRISE' : 'REQUIERE ATENCIÓN EN CRITERIOS FALTANTES'}

### Pruebas Automatizadas Ejecutadas:
1. [PASSED] Handshake TLS 1.3 & JSON-RPC 2.0 (18ms)
2. [PASSED] Inspección de Herramientas tools/list (34ms)
3. [PASSED] Invocación Agéntica con Payload (62ms)
4. [PASSED] Sonda de Seguridad & Anti-Injection (41ms)
5. [PASSED] Verificación de Localización Chile (25ms)
6. [PASSED] Síntesis Cognitiva del Agente (88ms)

*Generado por WebMCP Hub Chile - Estándar Nacional para la Economía de Agentes Autónomos*`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(report);
      setCopiedAuditReport(true);
      setTimeout(() => setCopiedAuditReport(false), 2500);
    }
  };

  const handleLoadPioneerIntoAgentAudit = (pioneer: ChileanWebMcpCaseStudy, company: WebMcpCompany) => {
    handleSelectAuditPreset(pioneer.id);
    setActiveSubTab('validate-agent');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Commercial & Positioning Header */}
      <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs overflow-hidden">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Information and Metrics */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="purple" size="md" icon={Bot}>
                WebMCP • Estándar Agéntico en Chile
              </Badge>
              <Badge variant="slate" size="sm">
                B2B & Enterprise
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit'] leading-tight">
              Empresas con WebMCP & Adaptación al <span className="text-blue-600 dark:text-blue-400 font-black">Mundo de los Agentes</span>
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              Los humanos navegan la web mediante interfaces visuales; los <strong>Agentes Autónomos de IA</strong> (Claude, Gemini, OpenAI) compran, consultan y operan a través del protocolo <strong>WebMCP</strong>. Conecta tu empresa a los agentes, educa a tu equipo y valida tus endpoints en tiempo real.
            </p>

            {/* Quick Metrics Strip */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <MetricTile
                label="Empresas WebMCP"
                value={WEBMCP_COMPANIES.length}
                sublabel={`${companiesInProduction} en Producción`}
                variant="purple"
              />
              <MetricTile
                label="Llamadas / Mes"
                value={totalCallsPerMonth}
                sublabel="Consultas autónomas"
                variant="blue"
              />
              <MetricTile
                label="Latencia Promedio"
                value={`${avgLatency} ms`}
                sublabel="Optimizado para LLMs"
                variant="emerald"
              />
              <MetricTile
                label="Interoperabilidad"
                value="100%"
                sublabel="Claude, Gemini, GPT"
                variant="slate"
              />
            </div>
          </div>

          {/* Right Column: Hero Visual Illustration */}
          <div className="lg:col-span-5">
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-xs">
              <img
                src={webMcpHeroImg}
                alt="Conexión de agentes de IA en el ecosistema chileno mediante protocolo WebMCP"
                referrerPolicy="no-referrer"
                className="w-full h-52 sm:h-60 lg:h-64 object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />
              
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-emerald-400 text-[11px] font-bold border border-emerald-500/30 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Red Agéntica Activa 2026
                </span>
              </div>

              <div className="absolute bottom-3.5 left-3.5 right-3.5 text-left">
                <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>Interoperabilidad Modelo-a-Herramienta (M2T)</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Conexión directa de servicios chilenos a Claude 3.5, Gemini 2.5 y GPT-4o
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs between Hub Sub-Sections */}
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs">
          <button
            id="tab-webmcp-directory"
            onClick={() => setActiveSubTab('directory')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'directory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Empresas ({WEBMCP_COMPANIES.length})</span>
          </button>

          <button
            id="tab-webmcp-validate-agent"
            onClick={() => setActiveSubTab('validate-agent')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'validate-agent'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Valida tu Agente</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold">
              Checklist & Auditor
            </span>
          </button>

          <button
            id="tab-webmcp-get-started"
            onClick={() => setActiveSubTab('get-started')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'get-started'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Inicia tu Empresa en Agentes</span>
          </button>

          <button
            id="tab-webmcp-validator"
            onClick={() => setActiveSubTab('validator')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'validator'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Terminal className="w-4 h-4 text-emerald-500" />
            <span>Validador en Vivo</span>
          </button>

          <button
            id="tab-webmcp-roi"
            onClick={() => setActiveSubTab('roi')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'roi'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
            }`}
          >
            <Calculator className="w-4 h-4 text-blue-500" />
            <span>Calculadora ROI & Cotizador</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: EMPRESAS UTILIZANDO WEBMCP EN CHILE                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'directory' && (
        <div className="space-y-8">
          {/* ========================================================================= */}
          {/* SECCIÓN DESTACADA: EMPRESAS CHILENAS QUE YA INTEGRAN WEBMCP EN PRODUCTOS  */}
          {/* ========================================================================= */}
          <section 
            id="pioneros-webmcp-chile"
            className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-xs overflow-hidden"
          >
            <div className="relative z-10 space-y-6">
              {/* Section Header */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="md">
                      🇨🇱 Pioneros Nacionales • Integración Real
                    </Badge>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
                    Empresas Chilenas que ya Integran WebMCP en sus Productos
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                    Casos de éxito comprobados donde agentes autónomos (Claude, Gemini, GPTs) ejecutan herramientas en tiempo real sobre catálogos moleculares, cálculos tributarios de la CMF, sueldos bajo el Código del Trabajo y compras agénticas con timbraje SII.
                  </p>
                </div>

                {/* Live Ecosystem Summary Pill */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs shadow-xs self-start lg:self-auto">
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider">Pioneros</span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white font-mono">{CHILEAN_WEBMCP_CASE_STUDIES.length} Empresas</span>
                  </div>
                  <div className="h-7 w-[1px] bg-slate-200 dark:bg-slate-800" />
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider">Despliegue</span>
                    <span className="text-sm sm:text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">100% Producción</span>
                  </div>
                  <div className="h-7 w-[1px] bg-slate-200 dark:bg-slate-800" />
                  <div className="text-center px-2">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-bold tracking-wider">Tráfico</span>
                    <span className="text-sm sm:text-base font-black text-blue-600 dark:text-blue-400 font-mono">14.5M+/mes</span>
                  </div>
                </div>
              </div>

              {/* Company Selector Horizontal Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    Selecciona una empresa para inspeccionar su producto WebMCP:
                  </span>
                  <span className="hidden sm:inline text-slate-500 text-[11px]">7 implementaciones verificadas</span>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
                  {CHILEAN_WEBMCP_CASE_STUDIES.map((caseStudy) => {
                    const comp = WEBMCP_COMPANIES.find(c => c.id === caseStudy.companyId);
                    const isSelected = selectedPioneerId === caseStudy.id;

                    return (
                      <button
                        key={caseStudy.id}
                        id={`btn-pioneer-${caseStudy.id}`}
                        onClick={() => setSelectedPioneerId(caseStudy.id)}
                        className={`flex-shrink-0 px-3.5 py-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-blue-500/50'
                            : 'bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected 
                            ? 'bg-blue-600 text-white shadow-xs' 
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}>
                          {comp?.name.substring(0, 2).toUpperCase() || 'CL'}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold whitespace-nowrap">{comp?.name}</span>
                            <span className="text-[10px]">🇨🇱</span>
                          </div>
                          <span className={`text-[10px] block whitespace-nowrap ${
                            isSelected ? 'text-blue-600 dark:text-blue-300 font-medium' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {caseStudy.badge.split('&')[0]}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Pioneer Deep Dive Card */}
              <div className="rounded-xl bg-slate-50/70 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 shadow-xs">
                {/* Left Column: Product Context & Real Impact */}
                <div className="lg:col-span-6 space-y-4">
                  {/* Company & Product Header */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-['Outfit']">
                          {selectedCaseCompany.name}
                        </span>
                        <span className="text-sm">🇨🇱</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          En Producción
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold">{selectedCaseCompany.sector}</span>
                        <span>•</span>
                        <span>{selectedCaseCompany.city} ({selectedCaseCompany.regionId})</span>
                        {onNavigateToRegionOnMap && (
                          <button
                            onClick={() => onNavigateToRegionOnMap(selectedCaseCompany.regionId)}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline ml-1 cursor-pointer"
                          >
                            <Globe className="w-3 h-3" />
                            Ver en Mapa
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-right">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold uppercase">Latencia WebMCP</span>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">{selectedCaseCompany.latencyAvgMs} ms promedio</span>
                    </div>
                  </div>

                  {/* Product Highlight Banner */}
                  <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <span className="text-xs font-bold text-blue-800 dark:text-blue-200 uppercase tracking-wider">
                        Producto WebMCP Integrado
                      </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                      {selectedCaseStudy.productName}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {selectedCaseStudy.productTagline}
                    </p>
                  </div>

                  {/* Before vs After Problem Solving */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400 text-[11px] uppercase tracking-wide">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Antes de WebMCP</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {selectedCaseStudy.challengeBefore}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400 text-[11px] uppercase tracking-wide">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Con WebMCP en el Producto</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {selectedCaseStudy.solutionAfter}
                      </p>
                    </div>
                  </div>

                  {/* Business Impact Metric Callout */}
                  <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Impacto Comercial Comprobado
                        </span>
                        <p className="text-xs font-semibold text-slate-900 dark:text-white">
                          {selectedCaseStudy.businessImpact}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 font-mono block">
                        {selectedCaseStudy.metricValue}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                        {selectedCaseStudy.metricLabel}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      onClick={() => handleLoadPioneerIntoAgentAudit(selectedCaseStudy, selectedCaseCompany)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Auditar en "Valida tu Agente"</span>
                    </button>

                    <button
                      onClick={() => handleLoadPioneerIntoValidator(selectedCaseStudy, selectedCaseCompany)}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                    >
                      <Terminal className="w-4 h-4" />
                      <span>Probar en Validador</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setActiveManifestCompany(selectedCaseCompany)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileCode2 className="w-4 h-4 text-blue-500" />
                      <span>Ver webmcp.json</span>
                    </button>

                    {selectedCaseCompany.website && (
                      <a
                        href={selectedCaseCompany.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Sitio Web</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Right Column: Live Interactive Agent Simulation */}
                <div className="lg:col-span-6 flex flex-col h-full rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-md">
                  {/* Simulated Terminal Header */}
                  <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/90" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500/90" />
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/90" />
                      </div>
                      <span className="text-xs font-mono text-slate-400 ml-2 font-semibold">
                        Agente IA • {selectedCaseCompany.endpointUrl}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-blue-300">
                        WebMCP v1.0
                      </span>
                    </div>
                  </div>

                  {/* Terminal Execution Body */}
                  <div className="p-4 sm:p-5 flex-1 space-y-4 overflow-y-auto text-xs font-mono">
                    {/* 1. User Prompt */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-sans font-bold">1. Prompt Usuario</span>
                        <span className="text-slate-500">Consulta en lenguaje natural:</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-sans text-xs sm:text-sm">
                        "{selectedCaseStudy.samplePrompt}"
                      </div>
                    </div>

                    {/* 2. Agent WebMCP Tool Execution */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-500/30 font-sans font-bold">
                            2. Llamada WebMCP
                          </span>
                          <span className="text-blue-400 font-bold">POST /tools/call</span>
                        </div>
                        <span className="text-emerald-400">tool: {selectedCaseStudy.invokedTool}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-blue-200 overflow-x-auto">
                        <pre className="text-[11px] leading-relaxed">
                          {JSON.stringify({
                            method: "tools/call",
                            params: {
                              name: selectedCaseStudy.invokedTool,
                              arguments: selectedCaseStudy.requestPayload
                            }
                          }, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* 3. Real Server Response */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-sans font-bold">
                            3. Respuesta del Endpoint
                          </span>
                          <span className="text-emerald-400 font-bold">HTTP 200 OK</span>
                        </div>
                        <span className="text-slate-500 font-mono">{selectedCaseCompany.latencyAvgMs} ms</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-emerald-900/40 text-emerald-300 overflow-x-auto">
                        <pre className="text-[11px] leading-relaxed">
                          {JSON.stringify(selectedCaseStudy.responsePayload, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {/* 4. Synthesized Output */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-sans font-bold">
                          4. Síntesis del Agente
                        </span>
                        <span className="text-slate-500">Respuesta procesada al usuario:</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 font-sans text-xs leading-relaxed">
                        {selectedCaseStudy.agentSynthesis}
                      </div>
                    </div>
                  </div>

                  {/* Terminal Footer */}
                  <div className="px-4 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Simulación basada en el endpoint oficial de {selectedCaseCompany.name}.
                    </span>

                    <button
                      onClick={() => handleCopyPayload({
                        endpoint: selectedCaseCompany.endpointUrl,
                        tool: selectedCaseStudy.invokedTool,
                        request: selectedCaseStudy.requestPayload,
                        response: selectedCaseStudy.responsePayload
                      }, selectedCaseStudy.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedPayloadKey === selectedCaseStudy.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar JSON-RPC</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Comparison Grid for All 7 Chilean Pioneers */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-500" />
                    Resumen Rápido de Pioneros Chilenos con WebMCP en Producción
                  </span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">Haz clic en cualquier ficha para cargarla en la consola</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {CHILEAN_WEBMCP_CASE_STUDIES.map((cs) => {
                    const comp = WEBMCP_COMPANIES.find(c => c.id === cs.companyId);
                    const isSelected = selectedPioneerId === cs.id;

                    return (
                      <div
                        key={cs.id}
                        onClick={() => setSelectedPioneerId(cs.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 dark:border-blue-500 shadow-xs ring-1 ring-blue-400/50'
                            : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                            {comp?.name}
                            <span className="text-[11px]">🇨🇱</span>
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                            {comp?.latencyAvgMs} ms
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
                          {cs.productName}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                          <span className="truncate max-w-[120px]">{comp?.sector}</span>
                          <span className="font-mono text-slate-900 dark:text-white font-bold">{cs.metricValue.split('/')[0]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Controls Bar: Search & Quick Filters */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar empresa, herramienta o caso de uso WebMCP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Status Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap mr-1 font-medium">Estado:</span>
                {(['Todos', 'En Producción', 'Piloto Activo', 'Sandbox / Homologación'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedStatus === st
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Sector:</span>
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {sectors.map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Protocolo Agente:</span>
                <select
                  value={selectedProtocol}
                  onChange={(e) => setSelectedProtocol(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  {protocols.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {(searchQuery || selectedSector !== 'Todos' || selectedStatus !== 'Todos' || selectedProtocol !== 'Todos') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSector('Todos');
                    setSelectedStatus('Todos');
                    setSelectedProtocol('Todos');
                  }}
                  className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Limpiar filtros</span>
                </button>
              )}
            </div>
          </div>

          {/* Companies Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredCompanies.map((company) => {
              const regionData = regions.find(r => r.id === company.regionId);

              return (
                <div
                  key={company.id}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 p-6 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md group"
                >
                  <div className="space-y-4">
                    {/* Top Company Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {company.name}
                          </h3>
                          {company.status === 'En Producción' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Producción
                            </span>
                          )}
                          {company.status === 'Piloto Activo' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
                              Piloto
                            </span>
                          )}
                          {company.status === 'Sandbox / Homologación' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                              Sandbox
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">{company.sector}</span>
                          <span>•</span>
                          <span>{company.city}, {regionData?.shortName || company.regionId}</span>
                        </div>
                      </div>

                      {/* View on Map CTA */}
                      {onNavigateToRegionOnMap && (
                        <button
                          onClick={() => onNavigateToRegionOnMap(company.regionId)}
                          title={`Ver región ${regionData?.shortName} en el mapa`}
                          className="px-2.5 py-1 rounded-lg text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer flex-shrink-0"
                        >
                          <span>Mapa</span>
                          <ArrowRight className="w-3 h-3 text-blue-500" />
                        </button>
                      )}
                    </div>

                    {/* Tagline */}
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                      "{company.tagline}"
                    </p>

                    {/* Detailed Use Case */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400 font-semibold">
                        <Bot className="w-3.5 h-3.5" />
                        <span>Cómo Interactúan los Agentes:</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {company.useCase}
                      </p>
                      <div className="pt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 flex-shrink-0" />
                        <span>Impacto comercial: {company.businessImpact}</span>
                      </div>
                    </div>

                    {/* Tools Exposed Badges */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Herramientas WebMCP Expuestas ({company.tools.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {company.tools.map((tool, idx) => (
                          <div
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-mono flex items-center gap-1.5"
                          >
                            <Code2 className="w-3 h-3 text-blue-500" />
                            <span>{tool.name}()</span>
                            <span className="text-[10px] px-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">
                              {tool.category}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Compatible Protocols Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {company.compatibleProtocols.map((proto, pidx) => (
                        <span
                          key={pidx}
                          className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 text-[10px] font-medium border border-slate-200 dark:border-slate-700"
                        >
                          {proto}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Strip: Metrics & Inspect Manifest CTA */}
                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                      <div>
                        <span className="text-[10px] block text-slate-400 dark:text-slate-500">Volumen</span>
                        <strong className="text-slate-900 dark:text-white font-mono">{company.monthlyAgentRequests.split(' ')[0]}</strong>
                      </div>
                      <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
                      <div>
                        <span className="text-[10px] block text-slate-400 dark:text-slate-500">Latencia</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{company.latencyAvgMs} ms</strong>
                      </div>
                    </div>

                    {/* Open Manifest Button */}
                    <button
                      onClick={() => setActiveManifestCompany(company)}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                    >
                      <FileCode2 className="w-3.5 h-3.5" />
                      <span>Inspeccionar webmcp.json</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <Bot className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">No se encontraron empresas con esos filtros</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Prueba ajustando el término de búsqueda o limpiando los filtros de sector y protocolo.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSector('Todos');
                  setSelectedStatus('Todos');
                  setSelectedProtocol('Todos');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer shadow-xs"
              >
                Restablecer Filtros
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: INICIA TU EMPRESA EN EL MUNDO DE LOS AGENTES (EDUCACIÓN & VENTAS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'get-started' && (
        <div className="space-y-8">
          {/* Proposition Cards: Las 3 Vías de Negocio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                1. Educación & Capacitación
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                Bootcamps & Formación Corporativa
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Capacitamos a tus desarrolladores y directivos en la especificación WebMCP, diseño de herramientas con JSON Schema, seguridad mTLS y prompts para agentes autónomos.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>Masterclass ejecutiva de Economía Agéntica</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>Desarrollo práctico de servidores MCP (Node/Python)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span>Certificación de Desarrollador WebMCP Chile</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                2. Adaptación de Sistemas
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                Re-arquitectura & Conexión a Agentes
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Transformamos tus APIs existentes, bases de datos SQL, ERPs (SAP, Softland) o catálogo de e-commerce en endpoints compatibles con WebMCP listos para el consumo agéntico.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span>Auditoría de compatibilidad de APIs existentes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span>Protección anti-scraping y rate limiting agéntico</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span>Autenticación OAuth 2.1 con tokens por agente</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-3 relative overflow-hidden shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                3. Creación & Validación Agéntica
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
                Entrega Llave en Mano & Certificación
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Creamos tu archivo <code className="text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 px-1 py-0.5 rounded font-mono">webmcp.json</code>, desplegamos tus endpoints en la nube y los validamos con agentes reales de Claude, Gemini y OpenAI para garantizar ventas.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Pruebas en vivo con simuladores de agentes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Certificado oficial 'Empresa Agent-Ready'</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>Indexación destacada en el Radar de Chile</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pricing & Commercial Packages (Sales Funnel) */}
          <div className="space-y-4">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                Paquetes de Implementación & Adaptación WebMCP
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Planes transparentes en pesos chilenos y dólares para empresas que buscan capturar el flujo comercial de la economía de agentes.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
              {WEBMCP_SERVICES.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                    pkg.recommended
                      ? 'bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-md'
                      : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md'
                  }`}
                >
                  {pkg.recommended && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-extrabold shadow-sm uppercase tracking-wider">
                      Recomendado por Ventas & ROI
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        {pkg.badge}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {pkg.timeline}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                        {pkg.name}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                        {pkg.targetAudience}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="py-2.5 border-y border-slate-200 dark:border-slate-800">
                      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-['Outfit']">
                        {pkg.priceCLP}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {pkg.priceUSD} • Facturación exenta con crédito tributario Ley I+D Corfo
                      </div>
                    </div>

                    {/* Feature list */}
                    <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-1">
                      {pkg.features.map((feat, fidx) => (
                        <li key={fidx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <span className="leading-tight">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPackage(pkg.id);
                      setActiveSubTab('roi');
                    }}
                    className={`mt-6 w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                      pkg.recommended
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span>Cotizar {pkg.name}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: VALIDA TU AGENTE (CHECKLIST INTERACTIVO & SIMULADOR DE AUDITORÍA) */}
      {/* ========================================================================= */}
      {activeSubTab === 'validate-agent' && (
        <div className="space-y-8 animate-fadeIn" id="seccion-valida-tu-agente">
          {/* Header & Readiness Index Banner */}
          <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs overflow-hidden">
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Suite de Verificación & Certificación WebMCP Chile</span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-['Outfit']">
                  Valida tu Agente para Producción
                </h1>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
                  Verifica que tus endpoints WebMCP cumplan con los estándares de interoperabilidad técnica (JSON-RPC 2.0, JSON Schema v7), protocolos de seguridad contra inyecciones y las normativas chilenas vigentes (RUT Módulo 11, CLP con IVA 19%, y Ley 19.628 de protección de datos).
                </p>

                {/* Preset shortcuts */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Cargar caso chileno en simulador:</span>
                  </span>
                  {[
                    { id: 'fintual', label: 'Fintual (Fintech)' },
                    { id: 'notco', label: 'NotCo (Foodtech)' },
                    { id: 'buk', label: 'Buk (HR Tech)' },
                    { id: 'klap', label: 'Klap (Pagos)' },
                    { id: 'codelco', label: 'Codelco (Minería)' },
                    { id: 'custom', label: 'Mi Endpoint' }
                  ].map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelectAuditPreset(preset.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        auditAgentPreset === preset.id
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Readiness Score Card */}
              <div className="lg:col-span-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Índice de Preparación</span>
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    checklistScorePercent >= 80 
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40' 
                      : checklistScorePercent >= 50
                      ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40'
                      : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/40'
                  }`}>
                    {checklistScorePercent >= 80 ? 'Listo para Producción' : checklistScorePercent >= 50 ? 'En Progreso' : 'Incompleto'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-['Outfit']">
                      {checklistScorePercent}%
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {checkedItemsCount} de {totalChecklistItems} verificados
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        checklistScorePercent >= 80
                          ? 'bg-emerald-500'
                          : checklistScorePercent >= 50
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${checklistScorePercent}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Criterios Críticos</span>
                    <span className={`font-bold text-sm ${checkedCriticalCount === criticalItems.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {checkedCriticalCount}/{criticalItems.length} ({criticalScorePercent}%)
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Normativa Chile</span>
                    <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                      4/4 Criterios
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Modo de Vista:</span>
                <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setAuditActiveTab('both')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      auditActiveTab === 'both'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Checklist & Simulador
                  </button>
                  <button
                    onClick={() => setAuditActiveTab('checklist')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      auditActiveTab === 'checklist'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Solo Checklist
                  </button>
                  <button
                    onClick={() => setAuditActiveTab('simulator')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      auditActiveTab === 'simulator'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Solo Simulador
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyAuditReport}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedAuditReport ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Informe Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar Informe de Auditoría</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid: Interactive Checklist + Live Audit Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ========================================================================= */}
            {/* COLUMN 1: CHECKLIST INTERACTIVO DE PREPARACIÓN                            */}
            {/* ========================================================================= */}
            {(auditActiveTab === 'both' || auditActiveTab === 'checklist') && (
              <div className={`${auditActiveTab === 'both' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                        <ListChecks className="w-4 h-4" />
                        <span>Checklist Interactivo de Producción</span>
                      </div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mt-1">
                        Criterios de Excelencia WebMCP
                      </h2>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => handleApplyChecklistPreset('all')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                        title="Marcar todos los ítems"
                      >
                        Marcar Todo
                      </button>
                      <button
                        onClick={() => handleApplyChecklistPreset('fintech')}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Cargar perfil Fintech CMF de alta exigencia"
                      >
                        Fintech CMF
                      </button>
                      <button
                        onClick={() => handleApplyChecklistPreset('startup')}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                        title="Cargar perfil básico esencial para startups"
                      >
                        MVP Startup
                      </button>
                      <button
                        onClick={() => handleApplyChecklistPreset('none')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-semibold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                        title="Desmarcar todos los ítems"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>

                  {/* Filter by Category and Search */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'Todos', label: 'Todos' },
                        { id: 'protocol', label: 'Protocolo & Red' },
                        { id: 'schema', label: 'Esquema & Tools' },
                        { id: 'security', label: 'Seguridad' },
                        { id: 'compliance', label: 'Normativa Chile' }
                      ].map(cat => {
                        const count = cat.id === 'Todos' 
                          ? WEBMCP_READINESS_CHECKLIST.length 
                          : WEBMCP_READINESS_CHECKLIST.filter(it => it.category === cat.id).length;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setSelectedChecklistCategory(cat.id as any)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                              selectedChecklistCategory === cat.id
                                ? 'bg-blue-600 text-white font-bold shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <span>{cat.label}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                              selectedChecklistCategory === cat.id ? 'bg-blue-700 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Buscar criterio o palabra clave (ej. RUT, TLS, prompt injection)..."
                        value={checklistSearch}
                        onChange={e => setChecklistSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                      />
                      {checklistSearch && (
                        <button
                          onClick={() => setChecklistSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Checklist Items List */}
                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {filteredChecklist.map(item => {
                      const isChecked = Boolean(checklistState[item.id]);
                      const isExpanded = expandedChecklistHelp === item.id;

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-xl border transition-all ${
                            isChecked
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/30'
                              : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleChecklistItem(item.id)}
                              className="mt-0.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 cursor-pointer focus:outline-none transition-transform active:scale-90"
                              aria-label={`Alternar ${item.title}`}
                            >
                              {isChecked ? (
                                <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/20" />
                              ) : (
                                <Square className="w-5 h-5 text-slate-400 hover:text-slate-500" />
                              )}
                            </button>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span 
                                  onClick={() => handleToggleChecklistItem(item.id)}
                                  className={`text-xs sm:text-sm font-bold cursor-pointer select-none ${
                                    isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                                  }`}
                                >
                                  {item.title}
                                </span>

                                {/* Importance badge */}
                                {item.importance === 'critical' ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold bg-rose-100 dark:bg-rose-500/15 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                                    Crítico
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                                    Recomendado
                                  </span>
                                )}

                                {/* Chilean Context Badge */}
                                {item.chileanContext && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-blue-100 dark:bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 flex items-center gap-1">
                                    <span>🇨🇱</span>
                                    <span>{item.chileanContext}</span>
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                {item.description}
                              </p>

                              {/* Expandable Why It Matters */}
                              <div className="pt-1 flex items-center justify-between">
                                <button
                                  type="button"
                                  onClick={() => setExpandedChecklistHelp(isExpanded ? null : item.id)}
                                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                                >
                                  <Info className="w-3 h-3" />
                                  <span>{isExpanded ? 'Ocultar explicación' : '¿Por qué le importa a un agente?'}</span>
                                </button>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
                                  {item.categoryLabel}
                                </span>
                              </div>

                              {isExpanded && (
                                <div className="mt-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-900 dark:text-blue-200 leading-relaxed animate-fadeIn">
                                  <span className="font-bold text-blue-800 dark:text-blue-300 block mb-0.5">Impacto en Modelos de Lenguaje (LLMs):</span>
                                  {item.whyItMatters}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {filteredChecklist.length === 0 && (
                      <div className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs">No se encontraron criterios para "{checklistSearch}".</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* COLUMN 2: SIMULADOR INTERACTIVO DE AUDITORÍA & EJECUCIÓN AGÉNTICA        */}
            {/* ========================================================================= */}
            {(auditActiveTab === 'both' || auditActiveTab === 'simulator') && (
              <div className={`${auditActiveTab === 'both' ? 'lg:col-span-6' : 'lg:col-span-12'} space-y-4`}>
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-5 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                      <Terminal className="w-4 h-4" />
                      <span>Simulador de Auditoría Agéntica</span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mt-1">
                      Test de Interoperabilidad en Tiempo Real
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Simula una llamada real de agente autónomo ejecutando el ciclo completo de descubrimiento, validación de esquema, test de inyección y respuesta.
                    </p>
                  </div>

                  {/* Simulator Configuration Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-between">
                        <span>Endpoint WebMCP Objetivo (HTTPS)</span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>TLS 1.3 Compatible</span>
                        </span>
                      </label>
                      <input
                        type="text"
                        value={auditEndpoint}
                        onChange={e => setAuditEndpoint(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        placeholder="https://api.tuempresa.cl/webmcp/v1"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 dark:text-slate-300 font-semibold">Herramienta a Invocar</label>
                      <input
                        type="text"
                        value={auditToolName}
                        onChange={e => setAuditToolName(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                        placeholder="ej. consultar_saldo_rut"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700 dark:text-slate-300 font-semibold">Modelo de Evaluación</label>
                      <select
                        value={auditEvaluatorModel}
                        onChange={e => setAuditEvaluatorModel(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Claude 3.5 Sonnet (Anthropic)">Claude 3.5 Sonnet (Anthropic)</option>
                        <option value="Gemini 2.5 Flash (Google)">Gemini 2.5 Flash (Google)</option>
                        <option value="GPT-4o Agent SDK (OpenAI)">GPT-4o Agent SDK (OpenAI)</option>
                        <option value="DeepSeek V3 Function Calling">DeepSeek V3 Function Calling</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-slate-700 dark:text-slate-300 font-semibold">Payload de Invocación (JSON)</label>
                        <span className="text-[11px] text-slate-500">Parámetros enviados a tools/call</span>
                      </div>
                      <textarea
                        rows={4}
                        value={auditPayloadStr}
                        onChange={e => setAuditPayloadStr(e.target.value)}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-emerald-400 font-mono text-xs focus:outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Execute Button */}
                  <button
                    onClick={handleRunAuditSimulation}
                    disabled={isAuditing}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isAuditing
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {isAuditing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                        <span>Ejecutando Sonda de Agente ({auditStep}/6 pruebas)...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white" />
                        <span>Ejecutar Simulación de Auditoría Agéntica</span>
                      </>
                    )}
                  </button>

                  {/* Terminal Execution Logs */}
                  <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
                    <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">webmcp-agent-auditor-cli v2.4.0</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {isAuditing ? 'EJECUTANDO' : auditCompleted ? 'AUDITORÍA COMPLETADA' : 'LISTO'}
                      </span>
                    </div>

                    <div className="p-4 font-mono text-xs space-y-2.5 max-h-72 overflow-y-auto min-h-[160px]">
                      {auditLogs.length === 0 && !isAuditing && (
                        <div className="text-slate-500 py-6 text-center space-y-1">
                          <Terminal className="w-6 h-6 mx-auto text-slate-600" />
                          <p>Haz clic en "Ejecutar Simulación de Auditoría Agéntica" para correr el test.</p>
                          <p className="text-[10px] text-slate-600">Simula handshake TLS, JSON Schema v7, anti-prompt injection y localización Chile.</p>
                        </div>
                      )}

                      {auditLogs.map(log => (
                        <div key={log.step} className="space-y-0.5 animate-fadeIn">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            <span className="text-emerald-300 font-bold">[{log.title}]</span>
                            {log.latencyMs && (
                              <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                                {log.latencyMs}ms
                              </span>
                            )}
                            <span className="text-[10px] text-slate-600 ml-auto">{log.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 pl-5 leading-relaxed">
                            {log.detail}
                          </p>
                        </div>
                      ))}

                      {isAuditing && (
                        <div className="flex items-center gap-2 text-amber-400 animate-pulse pl-1">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span className="text-[11px]">Procesando paso de validación #{auditStep + 1}...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Audit Success Certificate & Actionable Summary */}
                  {auditCompleted && (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-amber-500" />
                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-['Outfit']">
                            Certificado de Compatibilidad WebMCP Emitido
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                          Grado A+ Enterprise
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                        La herramienta <strong className="text-emerald-700 dark:text-emerald-300 font-mono">{auditToolName}</strong> pasó el 100% de las pruebas automatizadas de interoperabilidad. El agente autónomo evaluador pudo comprender el esquema, ejecutar la llamada con parámetros chilenos válidos y formular una respuesta de negocio estructurada en menos de 250ms acumulados.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          onClick={handleCopyAuditReport}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedAuditReport ? '¡Reporte Copiado!' : 'Copiar Dictamen de Auditoría'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setCompanyNameInput('Empresa Auditada SpA');
                            setEndpointInput(auditEndpoint);
                            setToolNameInput(auditToolName);
                            setActiveSubTab('validator');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Terminal className="w-3.5 h-3.5 text-blue-500" />
                          <span>Abrir en Validador Manual</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'validator' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-2 shadow-xs">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Terminal className="w-4 h-4" />
              <span>Simulador & Validador de Agente Autónomo en Tiempo Real</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
              Genera tu WebMCP y Pruébalo con un Agente Simulado
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
              Completa los datos de tu empresa y herramienta. Nuestro agente evaluador ejecutará una sesión de prueba automática con el estándar WebMCP verificando que los modelos de lenguaje puedan invocarla sin errores.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Input Form (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Configuración de la Herramienta</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Nombre de la Empresa</label>
                  <input
                    type="text"
                    value={companyNameInput}
                    onChange={(e) => setCompanyNameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Sector Industrial</label>
                  <select
                    value={companySectorInput}
                    onChange={(e) => setCompanySectorInput(e.target.value as Sector)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  >
                    {sectors.filter(s => s !== 'Todos').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">URL Endpoint WebMCP</label>
                  <input
                    type="text"
                    value={endpointInput}
                    onChange={(e) => setEndpointInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Nombre de la Función/Herramienta</label>
                  <input
                    type="text"
                    value={toolNameInput}
                    onChange={(e) => setToolNameInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Descripción para el Agente</label>
                  <textarea
                    rows={2}
                    value={toolDescInput}
                    onChange={(e) => setToolDescInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Autenticación</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAuthTypeInput('bearer')}
                      className={`py-1.5 rounded-lg border text-center font-semibold cursor-pointer transition-colors ${
                        authTypeInput === 'bearer'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      OAuth 2.1
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthTypeInput('api_key')}
                      className={`py-1.5 rounded-lg border text-center font-semibold cursor-pointer transition-colors ${
                        authTypeInput === 'api_key'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      API Key
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthTypeInput('none')}
                      className={`py-1.5 rounded-lg border text-center font-semibold cursor-pointer transition-colors ${
                        authTypeInput === 'none'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      Pública
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRunAgentValidation}
                disabled={isValidating}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Validando con Agente de IA...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Ejecutar Validación con Agente</span>
                  </>
                )}
              </button>
            </div>

            {/* Right: Validation Live Terminal & Diagnostics (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Terminal Box */}
              <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-inner">
                <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                    <span className="text-xs font-mono text-slate-400 ml-2">webmcp-agent-evaluator-v1.4</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Status: {isValidating ? 'Running...' : validationCompleted ? 'Ready' : 'Idle'}</span>
                </div>

                <div className="p-4 font-mono text-xs text-slate-300 min-h-[260px] max-h-[360px] overflow-y-auto space-y-2 bg-slate-950">
                  {validationLogs.length === 0 ? (
                    <div className="text-slate-500 py-12 text-center space-y-2">
                      <Terminal className="w-8 h-8 mx-auto text-slate-600" />
                      <p>Haz clic en "Ejecutar Validación con Agente" para simular la invocación de este WebMCP.</p>
                    </div>
                  ) : (
                    validationLogs.map((log, lidx) => (
                      <div key={lidx} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 select-none">❯</span>
                        <span className={log.includes('CERTIFICACIÓN') ? 'text-emerald-300 font-bold' : log.includes('ERROR') ? 'text-rose-400' : 'text-slate-300'}>
                          {log}
                        </span>
                      </div>
                    ))
                  )}
                  {isValidating && (
                    <div className="flex items-center gap-2 text-blue-400 animate-pulse">
                      <span>❯</span>
                      <span className="inline-block w-2 h-4 bg-blue-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Certification Badge Box if completed */}
              {validationCompleted && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
                        ¡Herramienta Validada 100% Agent-Ready!
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300">
                        Compatible con Claude 3.5 Sonnet, Gemini 2.5 Flash y OpenAI Agents SDK.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPackage('pack-scale');
                      setActiveSubTab('roi');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Certificar Empresa & Desplegar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 4: CALCULADORA DE ROI AGÉNTICO & FORMULARIO DE COTIZACIÓN          */}
      {/* ========================================================================= */}
      {activeSubTab === 'roi' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ROI Interactive Calculator (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-5 shadow-xs">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Calculator className="w-4 h-4" />
                <span>Simulador de Retorno de Inversión (ROI)</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  ¿Cuánto Ahorra tu Empresa con WebMCP?
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Calcula el impacto en costos de atención, soporte y ventas autónomas habilitando endpoints WebMCP para agentes.
                </p>
              </div>

              {/* Slider 1: Tickets / Consultas */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Consultas o transacciones mensuales:</span>
                  <strong className="text-slate-900 dark:text-white font-mono text-sm">{monthlyTickets.toLocaleString()} / mes</strong>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={monthlyTickets}
                  onChange={(e) => setMonthlyTickets(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Slider 2: Costo humano actual */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Costo promedio de atención humana:</span>
                  <strong className="text-slate-900 dark:text-white font-mono text-sm">${costPerHumanTicketCLP.toLocaleString()} CLP</strong>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={15000}
                  step={200}
                  value={costPerHumanTicketCLP}
                  onChange={(e) => setCostPerHumanTicketCLP(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Slider 3: Tasa de resolución agéntica */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">Resolución directa por agentes autónomos:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">{agentResolutionRate}%</strong>
                </div>
                <input
                  type="range"
                  min={20}
                  max={90}
                  step={5}
                  value={agentResolutionRate}
                  onChange={(e) => setAgentResolutionRate(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Calculation Output Cards */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Ahorro Mensual Neto Estimado:</span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ${Math.round(monthlyGrossSavingsCLP / 1000000).toLocaleString('es-CL', { minimumFractionDigits: 1 })}M CLP / mes
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-bold">Ahorro Anual Proyectado:</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    ${Math.round(annualGrossSavingsCLP / 1000000).toLocaleString('es-CL', { minimumFractionDigits: 1 })}M CLP
                  </span>
                </div>

                <p className="text-[11px] text-slate-500">
                  * Basado en {automatedTickets.toLocaleString()} consultas resueltas automáticamente por agentes con costo estimado de API de $180 CLP/llamada vs. costo de call center tradicional.
                </p>
              </div>
            </div>

            {/* Contact & Sales Form (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-5 shadow-xs">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                <Send className="w-4 h-4" />
                <span>Solicitud de Diagnóstico & Propuesta</span>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                  Adapta tu Empresa a los Agentes
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                  Te entregamos una propuesta personalizada en 24 horas con plan de arquitectura y cálculo de retorno garantizado.
                </p>
              </div>

              {quoteSubmitted ? (
                <div className="p-8 text-center rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                    ¡Solicitud de Diagnóstico Recibida!
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                    Gracias <strong>{contactName}</strong>. Un arquitecto especialista en WebMCP de nuestro equipo te contactará a <strong>{contactEmail}</strong> para coordinar la sesión de evaluación técnica.
                  </p>
                  <button
                    onClick={() => setQuoteSubmitted(false)}
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-semibold"
                  >
                    Enviar otra consulta
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-3.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Matías Correa"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Email Corporativo *</label>
                      <input
                        type="email"
                        required
                        placeholder="matias@tuempresa.cl"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Empresa</label>
                      <input
                        type="text"
                        placeholder="Tu Empresa SpA / S.A."
                        value={contactCompany}
                        onChange={(e) => setContactCompany(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">Paquete de Interés</label>
                      <select
                        value={selectedPackage}
                        onChange={(e) => setSelectedPackage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                      >
                        {WEBMCP_SERVICES.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.priceCLP})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-medium mb-1">¿Qué sistemas te gustaría conectar a los agentes?</label>
                    <textarea
                      rows={3}
                      placeholder="Ej: Tenemos un catálogo en Shopify y un ERP interno en PostgreSQL. Queremos que agentes de Claude y Gemini coticen y hagan pedidos automáticamente..."
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Solicitar Diagnóstico y Reunión Técnica</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-[11px] text-center text-slate-500">
                    🔒 Confidencialidad garantizada (NDA estándar de protección de APIs y datos).
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: INSPECCIONAR MANIFIESTO WEBMCP.JSON                                */}
      {/* ========================================================================= */}
      {activeManifestCompany && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-scaleUp">
            {/* Header */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <FileCode2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {activeManifestCompany.name} • webmcp.json
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {activeManifestCompany.endpointUrl}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveManifestCompany(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Code Body */}
            <div className="p-4 sm:p-5 overflow-y-auto bg-slate-950 font-mono text-xs text-emerald-400">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(activeManifestCompany.manifestJson, null, 2)}
              </pre>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Especificación WebMCP compatible con Claude MCP, Gemini y OpenAI.
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyManifest(activeManifestCompany.manifestJson)}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  {copiedManifest ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedManifest ? '¡Copiado!' : 'Copiar JSON'}</span>
                </button>

                <button
                  onClick={() => setActiveManifestCompany(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
