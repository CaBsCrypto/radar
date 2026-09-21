import React, { useState, useEffect } from 'react';
import { ChileRegion, EcosystemEvent, NewsletterSubscriber } from '../types';
import { TabType } from './Navbar';
import { registerWaitlistSubscriber } from '../lib/firebase';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
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
  Info,
  MapPin,
  Bot,
  TrendingUp,
  Cpu,
  GraduationCap,
  Briefcase,
  HelpCircle,
  Share2,
  Plus,
  Command,
  ArrowUp,
  Heart
} from 'lucide-react';

interface FooterProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  regions: ChileRegion[];
  events: EcosystemEvent[];
  onOpenAddModal: () => void;
  onOpenBrochure?: () => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'copied') => void;
  theme: 'light' | 'dark';
}

const NEWSLETTER_STORAGE_KEY = 'chile_ai_newsletter_subscriber';

export const Footer: React.FC<FooterProps> = ({
  activeTab,
  setActiveTab,
  regions,
  events = [],
  onOpenAddModal,
  onOpenBrochure,
  onNotify,
  theme
}) => {
  // Newsletter state
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
      const stored = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
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
        if (prev.length === 1) return prev;
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
      setErrorMessage('Ingresa un correo válido (ej: contacto@empresa.cl).');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save directly to cloud Firestore database
      await registerWaitlistSubscriber({
        email: trimmedEmail,
        source: 'footer_newsletter',
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

      localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(newSubscriber));
      setSubscriber(newSubscriber);
      setIsEditingPreferences(false);
      setIsSubmitting(false);

      const successMsg = subscriber
        ? '¡Preferencias de tu suscripción actualizadas con éxito en la nube!'
        : '¡Te has suscrito exitosamente al boletín semanal del Ecosistema IA de Chile!';
      
      onNotify(successMsg, 'success');
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
      localStorage.setItem(NEWSLETTER_STORAGE_KEY, JSON.stringify(fallbackSubscriber));
      setSubscriber(fallbackSubscriber);
      setIsEditingPreferences(false);
      setIsSubmitting(false);
      onNotify('¡Te has registrado en el boletín semanal!', 'success');
    }
  };

  const handleUnsubscribe = () => {
    try {
      localStorage.removeItem(NEWSLETTER_STORAGE_KEY);
      setSubscriber(null);
      setEmail('');
      setIsEditingPreferences(false);
      onNotify('Has cancelado tu suscripción al boletín semanal.', 'info');
    } catch {
      // ignore
    }
  };

  const getRegionName = (id: string) => {
    if (id === 'all') return 'Todas las Regiones';
    return regions.find(r => r.id === id)?.shortName || id;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Preview data
  const upcomingHackathons = events.filter(e => e.type === 'Hackathon' || e.type === 'Datathon').slice(0, 2);
  const upcomingMeetups = events.filter(e => e.type !== 'Hackathon' && e.type !== 'Datathon').slice(0, 2);

  return (
    <footer 
      id="app-global-footer"
      className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950 transition-colors pb-20 lg:pb-0"
    >
      {/* ========================================================================= */}
      {/* 1. SECCIÓN RADAR (BOLETÍN INTEGRADO)                                      */}
      {/* ========================================================================= */}
      <div 
        id="newsletter-section" 
        className="border-b border-slate-200 dark:border-slate-800/80 py-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900/60"
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header of Newsletter */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800/60">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold border border-blue-200 dark:border-blue-800/60">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Boletín Semanal • Cada Lunes 08:00 CLT</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight font-['Outfit']">
                RADAR
              </h3>

              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                El boletín semanal con todo lo que necesitas saber del ecosistema: <strong className="text-slate-900 dark:text-white font-semibold">hackathons</strong>, <strong className="text-slate-900 dark:text-white font-semibold">oportunidades</strong> de aceleración, <strong className="text-slate-900 dark:text-white font-semibold">fondos</strong> concursables (Corfo, ANID, Start-Up Chile), convocatorias abiertas y novedades de IA en Chile.
              </p>

              {/* Badges of main contents */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-medium border border-slate-200/80 dark:border-slate-700/80">
                  <span>🏆</span>
                  <span>Hackathons</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-medium border border-slate-200/80 dark:border-slate-700/80">
                  <span>💼</span>
                  <span>Oportunidades</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-medium border border-slate-200/80 dark:border-slate-700/80">
                  <span>💰</span>
                  <span>Fondos Corfo & ANID</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-medium border border-slate-200/80 dark:border-slate-700/80">
                  <span>🚀</span>
                  <span>Startups & Eventos</span>
                </span>
              </div>
            </div>

            {/* Value Indicators */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100">Cada Lunes</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">08:00 AM Continental</div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="text-[11px] font-bold text-slate-900 dark:text-slate-100">100% Sin Spam</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Desuscríbete con 1 clic</div>
                </div>
              </div>

              <button
                id="btn-preview-newsletter"
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Ver Muestra de Edición</span>
              </button>
            </div>
          </div>

          {/* Form or Subscribed State */}
          {subscriber && !isEditingPreferences ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      ¡Suscripción activa al Boletín del Ecosistema!
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-300 dark:border-emerald-500/20">
                      Activo
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Tu correo <strong className="text-blue-600 dark:text-blue-300">{subscriber.email}</strong> está registrado para recibir actualizaciones {subscriber.frequency === 'inmediata' ? 'inmediatas de hackathons y fondos' : 'cada lunes a las 08:00 CLT'}.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Región:</span>
                    <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700">
                      {getRegionName(subscriber.preferredRegionId)}
                    </span>

                    <span className="text-slate-300 dark:text-slate-700">•</span>

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

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end pt-2 md:pt-0">
                  <button
                    type="button"
                    onClick={() => setIsEditingPreferences(true)}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Preferencias</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleUnsubscribe}
                    className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 dark:bg-slate-900/80 dark:hover:bg-rose-950/60 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200 hover:border-rose-200 dark:border-slate-800 dark:hover:border-rose-900/50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Darse de baja</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-4">
              {isEditingPreferences && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Modificando preferencias de {subscriber?.email}:
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingPreferences(false)}
                    className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white cursor-pointer"
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
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-xs"
                      required
                    />
                  </div>
                  {errorMessage && (
                    <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1">
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
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99]"
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

              {/* Preferences Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Temas incluidos:</span>

                  <button
                    type="button"
                    onClick={() => toggleInterest('hackathons')}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                      interests.includes('hackathons')
                        ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 font-semibold'
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
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
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-semibold'
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
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
                        ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 font-semibold'
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
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
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-semibold'
                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
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

      {/* ========================================================================= */}
      {/* 2. ESTRUCTURA PRINCIPAL DE NAVEGACIÓN & COLUMNAS DEL FOOTER               */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Columna 1: Identidad & Propósito (4 cols en desktop) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 p-0.5 shadow-md shadow-blue-600/20 flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <span className="text-white font-black text-xs tracking-wider">CL</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 ml-0.5"></span>
                </div>
              </div>
              <div>
                <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight font-['Outfit']">
                  CHILE AI RADAR
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Ecosistema Abierto & Observatorio Tecnológico
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium mt-1 flex items-center gap-1">
                  <span>Desarrollado por</span>
                  <span className="font-bold text-slate-900 dark:text-white font-['Outfit']">AlphaDocere & Browns Studio</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mapeo territorial, directorio de startups, adopción del estándar <strong>WebMCP para Agentes Autónomos</strong> y seguimiento de financiamiento tecnológico en las 16 regiones de Chile.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[11px] font-semibold border border-blue-200 dark:border-blue-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Chile #1 IA LatAm (Índice ILIA)
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[11px] border border-slate-200 dark:border-slate-800">
                16 Regiones Activas
              </span>
            </div>

            {/* Acciones Rápidas */}
            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    onNotify('¡Enlace copiado al portapapeles!', 'copied');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copiar enlace de Chile AI Radar"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Compartir Radar</span>
              </button>

              <button
                onClick={onOpenAddModal}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Postular al Radar</span>
              </button>
            </div>
          </div>

          {/* Columna 2: Navegación del Ecosistema (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-['Outfit']">
              Navegación del Ecosistema
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => { setActiveTab('mapa'); scrollToTop(); }}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2 ${
                    activeTab === 'mapa' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Mapa Territorial de las 16 Regiones</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('eventos'); scrollToTop(); }}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2 ${
                    activeTab === 'eventos' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Calendario de Eventos & Hackathons</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('webmcp'); scrollToTop(); }}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2 ${
                    activeTab === 'webmcp' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-blue-500" />
                  <span className="flex items-center gap-1.5">
                    <span>Área de Negocios WebMCP</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold font-mono">Empresas</span>
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('admin'); }}
                  className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2 ${
                    activeTab === 'admin' ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Panel Admin / Mails Registrados</span>
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAddModal}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2 text-slate-600 dark:text-slate-400"
                >
                  <Plus className="w-3.5 h-3.5 text-blue-500" />
                  <span>Postular Organización, Startup o Hackathon</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Columna 3: Información & Comunidad (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 font-['Outfit']">
              Comunidad & Créditos
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                  <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>
                    Desarrollado por <strong className="text-slate-900 dark:text-white font-semibold">AlphaDocere</strong> & <strong className="text-slate-900 dark:text-white font-semibold">Browns Studio</strong>
                  </span>
                </div>
              </li>
              <li>
                <button
                  onClick={() => { setActiveTab('webmcp'); scrollToTop(); }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2 text-slate-600 dark:text-slate-400"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>¿Dueño de Empresa? Suma tu Negocio al WebMCP</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    document.getElementById('newsletter-section')?.scrollIntoView({ behavior: 'smooth' });
                    const input = document.getElementById('newsletter-email-input');
                    if (input) input.focus();
                  }}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2 text-slate-600 dark:text-slate-400"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span>Boletín Semanal de Eventos y Oportunidades</span>
                </button>
              </li>
              <li>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Datos Abiertos y Colaboración Comunitaria</span>
                </div>
              </li>
              <li>
                <button
                  onClick={scrollToTop}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer flex items-center gap-2 text-slate-600 dark:text-slate-400"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Volver al Inicio</span>
                </button>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BARRA INFERIOR: LEGAL, ATAJOS DE TECLADO Y CONTRASTE LEGIBLE           */}
      {/* ========================================================================= */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 dark:text-slate-400">
          {/* Shortcuts for Power Users */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Command className="w-3.5 h-3.5 text-slate-400" />
            <span>Atajos:</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[10px]">
              ⌘K
            </kbd>
            <span>o</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[10px]">
              /
            </kbd>
            <span>buscar</span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[10px]">
              1
            </kbd>
            <span>y</span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[10px]">
              2
            </kbd>
            <span>cambiar pestaña</span>
          </div>

          {/* Attribution & Year */}
          <div className="text-center md:text-right text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              <span>Desarrollado por</span>
              <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-['Outfit']">
                AlphaDocere
              </span>
              <span className="text-slate-400">&</span>
              <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-['Outfit']">
                Browns Studio
              </span>
            </div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">
              Actualizado 2026 • <strong>Chile AI Radar</strong> • Plataforma Abierta para el Ecosistema Tecnológico de las 16 Regiones
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL VISTA PREVIA DEL BOLETÍN                                         */}
      {/* ========================================================================= */}
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
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
                  Vista Previa: Edición Semanal #48
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
                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/40 space-y-1">
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

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    📅 Próximos Encuentros & Conferencias
                  </span>
                  {upcomingMeetups.map((m) => (
                    <div key={m.id} className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                      • <strong className="text-slate-900 dark:text-white">{m.title}</strong> ({m.locationName}) - Organizado por {m.organizer}
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/30 space-y-1">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-300">
                    💡 Oportunidades de Inversión & Fondos Corfo
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Recordatorio: La <strong className="text-slate-900 dark:text-white">Ley de Incentivo Tributario I+D (Ley 20.241)</strong> permite rebajar hasta un 35% del impuesto de primera categoría para empresas que contratan talento de IA en Chile.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-center border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500">
                Recibes este correo porque te suscribiste a través de <strong className="text-slate-700 dark:text-slate-300">Chile AI Radar</strong>. Puedes gestionar tus preferencias en cualquier momento.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
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
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/20"
                >
                  <span>Suscribirme al Boletín</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
