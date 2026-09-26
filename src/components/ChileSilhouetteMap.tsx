import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChileRegion, Organization, EcosystemEvent, MacroZone, SolicitudesPorRegion } from '../types';
import { CHILE_REGION_PATHS, CHILE_REGION_CENTROIDS } from '../data/chileRegionsGeo';
import { 
  Building2, 
  Database, 
  Calendar, 
  Sparkles, 
  MapPin, 
  ArrowRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Layers,
  Move,
  Compass,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  TrendingUp,
  Flame,
  DollarSign,
  Share2,
  Check,
  Users,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Brain,
  Target,
  Bot,
  Inbox
} from 'lucide-react';

export type SilhouetteMetricMode = 'webmcp' | 'solicitudes' | 'hackathons' | 'startups' | 'universidades' | 'inversion' | 'talento';

interface ChileSilhouetteMapProps {
  regions: ChileRegion[];
  selectedRegionId: string | null;
  onSelectRegion: (regionId: string) => void;
  metricMode: string;
  onChangeMetricMode?: (mode: any) => void;
  showTalentOverlay?: boolean;
  onToggleTalentOverlay?: () => void;
  recruiterSpecialtyFilter?: string;
  onSelectRecruiterSpecialty?: (specialty: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onNavigateToDirectoryWithRegion?: (regionId: string) => void;
  onNavigateToWebMcp?: () => void;
  /** Conteo de solicitudes del cotizador por región (capa "Solicitudes MCP"). */
  solicitudesPorRegion?: SolicitudesPorRegion;
  /** Oculta el selector de métricas (uso embebido, por ejemplo en el cotizador). */
  hideMetricControls?: boolean;
  /** Título del encabezado del mapa. */
  title?: string;
}

// Coordenadas en el viewBox 240×820. Los puntos van en el centro de área real de cada región
// y las etiquetas se alternan a cada lado, justo fuera del borde de la región.
interface RegionCoord {
  id: string;
  x: number;
  y: number;
  labelAnchor: 'left' | 'right';
  labelX: number;
}

const REGION_ORDER = ['arica', 'tarapaca', 'antofagasta', 'atacama', 'coquimbo', 'valparaiso', 'metropolitana', 'ohiggins',
  'maule', 'nuble', 'biobio', 'araucania', 'losrios', 'loslagos', 'aysen', 'magallanes'];

/** Borde este y oeste de cada región a la altura de su centro, calculado desde el trazado. */
const regionEdgesAt = (path: string, y: number): { min: number; max: number } => {
  const pts = [...path.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map(m => ({ x: Number(m[1]), y: Number(m[2]) }));
  const cerca = pts.filter(p => Math.abs(p.y - y) < 14);
  const base = cerca.length ? cerca : pts;
  return { min: Math.min(...base.map(p => p.x)), max: Math.max(...base.map(p => p.x)) };
};

const REGION_COORDS: Record<string, RegionCoord> = Object.fromEntries(
  REGION_ORDER.map((id, i) => {
    const c = CHILE_REGION_CENTROIDS[id];
    const edges = regionEdgesAt(CHILE_REGION_PATHS[id], c.y);
    const anchor: 'left' | 'right' = i % 2 === 0 ? 'right' : 'left';
    return [id, { id, x: c.x, y: c.y, labelAnchor: anchor, labelX: anchor === 'right' ? edges.max + 7 : edges.min - 7 }];
  })
);

export const ChileSilhouetteMap: React.FC<ChileSilhouetteMapProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  metricMode,
  onChangeMetricMode,
  showTalentOverlay = false,
  onToggleTalentOverlay,
  recruiterSpecialtyFilter,
  onSelectRecruiterSpecialty,
  onNavigateToTab,
  onNavigateToDirectoryWithRegion,
  onNavigateToWebMcp,
  solicitudesPorRegion = {},
  hideMetricControls = false,
  title = 'Mapa de Chile'
}) => {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'talento' | 'inversion'>(
    metricMode === 'inversion' ? 'inversion' : 'talento'
  );

  // Sync tab if user changes metricMode
  useEffect(() => {
    if (metricMode === 'inversion') {
      setInspectorTab('inversion');
    } else if (metricMode === 'talento') {
      setInspectorTab('talento');
    }
  }, [metricMode]);

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1.0);
  const [center, setCenter] = useState<{ x: number; y: number }>({ x: 120, y: 410 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [centerStart, setCenterStart] = useState<{ x: number; y: number }>({ x: 120, y: 410 });
  const [pinchDistance, setPinchDistance] = useState<number | null>(null);
  const [touchMoved, setTouchMoved] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const lastTapRef = useRef<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  const activeRegion = regions.find(r => r.id === (hoveredRegionId || selectedRegionId)) || regions[0];

  // Geographical index for Prev / Next Region exploration
  const currentRegionIndex = regions.findIndex(r => r.id === activeRegion.id);
  const handlePrevRegion = () => {
    if (currentRegionIndex > 0) {
      const prev = regions[currentRegionIndex - 1];
      onSelectRegion(prev.id);
      const coord = REGION_COORDS[prev.id];
      if (coord && zoom > 1.2) {
        setCenter({ x: 120, y: coord.y });
      }
    }
  };
  const handleNextRegion = () => {
    if (currentRegionIndex >= 0 && currentRegionIndex < regions.length - 1) {
      const next = regions[currentRegionIndex + 1];
      onSelectRegion(next.id);
      const coord = REGION_COORDS[next.id];
      if (coord && zoom > 1.2) {
        setCenter({ x: 120, y: coord.y });
      }
    }
  };

  // ViewBox calculation derived from zoom and vertical center
  // Chile is strictly vertical: horizontal center is permanently locked at 120 so it never slides or rotates sideways
  const vbWidth = 240 / zoom;
  const vbHeight = 820 / zoom;
  const minY = vbHeight / 2 - 25;
  const maxY = 820 - vbHeight / 2 + 25;
  const clampedY = Math.max(minY, Math.min(maxY, center.y));
  const vbX = 120 - vbWidth / 2; // Locked to center 120
  const vbY = clampedY - vbHeight / 2;
  const currentViewBox = `${vbX} ${vbY} ${vbWidth} ${vbHeight}`;

  // Zoom button handlers
  const handleZoomIn = () => {
    setZoom(prev => Math.min(3.2, Number((prev + 0.35).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(1.0, Number((prev - 0.35).toFixed(2)));
      if (next === 1.0) {
        setCenter({ x: 120, y: 410 });
      }
      return next;
    });
  };

  const handleReset = () => {
    setZoom(1.0);
    setCenter({ x: 120, y: 410 });
  };

  // Center on a specific region (preserving horizontal locked center at 120)
  const handleCenterOnRegion = (regionId: string) => {
    const coord = REGION_COORDS[regionId];
    if (coord) {
      setZoom(prev => Math.max(2.0, prev));
      setCenter({ x: 120, y: coord.y });
    }
  };

  // Touch handlers for mobile: strictly lock horizontal axis to prevent sideways drift/rotation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      if (zoom > 1.08) {
        setIsPanning(true);
        setTouchMoved(false);
        setPanStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        setCenterStart({ x: 120, y: center.y });
      } else {
        setIsPanning(false);
        setTouchMoved(false);
      }
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setPinchDistance(dist);
      setCenterStart({ x: 120, y: center.y });
      setPanStart({
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    if (e.touches.length === 1 && isPanning && zoom > 1.08) {
      const dy = e.touches[0].clientY - panStart.y;
      if (Math.abs(dy) > 6) {
        setTouchMoved(true);
      }

      // Convert screen pixels into SVG coordinates exclusively for vertical (North-South) navigation
      const svgScaleY = vbHeight / rect.height;

      setCenter({
        x: 120, // STRICTLY LOCKED AT 120: CANNOT MOVE SIDEWAYS
        y: Math.max(150, Math.min(670, centerStart.y - dy * svgScaleY))
      });
    } else if (e.touches.length === 2 && pinchDistance !== null) {
      setTouchMoved(true);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scaleFactor = dist / pinchDistance;
      const newZoom = Math.min(3.2, Math.max(1.0, zoom * scaleFactor));
      setZoom(Number(newZoom.toFixed(2)));
      setPinchDistance(dist);

      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const dy = midY - panStart.y;
      const svgScaleY = vbHeight / rect.height;
      setCenter({
        x: 120, // STRICTLY LOCKED AT 120
        y: Math.max(150, Math.min(670, centerStart.y - dy * svgScaleY))
      });
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setPinchDistance(null);
  };

  // Mouse handlers for desktop pan (vertical only when zoomed)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || zoom <= 1.08) return;
    setIsPanning(true);
    setTouchMoved(false);
    setPanStart({ x: e.clientX, y: e.clientY });
    setCenterStart({ x: 120, y: center.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning || !containerRef.current || zoom <= 1.08) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dy = e.clientY - panStart.y;
    if (Math.abs(dy) > 4) {
      setTouchMoved(true);
    }
    const svgScaleY = vbHeight / rect.height;
    setCenter({
      x: 120, // STRICTLY LOCKED AT 120
      y: Math.max(150, Math.min(670, centerStart.y - dy * svgScaleY))
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    // Zoom with mouse wheel smoothly
    const zoomDelta = e.deltaY > 0 ? -0.15 : 0.15;
    setZoom(prev => {
      const next = Math.min(3.2, Math.max(1.0, Number((prev + zoomDelta).toFixed(2))));
      if (next === 1.0) setCenter({ x: 120, y: 410 });
      return next;
    });
  };

  // Double tap handler on canvas / hotspots
  const handleCanvasDoubleTap = (svgX: number, svgY: number) => {
    if (zoom > 1.2) {
      setZoom(1.0);
      setCenter({ x: 120, y: 410 });
    } else {
      setZoom(2.2);
      setCenter({ x: 120, y: svgY });
    }
  };

  // Colors according to metricMode
  const solicitudesDe = (region: ChileRegion) => solicitudesPorRegion[region.id] || { postulando: 0, conectadas: 0 };

  const getMetricColor = (region: ChileRegion) => {
    if (metricMode === 'solicitudes') {
      const s = solicitudesDe(region);
      if (s.conectadas > 0) return '#2563eb'; // blue-600: con empresas conectadas
      if (s.postulando > 0) return '#93c5fd'; // blue-300: con empresas postulando
      return '#e2e8f0'; // slate-200: sin solicitudes
    }
    if (metricMode === 'webmcp') {
      const mcp = region.webmcpCount || 0;
      if (mcp >= 15) return '#a855f7'; // purple-500
      if (mcp >= 6) return '#c084fc';  // purple-400
      if (mcp >= 2) return '#d8b4fe';  // purple-300
      return '#f3e8ff';
    } else if (metricMode === 'hackathons') {
      if (region.hackathonsCount >= 5) return '#f59e0b'; // amber-500
      if (region.hackathonsCount >= 3) return '#fbbf24'; // amber-400
      if (region.hackathonsCount >= 1) return '#fcd34d'; // amber-300
      return '#fde68a';
    } else if (metricMode === 'startups') {
      if (region.startupsCount > 50) return '#3b82f6'; // blue-500
      if (region.startupsCount > 20) return '#60a5fa'; // blue-400
      if (region.startupsCount > 10) return '#93c5fd'; // blue-300
      return '#bfdbfe';
    } else if (metricMode === 'universidades') {
      const uCount = region.universitiesWithAI?.length || 0;
      if (uCount >= 4) return '#10b981'; // emerald-500
      if (uCount >= 2) return '#34d399'; // emerald-400
      if (uCount >= 1) return '#6ee7b7'; // emerald-300
      return '#a7f3d0';
    } else {
      // Inversión Tecnológica (USD)
      const inv = region.investmentUSD || 0;
      if (inv >= 100) return '#f43f5e'; // rose-500 (Epicentro > $100M)
      if (inv >= 50) return '#f97316';  // orange-500 (Alto Flujo $50M - $100M)
      if (inv >= 15) return '#f59e0b';  // amber-500 (Crecimiento $15M - $50M)
      return '#06b6d4'; // cyan-500 (Emergente / Semilla < $15M)
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 sm:p-3 relative overflow-hidden shadow-xs">
      {/* Top Header & Metric Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2 pb-1.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between sm:justify-start gap-1.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-['Outfit']">
              {title}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              16 Regiones
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
            Toca una región para ver su ficha
          </p>
        </div>

        {/* Minimalist Segmented Control for Metrics: WebMCP (1º), Solicitudes, Eventos, Startups, Universidades */}
        {!hideMetricControls && (
        <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs overflow-x-auto no-scrollbar">
          {/* 1. WebMCP (Primero) */}
          <button
            type="button"
            id="btn-metric-top-webmcp"
            onClick={() => onChangeMetricMode?.('webmcp')}
            className={`px-1.5 py-0.5 rounded-md text-[10px] sm:text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              metricMode === 'webmcp'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bot className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
            <span>WebMCP</span>
          </button>

          {/* Solicitudes recibidas por el cotizador */}
          <button
            type="button"
            id="btn-metric-top-solicitudes"
            onClick={() => onChangeMetricMode?.('solicitudes')}
            className={`px-1.5 py-0.5 rounded-md text-[10px] sm:text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              metricMode === 'solicitudes'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Inbox className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
            <span>Solicitudes</span>
          </button>

          {/* 2. Eventos (Segundo) */}
          <button
            type="button"
            id="btn-metric-top-hackathons"
            onClick={() => onChangeMetricMode?.('hackathons')}
            className={`px-1.5 py-0.5 rounded-md text-[10px] sm:text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              metricMode === 'hackathons'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
            <span>Eventos</span>
          </button>

          {/* 3. Startups */}
          <button
            type="button"
            id="btn-metric-top-startups"
            onClick={() => onChangeMetricMode?.('startups')}
            className={`px-1.5 py-0.5 rounded-md text-[10px] sm:text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              metricMode === 'startups'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
            <span>Startups</span>
          </button>

          {/* 4. Universidades (reemplaza Data Centers) */}
          <button
            type="button"
            id="btn-metric-top-universidades"
            onClick={() => onChangeMetricMode?.('universidades')}
            className={`px-1.5 py-0.5 rounded-md text-[10px] sm:text-[10.5px] font-medium flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
              metricMode === 'universidades'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
            <span>Universidades</span>
          </button>
        </div>
        )}
      </div>

      {/* Main Map Interactive Canvas */}
      <div className="flex flex-col items-center relative select-none py-0.5">
          <div className="w-full flex items-center justify-between text-[9.5px] text-slate-500 dark:text-slate-400 mb-0.5 px-1">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Compass className="w-2.5 h-2.5 text-blue-500" />
              <span>16 regiones • Toca una región para inspeccionar</span>
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[8.5px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-950 px-1 py-0.2 rounded border border-slate-200 dark:border-slate-800">
                {Math.round(zoom * 100)}%
              </span>
              {zoom > 1.08 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-[8.5px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
                >
                  <RotateCcw className="w-2 h-2" />
                  <span>Restablecer</span>
                </button>
              )}
            </div>
          </div>

          {/* Interactive Frame with mobile phone aspect ratio and clean containment */}
          <div 
            ref={containerRef}
            className={`relative w-full max-w-[270px] sm:max-w-[300px] lg:max-w-[320px] aspect-[9/16] max-h-[500px] sm:max-h-[540px] bg-slate-50/60 dark:bg-slate-950 rounded-2xl sm:rounded-3xl border-2 border-slate-200/90 dark:border-slate-800/90 overflow-hidden flex items-center justify-center transition-colors shadow-xs select-none ${
              isPanning ? 'cursor-grabbing' : zoom > 1.08 ? 'cursor-grab' : 'cursor-default'
            }`}
            style={{ touchAction: 'pan-y' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            {/* Subtle mobile device bezel indicator */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-9 h-1 rounded-full bg-slate-200 dark:bg-slate-800 pointer-events-none z-20 opacity-60" />

            {/* Floating Zoom & Pan Controls Widget */}
            <div className="absolute top-2 right-2 z-30 flex flex-col items-center bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 shadow-xs backdrop-blur-md">
              <button
                id="btn-map-zoom-in"
                onClick={handleZoomIn}
                disabled={zoom >= 3.2}
                title="Acercar mapa (+)"
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ZoomIn className="w-3 h-3" />
              </button>

              <div className="py-0.5 text-[8.5px] font-mono text-slate-400 select-none">
                {Math.round(zoom * 100)}%
              </div>

              <button
                id="btn-map-zoom-out"
                onClick={handleZoomOut}
                disabled={zoom <= 1.0}
                title="Alejar mapa (-)"
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ZoomOut className="w-3 h-3" />
              </button>

              <div className="w-3.5 h-[1px] bg-slate-200 dark:bg-slate-800 my-0.5" />

              <button
                id="btn-map-reset-zoom"
                onClick={handleReset}
                title="Restablecer vista completa de Chile"
                className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
              </button>
            </div>

            {/* Floating Reset Button when zoomed in on mobile */}
            {zoom > 1.15 && (
              <button
                onClick={handleReset}
                className="absolute bottom-2.5 left-2.5 z-30 px-2 py-0.5 rounded-md bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-[10px] font-medium shadow-xs backdrop-blur-md flex items-center gap-1 transition-all cursor-pointer"
              >
                <RotateCcw className="w-2.5 h-2.5" />
                <span>Ver Todo</span>
              </button>
            )}

            <svg
              viewBox={currentViewBox}
              preserveAspectRatio="xMidYMid meet"
              className="w-full h-full drop-shadow-xs transition-transform duration-75"
              style={{ overflow: 'hidden', touchAction: 'pan-y' }}
            >
              <defs>

                <filter id="glowPoint" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#60a5fa" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Regiones reales, pintadas según la métrica activa */}
              {regions.map((region) => {
                const d = CHILE_REGION_PATHS[region.id];
                if (!d) return null;
                const isActive = selectedRegionId === region.id || hoveredRegionId === region.id;
                return (
                  <path
                    key={`region-shape-${region.id}`}
                    id={`svg-region-shape-${region.id}`}
                    d={d}
                    fill={getMetricColor(region)}
                    fillOpacity={isActive ? 1 : 0.82}
                    strokeWidth={isActive ? 1.4 : 0.6}
                    strokeLinejoin="round"
                    className={`cursor-pointer transition-[fill,fill-opacity] duration-500 ${
                      isActive ? 'stroke-blue-700 dark:stroke-white' : 'stroke-white dark:stroke-slate-900'
                    }`}
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                    onClick={(e) => { e.stopPropagation(); if (!touchMoved) onSelectRegion(region.id); }}
                  >
                    <title>{region.name}</title>
                  </path>
                );
              })}

              {/* Regional Hotspots with ENLARGED TOUCH HITBOXES (WCAG AA Compliant 44px+) */}
              {regions.map((region) => {
                const coord = REGION_COORDS[region.id];
                if (!coord) return null;

                const isSelected = selectedRegionId === region.id;
                const isHovered = hoveredRegionId === region.id;
                const isActive = isSelected || isHovered;
                const metricColor = getMetricColor(region);

                // Determine dot radius based on metric
                let dotRadius = 4;
                if (metricMode === 'solicitudes') {
                  const s = solicitudesDe(region);
                  const total = s.postulando + s.conectadas;
                  dotRadius = total >= 5 ? 6.5 : total >= 2 ? 5 : total >= 1 ? 4.2 : 3;
                } else if (metricMode === 'startups') {
                  dotRadius = Math.min(8, Math.max(3.5, 3.5 + Math.log2(region.startupsCount)));
                } else if (metricMode === 'universidades') {
                  const uCount = region.universitiesWithAI?.length || 0;
                  dotRadius = uCount >= 4 ? 7.5 : uCount >= 2 ? 5.5 : uCount >= 1 ? 4.5 : 3.5;
                } else if (metricMode === 'hackathons') {
                  dotRadius = region.hackathonsCount >= 5 ? 7 : region.hackathonsCount >= 2 ? 5 : 3.5;
                } else if (metricMode === 'webmcp') {
                  const mcp = region.webmcpCount || 0;
                  dotRadius = mcp >= 15 ? 7.8 : mcp >= 6 ? 6.2 : mcp >= 2 ? 4.8 : 3.6;
                } else {
                  // Inversion mode
                  const inv = region.investmentUSD || 0;
                  dotRadius = inv >= 100 ? 7.5 : inv >= 50 ? 6 : inv >= 15 ? 4.8 : 3.8;
                }

                // Handle tap/click on hotspot
                const handleTrigger = (e: React.SyntheticEvent) => {
                  e.stopPropagation();
                  if (!touchMoved) {
                    onSelectRegion(region.id);
                    const now = Date.now();
                    if (now - lastTapRef.current < 320) {
                      handleCanvasDoubleTap(coord.x, coord.y);
                    } else if (zoom > 1.15) {
                      setCenter({ x: coord.x, y: coord.y });
                    }
                    lastTapRef.current = now;
                  }
                };

                return (
                  <g
                    key={region.id}
                    id={`svg-region-hotspot-${region.id}`}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredRegionId(region.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                    onClick={handleTrigger}
                    opacity={1}
                  >
                    {/* INVISIBLE EXPANDED TOUCH TARGET (r=26 -> 52px diameter touch area for mobile thumbs) */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r="26"
                      fill="transparent"
                      className="cursor-pointer"
                      style={{ pointerEvents: 'all' }}
                    />

                    {/* Pulsing ring for active / selected node */}
                    {isActive && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r={dotRadius + 6}
                        fill="none"
                        stroke={metricColor}
                        strokeWidth="1.5"
                        strokeDasharray="3 2"
                        className="animate-spin"
                        style={{ transformOrigin: `${coord.x}px ${coord.y}px`, animationDuration: '4s' }}
                      />
                    )}

                    {/* Outer glow ring */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={dotRadius + 2.5}
                      fill={isActive ? metricColor : 'currentColor'}
                      fillOpacity={isActive ? 0.35 : 0.12}
                      stroke={isActive ? '#ffffff' : metricColor}
                      strokeWidth={isActive ? 1.5 : 1}
                      className={isActive ? '' : 'text-slate-900 dark:text-slate-100'}
                    />

                    {/* Core interactive dot */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={dotRadius}
                      fill={isActive ? '#ffffff' : metricColor}
                      filter={isActive ? 'url(#glowPoint)' : undefined}
                    />

                    {/* Guide line to regional label */}
                    <line
                      x1={coord.x}
                      y1={coord.y}
                      x2={coord.labelX}
                      y2={coord.y}
                      stroke="currentColor"
                      strokeWidth={isActive ? 1.4 : 0.85}
                      strokeDasharray={isActive ? 'none' : '2 2'}
                      className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}
                    />

                    {/* Region Short Name Tag & Investment badge in inversion mode */}
                    <text
                      x={coord.labelX + (coord.labelAnchor === 'right' ? 3 : -3)}
                      y={coord.y + 3}
                      textAnchor={coord.labelAnchor === 'right' ? 'start' : 'end'}
                      fill="currentColor"
                      fontSize={isActive ? "11" : "9.5"}
                      fontWeight={isActive ? "bold" : "600"}
                      fontFamily="system-ui"
                      className={`transition-all select-none ${
                        isActive
                          ? 'text-blue-600 dark:text-white font-bold'
                          : 'text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {metricMode === 'inversion'
                        ? `${region.shortName} ($${region.investmentUSD || 0}M)`
                        : metricMode === 'webmcp'
                        ? `${region.shortName} (${region.webmcpCount || 0} MCP)`
                        : metricMode === 'solicitudes'
                        ? (solicitudesDe(region).postulando + solicitudesDe(region).conectadas > 0
                            ? `${region.shortName} (${solicitudesDe(region).postulando + solicitudesDe(region).conectadas})`
                            : region.shortName)
                        : metricMode === 'universidades'
                        ? `${region.shortName} (${region.universitiesWithAI?.length || 0} Ues)`
                        : region.shortName}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
    </div>
  );
};
