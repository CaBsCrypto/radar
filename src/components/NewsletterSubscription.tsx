import React, { useState, useEffect } from 'react';
import { ChileRegion, NewsletterSubscriber, EcosystemEvent } from '../types';
import { registerWaitlistSubscriber } from '../lib/firebase';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  Bell, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Trash2, 
  Sliders, 
  Calendar, 
  Award, 
  DollarSign, 
  Building2, 
  FileText, 
  X,
  ArrowRight,
  Info
} from 'lucide-react';

interface NewsletterSubscriptionProps {
  regions: ChileRegion[];
  events?: EcosystemEvent[];
  onNotify?: (message: string, type?: 'success' | 'info' | 'copied') => void;
}

const STORAGE_KEY = 'chile_ai_newsletter_subscriber';

export const NewsletterSubscription: React.FC<NewsletterSubscriptionProps> = ({
  regions,
  events = [],
  onNotify
}) => {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'semanal' | 'inmediata'>('semanal');
  const [preferredRegionId, setPreferredRegionId] = useState<string>('all');
  const [interests, setInterests] = useState<('hackathons' | 'eventos' | 'inversion' | 'startups')[]>([
    'hackathons',
    'eventos',
    'inversion'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriber, setSubscriber] = useState<NewsletterSubscriber | null>(null);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load existing subscriber if any
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: NewsletterSubscriber = JSON.parse(stored);
        if (parsed && parsed.active) {
          setSubscriber(parsed);
          setEmail(parsed.email);
          setFrequency(parsed.frequency || 'semanal');
          setPreferredRegionId(parsed.preferredRegionId || 'all');
          setInterests(parsed.interests || ['hackathons', 'eventos']);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleInterest = (interest: 'hackathons' | 'eventos' | 'inversion' | 'startups') => {
    setInterests(prev => {
      if (prev.includes(interest)) {
        if (prev.length === 1) return prev; // At least one interest
        return prev.filter(i => i !== interest);
      } else {
        return [...prev, interest];
      }
    });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedEmail) {
      setErrorMessage('Por favor ingresa tu correo electrónico.');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Ingresa una dirección de correo válida (ejemplo: usuario@empresa.cl).');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save directly to cloud Firestore database
      await registerWaitlistSubscriber({
        email: trimmedEmail,
        source: 'newsletter_section',
        interests,
        preferredRegionId,
        frequency
      });

      const newSubscriber: NewsletterSubscriber = {
        id: subscriber ? subscriber.id : `sub-${Date.now()}`,
        email: trimmedEmail,
        subscribedAt: subscriber ? subscriber.subscribedAt : new Date().toISOString(),
        frequency,
        preferredRegionId,
        interests,
        active: true
      };

      // 2. Keep local cache state
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSubscriber));
      setSubscriber(newSubscriber);
      setIsEditingPreferences(false);
      setIsSubmitting(false);

      const successMsg = subscriber
        ? '¡Preferencias de tu suscripción actualizadas con éxito en la nube!'
        : '¡Te has registrado exitosamente en la lista y boletín del Ecosistema IA!';
      
      if (onNotify) {
        onNotify(successMsg, 'success');
      }
    } catch (err) {
      console.error('Error saving to Firestore:', err);
      // Fallback local persistence if offline
      const fallbackSubscriber: NewsletterSubscriber = {
        id: subscriber ? subscriber.id : `sub-${Date.now()}`,
        email: trimmedEmail,
        subscribedAt: subscriber ? subscriber.subscribedAt : new Date().toISOString(),
        frequency,
        preferredRegionId,
        interests,
        active: true
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackSubscriber));
      setSubscriber(fallbackSubscriber);
      setIsEditingPreferences(false);
      setIsSubmitting(false);
      if (onNotify) {
        onNotify('¡Te has registrado en el boletín semanal!', 'success');
      }
    }
  };

  const handleUnsubscribe = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSubscriber(null);
      setEmail('');
      setIsEditingPreferences(false);
      if (onNotify) {
        onNotify('Has cancelado tu suscripción al boletín semanal.', 'info');
      }
    } catch {
      // ignore
    }
  };

  const getRegionName = (id: string) => {
    if (id === 'all') return 'Todas las Regiones de Chile';
    return regions.find(r => r.id === id)?.shortName || id;
  };

  // Preview data helpers
  const upcomingHackathons = events.filter(e => e.type === 'Hackathon' || e.type === 'Datathon').slice(0, 2);
  const upcomingMeetups = events.filter(e => e.type !== 'Hackathon' && e.type !== 'Datathon').slice(0, 2);

  return (
    <div 
      id="newsletter-section" 
      className="w-full bg-slate-50 dark:bg-slate-950 border-t border-b border-slate-200 dark:border-slate-800/80 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 mb-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Top Header Card */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800/60">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold border border-blue-200 dark:border-blue-500/25">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Boletín Semanal • Cada Lunes 08:00 CLT</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
              CHILE AI RADAR • BRIEFING EJECUTIVO
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              El boletín semanal con todo lo que necesitas saber del ecosistema: <strong className="text-slate-900 dark:text-white font-semibold">hackathons</strong>, <strong className="text-slate-900 dark:text-white font-semibold">oportunidades</strong> de aceleración, <strong className="text-slate-900 dark:text-white font-semibold">fondos</strong> concursables (Corfo, ANID, Start-Up Chile), convocatorias abiertas y novedades de IA en Chile.
            </p>

            {/* Badges of main contents */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span>🏆</span>
                <span>Hackathons</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span>💼</span>
                <span>Oportunidades</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span>💰</span>
                <span>Fondos Corfo & ANID</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 font-medium border border-slate-200 dark:border-slate-800 shadow-2xs">
                <span>🚀</span>
                <span>Startups & Eventos</span>
              </span>
            </div>
          </div>

          {/* Value Badges */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 lg:justify-end text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
              <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <div>
                <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">Cada Lunes</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">08:00 AM Continental</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="text-[11px] font-semibold text-slate-800 dark:text-slate-200">100% Sin Spam</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">Desuscríbete con 1 clic</div>
              </div>
            </div>

            <button
              id="btn-preview-newsletter"
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 text-xs font-medium transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Ver Edición de Muestra</span>
            </button>
          </div>
        </div>

        {/* Content Body: Active Subscriber vs Subscription Form */}
        <div className="pt-6">
          {subscriber && !isEditingPreferences ? (
            /* Subscribed State Card */
            <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-500/30 shadow-xs">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ¡Suscripción activa al Boletín Semanal!
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-200 dark:border-emerald-500/20">
                      Activo
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Tu correo <span className="text-blue-600 dark:text-blue-300 font-semibold">{subscriber.email}</span> está registrado para recibir actualizaciones {subscriber.frequency === 'inmediata' ? 'inmediatas de hackathons y convocatorias' : 'todos los lunes a las 08:00 CLT'}.
                  </p>

                  {/* Active Tags */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Filtro regional:</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      {getRegionName(subscriber.preferredRegionId)}
                    </span>

                    <span className="text-slate-400 dark:text-slate-600">•</span>

                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Temas:</span>
                    {subscriber.interests.map(i => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800/40">
                        {i === 'hackathons' && '🏆 Hackathons'}
                        {i === 'eventos' && '📅 Eventos'}
                        {i === 'inversion' && '💡 Corfo & Ley I+D'}
                        {i === 'startups' && '🚀 Startups'}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Subscriber Actions */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-2 md:pt-0">
                  <button
                    id="btn-edit-newsletter-prefs"
                    type="button"
                    onClick={() => setIsEditingPreferences(true)}
                    className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Ajustar preferencias</span>
                  </button>

                  <button
                    id="btn-unsubscribe-newsletter"
                    type="button"
                    onClick={handleUnsubscribe}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-950/80 hover:bg-rose-50 dark:hover:bg-rose-950/60 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50"
                    title="Cancelar suscripción"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Darse de baja</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Subscription Form */
            <form onSubmit={handleSubscribe} className="space-y-4">
              {isEditingPreferences && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-300">
                    Modificando preferencias de {subscriber?.email}:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingPreferences(false)}
                    className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {/* Main Input Row */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Email Input */}
                <div className="sm:col-span-8 relative">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="newsletter-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="Ingresa tu correo profesional (ej: nombre@startup.cl)"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-2xs"
                      required
                    />
                  </div>
                  {errorMessage && (
                    <p className="text-xs text-rose-500 dark:text-rose-400 mt-1.5 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="sm:col-span-4">
                  <button
                    id="btn-submit-newsletter"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Registrando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{subscriber ? 'Guardar Preferencias' : 'Suscribirme Gratis'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Preferences Strip: Topics & Frequency */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                {/* Topic selection chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Temas incluidos:</span>

                  <button
                    type="button"
                    onClick={() => toggleInterest('hackathons')}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      interests.includes('hackathons')
                        ? 'bg-blue-50 dark:bg-blue-600/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/40 font-semibold'
                        : 'bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Hackathons & Desafíos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleInterest('eventos')}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      interests.includes('eventos')
                        ? 'bg-emerald-50 dark:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/40 font-semibold'
                        : 'bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Meetups & Cumbres</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleInterest('inversion')}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      interests.includes('inversion')
                        ? 'bg-amber-50 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/40 font-semibold'
                        : 'bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <DollarSign className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Fondos Corfo & Ley I+D</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleInterest('startups')}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      interests.includes('startups')
                        ? 'bg-indigo-50 dark:bg-indigo-600/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/40 font-semibold'
                        : 'bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Nuevas Startups</span>
                  </button>
                </div>

                {/* Weekly bulletin indicator */}
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  <span>Envío semanal los lunes • Sin spam</span>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal: Preview of the Weekly Newsletter Dispatch */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsPreviewOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h4 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit']">
                  Vista Previa del Boletín: Edición Semanal #48
                </h4>
              </div>
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Header Simulation */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/80 space-y-3 font-sans">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800/60 pb-2">
                <div>
                  <span className="text-slate-400 dark:text-slate-500">De:</span> boletin@radar.chileai.cl
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500">Envío:</span> Lunes, 08:00 CLT
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs uppercase tracking-wider text-blue-600 dark:text-blue-400 font-bold">
                  Chile AI Radar • Briefing Semanal
                </span>
                <h5 className="text-lg font-bold text-slate-900 dark:text-white">
                  🇨🇱 3 Nuevos Hackathons de IA Abiertos en Chile + Guía Ley I+D Corfo
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Hola tech builder. Te compartimos las convocatorias y eventos de Inteligencia Artificial agregados esta semana al radar nacional:
                </p>
              </div>

              {/* Simulated Content Blocks */}
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                      🏆 Hackathons con Convocatoria Urgente
                    </span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-500/20">
                      Cierre esta semana
                    </span>
                  </div>
                  {upcomingHackathons.map((h) => (
                    <div key={h.id} className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                      • <strong className="text-slate-900 dark:text-white">{h.title}</strong> ({h.locationName}): {h.prizePool ? `Premios ${h.prizePool}. ` : ''}Fecha límite: {h.registrationDeadline || 'Pronto'}
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    📅 Próximos Encuentros & Conferencias
                  </span>
                  {upcomingMeetups.map((m) => (
                    <div key={m.id} className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                      • <strong className="text-slate-900 dark:text-white">{m.title}</strong> ({m.locationName}) - Organizado por {m.organizer}
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/30 space-y-1 shadow-2xs">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    💡 Oportunidades de Inversión & Fondos Corfo
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Recordatorio: La <strong className="text-slate-900 dark:text-white">Ley de Incentivo Tributario I+D (Ley 20.241)</strong> permite rebajar hasta un 35% del impuesto de primera categoría para empresas que contratan talento de IA en Chile.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                Recibes este correo porque te suscribiste a través de <strong className="text-slate-700 dark:text-slate-400">Chile AI Radar</strong>. Puedes gestionar tus preferencias o desuscribirte en cualquier momento con un clic.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cerrar Vista Previa
              </button>
              {!subscriber && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPreviewOpen(false);
                    const el = document.getElementById('newsletter-email-input');
                    if (el) el.focus();
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Suscribirme al Boletín</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
