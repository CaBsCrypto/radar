import React, { useState } from 'react';
import { TechTool, Organization } from '../types';
import { 
  Cpu, 
  Search, 
  ExternalLink, 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  BookOpen, 
  Briefcase,
  Layers
} from 'lucide-react';

interface TechStackRadarProps {
  tools: TechTool[];
  organizations: Organization[];
  onSelectCompany: (companyName: string) => void;
  onNavigateToCourses: () => void;
  highlightedToolId?: string | null;
}

export const TechStackRadar: React.FC<TechStackRadarProps> = ({
  tools,
  organizations,
  onSelectCompany,
  onNavigateToCourses,
  highlightedToolId
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToolModal, setSelectedToolModal] = useState<TechTool | null>(null);

  React.useEffect(() => {
    if (highlightedToolId) {
      const found = tools.find(t => t.id === highlightedToolId);
      if (found) {
        setSelectedToolModal(found);
        setSelectedCategory('Todos');
      }
    }
  }, [highlightedToolId, tools]);

  const categories = [
    'Todos',
    'Modelos & LLMs',
    'Orquestación & Frameworks',
    'Visión & Audio',
    'Vector DBs & Datos',
    'Infraestructura & MLOps'
  ];

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === 'Todos' || tool.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.companiesUsing.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                Radar de Tecnologías para Quienes Buscan Trabajo
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Mapeo de herramientas más demandadas en Chile
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit'] mt-1.5">
              ¿Qué Herramientas de Inteligencia Artificial usan las Empresas en Chile?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Si buscas trabajo o quieres capacitarte, aquí puedes ver qué stacks tecnológicos adoptan las startups y grandes empresas chilenas, qué modelos eligen y cómo prepararte.
            </p>
          </div>

          <button
            onClick={onNavigateToCourses}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start md:self-auto active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Ver Cursos & Tutoriales</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar text-xs">
            <span className="text-slate-500 dark:text-slate-400 mr-1 whitespace-nowrap font-medium">Categoría:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer text-xs ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar herramienta o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map(tool => {
          return (
            <div
              key={tool.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                      {tool.name}
                    </h3>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {tool.category}
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 flex-shrink-0">
                    {tool.adoptionPercentage}% adopción
                  </span>
                </div>

                {/* Adoption Bar */}
                <div className="mt-3">
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700/80">
                    <div 
                      className="h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all"
                      style={{ width: `${tool.adoptionPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                    <span>Presente en {tool.usedByCount} empresas analizadas</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">Alta Demanda</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                  {tool.description}
                </p>

                {/* Companies Using in Chile */}
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    Empresas en Chile que lo utilizan:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {tool.companiesUsing.map(companyName => (
                      <span
                        key={companyName}
                        onClick={() => onSelectCompany(companyName)}
                        className="px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-[10px] border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors font-medium"
                      >
                        {companyName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action link */}
              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <a
                  href={tool.docUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <span>Documentación Oficial</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={onNavigateToCourses}
                  className="text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  Aprender este Stack
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide for Job Seekers */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 text-xs font-semibold mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Guía de Empleabilidad Tech en Chile</span>
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
            ¿Cuáles son los perfiles y stacks más cotizados hoy en Chile?
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            Las startups chilenas valoran especialmente la capacidad de construir <strong>agentes funcionales</strong> y conectar modelos con bases de datos vectoriales privadas sin exponer credenciales.
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">1. Full-Stack + GenAI</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">TypeScript, React, Node.js + Gemini API o Claude con Function Calling y Streaming.</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">2. RAG & Data Engineer</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">Python, PostgreSQL con pgvector, LangChain o LlamaIndex para bases de conocimiento corporativas.</p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/70 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">3. Edge Computer Vision</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">PyTorch, YOLOv8 y OpenCV en hardware NVIDIA Jetson para minería, agro y salmones.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
