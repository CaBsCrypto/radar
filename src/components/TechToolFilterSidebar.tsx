import React, { useState } from 'react';
import { TechTool } from '../types';
import { Cpu, Search, Check, X, Layers, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface TechToolFilterSidebarProps {
  techTools: TechTool[];
  selectedTools: string[];
  onToggleTool: (toolName: string) => void;
  onClearTools: () => void;
  toolUsageCounts: Record<string, number>;
  className?: string;
  isMobileDrawerOpen?: boolean;
  onCloseMobileDrawer?: () => void;
}

export const TechToolFilterSidebar: React.FC<TechToolFilterSidebarProps> = ({
  techTools,
  selectedTools,
  onToggleTool,
  onClearTools,
  toolUsageCounts,
  className = '',
  isMobileDrawerOpen = false,
  onCloseMobileDrawer
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Categories present in TECH_TOOLS
  const categories = [
    'Todos',
    'Modelos & LLMs',
    'Orquestación & Frameworks',
    'Visión & Audio',
    'Vector DBs & Datos',
    'Infraestructura & MLOps'
  ];

  // Helper to toggle category collapse
  const toggleCategoryCollapse = (cat: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Group tools by category
  const groupedTools = React.useMemo(() => {
    const map: Record<string, TechTool[]> = {};
    techTools.forEach(tool => {
      const cat = tool.category || 'Otros';
      if (!map[cat]) map[cat] = [];
      map[cat].push(tool);
    });
    return map;
  }, [techTools]);

  // Filter tools based on search and category filter
  const filteredToolsByCategory = React.useMemo(() => {
    const result: Record<string, TechTool[]> = {};
    const q = searchQuery.toLowerCase().trim();

    Object.entries(groupedTools).forEach(([cat, tools]) => {
      if (selectedCategory !== 'Todos' && cat !== selectedCategory) {
        return;
      }
      const matching = tools.filter(t => {
        if (!q) return true;
        return (
          t.name.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
        );
      });

      if (matching.length > 0) {
        result[cat] = matching;
      }
    });

    return result;
  }, [groupedTools, selectedCategory, searchQuery]);

  const totalMatchingTools = Object.values(filteredToolsByCategory).reduce(
    (acc, list) => acc + list.length,
    0
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] flex items-center gap-1.5">
              Stack Tecnológico
              {selectedTools.length > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-600 text-white">
                  {selectedTools.length}
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Filtrar por TECH_TOOLS</p>
          </div>
        </div>

        {selectedTools.length > 0 && (
          <button
            onClick={onClearTools}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer font-medium"
            title="Limpiar filtros de herramientas"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Search within tools */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar herramienta (ej. Gemini, PyTorch)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Category Pill Selector */}
        <div className="mt-2.5 flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-0.5 rounded-md whitespace-nowrap transition-colors cursor-pointer font-medium ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800/80'
              }`}
            >
              {cat === 'Todos' ? 'Todas' : cat.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Tools List by Category */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5 custom-scrollbar">
        {totalMatchingTools === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            <Layers className="w-6 h-6 mx-auto mb-2 opacity-50" />
            <p>No se encontraron herramientas con "{searchQuery}"</p>
          </div>
        ) : (
          Object.entries(filteredToolsByCategory).map(([category, tools]) => {
            const isCollapsed = !!collapsedCategories[category];
            const activeInCat = tools.filter(t => selectedTools.includes(t.name)).length;

            return (
              <div key={category} className="space-y-1.5">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategoryCollapse(category)}
                  className="w-full flex items-center justify-between text-left py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer group"
                >
                  <span className="flex items-center gap-1.5 truncate text-[11px] font-bold tracking-wide uppercase text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">
                    <Sparkles className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                    {category}
                    {activeInCat > 0 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">
                        {activeInCat}
                      </span>
                    )}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  ) : (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  )}
                </button>

                {/* Tools Items */}
                {!isCollapsed && (
                  <div className="space-y-1 pl-1">
                    {tools.map(tool => {
                      const isSelected = selectedTools.includes(tool.name);
                      const orgCount = toolUsageCounts[tool.name] || 0;

                      return (
                        <div
                          key={tool.id}
                          id={`tool-filter-${tool.id}`}
                          onClick={() => onToggleTool(tool.name)}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer select-none ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-600/20 border border-blue-200 dark:border-blue-500/50 text-blue-900 dark:text-white font-medium shadow-xs'
                              : 'bg-slate-50/80 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            {/* Checkbox circle */}
                            <div
                              className={`w-4 h-4 rounded-md flex items-center justify-center flex-shrink-0 transition-colors border ${
                                isSelected
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 group-hover:border-slate-400 dark:group-hover:border-slate-500'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[2.5]" />}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold leading-tight">
                                {tool.name}
                              </p>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                                {tool.adoptionPercentage}% adopción país
                              </span>
                            </div>
                          </div>

                          {/* Badge with count of registered organizations */}
                          <span
                            className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                              isSelected
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60'
                            }`}
                            title={`${orgCount} empresas registradas usan esta herramienta`}
                          >
                            {orgCount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-between">
          <span>{techTools.length} herramientas extraídas</span>
          {selectedTools.length > 0 && (
            <span className="text-blue-600 dark:text-blue-400 font-semibold">{selectedTools.length} activas</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Rendered inside the grid) */}
      <aside
        className={`hidden lg:block w-72 flex-shrink-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden self-start sticky top-20 shadow-xs ${className}`}
        style={{ maxHeight: 'calc(100vh - 6rem)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-slate-950/70 backdrop-blur-xs flex justify-end">
          <div className="w-80 max-w-full h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-300">Filtro de Herramientas IA</span>
              <button
                onClick={onCloseMobileDrawer}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {sidebarContent}
            </div>
            <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <button
                onClick={onCloseMobileDrawer}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                Ver Resultados ({totalMatchingTools} herramientas)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
