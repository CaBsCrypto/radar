import React, { useEffect, useRef, useState } from 'react';
import { X, Sparkles, BadgeCheck, Inbox, Building2, Calendar, GraduationCap, ExternalLink } from 'lucide-react';
import type { ChileRegion, EcosystemEvent, McpSolicitud, Organization } from '../types';

interface PanelRegionProps {
  region: ChileRegion | null;
  organizations: Organization[];
  events: EcosystemEvent[];
  solicitudes: McpSolicitud[];
  onCerrar: () => void;
  onCotizar: (regionId: string) => void;
}

const Seccion: React.FC<{ icono: React.ElementType; titulo: string; cantidad?: number; children: React.ReactNode }> = ({
  icono: Icono, titulo, cantidad, children,
}) => (
  <section className="py-5 border-t border-slate-100 dark:border-slate-800">
    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white mb-3">
      <Icono className="w-4 h-4 text-blue-600 dark:text-blue-400" /> {titulo}
      {cantidad !== undefined && <span className="ml-auto text-xs font-medium text-slate-500 tabular-nums">{cantidad}</span>}
    </h3>
    {children}
  </section>
);

const Vacio: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-slate-500 dark:text-slate-400">{children}</p>
);

/**
 * Detalle de una región: panel lateral en escritorio y hoja inferior en celular.
 * No bloquea el mapa en escritorio, así se puede pasar de una región a otra con un clic.
 */
export const PanelRegion: React.FC<PanelRegionProps> = ({ region, organizations, events, solicitudes, onCerrar, onCotizar }) => {
  const [verTodas, setVerTodas] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setVerTodas(false);
    if (!region) return;
    cerrarRef.current?.focus({ preventScroll: true });
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [region, onCerrar]);

  if (!region) return null;

  const deRegion = solicitudes.filter(s => s.regionId === region.id);
  const conectadas = deRegion.filter(s => s.estado === 'conectada');
  const conNombre = conectadas.filter(s => s.consiente && s.empresa);
  const postulando = deRegion.filter(s => s.estado !== 'conectada');
  const metodosPedidos = Object.entries(
    postulando.flatMap(s => s.metodos || []).reduce<Record<string, number>>((a, m) => { a[m] = (a[m] || 0) + 1; return a; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const empresas = organizations.filter(o => o.regionId === region.id);
  const eventos = events.filter(e => e.regionId === region.id && e.status !== 'Finalizado');
  const universidades = region.universitiesWithAI || [];
  const empresasVisibles = verTodas ? empresas : empresas.slice(0, 6);

  const cifras: [string, number][] = [
    ['Solicitudes', deRegion.length],
    ['Conectadas MCP', conectadas.length],
    ['Empresas', empresas.length],
    ['Eventos', eventos.length],
  ];

  return (
    <>
      {/* Fondo oscuro solo en celular, donde la hoja cubre el mapa */}
      <div className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" onClick={onCerrar} aria-hidden />
      <aside
        role="dialog" aria-modal="false" aria-labelledby="panel-region-titulo"
        className="fixed z-50 bg-white dark:bg-slate-900 shadow-2xl border-slate-200 dark:border-slate-800 overflow-y-auto
          inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t
          lg:inset-x-auto lg:right-0 lg:top-0 lg:bottom-0 lg:max-h-none lg:w-[420px] lg:rounded-none lg:border-t-0 lg:border-l
          animate-[aparecer_.3s_ease-out] motion-reduce:animate-none"
      >
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-6 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300 lg:hidden" aria-hidden />
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-slate-500">Región {region.romanNumeral} · {region.zone}</p>
              <h2 id="panel-region-titulo" className="font-['Outfit'] font-bold text-2xl leading-tight text-slate-900 dark:text-white">{region.name}</h2>
              <p className="text-sm text-slate-500">Capital: {region.capital}</p>
            </div>
            <button ref={cerrarRef} type="button" onClick={onCerrar} aria-label="Cerrar detalle de la región"
              className="p-2 -mr-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 pb-8">
          <dl className="grid grid-cols-4 gap-2 py-5">
            {cifras.map(([t, n]) => (
              <div key={t} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-2 py-2.5 text-center">
                <dd className="font-['Outfit'] font-bold text-xl text-slate-900 dark:text-white tabular-nums">{n}</dd>
                <dt className="text-[11px] leading-tight text-slate-500 mt-0.5">{t}</dt>
              </div>
            ))}
          </dl>

          <button type="button" onClick={() => onCotizar(region.id)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-3 mb-1 cursor-pointer transition-colors">
            <Sparkles className="w-4 h-4 flex-shrink-0" /> Cotizar una empresa de {region.shortName}
          </button>

          <Seccion icono={BadgeCheck} titulo="Empresas conectadas con MCP" cantidad={conectadas.length}>
            {conectadas.length === 0 ? <Vacio>Aún no hay empresas conectadas en esta región.</Vacio> : (
              <ul className="space-y-1.5">
                {conNombre.map(s => (
                  <li key={s.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{s.empresa}</span>
                    <span className="text-xs text-slate-500">{s.metodos.length} métodos MCP</span>
                  </li>
                ))}
                {conectadas.length > conNombre.length && (
                  <li className="text-sm text-slate-500">{conectadas.length - conNombre.length} más, sin nombre publicado.</li>
                )}
              </ul>
            )}
          </Seccion>

          <Seccion icono={Inbox} titulo="Postulantes del cotizador" cantidad={postulando.length}>
            {postulando.length === 0 ? <Vacio>Ninguna empresa de esta región se ha cotizado todavía.</Vacio> : (
              <>
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                  {postulando.length} {postulando.length === 1 ? 'empresa espera' : 'empresas esperan'} ser conectadas. Métodos más pedidos:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {metodosPedidos.map(([m, n]) => (
                    <code key={m} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs">
                      {m}(){n > 1 ? ` ×${n}` : ''}
                    </code>
                  ))}
                </div>
              </>
            )}
          </Seccion>

          <Seccion icono={Building2} titulo="Empresas del directorio" cantidad={empresas.length}>
            {empresas.length === 0 ? <Vacio>No hay empresas registradas en esta región.</Vacio> : (
              <>
                <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                  {empresasVisibles.map(o => (
                    <li key={o.id} className="py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{o.name}</p>
                        {o.website && (
                          <a href={o.website.startsWith('http') ? o.website : `https://${o.website}`} target="_blank" rel="noopener noreferrer"
                            className="text-slate-400 hover:text-blue-600 flex-shrink-0" aria-label={`Sitio web de ${o.name}`}>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{o.type} · {o.sector}{o.city ? ` · ${o.city}` : ''}</p>
                    </li>
                  ))}
                </ul>
                {empresas.length > 6 && (
                  <button type="button" onClick={() => setVerTodas(v => !v)} className="mt-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline cursor-pointer">
                    {verTodas ? 'Ver menos' : `Ver las ${empresas.length}`}
                  </button>
                )}
              </>
            )}
          </Seccion>

          <Seccion icono={Calendar} titulo="Eventos vigentes" cantidad={eventos.length}>
            {eventos.length === 0 ? <Vacio>No hay eventos próximos en esta región.</Vacio> : (
              <ul className="space-y-2.5">
                {eventos.slice(0, 5).map(e => (
                  <li key={e.id} className="text-sm">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{e.title}</p>
                    <p className="text-xs text-slate-500">{e.type} · {e.dateStr}{e.isVirtual ? ' · En línea' : ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </Seccion>

          <Seccion icono={GraduationCap} titulo="Universidades con IA" cantidad={universidades.length}>
            {universidades.length === 0 ? <Vacio>Sin registros en esta región.</Vacio> : (
              <div className="flex flex-wrap gap-1.5">
                {universidades.map(u => (
                  <span key={u} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">{u}</span>
                ))}
              </div>
            )}
          </Seccion>

          {region.description && (
            <p className="pt-5 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{region.description}</p>
          )}
        </div>
      </aside>
    </>
  );
};
