import React, { useState, useEffect } from 'react';
import { Organization, EcosystemEvent, ChileRegion, OrganizationType, Sector } from '../types';
import { X, Building2, Calendar, Sparkles, CheckCircle2 } from 'lucide-react';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  regions: ChileRegion[];
  onAddOrganization: (org: Organization) => void;
  onAddEvent: (event: EcosystemEvent) => void;
}

export const AddEntityModal: React.FC<AddEntityModalProps> = ({
  isOpen,
  onClose,
  regions,
  onAddOrganization,
  onAddEvent
}) => {
  const [activeMode, setActiveMode] = useState<'company' | 'event'>('company');
  const [successMessage, setSuccessMessage] = useState(false);

  // Form states for Organization
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState<OrganizationType>('Startup');
  const [orgRegionId, setOrgRegionId] = useState('metropolitana');
  const [orgCity, setOrgCity] = useState('');
  const [orgSector, setOrgSector] = useState<Sector>('Fintech & Banca');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgTagline, setOrgTagline] = useState('');
  const [orgAiUseCase, setOrgAiUseCase] = useState('');
  const [orgTools, setOrgTools] = useState('Gemini API, PyTorch, LangChain');
  const [orgHiring, setOrgHiring] = useState(true);
  const [orgRoles, setOrgRoles] = useState('Senior ML Engineer, Prompt Engineer');
  const [orgContact, setOrgContact] = useState('');

  // Form states for Event
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<EcosystemEvent['type']>('Hackathon');
  const [eventOrganizer, setEventOrganizer] = useState('');
  const [eventDateStr, setEventDateStr] = useState('');
  const [eventRegionId, setEventRegionId] = useState('metropolitana');
  const [eventLocation, setEventLocation] = useState('');
  const [eventPrize, setEventPrize] = useState('$10,000 USD');
  const [eventTags, setEventTags] = useState('LLMs, Agentes, Minería');
  const [eventIsVirtual, setEventIsVirtual] = useState(true);
  const [eventDeadline, setEventDeadline] = useState('');
  const [eventRegistrationUrl, setEventRegistrationUrl] = useState('');

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !orgAiUseCase.trim()) return;

    const newOrg: Organization = {
      id: `custom-org-${Date.now()}`,
      name: orgName.trim(),
      type: orgType,
      regionId: orgRegionId,
      city: orgCity.trim() || 'Santiago',
      sector: orgSector,
      website: orgWebsite.trim() || 'https://startupchile.org',
      tagline: orgTagline.trim() || 'Empresa innovadora basada en Chile',
      aiUseCase: orgAiUseCase.trim(),
      toolsUsed: orgTools.split(',').map(t => t.trim()).filter(Boolean),
      hiringStatus: orgHiring,
      openRoles: orgHiring ? orgRoles.split(',').map(r => r.trim()).filter(Boolean) : [],
      foundedYear: new Date().getFullYear(),
      contactEmail: orgContact.trim() || undefined,
      verified: true
    };

    onAddOrganization(newOrg);
    setSuccessMessage(true);
    setTimeout(() => {
      setSuccessMessage(false);
      onClose();
    }, 1500);
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const newEvent: EcosystemEvent = {
      id: `custom-event-${Date.now()}`,
      title: eventTitle.trim(),
      type: eventType,
      organizer: eventOrganizer.trim() || 'Comunidad Tecnológica Chile',
      dateStr: eventDateStr.trim() || 'Próximamente 2026',
      status: 'Próximo',
      regionId: eventRegionId,
      locationName: eventLocation.trim() || 'Santiago & Online',
      isVirtual: eventIsVirtual,
      prizePool: eventPrize.trim() || undefined,
      participantsCount: 150,
      tags: eventTags.split(',').map(t => t.trim()).filter(Boolean),
      registrationDeadline: eventDeadline.trim() || undefined,
      registrationUrl: eventRegistrationUrl.trim() || undefined,
      isRegistrationUrgent: true,
      daysUntilDeadline: 10,
      notificationText: `Nueva convocatoria publicada: ${eventTitle.trim()}`
    };

    onAddEvent(newEvent);
    setSuccessMessage(true);
    setTimeout(() => {
      setSuccessMessage(false);
      onClose();
    }, 1500);
  };

  return (
    <div
      id="add-entity-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto touch-manipulation"
    >
      <div
        id="add-entity-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-4 sm:p-7 shadow-2xl relative my-auto transition-colors"
      >
        <button
          type="button"
          id="btn-close-add-modal"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
          aria-label="Cerrar modal de postulación"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success toast */}
        {successMessage ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">
              ¡Postulación Registrada con Éxito!
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Se ha añadido al mapa regional y al directorio en tiempo real para visibilidad de toda la comunidad.
            </p>
          </div>
        ) : (
          <div>
            {/* Header & Mode Switcher */}
            <div className="pr-10 sm:pr-12">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Postulación Comunitaria Abierta
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-1.5">
                Sumar al Mapa de IA en Chile
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Registra tu empresa, startup, caso de uso de IA o hackathon para que inversionistas, talentos e instituciones puedan encontrarte.
              </p>
            </div>

            {/* Type selector tabs */}
            <div className="mt-4 grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                id="btn-postular-tab-company"
                onClick={() => setActiveMode('company')}
                className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeMode === 'company'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span>Empresa / Startup / PyME</span>
              </button>
              <button
                type="button"
                id="btn-postular-tab-event"
                onClick={() => setActiveMode('event')}
                className={`py-2 px-3 text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  activeMode === 'event'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>Hackathon / Evento</span>
              </button>
            </div>

            {/* Form: Company */}
            {activeMode === 'company' ? (
              <form onSubmit={handleCompanySubmit} className="mt-4 space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Nombre de la Empresa <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Andes Quantum Tech"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Tipo de Organización
                    </label>
                    <select
                      value={orgType}
                      onChange={(e) => setOrgType(e.target.value as OrganizationType)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer shadow-2xs"
                    >
                      <option value="Startup" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Startup</option>
                      <option value="Scaleup" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Scaleup</option>
                      <option value="PyME" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">PyME Innovadora</option>
                      <option value="Gran Empresa" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Gran Empresa / Corporación</option>
                      <option value="Centro I+D" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Centro I+D / Universidad</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Región de Chile <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={orgRegionId}
                      onChange={(e) => setOrgRegionId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer shadow-2xs"
                    >
                      {regions.map(r => (
                        <option key={r.id} value={r.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {r.romanNumeral} - {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Ciudad / Comuna
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Concepción, Providencia, Antofagasta"
                      value={orgCity}
                      onChange={(e) => setOrgCity(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Sector Productivo Principal
                    </label>
                    <select
                      value={orgSector}
                      onChange={(e) => setOrgSector(e.target.value as Sector)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer shadow-2xs"
                    >
                      <option value="Minería & Energía" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Minería & Energía</option>
                      <option value="Fintech & Banca" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Fintech & Banca</option>
                      <option value="Biotech & Agro" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Biotech & Agro</option>
                      <option value="Retail & E-commerce" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Retail & E-commerce</option>
                      <option value="Salud & MedTech" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Salud & MedTech</option>
                      <option value="Logística & Transporte" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Logística & Transporte</option>
                      <option value="GovTech & Legal" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">GovTech & Legal</option>
                      <option value="Clima & Sustentabilidad" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Clima & Sustentabilidad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Sitio Web / Enlace Oficial
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={orgWebsite}
                      onChange={(e) => setOrgWebsite(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                    Breve Descripción / Propuesta de Valor
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. Detección autónoma de anomalías con visión artificial para plantas industriales"
                    value={orgTagline}
                    onChange={(e) => setOrgTagline(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                  />
                </div>

                {/* AI Use Case Box */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-900/40">
                  <label className="block text-blue-900 dark:text-blue-300 font-bold mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>¿Cómo están utilizando la Inteligencia Artificial?</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Explica concretamente tu algoritmo, caso de uso o modelo (ej. Usamos Gemini API para resumir contratos financieros y modelos YOLOv8 para inspección visual de fruta en Maule)..."
                    value={orgAiUseCase}
                    onChange={(e) => setOrgAiUseCase(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-blue-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 leading-relaxed transition-colors shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                    Herramientas & Tech Stack (separadas por coma)
                  </label>
                  <input
                    type="text"
                    placeholder="Gemini API, PyTorch, LangChain, Supabase, Docker..."
                    value={orgTools}
                    onChange={(e) => setOrgTools(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={orgHiring}
                      onChange={(e) => setOrgHiring(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                      ¿Están contratando talento de IA actualmente?
                    </span>
                  </label>

                  {orgHiring && (
                    <input
                      type="text"
                      placeholder="Roles abiertos (ej. Senior ML Engineer, Full Stack Dev, Prompt Engineer)"
                      value={orgRoles}
                      onChange={(e) => setOrgRoles(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                >
                  Postular Empresa al Mapa Nacional
                </button>
              </form>
            ) : (
              <form onSubmit={handleEventSubmit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                    Nombre del Evento / Hackathon <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Hackathon IA AgroTech Maule 2026"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Tipo de Evento
                    </label>
                    <select
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value as EcosystemEvent['type'])}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer shadow-2xs"
                    >
                      <option value="Hackathon" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Hackathon</option>
                      <option value="Datathon" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Datathon</option>
                      <option value="Cumbre / Conferencia" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Cumbre / Conferencia</option>
                      <option value="Meetup Comunitario" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Meetup Comunitario</option>
                      <option value="Taller Práctico" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Taller Práctico</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Organizador(es)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Corfo, Universidad de Talca, Startup"
                      value={eventOrganizer}
                      onChange={(e) => setEventOrganizer(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Fecha o Rango
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 18 - 20 de Noviembre, 2026"
                      value={eventDateStr}
                      onChange={(e) => setEventDateStr(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Región Sede <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={eventRegionId}
                      onChange={(e) => setEventRegionId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors cursor-pointer shadow-2xs"
                    >
                      {regions.map(r => (
                        <option key={r.id} value={r.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                          {r.romanNumeral} - {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Lugar / Sede
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Campus Talca + Online"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Bolsa de Premios
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. $10,000 USD + Mentorías"
                      value={eventPrize}
                      onChange={(e) => setEventPrize(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Fecha Límite de Registro
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 10 de Octubre, 2026"
                      value={eventDeadline}
                      onChange={(e) => setEventDeadline(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                      Link de Inscripción / Bases
                    </label>
                    <input
                      type="url"
                      placeholder="https://hackathon.cl/registro"
                      value={eventRegistrationUrl}
                      onChange={(e) => setEventRegistrationUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-800 dark:text-slate-200 font-semibold mb-1">
                    Temáticas / Tags (separados por coma)
                  </label>
                  <input
                    type="text"
                    placeholder="AgroTech, Sensores, Visión Artificial, Gemini"
                    value={eventTags}
                    onChange={(e) => setEventTags(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors shadow-2xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                >
                  Postular Evento en la Agenda Nacional
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
