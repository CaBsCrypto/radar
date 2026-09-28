import React, { useState } from 'react';
import { Building2, Calendar, Loader2 } from 'lucide-react';
import type { ChileRegion, EcosystemEvent, EventType, Organization, OrganizationType, Sector } from '../types';
import { textoFechas } from '../lib/eventos';

export const TIPOS_ORGANIZACION: OrganizationType[] = ['Startup', 'Scaleup', 'PyME', 'Gran Empresa', 'Centro I+D', 'Universidad'];
export const SECTORES: Sector[] = [
  'Tecnología & Software', 'Fintech & Banca', 'Retail & E-commerce', 'Salud & MedTech', 'Minería & Energía',
  'Biotech & Agro', 'Logística & Transporte', 'GovTech & Legal', 'Clima & Sustentabilidad', 'Educación & Investigación',
];
export const TIPOS_EVENTO: EventType[] = ['Hackathon', 'Cumbre / Conferencia', 'Meetup Comunitario', 'Taller Práctico', 'Datathon'];

export type EntidadGuardada = { tipo: 'organizacion'; datos: Organization } | { tipo: 'evento'; datos: EcosystemEvent };

interface FormularioEntidadProps {
  regions: ChileRegion[];
  /** Tipo fijo (al editar) o elegible por el usuario. */
  tipoInicial?: 'organizacion' | 'evento';
  permitirCambioTipo?: boolean;
  organizacion?: Organization;
  evento?: EcosystemEvent;
  textoBoton: string;
  onGuardar: (e: EntidadGuardada) => Promise<void>;
  onCancelar?: () => void;
}

const campo = 'w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500';
const Etiqueta: React.FC<{ texto: string; requerido?: boolean; children: React.ReactNode; className?: string }> = ({ texto, requerido, children, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
      {texto}{requerido && <span className="text-rose-500"> *</span>}
    </span>
    {children}
  </label>
);

const esUrl = (v: string) => /^https?:\/\/\S+\.\S+/.test(v.trim());
const lista = (v: string) => v.split(',').map(t => t.trim()).filter(Boolean);
const slug = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);

/**
 * Formulario de evento u organización. Lo usan el público (queda como propuesta pendiente)
 * y el panel de administración (publica o edita directamente).
 */
export const FormularioEntidad: React.FC<FormularioEntidadProps> = ({
  regions, tipoInicial = 'organizacion', permitirCambioTipo = true, organizacion, evento, textoBoton, onGuardar, onCancelar,
}) => {
  const [tipo, setTipo] = useState<'organizacion' | 'evento'>(evento ? 'evento' : organizacion ? 'organizacion' : tipoInicial);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  const [o, setO] = useState({
    name: organizacion?.name || '', type: organizacion?.type || ('Startup' as OrganizationType), regionId: organizacion?.regionId || '',
    city: organizacion?.city || '', sector: organizacion?.sector || ('Tecnología & Software' as Sector), website: organizacion?.website || '',
    tagline: organizacion?.tagline || '', aiUseCase: organizacion?.aiUseCase || '', hiringStatus: organizacion?.hiringStatus || false,
    openRoles: (organizacion?.openRoles || []).join(', '), contactEmail: organizacion?.contactEmail || '',
  });
  const [ev, setEv] = useState({
    title: evento?.title || '', type: evento?.type || ('Hackathon' as EventType), organizer: evento?.organizer || '',
    fechaInicio: evento?.fechaInicio || '', fechaFin: evento?.fechaFin || '', fechaCierre: evento?.fechaCierre || '',
    regionId: evento?.regionId || '', locationName: evento?.locationName || '', isVirtual: evento?.isVirtual || false,
    registrationUrl: evento?.registrationUrl || '', prizePool: evento?.prizePool || '', tags: (evento?.tags || []).join(', '),
  });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let entidad: EntidadGuardada;
    if (tipo === 'organizacion') {
      if (!o.name.trim() || !o.regionId || !o.aiUseCase.trim()) return setError('Complete el nombre, la región y cómo usan la IA.');
      if (o.website && !esUrl(o.website)) return setError('El sitio web debe comenzar con https://');
      entidad = {
        tipo: 'organizacion',
        datos: {
          id: organizacion?.id || `org-${slug(o.name)}-${Date.now().toString(36)}`,
          name: o.name.trim(), type: o.type, regionId: o.regionId, city: o.city.trim(), sector: o.sector,
          website: o.website.trim(), tagline: o.tagline.trim(), aiUseCase: o.aiUseCase.trim(), toolsUsed: organizacion?.toolsUsed || [],
          hiringStatus: o.hiringStatus, openRoles: o.hiringStatus ? lista(o.openRoles) : [],
          foundedYear: organizacion?.foundedYear || new Date().getFullYear(), contactEmail: o.contactEmail.trim() || undefined,
          verified: organizacion?.verified || false, createdAt: organizacion?.createdAt,
        },
      };
    } else {
      if (!ev.title.trim() || !ev.organizer.trim() || !ev.fechaInicio || !ev.regionId) return setError('Complete el nombre, quién organiza, la fecha de inicio y la región.');
      if (!esUrl(ev.registrationUrl)) return setError('Agregue el enlace oficial del evento (debe comenzar con https://).');
      if (ev.fechaFin && ev.fechaFin < ev.fechaInicio) return setError('La fecha de término no puede ser anterior a la de inicio.');
      if (!ev.isVirtual && !ev.locationName.trim()) return setError('Indique el lugar, o marque que es en línea.');
      entidad = {
        tipo: 'evento',
        datos: {
          id: evento?.id || `evt-${slug(ev.title)}-${ev.fechaInicio.slice(0, 4)}`,
          title: ev.title.trim(), type: ev.type, organizer: ev.organizer.trim(),
          dateStr: textoFechas(ev.fechaInicio, ev.fechaFin || undefined),
          fechaInicio: ev.fechaInicio, fechaFin: ev.fechaFin || undefined, fechaCierre: ev.fechaCierre || undefined,
          status: 'Próximo', regionId: ev.regionId,
          locationName: ev.isVirtual ? (ev.locationName.trim() || 'En línea') : ev.locationName.trim(), isVirtual: ev.isVirtual,
          registrationUrl: ev.registrationUrl.trim(), prizePool: ev.prizePool.trim() || undefined, tags: lista(ev.tags).slice(0, 8),
          createdAt: evento?.createdAt,
        },
      };
    }
    setEnviando(true);
    try { await onGuardar(entidad); }
    catch (err) { console.warn(err); setError('No se pudo guardar. Revise su conexión e intente nuevamente.'); }
    setEnviando(false);
  };

  const selectorRegion = (valor: string, cambiar: (v: string) => void) => (
    <select value={valor} onChange={e => cambiar(e.target.value)} className={campo} required>
      <option value="" disabled>Seleccione una región</option>
      {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
    </select>
  );

  return (
    <form onSubmit={enviar} noValidate className="space-y-4">
      {permitirCambioTipo && (
        <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl" role="tablist">
          {([['organizacion', 'Organización o universidad', Building2], ['evento', 'Evento', Calendar]] as const).map(([id, texto, Icono]) => (
            <button key={id} type="button" role="tab" aria-selected={tipo === id} onClick={() => { setTipo(id); setError(''); }}
              className={`py-2 px-3 text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                tipo === id ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}>
              <Icono className="w-4 h-4" /> {texto}
            </button>
          ))}
        </div>
      )}

      {tipo === 'organizacion' ? (
        <div className="grid sm:grid-cols-2 gap-3">
          <Etiqueta texto="Nombre" requerido className="sm:col-span-2">
            <input value={o.name} onChange={e => setO({ ...o, name: e.target.value })} className={campo} maxLength={150} />
          </Etiqueta>
          <Etiqueta texto="Tipo" requerido>
            <select value={o.type} onChange={e => setO({ ...o, type: e.target.value as OrganizationType })} className={campo}>
              {TIPOS_ORGANIZACION.map(t => <option key={t}>{t}</option>)}
            </select>
          </Etiqueta>
          <Etiqueta texto="Sector" requerido>
            <select value={o.sector} onChange={e => setO({ ...o, sector: e.target.value as Sector })} className={campo}>
              {SECTORES.map(t => <option key={t}>{t}</option>)}
            </select>
          </Etiqueta>
          <Etiqueta texto="Región" requerido>{selectorRegion(o.regionId, v => setO({ ...o, regionId: v }))}</Etiqueta>
          <Etiqueta texto="Ciudad">
            <input value={o.city} onChange={e => setO({ ...o, city: e.target.value })} className={campo} maxLength={100} />
          </Etiqueta>
          <Etiqueta texto="Sitio web" className="sm:col-span-2">
            <input value={o.website} onChange={e => setO({ ...o, website: e.target.value })} placeholder="https://" className={campo} maxLength={250} inputMode="url" />
          </Etiqueta>
          <Etiqueta texto="Descripción breve" className="sm:col-span-2">
            <input value={o.tagline} onChange={e => setO({ ...o, tagline: e.target.value })} className={campo} maxLength={300} />
          </Etiqueta>
          <Etiqueta texto={o.type === 'Universidad' ? 'Programas o centros de IA' : 'Cómo usan la IA'} requerido className="sm:col-span-2">
            <textarea value={o.aiUseCase} onChange={e => setO({ ...o, aiUseCase: e.target.value })} rows={3} className={campo} maxLength={1000} />
          </Etiqueta>
          <Etiqueta texto="Correo de contacto">
            <input type="email" value={o.contactEmail} onChange={e => setO({ ...o, contactEmail: e.target.value })} className={campo} maxLength={150} />
          </Etiqueta>
          <div className="self-end pb-2">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={o.hiringStatus} onChange={e => setO({ ...o, hiringStatus: e.target.checked })} className="h-4 w-4 accent-blue-600" />
              Está contratando
            </label>
          </div>
          {o.hiringStatus && (
            <Etiqueta texto="Cargos abiertos (separados por coma)" className="sm:col-span-2">
              <input value={o.openRoles} onChange={e => setO({ ...o, openRoles: e.target.value })} className={campo} />
            </Etiqueta>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          <Etiqueta texto="Nombre del evento" requerido className="sm:col-span-2">
            <input value={ev.title} onChange={e => setEv({ ...ev, title: e.target.value })} className={campo} maxLength={200} />
          </Etiqueta>
          <Etiqueta texto="Tipo" requerido>
            <select value={ev.type} onChange={e => setEv({ ...ev, type: e.target.value as EventType })} className={campo}>
              {TIPOS_EVENTO.map(t => <option key={t}>{t}</option>)}
            </select>
          </Etiqueta>
          <Etiqueta texto="Organiza" requerido>
            <input value={ev.organizer} onChange={e => setEv({ ...ev, organizer: e.target.value })} className={campo} maxLength={150} />
          </Etiqueta>
          <Etiqueta texto="Fecha de inicio" requerido>
            <input type="date" value={ev.fechaInicio} onChange={e => setEv({ ...ev, fechaInicio: e.target.value })} className={campo} />
          </Etiqueta>
          <Etiqueta texto="Fecha de término">
            <input type="date" value={ev.fechaFin} min={ev.fechaInicio || undefined} onChange={e => setEv({ ...ev, fechaFin: e.target.value })} className={campo} />
          </Etiqueta>
          <Etiqueta texto="Cierre de inscripciones">
            <input type="date" value={ev.fechaCierre} onChange={e => setEv({ ...ev, fechaCierre: e.target.value })} className={campo} />
          </Etiqueta>
          <Etiqueta texto="Región" requerido>{selectorRegion(ev.regionId, v => setEv({ ...ev, regionId: v }))}</Etiqueta>
          <Etiqueta texto="Lugar" requerido={!ev.isVirtual} className="sm:col-span-2">
            <input value={ev.locationName} onChange={e => setEv({ ...ev, locationName: e.target.value })} placeholder="Sede y ciudad" className={campo} maxLength={200} />
          </Etiqueta>
          <label className="sm:col-span-2 inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
            <input type="checkbox" checked={ev.isVirtual} onChange={e => setEv({ ...ev, isVirtual: e.target.checked })} className="h-4 w-4 accent-blue-600" />
            Es en línea
          </label>
          <Etiqueta texto="Enlace oficial (inscripción o bases)" requerido className="sm:col-span-2">
            <input value={ev.registrationUrl} onChange={e => setEv({ ...ev, registrationUrl: e.target.value })} placeholder="https://" className={campo} maxLength={250} inputMode="url" />
          </Etiqueta>
          <Etiqueta texto="Premios">
            <input value={ev.prizePool} onChange={e => setEv({ ...ev, prizePool: e.target.value })} className={campo} maxLength={100} />
          </Etiqueta>
          <Etiqueta texto="Temas (separados por coma)">
            <input value={ev.tags} onChange={e => setEv({ ...ev, tags: e.target.value })} className={campo} />
          </Etiqueta>
        </div>
      )}

      {error && <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
        {onCancelar && (
          <button type="button" onClick={onCancelar} className="rounded-xl border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={enviando}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 text-sm font-semibold cursor-pointer">
          {enviando && <Loader2 className="w-4 h-4 animate-spin" />} {textoBoton}
        </button>
      </div>
    </form>
  );
};
