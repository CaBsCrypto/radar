import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChileRegion, Organization, EcosystemEvent, MacroZone } from '../types';
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
  Bot
} from 'lucide-react';

export type SilhouetteMetricMode = 'webmcp' | 'hackathons' | 'startups' | 'universidades' | 'inversion' | 'talento';

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
}

// Coordinates mapped specifically to our 240x820 SVG viewport
interface RegionCoord {
  id: string;
  x: number;
  y: number;
  labelAnchor: 'left' | 'right';
  labelOffset: { x: number; y: number };
}

const REGION_COORDS: Record<string, RegionCoord> = {
  arica: { id: 'arica', x: 112, y: 32, labelAnchor: 'right', labelOffset: { x: 18, y: -2 } },
  tarapaca: { id: 'tarapaca', x: 108, y: 72, labelAnchor: 'right', labelOffset: { x: 18, y: -2 } },
  antofagasta: { id: 'antofagasta', x: 104, y: 130, labelAnchor: 'right', labelOffset: { x: 20, y: -2 } },
  atacama: { id: 'atacama', x: 98, y: 195, labelAnchor: 'right', labelOffset: { x: 20, y: -2 } },
  coquimbo: { id: 'coquimbo', x: 92, y: 252, labelAnchor: 'right', labelOffset: { x: 20, y: -2 } },
  valparaiso: { id: 'valparaiso', x: 84, y: 302, labelAnchor: 'left', labelOffset: { x: -18, y: -6 } },
  metropolitana: { id: 'metropolitana', x: 106, y: 322, labelAnchor: 'right', labelOffset: { x: 20, y: 0 } },
  ohiggins: { id: 'ohiggins', x: 90, y: 350, labelAnchor: 'left', labelOffset: { x: -18, y: 0 } },
  maule: { id: 'maule', x: 86, y: 384, labelAnchor: 'left', labelOffset: { x: -18, y: 0 } },
  nuble: { id: 'nuble', x: 83, y: 418, labelAnchor: 'right', labelOffset: { x: 18, y: 0 } },
  biobio: { id: 'biobio', x: 79, y: 446, labelAnchor: 'left', labelOffset: { x: -18, y: 0 } },
  araucania: { id: 'araucania', x: 77, y: 486, labelAnchor: 'right', labelOffset: { x: 18, y: 0 } },
  losrios: { id: 'losrios', x: 74, y: 526, labelAnchor: 'left', labelOffset: { x: -18, y: 0 } },
  loslagos: { id: 'loslagos', x: 72, y: 572, labelAnchor: 'right', labelOffset: { x: 20, y: 0 } },
  aysen: { id: 'aysen', x: 76, y: 654, labelAnchor: 'right', labelOffset: { x: 20, y: 0 } },
  magallanes: { id: 'magallanes', x: 114, y: 752, labelAnchor: 'left', labelOffset: { x: -18, y: 6 } }
};

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
  onNavigateToWebMcp
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
  const getMetricColor = (region: ChileRegion) => {
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
              Silueta de Chile
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
              16 Regiones
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
            Toca una región para ver su ficha
          </p>
        </div>

        {/* Minimalist Segmented Control for Metrics: WebMCP (1º), Eventos (2º), Startups, Universidades */}
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
      </div>

      {/* Main Map Interactive Canvas */}
      <div className="flex flex-col items-center relative select-none py-0.5">
          <div className="w-full flex items-center justify-between text-[9.5px] text-slate-500 dark:text-slate-400 mb-0.5 px-1">
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
              <Compass className="w-2.5 h-2.5 text-blue-500" />
              <span>Silueta Nacional • Toca una región para inspeccionar</span>
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
                {/* Gradient for Chile landmass */}
                <linearGradient id="chileLandGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#60a5fa" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0.85" />
                </linearGradient>

                <filter id="glowPoint" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#60a5fa" floodOpacity="0.8" />
                </filter>
              </defs>

              {/* Decorative Pacific Ocean Label on the West (hidden on mobile to prevent rotated text clutter) */}
              <text
                x="24"
                y="380"
                transform="rotate(-90 24,380)"
                fill="currentColor"
                fontSize="9"
                fontFamily="system-ui"
                letterSpacing="4"
                className="select-none font-semibold uppercase opacity-30 text-slate-500 dark:text-slate-400 hidden sm:block"
              >
                OCÉANO PACÍFICO
              </text>

              {/* Decorative Cordillera de los Andes on the East (hidden on mobile to prevent rotated text clutter) */}
              <text
                x="200"
                y="260"
                transform="rotate(90 200,260)"
                fill="currentColor"
                fontSize="9"
                fontFamily="system-ui"
                letterSpacing="4"
                className="select-none font-semibold uppercase opacity-30 text-slate-500 dark:text-slate-400 hidden sm:block"
              >
                CORDILLERA DE LOS ANDES
              </text>

              {/* Chile Main Continental Landmass Body Path */}
              <path
                d={`
                  M 102,15 
                  C 107,15 116,19 122,25 
                  C 127,31 129,42 127,52 
                  C 125,60 120,68 120,78 
                  C 120,86 126,98 127,110 
                  C 128,122 133,138 132,152 
                  C 131,164 125,178 124,192 
                  C 123,206 122,220 121,235 
                  C 120,250 118,265 117,280 
                  C 116,295 115,310 115,325 
                  C 115,340 113,355 111,370 
                  C 109,385 107,400 106,415 
                  C 105,430 104,445 102,460 
                  C 100,475 98,490 97,505 
                  C 96,518 95,530 94,545 
                  C 93,556 90,568 91,580 
                  C 92,592 98,605 97,618 
                  C 96,630 89,642 90,655 
                  C 91,668 98,680 97,692 
                  C 96,704 90,715 92,725 
                  C 94,735 102,745 112,752 
                  C 122,758 135,760 148,762 
                  C 158,764 168,768 165,776 
                  C 162,782 152,786 142,788 
                  C 132,790 120,792 112,785 
                  C 104,778 98,768 92,760 
                  C 86,752 78,745 74,735 
                  C 70,725 66,715 67,705 
                  C 68,695 73,685 71,675 
                  C 69,665 64,655 64,645 
                  C 64,635 68,625 66,615 
                  C 64,605 58,595 59,585 
                  C 60,575 66,565 65,555 
                  C 64,545 60,535 62,525 
                  C 64,515 70,505 70,490 
                  C 70,475 68,460 69,445 
                  C 70,430 73,415 74,400 
                  C 75,385 76,370 77,355 
                  C 78,340 79,325 80,310 
                  C 81,295 82,280 84,265 
                  C 86,250 87,235 88,220 
                  C 89,205 91,190 91,175 
                  C 91,160 88,145 87,130 
                  C 86,118 84,105 85,92 
                  C 86,80 90,68 91,55 
                  C 92,42 94,30 96,20 
                  Z
                `}
                fill="url(#chileLandGradient)"
                stroke="#60a5fa"
                strokeWidth="1.2"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />

              {/* Archipiélagos y Fiordos del Sur y Austral */}
              {/* Isla Grande de Chiloé */}
              <path
                d="M 60,530 C 56,535 55,548 57,558 C 59,566 65,572 67,565 C 69,555 68,542 65,534 Z"
                fill="#60a5fa"
                stroke="#93c5fd"
                strokeWidth="0.8"
              />
              <circle cx="61" cy="590" r="3.5" fill="#60a5fa" />
              <circle cx="65" cy="600" r="4" fill="#60a5fa" />
              <circle cx="58" cy="610" r="3" fill="#60a5fa" />
              <circle cx="64" cy="622" r="3.5" fill="#60a5fa" />
              <circle cx="59" cy="635" r="4" fill="#60a5fa" />
              
              {/* Península de Taitao */}
              <path
                d="M 58,642 C 53,648 52,656 55,662 C 58,666 66,664 68,658 Z"
                fill="#60a5fa"
                stroke="#93c5fd"
                strokeWidth="0.8"
              />

              <circle cx="62" cy="676" r="3.2" fill="#60a5fa" />
              <circle cx="66" cy="690" r="3.5" fill="#60a5fa" />
              <circle cx="61" cy="704" r="3.2" fill="#60a5fa" />
              <circle cx="68" cy="718" r="3.5" fill="#60a5fa" />

              <path
                d="M 63,680 C 60,690 62,705 65,715 C 68,710 69,695 67,682 Z"
                fill="#60a5fa"
              />

              {/* Tierra del Fuego */}
              <path
                d="M 130,768 C 138,768 152,772 158,776 C 164,780 156,792 146,794 C 138,795 132,788 128,780 Z"
                fill="#3b82f6"
                stroke="#93c5fd"
                strokeWidth="0.8"
              />

              <circle cx="152" cy="804" r="2.8" fill="#3b82f6" />
              <circle cx="145" cy="808" r="2.2" fill="#3b82f6" />
              <circle cx="158" cy="806" r="2.2" fill="#3b82f6" />

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
                if (metricMode === 'startups') {
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
                      x2={coord.x + coord.labelOffset.x}
                      y2={coord.y + coord.labelOffset.y}
                      stroke="currentColor"
                      strokeWidth={isActive ? 1.4 : 0.85}
                      strokeDasharray={isActive ? 'none' : '2 2'}
                      className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-600'}
                    />

                    {/* Region Short Name Tag & Investment badge in inversion mode */}
                    <text
                      x={coord.x + coord.labelOffset.x + (coord.labelAnchor === 'right' ? 4 : -4)}
                      y={coord.y + coord.labelOffset.y + 3}
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
