import React, { useState } from 'react';
import { Organization } from '../types';
import { ORGANIZATIONS } from '../data/mockData';
import { TalentSpotlight } from './TalentSpotlight';
import { 
  HelpCircle, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight,
  MessageSquareQuote,
  Sparkles
} from 'lucide-react';

interface ConsultingPanelProps {
  onNavigateToTab: (tabId: string) => void;
  organizations?: Organization[];
  onSelectCompany?: (companyName: string) => void;
}

export const ConsultingPanel: React.FC<ConsultingPanelProps> = ({
  onNavigateToTab,
  organizations = ORGANIZATIONS,
  onSelectCompany
}) => {
  const [activeQuestion, setActiveQuestion] = useState<number | null>(0);

  const strategicQuestions = [
    {
      id: 1,
      title: "1. Modelo de Curaduría & Verificación de Empresas",
      question: "¿Cómo validaremos que una empresa realmente usa IA y no es solo 'AI-washing' o marketing?",
      context: "En el ecosistema muchas empresas dicen usar IA cuando solo usan un ChatGPT básico. Para inversionistas extranjeros, la credibilidad del mapa es el factor número 1 de éxito.",
      options: [
        "A) Validación Comunitaria Abierta (Crowdsourced + reporte de usuarios)",
        "B) Validación Técnica Curada (Requiere verificación de repo GitHub, paper científico o entrevista técnica)",
        "C) Alianza Institucional Oficial (Con sello de CENIA, Corfo o Start-Up Chile)"
      ],
      recommendation: "Recomendación: Iniciar con formulario semi-abierto y otorgar una insignia de 'Verificado' a aquellas que demuestren su arquitectura técnica."
    },
    {
      id: 2,
      title: "2. Modelo de Ingresos y Sostenibilidad Financiera",
      question: "¿Cómo monetizará la plataforma para mantener el mapa actualizado y crear contenido?",
      context: "Mantener los datos de 16 regiones al día requiere tiempo de investigación o equipo dedicado.",
      options: [
        "A) Suscripción B2B para Fondos de VC Extranjeros (Acceso a dealflow, métricas de tracción y contactos directos de fundadores)",
        "B) Modelo Job Board Patrocinado (Cobro a empresas por destacar ofertas de trabajo de IA)",
        "C) Auspicio Estatal o Multilateral (Fondos Corfo de Bienes Públicos, InvestChile o UNESCO/CENIA)"
      ],
      recommendation: "Recomendación: Postular como 'Bien Público' Corfo / InvestChile para la fase inicial, y luego monetizar con servicios de Headhunting especializado y analítica para VCs."
    },
    {
      id: 3,
      title: "3. Experiencia para Quienes Buscan Trabajo",
      question: "¿El módulo de empleo será solo informativo (qué herramientas aprender) o un portal de postulación activa?",
      context: "Mencionaste que los postulantes deben poder ver las herramientas y pequeños tutoriales para formarse.",
      options: [
        "A) Radar Formativo (Muestra las herramientas más usadas y enlaces a tutoriales para aprender)",
        "B) Portal de Empleos Integrado (Permite subir CV, filtrar por stack y postular con 1 click)",
        "C) Evaluador de Habilidades con IA (Un test rápido que te dice a qué empresa chilena haces match según tu stack)"
      ],
      recommendation: "Recomendación: Mantener el Radar de Herramientas + enlaces a cursos como foco central, y agregar enlaces directos a las vacantes de cada empresa."
    },
    {
      id: 4,
      title: "4. Contenido Formativo: ¿Propio o Curaduría?",
      question: "¿Tu equipo creará los cursos y tutoriales desde cero, o centralizaremos lo mejor de CENIA, Google y Universidades?",
      context: "Crear cursos completos en video es costoso. La curaduría inteligente con guías prácticas paso a paso aporta valor inmediato.",
      options: [
        "A) Creación Propia (Tutoriales prácticos exclusivos tipo 'Construye un Agente de IA para minería chilena')",
        "B) Curaduría de Excelencia (Agrupar cursos oficiales gratuitos de Google, Microsoft, Talento Digital y universidades)",
        "C) Formato Híbrido (Guías de arquitectura propias + enlaces a cursos certificados)"
      ],
      recommendation: "Recomendación: Formato híbrido. Producir 'Guías de Arquitectura Chilenas' cortas y apalancarse en la documentación oficial de SDKs (como Gemini API)."
    },
    {
      id: 5,
      title: "5. Mecanismo de Atracción para Inversionistas Extranjeros",
      question: "¿Qué acción concreta queremos que haga un inversionista extranjero al entrar a la landing?",
      context: "Ellos necesitan ver números rápidos. ¿Queremos que agenden una llamada, que descarguen un reporte, o que contacten a las startups?",
      options: [
        "A) Descargar el 'Chile AI Investment Report 2026' (capturar su email corporativo)",
        "B) Botón 'Solicitar Intro con Startups del Portafolio'",
        "C) Simular incentivos tributarios de la Ley I+D y conectar con asesores de InvestChile"
      ],
      recommendation: "Recomendación: El Simulador de la Ley I+D (que ya implementamos) junto con un botón de contacto con InvestChile y fundadores es el hook más persuasivo."
    },
    {
      id: 6,
      title: "6. Alcance Geográfico y Nivel de Detalle del Mapa",
      question: "¿Nos quedamos en las 16 regiones oficiales, o bajamos a comunas, parques tecnológicos y faenas?",
      context: "Chile tiene hubs muy específicos: Valparaíso (Polo universitario), Antofagasta (Polo minero), Santiago (Fintech/CENIA), Los Lagos (Salmonicultura).",
      options: [
        "A) Nivel Regional (16 Regiones + 5 Macrozones, claro y navegable)",
        "B) Nivel Ciudades & Clústeres (Santiago, Valparaíso, Concepción, Antofagasta, Puerto Montt)",
        "C) Nivel Infraestructura Crítica (Puntos GPS de Data Centers, Cables Submarinos y Antenas Starlink)"
      ],
      recommendation: "Recomendación: El modelo actual de 16 regiones con clústeres sectoriales es el más balanceado tanto para celulares como para pantallas de inversionistas."
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-800/40 rounded-3xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold mb-3">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Análisis Estratégico & Roadmap de Producto</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Análisis Integral para Definir el Funcionamiento de tu Plataforma
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Como mencionaste: <em>"Aún no estoy 100% definido el cómo va a llegar a funcionar, así que necesito que analicemos todo y luego me hagan las preguntas necesarias para resolver las dudas"</em>.
            Aquí tienes el desglose de los 3 pilares del ecosistema y las preguntas estratégicas para afinar la visión.
          </p>
        </div>
      </div>

      {/* Triángulo de Valor: Los 3 Actores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-['Outfit']">1. Inversionistas Extranjeros</h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            <strong>Qué buscan:</strong> Certeza jurídica, números macro, ventajas tributarias (Ley I+D Corfo 35%), startups con tracción y conectividad física (Humboldt, energía solar, Data Centers).
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-blue-400 font-medium">
            → Resuelto en la sección: "Inversión & Cifras"
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-['Outfit']">2. Personas que Buscan Trabajo</h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            <strong>Qué buscan:</strong> Saber qué tecnologías aprender (Gemini API, PyTorch, LangChain), qué empresas están contratando en su región y acceder a tutoriales aplicados.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-indigo-400 font-medium">
            → Resuelto en: "Tech Stack & Empleo" y "Cursos"
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold mb-3">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white font-['Outfit']">3. Empresas Chilenas (Startups a Grandes)</h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            <strong>Qué buscan:</strong> Visibilidad global, reclutar talento especializado, dar a conocer sus casos reales de IA y conectarse con hackathons y centros de I+D.
          </p>
          <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 font-medium">
            → Resuelto en: "Directorio" y "Hackathons"
          </div>
        </div>
      </div>

      {/* Talent Spotlight: Aggregated Trends on Most In-Demand Skills & AI Roles */}
      <TalentSpotlight
        organizations={organizations}
        onNavigateToTab={onNavigateToTab}
        onSelectCompany={onSelectCompany}
      />

      {/* Las 6 Preguntas Estratégicas Interactivas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquareQuote className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
            Las 6 Preguntas Clave para Definir el Siguiente Paso:
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 mb-6">
          Haz clic en cada pregunta para revisar las opciones y recomendaciones técnicas que he preparado para tu proyecto:
        </p>

        <div className="space-y-4">
          {strategicQuestions.map((q, idx) => {
            const isOpen = activeQuestion === idx;

            return (
              <div 
                key={q.id}
                className={`rounded-2xl border transition-all ${
                  isOpen 
                    ? 'bg-slate-950 border-blue-500/50 shadow-lg' 
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div 
                  onClick={() => setActiveQuestion(isOpen ? null : idx)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                      isOpen ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      0{q.id}
                    </span>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white font-['Outfit']">
                        {q.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {q.question}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    isOpen ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isOpen ? 'Ocultar' : 'Ver Análisis'}
                  </span>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-3.5 text-xs text-slate-300">
                    <p className="italic text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      Contexto: {q.context}
                    </p>

                    <div>
                      <span className="font-bold text-slate-200 block mb-2">Alternativas de diseño:</span>
                      <ul className="space-y-1.5 pl-1">
                        {q.options.map((opt, oIdx) => (
                          <li key={oIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0"></span>
                            <span>{opt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-900/50 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-blue-200 font-medium leading-relaxed">{q.recommendation}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
