import React, { useState } from 'react';
import { 
  Bot, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Send, 
  MessageSquare, 
  Globe, 
  ShieldCheck, 
  Zap, 
  Layers, 
  Cpu, 
  TrendingUp, 
  Briefcase, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  ChevronRight, 
  SlidersHorizontal,
  Compass,
  FileCode2,
  AlertCircle
} from 'lucide-react';
import { ChileRegion } from '../types';
import webMcpHeroImg from '../assets/images/webmcp_chile_agents_1789863809782.jpg';
import { registerBusinessSubmission } from '../lib/firebase';

interface WebMcpBusinessSectionProps {
  regions: ChileRegion[];
  onNavigateToMapWithRegion?: (regionId: string) => void;
  onNotify?: (message: string, type?: 'success' | 'info') => void;
}

interface BusinessSubmission {
  id: string;
  companyName: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  regionId: string;
  website: string;
  currentTechState: string;
  agentGoal: string;
  date: string;
}

export const WebMcpBusinessSection: React.FC<WebMcpBusinessSectionProps> = ({
  regions,
  onNavigateToMapWithRegion,
  onNotify
}) => {
  // Form State
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [role, setRole] = useState('Fundador / CEO');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState('metropolitana');
  const [website, setWebsite] = useState('');
  const [currentTechState, setCurrentTechState] = useState('Tengo sitio web y APIs REST');
  const [agentGoal, setAgentGoal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Diagnostic Calculator State
  const [diagIndustry, setDiagIndustry] = useState<'retail' | 'saas' | 'servicios' | 'mineria' | 'fintech' | 'salud'>('servicios');
  const [diagIntegrations, setDiagIntegrations] = useState<'apis' | 'database' | 'manual' | 'erp'>('apis');
  const [diagVolume, setDiagVolume] = useState<'low' | 'medium' | 'high'>('medium');

  const diagnosticResult = React.useMemo(() => {
    let score = 50;
    if (diagIntegrations === 'apis') score += 35;
    if (diagIntegrations === 'database') score += 25;
    if (diagIntegrations === 'erp') score += 20;
    if (diagIntegrations === 'manual') score += 5;

    if (diagVolume === 'high') score += 15;
    if (diagVolume === 'medium') score += 10;
    if (diagVolume === 'low') score += 5;

    score = Math.min(98, score);

    const toolsRecommended: string[] = [];
    if (diagIndustry === 'retail') {
      toolsRecommended.push('consultar_stock', 'cotizar_pedido_agente', 'tracking_despacho');
    } else if (diagIndustry === 'saas') {
      toolsRecommended.push('autenticar_tenant', 'ejecutar_accion_core', 'consultar_metricas_usuario');
    } else if (diagIndustry === 'servicios') {
      toolsRecommended.push('agendar_sesion_experto', 'verificar_disponibilidad', 'generar_propuesta_mcp');
    } else if (diagIndustry === 'mineria') {
      toolsRecommended.push('telemetria_faena', 'validar_normativa_seguridad', 'gestion_turnos_contratistas');
    } else if (diagIndustry === 'fintech') {
      toolsRecommended.push('conciliacion_bancaria', 'evaluacion_riesgo_crediticio', 'pago_instantaneo_agente');
    } else {
      toolsRecommended.push('reserva_box_clinico', 'triage_sintomas_paciente', 'consulta_cobertura_isapre');
    }

    const estimatedWeeks = score >= 80 ? '2 a 3 semanas' : score >= 60 ? '3 a 5 semanas' : '4 a 6 semanas';

    return {
      score,
      toolsRecommended,
      estimatedWeeks
    };
  }, [diagIndustry, diagIntegrations, diagVolume]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !contactName.trim() || !email.trim()) {
      if (onNotify) onNotify('Por favor completa los datos mínimos de contacto.', 'info');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save directly to cloud Firestore
      await registerBusinessSubmission({
        companyName,
        contactName,
        role,
        email,
        phone,
        regionId: selectedRegionId,
        website,
        currentTechState,
        agentGoal
      });

      const newSubmission: BusinessSubmission = {
        id: `biz-${Date.now()}`,
        companyName,
        contactName,
        role,
        email,
        phone,
        regionId: selectedRegionId,
        website,
        currentTechState,
        agentGoal,
        date: new Date().toISOString()
      };

      try {
        const existing = JSON.parse(localStorage.getItem('webmcp_business_leads') || '[]');
        localStorage.setItem('webmcp_business_leads', JSON.stringify([newSubmission, ...existing]));
      } catch {
        // ignore
      }

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      if (onNotify) {
        onNotify(`¡Solicitud enviada a la nube para ${companyName}! Nos contactaremos a la brevedad.`, 'success');
      }
    } catch (err) {
      console.error('Error saving business lead to Firestore:', err);
      // Fallback local persistence
      const newSubmission: BusinessSubmission = {
        id: `biz-${Date.now()}`,
        companyName,
        contactName,
        role,
        email,
        phone,
        regionId: selectedRegionId,
        website,
        currentTechState,
        agentGoal,
        date: new Date().toISOString()
      };
      try {
        const existing = JSON.parse(localStorage.getItem('webmcp_business_leads') || '[]');
        localStorage.setItem('webmcp_business_leads', JSON.stringify([newSubmission, ...existing]));
      } catch {
        // ignore
      }
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      if (onNotify) {
        onNotify(`¡Solicitud recibida para ${companyName}!`, 'success');
      }
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hola AlphaDocere & Browns Studio, soy ${contactName || 'dueño de empresa'} de ${companyName || 'mi empresa'}. ` +
    `Vi el mapa de Chile AI Radar y queremos incorporar nuestra empresa al protocolo WebMCP para interactuar con agentes de IA.`
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Hero Section */}
      <section className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xs">
        <div className="p-5 sm:p-8 md:p-10">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Área de Negocios Oficial</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <span>Desarrollado por</span>
              <strong className="text-slate-900 dark:text-white font-semibold">AlphaDocere & Browns Studio</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Convocatoria 2026 Abierta</span>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight leading-tight">
                ¿Tu empresa aún no está en el mapa?{' '}
                <span className="text-blue-600 dark:text-blue-400">
                  Prepárate para la era donde los agentes toman el protagonismo.
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                El mapa de <strong>WebMCP en Chile</strong> identifica las organizaciones que ya cuentan con interfaces 
                estandarizadas para que agentes autónomos de IA (Claude Desktop, OpenAI Agents, Gemini, LangGraph) puedan consultar catálogos, 
                cotizar servicios y ejecutar transacciones en tiempo real.
              </p>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Si tu negocio aún no está en el mapa, desde <strong>AlphaDocere & Browns Studio</strong> diseñamos, construimos y desplegamos tu 
                servidor WebMCP certificado, conectando tus sistemas actuales para que ningún agente de tus clientes o proveedores te pase por alto.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <a
                  href="#formulario-ingreso"
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Sumar mi Empresa al Mapa</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>

                <a
                  href={`https://wa.me/56900000000?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Hablar por WhatsApp</span>
                </a>

                <a
                  href="#diagnostico-mcp"
                  className="px-3 py-2 text-xs sm:text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors underline underline-offset-4"
                >
                  Calcular diagnóstico de preparación
                </a>
              </div>
            </div>

            {/* Visual Feature Card */}
            <div className="lg:col-span-5">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200">Protocolo WebMCP Chile</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-semibold">
                    Agent-Ready 2026
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white block">Descubrimiento Agéntico Instantáneo</strong>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Los agentes de tus clientes encuentran tus servicios y operan directamente sin formularios lentos.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white block">Permisos & Telemetría Segura</strong>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Tú defines qué herramientas se exponen, con límites de tasa, cuotas y registros auditables.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <MapPin className="w-4 h-4 text-slate-700 dark:text-slate-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white block">Inclusión en el Radar Regional</strong>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Verificación en el mapa nacional de las 16 regiones como empresa pionera en adopción de IA.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Asesoría directa y homologación técnica</span>
                  <strong className="text-slate-800 dark:text-slate-200">AlphaDocere & Browns</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why WebMCP? The Shift in Business Interaction */}
      <section className="space-y-4">
        <div className="text-center max-w-3xl mx-auto space-y-1.5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            El Cambio de Reglas: Del "Humano Navegante" al "Agente Transaccional"
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Durante 30 años, tu sitio web estuvo diseñado para ojos humanos. Hoy, los clientes corporativos están delegando sus compras, cotizaciones y operaciones en agentes de inteligencia artificial.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Paradigm 1: Legacy Web */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50">
                El Mundo Anterior
              </span>
              <span className="text-xs text-slate-400">Páginas Web Tradicionales</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Diseñado únicamente para visitantes humanos
            </h3>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0 mt-1.5" />
                <span>Formularios de contacto que nadie responde o tardan 48 horas.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0 mt-1.5" />
                <span>Información oculta en PDFs, imágenes o menús complejos que los agentes no leen con precisión.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 flex-shrink-0 mt-1.5" />
                <span>Si un agente de compras busca un proveedor, descarta a las empresas que no ofrecen endpoints legibles por máquinas.</span>
              </li>
            </ul>
          </div>

          {/* Paradigm 2: WebMCP Ready */}
          <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border-2 border-blue-300 dark:border-blue-700 shadow-xs space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase font-bold text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 border border-blue-300 dark:border-blue-700">
                La Nueva Oportunidad WebMCP
              </span>
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Protocolo Agéntico 2026</span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tu empresa lista para ser contratada por agentes de IA
            </h3>

            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span><strong>Archivo <code className="font-mono bg-blue-100 dark:bg-blue-900 px-1 py-0.2 rounded">webmcp.json</code></strong> público y estandarizado con tus herramientas de negocio.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span><strong>Cotización y agendamiento automático</strong> en milisegundos con tus reglas comerciales.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span><strong>Presencia verificada</strong> en el radar nacional ante fondos, clientes y socios tecnológicos.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Interactive Readiness Calculator */}
      <section id="diagnostico-mcp" className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                Diagnóstico Rápido: ¿Qué tan preparada está tu empresa?
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Evalúa tu infraestructura actual y obtén una estimación de integración con AlphaDocere & Browns Studio.
            </p>
          </div>
          <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-medium">
            Herramienta Interactiva
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1: Industry */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              1. Tu Industria o Rubro
            </label>
            <select
              value={diagIndustry}
              onChange={(e) => setDiagIndustry(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
            >
              <option value="servicios">Servicios Profesionales / Consultoría</option>
              <option value="saas">Software SaaS / Plataforma Digital</option>
              <option value="retail">Retail / E-commerce / Distribución</option>
              <option value="fintech">Fintech / Banca / Seguros</option>
              <option value="mineria">Minería / Energía / Industria Pesada</option>
              <option value="salud">Salud / Clínicas / MedTech</option>
            </select>
          </div>

          {/* Step 2: Current Tech Base */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              2. Nivel de Sistemas Actuales
            </label>
            <select
              value={diagIntegrations}
              onChange={(e) => setDiagIntegrations(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
            >
              <option value="apis">Tenemos APIs REST / GraphQL activas</option>
              <option value="database">Bases de datos estructuradas (SQL / NoSQL)</option>
              <option value="erp">ERP corporativo (SAP, Oracle, Defontana, Softland)</option>
              <option value="manual">Procesos en Excel, WhatsApp o sitio web estático</option>
            </select>
          </div>

          {/* Step 3: Transaction Volume */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              3. Volumen Estimado de Consultas
            </label>
            <select
              value={diagVolume}
              onChange={(e) => setDiagVolume(e.target.value as any)}
              className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
            >
              <option value="low">Menos de 1.000 consultas / mes</option>
              <option value="medium">Entre 1.000 y 25.000 consultas / mes</option>
              <option value="high">Más de 25.000 consultas / mes (Alta escala)</option>
            </select>
          </div>
        </div>

        {/* Results Banner */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Índice de Viabilidad WebMCP:
              </span>
              <span className="text-sm font-extrabold font-mono text-blue-600 dark:text-blue-400">
                {diagnosticResult.score}%
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                {diagnosticResult.score >= 80 ? 'Excelente Compatibilidad' : 'Integración Asistida'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <span>Herramientas iniciales recomendadas:</span>
              {diagnosticResult.toolsRecommended.map((tool) => (
                <code key={tool} className="text-[11px] font-mono bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.2 rounded text-blue-600 dark:text-blue-300">
                  {tool}()
                </code>
              ))}
            </div>
          </div>

          <div className="flex-shrink-0 text-left md:text-right">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Tiempo estimado de desarrollo:</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">
              {diagnosticResult.estimatedWeeks}
            </span>
          </div>
        </div>
      </section>

      {/* The 4-Step Onboarding Roadmap with AlphaDocere & Browns */}
      <section className="space-y-4">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            ¿Cómo ingresa tu empresa al nuevo mapa WebMCP?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Un proceso guiado de punta a punta por <strong>AlphaDocere & Browns Studio</strong> con estándares globales de la industria.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs font-mono">
              01
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Auditoría de Casos de Uso</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Analizamos tus canales actuales e identificamos qué acciones deben poder ejecutar los agentes de IA con tu empresa.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs font-mono">
              02
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Construcción del Servidor MCP</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Desarrollamos la capa WebMCP en TypeScript/Python con schemas OpenAPI, autenticación segura y contratos de herramientas.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs font-mono">
              03
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Pruebas con Agentes Reales</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Testeo exhaustivo con runtimes de Claude, Gemini y OpenAI Operator para verificar respuestas en menos de 400ms.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs font-mono">
              04
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Certificación en el Radar</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Publicación oficial de tu insignia en el mapa nacional de Chile, dando visibilidad de tu liderazgo tecnológico.
            </p>
          </div>
        </div>
      </section>

      {/* Direct Intake Form (B2B Lead Generation) */}
      <section id="formulario-ingreso" className="p-5 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Formulario de Ingreso Empresarial
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              Postula tu empresa para el ingreso al mapa WebMCP
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Completa los datos de tu empresa. El equipo de <strong>AlphaDocere & Browns Studio</strong> revisará tu postulación para coordinar la llamada de diagnóstico y plan de arquitectura.
            </p>
          </div>

          {submittedSuccess ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-in fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-300">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                ¡Solicitud Registrada con Éxito!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Hemos guardado la postulación de <strong>{companyName}</strong>. Uno de nuestros consultores de <strong>AlphaDocere & Browns Studio</strong> se pondrá en contacto contigo a través de <strong>{email}</strong>.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <a
                  href={`https://wa.me/56900000000?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Acelerar contacto vía WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccess(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Enviar otra empresa
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Company Name */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>Nombre de la Empresa *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Logística Austral SpA / ClinTech"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                {/* Contact Name & Role */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Nombre del Contacto & Cargo *</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ej: Carolina Morales"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="sm:col-span-7 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="sm:col-span-5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
                    >
                      <option value="Fundador / CEO">Fundador / CEO</option>
                      <option value="CTO / Líder Técnico">CTO / Líder Técnico</option>
                      <option value="Gerente de Innovación">Gerente Innovación</option>
                      <option value="Gerente Comercial / Ops">Gerente Comercial / Ops</option>
                    </select>
                  </div>
                </div>

                {/* Corporate Email */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                    <span>Correo Electrónico Corporativo *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contacto@tuempresa.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                {/* WhatsApp / Phone */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Teléfono / WhatsApp de Contacto</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+56 9 1234 5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                {/* Region */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Región en Chile *</span>
                  </label>
                  <select
                    value={selectedRegionId}
                    onChange={(e) => setSelectedRegionId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
                  >
                    {regions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.romanNumeral} • {r.name} ({r.capital})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Website */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Sitio Web / LinkedIn</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://tuempresa.cl"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Current Tech State */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Estado Tecnológico Actual de la Empresa
                </label>
                <select
                  value={currentTechState}
                  onChange={(e) => setCurrentTechState(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
                >
                  <option value="Tengo sitio web y APIs REST">Tenemos APIs REST o microservicios disponibles</option>
                  <option value="Tengo bases de datos pero no APIs públicas">Tenemos bases de datos pero requerimos diseñar la capa de endpoints</option>
                  <option value="Operamos con ERP comercial">Operamos con ERP corporativo (SAP, Defontana, Softland, etc.)</option>
                  <option value="Queremos empezar desde cero">Queremos empezar desde cero y definir nuestra oferta para agentes</option>
                </select>
              </div>

              {/* Goal with AI Agents */}
              <div className="space-y-1">
                <label className="font-semibold text-slate-800 dark:text-slate-200 block">
                  ¿Qué te gustaría que un agente de IA pudiera hacer con tu empresa? (Opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ej: Queremos que agentes de compras coticen stock automáticamente y puedan agendar visitas de clientes..."
                  value={agentGoal}
                  onChange={(e) => setAgentGoal(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              {/* Submit Button & Direct Contact Notice */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Tratamiento confidencial por AlphaDocere & Browns Studio.</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Enviando postulación...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Solicitar Ingreso al Mapa</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Direct WhatsApp / Email quick links */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span>¿Prefieres coordinar una reunión ejecutiva directa?</span>
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/56900000000?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Directo</span>
              </a>
              <span>•</span>
              <a
                href="mailto:cabscryptocontacto@gmail.com?subject=Postulación%20WebMCP%20Chile%20AI%20Radar&body=Hola%20AlphaDocere%20%26%20Browns%20Studio,%20deseamos%20incorporar%20nuestra%20empresa%20al%20mapa%20WebMCP..."
                className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>cabscryptocontacto@gmail.com</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Backing Footer Badge */}
      <section className="p-4 sm:p-5 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span>
            Iniciativa de fomento y desarrollo agéntico por <strong className="text-slate-900 dark:text-white font-semibold">AlphaDocere & Browns Studio</strong>.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
            Model Context Protocol (MCP)
          </span>
          <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
            WebMCP Standard
          </span>
        </div>
      </section>
    </div>
  );
};
