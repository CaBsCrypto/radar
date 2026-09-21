import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Briefcase, 
  Building2, 
  Cpu, 
  Calendar, 
  GraduationCap, 
  HelpCircle, 
  Sparkles,
  TrendingUp,
  Bell,
  Flame,
  CheckCheck,
  ChevronRight,
  ChevronDown,
  Plus,
  X,
  Bot,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { Organization, EcosystemEvent, TechTool } from '../types';

export type TabType = 'mapa' | 'webmcp' | 'inversion' | 'directorio' | 'herramientas' | 'talento' | 'eventos' | 'academia' | 'estrategia' | 'admin';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenAddModal: () => void;
  onOpenBrochure?: () => void;
  selectedRegionName?: string;
  onResetRegionFilter?: () => void;
  organizations: Organization[];
  events: EcosystemEvent[];
  tools: TechTool[];
  onSelectCompany: (org: Organization) => void;
  onSelectEvent: (event: EcosystemEvent) => void;
  onSelectTool: (tool: TechTool) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenBrochure,
  selectedRegionName,
  onResetRegionFilter,
  organizations,
  events,
  tools,
  onSelectCompany,
  onSelectEvent,
  onSelectTool,
  theme,
  setTheme
}) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  // Local notification state tracking read events in localStorage
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chile_ai_read_event_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calculate upcoming hackathons and events with imminent deadlines
  const urgentEvents = events.filter(e => {
    const isUpcoming = e.status === 'Próximo' || e.status === 'En Curso';
    if (!isUpcoming) return false;
    return e.isRegistrationUrgent || (e.daysUntilDeadline !== undefined && e.daysUntilDeadline <= 14) || e.type === 'Hackathon';
  });

  const unreadUrgentEvents = urgentEvents.filter(e => !readNotificationIds.includes(e.id));
  const unreadCount = unreadUrgentEvents.length;

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
      if (resourcesRef.current && !resourcesRef.current.contains(e.target as Node)) {
        setIsResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    const allUrgentIds = urgentEvents.map(e => e.id);
    const updated = Array.from(new Set([...readNotificationIds, ...allUrgentIds]));
    setReadNotificationIds(updated);
    try {
      localStorage.setItem('chile_ai_read_event_notifications', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleNotificationClick = (event: EcosystemEvent) => {
    if (!readNotificationIds.includes(event.id)) {
      const updated = [...readNotificationIds, event.id];
      setReadNotificationIds(updated);
      try {
        localStorage.setItem('chile_ai_read_event_notifications', JSON.stringify(updated));
      } catch {
        // ignore
      }
    }
    setIsNotificationOpen(false);
    onSelectEvent(event);
  };

  interface NavTabItem {
    id: TabType;
    label: string;
    icon: any;
    desc?: string;
    badge?: string;
    badgeCount?: number;
    hasUnread?: boolean;
  }

  // Primary navigation tabs
  const primaryTabs: NavTabItem[] = [
    { id: 'mapa', label: 'Mapa', icon: MapPin },
    { 
      id: 'eventos', 
      label: 'Eventos', 
      icon: Calendar,
      badgeCount: unreadCount > 0 ? unreadCount : undefined,
      hasUnread: unreadCount > 0
    },
    {
      id: 'webmcp',
      label: 'Empresas & WebMCP',
      icon: Bot,
      badge: 'Negocios'
    }
  ];

  // Secondary resources (currently empty as requested)
  const resourceTabs: NavTabItem[] = [];

  const isResourceActive = false;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-200">
      {/* Top Ticker: Ecosystem Live Indicators (Hidden on mobile to prioritize viewport for map) */}
      <div className="hidden sm:block bg-slate-50 dark:bg-slate-900/90 border-b border-slate-100 dark:border-slate-800/80 px-3 sm:px-6 py-1 text-xs transition-colors">
        <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto w-full overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Chile #1 IA LatAm (ILIA)
            </span>
          </div>

          {/* Clean Ecosystem Status */}
          <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">
            <span>16 Regiones Activas</span>
            <span>•</span>
            <span>Directorio Geográfico & Agenda IA 2026</span>
          </div>

          {/* Active Region Filter Badge */}
          {selectedRegionName ? (
            <div className="ml-auto flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/90 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/40 text-[11px] text-blue-900 dark:text-slate-200 flex-shrink-0 shadow-xs">
              <MapPin className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span className="text-slate-500 dark:text-slate-400 font-normal">Filtro:</span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">{selectedRegionName}</span>
              {onResetRegionFilter && (
                <button 
                  onClick={onResetRegionFilter}
                  title="Quitar filtro regional"
                  className="ml-1 p-0.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 hidden sm:inline font-mono">
              v2026.1
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-16 gap-2 sm:gap-4">
          
          {/* 1. Left: Distinctive Brand Identity */}
          <div 
            onClick={() => setActiveTab('mapa')}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group select-none flex-shrink-0"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shadow-xs">
              AI
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                  CHILE <span className="text-blue-600 dark:text-blue-400">RADAR</span>
                </span>
                <span className="text-[9px] font-mono font-medium px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  CL
                </span>
              </div>
            </div>
          </div>

          {/* 2. Center: Clean Navigation Bar (Primary Hubs + Recursos Dropdown) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex-shrink-0">
            {primaryTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/25'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 rounded font-semibold border border-emerald-500/20">
                      {tab.badge}
                    </span>
                  )}
                  {tab.badgeCount !== undefined && tab.badgeCount > 0 && (
                    <span
                      id={`tab-badge-${tab.id}`}
                      className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse"
                    >
                      {tab.badgeCount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Recursos Dropdown (if any resources exist) */}
            {resourceTabs.length > 0 && (
              <div className="relative" ref={resourcesRef}>
                <button
                  id="nav-tab-recursos"
                  onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                  className={`relative flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isResourceActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isResourcesOpen
                      ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/80 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>Recursos</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isResourcesOpen ? 'rotate-180' : ''}`} />
                </button>

                {isResourcesOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Herramientas & Conocimiento
                    </div>
                    {resourceTabs.map((item) => {
                      const Icon = item.icon;
                      const isItemActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsResourcesOpen(false);
                          }}
                          className={`w-full flex items-start gap-2.5 p-2 rounded-xl text-left transition-colors cursor-pointer ${
                            isItemActive
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 mt-0.5">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold">{item.label}</div>
                            <div className="text-[10px] text-slate-500 font-normal leading-tight mt-0.5">{item.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* 3. Right: Notifications + Brochure + CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
            {/* Notifications Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                id="nav-notification-bell"
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className={`relative p-2 rounded-xl border transition-all cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center shadow-xs ${
                  isNotificationOpen
                    ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-amber-400 border-blue-300 dark:border-amber-500/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Convocatorias & Hackathons de IA"
                aria-label="Notificaciones de eventos"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse shadow-md">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Hackathons & Eventos
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold px-1.5 py-0.2 rounded border border-rose-200 dark:border-rose-500/30">
                          {unreadCount} nuevas
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-slate-500 hover:text-blue-600 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Marcar leídas</span>
                      </button>
                    )}
                  </div>

                  {/* List */}
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {urgentEvents.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No hay convocatorias urgentes en este momento.
                      </div>
                    ) : (
                      urgentEvents.map((evt) => {
                        const isUnread = !readNotificationIds.includes(evt.id);
                        return (
                          <div
                            key={evt.id}
                            onClick={() => handleNotificationClick(evt)}
                            className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-all ${
                              isUnread ? 'bg-amber-50/50 dark:bg-amber-500/5 border-l-2 border-amber-500' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-200 line-clamp-1">
                                {evt.title}
                              </span>
                              {evt.daysUntilDeadline !== undefined && evt.daysUntilDeadline <= 7 ? (
                                <span className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30">
                                  {evt.daysUntilDeadline === 0 ? '¡Hoy!' : `Cierra en ${evt.daysUntilDeadline}d`}
                                </span>
                              ) : (
                                <span className="flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                  Abierta
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {evt.notificationText || `Fecha: ${evt.dateStr}. Lugar: ${evt.locationName}`}
                            </p>

                            <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-slate-500">
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {evt.prizePool ? `Premio: ${evt.prizePool}` : evt.organizer}
                              </span>
                              <span className="text-blue-600 dark:text-blue-400 flex items-center gap-0.5 font-bold hover:underline">
                                Ver detalles <ChevronRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
                    <button
                      onClick={() => {
                        setIsNotificationOpen(false);
                        setActiveTab('eventos');
                      }}
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-bold w-full py-1 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Ir a la Agenda Completa</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Panel Quick Access */}
            <button
              id="nav-btn-admin"
              type="button"
              onClick={() => setActiveTab('admin')}
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer shadow-xs min-h-[36px] ${
                activeTab === 'admin'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/80'
              }`}
              title="Panel Administrativo (cabscryptocontacto@gmail.com)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Admin</span>
            </button>

            {/* Brochure Executive Guide Button - Accessible on both mobile and desktop */}
            {onOpenBrochure && (
              <button
                id="nav-btn-brochure"
                type="button"
                onClick={onOpenBrochure}
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-all cursor-pointer shadow-xs min-h-[36px]"
                title="Abrir brochure ejecutivo de módulos"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Brochure</span>
              </button>
            )}

            {/* Primary Action Button: + Publicar */}
            <button
              id="cta-add-entity"
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Sumar Entidad</span>
              <span className="sm:hidden">Sumar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
