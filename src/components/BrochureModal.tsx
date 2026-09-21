import React, { useState, useEffect } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  MapPin, 
  Calendar, 
  Building2, 
  Sparkles, 
  ExternalLink,
  Bot,
  ArrowRight,
  Share2,
  CheckCircle2,
  Users,
  Compass,
  FileText,
  Smartphone,
  Target,
  AlertTriangle,
  Zap,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  MessageCircle,
  Cpu
} from 'lucide-react';

interface BrochureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: 'mapa' | 'eventos' | 'webmcp') => void;
  onOpenAddModal: () => void;
}

export const BrochureModal: React.FC<BrochureModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenAddModal
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getSummaryText = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chileairadar.cl';
    return `🇨🇱 CHILE AI RADAR — BROCHURE EJECUTIVO
Ecosistema de Inteligencia Artificial y Protocolo WebMCP en Chile
Desarrollado por AlphaDocere & Browns Studio

🤖 1. ¿QUÉ ESTAMOS HACIENDO?
• Impulsamos la transición hacia el estándar WebMCP para que los sistemas de las empresas chilenas puedan comunicarse de forma nativa y segura con agentes autónomos de IA.
• Conectamos la agenda nacional de Eventos, Summits y Hackathons de Inteligencia Artificial para dinamizar el talento.
• Mapeamos en tiempo real el ecosistema: startups de IA, Universidades con programas avanzados y centros de I+D de frontera.

🎯 2. ¿CUÁL ES EL OBJETIVO?
• Posicionar a Chile como el polo de desarrollo agéntico e industrial líder en Latinoamérica (#1 ILIA).
• Descentralizar la innovación tecnológica, vinculando la investigación de las Universidades con la industria productiva (Minería 4.0, Fintech, Agro y Clima).
• Transformar el interés tecnológico en adopción real, nuevos contratos comerciales e inversión para empresas locales.

⚠️ 3. ¿QUÉ PROBLEMA ESTAMOS ATACANDO?
• El desfase agéntico: empresas con sitios web tradicionales que ningún agente de IA de clientes puede operar directamente.
• Desconexión entre la academia/universidades y la industria productiva.
• Dispersión de información sin una fuente única verificada sobre desarrollos de IA.

💼 4. ¿CÓMO AYUDAMOS A LAS EMPRESAS?
• Integración WebMCP: Habilitamos herramientas (tools) para que agentes de IA (Claude, OpenAI, Gemini) coticen y contraten sus servicios en milisegundos.
• Visibilidad y Sello Agent-Ready en el Radar Nacional.
• Matchmaking directo con startups, Universidades y centros de I+D probados.
• Asesoría e implementación estratégica con el equipo de AlphaDocere & Browns Studio.

🔗 Explora la plataforma interactiva: ${origin}`;
  };

  const handleCopySummary = () => {
    const text = getSummaryText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = getSummaryText();
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDirectWhatsApp = () => {
    const message = `Hola AlphaDocere & Browns Studio, leí el brochure ejecutivo de Chile AI Radar y me gustaría conocer cómo integrar mi empresa al protocolo WebMCP y al mapa nacional.`;
    window.open(`https://wa.me/56983792019?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      id="brochure-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-sm overflow-y-auto touch-manipulation"
      onClick={onClose}
    >
      <div 
        id="brochure-modal-dialog"
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Top Header Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit'] block leading-tight">
                Brochure Ejecutivo • Chile AI Radar
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                Guía Rápida: Misión, Objetivos y Servicios para Empresas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* WhatsApp Share Button */}
            <button
              id="btn-brochure-share-wa"
              type="button"
              onClick={handleShareWhatsApp}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-colors cursor-pointer shadow-xs active:scale-95 min-h-[36px]"
              title="Compartir brochure en WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            {/* Copy Button */}
            <button
              id="btn-brochure-copy"
              type="button"
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer min-h-[36px]"
              title="Copiar texto resumen"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>

            {/* Print Button (desktop only) */}
            <button
              id="btn-brochure-print"
              type="button"
              onClick={handlePrint}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer min-h-[36px]"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>PDF</span>
            </button>

            {/* Close Button */}
            <button
              id="btn-brochure-close"
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              aria-label="Cerrar brochure"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Brochure Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200 font-sans">
          
          {/* Executive Hero Banner */}
          <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-slate-50 dark:from-blue-950/40 dark:via-indigo-950/25 dark:to-slate-900 border border-blue-200/80 dark:border-blue-800/50 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-xs">
                <Sparkles className="w-3 h-3" />
                Resumen Ejecutivo
              </span>
              <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/50 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800/40">
                16 Regiones de Chile
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 sm:ml-auto">
                Desarrollado por <strong className="text-slate-900 dark:text-white font-semibold">AlphaDocere & Browns Studio</strong>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-950 dark:text-white font-['Outfit'] tracking-tight">
              Chile AI Radar & Protocolo WebMCP
            </h1>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl font-medium">
              La plataforma territorial abierta que visibiliza, conecta y prepara al ecosistema chileno para la nueva economía de <strong>Agentes Autónomos de Inteligencia Artificial</strong>.
            </p>

            {/* Quick Metrics: WebMCP 1º, Eventos 2º, Startups, Universidades */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
                <div className="text-lg sm:text-xl font-black text-purple-600 dark:text-purple-400 font-['Outfit']">WebMCP</div>
                <div className="text-[10.5px] text-slate-600 dark:text-slate-400 font-medium">Protocolo para Agentes</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
                <div className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 font-['Outfit']">Eventos</div>
                <div className="text-[10.5px] text-slate-600 dark:text-slate-400 font-medium">Hackathons & Summits</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
                <div className="text-lg sm:text-xl font-black text-blue-600 dark:text-blue-400 font-['Outfit']">Startups</div>
                <div className="text-[10.5px] text-slate-600 dark:text-slate-400 font-medium">Ecosistema Aplicado</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/90 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
                <div className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 font-['Outfit']">Universidades</div>
                <div className="text-[10.5px] text-slate-600 dark:text-slate-400 font-medium">Red Académica & I+D</div>
              </div>
            </div>
          </div>

          {/* The 4 Core Questions Grid */}
          <div className="space-y-4">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
              <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Resumen Ejecutivo Directo
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">
                Entendiendo la Iniciativa en 4 Puntos Clave
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* 1. QUÉ ESTAMOS HACIENDO */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border-2 border-blue-200 dark:border-blue-900/60 space-y-3 flex flex-col justify-between hover:border-blue-500/80 transition-all shadow-xs">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">Pilar 01</span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit'] leading-tight">
                        ¿Qué estamos haciendo?
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Construimos el <strong>primer mapa territorial unificado de Inteligencia Artificial en Chile</strong> y aceleramos la adopción del estándar <strong>WebMCP</strong> para que las empresas chilenas puedan operar directamente con agentes de software autónomos.
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span><strong>1. Protocolo WebMCP:</strong> Publicación del estándar abierto <code className="text-[10.5px] px-1 py-0.2 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 rounded font-mono">webmcp.json</code> para que agentes de IA operen servicios empresariales.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span><strong>2. Agenda Nacional de Eventos:</strong> Convocatorias, Hackathons y Summits de Inteligencia Artificial para dinamizar el talento.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span><strong>3. Startups & Universidades:</strong> Mapeo de soluciones de IA aplicadas y centros académicos con investigación activa.</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToTab('mapa');
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Ver Mapa Territorial</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2. CUÁL ES EL OBJETIVO */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border-2 border-emerald-200 dark:border-emerald-900/60 space-y-3 flex flex-col justify-between hover:border-emerald-500/80 transition-all shadow-xs">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Pilar 02</span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit'] leading-tight">
                        ¿Cuál es el objetivo?
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Convertir el liderazgo teórico de Chile en el <strong>polo de negocios, agentes e infraestructura de IA más competitivo de Latinoamérica</strong>, descentralizando el conocimiento y facilitando contratos reales entre empresas y proveedores tecnológicos.
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Descentralización Real:</strong> Potenciar la Minería 4.0 en el Norte, Finanzas en Santiago, y Agro/Acuicultura en el Sur.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Empresas "Agent-Ready":</strong> Lograr que las compañías chilenas puedan ser consultadas y contratadas por agentes de IA globales.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Atracción de Capital:</strong> Facilitar a inversionistas y fondos la detección de talento regional de clase mundial.</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToTab('webmcp');
                  }}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Conocer Oportunidad WebMCP</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 3. QUÉ PROBLEMA ESTAMOS ATACANDO */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border-2 border-rose-200 dark:border-rose-900/60 space-y-3 flex flex-col justify-between hover:border-rose-500/80 transition-all shadow-xs">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">Pilar 03</span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit'] leading-tight">
                        ¿Qué problema estamos atacando?
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Atacamos la <strong>fragmentación, el centralismo extremo y la desconexión tecnológica</strong> que impide que el tejido productivo chileno adopte IA de forma práctica y segura.
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-xs mt-0.5">•</span>
                      <span><strong>El Centralismo Extremo:</strong> Más del 80% de la actividad tecnológica se visibilizaba solo en Santiago, ignorando la potencia regional.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-xs mt-0.5">•</span>
                      <span><strong>Información Dispersa:</strong> Empresas e investigadores no tenían una fuente confiable para saber qué desarrollos ya existen en Chile.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-xs mt-0.5">•</span>
                      <span><strong>La Gran Brecha Agéntica:</strong> Las páginas web actuales están hechas solo para humanos; los agentes autónomos de IA no pueden cotizar ni comprar en ellas.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-xs mt-0.5">•</span>
                      <span><strong>Desconexión con la Ciencia:</strong> La investigación de centros de I+D tardaba años en llegar a la industria productiva.</span>
                    </li>
                  </ul>
                </div>

                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 text-[11px] text-rose-800 dark:text-rose-300 font-medium">
                  Chile AI Radar actúa como el puente resolutivo entre la necesidad del negocio y la capacidad técnica.
                </div>
              </div>

              {/* 4. CÓMO AYUDAMOS A LAS EMPRESAS */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/90 dark:bg-slate-950/80 border-2 border-indigo-200 dark:border-indigo-900/60 space-y-3 flex flex-col justify-between hover:border-indigo-500/80 transition-all shadow-xs">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">Pilar 04</span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit'] leading-tight">
                        ¿Cómo ayudamos a las empresas?
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    Acompañamos a dueños y gerentes de empresas a <strong>convertir la IA en ingresos operativos y reducción de costos</strong> a través de 4 mecanismos concretos:
                  </p>

                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>1. Integración WebMCP:</strong> Exponemos APIs seguras para que agentes de IA (Claude, OpenAI, Gemini) coticen y contraten sus servicios en segundos.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>2. Sello y Presencia Verificada:</strong> Certificamos a la empresa como <em>Agent-Ready</em> en el radar nacional de las 16 regiones.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>3. Matchmaking con Proveedores:</strong> Conectamos con startups y centros de I+D con casos de uso probados en su misma industria.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>4. Acompañamiento Estratégico:</strong> Auditoría tecnológica y desarrollo ágil junto a <strong>AlphaDocere & Browns Studio</strong>.</span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToTab('webmcp');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Bot className="w-3.5 h-3.5" />
                    <span>Postular Empresa</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDirectWhatsApp}
                    className="py-2 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-emerald-200 dark:border-emerald-800"
                    title="Consultar por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Summary Strip for Decision Makers */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-emerald-600/10 border border-blue-200 dark:border-blue-800/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Alianza Tecnológica
                </span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                  ¿Por qué hacerlo con AlphaDocere & Browns Studio?
                </h3>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs self-start sm:self-auto">
                Consultoría & Desarrollo Especializado
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              No nos limitamos a mostrar un mapa: implementamos la arquitectura técnica de agentes, conectamos ERPs y bases de datos a protocolos abiertos de IA, y postulamos tu proyecto a fondos de subsidio e innovación en Chile (Corfo, Ley I+D, ANID).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <strong className="text-blue-600 dark:text-blue-400 block font-semibold">1. Auditoría Inicial</strong>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">Diagnóstico de viabilidad para saber qué herramientas exponer a agentes.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <strong className="text-indigo-600 dark:text-indigo-400 block font-semibold">2. Servidor WebMCP Seguro</strong>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">Despliegue de contratos de herramientas con control de accesos y latencia ultrabaja.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                <strong className="text-emerald-600 dark:text-emerald-400 block font-semibold">3. Entrada al Radar Nacional</strong>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">Publicación en el directorio y certificación para clientes e inversionistas.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Sticky Bottom Actions Bar */}
        <div className="sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 sm:px-6 py-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 text-center sm:text-left">
            <span>Chile AI Radar • Desarrollado por</span>
            <strong className="text-slate-800 dark:text-slate-200 font-semibold">AlphaDocere & Browns Studio</strong>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDirectWhatsApp}
              className="flex-1 sm:flex-none px-3 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contactar WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToTab('webmcp');
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer shadow-xs"
            >
              Área de Negocios
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToTab('mapa');
              }}
              className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Ver Mapa
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
