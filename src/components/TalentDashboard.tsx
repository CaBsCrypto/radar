import React, { useState, useMemo } from 'react';
import { Organization, CourseResource } from '../types';
import { 
  Briefcase, 
  TrendingUp, 
  Award, 
  GraduationCap, 
  Compass, 
  DollarSign, 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  Cpu, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Users, 
  ChevronRight, 
  FileText,
  Clock,
  Filter,
  Search,
  Calculator,
  Flame,
  Check
} from 'lucide-react';

interface TalentDashboardProps {
  organizations: Organization[];
  courses?: CourseResource[];
  onNavigateToTab?: (tabId: string) => void;
  onSelectCompany?: (companyName: string) => void;
  onSelectTool?: (toolName: string) => void;
}

interface CareerTrack {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  demandTag: 'Crítica (+85%)' | 'Muy Alta (+60%)' | 'Especializada';
  chileSectorRelevance: string;
  steps: {
    level: 'Junior / Trainee' | 'Mid-Level' | 'Senior / Specialist' | 'Lead / Architect';
    experience: string;
    salaryCLP: string;
    salaryUSD: string;
    coreSkills: string[];
    typicalProjects: string;
  }[];
  keyCertifications: {
    name: string;
    issuer: string;
    type: 'Oficial Cloud' | 'Diplomado Chileno' | 'Certificación Técnica';
    url: string;
    matchedCourseId?: string;
  }[];
}

const CAREER_TRACKS: CareerTrack[] = [
  {
    id: 'genai-llm',
    title: 'Ingeniería de Generative AI & Sistemas LLM',
    shortTitle: 'GenAI & LLMs',
    description: 'Diseño e integración de agentes autónomos, flujos RAG avanzados, fine-tuning y orquestación de modelos multimodales para banca, fintech y SaaS en Chile.',
    iconName: 'Cpu',
    demandTag: 'Crítica (+85%)',
    chileSectorRelevance: 'Fintech (Fintoc, BCI, Santander), E-commerce (Falabella, Mercado Libre) y Startups de productividad.',
    steps: [
      {
        level: 'Junior / Trainee',
        experience: '0 - 2 años',
        salaryCLP: '$1.8M - $2.6M CLP / mes',
        salaryUSD: '$22k - $32k USD / año',
        coreSkills: ['Python', 'Prompt Engineering', 'FastAPI', 'Gemini API', 'Git'],
        typicalProjects: 'Integración de chatbots con APIs existentes, extracción de texto no estructurado y asistentes internos.'
      },
      {
        level: 'Mid-Level',
        experience: '2 - 4 años',
        salaryCLP: '$3.0M - $4.4M CLP / mes',
        salaryUSD: '$38k - $55k USD / año',
        coreSkills: ['LangChain / LlamaIndex', 'PostgreSQL pgvector', 'RAG con Re-ranking', 'Evaluación de Alucinaciones', 'Docker'],
        typicalProjects: 'Sistemas de búsqueda semántica corporativa sobre millones de contratos, routers de agentes y workflows multi-LLM.'
      },
      {
        level: 'Senior / Specialist',
        experience: '4 - 7 años',
        salaryCLP: '$4.8M - $6.8M CLP / mes',
        salaryUSD: '$60k - $85k USD / año',
        coreSkills: ['vLLM / TensorRT-LLM', 'Fine-Tuning LoRA/QLoRA', 'Latencia & Token Optimization', 'GCP Vertex AI', 'Kubernetes'],
        typicalProjects: 'Auto-hospedaje de modelos de lenguaje en clústeres GPU locales, optimización de inferencia masiva y guardrails de seguridad.'
      },
      {
        level: 'Lead / Architect',
        experience: '7+ años',
        salaryCLP: '$7.0M - $10.5M CLP / mes',
        salaryUSD: '$88k - $130k USD / año',
        coreSkills: ['Estrategia Empresarial de IA', 'Gobernanza & Cumplimiento ANCI', 'Arquitectura de Datos Corporativa', 'Gestión de Costos Cloud'],
        typicalProjects: 'Definición del roadmap tecnológico de IA para multinacionales, cumplimiento normativo y liderazgo de squads de ML.'
      }
    ],
    keyCertifications: [
      {
        name: 'Google Cloud Professional Machine Learning Engineer',
        issuer: 'Google Cloud (Datacenter Quilicura)',
        type: 'Oficial Cloud',
        url: 'https://cloud.google.com/learn/certification/machine-learning-engineer'
      },
      {
        name: 'Diplomado en Inteligencia Artificial Aplicada',
        issuer: 'CENIA & Pontificia Universidad Católica de Chile',
        type: 'Diplomado Chileno',
        url: 'https://cenia.cl'
      },
      {
        name: 'LangChain & Vector Databases Production Certification',
        issuer: 'DeepLearning.AI',
        type: 'Certificación Técnica',
        url: 'https://www.deeplearning.ai'
      }
    ]
  },
  {
    id: 'mlops-cloud',
    title: 'MLOps, Infraestructura Cloud & Plataformas de Datos',
    shortTitle: 'MLOps & Plataformas',
    description: 'Automatización del ciclo de vida de modelos, pipelines de datos en tiempo real, despliegue en Kubernetes y gestión de GPUs en centros de datos chilenos.',
    iconName: 'Layers',
    demandTag: 'Muy Alta (+60%)',
    chileSectorRelevance: 'Centros de datos (Google, AWS, Microsoft en RM), banca chilena, logística y telecomunicaciones.',
    steps: [
      {
        level: 'Junior / Trainee',
        experience: '0 - 2 años',
        salaryCLP: '$1.7M - $2.5M CLP / mes',
        salaryUSD: '$21k - $31k USD / año',
        coreSkills: ['Linux', 'Docker', 'Python / Bash', 'SQL & Data Warehousing', 'CI/CD Básico'],
        typicalProjects: 'Automatización de tests de modelos, creación de imágenes de contenedores y monitoreo de logs de inferencia.'
      },
      {
        level: 'Mid-Level',
        experience: '2 - 4 años',
        salaryCLP: '$2.9M - $4.2M CLP / mes',
        salaryUSD: '$36k - $52k USD / año',
        coreSkills: ['Kubernetes (EKS/GKE)', 'MLflow / Kubeflow', 'Feature Stores', 'Terraform', 'Kafka / Streaming'],
        typicalProjects: 'Despliegue de pipelines automáticos de re-entrenamiento continuo y monitorización de drift de datos en producción.'
      },
      {
        level: 'Senior / Specialist',
        experience: '4 - 7 años',
        salaryCLP: '$4.5M - $6.5M CLP / mes',
        salaryUSD: '$56k - $82k USD / año',
        coreSkills: ['Optimización GPU Clúster', 'FinOps & Costos de Inferencia', 'Zero Trust & Ciberseguridad', 'Multi-Cloud Architecture'],
        typicalProjects: 'Arquitectura de alta disponibilidad con failover entre centros de datos chilenos y latencia < 20ms en Sudamérica.'
      },
      {
        level: 'Lead / Architect',
        experience: '7+ años',
        salaryCLP: '$6.8M - $9.5M CLP / mes',
        salaryUSD: '$85k - $120k USD / año',
        coreSkills: ['Enterprise Data Platform Leadership', 'SRE Practices', 'Contratos de Conectividad Submarina', 'Team Mentorship'],
        typicalProjects: 'Dirección de la infraestructura continental para soportar millones de inferencias diarias con 99.99% uptime.'
      }
    ],
    keyCertifications: [
      {
        name: 'Certified Kubernetes Administrator (CKA)',
        issuer: 'Cloud Native Computing Foundation (CNCF)',
        type: 'Oficial Cloud',
        url: 'https://www.cncf.io/certification/cka/'
      },
      {
        name: 'AWS Certified Machine Learning - Specialty',
        issuer: 'Amazon Web Services',
        type: 'Oficial Cloud',
        url: 'https://aws.amazon.com/certification/certified-machine-learning-specialty/'
      },
      {
        name: 'Especialización en MLOps & Pipelines de Datos',
        issuer: 'Talento Digital para Chile & Corfo',
        type: 'Diplomado Chileno',
        url: 'https://talentodigitalparachile.cl'
      }
    ]
  },
  {
    id: 'cv-industrial',
    title: 'Computer Vision & Edge AI Industrial (Minería, Agro & Forestal)',
    shortTitle: 'Visión & Edge AI',
    description: 'Sistemas de visión artificial en hardware embebido resistente a polvo y temperatura en faenas mineras de Antofagasta y plantas agroindustriales del sur.',
    iconName: 'Compass',
    demandTag: 'Especializada',
    chileSectorRelevance: 'Minería del Cobre/Litio (Antofagasta, Calama), Agroindustria (O’Higgins, Maule) y Forestal (Biobío).',
    steps: [
      {
        level: 'Junior / Trainee',
        experience: '0 - 2 años',
        salaryCLP: '$2.0M - $2.8M CLP / mes',
        salaryUSD: '$25k - $35k USD / año',
        coreSkills: ['OpenCV', 'Python', 'YOLOv8', 'Anotación de Datos', 'Bases de Robótica'],
        typicalProjects: 'Etiquetado de imágenes de roca, entrenamiento de clasificadores básicos de defectos en fruta o madera.'
      },
      {
        level: 'Mid-Level',
        experience: '2 - 4 años',
        salaryCLP: '$3.4M - $4.8M CLP / mes',
        salaryUSD: '$42k - $60k USD / año',
        coreSkills: ['PyTorch / TorchScript', 'NVIDIA Jetson / TensorRT', 'Segmentación Semántica', 'C++ para Edge', 'RTSP / Video Streaming'],
        typicalProjects: 'Cámaras inteligentes para detección de fatiga en operadores de camiones de extracción minera o clasificación de uva en packing.'
      },
      {
        level: 'Senior / Specialist',
        experience: '4 - 7 años',
        salaryCLP: '$5.2M - $7.5M CLP / mes',
        salaryUSD: '$65k - $94k USD / año',
        coreSkills: ['Edge Hardware Hardening', 'SLAM & Robótica Autónoma', 'Procesamiento Multiespectral', 'Model Quantization (INT8)'],
        typicalProjects: 'Guiado autónomo de maquinaria pesada bajo tierra y algoritmos de predicción de ley mineral mediante hiperespectroscopía.'
      },
      {
        level: 'Lead / Architect',
        experience: '7+ años',
        salaryCLP: '$7.5M - $11.0M CLP / mes',
        salaryUSD: '$95k - $140k USD / año',
        coreSkills: ['Seguridad en Faenas Críticas', 'Diseño de Productos Hardware+IA', 'Patentes & I+D Corfo', 'Liderazgo Técnico de Campo'],
        typicalProjects: 'Ecosistema de control y automatización de procesos industriales con ahorro de millones de dólares en agua y energía.'
      }
    ],
    keyCertifications: [
      {
        name: 'Computer Vision on Embedded Systems (Jetson DLI)',
        issuer: 'NVIDIA Deep Learning Institute',
        type: 'Certificación Técnica',
        url: 'https://www.nvidia.com/en-us/training/'
      },
      {
        name: 'Postítulo en Minería 4.0 & Automatización',
        issuer: 'Universidad de Chile (DIMin) & Universidad de Antofagasta',
        type: 'Diplomado Chileno',
        url: 'https://uchile.cl'
      },
      {
        name: 'PyTorch Certified Machine Learning Specialist',
        issuer: 'Linux Foundation / Meta AI',
        type: 'Certificación Técnica',
        url: 'https://training.linuxfoundation.org/'
      }
    ]
  },
  {
    id: 'data-science-applied',
    title: 'Data Science & Modelado Matemático Predictivo',
    shortTitle: 'Data Science & Finanzas',
    description: 'Modelos predictivos de riesgo crediticio, prevención de fraudes, optimización logística y forecasting de series de tiempo para banca y retail.',
    iconName: 'TrendingUp',
    demandTag: 'Muy Alta (+60%)',
    chileSectorRelevance: 'Banca y Servicios Financieros, Retail, Logística y Empresas Públicas en Chile.',
    steps: [
      {
        level: 'Junior / Trainee',
        experience: '0 - 2 años',
        salaryCLP: '$1.6M - $2.4M CLP / mes',
        salaryUSD: '$20k - $30k USD / año',
        coreSkills: ['Python / R', 'SQL Avanzado', 'Pandas / NumPy', 'Scikit-Learn', 'Tableau / PowerBI'],
        typicalProjects: 'Modelos de churn de clientes, tableros analíticos interactivos y limpieza de grandes fuentes de datos relacionales.'
      },
      {
        level: 'Mid-Level',
        experience: '2 - 4 años',
        salaryCLP: '$2.8M - $4.0M CLP / mes',
        salaryUSD: '$35k - $50k USD / año',
        coreSkills: ['XGBoost / LightGBM', 'Modelos de Riesgo Crediticio', 'A/B Testing Riguroso', 'Explicabilidad (SHAP/LIME)', 'FastAPI'],
        typicalProjects: 'Scoring crediticio automatizado con mitigación de sesgos algorítmicos y modelos de demanda para abastecimiento de tiendas.'
      },
      {
        level: 'Senior / Specialist',
        experience: '4 - 7 años',
        salaryCLP: '$4.2M - $6.2M CLP / mes',
        salaryUSD: '$52k - $78k USD / año',
        coreSkills: ['Modelos Causales & Econometría', 'Deep Learning para Series de Tiempo', 'Simulación Monte Carlo', 'Arquitectura de Datos'],
        typicalProjects: 'Detección de fraudes en tiempo real para millones de transacciones interbancarias y optimización de precios dinámicos.'
      },
      {
        level: 'Lead / Architect',
        experience: '7+ años',
        salaryCLP: '$6.5M - $9.2M CLP / mes',
        salaryUSD: '$80k - $115k USD / año',
        coreSkills: ['Chief Data Officer Roadmap', 'Gobierno de Datos & CMF', 'Data Storytelling Ejecutivo', 'Gestión de Talento Analítico'],
        typicalProjects: 'Transformación del modelo analítico del negocio bancario o asegurador con aprobación de comités directivos.'
      }
    ],
    keyCertifications: [
      {
        name: 'Magíster en Inteligencia Artificial / Data Science',
        issuer: 'Universidad de Chile / Pontificia Universidad Católica',
        type: 'Diplomado Chileno',
        url: 'https://cenia.cl'
      },
      {
        name: 'Financial Risk & Data Modeling Certification',
        issuer: 'GARP / Columbia University Online',
        type: 'Certificación Técnica',
        url: 'https://www.garp.org'
      },
      {
        name: 'TensorFlow Developer Certificate',
        issuer: 'Google TensorFlow',
        type: 'Oficial Cloud',
        url: 'https://www.tensorflow.org/certificate'
      }
    ]
  }
];

export const TalentDashboard: React.FC<TalentDashboardProps> = ({
  organizations,
  courses = [],
  onNavigateToTab,
  onSelectCompany,
  onSelectTool
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>('genai-llm');
  const [currencyMode, setCurrencyMode] = useState<'CLP' | 'USD'>('CLP');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('Todos');
  const [searchRoleQuery, setSearchRoleQuery] = useState('');

  // Interactive Salary Estimator inputs
  const [calcTrackId, setCalcTrackId] = useState<string>('genai-llm');
  const [calcLevelIndex, setCalcLevelIndex] = useState<number>(1); // Mid-Level
  const [calcRemoteUsCompany, setCalcRemoteUsCompany] = useState<boolean>(false);
  const [calcMiningBonus, setCalcMiningBonus] = useState<boolean>(false);
  const [calcEnglishFluent, setCalcEnglishFluent] = useState<boolean>(true);

  // Active track object
  const activeTrack = useMemo(() => {
    return CAREER_TRACKS.find(t => t.id === selectedTrackId) || CAREER_TRACKS[0];
  }, [selectedTrackId]);

  // Aggregate organizations hiring and their specific roles
  const activeHiringOrganizations = useMemo(() => {
    return organizations.filter(o => o.hiringStatus && o.openRoles && o.openRoles.length > 0);
  }, [organizations]);

  // Extract all open roles with their matching metadata
  const allHiringRoles = useMemo(() => {
    const roles: { 
      roleTitle: string; 
      orgName: string; 
      city: string; 
      sector: string; 
      tools: string[]; 
      orgId: string;
      regionId: string;
    }[] = [];

    activeHiringOrganizations.forEach(org => {
      (org.openRoles || []).forEach(role => {
        roles.push({
          roleTitle: role,
          orgName: org.name,
          city: org.city,
          sector: org.sector,
          tools: org.toolsUsed,
          orgId: org.id,
          regionId: org.regionId
        });
      });
    });

    return roles;
  }, [activeHiringOrganizations]);

  // Filtered live roles
  const filteredRoles = useMemo(() => {
    return allHiringRoles.filter(r => {
      const matchesSearch = searchRoleQuery.trim() === '' || 
        r.roleTitle.toLowerCase().includes(searchRoleQuery.toLowerCase()) ||
        r.orgName.toLowerCase().includes(searchRoleQuery.toLowerCase()) ||
        r.tools.some(t => t.toLowerCase().includes(searchRoleQuery.toLowerCase()));

      return matchesSearch;
    });
  }, [allHiringRoles, searchRoleQuery]);

  // Salary Calculator computation
  const calculatedSalary = useMemo(() => {
    const track = CAREER_TRACKS.find(t => t.id === calcTrackId) || CAREER_TRACKS[0];
    const baseStep = track.steps[calcLevelIndex];

    // Baseline median in Millions CLP/month
    const baseMedians = [2.2, 3.7, 5.8, 8.5]; // for levels 0, 1, 2, 3
    let medianCLP = baseMedians[calcLevelIndex];

    if (calcTrackId === 'cv-industrial' && calcMiningBonus) {
      medianCLP *= 1.25; // +25% for mining faena
    }
    if (calcEnglishFluent) {
      medianCLP *= 1.15; // +15% english premium
    }
    if (calcRemoteUsCompany) {
      medianCLP *= 1.45; // +45% US dollar remote contract
    }

    const lowCLP = Math.round((medianCLP * 0.85) * 10) / 10;
    const highCLP = Math.round((medianCLP * 1.20) * 10) / 10;

    // Convert to USD annual (approx 1 USD = 950 CLP)
    const annualUsdLow = Math.round((lowCLP * 1_000_000 * 12) / 950);
    const annualUsdHigh = Math.round((highCLP * 1_000_000 * 12) / 950);

    // Corfo Ley I+D tax deduction benefit for Chilean employers
    const corfoAnnualDeductionCLP = Math.round(medianCLP * 12 * 0.35 * 10) / 10;

    return {
      monthlyCLP: `$${lowCLP}M - $${highCLP}M CLP / mes`,
      annualUSD: `$${(annualUsdLow / 1000).toFixed(0)}k - $${(annualUsdHigh / 1000).toFixed(0)}k USD / año`,
      corfoTaxBenefit: `$${corfoAnnualDeductionCLP}M CLP rebajables de impuestos/año (Crédito 35%)`,
      stepName: baseStep.level
    };
  }, [calcTrackId, calcLevelIndex, calcRemoteUsCompany, calcMiningBonus, calcEnglishFluent]);

  return (
    <div id="talent-dashboard" className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-800/40 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Briefcase className="w-3.5 h-3.5 text-blue-400" />
            <span>Radar de Talento & Empleabilidad en IA • Chile 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-['Outfit']">
            Rutas de Carrera, Salarios & Certificaciones de IA
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Explora las proyecciones profesionales más demandadas en el ecosistema chileno, salarios reales de mercado en CLP y USD, certificaciones avaladas por Corfo y centros universitarios, y vacantes activas en startups de todo el país.
          </p>

          {/* Quick Stat Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs flex items-center gap-2">
              <span className="text-blue-400 font-bold font-['Outfit'] text-sm">
                {allHiringRoles.length}
              </span>
              <span className="text-slate-300">Vacantes Abiertas Detectadas</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs flex items-center gap-2">
              <span className="text-emerald-400 font-bold font-['Outfit'] text-sm">
                $1.8M - $11.0M
              </span>
              <span className="text-slate-300">Rango Salarial Mensual CLP</span>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-xs flex items-center gap-2">
              <span className="text-amber-400 font-bold font-['Outfit'] text-sm">
                35% Corfo
              </span>
              <span className="text-slate-300">Ahorro Tributario Ley I+D</span>
            </div>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none hidden lg:block" />
      </div>

      {/* Track Selector Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
          {CAREER_TRACKS.map(track => {
            const isSelected = track.id === selectedTrackId;
            return (
              <button
                key={track.id}
                id={`track-tab-${track.id}`}
                onClick={() => setSelectedTrackId(track.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Cpu className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-blue-400'}`} />
                <span>{track.shortTitle}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                  isSelected ? 'bg-blue-800 text-blue-200' : 'bg-slate-800 text-slate-400'
                }`}>
                  {track.demandTag}
                </span>
              </button>
            );
          })}
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800 flex-shrink-0">
          <span className="text-[11px] text-slate-400 px-2 font-medium">Moneda:</span>
          <div className="flex items-center gap-1">
            <button
              id="currency-toggle-clp"
              onClick={() => setCurrencyMode('CLP')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currencyMode === 'CLP'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇨🇱 CLP / mes
            </button>
            <button
              id="currency-toggle-usd"
              onClick={() => setCurrencyMode('USD')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                currencyMode === 'USD'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🇺🇸 USD / año
            </button>
          </div>
        </div>
      </div>

      {/* Main Track Detail Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Visual Career Ladder & Progression (Takes 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-6 shadow-xl">
            {/* Track Info Header */}
            <div className="space-y-2 pb-4 border-b border-slate-800">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <span>{activeTrack.title}</span>
                </h2>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  Demanda en Chile: {activeTrack.demandTag}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeTrack.description}
              </p>
              <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span><strong>Sectores clave en Chile:</strong> {activeTrack.chileSectorRelevance}</span>
              </div>
            </div>

            {/* Visual Step-by-Step Career Progression Ladder */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-['Outfit']">
                  Escalera de Carrera & Hitos de Nivel
                </h3>
                <span className="text-[11px] text-blue-400 font-medium">
                  Valores salariales actualizados a 2026
                </span>
              </div>

              <div className="space-y-3 relative">
                {activeTrack.steps.map((step, idx) => {
                  const isTopLevel = idx === activeTrack.steps.length - 1;
                  return (
                    <div 
                      key={step.level}
                      className={`relative p-5 rounded-2xl border transition-all ${
                        isTopLevel
                          ? 'bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border-blue-500/40 shadow-lg'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold ${
                            isTopLevel ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-sm font-bold text-white block">
                              {step.level}
                            </span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              {step.experience} de experiencia
                            </span>
                          </div>
                        </div>

                        {/* Salary Benchmark Badge */}
                        <div className="text-right sm:text-right bg-blue-950/80 px-3 py-1.5 rounded-xl border border-blue-800/40">
                          <span className="text-xs font-extrabold text-emerald-400 font-['Outfit'] block">
                            {currencyMode === 'CLP' ? step.salaryCLP : step.salaryUSD}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {currencyMode === 'CLP' ? 'Líquido promedio mercado' : 'Bruto anual global'}
                          </span>
                        </div>
                      </div>

                      {/* Responsibilities & Projects */}
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        <strong className="text-slate-200">Enfoque de proyectos:</strong> {step.typicalProjects}
                      </p>

                      {/* Required Skills Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-slate-800/80">
                        <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">
                          Stack esperado:
                        </span>
                        {step.coreSkills.map(skill => (
                          <button
                            key={skill}
                            onClick={() => onSelectTool && onSelectTool(skill)}
                            className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-blue-900/60 border border-slate-700/80 text-[11px] text-blue-300 font-medium transition-colors cursor-pointer"
                            title={`Ver empresas que usan ${skill}`}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recommended Certifications for this Track */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-['Outfit'] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Certificaciones & Programas Clave para esta Ruta</span>
                </h3>
                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab('academia')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <span>Ver todos los cursos</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeTrack.keyCertifications.map(cert => (
                  <div 
                    key={cert.name}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-950/80 text-blue-300 border border-blue-800/40 inline-block">
                        {cert.type}
                      </span>
                      <h4 className="text-xs font-bold text-white leading-snug">
                        {cert.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {cert.issuer}
                      </p>
                    </div>

                    <a
                      href={cert.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-[11px] font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 pt-1"
                    >
                      <span>Más información</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Salary Calculator & Live Hiring Roles (Takes 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Interactive Salary Estimator Widget */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/50 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-['Outfit']">
                  Calculadora de Renta IA
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Chile 2026</span>
            </div>

            <div className="space-y-3">
              {/* Select Track */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Especialidad:
                </label>
                <select
                  id="calc-track-select"
                  value={calcTrackId}
                  onChange={(e) => setCalcTrackId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {CAREER_TRACKS.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>

              {/* Select Seniority Level */}
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Nivel de Experiencia:
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {['Junior (0-2)', 'Mid (2-4)', 'Senior (4-7)', 'Lead (7+)'].map((lvl, index) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setCalcLevelIndex(index)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer text-center ${
                        calcLevelIndex === index
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Multipliers & Premiums Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Factores & Bonificaciones:
                </span>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:bg-slate-950">
                  <span className="flex items-center gap-1.5">
                    <span>Inglés fluido C1/C2 (+15%)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={calcEnglishFluent}
                    onChange={(e) => setCalcEnglishFluent(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:bg-slate-950">
                  <span className="flex items-center gap-1.5">
                    <span>Remoto para USA / Global (+45%)</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={calcRemoteUsCompany}
                    onChange={(e) => setCalcRemoteUsCompany(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </label>

                {calcTrackId === 'cv-industrial' && (
                  <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:bg-slate-950">
                    <span className="flex items-center gap-1.5">
                      <span>Faena Minera / Norte (+25%)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={calcMiningBonus}
                      onChange={(e) => setCalcMiningBonus(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </label>
                )}
              </div>

              {/* Computed Benchmark Display */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-1 shadow-inner">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
                  Rango Salarial Estimado:
                </span>
                <div className="text-xl font-extrabold text-white font-['Outfit']">
                  {calculatedSalary.monthlyCLP}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {calculatedSalary.annualUSD}
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-800/30 text-[10px] text-emerald-300 text-left">
                  💡 <strong>Beneficio Ley I+D Corfo:</strong> {calculatedSalary.corfoTaxBenefit}.
                </div>
              </div>
            </div>
          </div>

          {/* Live Open Roles in Chilean Organizations */}
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Vacantes Activas en el Ecosistema</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {filteredRoles.length} oportunidades en startups y centros I+D
                </span>
              </div>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={searchRoleQuery}
                onChange={(e) => setSearchRoleQuery(e.target.value)}
                placeholder="Buscar vacante o empresa..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
              />
            </div>

            {/* List of Roles */}
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 no-scrollbar">
              {filteredRoles.slice(0, 7).map((item, idx) => (
                <div
                  key={`${item.orgName}-${item.roleTitle}-${idx}`}
                  className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">
                        {item.roleTitle}
                      </h4>
                      <button
                        onClick={() => onSelectCompany && onSelectCompany(item.orgName)}
                        className="text-[11px] text-blue-400 hover:underline font-medium cursor-pointer"
                      >
                        {item.orgName} • {item.city}
                      </button>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-blue-950 text-blue-300 border border-blue-800/40">
                      {item.sector}
                    </span>
                  </div>

                  {/* Tools preview */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tools.slice(0, 3).map(tool => (
                      <span key={tool} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
