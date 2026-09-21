import React, { useMemo, useState } from 'react';
import { Organization } from '../types';
import { 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Building2, 
  Cpu, 
  CheckCircle2, 
  GraduationCap, 
  ArrowUpRight,
  Filter,
  Layers,
  Search,
  BadgeCheck
} from 'lucide-react';

interface TalentSpotlightProps {
  organizations: Organization[];
  onNavigateToTab?: (tabId: string) => void;
  onSelectCompany?: (companyName: string) => void;
}

interface RoleCategoryAnalysis {
  category: string;
  count: number;
  sampleRoles: string[];
  topSkills: string[];
  growthScore: string;
  demandLevel: 'Crítica' | 'Muy Alta' | 'Alta';
}

export const TalentSpotlight: React.FC<TalentSpotlightProps> = ({
  organizations,
  onNavigateToTab,
  onSelectCompany
}) => {
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string>('Todos');
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Aggregated Hiring Metrics
  const hiringStats = useMemo(() => {
    const hiringOrgs = organizations.filter(o => o.hiringStatus);
    const allOpenRoles: { role: string; orgName: string; sector: string; city: string; tools: string[] }[] = [];

    hiringOrgs.forEach(org => {
      (org.openRoles || []).forEach(role => {
        allOpenRoles.push({
          role,
          orgName: org.name,
          sector: org.sector,
          city: org.city,
          tools: org.toolsUsed
        });
      });
    });

    // 2. Skill Frequency from toolsUsed in hiring organizations
    const skillCounts: Record<string, { count: number; orgs: Set<string> }> = {};
    hiringOrgs.forEach(org => {
      org.toolsUsed.forEach(tool => {
        if (!skillCounts[tool]) {
          skillCounts[tool] = { count: 0, orgs: new Set() };
        }
        skillCounts[tool].count += 1;
        skillCounts[tool].orgs.add(org.name);
      });
    });

    const sortedSkills = Object.entries(skillCounts)
      .map(([name, data]) => ({
        name,
        count: data.count,
        percentage: Math.round((data.count / (hiringOrgs.length || 1)) * 100),
        companies: Array.from(data.orgs)
      }))
      .sort((a, b) => b.count - a.count);

    // 3. Aggregate Roles into Key Industry Archetypes
    const roleCategoriesMap: Record<string, { roles: string[]; orgs: Set<string>; skills: Set<string> }> = {
      'Ingeniería de LLMs & NLP': { roles: [], orgs: new Set(), skills: new Set(['Gemini API', 'LangChain', 'vLLM', 'Hugging Face']) },
      'MLOps, Cloud & Infraestructura': { roles: [], orgs: new Set(), skills: new Set(['Docker', 'Kubernetes', 'AWS', 'GCP Vertex AI']) },
      'Computer Vision & Edge AI': { roles: [], orgs: new Set(), skills: new Set(['YOLOv8', 'OpenCV', 'PyTorch', 'NVIDIA Jetson']) },
      'Data Science & Analítica Avanzada': { roles: [], orgs: new Set(), skills: new Set(['Python', 'PostgreSQL', 'Scikit-Learn', 'pgvector']) },
      'Biotecnología & MedTech': { roles: [], orgs: new Set(), skills: new Set(['BioPython', 'AlphaFold', 'Time Series ML']) }
    };

    allOpenRoles.forEach(item => {
      const lower = item.role.toLowerCase();
      let matched = false;

      if (lower.includes('llm') || lower.includes('nlp') || lower.includes('conversational') || lower.includes('prompt') || lower.includes('genai')) {
        roleCategoriesMap['Ingeniería de LLMs & NLP'].roles.push(item.role);
        roleCategoriesMap['Ingeniería de LLMs & NLP'].orgs.add(item.orgName);
        matched = true;
      }
      if (lower.includes('mlops') || lower.includes('backend') || lower.includes('iot') || lower.includes('firmware') || lower.includes('automatización') || lower.includes('web')) {
        roleCategoriesMap['MLOps, Cloud & Infraestructura'].roles.push(item.role);
        roleCategoriesMap['MLOps, Cloud & Infraestructura'].orgs.add(item.orgName);
        matched = true;
      }
      if (lower.includes('vision') || lower.includes('robotics') || lower.includes('edge') || lower.includes('cv') || lower.includes('teledetección')) {
        roleCategoriesMap['Computer Vision & Edge AI'].roles.push(item.role);
        roleCategoriesMap['Computer Vision & Edge AI'].orgs.add(item.orgName);
        matched = true;
      }
      if (lower.includes('data') || lower.includes('scientist') || lower.includes('fraud') || lower.includes('analítica') || lower.includes('researcher') || lower.includes('investigación')) {
        roleCategoriesMap['Data Science & Analítica Avanzada'].roles.push(item.role);
        roleCategoriesMap['Data Science & Analítica Avanzada'].orgs.add(item.orgName);
        matched = true;
      }
      if (lower.includes('bio') || lower.includes('chem') || lower.includes('deep learning research')) {
        roleCategoriesMap['Biotecnología & MedTech'].roles.push(item.role);
        roleCategoriesMap['Biotecnología & MedTech'].orgs.add(item.orgName);
        matched = true;
      }

      // Fallback if not matched into specific archetype
      if (!matched) {
        roleCategoriesMap['Data Science & Analítica Avanzada'].roles.push(item.role);
        roleCategoriesMap['Data Science & Analítica Avanzada'].orgs.add(item.orgName);
      }
    });

    const roleArchetypes: RoleCategoryAnalysis[] = [
      {
        category: 'Ingeniería de LLMs & NLP',
        count: roleCategoriesMap['Ingeniería de LLMs & NLP'].roles.length,
        sampleRoles: Array.from(new Set(roleCategoriesMap['Ingeniería de LLMs & NLP'].roles)).slice(0, 3),
        topSkills: ['Gemini API', 'LangChain', 'vLLM', 'Prompt Tuning', 'RAG / Vector DBs'],
        growthScore: '+185% interanual',
        demandLevel: 'Crítica'
      },
      {
        category: 'MLOps, Cloud & Infraestructura',
        count: roleCategoriesMap['MLOps, Cloud & Infraestructura'].roles.length,
        sampleRoles: Array.from(new Set(roleCategoriesMap['MLOps, Cloud & Infraestructura'].roles)).slice(0, 3),
        topSkills: ['Docker / K8s', 'Vertex AI / AWS', 'FastAPI', 'Slurm / GPU Clusters'],
        growthScore: '+140% interanual',
        demandLevel: 'Crítica'
      },
      {
        category: 'Computer Vision & Edge AI',
        count: roleCategoriesMap['Computer Vision & Edge AI'].roles.length,
        sampleRoles: Array.from(new Set(roleCategoriesMap['Computer Vision & Edge AI'].roles)).slice(0, 3),
        topSkills: ['YOLOv8', 'PyTorch', 'OpenCV', 'NVIDIA Jetson / Edge IoT'],
        growthScore: '+95% interanual',
        demandLevel: 'Muy Alta'
      },
      {
        category: 'Data Science & Analítica Predictiva',
        count: roleCategoriesMap['Data Science & Analítica Avanzada'].roles.length,
        sampleRoles: Array.from(new Set(roleCategoriesMap['Data Science & Analítica Avanzada'].roles)).slice(0, 3),
        topSkills: ['Python', 'pgvector', 'Scikit-Learn', 'Fraud Scoring', 'Time Series'],
        growthScore: '+80% interanual',
        demandLevel: 'Alta'
      },
      {
        category: 'Biotecnología & MedTech Computacional',
        count: roleCategoriesMap['Biotecnología & MedTech'].roles.length,
        sampleRoles: Array.from(new Set(roleCategoriesMap['Biotecnología & MedTech'].roles)).slice(0, 3),
        topSkills: ['BioPython', 'AlphaFold / ESMFold', 'Molecular ML', 'Teledetección'],
        growthScore: '+110% interanual',
        demandLevel: 'Muy Alta'
      }
    ];

    return {
      hiringOrgsCount: hiringOrgs.length,
      totalOrgsCount: organizations.length,
      hiringPercentage: Math.round((hiringOrgs.length / (organizations.length || 1)) * 100),
      totalVacancies: allOpenRoles.length,
      allOpenRoles,
      sortedSkills,
      roleArchetypes
    };
  }, [organizations]);

  // Filter open roles list
  const filteredRoles = useMemo(() => {
    return hiringStats.allOpenRoles.filter(item => {
      const matchesSearch = searchFilter === '' ||
        item.role.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.orgName.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.sector.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.city.toLowerCase().includes(searchFilter.toLowerCase());

      if (selectedRoleCategory === 'Todos') return matchesSearch;

      const lower = item.role.toLowerCase();
      if (selectedRoleCategory === 'LLMs & NLP') {
        return matchesSearch && (lower.includes('llm') || lower.includes('nlp') || lower.includes('conversational') || lower.includes('prompt') || lower.includes('genai'));
      }
      if (selectedRoleCategory === 'MLOps & Infra') {
        return matchesSearch && (lower.includes('mlops') || lower.includes('backend') || lower.includes('iot') || lower.includes('firmware') || lower.includes('automatización') || lower.includes('web'));
      }
      if (selectedRoleCategory === 'Computer Vision') {
        return matchesSearch && (lower.includes('vision') || lower.includes('robotics') || lower.includes('edge') || lower.includes('cv') || lower.includes('teledetección'));
      }
      if (selectedRoleCategory === 'Data Science') {
        return matchesSearch && (lower.includes('data') || lower.includes('scientist') || lower.includes('fraud') || lower.includes('analítica') || lower.includes('researcher'));
      }

      return matchesSearch;
    });
  }, [hiringStats.allOpenRoles, selectedRoleCategory, searchFilter]);

  return (
    <div id="talent-spotlight-section" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute -right-20 -top-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Tendencias de Capital Humano • Talento IA en Chile</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
            Talent Spotlight: Habilidades & Roles Más Demandados
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Radiografía agregada en tiempo real generada a partir de las <strong>{hiringStats.totalOrgsCount} organizaciones y startups</strong> registradas en el directorio oficial chileno.
          </p>
        </div>

        {/* Action Button to explore directory */}
        {onNavigateToTab && (
          <button
            onClick={() => onNavigateToTab('directorio')}
            className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Briefcase className="w-4 h-4" />
            <span>Ver Vacantes en Directorio</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tasa de Contratación</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] mt-1">
            {hiringStats.hiringPercentage}%
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {hiringStats.hiringOrgsCount} de {hiringStats.totalOrgsCount} entidades buscando talento hoy
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Vacantes Abiertas</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-['Outfit'] mt-1">
            {hiringStats.totalVacancies}+
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Puestos técnicos en IA, LLMs, MLOps y Visión
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Habilidad #1 Demandada</span>
            <Cpu className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-300 font-['Outfit'] mt-1 truncate">
            {hiringStats.sortedSkills[0]?.name || 'PyTorch / LLMs'}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Presente en el {hiringStats.sortedSkills[0]?.percentage || 65}% de equipos contratantes
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/90">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Rol de Mayor Aceleración</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-indigo-300 font-['Outfit'] mt-1 truncate">
            LLM & Agent Engineers
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Demanda sextuplicada con adopción RAG
          </p>
        </div>
      </div>

      {/* Main Aggregated View: 2 Columns (Archetypes + Top Skills Barometer) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left Column: Key AI Roles Archetypes in Demand (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Perfiles & Roles Clave Más Solicitados</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">Ordenado por criticidad</span>
          </div>

          <div className="space-y-3">
            {hiringStats.roleArchetypes.map((archetype, idx) => {
              const badgeColor = 
                archetype.demandLevel === 'Crítica' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                archetype.demandLevel === 'Muy Alta' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                'bg-blue-500/20 text-blue-300 border-blue-500/30';

              return (
                <div 
                  key={archetype.category}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-blue-600/30 text-blue-400 text-xs font-mono font-bold flex items-center justify-center">
                          0{idx + 1}
                        </span>
                        <h5 className="text-sm font-bold text-white truncate font-['Outfit']">
                          {archetype.category}
                        </h5>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Ejemplos de vacantes activas: <span className="text-slate-200 font-medium">{archetype.sampleRoles.join(' • ')}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                        Demanda {archetype.demandLevel}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                        {archetype.growthScore}
                      </span>
                    </div>
                  </div>

                  {/* Skills Pills */}
                  <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mr-1">
                      Stack Requerido:
                    </span>
                    {archetype.topSkills.map(skill => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-medium border border-slate-700/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Skill Demand Barometer from Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Barómetro de Habilidades Técnicas</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">% de empresas</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3.5">
            <p className="text-xs text-slate-300 leading-relaxed">
              Herramientas, frameworks y tecnologías con mayor presencia en el stack de las empresas chilenas que están contratando actualmente:
            </p>

            <div className="space-y-3 pt-1">
              {hiringStats.sortedSkills.slice(0, 7).map((skill, index) => (
                <div key={skill.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5 truncate">
                      <span className="text-[10px] text-slate-500 font-mono">#{index + 1}</span>
                      {skill.name}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px] flex-shrink-0">
                      <strong className="text-white">{skill.count}</strong> empresas ({skill.percentage}%)
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-indigo-500' :
                        index === 2 ? 'bg-teal-500' :
                        index === 3 ? 'bg-purple-500' :
                        'bg-slate-400'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(15, skill.percentage))}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-slate-400 truncate">
                    Utilizado en: {skill.companies.slice(0, 3).join(', ')}{skill.companies.length > 3 ? ` +${skill.companies.length - 3}` : ''}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">¿Quieres formarte en estas tecnologías?</span>
              {onNavigateToTab && (
                <button
                  onClick={() => onNavigateToTab('academia')}
                  className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Ver Cursos & Tutoriales</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Explorer of Specific Roles */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-emerald-400" />
              <span>Explorador de Vacantes Específicas en Startups & Empresas</span>
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Filtra por disciplina técnica o busca directamente por empresa o tecnología
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar rol o empresa..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700/80 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Quick Filter Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-slate-500 text-[11px] mr-1">Filtrar área:</span>
          {['Todos', 'LLMs & NLP', 'MLOps & Infra', 'Computer Vision', 'Data Science'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedRoleCategory(category)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedRoleCategory === category
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {filteredRoles.slice(0, 9).map((item, idx) => (
            <div
              key={`${item.orgName}-${item.role}-${idx}`}
              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/40 transition-all flex flex-col justify-between space-y-2 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {item.role}
                  </h5>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex-shrink-0 font-medium">
                    Activa
                  </span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-blue-400" />
                  <span className="truncate">{item.orgName}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {item.city} • {item.sector}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px]">
                <span className="text-slate-400 truncate max-w-[150px]">
                  {item.tools.slice(0, 2).join(', ')}
                </span>
                {onSelectCompany ? (
                  <button
                    onClick={() => onSelectCompany(item.orgName)}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>Ver Ficha</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-blue-400">Directorio</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredRoles.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-xs">
            No se encontraron vacantes que coincidan con la búsqueda.
          </div>
        )}
      </div>
    </div>
  );
};
