import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Organization, EcosystemEvent, TechTool } from '../types';
import { 
  Search, 
  X, 
  Building2, 
  Calendar, 
  Cpu, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  MapPin, 
  Briefcase,
  ExternalLink,
  ChevronRight,
  Command
} from 'lucide-react';

export interface GlobalSearchProps {
  organizations: Organization[];
  events: EcosystemEvent[];
  tools: TechTool[];
  onSelectCompany: (org: Organization) => void;
  onSelectEvent: (event: EcosystemEvent) => void;
  onSelectTool: (tool: TechTool) => void;
  className?: string;
}

type FilterCategory = 'all' | 'companies' | 'events' | 'tools';

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  organizations,
  events,
  tools,
  onSelectCompany,
  onSelectEvent,
  onSelectTool,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global hotkey: Cmd+K or Ctrl+K or "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setIsOpen(true);
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered results
  const results = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return {
        matchedCompanies: [],
        matchedEvents: [],
        matchedTools: [],
        total: 0
      };
    }

    const matchedCompanies = organizations.filter(org => {
      return (
        org.name.toLowerCase().includes(cleanQuery) ||
        org.tagline.toLowerCase().includes(cleanQuery) ||
        org.aiUseCase.toLowerCase().includes(cleanQuery) ||
        org.sector.toLowerCase().includes(cleanQuery) ||
        org.city.toLowerCase().includes(cleanQuery) ||
        org.toolsUsed.some(t => t.toLowerCase().includes(cleanQuery)) ||
        (org.openRoles && org.openRoles.some(r => r.toLowerCase().includes(cleanQuery)))
      );
    });

    const matchedEvents = events.filter(evt => {
      return (
        evt.title.toLowerCase().includes(cleanQuery) ||
        evt.organizer.toLowerCase().includes(cleanQuery) ||
        evt.type.toLowerCase().includes(cleanQuery) ||
        evt.locationName.toLowerCase().includes(cleanQuery) ||
        evt.tags.some(tag => tag.toLowerCase().includes(cleanQuery))
      );
    });

    const matchedTools = tools.filter(tool => {
      return (
        tool.name.toLowerCase().includes(cleanQuery) ||
        tool.description.toLowerCase().includes(cleanQuery) ||
        tool.category.toLowerCase().includes(cleanQuery) ||
        tool.companiesUsing.some(c => c.toLowerCase().includes(cleanQuery))
      );
    });

    return {
      matchedCompanies,
      matchedEvents,
      matchedTools,
      total: matchedCompanies.length + matchedEvents.length + matchedTools.length
    };
  }, [query, organizations, events, tools]);

  // Flattened items for keyboard navigation based on activeCategory
  const flatItems = useMemo(() => {
    const list: Array<{
      type: 'company' | 'event' | 'tool';
      data: Organization | EcosystemEvent | TechTool;
    }> = [];

    if (activeCategory === 'all' || activeCategory === 'companies') {
      results.matchedCompanies.forEach(c => list.push({ type: 'company', data: c }));
    }
    if (activeCategory === 'all' || activeCategory === 'events') {
      results.matchedEvents.forEach(e => list.push({ type: 'event', data: e }));
    }
    if (activeCategory === 'all' || activeCategory === 'tools') {
      results.matchedTools.forEach(t => list.push({ type: 'tool', data: t }));
    }

    return list;
  }, [results, activeCategory]);

  // Reset index when query or category changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeCategory]);

  // Keyboard navigation within dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flatItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : flatItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flatItems.length > 0 && flatItems[selectedIndex]) {
        handleSelectItem(flatItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectItem = (item: { type: 'company' | 'event' | 'tool'; data: any }) => {
    if (item.type === 'company') {
      onSelectCompany(item.data as Organization);
    } else if (item.type === 'event') {
      onSelectEvent(item.data as EcosystemEvent);
    } else if (item.type === 'tool') {
      onSelectTool(item.data as TechTool);
    }
    setIsOpen(false);
    setQuery('');
  };

  const trendingSearches = [
    { label: 'Gemini API', type: 'tool' },
    { label: 'NotCo', type: 'company' },
    { label: 'Hackathon', type: 'event' },
    { label: 'PyTorch', type: 'tool' },
    { label: 'Fintoc', type: 'company' },
    { label: 'Minería', type: 'company' }
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Bar Input */}
      <div 
        onClick={() => {
          setIsOpen(true);
          inputRef.current?.focus();
        }}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-text shadow-xs ${
          isOpen
            ? 'bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 text-slate-900 dark:text-white'
            : 'bg-slate-50 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
        }`}
      >
        <Search className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${isOpen ? 'text-blue-500' : 'text-slate-400'}`} />
        
        <input
          ref={inputRef}
          type="text"
          id="global-search-input"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar empresas, eventos, stack... (⌘K)"
          className="w-full bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          autoComplete="off"
        />

        {query ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setQuery('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1">
            <kbd className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-200/70 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-xs">
              ⌘K
            </kbd>
          </div>
        )}
      </div>

      {/* Dropdown Results / Command Palette */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 right-0 sm:right-auto sm:w-[540px] md:w-[620px] top-full mt-2 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Categories Pill Filters (Only shown when query exists or matches exist) */}
          {query.trim() !== '' && (
            <div className="p-2.5 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>Todos</span>
                  <span className="text-[10px] px-1 py-0.2 rounded-full bg-black/30 text-slate-200">
                    {results.total}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('companies')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === 'companies'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-3 h-3 text-blue-400" />
                  <span>Empresas</span>
                  <span className="text-[10px] px-1 py-0.2 rounded-full bg-black/30 text-slate-200">
                    {results.matchedCompanies.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('events')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === 'events'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Calendar className="w-3 h-3 text-amber-400" />
                  <span>Eventos</span>
                  <span className="text-[10px] px-1 py-0.2 rounded-full bg-black/30 text-slate-200">
                    {results.matchedEvents.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveCategory('tools')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeCategory === 'tools'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Cpu className="w-3 h-3 text-indigo-400" />
                  <span>Herramientas</span>
                  <span className="text-[10px] px-1 py-0.2 rounded-full bg-black/30 text-slate-200">
                    {results.matchedTools.length}
                  </span>
                </button>
              </div>

              <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                Usa ↑↓ para navegar, Enter para abrir
              </span>
            </div>
          )}

          {/* Results List or Suggestions */}
          <div className="max-h-[380px] overflow-y-auto p-2 space-y-1">
            {/* If query is empty: show trending/quick searches */}
            {query.trim() === '' ? (
              <div className="p-3 space-y-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Búsquedas Frecuentes & Tendencias en Chile:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((item, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setQuery(item.label);
                        inputRef.current?.focus();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/40 border border-slate-700/60 text-xs text-slate-200 hover:text-blue-300 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {item.type === 'company' && <Building2 className="w-3 h-3 text-blue-400" />}
                      {item.type === 'event' && <Calendar className="w-3 h-3 text-amber-400" />}
                      {item.type === 'tool' && <Cpu className="w-3 h-3 text-indigo-400" />}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Encuentra rápidamente casos de uso, organizadores de hackathons y tecnologías</span>
                  <span className="font-mono">ESC para cerrar</span>
                </div>
              </div>
            ) : flatItems.length === 0 ? (
              /* Empty state */
              <div className="py-8 text-center space-y-2">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  No se encontraron resultados para &ldquo;{query}&rdquo;
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Prueba buscando por nombre de empresa (ej. NotCo, Zippedi), sector (Minería, Fintech) o tecnología (Gemini API, PyTorch).
                </p>
              </div>
            ) : (
              /* Display items */
              flatItems.map((item, index) => {
                const isSelected = selectedIndex === index;

                if (item.type === 'company') {
                  const org = item.data as Organization;
                  return (
                    <div
                      key={`comp-${org.id}`}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-3 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-600/15 border border-blue-500/40 shadow-sm'
                          : 'hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white font-['Outfit'] truncate">
                              {org.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {org.type}
                            </span>
                            <span className="text-[10px] text-blue-400 font-medium">
                              {org.sector}
                            </span>
                            {org.hiringStatus && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                                Contratando
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 truncate mt-0.5">
                            {org.tagline}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />
                              {org.city}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400 truncate max-w-xs">
                              Stack: {org.toolsUsed.slice(0, 3).join(', ')}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0 self-center">
                        <span className="hidden sm:inline">Ver Empresa</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                }

                if (item.type === 'event') {
                  const evt = item.data as EcosystemEvent;
                  return (
                    <div
                      key={`evt-${evt.id}`}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-3 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-amber-500/15 border border-amber-500/40 shadow-sm'
                          : 'hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white font-['Outfit'] truncate">
                              {evt.title}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                              {evt.type}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                              evt.status === 'Próximo' || evt.status === 'En Curso'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {evt.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 truncate mt-0.5">
                            Org: {evt.organizer} • {evt.dateStr}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                            <span>Sede: {evt.locationName}</span>
                            {evt.prizePool && (
                              <>
                                <span>•</span>
                                <span className="text-amber-400 font-semibold">Premio: {evt.prizePool}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0 self-center">
                        <span className="hidden sm:inline">Ver Evento</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                }

                if (item.type === 'tool') {
                  const tool = item.data as TechTool;
                  return (
                    <div
                      key={`tool-${tool.id}`}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`p-3 rounded-xl transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-blue-600/15 border border-blue-500/40 shadow-sm'
                          : 'hover:bg-slate-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-white font-['Outfit'] truncate">
                              {tool.name}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                              {tool.category}
                            </span>
                            <span className="text-[10px] text-blue-400 font-semibold">
                              {tool.adoptionPercentage}% adopción en Chile
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                            {tool.description}
                          </p>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Utilizado por: {tool.companiesUsing.slice(0, 3).join(', ')} ({tool.usedByCount} empresas)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-slate-400 flex-shrink-0 self-center">
                        <span className="hidden sm:inline">Ver Herramienta</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                }

                return null;
              })
            )}
          </div>

          {/* Footer note */}
          {query.trim() !== '' && flatItems.length > 0 && (
            <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Mostrando {flatItems.length} coincidencias</span>
              <span className="text-slate-500">Selecciona para ver detalles completos</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
