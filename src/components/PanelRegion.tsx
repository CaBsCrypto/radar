import React, { useEffect, useRef, useState } from 'react';
import {
  X, Sparkles, BadgeCheck, Inbox, Building2, Calendar, GraduationCap, ExternalLink, Bot, Plus, Clock, MapPin, Users,
} from 'lucide-react';
import type { CapaMapa, ChileRegion, EcosystemEvent, McpSolicitud, Organization } from '../types';
import { WEBMCP_COMPANIES } from '../data/mockData';

interface PanelRegionProps {
  region: ChileRegion | null;
  /** Capa activa del mapa: define qué muestra el panel. */
  capa: CapaMapa;
  organizations: Organization[];
  events: EcosystemEvent[];
  solicitudes: McpSolicitud[];
  onCerrar: () => void;
  onCotizar: (regionId: string) => void;
  /** Abre el formulario para publicar un evento o sumar una organización. */
  onAgregar?: () => void;
}

const TITULO_CAPA: Record<CapaMapa, { texto: string; icono: React.ElementType }> = {
  solicitudes: { texto: 'Solicitudes MCP', icono: Inbox },
  webmcp: { texto: 'Empresas WebMCP', icono: Bot },
  eventos: { texto: 'Eventos', icono: Calendar },
  startups: { texto: 'Startups y organizaciones', icono: Building2 },
  universidades: { texto: 'Universidades y talento', icono: GraduationCap },
};

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

const Cifras: React.FC<{ datos: [string, number | string][] }> = ({ datos }) => (
  <dl className={`grid gap-2 py-5 ${datos.length === 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
    {datos.map(([t, n]) => (
      <div key={t} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 px-2 py-2.5 text-center">
        <dd className="font-['Outfit'] font-bold text-xl text-slate-900 dark:text-white tabular-nums">
          {typeof n === 'number' ? n.toLocaleString('es-CL') : n}
        </dd>
        <dt className="text-[11px] leading-tight text-slate-500 mt-0.5">{t}</dt>
      </div>
    ))}
  </dl>
);

const Accion: React.FC<{ icono: React.ElementType; onClick: () => void; children: React.ReactNode; secundaria?: boolean }> = ({
  icono: Icono, onClick, children, secundaria,
}) => (
  <button type="button" onClick={onClick}
    className={`w-full inline-flex items-center justify-center gap-2 rounded-xl font-semibold px-4 py-3 mb-1 cursor-pointer transition-colors ${
      secundaria
        ? 'border border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40'
        : 'bg-blue-600 hover:bg-blue-700 text-white'
    }`}>
    <Icono className="w-4 h-4 flex-shrink-0" /> {children}
  </button>
);

const Etiquetas: React.FC<{ items: string[]; codigo?: boolean }> = ({ items, codigo }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map(t => codigo ? (
      <code key={t} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-xs">{t}</code>
    ) : (
      <span key={t} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300">{t}</span>
    ))}
  </div>
);

const enlace = (url: string) => (url.startsWith('http') ? url : `https://${url}`);

/**
 * Detalle de una región según la capa activa del mapa: panel lateral en escritorio y hoja inferior en celular.
 * No bloquea el mapa en escritorio, así se puede pasar de una región a otra con un clic.
 */
export const PanelRegion: React.FC<PanelRegionProps> = ({
  region, capa, organizations, events, solicitudes, onCerrar, onCotizar, onAgregar,
}) => {
  const [verTodas, setVerTodas] = useState(false);
  const cerrarRef = useRef<HTMLButtonElement>(null);
  // Referencia estable: el padre suele pasar una función nueva en cada render.
  const alCerrar = useRef(onCerrar);
  alCerrar.current = onCerrar;

  useEffect(() => {
    setVerTodas(false);
    if (!region) return;
    cerrarRef.current?.focus({ preventScroll: true });
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') alCerrar.current(); };
    document.addEventListener('keydown', alTeclear);
    return () => document.removeEventListener('keydown', alTeclear);
  }, [region, capa]);

  if (!region) return null;

  const { texto: tituloCapa, icono: IconoCapa } = TITULO_CAPA[capa];

  const contenido = (() => {
    switch (capa) {
      case 'solicitudes': return <CapaSolicitudes region={region} solicitudes={solicitudes} onCotizar={onCotizar} />;
      case 'webmcp': return <CapaWebMcp region={region} solicitudes={solicitudes} onCotizar={onCotizar} />;
      case 'eventos': return <CapaEventos region={region} events={events} onAgregar={onAgregar} />;
      case 'startups': return (
        <CapaStartups region={region} organizations={organizations} verTodas={verTodas} setVerTodas={setVerTodas} onAgregar={onAgregar} />
      );
      case 'universidades': return <CapaUniversidades region={region} />;
    }
  })();

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
          <p data-capa-panel={capa} className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/50 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <IconoCapa className="w-3.5 h-3.5" /> {tituloCapa}
          </p>
        </div>

        <div className="px-6 pb-8">
          {contenido}
          {region.description && (
            <p className="pt-5 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{region.description}</p>
          )}
        </div>
      </aside>
    </>
  );
};

/* ---------- Solicitudes del cotizador ---------- */
const CapaSolicitudes: React.FC<{ region: ChileRegion; solicitudes: McpSolicitud[]; onCotizar: (id: string) => void }> = ({
  region, solicitudes, onCotizar,
}) => {
  const deRegion = solicitudes.filter(s => s.regionId === region.id);
  const conectadas = deRegion.filter(s => s.estado === 'conectada');
  const conNombre = conectadas.filter(s => s.consiente && s.empresa);
  const postulando = deRegion.filter(s => s.estado !== 'conectada');
  const metodosPedidos = Object.entries(
    deRegion.flatMap(s => s.metodos || []).reduce<Record<string, number>>((a, m) => { a[m] = (a[m] || 0) + 1; return a; }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <>
      <Cifras datos={[['Solicitudes', deRegion.length], ['Conectadas', conectadas.length], ['Postulando', postulando.length]]} />
      <Accion icono={Sparkles} onClick={() => onCotizar(region.id)}>Cotizar una empresa de {region.shortName}</Accion>

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
        {postulando.length === 0 ? <Vacio>Ninguna empresa de esta región espera ser conectada.</Vacio> : (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {postulando.length} {postulando.length === 1 ? 'empresa espera' : 'empresas esperan'} ser conectadas por Browns Studio.
          </p>
        )}
      </Seccion>

      <Seccion icono={Bot} titulo="Métodos MCP más pedidos" cantidad={metodosPedidos.length || undefined}>
        {metodosPedidos.length === 0 ? <Vacio>Cuando una empresa de la región se cotice, aquí verá qué acciones pidió.</Vacio> : (
          <Etiquetas codigo items={metodosPedidos.map(([m, n]) => `${m}()${n > 1 ? ` ×${n}` : ''}`)} />
        )}
      </Seccion>
    </>
  );
};

/* ---------- Empresas WebMCP del Radar ---------- */
const CapaWebMcp: React.FC<{ region: ChileRegion; solicitudes: McpSolicitud[]; onCotizar: (id: string) => void }> = ({
  region, solicitudes, onCotizar,
}) => {
  const casos = WEBMCP_COMPANIES.filter(c => c.regionId === region.id);
  const conectadas = solicitudes.filter(s => s.regionId === region.id && s.estado === 'conectada');
  const metodos = casos.reduce((s, c) => s + c.exposedToolsCount, 0);

  return (
    <>
      <Cifras datos={[['Empresas WebMCP', region.webmcpCount || 0], ['Casos documentados', casos.length], ['Métodos expuestos', metodos]]} />
      <Accion icono={Sparkles} onClick={() => onCotizar(region.id)}>Sumar una empresa de {region.shortName}</Accion>

      <Seccion icono={Bot} titulo="Casos documentados" cantidad={casos.length}>
        {casos.length === 0 ? (
          <Vacio>
            Esta región registra {region.webmcpCount || 0} {region.webmcpCount === 1 ? 'empresa' : 'empresas'} con WebMCP,
            sin un caso documentado todavía en el Radar.
          </Vacio>
        ) : (
          <ul className="space-y-4">
            {casos.map(c => (
              <li key={c.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    c.status === 'En Producción' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                  }`}>{c.status}</span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{c.sector} · {c.city}</p>
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 leading-snug">{c.tagline}</p>
                <Etiquetas codigo items={c.tools.map(t => `${t.name}()`)} />
                {c.website && (
                  <a href={enlace(c.website)} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline">
                    Sitio web <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Seccion>

      {conectadas.length > 0 && (
        <Seccion icono={BadgeCheck} titulo="Conectadas por el cotizador" cantidad={conectadas.length}>
          <Etiquetas items={conectadas.map(s => (s.consiente && s.empresa) || 'Empresa sin nombre publicado')} />
        </Seccion>
      )}
    </>
  );
};

/* ---------- Eventos ---------- */
const CapaEventos: React.FC<{ region: ChileRegion; events: EcosystemEvent[]; onAgregar?: () => void }> = ({ region, events, onAgregar }) => {
  const vigentes = events.filter(e => e.regionId === region.id && e.status !== 'Finalizado');
  const enCurso = vigentes.filter(e => e.status === 'En Curso').length;
  const finalizados = events.filter(e => e.regionId === region.id && e.status === 'Finalizado').length;

  return (
    <>
      <Cifras datos={[['Vigentes', vigentes.length], ['En curso', enCurso], ['Realizados', finalizados]]} />
      {onAgregar && <Accion icono={Plus} secundaria onClick={onAgregar}>Publicar un evento en {region.shortName}</Accion>}

      <Seccion icono={Calendar} titulo="Próximos y en curso" cantidad={vigentes.length}>
        {vigentes.length === 0 ? <Vacio>No hay eventos próximos en esta región.</Vacio> : (
          <ul className="space-y-3">
            {vigentes.map(e => (
              <li key={e.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white leading-snug">{e.title}</p>
                  {e.status === 'En Curso' && (
                    <span className="flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">En curso</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{e.type} · {e.organizer}</p>
                <ul className="mt-2.5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {e.dateStr}</li>
                  <li className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {e.isVirtual ? 'En línea' : e.locationName}</li>
                  {e.registrationDeadline && (
                    <li className={`flex items-center gap-2 ${e.isRegistrationUrgent ? 'text-rose-600 dark:text-rose-400 font-medium' : ''}`}>
                      <Clock className="w-3.5 h-3.5" /> Inscripción hasta {e.registrationDeadline}
                    </li>
                  )}
                </ul>
                {e.registrationUrl && (
                  <a href={enlace(e.registrationUrl)} target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 dark:text-blue-300 hover:underline">
                    Inscribirse <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </Seccion>
    </>
  );
};

/* ---------- Startups y organizaciones ---------- */
const CapaStartups: React.FC<{
  region: ChileRegion; organizations: Organization[]; verTodas: boolean; setVerTodas: (f: (v: boolean) => boolean) => void; onAgregar?: () => void;
}> = ({ region, organizations, verTodas, setVerTodas, onAgregar }) => {
  const empresas = organizations.filter(o => o.regionId === region.id);
  const visibles = verTodas ? empresas : empresas.slice(0, 6);
  const contratando = empresas.filter(o => o.hiringStatus).length;

  return (
    <>
      <Cifras datos={[['Startups', region.startupsCount || 0], ['Hubs de IA', region.aiHubsCount || 0], ['Contratando', contratando]]} />
      {onAgregar && <Accion icono={Plus} secundaria onClick={onAgregar}>Sumar mi organización</Accion>}

      {(region.keySectors?.length > 0 || region.topSpecialty) && (
        <Seccion icono={Sparkles} titulo="Sectores fuertes">
          {region.topSpecialty && <p className="text-sm text-slate-700 dark:text-slate-300 mb-2.5">{region.topSpecialty}</p>}
          <Etiquetas items={region.keySectors || []} />
        </Seccion>
      )}

      <Seccion icono={Building2} titulo="En el directorio" cantidad={empresas.length}>
        {empresas.length === 0 ? <Vacio>No hay organizaciones registradas en esta región.</Vacio> : (
          <>
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibles.map(o => (
                <li key={o.id} className="py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{o.name}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {o.hiringStatus && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">Contratando</span>
                      )}
                      {o.website && (
                        <a href={enlace(o.website)} target="_blank" rel="noopener noreferrer"
                          className="text-slate-400 hover:text-blue-600" aria-label={`Sitio web de ${o.name}`}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">{o.type} · {o.sector}{o.city ? ` · ${o.city}` : ''}</p>
                  {o.tagline && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-snug">{o.tagline}</p>}
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
    </>
  );
};

/* ---------- Universidades y talento ---------- */
const CapaUniversidades: React.FC<{ region: ChileRegion }> = ({ region }) => {
  const universidades = region.universitiesWithAI || [];
  const t = region.talentBreakdown;

  return (
    <>
      <Cifras datos={[
        ['Universidades con IA', universidades.length],
        ['Desarrolladores IA', t?.totalDevs ?? region.activeDevelopers ?? '—'],
        ['Cargos abiertos', t?.openTechRolesCount ?? '—'],
      ]} />

      <Seccion icono={GraduationCap} titulo="Universidades con IA" cantidad={universidades.length}>
        {universidades.length === 0 ? <Vacio>Sin registros en esta región.</Vacio> : (
          <ul className="space-y-1.5">
            {universidades.map(u => <li key={u} className="text-sm font-medium text-slate-800 dark:text-slate-100">{u}</li>)}
          </ul>
        )}
      </Seccion>

      {t && (
        <Seccion icono={Users} titulo="Talento en la región">
          <p className="text-sm text-slate-700 dark:text-slate-300 mb-1"><span className="font-semibold">{t.densityTier}</span></p>
          {t.topSpecialtySummary && <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 leading-snug">{t.topSpecialtySummary}</p>}
          {t.topAISpecialties?.length > 0 && (
            <>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">Especialidades</p>
              <div className="mb-3"><Etiquetas items={t.topAISpecialties} /></div>
            </>
          )}
          {t.topTechStack?.length > 0 && (
            <>
              <p className="text-xs font-semibold text-slate-500 mb-1.5">Tecnologías más usadas</p>
              <Etiquetas items={t.topTechStack} />
            </>
          )}
        </Seccion>
      )}
    </>
  );
};
