import React, { useState, useEffect } from 'react';
import { ChileRegion, Organization, EcosystemEvent, MacroZone } from '../types';
import { 
  Building2, 
  Calendar, 
  Database, 
  GraduationCap, 
  MapPin, 
  ExternalLink, 
  Layers, 
  ArrowRight,
  Search,
  Sparkles,
  Info,
  Map as MapIcon,
  List,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Flame,
  DollarSign,
  Bot,
  FileText,
  Plus
} from 'lucide-react';
import { ChileSilhouetteMap } from './ChileSilhouetteMap';

interface ChileMapProps {
  regions: ChileRegion[];
  organizations: Organization[];
  events: EcosystemEvent[];
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string | null) => void;
  onNavigateToDirectoryWithRegion: (regionId: string) => void;
  onNavigateToWebMcp?: () => void;
  onOpenAddModal?: () => void;
}

type MetricMode = 'webmcp' | 'hackathons' | 'startups' | 'universidades';
type MapViewType = 'silhouette' | 'list';

export const ChileMap: React.FC<ChileMapProps> = ({
  regions,
  organizations,
  events,
  selectedRegionId,
  onSelectRegion,
  onNavigateToDirectoryWithRegion,
  onNavigateToWebMcp,
  onOpenAddModal
}) => {
  const [metricMode, setMetricMode] = useState<MetricMode>('webmcp');
  const [mapView, setMapView] = useState<MapViewType>('silhouette');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCardStackTab, setActiveCardStackTab] = useState<'metrics' | 'startups' | 'academy'>('metrics');
  const [mobileViewMode, setMobileViewMode] = useState<'map' | 'stack'>('map');

  const selectedRegion = regions.find(r => r.id === selectedRegionId) || regions.find(r => r.id === 'metropolitana');

  // Ensure view starts from the very top when opening or switching ficha
  useEffect(() => {
    if (mobileViewMode === 'stack') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [mobileViewMode, selectedRegion?.id]);

  const handleOpenFicha = () => {
    setMobileViewMode('stack');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleBackToMap = () => {
    setMobileViewMode('map');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const filteredRegions = regions.filter(r => {
    const matchesSearch = searchQuery === '' || 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.capital.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.topSpecialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate intensity color based on metricMode (WebMCP 1º, Eventos 2º, Startups, Universidades)
  const getMetricIntensity = (r: ChileRegion) => {
    if (metricMode === 'webmcp') {
      const mcp = r.webmcpCount || 0;
      if (mcp >= 15) return 'from-purple-600 to-indigo-600 text-white shadow-sm shadow-purple-500/20';
      if (mcp >= 6) return 'from-purple-700 to-indigo-800 text-white';
      if (mcp >= 2) return 'from-purple-900/60 to-slate-800 text-purple-200';
      return 'from-slate-800 to-slate-900 text-slate-400';
    } else if (metricMode === 'hackathons') {
      if (r.hackathonsCount >= 5) return 'from-amber-600 to-orange-700 text-white';
      if (r.hackathonsCount >= 3) return 'from-amber-700/80 to-orange-800/80 text-amber-100';
      if (r.hackathonsCount >= 2) return 'from-amber-900/60 to-slate-800 text-slate-200';
      return 'from-slate-800 to-slate-900 text-slate-400';
    } else if (metricMode === 'startups') {
      if (r.startupsCount > 50) return 'from-blue-600 to-indigo-600 text-white';
      if (r.startupsCount > 20) return 'from-blue-700/80 to-indigo-800/80 text-blue-100';
      if (r.startupsCount > 10) return 'from-blue-900/60 to-slate-800 text-slate-200';
      return 'from-slate-800 to-slate-900 text-slate-300';
    } else {
      const uCount = r.universitiesWithAI?.length || 0;
      if (uCount >= 4) return 'from-emerald-600 to-teal-700 text-white';
      if (uCount >= 2) return 'from-emerald-700/80 to-teal-800/80 text-emerald-100';
      if (uCount >= 1) return 'from-emerald-900/60 to-slate-800 text-slate-200';
      return 'from-slate-800 to-slate-900 text-slate-400';
    }
  };

  const getMetricBadge = (r: ChileRegion) => {
    if (metricMode === 'webmcp') return `${r.webmcpCount || 0} WebMCP`;
    if (metricMode === 'hackathons') return `${r.hackathonsCount} Eventos`;
    if (metricMode === 'startups') return `${r.startupsCount} Startups`;
    if (metricMode === 'universidades') return `${r.universitiesWithAI?.length || 0} Universidades`;
    return `${r.webmcpCount || 0} WebMCP`;
  };

  const activeRegionOrgs = selectedRegion ? organizations.filter(o => o.regionId === selectedRegion.id) : [];
  const activeRegionEvents = selectedRegion ? events.filter(e => e.regionId === selectedRegion.id) : [];

  const currentRegionIndex = regions.findIndex((r) => r.id === selectedRegion?.id);
  const handlePrevRegion = () => {
    if (regions.length === 0) return;
    const newIdx = currentRegionIndex <= 0 ? regions.length - 1 : currentRegionIndex - 1;
    onSelectRegion(regions[newIdx].id);
  };
  const handleNextRegion = () => {
    if (regions.length === 0) return;
    const newIdx = currentRegionIndex >= regions.length - 1 || currentRegionIndex === -1 ? 0 : currentRegionIndex + 1;
    onSelectRegion(regions[newIdx].id);
  };

  return (
    <div className="space-y-2.5 sm:space-y-3.5">
      {/* Desktop Header & Controls (Hidden on mobile to show map directly) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
              <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Directorio Territorial • 16 Regiones
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit'] mt-0.5">
              Ecosistema de Inteligencia Artificial en Chile
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
              Explora startups, centros de I+D, capacidad de cómputo y hackathons en cada región del país.
            </p>
          </div>

          {/* View Toggle & Search */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
            {/* View Mode Toggle: Silueta de Chile vs Lista (Minimalist Segmented Control) */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 self-stretch sm:self-auto text-xs">
              <button
                id="btn-view-silhouette"
                type="button"
                onClick={() => setMapView('silhouette')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-xs ${
                  mapView === 'silhouette'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <MapIcon className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span>Silueta</span>
              </button>
              <button
                id="btn-view-list"
                type="button"
                onClick={() => setMapView('list')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer text-xs ${
                  mapView === 'list'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3 h-3" />
                <span>Lista</span>
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative w-full sm:w-52">
              <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar región o foco..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Streamlined Top Bar (Direct entry to the map) */}
      <div className="md:hidden flex items-center justify-between gap-1.5 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0"></span>
          <span className="text-xs font-semibold text-slate-900 dark:text-white font-['Outfit'] truncate">
            {mobileViewMode === 'stack' && selectedRegion
              ? `Ficha: ${selectedRegion.name}`
              : selectedRegion
              ? `R${selectedRegion.romanNumeral}: ${selectedRegion.shortName}`
              : 'Mapa de Chile (16 Regiones)'}
          </span>
        </div>

        <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-md border border-slate-200 dark:border-slate-800 flex-shrink-0 text-xs">
          <button
            type="button"
            id="btn-mobile-map"
            onClick={() => {
              setMapView('silhouette');
              setMobileViewMode('map');
            }}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
              mobileViewMode === 'map' && mapView === 'silhouette'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapIcon className="w-2.5 h-2.5 inline mr-0.5 text-blue-600 dark:text-blue-400" />
            <span>Mapa</span>
          </button>
          <button
            type="button"
            id="btn-mobile-list"
            onClick={() => {
              setMapView('list');
              setMobileViewMode('map');
            }}
            className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
              mobileViewMode === 'map' && mapView === 'list'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="w-2.5 h-2.5 inline mr-0.5" />
            <span>Lista</span>
          </button>
          {selectedRegion && (
            <button
              type="button"
              id="btn-mobile-stack"
              onClick={() => {
                if (mobileViewMode === 'map') {
                  handleOpenFicha();
                } else {
                  handleBackToMap();
                }
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                mobileViewMode === 'stack'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-2.5 h-2.5 inline mr-0.5" />
              <span>{mobileViewMode === 'stack' ? 'Mapa' : 'Ficha'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map Layout: Geographic Topology Spine / Silhouette + Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4.5 items-start">
        {/* Geographic Column & Regional Ribbon Selector (7 cols on lg) */}
        <div className={`lg:col-span-7 space-y-2.5 sm:space-y-3 ${
          mobileViewMode === 'map' ? 'block' : 'hidden lg:block'
        }`}>
          {mapView === 'silhouette' ? (
            <ChileSilhouetteMap
              regions={regions}
              selectedRegionId={selectedRegion?.id || null}
              onSelectRegion={(id) => onSelectRegion(id)}
              metricMode={metricMode}
              onChangeMetricMode={setMetricMode}
              onNavigateToDirectoryWithRegion={onNavigateToDirectoryWithRegion}
              onNavigateToWebMcp={onNavigateToWebMcp}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
              {/* Header bar */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60 text-[10px] text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Territorio Nacional</span>
                  <span className="text-slate-400 dark:text-slate-500">• 16 Regiones</span>
                </div>
                <span className="font-mono text-[9px] text-slate-400 dark:text-slate-500 uppercase">Norte a Sur</span>
              </div>

              {/* Minimalist Data Rows (Prototyping / Linear aesthetic) */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[520px] overflow-y-auto">
                {filteredRegions.map((region) => {
                  const isSelected = selectedRegion?.id === region.id;
                  const badgeLabel = getMetricBadge(region);

                  return (
                    <div
                      key={region.id}
                      id={`region-card-${region.id}`}
                      onClick={() => onSelectRegion(region.id)}
                      className={`group relative px-2 sm:px-2.5 py-1 sm:py-1.5 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-blue-50/60 dark:bg-blue-950/40 border-l-2 border-l-blue-600 dark:border-l-blue-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 border-l-2 border-l-transparent'
                      }`}
                    >
                      {/* Left: Roman Index & Name & Specialty */}
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <span className={`w-5 text-center font-mono text-[11px] font-semibold flex-shrink-0 transition-colors ${
                          isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {region.romanNumeral}
                        </span>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className={`text-[11px] sm:text-xs font-semibold truncate ${
                              isSelected ? 'text-blue-900 dark:text-white' : 'text-slate-900 dark:text-slate-100'
                            }`}>
                              {region.name}
                            </span>
                            <span className="text-[8.5px] text-slate-400 dark:text-slate-500 hidden sm:inline font-normal">
                              {region.zone}
                            </span>
                          </div>
                          <p className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.2">
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{region.capital}</span> • {region.topSpecialty}
                          </p>
                        </div>
                      </div>

                      {/* Right: Clean Metric & Indicator */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                          isSelected
                            ? 'text-blue-700 dark:text-blue-300 bg-blue-100/60 dark:bg-blue-900/40 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                        }`}>
                          {badgeLabel}
                        </span>
                        <ChevronRight className={`w-2.5 h-2.5 transition-transform ${
                          isSelected
                            ? 'text-blue-600 dark:text-blue-400 translate-x-0.5'
                            : 'text-slate-300 dark:text-slate-600 group-hover:text-slate-500'
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Minimal Bottom Summary */}
              <div className="px-2.5 py-1 bg-slate-50/40 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 text-[9.5px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
                <span>Directorio regional interactivo</span>
                <span className="font-mono">{filteredRegions.length} regiones</span>
              </div>
            </div>
          )}

          {/* Quick jump to card stack on mobile when viewing the map */}
          {selectedRegion && (
            <div className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1.5 shadow-xs">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-slate-900 dark:text-white truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0"></span>
                  <span className="font-mono text-[9.5px] text-slate-400">{selectedRegion.romanNumeral}</span>
                  <span className="truncate">{selectedRegion.name}</span>
                </div>
                <div className="text-[9.5px] text-slate-500 dark:text-slate-400 truncate mt-0.2">
                  {selectedRegion.startupsCount} Startups • {selectedRegion.topSpecialty}
                </div>
              </div>
              <button
                type="button"
                onClick={handleOpenFicha}
                className="px-2 py-0.5 rounded-md bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-medium flex items-center gap-1 flex-shrink-0 cursor-pointer transition-colors"
              >
                <span>Ver Ficha</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Selected Region Deep-Dive Inspector (5 cols on lg) */}
        <div 
          id="region-detail-panel" 
          className={`lg:col-span-5 sticky top-20 space-y-2 ${
            mobileViewMode === 'stack' ? 'block' : 'hidden lg:block'
          }`}
        >
          {selectedRegion ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-2.5 sm:p-3 shadow-xs relative overflow-hidden">
              {/* Back to map button on mobile */}
              <div className="lg:hidden mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleBackToMap}
                  className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  <ChevronLeft className="w-3 h-3" />
                  <span>Volver al Mapa de Chile</span>
                </button>
                <span className="text-[8.5px] text-slate-400 font-medium">Card Stack</span>
              </div>

              {/* Region Header */}
              <div className="relative">
                <div className="flex items-center justify-between gap-1">
                  <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30">
                    Región {selectedRegion.romanNumeral} • {selectedRegion.zone}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                      Capital: <strong className="text-slate-800 dark:text-slate-200">{selectedRegion.capital}</strong>
                    </span>
                    <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-950/80 p-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                      <button
                        onClick={handlePrevRegion}
                        title="Región anterior"
                        className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-2.5 h-2.5" />
                      </button>
                      <button
                        onClick={handleNextRegion}
                        title="Región siguiente"
                        className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mt-0.5">
                  {selectedRegion.name}
                </h3>
                <p className="text-[10.5px] sm:text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-snug line-clamp-2 sm:line-clamp-3">
                  {selectedRegion.description}
                </p>
              </div>

              {/* Card Stack Switcher Tabs (Sleek Minimalist Segmented Control) */}
              <div className="mt-2 flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  id="tab-stack-metrics"
                  onClick={() => setActiveCardStackTab('metrics')}
                  className={`flex-1 flex items-center justify-center gap-1 py-0.5 px-1 rounded-md font-medium transition-all cursor-pointer min-h-[26px] text-[10px] sm:text-[10.5px] ${
                    activeCardStackTab === 'metrics'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-500 flex-shrink-0" />
                  <span>Métricas</span>
                </button>
                <button
                  type="button"
                  id="tab-stack-startups"
                  onClick={() => setActiveCardStackTab('startups')}
                  className={`flex-1 flex items-center justify-center gap-1 py-0.5 px-1 rounded-md font-medium transition-all cursor-pointer min-h-[26px] text-[10px] sm:text-[10.5px] ${
                    activeCardStackTab === 'startups'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Building2 className="w-2.5 h-2.5 text-blue-500 flex-shrink-0" />
                  <span>Empresas ({activeRegionOrgs.length})</span>
                </button>
                <button
                  type="button"
                  id="tab-stack-academy"
                  onClick={() => setActiveCardStackTab('academy')}
                  className={`flex-1 flex items-center justify-center gap-1 py-0.5 px-1 rounded-md font-medium transition-all cursor-pointer min-h-[26px] text-[10px] sm:text-[10.5px] ${
                    activeCardStackTab === 'academy'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <GraduationCap className="w-2.5 h-2.5 text-indigo-500 flex-shrink-0" />
                  <span>Academia</span>
                </button>
              </div>

              {/* Card 1: Foco & Métricas */}
              {activeCardStackTab === 'metrics' && (
                <div className="mt-2 space-y-1.5 animate-in fade-in duration-150">
                  {/* Highlight specialty banner */}
                  <div className="p-1.5 sm:p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-start gap-1.5">
                    <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-[8.5px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Foco Tecnológico Regional</h5>
                      <p className="text-[10px] sm:text-[10.5px] font-medium text-slate-900 dark:text-slate-100 mt-0.2">{selectedRegion.topSpecialty}</p>
                    </div>
                  </div>

                  {/* 4 Key Indicators Strip: WebMCP 1º, Eventos 2º, Startups, Universidades */}
                  <div className="grid grid-cols-4 divide-x divide-slate-200/80 dark:divide-slate-800 bg-slate-50/70 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 py-1 text-center">
                    <div className="px-0.5">
                      <div className="text-xs sm:text-sm font-bold font-mono text-purple-600 dark:text-purple-400">
                        {selectedRegion.webmcpCount || 0}
                      </div>
                      <div className="text-[8px] sm:text-[8.5px] text-slate-400 dark:text-slate-500 font-medium">WebMCP</div>
                    </div>
                    <div className="px-0.5">
                      <div className="text-xs sm:text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                        {selectedRegion.hackathonsCount}
                      </div>
                      <div className="text-[8px] sm:text-[8.5px] text-slate-400 dark:text-slate-500 font-medium">Eventos</div>
                    </div>
                    <div className="px-0.5">
                      <div className="text-xs sm:text-sm font-bold font-mono text-blue-600 dark:text-blue-400">
                        {selectedRegion.startupsCount}
                      </div>
                      <div className="text-[8px] sm:text-[8.5px] text-slate-400 dark:text-slate-500 font-medium">Startups</div>
                    </div>
                    <div className="px-0.5">
                      <div className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {selectedRegion.universitiesWithAI?.length || 0}
                      </div>
                      <div className="text-[8px] sm:text-[8.5px] text-slate-400 dark:text-slate-500 font-medium">Ues</div>
                    </div>
                  </div>

                  {/* Sectores Clave */}
                  <div>
                    <h5 className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mb-0.5 uppercase tracking-wider">Sectores Clave</h5>
                    <div className="flex flex-wrap gap-1">
                      {selectedRegion.keySectors.map(s => (
                        <span key={s} className="px-1.5 py-0.2 rounded text-[9px] sm:text-[9.5px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Card 2: Empresas & Startups */}
              {activeCardStackTab === 'startups' && (
                <div className="mt-2 space-y-1 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-0.5">
                    <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Empresas ({activeRegionOrgs.length})
                    </span>
                    {onOpenAddModal && (
                      <button
                        type="button"
                        onClick={onOpenAddModal}
                        className="text-[9.5px] text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Sumar</span>
                      </button>
                    )}
                  </div>

                  {activeRegionOrgs.length > 0 ? (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-56 sm:max-h-64 overflow-y-auto pr-0.5">
                      {activeRegionOrgs.map(org => (
                        <div key={org.id} className="py-1 sm:py-1.5 transition-colors">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs font-semibold text-slate-900 dark:text-white">{org.name}</span>
                            <span className="text-[8.5px] font-mono text-slate-500 dark:text-slate-400">
                              {org.type}
                            </span>
                          </div>
                          <p className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.2">{org.tagline}</p>
                          <div className="mt-0.5 flex flex-wrap gap-0.5">
                            {org.toolsUsed.slice(0, 3).map(tool => (
                              <span key={tool} className="text-[7.5px] sm:text-[8px] px-1 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded font-mono">
                                {tool}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-center">
                      <p className="text-[10px] sm:text-[10.5px] text-slate-400 italic mb-1">
                        Aún no hay entidades catalogadas en esta región.
                      </p>
                      {onOpenAddModal && (
                        <button
                          type="button"
                          onClick={onOpenAddModal}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Postular Entidad</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Card 3: I+D & Academia */}
              {activeCardStackTab === 'academy' && (
                <div className="mt-2 space-y-2 animate-in fade-in duration-150">
                  {/* Polo Académico */}
                  {selectedRegion.universitiesWithAI.length > 0 ? (
                    <div>
                      <h5 className="text-[10px] sm:text-[10.5px] font-semibold text-slate-700 dark:text-slate-300 mb-0.5 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                        <span>Polo Académico & Formación en IA:</span>
                      </h5>
                      <ul className="text-[10px] sm:text-[10.5px] text-slate-600 dark:text-slate-300 space-y-0.5 pl-1">
                        {selectedRegion.universitiesWithAI.map((uni, idx) => (
                          <li key={idx} className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-indigo-500 flex-shrink-0" />
                            <span>{uni}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-[10px] sm:text-[10.5px] text-slate-500 italic">
                      Iniciativas académicas en articulación territorial con centros de investigación nacionales.
                    </p>
                  )}

                  {/* Vocación Macrozonal */}
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5 text-[10px] sm:text-[10.5px]">
                      Vocación Territorial ({selectedRegion.zone}):
                    </span>
                    <p className="text-[9.5px] sm:text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedRegion.zone.includes('Norte') && 'Especialización en sensorización remota, Minería 4.0, Astroinformática de gran escala y computación solar de borde.'}
                      {selectedRegion.zone.includes('Centro') && 'Nodo de concentración de modelos fundacionales, CENIA, GovTech, FinTech y ecosistema de capital de riesgo.'}
                      {selectedRegion.zone.includes('Sur') && 'Foco en bioinformática, acuicultura inteligente, robótica de campo y computación para mitigación climática.'}
                      {selectedRegion.zone.includes('Austral') && 'Computación verde y logística extrema, monitoreo satelital antártico y soberanía digital de datos.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Direct WebMCP Business Banner for Enterprise Owners */}
              <div className="mt-2.5 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10.5px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                      ¿Tienes empresa en {selectedRegion.shortName}?
                    </div>
                    <div className="text-[9px] text-slate-600 dark:text-slate-400 truncate">
                      Súmate al protocolo WebMCP para agentes de IA con AlphaDocere & Browns Studio.
                    </div>
                  </div>
                </div>
                {onNavigateToWebMcp && (
                  <button
                    type="button"
                    onClick={onNavigateToWebMcp}
                    className="px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-semibold whitespace-nowrap shadow-xs cursor-pointer transition-all flex items-center gap-0.5 flex-shrink-0"
                  >
                    <span>Postular</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-center text-slate-500 dark:text-slate-400 shadow-xs">
              <Info className="w-4 h-4 mx-auto text-slate-400 dark:text-slate-500 mb-1" />
              <p className="text-[11px]">Selecciona cualquier región en la lista para ver su ficha técnica y actores.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
