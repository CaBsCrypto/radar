import React, { useMemo, useState } from 'react';
import {
  ArrowRight, Sparkles, Map as MapIcon, Check, Copy, MessageCircle, Mail, ClipboardList, FileText, PlugZap,
  ShieldCheck, Globe2, BadgeCheck, Calendar, MapPin, Bot, Clock, X as XIcon, Terminal,
} from 'lucide-react';
import type { CapaMapa, ChileRegion, EcosystemEvent, McpSolicitud, Organization, PaqueteId } from '../types';
import { NOTA_PRECIO, PAQUETES } from '../data/cotizadorData';
import { CHILE_REGION_PATHS } from '../data/chileRegionsGeo';
import { CORREO_CONTACTO, URL_SERVIDOR_MCP, enlaceWhatsApp } from '../lib/sitio';

interface InicioProps {
  regions: ChileRegion[];
  organizations: Organization[];
  events: EcosystemEvent[];
  solicitudes: McpSolicitud[];
  herramientasWebMcp: number;
  onCotizar: () => void;
  onVerMapa: (capa?: CapaMapa) => void;
  onVerEventos: () => void;
}

/* ---------- Mini mapa de Chile (vista previa de la pestaña Mapa) ---------- */
const ESCALA = ['#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8', '#1e3a8a'];
const CAJA_CHILE = (() => {
  const xs: number[] = [], ys: number[] = [];
  Object.values(CHILE_REGION_PATHS).forEach(d => {
    for (const m of d.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)) { xs.push(+m[1]); ys.push(+m[2]); }
  });
  const minX = Math.min(...xs), minY = Math.min(...ys);
  return `${minX - 4} ${minY - 4} ${Math.max(...xs) - minX + 8} ${Math.max(...ys) - minY + 8}`;
})();

const MiniMapa: React.FC<{ regions: ChileRegion[]; onClick: () => void }> = ({ regions, onClick }) => {
  const maximo = Math.max(1, ...regions.map(r => r.webmcpCount || 0));
  const color = (n: number) => (n <= 0 ? '#e2e8f0' : ESCALA[Math.min(ESCALA.length - 1, Math.floor(Math.sqrt(n / maximo) * (ESCALA.length - 0.01)))]);
  return (
    <button type="button" onClick={onClick} aria-label="Abrir el mapa de empresas WebMCP por región"
      className="group relative h-full w-full flex items-center justify-center cursor-pointer">
      <svg viewBox={CAJA_CHILE} className="h-[360px] sm:h-[460px] lg:h-[560px] w-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.02]" role="img">
        {regions.map(r => CHILE_REGION_PATHS[r.id] && (
          <path key={r.id} d={CHILE_REGION_PATHS[r.id]} fill={color(r.webmcpCount || 0)} stroke="#fff" strokeWidth={0.8}>
            <title>{`${r.name}: ${r.webmcpCount || 0} empresas WebMCP`}</title>
          </path>
        ))}
      </svg>
    </button>
  );
};

/* ---------- Conversación de ejemplo del encabezado ---------- */
type Linea = { tipo: 'cliente' | 'asistente'; texto: string } | { tipo: 'metodo'; texto: string };
const CONVERSACION: Linea[] = [
  { tipo: 'cliente', texto: '¿Tienen 12 sacos de harina de 25 kg para mañana en Maipú?' },
  { tipo: 'metodo', texto: 'consultar_disponibilidad' },
  { tipo: 'asistente', texto: 'Sí. Comercial del Valle tiene 18 disponibles en Maipú, a $21.990 cada uno. ¿Quiere que aparte los 12?' },
  { tipo: 'cliente', texto: 'Sí, apártelos a nombre de Panadería Los Robles.' },
  { tipo: 'metodo', texto: 'apartar_unidades' },
  { tipo: 'asistente', texto: 'Listo: 12 sacos apartados hasta mañana a las 18:00. El comprobante va en camino a su correo.' },
];

const Conversacion: React.FC = () => (
  <div className="relative">
    <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-blue-200/60 via-sky-100/40 to-transparent blur-2xl" />
    <figure className="relative rounded-3xl bg-white border border-slate-200 shadow-xl shadow-blue-900/10 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          <span className="w-7 h-7 rounded-full bg-slate-900 text-white grid place-items-center"><Sparkles className="w-3.5 h-3.5" /></span>
          Asistente de IA del cliente
        </span>
        <span className="text-[11px] font-medium text-slate-500">Ejemplo ilustrativo</span>
      </div>
      <div className="px-4 sm:px-5 py-5 space-y-3 text-[14.5px] leading-snug">
        {CONVERSACION.map((l, i) => {
          const estilo = { animationDelay: `${0.35 + i * 0.55}s` };
          const anim = 'animate-[aparecer_.45s_ease-out_both] motion-reduce:animate-none';
          if (l.tipo === 'metodo') {
            return (
              <div key={i} style={estilo} className={`flex items-center gap-2 pl-1 ${anim}`}>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
                  <Check className="w-3.5 h-3.5" /> Comercial del Valle · <code className="font-semibold">{l.texto}()</code>
                </span>
              </div>
            );
          }
          const cliente = l.tipo === 'cliente';
          return (
            <div key={i} style={estilo} className={`flex ${cliente ? 'justify-end' : 'justify-start'} ${anim}`}>
              <p className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${cliente ? 'bg-blue-600 text-white rounded-br-md' : 'bg-slate-100 text-slate-800 rounded-bl-md'}`}>
                {l.texto}
              </p>
            </div>
          );
        })}
      </div>
      <figcaption className="px-5 py-3.5 border-t border-slate-100 text-[13px] text-slate-600 bg-white">
        Cada <span className="text-emerald-700 font-semibold">método MCP</span> es una acción de la empresa que el asistente puede usar. Nadie tuvo que abrir la planilla.
      </figcaption>
    </figure>
  </div>
);

/* ---------- Piezas ---------- */
const Encabezado: React.FC<{ antetitulo: string; titulo: React.ReactNode; bajada?: string; centrado?: boolean }> = ({ antetitulo, titulo, bajada, centrado }) => (
  <div className={`mb-8 sm:mb-10 ${centrado ? 'text-center mx-auto' : ''} max-w-2xl`}>
    <p className="text-sm font-semibold text-blue-700 mb-2">{antetitulo}</p>
    <h2 className="font-['Outfit'] font-bold text-3xl sm:text-4xl tracking-tight text-slate-900 leading-[1.1]">{titulo}</h2>
    {bajada && <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">{bajada}</p>}
  </div>
);

const BotonPrincipal: React.FC<{ onClick: () => void; children: React.ReactNode; grande?: boolean; id?: string }> = ({ onClick, children, grande, id }) => (
  <button id={id} type="button" onClick={onClick}
    className={`group inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/25 transition-all cursor-pointer active:scale-[.98] ${
      grande ? 'px-7 py-4 text-lg' : 'px-5 py-3 text-base'
    }`}>
    {children} <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
  </button>
);

const PASOS = [
  { icono: ClipboardList, titulo: 'Cuéntenos qué se repite', texto: 'Marque las tareas que su equipo hace a mano todos los días, como responder precios, agendar o cotizar. Son dos minutos y no requiere conocimientos técnicos.' },
  { icono: FileText, titulo: 'Reciba su propuesta', texto: 'La IA arma al momento una propuesta con los métodos MCP que su empresa necesita, el paquete recomendado y un rango de inversión.' },
  { icono: PlugZap, titulo: 'Browns Studio la conecta', texto: 'Revisamos la propuesta con usted, conectamos sus sistemas y su empresa aparece en el mapa del Radar como empresa conectada.' },
];

const HOY = [
  'Cada consulta de stock, precio u hora la responde una persona, una por una.',
  'Las cotizaciones se arman copiando una plantilla.',
  'Fuera de horario, el cliente espera o compra en otra parte.',
];
const CON_MCP = [
  'El asistente del cliente consulta el dato y responde al momento.',
  'La cotización sale con sus precios y sus reglas.',
  'Se atiende a cualquier hora; su equipo interviene solo en las excepciones.',
];

const BENEFICIOS = [
  { icono: ShieldCheck, titulo: 'Usted decide qué se comparte', texto: 'Cada método define qué dato entrega y qué acción permite. Con permisos por cliente y registro de cada uso.' },
  { icono: Globe2, titulo: 'Un estándar, varios asistentes', texto: 'MCP es un estándar abierto que ya adoptaron los principales asistentes de IA. Se conecta una vez, no una por cada uno.' },
  { icono: BadgeCheck, titulo: 'Presencia en el Radar', texto: 'Las empresas conectadas aparecen en el mapa del Radar de IA de Chile, visible para clientes, socios e inversionistas.' },
];

/* ---------- Página ---------- */
export const Inicio: React.FC<InicioProps> = ({
  regions, organizations, events, solicitudes, herramientasWebMcp, onCotizar, onVerMapa, onVerEventos,
}) => {
  const [copiado, setCopiado] = useState(false);
  const urlMcp = URL_SERVIDOR_MCP;

  const vigentes = useMemo(() => events.filter(e => e.status !== 'Finalizado'), [events]);
  const conectadas = solicitudes.filter(s => s.estado === 'conectada').length;
  const empresasWebMcp = regions.reduce((s, r) => s + (r.webmcpCount || 0), 0);
  const cifras: [number, string][] = [
    [empresasWebMcp + conectadas, 'empresas con WebMCP en el mapa'],
    [organizations.length, 'organizaciones en el directorio'],
    [vigentes.length, 'eventos y convocatorias vigentes'],
    [solicitudes.length > 0 ? solicitudes.length : regions.length, solicitudes.length > 0 ? 'empresas cotizadas con MCP' : 'regiones cubiertas'],
  ];
  const destacadas = [...regions].sort((a, b) => (b.webmcpCount || 0) - (a.webmcpCount || 0)).slice(0, 4);
  const maxDestacada = Math.max(1, destacadas[0]?.webmcpCount || 1);
  const nombreRegion = (id: string) => regions.find(r => r.id === id)?.shortName || id;

  const copiar = async () => {
    try { await navigator.clipboard.writeText(urlMcp); setCopiado(true); setTimeout(() => setCopiado(false), 1600); } catch { /* sin portapapeles */ }
  };

  return (
    <div className="space-y-20 sm:space-y-28 pb-8">
      {/* ================= Encabezado ================= */}
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.14),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(14,165,233,0.08),transparent_50%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] [background-size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

        <div className="relative grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-blue-800 mb-6">
              <Bot className="w-4 h-4" /> Conexión MCP para empresas chilenas
            </p>
            <h1 className="font-['Outfit'] font-extrabold tracking-tight text-slate-900 text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-[3.6rem]">
              Sus clientes ya le preguntan a la IA.{' '}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">Que su empresa pueda responder.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
              Conectamos su stock, su agenda o sus cotizaciones con asistentes como ChatGPT, Claude y Gemini mediante MCP.
              Describa su empresa y reciba en minutos una propuesta con un rango de inversión.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <BotonPrincipal id="inicio-cta-cotizar" onClick={onCotizar} grande>Cotizar mi empresa</BotonPrincipal>
              <button type="button" onClick={() => onVerMapa()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white/80 px-7 py-4 text-lg font-semibold text-slate-800 hover:border-slate-400 hover:bg-white transition-colors cursor-pointer">
                <MapIcon className="w-5 h-5" /> Explorar el mapa
              </button>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              {['Propuesta sin costo', 'Sin conocimientos técnicos', 'Precio en rango desde el inicio'].map(t => (
                <li key={t} className="flex items-center gap-1.5"><Check className="w-4 h-4 text-emerald-600" /> {t}</li>
              ))}
            </ul>
          </div>
          <Conversacion />
        </div>
      </section>

      {/* ================= Cifras ================= */}
      <section aria-label="El Radar en cifras" className="-mt-10 sm:-mt-16">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cifras.map(([n, t]) => (
            <div key={t} className="rounded-2xl border border-slate-200 bg-white px-5 py-5 sm:py-6">
              <dd className="font-['Outfit'] font-extrabold text-3xl sm:text-4xl text-slate-900 tabular-nums">{n.toLocaleString('es-CL')}</dd>
              <dt className="mt-1 text-sm text-slate-600 leading-snug">{t}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ================= Cómo funciona ================= */}
      <section id="como-funciona">
        <Encabezado antetitulo="Cómo funciona" titulo="De la tarea repetida al método MCP, en tres pasos" />
        <ol className="grid md:grid-cols-3 gap-4 sm:gap-5">
          {PASOS.map((p, i) => (
            <li key={p.titulo} className="relative rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white grid place-items-center shadow-md shadow-blue-600/25"><p.icono className="w-6 h-6" /></span>
                <span className="font-['Outfit'] font-extrabold text-5xl text-slate-100 select-none">{i + 1}</span>
              </div>
              <h3 className="font-['Outfit'] font-bold text-xl text-slate-900 mb-2">{p.titulo}</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed">{p.texto}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 text-center">
          <BotonPrincipal onClick={onCotizar}>Empezar la cotización</BotonPrincipal>
        </div>
      </section>

      {/* ================= Por qué ================= */}
      <section>
        <Encabezado antetitulo="Por qué ahora" titulo="Su sitio web fue hecho para personas. Sus clientes ahora también llegan con un asistente." />
        <div className="grid md:grid-cols-2 gap-4 sm:gap-5 mb-5">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-7">
            <p className="text-sm font-bold text-slate-500 mb-4">Hoy</p>
            <ul className="space-y-3.5">
              {HOY.map(t => (
                <li key={t} className="flex gap-3 text-[15.5px] text-slate-700">
                  <XIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-400" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 sm:p-7">
            <p className="text-sm font-bold text-blue-700 mb-4">Con métodos MCP</p>
            <ul className="space-y-3.5">
              {CON_MCP.map(t => (
                <li key={t} className="flex gap-3 text-[15.5px] text-slate-800">
                  <Check className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
          {BENEFICIOS.map(b => (
            <div key={b.titulo} className="rounded-3xl border border-slate-200 bg-white p-6">
              <b.icono className="w-6 h-6 text-blue-600 mb-3" />
              <h3 className="font-semibold text-lg text-slate-900 mb-1.5">{b.titulo}</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed">{b.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= Planes ================= */}
      <section id="planes">
        <Encabezado antetitulo="Planes" titulo="Un rango claro desde el primer día"
          bajada="La propuesta le indica qué plan corresponde a su empresa. El valor exacto se fija al revisar sus sistemas." />
        <div className="grid md:grid-cols-3 gap-4 sm:gap-5 items-stretch">
          {(Object.keys(PAQUETES) as PaqueteId[]).map((id, i) => {
            const p = PAQUETES[id];
            const medio = i === 1;
            return (
              <article key={id} className={`flex flex-col rounded-3xl p-6 sm:p-7 ${medio ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20' : 'bg-white border border-slate-200'}`}>
                <h3 className="font-['Outfit'] font-bold text-xl">{p.nombre}</h3>
                <p className={`text-sm mt-1 mb-5 ${medio ? 'text-slate-300' : 'text-slate-600'}`}>{p.paraQuien}</p>
                <p className="font-['Outfit'] font-extrabold text-[1.65rem] leading-tight tracking-tight">{p.precio}</p>
                <p className={`text-sm mb-5 ${medio ? 'text-slate-400' : 'text-slate-500'}`}>CLP · {p.plazo}</p>
                <ul className="space-y-2.5 mb-7">
                  {p.incluye.map(t => (
                    <li key={t} className="flex gap-2.5 text-[15px]">
                      <Check className={`w-4.5 h-4.5 mt-0.5 flex-shrink-0 ${medio ? 'text-sky-300' : 'text-blue-600'}`} /> {t}
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={onCotizar}
                  className={`mt-auto w-full rounded-xl px-4 py-3 font-semibold transition-colors cursor-pointer ${
                    medio ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}>
                  Ver qué plan me corresponde
                </button>
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-slate-500 text-center">{NOTA_PRECIO}</p>
      </section>

      {/* ================= Ecosistema ================= */}
      <section className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden">
        <div className="grid lg:grid-cols-[1.2fr_1fr]">
          <div className="p-6 sm:p-10 lg:p-12">
            <Encabezado antetitulo="Radar de IA de Chile" titulo="El ecosistema de IA de las 16 regiones, en un mapa"
              bajada="Empresas con WebMCP, startups, universidades y eventos, región por región. Las empresas que se cotizan y conectan también aparecen aquí." />
            <p className="text-sm font-semibold text-slate-900 mb-3">Regiones con más empresas WebMCP</p>
            <ul className="space-y-2.5 mb-8">
              {destacadas.map(r => (
                <li key={r.id} className="grid grid-cols-[8.5rem_1fr_2rem] items-center gap-3 text-sm">
                  <span className="text-slate-700 truncate">{r.shortName}</span>
                  <span className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <span className="block h-full rounded-full bg-blue-600" style={{ width: `${((r.webmcpCount || 0) / maxDestacada) * 100}%` }} />
                  </span>
                  <span className="text-right font-semibold text-slate-900 tabular-nums">{r.webmcpCount || 0}</span>
                </li>
              ))}
            </ul>

            {vigentes.length > 0 && (
              <>
                <p className="text-sm font-semibold text-slate-900 mb-3">Próximos eventos y convocatorias</p>
                <ul className="space-y-2 mb-8">
                  {vigentes.slice(0, 3).map(e => (
                    <li key={e.id}>
                      <button type="button" onClick={onVerEventos}
                        className="w-full text-left rounded-2xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 px-4 py-3 transition-colors cursor-pointer">
                        <p className="font-medium text-slate-900 leading-snug">{e.title}</p>
                        <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-slate-500">
                          <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {e.dateStr}</span>
                          <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {e.isVirtual ? 'En línea' : nombreRegion(e.regionId)}</span>
                          {e.isRegistrationUrgent && <span className="inline-flex items-center gap-1 text-rose-600 font-medium"><Clock className="w-3.5 h-3.5" /> Inscripción por cerrar</span>}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" onClick={() => onVerMapa('webmcp')}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-3 cursor-pointer transition-colors">
                <MapIcon className="w-4 h-4" /> Explorar el mapa
              </button>
              <button type="button" onClick={onVerEventos}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 hover:bg-slate-50 font-semibold px-5 py-3 cursor-pointer transition-colors">
                <Calendar className="w-4 h-4" /> Ver todos los eventos
              </button>
            </div>
          </div>
          <div className="relative bg-gradient-to-b from-slate-50 to-blue-50/60 border-t lg:border-t-0 lg:border-l border-slate-200 p-6 sm:p-10 flex flex-col items-center justify-center">
            <MiniMapa regions={regions} onClick={() => onVerMapa('webmcp')} />
            <p className="mt-4 text-xs text-slate-500">Empresas WebMCP por región · Clic para abrir el mapa</p>
          </div>
        </div>
      </section>

      {/* ================= Desarrolladores ================= */}
      <section className="rounded-[2rem] bg-slate-950 text-white px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="text-sm font-semibold text-sky-300 mb-2 flex items-center gap-2"><Terminal className="w-4 h-4" /> Para desarrolladores y asistentes</p>
            <h2 className="font-['Outfit'] font-bold text-3xl sm:text-4xl tracking-tight leading-[1.1]">Este sitio ya habla MCP</h2>
            <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
              Conecte el Radar a Claude, ChatGPT o cualquier cliente MCP y pregunte qué empresas están conectadas en una región,
              qué métodos se piden más o solicite una pre-cotización.
              {herramientasWebMcp > 0 && ` Desde el navegador, el sitio además expone ${herramientasWebMcp} herramientas WebMCP.`}
            </p>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <p className="text-xs text-slate-400 mb-2">Servidor MCP remoto (Streamable HTTP, sin autenticación)</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 min-w-0 truncate rounded-lg bg-black/40 px-3 py-2.5 text-sm text-sky-200">{urlMcp}</code>
              <button type="button" onClick={copiar}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-slate-900 px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 cursor-pointer flex-shrink-0">
                {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />} {copiado ? 'Copiada' : 'Copiar'}
              </button>
            </div>
            <ul className="mt-4 space-y-1.5 text-sm">
              {[
                ['getListaEmpresasConMCP', 'empresas conectadas, por región'],
                ['getTiposMCPGenerados', 'métodos y tareas más pedidos'],
                ['solicitar_precotizacion', 'propuesta con rango de precio'],
              ].map(([n, d]) => (
                <li key={n} className="flex flex-wrap gap-x-2"><code className="text-emerald-300">{n}()</code><span className="text-slate-400">{d}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ================= Cierre ================= */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 py-12 sm:px-12 sm:py-16 text-center">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
        <h2 className="relative font-['Outfit'] font-extrabold text-3xl sm:text-5xl tracking-tight leading-[1.08] max-w-3xl mx-auto">
          ¿Cuánto costaría conectar su empresa?
        </h2>
        <p className="relative mt-4 text-blue-100 text-lg max-w-xl mx-auto">Descríbala en dos minutos y reciba la propuesta al momento, sin costo.</p>
        <div className="relative mt-8 flex justify-center">
          <button type="button" onClick={onCotizar}
            className="group inline-flex items-center gap-2 rounded-2xl bg-white text-blue-700 font-bold px-8 py-4 text-lg shadow-xl hover:bg-blue-50 transition-colors cursor-pointer">
            Cotizar mi empresa <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
        <div className="relative mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-blue-100">
          <span>¿Prefiere conversarlo?</span>
          <a href={enlaceWhatsApp('Hola, quisiera conversar sobre conectar mi empresa con MCP.')}
            target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-white hover:underline">
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <a href={`mailto:${CORREO_CONTACTO}?subject=${encodeURIComponent('Conexión MCP para mi empresa')}`}
            className="inline-flex items-center gap-1.5 font-semibold text-white hover:underline">
            <Mail className="w-4 h-4" /> {CORREO_CONTACTO}
          </a>
        </div>
      </section>
    </div>
  );
};
