import React, { useState, useEffect } from 'react';
import { EcosystemEvent, ChileRegion } from '../types';
import { inscripcionCerrada } from '../lib/eventos';
import { 
  Calendar, 
  Trophy, 
  MapPin, 
  Users, 
  Award, 
  ExternalLink, 
  Sparkles, 
  CheckCircle, 
  Plus, 
  Radio, 
  Tag,
  Bell,
  BellRing,
  Flame,
  Clock,
  Bookmark,
  BookmarkCheck,
  Check,
  CheckCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Share2
} from 'lucide-react';

interface EventsHistoryProps {
  events: EcosystemEvent[];
  regions: ChileRegion[];
  onOpenAddModal: () => void;
  highlightedEventId?: string | null;
}

export const EventsHistory: React.FC<EventsHistoryProps> = ({
  events,
  regions,
  onOpenAddModal,
  highlightedEventId
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('Todos');
  const [isAlertsPanelOpen, setIsAlertsPanelOpen] = useState(true);
  const [filterOnlyUrgent, setFilterOnlyUrgent] = useState(false);
  const [filterOnlyBookmarked, setFilterOnlyBookmarked] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local storage: read notifications
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chile_ai_read_event_notifications');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Local storage: bookmarked reminders
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('chile_ai_event_reminders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const toggleBookmark = (eventId: string, eventTitle: string) => {
    let updated: string[];
    const isBookmarked = bookmarkedIds.includes(eventId);
    if (isBookmarked) {
      updated = bookmarkedIds.filter(id => id !== eventId);
      showToast(`Recordatorio eliminado: "${eventTitle.slice(0, 30)}..."`);
    } else {
      updated = [...bookmarkedIds, eventId];
      showToast(`⭐ Recordatorio guardado localmente: "${eventTitle.slice(0, 30)}..."`);
    }
    setBookmarkedIds(updated);
    try {
      localStorage.setItem('chile_ai_event_reminders', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const markNotificationAsRead = (eventId: string) => {
    if (!readNotificationIds.includes(eventId)) {
      const updated = [...readNotificationIds, eventId];
      setReadNotificationIds(updated);
      try {
        localStorage.setItem('chile_ai_read_event_notifications', JSON.stringify(updated));
      } catch {
        // ignore
      }
      showToast('Notificación marcada como leída');
    }
  };

  const markAllNotificationsAsRead = () => {
    const allUrgentIds = urgentEvents.map(e => e.id);
    const updated = Array.from(new Set([...readNotificationIds, ...allUrgentIds]));
    setReadNotificationIds(updated);
    try {
      localStorage.setItem('chile_ai_read_event_notifications', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Todas las alertas marcadas como leídas');
  };

  // Browser notification trigger
  const requestBrowserNotification = async (event?: EcosystemEvent) => {
    if (!('Notification' in window)) {
      showToast('Tu navegador no soporta notificaciones de escritorio, pero tus recordatorios locales están activos.');
      return;
    }

    if (Notification.permission === 'granted') {
      const title = event ? `Chile AI Radar: ${event.title}` : 'Chile AI Radar: Alerta de Hackathons';
      const body = event?.notificationText || 'Tienes convocatorias de IA en Chile con fecha límite de registro cercana.';
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
        showToast('¡Aviso enviado a tu escritorio con éxito!');
      } catch {
        showToast('Aviso registrado en tu navegador local.');
      }
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        showToast('¡Notificaciones del navegador activadas con éxito!');
      } else {
        showToast('Permiso declinado. Los avisos seguirán visibles localmente en esta pestaña.');
      }
    } else {
      showToast('Las notificaciones del navegador están bloqueadas. Los avisos seguirán activos aquí.');
    }
  };

  // Handle incoming highlighted event from global search
  useEffect(() => {
    if (highlightedEventId) {
      const found = events.find(e => e.id === highlightedEventId);
      if (found) {
        if (found.status === 'Finalizado') {
          setActiveTab('past');
        } else {
          setActiveTab('upcoming');
        }
        setSelectedTypeFilter('Todos');
        setFilterOnlyUrgent(false);
        setFilterOnlyBookmarked(false);
        setTimeout(() => {
          const el = document.getElementById(`event-card-${highlightedEventId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 150);
      }
    }
  }, [highlightedEventId, events]);

  const regionNameMap: Record<string, string> = {};
  regions.forEach(r => {
    regionNameMap[r.id] = r.shortName;
  });

  const upcomingEvents = events.filter(e => e.status === 'Próximo' || e.status === 'En Curso');
  const pastEvents = events.filter(e => e.status === 'Finalizado');

  // Urgent events: upcoming hackathons with imminent deadlines or flagged
  const urgentEvents = upcomingEvents.filter(e => {
    return e.isRegistrationUrgent || (e.daysUntilDeadline !== undefined && e.daysUntilDeadline <= 14);
  });

  const unreadUrgentEvents = urgentEvents.filter(e => !readNotificationIds.includes(e.id));

  // Current list filtering
  const currentList = activeTab === 'upcoming' ? upcomingEvents : pastEvents;
  const filteredList = currentList.filter(e => {
    if (filterOnlyUrgent && activeTab === 'upcoming') {
      const isUrgent = e.isRegistrationUrgent || (e.daysUntilDeadline !== undefined && e.daysUntilDeadline <= 14);
      if (!isUrgent) return false;
    }
    if (filterOnlyBookmarked) {
      if (!bookmarkedIds.includes(e.id)) return false;
    }
    if (selectedTypeFilter === 'Todos') return true;
    return e.type === selectedTypeFilter;
  });

  const eventTypes = ['Todos', 'Hackathon', 'Cumbre / Conferencia', 'Meetup Comunitario', 'Taller Práctico', 'Datathon'];

  return (
    <div className="space-y-3">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-amber-500/40 text-amber-200 px-3.5 py-2 rounded-lg shadow-2xl flex items-center gap-2 text-xs font-medium animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Desafíos y Hackathons Tecnológicos en Chile
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Eventos pasados, convocatorias abiertas y fechas de cierre
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-['Outfit'] mt-1">
              Agenda & Convocatorias de Hackathons de Inteligencia Artificial
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 max-w-2xl">
              Eventos verificados en su sitio oficial. ¿Organiza uno? Propóngalo y lo publicaremos tras revisarlo.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={onOpenAddModal}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Proponer un evento</span>
            </button>
          </div>
        </div>

        {/* Tab & Type Filters */}
        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/80 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800 flex-wrap">
            <button
              onClick={() => {
                setActiveTab('upcoming');
                setFilterOnlyUrgent(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                activeTab === 'upcoming' && !filterOnlyUrgent && !filterOnlyBookmarked
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Calendar className="w-3 h-3" />
              <span>Próximos ({upcomingEvents.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('upcoming');
                setFilterOnlyUrgent(true);
                setFilterOnlyBookmarked(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                filterOnlyUrgent
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300'
              }`}
              title="Filtrar eventos con fecha límite de registro cercana"
            >
              <Flame className="w-3 h-3 text-amber-500" />
              <span>Cierres Cercanos ({urgentEvents.length})</span>
            </button>

            <button
              onClick={() => {
                setFilterOnlyBookmarked(!filterOnlyBookmarked);
                setFilterOnlyUrgent(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                filterOnlyBookmarked
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300'
              }`}
              title="Ver mis eventos guardados"
            >
              <Bookmark className="w-3 h-3" />
              <span>Guardados ({bookmarkedIds.length})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('past');
                setFilterOnlyUrgent(false);
                setFilterOnlyBookmarked(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                activeTab === 'past' && !filterOnlyBookmarked
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3 h-3" />
              <span>Pasados ({pastEvents.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-[11px] w-full lg:w-auto no-scrollbar">
            {eventTypes.map(t => (
              <button
                key={t}
                onClick={() => setSelectedTypeFilter(t)}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedTypeFilter === t
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-xs'
                    : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List / Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-2 shadow-xs">
          <Calendar className="w-8 h-8 text-slate-400 dark:text-slate-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No se encontraron eventos con este filtro</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
            Pruebe con otra categoría o quite el filtro de cierres cercanos o guardados.
          </p>
          <button
            onClick={() => {
              setSelectedTypeFilter('Todos');
              setFilterOnlyUrgent(false);
              setFilterOnlyBookmarked(false);
            }}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3 [&>*]:min-w-0">
          {filteredList.map(event => {
            const regionLabel = regionNameMap[event.regionId] || 'Chile';
            const isUpcoming = event.status === 'Próximo' || event.status === 'En Curso';
            const isBookmarked = bookmarkedIds.includes(event.id);
            const isUrgent = event.isRegistrationUrgent || (event.daysUntilDeadline !== undefined && event.daysUntilDeadline <= 7);

            return (
              <div
                key={event.id}
                id={`event-card-${event.id}`}
                className={`rounded-xl border p-3 sm:p-3.5 flex flex-col justify-between transition-all ${
                  highlightedEventId === event.id
                    ? 'ring-2 ring-blue-500 dark:ring-amber-500 border-blue-500 dark:border-amber-500/80 bg-blue-50/50 dark:bg-amber-950/20 shadow-md'
                    : isUrgent
                    ? 'bg-white dark:bg-slate-900/95 border-amber-300 dark:border-amber-500/40 hover:border-amber-500 shadow-xs'
                    : isUpcoming
                    ? 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-blue-400/60 dark:hover:border-blue-500/50 shadow-xs'
                    : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-amber-300 dark:hover:border-amber-500/40 shadow-xs'
                }`}
              >
                <div>
                  {/* Deadline Notification Banner if urgent */}
                  {event.registrationDeadline && inscripcionCerrada(event) && isUpcoming && (
                    <div className="mb-2 p-1.5 sm:p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" /> Inscripciones cerradas el {event.registrationDeadline}
                    </div>
                  )}
                  {event.registrationDeadline && !inscripcionCerrada(event) && (
                    <div className="mb-2 p-1.5 sm:p-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                        {isUrgent ? (
                          <Flame className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 animate-pulse flex-shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        )}
                        <span>
                          {isUrgent ? '¡Cierre Próximo!' : 'Límite de Postulación:'}{' '}
                          <strong className="text-slate-900 dark:text-white">{event.registrationDeadline}</strong>
                        </span>
                      </div>

                      {event.daysUntilDeadline !== undefined && (
                        <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-black uppercase ${
                          event.daysUntilDeadline <= 7 
                            ? 'bg-rose-500 text-white animate-pulse' 
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                        }`}>
                          {event.daysUntilDeadline === 0 ? 'Hoy' : `Faltan ${event.daysUntilDeadline}d`}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Header tags */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {event.type}
                      </span>
                      {event.status === 'En Curso' && (
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          ¡En Vivo!
                        </span>
                      )}
                      {event.status === 'Finalizado' && (
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                          Histórico
                        </span>
                      )}
                      {isBookmarked && (
                        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40 flex items-center gap-1">
                          <BookmarkCheck className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                          Recordatorio
                        </span>
                      )}
                    </div>

                    {event.prizePool && (
                      <div className="text-right min-w-0 max-w-[45%]">
                        <span className="text-[9.5px] text-slate-500 dark:text-slate-400 block uppercase">Premios:</span>
                        <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 break-words">{event.prizePool}</span>
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white font-['Outfit'] mt-1.5">
                    {event.title}
                  </h3>

                  {/* Meta details */}
                  <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{event.dateStr}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span>{event.locationName} ({regionLabel})</span>
                    </div>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Users className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                      <span className="truncate">Organiza: <strong className="text-slate-800 dark:text-slate-300">{event.organizer}</strong></span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(event.tags || []).map(t => (
                      <span key={t} className="px-1.5 py-0.2 rounded bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-[9.5px] border border-slate-200 dark:border-slate-800">
                        #{t}
                      </span>
                    ))}
                  </div>

                </div>

                {/* Action Button & Local Reminder Bookmark */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                      {event.isVirtual ? '🌐 En línea' : '📍 Presencial'}
                    </span>

                    {isUpcoming && (
                      <button
                        onClick={() => toggleBookmark(event.id, event.title)}
                        className={`p-1 rounded-md border text-[10px] flex items-center gap-1 transition-colors cursor-pointer ${
                          isBookmarked
                            ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 font-semibold'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title={isBookmarked ? 'Quitar de recordatorios' : 'Guardar recordatorio local'}
                      >
                        {isBookmarked ? (
                          <>
                            <BookmarkCheck className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            <span className="text-[10px]">Guardado</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3 h-3" />
                            <span className="text-[10px]">Recordarme</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {event.registrationUrl ? (
                    <a
                      href={event.registrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors shadow-xs"
                    >
                      <span>{inscripcionCerrada(event) ? 'Ver sitio oficial' : 'Inscribirse / Bases'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">Convocatoria cerrada</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

