import React, { useState, useEffect, useRef } from 'react';
import { CHILE_REGIONS, EVENTOS_VERIFICADOS } from './data/datosBase';
import { Organization, EcosystemEvent, McpSolicitud } from './types';
import { conEstadoActual, porFecha } from './lib/eventos';
import { Navbar, TabType } from './components/Navbar';
import { MapaRegiones, type CapaMapa } from './components/MapaRegiones';
import { Cotizador } from './components/Cotizador';
import { subscribeSolicitudes } from './services/cotizadorService';
import { registrarHerramientasWebMcp } from './lib/webmcp';
import { EventsHistory } from './components/EventsHistory';
import { Inicio } from './components/Inicio';
import { AddEntityModal } from './components/AddEntityModal';
import { BrochureModal } from './components/BrochureModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import {
  enviarPropuestaPublica,
  subscribeOrganizations,
  subscribeEvents
} from './services/firestoreService';
import { 
  MapPin, 
  Calendar, 
  Sparkles,
  ArrowUp,
  CheckCircle2,
  X,
  Command,
  Mail,
  Calculator,
  Home
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('admin')) {
        return 'admin';
      }
      if (path.includes('/cotizador') || hash.includes('cotizador')) {
        return 'cotizador';
      }
      if (path.includes('/eventos') || hash.includes('eventos')) {
        return 'eventos';
      }
      if (path.includes('/mapa') || hash.includes('mapa')) {
        return 'mapa';
      }
    }
    // '/' y el antiguo '/webmcp' abren el Inicio
    return 'inicio';
  });
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tipoPropuesta, setTipoPropuesta] = useState<'organizacion' | 'evento'>('organizacion');
  const [isBrochureOpen, setIsBrochureOpen] = useState(false);
  const [highlightedCompanyId, setHighlightedCompanyId] = useState<string | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);

  // Cotizador WebMCP: solicitudes (alimentan la capa "Solicitudes" del mapa) y herramientas WebMCP
  const [solicitudes, setSolicitudes] = useState<McpSolicitud[]>([]);
  const solicitudesRef = useRef<McpSolicitud[]>([]);
  const [herramientasWebMcp, setHerramientasWebMcp] = useState(0);
  // null: el mapa elige la capa con más datos
  const [metricaMapa, setMetricaMapa] = useState<CapaMapa | null>(null);
  // Vínculo mapa ↔ cotizador: región que se abre al llegar a cada vista
  const [regionEnMapa, setRegionEnMapa] = useState<string | null>(null);
  const [regionEnCotizador, setRegionEnCotizador] = useState<string>('');
  const alSeleccionarRegion = React.useCallback((id: string | null) => {
    setSelectedRegionId(id);
    if (!id) setRegionEnMapa(null);
  }, []);

  useEffect(() => {
    const baja = subscribeSolicitudes(
      (lista) => { solicitudesRef.current = lista; setSolicitudes(lista); },
      (err) => console.warn('Solicitudes MCP no disponibles (¿reglas de Firestore publicadas?):', err)
    );
    return () => baja();
  }, []);

  useEffect(() => {
    registrarHerramientasWebMcp({
      regiones: CHILE_REGIONS,
      getSolicitudes: () => solicitudesRef.current,
      irAlCotizador: () => setActiveTab('cotizador'),
    }).then(setHerramientasWebMcp);
  }, []);

  // Theme System: Fixed Light Mode
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      localStorage.setItem('chile_ai_theme', 'light');
    } catch {
      // ignore
    }
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');
  }, []);

  // Global Toast System
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'copied' } | null>(null);
  const showToast = (message: string, type: 'success' | 'info' | 'copied' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  // Scroll to Top state
  const [showScrollTop, setShowScrollTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const navigateTabAndScrollTop = (tab: TabType) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  /** Navegación desde menús: el mapa abre en la capa con más datos. */
  const navegarMenu = (tab: TabType) => {
    if (tab === 'mapa') { setMetricaMapa(null); setRegionEnMapa(null); }
    navigateTabAndScrollTop(tab);
  };

  // Scroll to top instantly whenever active tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeTab]);

  // Keyboard navigation shortcuts: numbers 1-7 switch tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      
      const keyMap: Record<string, TabType> = {
        '1': 'inicio',
        '2': 'mapa',
        '3': 'cotizador',
        '4': 'eventos',
        '5': 'admin'
      };

      if (keyMap[e.key]) {
        setActiveTab(keyMap[e.key]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen for browser navigation (popstate & hashchange) for /admin, /eventos, /cotizador, /mapa
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path.includes('/admin') || hash.includes('admin')) {
        setActiveTab('admin');
      } else if (path.includes('/eventos') || hash.includes('eventos')) {
        setActiveTab('eventos');
      } else if (path.includes('/cotizador') || hash.includes('cotizador')) {
        setActiveTab('cotizador');
      } else if (path.includes('/mapa') || hash.includes('mapa')) {
        setActiveTab('mapa');
      } else {
        setActiveTab('inicio');
      }
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Synchronize browser URL path when tab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const targetPath = activeTab === 'inicio' ? '/' : `/${activeTab}`;
      if (window.location.pathname !== targetPath) {
        // /webmcp ya no existe: se reemplaza en el historial para que "atrás" no vuelva a él
        const reemplazar = window.location.pathname.toLowerCase().startsWith('/webmcp');
        window.history[reemplazar ? 'replaceState' : 'pushState'](null, '', targetPath + window.location.search);
      }
    }
  }, [activeTab]);

  // Datos en tiempo real desde Firestore. El directorio parte vacío y lo administra el panel /admin.
  // Los eventos verificados de datosBase.ts se muestran siempre, salvo que el admin los edite u oculte.
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [eventosRemotos, setEventosRemotos] = useState<EcosystemEvent[]>([]);

  useEffect(() => {
    const bajaOrgs = subscribeOrganizations(
      (remotas) => setOrganizations(remotas.filter(o => o && o.id && o.name)),
      (err) => console.warn('Directorio no disponible:', err)
    );
    const bajaEventos = subscribeEvents(
      (remotos) => setEventosRemotos(remotos.filter(e => e && e.id && e.title)),
      (err) => console.warn('Eventos de Firestore no disponibles:', err)
    );
    return () => { bajaOrgs(); bajaEventos(); };
  }, []);

  const events = React.useMemo(() => {
    const porId = new Map<string, EcosystemEvent>();
    EVENTOS_VERIFICADOS.forEach(e => porId.set(e.id, e));
    eventosRemotos.forEach(e => porId.set(e.id, e)); // un documento con el mismo id reemplaza al verificado
    return [...porId.values()].filter(e => !e.oculto).map(e => conEstadoActual(e)).sort(porFecha);
  }, [eventosRemotos]);

  // Selected region object for quick banner
  const selectedRegion = CHILE_REGIONS.find(r => r.id === selectedRegionId);

  // Lo que envía el público queda pendiente hasta que un administrador lo aprueba en /admin.
  // Si falla, el error llega al formulario, que lo muestra sin cerrar.
  const handleAddOrganization = async (newOrg: Organization) => {
    await enviarPropuestaPublica({ tipo: 'organizacion', datos: { ...newOrg, verified: false } });
  };

  const handleAddEvent = async (newEvent: EcosystemEvent) => {
    await enviarPropuestaPublica({ tipo: 'evento', datos: newEvent });
  };

  const abrirPropuesta = (tipo: 'organizacion' | 'evento' = 'organizacion') => {
    setTipoPropuesta(tipo);
    setIsAddModalOpen(true);
  };

  const handleNavigateToDirectoryWithRegion = (regionId: string) => {
    setSelectedRegionId(regionId);
    setActiveTab('mapa');
  };

  const handleSelectCompanyFromTool = (companyName: string) => {
    const found = organizations.find(o => o.name.toLowerCase() === companyName.toLowerCase());
    if (found) {
      setHighlightedCompanyId(found.id);
      if (found.regionId) setSelectedRegionId(found.regionId);
    }
    setActiveTab('mapa');
  };

  const handleSelectCompanyFromSearch = (org: Organization) => {
    setHighlightedCompanyId(org.id);
    if (org.regionId) setSelectedRegionId(org.regionId);
    setActiveTab('mapa');
  };

  const handleSelectEventFromSearch = (event: EcosystemEvent) => {
    setHighlightedEventId(event.id);
    setActiveTab('eventos');
  };


  return (
    <div className={`min-h-screen flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200 ${
      theme === 'light' 
        ? 'theme-light bg-slate-50 text-slate-900' 
        : 'theme-dark bg-slate-950 text-slate-100'
    }`}>
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={navegarMenu}
        onOpenAddModal={() => abrirPropuesta()}
        selectedRegionName={selectedRegion?.shortName}
        onResetRegionFilter={() => setSelectedRegionId(null)}
        organizations={organizations}
        events={events}
        onSelectCompany={handleSelectCompanyFromSearch}
        onSelectEvent={handleSelectEventFromSearch}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-4 pb-20 lg:pb-6">
        {activeTab === 'inicio' && (
          <Inicio
            regions={CHILE_REGIONS}
            organizations={organizations}
            events={events}
            solicitudes={solicitudes}
            herramientasWebMcp={herramientasWebMcp}
            onCotizar={() => navigateTabAndScrollTop('cotizador')}
            onVerMapa={(capa) => { setMetricaMapa(capa || null); setRegionEnMapa(null); navigateTabAndScrollTop('mapa'); }}
            onVerEventos={() => navigateTabAndScrollTop('eventos')}
          />
        )}

        {activeTab === 'mapa' && (
          <MapaRegiones
            regions={CHILE_REGIONS}
            organizations={organizations}
            events={events}
            solicitudes={solicitudes}
            capaInicial={metricaMapa}
            regionInicial={regionEnMapa}
            onSeleccionRegion={alSeleccionarRegion}
            onCotizarEnRegion={(id) => { setRegionEnCotizador(id); navigateTabAndScrollTop('cotizador'); }}
            onAgregar={abrirPropuesta}
          />
        )}

        {activeTab === 'cotizador' && (
          <Cotizador
            regions={CHILE_REGIONS}
            solicitudes={solicitudes}
            herramientasWebMcp={herramientasWebMcp}
            regionInicial={regionEnCotizador}
            onVerMapa={(regionId) => { setMetricaMapa('solicitudes'); setRegionEnMapa(regionId || null); navigateTabAndScrollTop('mapa'); }}
            onNotify={(msg) => showToast(msg, 'info')}
          />
        )}

        {activeTab === 'eventos' && (
          <EventsHistory
            events={events}
            regions={CHILE_REGIONS}
            onOpenAddModal={() => abrirPropuesta('evento')}
            highlightedEventId={highlightedEventId}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            onNotify={(msg, typ) => showToast(msg, typ || 'success')}
          />
        )}
      </main>

      {/* Floating Scroll to Top & Quick Action Button */}
      <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-30 flex flex-col items-end gap-2 pointer-events-none">
        {showScrollTop && (
          <button
            id="btn-scroll-to-top"
            onClick={scrollToTop}
            title="Volver arriba (Scroll to top)"
            className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-blue-600 text-slate-300 hover:text-white border border-slate-700/80 shadow-xl backdrop-blur transition-all pointer-events-auto cursor-pointer hover:scale-110 active:scale-95"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Toast Notification */}
      {toast && (
        <div 
          id="global-toast-notification"
          className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-blue-500/40 text-white text-xs font-semibold shadow-2xl shadow-blue-500/20 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation Bar (Inicio, Mapa, Cotizar, Eventos, Postular) */}
      <nav 
        id="mobile-bottom-nav"
        aria-label="Navegación móvil inferior"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/90 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] px-2 sm:px-4 shadow-[0_-4px_20px_rgba(0,0,0,0.12)] transition-colors"
      >
        <div className="flex items-center justify-around gap-1 sm:gap-2 max-w-md mx-auto">
          <button
            id="mobile-tab-inicio"
            type="button"
            onClick={() => navigateTabAndScrollTop('inicio')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl transition-all cursor-pointer min-h-[48px] active:scale-95 touch-manipulation ${
              activeTab === 'inicio'
                ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <Home className={`w-4 h-4 mb-0.5 transition-transform ${activeTab === 'inicio' ? 'scale-110 text-blue-600 dark:text-blue-400' : ''}`} />
            <span className="text-[11px] font-semibold leading-tight">Inicio</span>
          </button>

          <button
            id="mobile-tab-mapa"
            type="button"
            onClick={() => navegarMenu('mapa')}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl transition-all cursor-pointer min-h-[48px] active:scale-95 touch-manipulation ${
              activeTab === 'mapa' 
                ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <MapPin className={`w-4 h-4 mb-0.5 transition-transform ${activeTab === 'mapa' ? 'scale-110 text-blue-600 dark:text-blue-400' : ''}`} />
            <span className="text-[11px] font-semibold leading-tight">Mapa</span>
          </button>

          <button
            id="mobile-tab-cotizador"
            type="button"
            onClick={() => navigateTabAndScrollTop('cotizador')}
            className={`flex-1 relative flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl transition-all cursor-pointer min-h-[48px] active:scale-95 touch-manipulation ${
              activeTab === 'cotizador'
                ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <Calculator className={`w-4 h-4 mb-0.5 transition-transform ${activeTab === 'cotizador' ? 'scale-110 text-blue-600 dark:text-blue-400' : ''}`} />
            <span className="text-[11px] font-semibold leading-tight">Cotizar</span>
          </button>

          <button
            id="mobile-tab-eventos"
            type="button"
            onClick={() => navigateTabAndScrollTop('eventos')}
            className={`flex-1 relative flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl transition-all cursor-pointer min-h-[48px] active:scale-95 touch-manipulation ${
              activeTab === 'eventos' 
                ? 'bg-blue-50/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold shadow-xs' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <Calendar className={`w-4 h-4 mb-0.5 transition-transform ${activeTab === 'eventos' ? 'scale-110 text-blue-600 dark:text-blue-400' : ''}`} />
            <span className="text-[11px] font-semibold leading-tight">Eventos</span>
            {events.some(e => e.isRegistrationUrgent || (e.daysUntilDeadline !== undefined && e.daysUntilDeadline <= 7)) && (
              <span className="absolute top-1.5 right-4 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
            )}
          </button>

          <button
            id="mobile-tab-add"
            type="button"
            onClick={() => {
              abrirPropuesta();
              scrollToTop();
            }}
            className="flex-1 flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 transition-all cursor-pointer min-h-[48px] active:scale-95 touch-manipulation"
          >
            <Sparkles className="w-4 h-4 mb-0.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-semibold leading-tight">Postular</span>
          </button>
        </div>
      </nav>

      {/* Global Structured Footer */}
      <Footer
        activeTab={activeTab}
        setActiveTab={navegarMenu}
        regions={CHILE_REGIONS}
        events={events}
        onOpenAddModal={() => {
          abrirPropuesta();
          scrollToTop();
        }}
        onNotify={(message, type) => showToast(message, type || 'success')}
        theme={theme}
        onOpenBrochure={() => setIsBrochureOpen(true)}
      />

      {/* Add Entity Modal */}
      <AddEntityModal
        isOpen={isAddModalOpen}
        tipoInicial={tipoPropuesta}
        onClose={() => setIsAddModalOpen(false)}
        regions={CHILE_REGIONS}
        onAddOrganization={handleAddOrganization}
        onAddEvent={handleAddEvent}
      />

      {/* Executive Brochure Modal */}
      <BrochureModal
        isOpen={isBrochureOpen}
        onClose={() => setIsBrochureOpen(false)}
        onNavigateToTab={(tab) => {
          navegarMenu(tab);
          setIsBrochureOpen(false);
        }}
        onOpenAddModal={() => {
          setIsBrochureOpen(false);
          setIsAddModalOpen(true);
        }}
      />
    </div>
  );
}
