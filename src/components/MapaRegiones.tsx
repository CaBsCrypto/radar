import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Map as MapIcon, List, Search, Inbox, Bot, Calendar, Building2, GraduationCap, ArrowUpDown, MousePointerClick } from 'lucide-react';
import type { CapaMapa, ChileRegion, EcosystemEvent, McpSolicitud, Organization } from '../types';
import { CHILE_REGION_CENTROIDS, CHILE_REGION_PATHS } from '../data/chileRegionsGeo';
import { PanelRegion } from './PanelRegion';
import { capaMasPoblada, conteosPorRegion } from '../lib/conteos';

const VACIO: Record<CapaMapa, string> = {
  conectadas: 'Aún no hay empresas conectadas. Las primeras aparecerán aquí cuando Browns Studio las conecte.',
  solicitudes: 'Todavía no hay solicitudes. Cada empresa que se cotiza enciende su región.',
  organizaciones: 'El directorio está comenzando. Sume su organización para aparecer en el mapa.',
  eventos: 'No hay eventos vigentes por ahora.',
  universidades: 'Aún no hay universidades registradas. Se suman desde el directorio.',
};

export type { CapaMapa };

interface MapaRegionesProps {
  regions: ChileRegion[];
  organizations: Organization[];
  events: EcosystemEvent[];
  solicitudes: McpSolicitud[];
  /** Capa al abrir; null o ausente: la que tenga más datos. */
  capaInicial?: CapaMapa | null;
  /** Región que se abre al llegar (por ejemplo, desde el cotizador). */
  regionInicial?: string | null;
  onSeleccionRegion?: (regionId: string | null) => void;
  onCotizarEnRegion: (regionId: string) => void;
  /** Abre el formulario para publicar un evento o sumar una organización. */
  onAgregar?: (tipo: 'organizacion' | 'evento') => void;
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

/* ---------- geometría ----------
   Chile es largo y angosto: dibujado entero queda como una tira. Se divide en tres zonas que se muestran
   lado a lado, cada una ampliada a la misma altura, así las regiones del centro se ven grandes. */
const puntosDe = (path: string) =>
  [...path.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map(m => ({ x: Number(m[1]), y: Number(m[2]) }));

const bordeEste = (path: string, y: number): number => {
  const pts = puntosDe(path);
  const cerca = pts.filter(p => Math.abs(p.y - y) < 10);
  return Math.max(...(cerca.length ? cerca : pts).map(p => p.x));
};

const ZONAS = [
  { id: 'norte', titulo: 'Norte', regiones: ['arica', 'tarapaca', 'antofagasta', 'atacama', 'coquimbo'] },
  { id: 'centro', titulo: 'Centro', regiones: ['valparaiso', 'metropolitana', 'ohiggins', 'maule', 'nuble', 'biobio'] },
  { id: 'sur', titulo: 'Sur y Austral', regiones: ['araucania', 'losrios', 'loslagos', 'aysen', 'magallanes'] },
];

interface GeoZona {
  id: string; titulo: string; regiones: string[];
  vb: { x: number; y: number; w: number; h: number };
  aspecto: number;                                   // ancho / alto del dibujo
  borde: Record<string, { x: number; y: number }>;   // punto del borde este de cada región (inicio de la línea guía)
}

const GEO_ZONAS: GeoZona[] = ZONAS.map(z => {
  const pts = z.regiones.flatMap(id => puntosDe(CHILE_REGION_PATHS[id] || ''));
  const minX = Math.min(...pts.map(p => p.x)), maxX = Math.max(...pts.map(p => p.x));
  const minY = Math.min(...pts.map(p => p.y)), maxY = Math.max(...pts.map(p => p.y));
  const pad = (maxY - minY) * 0.02;
  const vb = { x: minX - pad, y: minY - pad, w: maxX - minX + pad * 3, h: maxY - minY + pad * 2 };
  const borde = Object.fromEntries(z.regiones.map(id => {
    const c = CHILE_REGION_CENTROIDS[id];
    return [id, { x: bordeEste(CHILE_REGION_PATHS[id], c.y), y: c.y }];
  }));
  return { ...z, vb, aspecto: vb.w / vb.h, borde };
});

const ANCHO_ETIQUETAS = 150; // px reservados a la derecha de cada zona para los nombres
const SEPARACION = 24;        // px entre zonas

export const MapaRegiones: React.FC<MapaRegionesProps> = ({
  regions, organizations, events, solicitudes, capaInicial = null, regionInicial = null,
  onSeleccionRegion, onCotizarEnRegion, onAgregar,
}) => {
  const conteos = useMemo(() => conteosPorRegion(organizations, events, solicitudes), [organizations, events, solicitudes]);
  const capaAuto = capaMasPoblada(conteos);
  const [capa, setCapa] = useState<CapaMapa>(capaInicial || capaAuto);
  // Si la capa pedida cambia con el mapa ya abierto (por ejemplo, desde el menú), se aplica.
  useEffect(() => { setCapa(capaInicial || capaAuto); }, [capaInicial]); // eslint-disable-line react-hooks/exhaustive-deps
  const [vista, setVista] = useState<'mapa' | 'lista'>('mapa');
  const [seleccion, setSeleccion] = useState<string | null>(regionInicial);
  const [encima, setEncima] = useState<{ id: string; x: number; y: number } | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<{ col: 'nombre' | 'valor'; desc: boolean }>({ col: 'valor', desc: true });
  const lienzoRef = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(1100);
  const [altoVentana, setAltoVentana] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 900));

  useEffect(() => {
    const alCambiar = () => setAltoVentana(window.innerHeight);
    window.addEventListener('resize', alCambiar);
    return () => window.removeEventListener('resize', alCambiar);
  }, []);

  useEffect(() => {
    const el = lienzoRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setAncho(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [vista]);

  useEffect(() => { onSeleccionRegion?.(seleccion); }, [seleccion, onSeleccionRegion]);

  /* ---------- valores por capa (solo datos reales) ---------- */
  const CAPAS: { id: CapaMapa; etiqueta: string; icono: React.ElementType; unidad: readonly [string, string] }[] = ([
    { id: 'conectadas', etiqueta: 'Empresas conectadas', icono: Bot, unidad: ['empresa conectada', 'empresas conectadas'] },
    { id: 'solicitudes', etiqueta: 'Solicitudes MCP', icono: Inbox, unidad: ['solicitud', 'solicitudes'] },
    { id: 'organizaciones', etiqueta: 'Organizaciones', icono: Building2, unidad: ['organización', 'organizaciones'] },
    { id: 'eventos', etiqueta: 'Eventos', icono: Calendar, unidad: ['evento vigente', 'eventos vigentes'] },
    { id: 'universidades', etiqueta: 'Universidades', icono: GraduationCap, unidad: ['universidad', 'universidades'] },
  ] as const).map(c => ({ ...c }));
  const capaActual = CAPAS.find(c => c.id === capa) || CAPAS[0];
  const valorDe = (r: ChileRegion) => conteos[capaActual.id][r.id] || 0;
  const unidad = (n: number) => `${n.toLocaleString('es-CL')} ${n === 1 ? capaActual.unidad[0] : capaActual.unidad[1]}`;

  const maximo = Math.max(0, ...regions.map(valorDe));
  const clases = clasesPara(maximo);
  const conDatos = regions.filter(r => valorDe(r) > 0);
  const total = regions.reduce((s, r) => s + valorDe(r), 0);

  const resumen = capa === 'solicitudes'
    ? (solicitudes.length
        ? `${solicitudes.length} ${solicitudes.length === 1 ? 'solicitud' : 'solicitudes'} en ${conDatos.length} ${conDatos.length === 1 ? 'región' : 'regiones'}. ${(() => { const n = solicitudes.filter(s => s.estado === 'conectada').length; return `${n} ${n === 1 ? 'conectada' : 'conectadas'} con MCP.`; })()}`
        : 'Todavía no hay solicitudes. Cada empresa que se cotiza enciende su región.')
    : total === 0
      ? VACIO[capaActual.id]
      : `${unidad(total)} en ${conDatos.length} de 16 regiones.`;

  /* ---------- tamaño de cada zona ----------
     Escritorio: las tres zonas a la misma altura, repartiendo el ancho según su forma.
     Celular: una debajo de otra, cada una lo más alta posible. */
  const apilado = ancho < 760;
  const sumaAspectos = GEO_ZONAS.reduce((s, z) => s + z.aspecto, 0);
  // En escritorio el mapa completo cabe en la ventana, bajo el encabezado del sitio y de la tarjeta.
  const altoEscritorio = Math.max(380, Math.min(640, altoVentana - 400, (ancho - GEO_ZONAS.length * ANCHO_ETIQUETAS - SEPARACION * 2) / sumaAspectos));
  const altoDe = (z: GeoZona) => (apilado ? Math.min(560, (ancho - ANCHO_ETIQUETAS) / z.aspecto) : altoEscritorio);

  /** Posición vertical de cada etiqueta (en px), empujando hacia abajo las que se encimarían. */
  const etiquetasDe = (z: GeoZona, alto: number) => {
    const escala = alto / z.vb.h;
    let piso = -Infinity;
    return z.regiones
      .map(id => ({ id, y: (z.borde[id].y - z.vb.y) * escala }))
      .sort((a, b) => a.y - b.y)
      .map(e => { const y = Math.max(e.y, piso + 30); piso = y; return { ...e, yEtiqueta: Math.min(y, alto - 12) }; });
  };

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
            <p className="mt-1 text-base text-slate-600 dark:text-slate-400">{resumen}</p>
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
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[15px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                capa === c.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}>
              <c.icono className="w-[18px] h-[18px]" /> {c.etiqueta}
            </button>
          ))}
        </nav>

        {/* Leyenda e instrucción, en una sola franja */}
        <div className="px-5 sm:px-7 py-3 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600 dark:text-slate-300" aria-label="Leyenda">
            <span className="inline-flex items-center gap-2"><span className="w-5 h-4 rounded border border-slate-300" style={{ background: SIN_DATOS }} /> Sin datos</span>
            {clases.map(c => (
              <span key={c.color} className="inline-flex items-center gap-2">
                <span className="w-5 h-4 rounded" style={{ background: c.color }} />
                {c.desde === c.hasta ? c.desde : `${c.desde} a ${c.hasta}`}
              </span>
            ))}
          </div>
          <p className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
            <MousePointerClick className="w-4 h-4" /> Haga clic en una región para ver empresas, postulantes y eventos
          </p>
        </div>

        {vista === 'mapa' ? (
          <div ref={lienzoRef} className="relative px-5 sm:px-7 py-6" onMouseLeave={() => setEncima(null)}>
            <div className={apilado ? 'space-y-8' : 'flex items-start justify-center'} style={apilado ? undefined : { gap: SEPARACION }}>
              {GEO_ZONAS.map(z => {
                const alto = altoDe(z);
                const anchoMapa = alto * z.aspecto;
                const escala = alto / z.vb.h;
                const etiquetas = etiquetasDe(z, alto);
                const totalZona = z.regiones.reduce((s, id) => { const r = regions.find(x => x.id === id); return s + (r ? valorDe(r) : 0); }, 0);
                return (
                  <section key={z.id} aria-label={`Zona ${z.titulo}`} className={apilado ? 'flex flex-col items-center' : ''}>
                    <header className="mb-3" style={{ width: anchoMapa + ANCHO_ETIQUETAS }}>
                      <h2 className="font-['Outfit'] font-semibold text-lg text-slate-900 dark:text-white">{z.titulo}</h2>
                      <p className="text-sm text-slate-500">{unidad(totalZona)}</p>
                    </header>
                    <div className="relative" style={{ width: anchoMapa + ANCHO_ETIQUETAS, height: alto }}>
                      <svg viewBox={`${z.vb.x} ${z.vb.y} ${z.vb.w} ${z.vb.h}`} width={anchoMapa} height={alto}
                        className="absolute left-0 top-0 overflow-visible select-none" role="group" aria-label={`Regiones de la zona ${z.titulo}`}>
                        {z.regiones.map(id => {
                          const r = regions.find(x => x.id === id);
                          if (!r || !CHILE_REGION_PATHS[id]) return null;
                          const v = valorDe(r);
                          const activa = seleccion === id;
                          const resaltada = encima?.id === id;
                          return (
                            <path key={id} d={CHILE_REGION_PATHS[id]} fill={colorPara(v, clases)}
                              stroke={activa ? '#0f172a' : resaltada ? '#1d4ed8' : '#ffffff'}
                              strokeWidth={(activa || resaltada ? 2.2 : 1) / escala} strokeLinejoin="round"
                              className="cursor-pointer outline-none transition-[fill,opacity] duration-300"
                              style={{ opacity: seleccion && !activa ? 0.5 : 1, paintOrder: 'stroke' }}
                              tabIndex={-1} aria-hidden
                              onClick={() => elegir(id)}
                              onMouseMove={e => moverEncima(e, id)} />
                          );
                        })}
                        {/* Líneas guía desde el borde de cada región hasta su nombre */}
                        {etiquetas.map(e => {
                          const p = z.borde[e.id];
                          const x2 = z.vb.x + z.vb.w;
                          const y2 = z.vb.y + e.yEtiqueta / escala;
                          const activa = seleccion === e.id || encima?.id === e.id;
                          return (
                            <path key={'guia-' + e.id} d={`M${p.x + 1 / escala},${p.y} L${x2 - 6 / escala},${y2} L${x2},${y2}`}
                              fill="none" stroke={activa ? '#1d4ed8' : '#cbd5e1'} strokeWidth={(activa ? 1.6 : 1) / escala}
                              className="pointer-events-none" />
                          );
                        })}
                      </svg>

                      {/* Nombres: botones grandes, a la derecha del dibujo */}
                      {etiquetas.map(e => {
                        const r = regions.find(x => x.id === e.id);
                        if (!r) return null;
                        const v = valorDe(r);
                        const activa = seleccion === e.id;
                        return (
                          <button key={'et-' + e.id} type="button"
                            onClick={() => elegir(e.id)}
                            onMouseEnter={() => setEncima({ id: e.id, x: -1, y: 0 })}
                            onMouseLeave={() => setEncima(null)}
                            aria-pressed={activa}
                            aria-label={`${r.name}: ${unidad(v)}. Ver detalle`}
                            className={`absolute -translate-y-1/2 flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg text-left cursor-pointer transition-colors whitespace-nowrap ${
                              activa ? 'bg-slate-900 text-white' : 'hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-800 dark:text-slate-100'
                            }`}
                            style={{ left: anchoMapa + 2, top: e.yEtiqueta, maxWidth: ANCHO_ETIQUETAS - 4 }}>
                            <span className="text-sm font-semibold truncate">{r.shortName}</span>
                            <span className={`text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-md ${
                              activa ? 'bg-white/20' : v > 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                            }`}>{v.toLocaleString('es-CL')}</span>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            {/* Recuadro al pasar el cursor sobre el dibujo */}
            {encima && regionEncima && encima.x > 0 && (
              <div className="pointer-events-none absolute z-10 rounded-xl bg-slate-900 text-white px-3.5 py-2.5 shadow-lg text-sm"
                style={{ left: Math.min(encima.x + 16, ancho - 180), top: encima.y + 16 }}>
                <p className="font-semibold text-base">{regionEncima.name}</p>
                <p className="text-slate-300">{unidad(valorDe(regionEncima))}</p>
                {capa === 'solicitudes' && (conteos.conectadas[regionEncima.id] || 0) > 0 && (
                  <p className="text-slate-300">{conteos.conectadas[regionEncima.id]} {conteos.conectadas[regionEncima.id] === 1 ? 'conectada' : 'conectadas'} con MCP</p>
                )}
                <p className="text-xs text-slate-400 mt-0.5">Clic para ver el detalle</p>
              </div>
            )}
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
                    <td className="py-2.5 text-right tabular-nums">{conteos.conectadas[r.id] || 0}</td>
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
        capa={capa}
        organizations={organizations}
        events={events}
        solicitudes={solicitudes}
        onCerrar={() => setSeleccion(null)}
        onCotizar={onCotizarEnRegion}
        onAgregar={onAgregar}
      />
    </div>
  );
};
