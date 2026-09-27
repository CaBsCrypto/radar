import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Map as MapIcon, List, Search, Inbox, Bot, Calendar, Building2, GraduationCap, ArrowUpDown } from 'lucide-react';
import type { ChileRegion, EcosystemEvent, McpSolicitud, Organization } from '../types';
import { CHILE_REGION_CENTROIDS, CHILE_REGION_PATHS } from '../data/chileRegionsGeo';
import { PanelRegion } from './PanelRegion';

/** Capas del mapa de coropletas. */
export type CapaMapa = 'solicitudes' | 'webmcp' | 'eventos' | 'startups' | 'universidades';

interface MapaRegionesProps {
  regions: ChileRegion[];
  organizations: Organization[];
  events: EcosystemEvent[];
  solicitudes: McpSolicitud[];
  capaInicial?: CapaMapa;
  /** Región que se abre al llegar (por ejemplo, desde el cotizador). */
  regionInicial?: string | null;
  onSeleccionRegion?: (regionId: string | null) => void;
  onCotizarEnRegion: (regionId: string) => void;
}

/* ---------- escala secuencial: un tono, de claro a oscuro; gris neutro = sin datos ---------- */
const SIN_DATOS = '#e2e8f0'; // slate-200
const ESCALA = ['#bfdbfe', '#60a5fa', '#2563eb', '#1e3a8a']; // blue-200, 400, 600, 900

interface Clase { color: string; desde: number; hasta: number }

/** Intervalos iguales sobre (0, máximo]. Con pocos valores distintos se usan los tonos más oscuros. */
function clasesPara(maximo: number): Clase[] {
  if (maximo <= 0) return [];
  const n = Math.min(ESCALA.length, maximo);
  const clases: Clase[] = [];
  let desde = 1;
  for (let k = 1; k <= n; k++) {
    const hasta = Math.ceil((maximo * k) / n);
    if (hasta >= desde) clases.push({ color: ESCALA[ESCALA.length - n + k - 1], desde, hasta });
    desde = hasta + 1;
  }
  return clases;
}
const colorPara = (valor: number, clases: Clase[]) =>
  valor <= 0 ? SIN_DATOS : (clases.find(c => valor <= c.hasta) || clases[clases.length - 1]).color;

/* ---------- geometría: borde este de cada región a la altura de su centro (para las etiquetas) ---------- */
const bordeEste = (path: string, y: number): number => {
  const pts = [...path.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map(m => ({ x: Number(m[1]), y: Number(m[2]) }));
  const cerca = pts.filter(p => Math.abs(p.y - y) < 14);
  return Math.max(...(cerca.length ? cerca : pts).map(p => p.x));
};
const BORDE_ESTE: Record<string, number> = Object.fromEntries(
  Object.entries(CHILE_REGION_CENTROIDS).map(([id, c]) => [id, bordeEste(CHILE_REGION_PATHS[id], c.y)])
);
const VIEWBOX = '34 12 250 800';

export const MapaRegiones: React.FC<MapaRegionesProps> = ({
  regions, organizations, events, solicitudes, capaInicial = 'solicitudes', regionInicial = null,
  onSeleccionRegion, onCotizarEnRegion,
}) => {
  const [capa, setCapa] = useState<CapaMapa>(capaInicial);
  const [vista, setVista] = useState<'mapa' | 'lista'>('mapa');
  const [seleccion, setSeleccion] = useState<string | null>(regionInicial);
  const [encima, setEncima] = useState<{ id: string; x: number; y: number } | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<{ col: 'nombre' | 'valor'; desc: boolean }>({ col: 'valor', desc: true });
  const lienzoRef = useRef<HTMLDivElement>(null);

  useEffect(() => { onSeleccionRegion?.(seleccion); }, [seleccion, onSeleccionRegion]);

  /* ---------- valores por capa ---------- */
  const solicitudesPor = useMemo(() => {
    const m: Record<string, { total: number; conectadas: number }> = {};
    solicitudes.forEach(s => {
      const c = m[s.regionId] || (m[s.regionId] = { total: 0, conectadas: 0 });
      c.total += 1; if (s.estado === 'conectada') c.conectadas += 1;
    });
    return m;
  }, [solicitudes]);

  const eventosPor = useMemo(() => {
    const m: Record<string, number> = {};
    events.filter(e => e.status !== 'Finalizado').forEach(e => { m[e.regionId] = (m[e.regionId] || 0) + 1; });
    return m;
  }, [events]);

  const CAPAS: { id: CapaMapa; etiqueta: string; icono: React.ElementType; unidad: [string, string]; valor: (r: ChileRegion) => number }[] = [
    { id: 'solicitudes', etiqueta: 'Solicitudes MCP', icono: Inbox, unidad: ['solicitud', 'solicitudes'], valor: r => solicitudesPor[r.id]?.total || 0 },
    { id: 'webmcp', etiqueta: 'Empresas WebMCP', icono: Bot, unidad: ['empresa WebMCP', 'empresas WebMCP'], valor: r => r.webmcpCount || 0 },
    { id: 'eventos', etiqueta: 'Eventos', icono: Calendar, unidad: ['evento vigente', 'eventos vigentes'], valor: r => eventosPor[r.id] || 0 },
    { id: 'startups', etiqueta: 'Startups', icono: Building2, unidad: ['startup', 'startups'], valor: r => r.startupsCount || 0 },
    { id: 'universidades', etiqueta: 'Universidades', icono: GraduationCap, unidad: ['universidad con IA', 'universidades con IA'], valor: r => r.universitiesWithAI?.length || 0 },
  ];
  const capaActual = CAPAS.find(c => c.id === capa) || CAPAS[0];
  const valorDe = (r: ChileRegion) => capaActual.valor(r);
  const unidad = (n: number) => `${n.toLocaleString('es-CL')} ${n === 1 ? capaActual.unidad[0] : capaActual.unidad[1]}`;

  const maximo = Math.max(0, ...regions.map(valorDe));
  const clases = clasesPara(maximo);
  const conDatos = regions.filter(r => valorDe(r) > 0);
  const total = regions.reduce((s, r) => s + valorDe(r), 0);
  const ranking = [...conDatos].sort((a, b) => valorDe(b) - valorDe(a)).slice(0, 5);

  const resumen = capa === 'solicitudes'
    ? (solicitudes.length
        ? `${solicitudes.length} ${solicitudes.length === 1 ? 'solicitud' : 'solicitudes'} en ${conDatos.length} ${conDatos.length === 1 ? 'región' : 'regiones'}. ${(() => { const n = solicitudes.filter(s => s.estado === 'conectada').length; return `${n} ${n === 1 ? 'conectada' : 'conectadas'} con MCP.`; })()}`
        : 'Todavía no hay solicitudes. Cada empresa que se cotiza enciende su región.')
    : `${unidad(total)} en ${conDatos.length} de 16 regiones.`;

  /* ---------- etiquetas: solo regiones con datos, sin encimarse ---------- */
  const etiquetas = (() => {
    const lista = regions
      .filter(r => valorDe(r) > 0 || r.id === seleccion)
      .map(r => ({ r, y: CHILE_REGION_CENTROIDS[r.id]?.y ?? 0, x: (BORDE_ESTE[r.id] ?? 150) + 6 }))
      .sort((a, b) => a.y - b.y);
    let piso = -Infinity;
    return lista.map(e => { const y = Math.max(e.y, piso + 15); piso = y; return { ...e, yTexto: y }; });
  })();

  const elegir = (id: string) => setSeleccion(prev => (prev === id ? null : id));

  const moverEncima = (e: React.MouseEvent, id: string) => {
    const caja = lienzoRef.current?.getBoundingClientRect();
    if (caja) setEncima({ id, x: e.clientX - caja.left, y: e.clientY - caja.top });
  };

  const buscar = (texto: string) => {
    setBusqueda(texto);
    const t = texto.trim().toLowerCase();
    if (t.length < 3) return;
    const r = regions.find(x => [x.name, x.shortName, x.capital].some(v => v.toLowerCase().includes(t)));
    if (r) setSeleccion(r.id);
  };

  const regionesTabla = [...regions].sort((a, b) => {
    const d = orden.col === 'nombre' ? a.name.localeCompare(b.name) : valorDe(a) - valorDe(b);
    return orden.desc ? -d : d;
  });

  const regionSeleccionada = regions.find(r => r.id === seleccion) || null;
  const regionEncima = regions.find(r => r.id === encima?.id) || null;

  return (
    <div className="pb-6">
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        {/* Encabezado y controles */}
        <header className="px-5 sm:px-7 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <h1 className="font-['Outfit'] font-bold text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white">
              Ecosistema de IA en Chile
            </h1>
            <p className="mt-1 text-[15px] text-slate-600 dark:text-slate-400">{resumen}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">Buscar región</span>
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={busqueda} onChange={e => buscar(e.target.value)} placeholder="Buscar región o ciudad"
                className="w-48 pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40" />
            </label>
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-slate-700 p-0.5" role="group" aria-label="Vista">
              {([['mapa', 'Mapa', MapIcon], ['lista', 'Tabla', List]] as const).map(([v, t, Icono]) => (
                <button key={v} type="button" onClick={() => setVista(v)} aria-pressed={vista === v}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer ${
                    vista === v ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}>
                  <Icono className="w-4 h-4" /> {t}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Capas */}
        <nav className="px-5 sm:px-7 py-3 flex gap-1.5 overflow-x-auto border-b border-slate-100 dark:border-slate-800" aria-label="Capa del mapa">
          {CAPAS.map(c => (
            <button key={c.id} type="button" onClick={() => setCapa(c.id)} aria-pressed={capa === c.id}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                capa === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}>
              <c.icono className="w-4 h-4" /> {c.etiqueta}
            </button>
          ))}
        </nav>

        {vista === 'mapa' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)] gap-6 px-5 sm:px-7 py-6">
            {/* Leyenda y regiones destacadas */}
            <aside className="order-2 lg:order-1 space-y-6">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">{capaActual.etiqueta} por región</h2>
                <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2.5"><span className="w-5 h-3.5 rounded-sm border border-slate-300" style={{ background: SIN_DATOS }} /> Sin datos</li>
                  {clases.map(c => (
                    <li key={c.color} className="flex items-center gap-2.5">
                      <span className="w-5 h-3.5 rounded-sm" style={{ background: c.color }} />
                      {c.desde === c.hasta ? c.desde : `${c.desde} a ${c.hasta}`}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">Regiones con más {capaActual.unidad[1]}</h2>
                {ranking.length === 0 ? (
                  <p className="text-sm text-slate-500">Aún no hay datos en esta capa.</p>
                ) : (
                  <ol className="space-y-1">
                    {ranking.map(r => (
                      <li key={r.id}>
                        <button type="button" onClick={() => elegir(r.id)}
                          className={`w-full text-left rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${seleccion === r.id ? 'bg-blue-50 dark:bg-blue-950/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                          <span className="flex justify-between text-sm">
                            <span className="text-slate-800 dark:text-slate-100 font-medium">{r.shortName}</span>
                            <span className="text-slate-600 dark:text-slate-300 tabular-nums">{valorDe(r).toLocaleString('es-CL')}</span>
                          </span>
                          <span className="block mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <span className="block h-full rounded-full bg-blue-600" style={{ width: `${(valorDe(r) / maximo) * 100}%` }} />
                          </span>
                        </button>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Haga clic en una región para ver sus empresas, postulantes y eventos.
              </p>
            </aside>

            {/* Mapa */}
            <div ref={lienzoRef} className={`order-1 lg:order-2 relative flex transition-all duration-300 ${seleccion ? 'justify-center lg:justify-start' : 'justify-center'}`} onMouseLeave={() => setEncima(null)}>
              <svg viewBox={VIEWBOX} role="group" aria-label={`Mapa de Chile por regiones: ${capaActual.etiqueta}`}
                className="h-[calc(100vh-330px)] max-h-[760px] min-h-[500px] w-auto select-none">
                {regions.map(r => {
                  const d = CHILE_REGION_PATHS[r.id];
                  if (!d || r.id === seleccion) return null;
                  const v = valorDe(r);
                  return (
                    <path key={r.id} d={d} fill={colorPara(v, clases)}
                      stroke="#ffffff" strokeWidth={0.8} strokeLinejoin="round"
                      className="cursor-pointer outline-none transition-[fill,opacity] duration-300 hover:opacity-80 focus-visible:opacity-80"
                      style={{ opacity: seleccion && seleccion !== r.id ? 0.55 : 1 }}
                      tabIndex={0} role="button" aria-label={`${r.name}: ${unidad(v)}`}
                      onClick={() => elegir(r.id)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(r.id); } }}
                      onMouseMove={e => moverEncima(e, r.id)}
                      onFocus={() => setEncima(null)}
                    />
                  );
                })}
                {/* La región elegida se dibuja al final, con borde marcado, para que quede encima */}
                {regionSeleccionada && CHILE_REGION_PATHS[regionSeleccionada.id] && (
                  <path d={CHILE_REGION_PATHS[regionSeleccionada.id]} fill={colorPara(valorDe(regionSeleccionada), clases)}
                    stroke="#0f172a" strokeWidth={1.6} strokeLinejoin="round" className="cursor-pointer"
                    tabIndex={0} role="button" aria-label={`${regionSeleccionada.name}, seleccionada: ${unidad(valorDe(regionSeleccionada))}`}
                    onClick={() => elegir(regionSeleccionada.id)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(regionSeleccionada.id); } }}
                    onMouseMove={e => moverEncima(e, regionSeleccionada.id)} />
                )}
                {/* Etiquetas solo donde hay datos */}
                {etiquetas.map(({ r, x, y, yTexto }) => (
                  <g key={r.id} className="pointer-events-none">
                    {Math.abs(yTexto - y) > 2 && <path d={`M${x - 3},${y} L${x + 2},${yTexto}`} stroke="#94a3b8" strokeWidth={0.6} fill="none" />}
                    <text x={x + 3} y={yTexto + 3.5} fontSize={11} fontFamily="system-ui, sans-serif"
                      fill={r.id === seleccion ? '#0f172a' : '#334155'} fontWeight={r.id === seleccion ? 700 : 600}>
                      {r.shortName} <tspan fill="#64748b" fontWeight={500}>{valorDe(r).toLocaleString('es-CL')}</tspan>
                    </text>
                  </g>
                ))}
              </svg>

              {/* Recuadro al pasar el cursor */}
              {encima && regionEncima && (
                <div className="pointer-events-none absolute z-10 rounded-xl bg-slate-900 text-white px-3 py-2 shadow-lg text-sm"
                  style={{ left: Math.min(encima.x + 14, (lienzoRef.current?.clientWidth || 600) - 200), top: encima.y + 14 }}>
                  <p className="font-semibold">{regionEncima.name}</p>
                  <p className="text-slate-300">{unidad(valorDe(regionEncima))}</p>
                  {capa === 'solicitudes' && (solicitudesPor[regionEncima.id]?.conectadas || 0) > 0 && (
                    <p className="text-slate-300">{solicitudesPor[regionEncima.id].conectadas} {solicitudesPor[regionEncima.id].conectadas === 1 ? 'conectada' : 'conectadas'} con MCP</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">Clic para ver el detalle</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Vista de tabla */
          <div className="px-5 sm:px-7 py-5 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  {([['nombre', 'Región'], ['valor', capaActual.etiqueta]] as const).map(([col, t]) => (
                    <th key={col} className={`py-2 font-medium ${col === 'valor' ? 'text-right' : ''}`}
                      aria-sort={orden.col === col ? (orden.desc ? 'descending' : 'ascending') : 'none'}>
                      <button type="button" className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900"
                        onClick={() => setOrden(o => ({ col, desc: o.col === col ? !o.desc : col === 'valor' }))}>
                        {t} <ArrowUpDown className="w-3.5 h-3.5" />
                      </button>
                    </th>
                  ))}
                  <th className="py-2 font-medium text-right">Conectadas MCP</th>
                  <th className="py-2 font-medium text-right hidden sm:table-cell">Capital</th>
                </tr>
              </thead>
              <tbody>
                {regionesTabla.map(r => (
                  <tr key={r.id} onClick={() => elegir(r.id)}
                    className={`border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${seleccion === r.id ? 'bg-blue-50 dark:bg-blue-950/40' : ''}`}>
                    <td className="py-2.5">
                      <button type="button" className="flex items-center gap-2.5 font-medium text-slate-800 dark:text-slate-100 cursor-pointer" onClick={e => { e.stopPropagation(); elegir(r.id); }}>
                        <span className="w-3 h-3 rounded-sm" style={{ background: colorPara(valorDe(r), clases) }} /> {r.name}
                      </button>
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{valorDe(r).toLocaleString('es-CL')}</td>
                    <td className="py-2.5 text-right tabular-nums">{solicitudesPor[r.id]?.conectadas || 0}</td>
                    <td className="py-2.5 text-right text-slate-500 hidden sm:table-cell">{r.capital}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <PanelRegion
        region={regionSeleccionada}
        organizations={organizations}
        events={events}
        solicitudes={solicitudes}
        onCerrar={() => setSeleccion(null)}
        onCotizar={onCotizarEnRegion}
      />
    </div>
  );
};
