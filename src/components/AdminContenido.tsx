import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Eye, EyeOff, Check, X, Calendar, Building2, Inbox, ExternalLink, RotateCcw } from 'lucide-react';
import type { ChileRegion, EcosystemEvent, Organization, PropuestaPublica } from '../types';
import { EVENTOS_VERIFICADOS } from '../data/datosBase';
import { conEstadoActual, porFecha } from '../lib/eventos';
import {
  aprobarPropuesta, eliminarEvento, eliminarOrganizacion, rechazarPropuesta, saveEventToFirestore,
  saveOrganizationToFirestore, subscribeEvents, subscribeOrganizations, subscribePropuestas,
} from '../services/firestoreService';
import { FormularioEntidad } from './FormularioEntidad';

export type SeccionContenido = 'propuestas' | 'eventos' | 'directorio';

interface AdminContenidoProps {
  seccion: SeccionContenido;
  regions: ChileRegion[];
  puedeEditar: boolean;
  busqueda: string;
  onNotify: (message: string, type?: 'success' | 'info' | 'copied') => void;
  onConteos?: (c: Record<SeccionContenido, number>) => void;
}

const boton = 'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800';
const IDS_VERIFICADOS = new Set(EVENTOS_VERIFICADOS.map(e => e.id));

/** Gestión de contenido público del Radar: propuestas pendientes, eventos y directorio. */
export const AdminContenido: React.FC<AdminContenidoProps> = ({ seccion, regions, puedeEditar, busqueda, onNotify, onConteos }) => {
  const [remotos, setRemotos] = useState<EcosystemEvent[]>([]);
  const [organizaciones, setOrganizaciones] = useState<Organization[]>([]);
  const [propuestas, setPropuestas] = useState<PropuestaPublica[]>([]);
  const [editando, setEditando] = useState<{ tipo: 'evento'; datos?: EcosystemEvent } | { tipo: 'organizacion'; datos?: Organization } | null>(null);

  useEffect(() => {
    const a = subscribeEvents(setRemotos, () => undefined);
    const b = subscribeOrganizations(setOrganizaciones, () => undefined);
    const c = subscribePropuestas(setPropuestas, () => onNotify('No se pudieron leer las propuestas. ¿Están publicadas las reglas de Firestore?', 'info'));
    return () => { a(); b(); c(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setEditando(null); }, [seccion]);

  /** Eventos verificados + los de Firestore (un documento con el mismo id reemplaza al verificado). */
  const eventos = useMemo(() => {
    const porId = new Map<string, EcosystemEvent>();
    EVENTOS_VERIFICADOS.forEach(e => porId.set(e.id, e));
    remotos.forEach(e => porId.set(e.id, e));
    return [...porId.values()].map(e => conEstadoActual(e)).sort(porFecha);
  }, [remotos]);

  useEffect(() => {
    onConteos?.({ propuestas: propuestas.length, eventos: eventos.filter(e => !e.oculto).length, directorio: organizaciones.length });
  }, [propuestas.length, eventos, organizaciones.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = busqueda.trim().toLowerCase();
  const coincide = (...t: (string | undefined)[]) => !q || t.some(x => x?.toLowerCase().includes(q));
  const region = (id: string) => regions.find(r => r.id === id)?.shortName || id;

  const ejecutar = async (accion: () => Promise<void>, exito: string) => {
    if (!puedeEditar) return onNotify('Acción no permitida en modo lector.', 'info');
    try { await accion(); onNotify(exito, 'success'); }
    catch (e) { console.warn(e); onNotify('No se pudo guardar. Revise su sesión y que las reglas de Firestore estén publicadas.', 'info'); }
  };

  const guardar = async (e: { tipo: 'evento'; datos: EcosystemEvent } | { tipo: 'organizacion'; datos: Organization }) => {
    if (e.tipo === 'evento') await saveEventToFirestore(e.datos);
    else await saveOrganizationToFirestore({ ...e.datos, verified: true });
    onNotify(e.tipo === 'evento' ? 'Evento guardado y publicado.' : 'Organización guardada y publicada.', 'success');
    setEditando(null);
  };

  const formulario = editando && (
    <div className="rounded-2xl border border-blue-200 bg-blue-50/40 dark:bg-blue-950/20 p-4 sm:p-5">
      <h4 className="font-bold text-slate-900 dark:text-white mb-3">
        {editando.datos ? 'Editar' : 'Agregar'} {editando.tipo === 'evento' ? 'evento' : 'organización'}
      </h4>
      <FormularioEntidad
        key={editando.datos?.id || editando.tipo}
        regions={regions}
        permitirCambioTipo={false}
        tipoInicial={editando.tipo}
        evento={editando.tipo === 'evento' ? editando.datos : undefined}
        organizacion={editando.tipo === 'organizacion' ? editando.datos : undefined}
        textoBoton="Guardar y publicar"
        onGuardar={guardar}
        onCancelar={() => setEditando(null)}
      />
    </div>
  );

  /* ---------- Propuestas ---------- */
  if (seccion === 'propuestas') {
    const lista = propuestas.filter(p => p.tipo === 'evento' ? coincide(p.datos.title, p.datos.organizer) : coincide(p.datos.name, p.datos.city));
    return (
      <Marco icono={Inbox} titulo="Propuestas del público" cantidad={lista.length}
        bajada="Eventos y organizaciones enviados desde el sitio. No se muestran hasta que usted los aprueba.">
        {lista.length === 0 ? <Vacio texto="No hay propuestas pendientes." /> : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {lista.map(p => (
              <li key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-start gap-3 justify-between">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${p.tipo === 'evento' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-700'}`}>
                      {p.tipo === 'evento' ? 'Evento' : p.datos.type}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{p.tipo === 'evento' ? p.datos.title : p.datos.name}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {p.tipo === 'evento'
                      ? `${p.datos.dateStr} · ${p.datos.organizer} · ${region(p.datos.regionId)} · ${p.datos.isVirtual ? 'En línea' : p.datos.locationName}`
                      : `${p.datos.sector} · ${region(p.datos.regionId)}${p.datos.city ? ` · ${p.datos.city}` : ''}${p.datos.contactEmail ? ` · ${p.datos.contactEmail}` : ''}`}
                  </p>
                  {p.tipo === 'organizacion' && p.datos.aiUseCase && <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">{p.datos.aiUseCase}</p>}
                  {(p.tipo === 'evento' ? p.datos.registrationUrl : p.datos.website) && (
                    <a href={p.tipo === 'evento' ? p.datos.registrationUrl : p.datos.website} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline">
                      Verificar enlace <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <p className="text-[11px] text-slate-400">Recibida el {new Date(p.createdAt).toLocaleString('es-CL')}</p>
                </div>
                {puedeEditar ? (
                  <div className="flex gap-2 flex-shrink-0">
                    <button type="button" onClick={() => ejecutar(() => aprobarPropuesta(p), 'Propuesta aprobada y publicada.')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer">
                      <Check className="w-3.5 h-3.5" /> Aprobar
                    </button>
                    <button type="button" onClick={() => { if (confirm('¿Rechazar y borrar esta propuesta?')) void ejecutar(() => rechazarPropuesta(p.id), 'Propuesta rechazada.'); }} className={boton}>
                      <X className="w-3.5 h-3.5" /> Rechazar
                    </button>
                  </div>
                ) : <SoloLectura />}
              </li>
            ))}
          </ul>
        )}
      </Marco>
    );
  }

  /* ---------- Eventos ---------- */
  if (seccion === 'eventos') {
    const lista = eventos.filter(e => coincide(e.title, e.organizer, e.locationName));
    return (
      <Marco icono={Calendar} titulo="Eventos" cantidad={lista.length}
        bajada="Los marcados como verificados vienen cargados en el sitio; puede editarlos u ocultarlos. Los estados se calculan con las fechas."
        accion={puedeEditar && !editando ? <button type="button" onClick={() => setEditando({ tipo: 'evento' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"><Plus className="w-4 h-4" /> Agregar evento</button> : null}>
        {formulario}
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {lista.map(e => {
            const verificado = IDS_VERIFICADOS.has(e.id);
            const editado = verificado && remotos.some(r => r.id === e.id);
            return (
              <li key={e.id} className={`py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between ${e.oculto ? 'opacity-55' : ''}`}>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{e.title}</span>
                    <Chip>{e.status}</Chip>
                    {verificado && <Chip color="emerald">{editado ? 'Verificado · editado' : 'Verificado'}</Chip>}
                    {e.oculto && <Chip color="rose">Oculto</Chip>}
                  </div>
                  <p className="text-xs text-slate-500">{e.dateStr} · {e.organizer} · {region(e.regionId)}</p>
                  {e.registrationUrl && <a href={e.registrationUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline">{e.registrationUrl.replace(/^https?:\/\//, '').slice(0, 60)} <ExternalLink className="w-3 h-3" /></a>}
                </div>
                {puedeEditar ? (
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <button type="button" className={boton} onClick={() => { setEditando({ tipo: 'evento', datos: e }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Pencil className="w-3.5 h-3.5" /> Editar</button>
                    <button type="button" className={boton} onClick={() => ejecutar(() => saveEventToFirestore({ ...e, oculto: !e.oculto }), e.oculto ? 'Evento visible otra vez.' : 'Evento oculto del sitio.')}>
                      {e.oculto ? <><Eye className="w-3.5 h-3.5" /> Mostrar</> : <><EyeOff className="w-3.5 h-3.5" /> Ocultar</>}
                    </button>
                    {editado && (
                      <button type="button" className={boton} onClick={() => ejecutar(() => eliminarEvento(e.id), 'Se restauró la versión verificada.')}><RotateCcw className="w-3.5 h-3.5" /> Restaurar</button>
                    )}
                    {!verificado && (
                      <button type="button" aria-label={`Eliminar ${e.title}`} className={`${boton} text-rose-600`} onClick={() => { if (confirm('¿Eliminar este evento?')) void ejecutar(() => eliminarEvento(e.id), 'Evento eliminado.'); }}><Trash2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                ) : <SoloLectura />}
              </li>
            );
          })}
        </ul>
      </Marco>
    );
  }

  /* ---------- Directorio ---------- */
  const lista = organizaciones.filter(o => coincide(o.name, o.city, o.sector, o.type)).sort((a, b) => a.name.localeCompare(b.name));
  return (
    <Marco icono={Building2} titulo="Directorio" cantidad={lista.length}
      bajada="Empresas, startups, centros de I+D y universidades que aparecen en el mapa. Para universidades, elija el tipo Universidad."
      accion={puedeEditar && !editando ? <button type="button" onClick={() => setEditando({ tipo: 'organizacion' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"><Plus className="w-4 h-4" /> Agregar organización</button> : null}>
      {formulario}
      {lista.length === 0 ? <Vacio texto="El directorio está vacío. Agregue la primera organización o apruebe una propuesta." /> : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {lista.map(o => (
            <li key={o.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{o.name}</span>
                  <Chip>{o.type}</Chip>
                  {o.hiringStatus && <Chip color="emerald">Contratando</Chip>}
                </div>
                <p className="text-xs text-slate-500">{o.sector} · {region(o.regionId)}{o.city ? ` · ${o.city}` : ''}</p>
                {o.website && <a href={o.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-700 hover:underline">{o.website.replace(/^https?:\/\//, '')} <ExternalLink className="w-3 h-3" /></a>}
              </div>
              {puedeEditar ? (
                <div className="flex gap-2 flex-shrink-0">
                  <button type="button" className={boton} onClick={() => { setEditando({ tipo: 'organizacion', datos: o }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Pencil className="w-3.5 h-3.5" /> Editar</button>
                  <button type="button" aria-label={`Eliminar ${o.name}`} className={`${boton} text-rose-600`} onClick={() => { if (confirm(`¿Eliminar ${o.name} del directorio?`)) void ejecutar(() => eliminarOrganizacion(o.id), 'Organización eliminada.'); }}><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              ) : <SoloLectura />}
            </li>
          ))}
        </ul>
      )}
    </Marco>
  );
};

const Marco: React.FC<{ icono: React.ElementType; titulo: string; cantidad: number; bajada: string; accion?: React.ReactNode; children: React.ReactNode }> = ({
  icono: Icono, titulo, cantidad, bajada, accion, children,
}) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
    <div className="pb-2 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icono className="w-4 h-4 text-blue-600" /> {titulo}
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-blue-100 text-blue-700 font-semibold font-mono">{cantidad}</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">{bajada}</p>
      </div>
      {accion}
    </div>
    {children}
  </div>
);

const Vacio: React.FC<{ texto: string }> = ({ texto }) => (
  <div className="py-12 text-center"><p className="text-sm font-medium text-slate-500">{texto}</p></div>
);

const SoloLectura: React.FC = () => (
  <span className="text-xs text-slate-400 italic px-2.5 py-1 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200/60 flex-shrink-0">Solo lectura</span>
);

const Chip: React.FC<{ color?: 'emerald' | 'rose'; children: React.ReactNode }> = ({ color, children }) => (
  <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
    color === 'emerald' ? 'bg-emerald-50 text-emerald-700' : color === 'rose' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
  }`}>{children}</span>
);
