import React, { useState, useMemo } from 'react';
import { Organization, ChileRegion, OrganizationType, Sector, TechTool } from '../types';
import { 
  Building2, 
  Search, 
  MapPin, 
  ExternalLink, 
  Briefcase, 
  Cpu, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  Mail, 
  X,
  Plus,
  SlidersHorizontal
} from 'lucide-react';
import { TECH_TOOLS } from '../data/mockData';
import { TechToolFilterSidebar } from './TechToolFilterSidebar';

interface CompanyDirectoryProps {
  organizations: Organization[];
  regions: ChileRegion[];
  selectedRegionFilter: string | null;
  onClearRegionFilter: () => void;
  onOpenAddModal: () => void;
  onSelectToolFilter?: (toolName: string) => void;
  highlightedCompanyId?: string | null;
  onClearHighlightedCompany?: () => void;
  techToolsList?: TechTool[];
}

export const CompanyDirectory: React.FC<CompanyDirectoryProps> = ({
  organizations,
  regions,
  selectedRegionFilter,
  onClearRegionFilter,
  onOpenAddModal,
  onSelectToolFilter,
  highlightedCompanyId,
  onClearHighlightedCompany,
  techToolsList = TECH_TOOLS
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<OrganizationType | 'Todos'>('Todos');
  const [selectedSector, setSelectedSector] = useState<Sector | 'Todos'>('Todos');
  const [regionFilter, setRegionFilter] = useState<string>(selectedRegionFilter || 'all');
  const [onlyHiring, setOnlyHiring] = useState(false);
  const [activeCompanyModal, setActiveCompanyModal] = useState<Organization | null>(null);

  // Selected tech tools for filtering (extracted from TECH_TOOLS)
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isMobileToolDrawerOpen, setIsMobileToolDrawerOpen] = useState(false);

  // Toggle single tool in selection
  const handleToggleTool = (toolName: string) => {
    setSelectedTools(prev => 
      prev.includes(toolName)
        ? prev.filter(t => t !== toolName)
        : [...prev, toolName]
    );
  };

  const handleClearTools = () => {
    setSelectedTools([]);
  };

  // Sync incoming prop if it changes
  React.useEffect(() => {
    if (selectedRegionFilter) {
      setRegionFilter(selectedRegionFilter);
    }
  }, [selectedRegionFilter]);

  // Ensure modal starts from the top
  React.useEffect(() => {
    if (activeCompanyModal) {
      const modalEl = document.getElementById('company-detail-modal-container');
      if (modalEl) {
        modalEl.scrollTop = 0;
      }
    }
  }, [activeCompanyModal]);

  // Handle highlighted company from global search
  React.useEffect(() => {
    if (highlightedCompanyId) {
      const found = organizations.find(o => o.id === highlightedCompanyId);
      if (found) {
        setActiveCompanyModal(found);
        setRegionFilter('all');
        setSelectedType('Todos');
        setSelectedSector('Todos');
        setOnlyHiring(false);
        setSelectedTools([]);
      }
    }
  }, [highlightedCompanyId, organizations]);

  const organizationTypes: (OrganizationType | 'Todos')[] = [
    'Todos',
    'Startup',
    'Scaleup',
    'PyME',
    'Gran Empresa',
    'Centro I+D'
  ];

  const sectors: (Sector | 'Todos')[] = [
    'Todos',
    'Minería & Energía',
    'Fintech & Banca',
    'Biotech & Agro',
    'Retail & E-commerce',
    'Salud & MedTech',
    'Logística & Transporte',
    'GovTech & Legal',
    'Clima & Sustentabilidad'
  ];

  // Calculate tool usage count across all organizations
  const toolUsageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    techToolsList.forEach(t => {
      counts[t.name] = 0;
    });

    organizations.forEach(org => {
      org.toolsUsed.forEach(toolStr => {
        // Direct match or partial match with TECH_TOOLS names
        techToolsList.forEach(tech => {
          const techLower = tech.name.toLowerCase();
          const toolLower = toolStr.toLowerCase();
          if (
            toolLower.includes(techLower) ||
            techLower.includes(toolLower) ||
            (techLower.includes('gemini') && toolLower.includes('gemini')) ||
            (techLower.includes('pytorch') && toolLower.includes('pytorch')) ||
            (techLower.includes('langchain') && (toolLower.includes('langchain') || toolLower.includes('llamaindex'))) ||
            (techLower.includes('yolo') && (toolLower.includes('yolo') || toolLower.includes('opencv'))) ||
            (techLower.includes('pgvector') && (toolLower.includes('postgres') || toolLower.includes('vector') || toolLower.includes('supabase'))) ||
            (techLower.includes('vllm') && (toolLower.includes('vllm') || toolLower.includes('ollama') || toolLower.includes('llama'))) ||
            (techLower.includes('hugging') && (toolLower.includes('hugging') || toolLower.includes('transformers'))) ||
            (techLower.includes('docker') && (toolLower.includes('docker') || toolLower.includes('kubernetes') || toolLower.includes('mlops')))
          ) {
            counts[tech.name] = (counts[tech.name] || 0) + 1;
          }
        });
      });
    });

    return counts;
  }, [organizations, techToolsList]);

  // Filter organizations by all criteria including TECH_TOOLS selection
  const filteredOrganizations = useMemo(() => {
    return organizations.filter(org => {
      // Type match
      if (selectedType !== 'Todos' && org.type !== selectedType) return false;

      // Sector match
      if (selectedSector !== 'Todos' && org.sector !== selectedSector) return false;

      // Region match
      if (regionFilter !== 'all' && org.regionId !== regionFilter) return false;

      // Hiring match
      if (onlyHiring && !org.hiringStatus) return false;

      // Tech Tools filter (all selected tools or any matching selected tool)
      if (selectedTools.length > 0) {
        const orgToolsLower = org.toolsUsed.map(t => t.toLowerCase());
        // Require that the organization uses at least one of the selected tools
        const matchesAnySelectedTool = selectedTools.some(selectedToolName => {
          const selLower = selectedToolName.toLowerCase();
          return orgToolsLower.some(toolLower => {
            if (toolLower.includes(selLower) || selLower.includes(toolLower)) return true;
            // Handle common synonyms/tool variations
            if (selLower.includes('gemini') && toolLower.includes('gemini')) return true;
            if (selLower.includes('pytorch') && toolLower.includes('pytorch')) return true;
            if (selLower.includes('langchain') && (toolLower.includes('langchain') || toolLower.includes('llamaindex'))) return true;
            if (selLower.includes('yolo') && (toolLower.includes('yolo') || toolLower.includes('opencv'))) return true;
            if (selLower.includes('pgvector') && (toolLower.includes('postgres') || toolLower.includes('vector') || toolLower.includes('supabase'))) return true;
            if (selLower.includes('vllm') && (toolLower.includes('vllm') || toolLower.includes('ollama') || toolLower.includes('llama'))) return true;
            if (selLower.includes('hugging') && (toolLower.includes('hugging') || toolLower.includes('transformers'))) return true;
            if (selLower.includes('docker') && (toolLower.includes('docker') || toolLower.includes('kubernetes') || toolLower.includes('mlops'))) return true;
            return false;
          });
        });

        if (!matchesAnySelectedTool) {
          return false;
        }
      }

      // Search query match
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = org.name.toLowerCase().includes(q);
        const matchesTagline = org.tagline.toLowerCase().includes(q);
        const matchesUseCase = org.aiUseCase.toLowerCase().includes(q);
        const matchesTools = org.toolsUsed.some(t => t.toLowerCase().includes(q));
        const matchesCity = org.city.toLowerCase().includes(q);
        if (!matchesName && !matchesTagline && !matchesUseCase && !matchesTools && !matchesCity) {
          return false;
        }
      }

      return true;
    });
  }, [organizations, selectedType, selectedSector, regionFilter, onlyHiring, searchQuery, selectedTools]);

  const regionNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    regions.forEach(r => {
      map[r.id] = r.shortName;
    });
    return map;
  }, [regions]);

  const getTypeBadgeClass = (type: OrganizationType) => {
    switch (type) {
      case 'Startup':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30';
      case 'Scaleup':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30';
      case 'PyME':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
      case 'Gran Empresa':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30';
      case 'Centro I+D':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/15 dark:text-purple-400 dark:border-purple-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                Directorio Tecnológico de Chile
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Startups, PyMEs innovadoras, Corporativos y Centros de I+D
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-['Outfit'] mt-1">
              Empresas que Construyen con Inteligencia Artificial
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Descubre qué herramientas utilizan, cómo aplican la IA en sus modelos de negocio y qué vacantes laborales tienen disponibles.
            </p>
          </div>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 shadow-xs transition-all cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar mi Empresa</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800/80 space-y-4">
          {/* Top Filter Row: Search & Region & Hiring */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, herramienta (ej. Gemini, PyTorch) o caso de uso..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Region Selector */}
            <div className="md:col-span-4 flex items-center gap-1.5">
              <select
                value={regionFilter}
                onChange={(e) => {
                  setRegionFilter(e.target.value);
                  if (e.target.value === 'all') onClearRegionFilter();
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer"
              >
                <option value="all">📍 Todas las Regiones (16)</option>
                {regions.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.romanNumeral} - {r.name} ({r.startupsCount})
                  </option>
                ))}
              </select>
              {regionFilter !== 'all' && (
                <button
                  onClick={() => {
                    setRegionFilter('all');
                    onClearRegionFilter();
                  }}
                  className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs cursor-pointer"
                  title="Limpiar filtro de región"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Hiring Toggle */}
            <div className="md:col-span-3 flex items-center justify-end">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 w-full justify-center md:justify-start">
                <input
                  type="checkbox"
                  checked={onlyHiring}
                  onChange={(e) => setOnlyHiring(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  Solo con Vacantes Abiertas
                </span>
              </label>
            </div>
          </div>

          {/* Type Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-slate-500 dark:text-slate-400 mr-1 whitespace-nowrap font-medium">Tipo:</span>
            {organizationTypes.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedType === t
                    ? 'bg-blue-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Sector Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-slate-500 dark:text-slate-400 mr-1 whitespace-nowrap font-medium">Sector:</span>
            {sectors.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSector(s)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-colors cursor-pointer font-medium ${
                  selectedSector === s
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count & Quick Reset & Mobile Filter Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-3">
          <span>Mostrando <strong className="text-slate-900 dark:text-slate-200">{filteredOrganizations.length}</strong> de {organizations.length} entidades registradas</span>

          {/* Mobile button to open tech tools sidebar */}
          <button
            onClick={() => setIsMobileToolDrawerOpen(true)}
            className="lg:hidden px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer font-medium"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Herramientas Tech</span>
            {selectedTools.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {selectedTools.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Active tool tags preview / quick dismiss */}
          {selectedTools.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto max-w-sm sm:max-w-md no-scrollbar">
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Filtro Tech:
              </span>
              {selectedTools.map(toolName => (
                <button
                  key={toolName}
                  onClick={() => handleToggleTool(toolName)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors cursor-pointer"
                  title="Eliminar este filtro"
                >
                  <span className="truncate max-w-[100px]">{toolName}</span>
                  <X className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}

          {(selectedType !== 'Todos' || selectedSector !== 'Todos' || regionFilter !== 'all' || onlyHiring || searchQuery !== '' || selectedTools.length > 0) && (
            <button
              onClick={() => {
                setSelectedType('Todos');
                setSelectedSector('Todos');
                setRegionFilter('all');
                setOnlyHiring(false);
                setSearchQuery('');
                setSelectedTools([]);
                onClearRegionFilter();
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline cursor-pointer whitespace-nowrap font-medium"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Main Layout: Sidebar of TECH_TOOLS + Companies Grid */}
      <div className="flex items-start gap-6">
        {/* Persistent Tech Tool Filter Sidebar for Desktop & Drawer for Mobile */}
        <TechToolFilterSidebar
          techTools={techToolsList}
          selectedTools={selectedTools}
          onToggleTool={handleToggleTool}
          onClearTools={handleClearTools}
          toolUsageCounts={toolUsageCounts}
          isMobileDrawerOpen={isMobileToolDrawerOpen}
          onCloseMobileDrawer={() => setIsMobileToolDrawerOpen(false)}
        />

        {/* Companies Grid Container */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredOrganizations.map((org) => {
              const regionLabel = regionNameMap[org.regionId] || org.city;
              const typeBadge = getTypeBadgeClass(org.type);

              return (
                <div
                  key={org.id}
                  id={`company-card-${org.id}`}
                  onClick={() => setActiveCompanyModal(org)}
                  className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500/50 rounded-2xl p-5 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Title + Type Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors truncate font-['Outfit']">
                          {org.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                          <span>{org.city}, {regionLabel}</span>
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${typeBadge}`}>
                        {org.type}
                      </span>
                    </div>

                    {/* Tagline */}
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 line-clamp-2 leading-relaxed">
                      {org.tagline}
                    </p>

                    {/* Explicación de uso de IA */}
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider mb-1">
                        <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                        Cómo aplican la IA:
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {org.aiUseCase}
                      </p>
                    </div>

                    {/* Herramientas que utilizan */}
                    <div className="mt-3.5">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                        <Cpu className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        Herramientas & Tech Stack:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {org.toolsUsed.map((tool) => {
                          const isHighlightedTool = selectedTools.some(
                            st => st.toLowerCase() === tool.toLowerCase() ||
                                  tool.toLowerCase().includes(st.toLowerCase()) ||
                                  st.toLowerCase().includes(tool.toLowerCase())
                          );

                          return (
                            <span
                              key={tool}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTool(tool);
                                if (onSelectToolFilter) onSelectToolFilter(tool);
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                                isHighlightedTool
                                  ? 'bg-blue-600 text-white shadow-xs font-semibold'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white'
                              }`}
                            >
                              {tool}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Hiring status & Action */}
                  <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      {org.hiringStatus ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {org.openRoles ? `${org.openRoles.length} vacantes` : 'Contratando'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">Sin vacantes activas</span>
                      )}
                    </div>

                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Ver Ficha
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredOrganizations.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900 dark:text-white">No se encontraron empresas con los filtros aplicados</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Prueba deseleccionando alguna herramienta en la barra lateral, ajustando la búsqueda o limpiando los filtros.
              </p>
              {selectedTools.length > 0 && (
                <button
                  onClick={handleClearTools}
                  className="mt-4 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Limpiar filtros de herramientas ({selectedTools.length})
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Deep Dive into Organization */}
      {activeCompanyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            id="company-detail-modal-container" 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative"
          >
            <button
              onClick={() => setActiveCompanyModal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTypeBadgeClass(activeCompanyModal.type)}`}>
                  {activeCompanyModal.type}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {activeCompanyModal.sector}
                </span>
                {activeCompanyModal.fundingStage && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50">
                    {activeCompanyModal.fundingStage}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white font-['Outfit']">
                {activeCompanyModal.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{activeCompanyModal.city}, {regionNameMap[activeCompanyModal.regionId] || ''}</span>
                <span>• Fundada en {activeCompanyModal.foundedYear}</span>
              </div>
            </div>

            {/* Description & AI Use Case */}
            <div className="mt-6 space-y-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-400 mb-1">Propuesta de Valor:</h4>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {activeCompanyModal.tagline}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                  Implementación & Caso Real de Inteligencia Artificial:
                </h4>
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed bg-blue-50/70 dark:bg-blue-950/20 p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40">
                  {activeCompanyModal.aiUseCase}
                </p>
              </div>

              {/* Tools list */}
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  Herramientas y Tecnologías que Emplean:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeCompanyModal.toolsUsed.map(tool => (
                    <span key={tool} className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Open Roles & Hiring */}
              {activeCompanyModal.hiringStatus && activeCompanyModal.openRoles && activeCompanyModal.openRoles.length > 0 && (
                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-xs sm:text-sm flex items-center gap-1.5 mb-2">
                    <Briefcase className="w-4 h-4" />
                    Vacantes de Empleo Disponibles:
                  </h4>
                  <ul className="space-y-1.5">
                    {activeCompanyModal.openRoles.map((role, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>{role}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {activeCompanyModal.contactEmail && (
                <a
                  href={`mailto:${activeCompanyModal.contactEmail}`}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                >
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{activeCompanyModal.contactEmail}</span>
                </a>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <a
                  href={activeCompanyModal.website}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Visitar Sitio Web</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
