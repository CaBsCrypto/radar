import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, Sparkles, Map as MapIcon, Check, Copy, MessageCircle, Mail, ClipboardList, FileText, PlugZap,
  ShieldCheck, Globe2, BadgeCheck, Calendar, MapPin, Bot, Clock, X as XIcon, Landmark, Store, CalendarClock, Truck,
} from 'lucide-react';
import type { CapaMapa, ChileRegion, EcosystemEvent, McpSolicitud, Organization, PaqueteId } from '../types';
import { NOTA_PRECIO, PAQUETES } from '../data/cotizadorData';
import { CHILE_REGION_PATHS } from '../data/chileRegionsGeo';
import { CORREO_CONTACTO, URL_SERVIDOR_MCP, enlaceWhatsApp } from '../lib/sitio';
import { SuscripcionBoletin } from './SuscripcionBoletin';
import { capaMasPoblada, conteosPorRegion } from '../lib/conteos';

const TEXTO_CAPA: Record<CapaMapa, string> = {
  conectadas: 'empresas conectadas', solicitudes: 'solicitudes MCP', organizaciones: 'organizaciones',
  eventos: 'eventos vigentes', universidades: 'universidades',
};

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

const MiniMapa: React.FC<{ regions: ChileRegion[]; valores: Record<string, number>; unidad: string; onClick: () => void }> = ({ regions, valores, unidad, onClick }) => {
  const maximo = Math.max(1, ...regions.map(r => valores[r.id] || 0));
  const color = (n: number) => (n <= 0 ? '#e2e8f0' : ESCALA[Math.min(ESCALA.length - 1, Math.floor(Math.sqrt(n / maximo) * (ESCALA.length - 0.01)))]);
  return (
    <button type="button" onClick={onClick} aria-label={`Abrir el mapa: ${unidad} por región`}
      className="group relative h-full w-full flex items-center justify-center cursor-pointer">
      <svg viewBox={CAJA_CHILE} className="h-[360px] sm:h-[460px] lg:h-[560px] w-auto drop-shadow-sm transition-transform duration-300 group-hover:scale-[1.02]" role="img">
        {regions.map(r => CHILE_REGION_PATHS[r.id] && (
          <path key={r.id} d={CHILE_REGION_PATHS[r.id]} fill={color(valores[r.id] || 0)} stroke="#fff" strokeWidth={0.8}>
            <title>{`${r.name}: ${valores[r.id] || 0} ${unidad}`}</title>
          </path>
        ))}
      </svg>
    </button>
  );
};

/* ---------- Conversación de ejemplo del encabezado: varios rubros, con botones ---------- */
type Linea = { tipo: 'cliente' | 'asistente' | 'metodo'; texto: string };
interface Caso { id: string; etiqueta: string; icono: React.ElementType; empresa: string; lineas: Linea[] }

const CASOS: Caso[] = [
  {
    id: 'financiera', etiqueta: 'Financiera', icono: Landmark, empresa: 'Financiera Austral',
    lineas: [
      { tipo: 'cliente', texto: 'Necesito $8.000.000 para capital de trabajo de mi pyme. ¿Cuánto pagaría en 24 cuotas?' },
      { tipo: 'metodo', texto: 'simular_credito' },
      { tipo: 'asistente', texto: 'Con Financiera Austral, la cuota estimada es de $385.617 al mes, con una tasa referencial de 1,2% mensual. ¿Quiere que inicie la solicitud?' },
      { tipo: 'cliente', texto: 'Sí, con los datos de Panadería Los Robles.' },
      { tipo: 'metodo', texto: 'iniciar_solicitud_credito' },
      { tipo: 'asistente', texto: 'Listo: solicitud N° 58213 ingresada. Un ejecutivo lo contactará hoy y le pedirá sus últimas 3 declaraciones de IVA.' },
    ],
  },
  {
    id: 'comercio', etiqueta: 'Comercio', icono: Store, empresa: 'Comercial del Valle',
    lineas: [
      { tipo: 'cliente', texto: '¿Tienen 12 sacos de harina de 25 kg para mañana en Maipú?' },
      { tipo: 'metodo', texto: 'consultar_disponibilidad' },
      { tipo: 'asistente', texto: 'Sí. Comercial del Valle tiene 18 disponibles en Maipú, a $21.990 cada uno. ¿Quiere que aparte los 12?' },
      { tipo: 'cliente', texto: 'Sí, apártelos a nombre de Panadería Los Robles.' },
      { tipo: 'metodo', texto: 'apartar_unidades' },
      { tipo: 'asistente', texto: 'Listo: 12 sacos apartados hasta mañana a las 18:00. El comprobante va en camino a su correo.' },
    ],
  },
  {
    id: 'agenda', etiqueta: 'Agenda', icono: CalendarClock, empresa: 'Centro Kine Aurora',
    lineas: [
      { tipo: 'cliente', texto: '¿Tienen hora de kinesiología el jueves en la tarde?' },
      { tipo: 'metodo', texto: 'consultar_horas_libres' },
      { tipo: 'asistente', texto: 'Sí. Centro Kine Aurora tiene horas el jueves a las 16:00 y a las 17:30. ¿Cuál prefiere?' },
      { tipo: 'cliente', texto: 'La de las 17:30, por favor.' },
      { tipo: 'metodo', texto: 'agendar_hora' },
      { tipo: 'asistente', texto: 'Reservada para el jueves a las 17:30. El miércoles le llegará un recordatorio, y puede cambiar la hora respondiendo ese mensaje.' },
    ],
  },
  {
    id: 'logistica', etiqueta: 'Logística', icono: Truck, empresa: 'Transportes Pacífico',
    lineas: [
      { tipo: 'cliente', texto: '¿En qué va mi despacho 44871 a Antofagasta?' },
      { tipo: 'metodo', texto: 'consultar_estado_envio' },
      { tipo: 'asistente', texto: 'Transportes Pacífico lo tiene en ruta: salió ayer de Santiago y llega mañana entre 10:00 y 13:00. ¿Quiere que lo reciba otra persona?' },
      { tipo: 'cliente', texto: 'Sí, que lo reciba Carla Medina en la bodega.' },
      { tipo: 'metodo', texto: 'actualizar_receptor' },
      { tipo: 'asistente', texto: 'Hecho: Carla Medina quedó como receptora. El conductor la llamará 30 minutos antes de llegar.' },
    ],
  },
];

const ROTACION_MS = 9000;

const Conversacion: React.FC = () => {
  const [indice, setIndice] = useState(0);
  const [elegido, setElegido] = useState(false);

  // Rota sola entre los casos hasta que el visitante elige uno (y nunca con movimiento reducido).
  useEffect(() => {
    if (elegido) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIndice(i => (i + 1) % CASOS.length), ROTACION_MS);
    return () => clearInterval(t);
  }, [elegido]);

  const caso = CASOS[indice];

  return (
    <div className="relative min-w-0">
      <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-blue-200/60 via-sky-100/40 to-transparent blur-2xl" />
      <figure className="relative rounded-3xl bg-white border border-slate-200 shadow-xl shadow-blue-900/10 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="w-7 h-7 rounded-full bg-slate-900 text-white grid place-items-center"><Sparkles className="w-3.5 h-3.5" /></span>
            Asistente de IA del cliente
          </span>
          <span className="text-[11px] font-medium text-slate-500">Ejemplo ilustrativo</span>
        </div>

        <div role="tablist" aria-label="Casos de ejemplo" className="flex flex-wrap gap-1.5 px-4 sm:px-5 pt-4">
          {CASOS.map((c, i) => {
            const activo = i === indice;
            return (
              <button key={c.id} type="button" role="tab" aria-selected={activo} aria-controls="conversacion-ejemplo"
                onClick={() => { setIndice(i); setElegido(true); }}
                className={`relative flex-shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-colors cursor-pointer overflow-hidden ${
                  activo ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}>
                <c.icono className="w-3.5 h-3.5" /> {c.etiqueta}
                {activo && !elegido && (
                  <span key={`barra-${indice}`} aria-hidden
                    className="absolute left-0 bottom-0 h-0.5 bg-sky-300 animate-[avance-caso_9s_linear_both] motion-reduce:hidden" />
                )}
              </button>
            );
          })}
        </div>

        <div id="conversacion-ejemplo" role="tabpanel" key={caso.id}
          className="px-4 sm:px-5 py-5 space-y-3 text-[14.5px] leading-snug min-h-[400px] sm:min-h-[380px]">
          {caso.lineas.map((l, i) => {
            const estilo = { animationDelay: `${0.25 + i * 0.5}s` };
            const anim = 'animate-[aparecer_.45s_ease-out_both] motion-reduce:animate-none';
            if (l.tipo === 'metodo') {
              return (
                <div key={i} style={estilo} className={`flex items-center gap-2 pl-1 ${anim}`}>
                  <span className="inline-flex flex-wrap items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">
                    <Check className="w-3.5 h-3.5" /> {caso.empresa} · <code className="font-semibold">{l.texto}()</code>
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
          Cada <span className="text-emerald-700 font-semibold">método MCP</span> es una acción de la empresa que el asistente puede usar. Nadie tuvo que responder a mano.
        </figcaption>
      </figure>
    </div>
  );
};

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
  // Solo cifras reales y distintas de cero: un sitio que recién parte no muestra "0 empresas".
  const cifras = ([
    [conectadas, conectadas === 1 ? 'empresa conectada con MCP' : 'empresas conectadas con MCP'],
    [solicitudes.length, solicitudes.length === 1 ? 'empresa cotizada con MCP' : 'empresas cotizadas con MCP'],
    [organizations.length, 'organizaciones en el directorio'],
    [vigentes.length, 'eventos y convocatorias vigentes'],
    [regions.length, 'regiones en el mapa'],
    [3, 'planes con precio publicado'],
  ] as [number, string][]).filter(([n]) => n > 0).slice(0, 4);

  const conteos = useMemo(() => conteosPorRegion(organizations, events, solicitudes), [organizations, events, solicitudes]);
  const capaDestacada = capaMasPoblada(conteos);
  const valoresDestacados = conteos[capaDestacada];
  const destacadas = [...regions].filter(r => (valoresDestacados[r.id] || 0) > 0)
    .sort((a, b) => (valoresDestacados[b.id] || 0) - (valoresDestacados[a.id] || 0)).slice(0, 4);
  const maxDestacada = Math.max(1, ...destacadas.map(r => valoresDestacados[r.id] || 0));
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

        <div className="relative grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-blue-800 mb-6">
              <Bot className="w-4 h-4" /> Conexión MCP para empresas chilenas
            </p>
            <h1 className="font-['Outfit'] font-extrabold tracking-tight text-slate-900 text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-[3.6rem]">
              Atienda a sus clientes también a través de la IA,{' '}
              <span className="bg-gradient-to-r from-blue-600 to-sky-500 bg-clip-text text-transparent">las 24 horas.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-xl">
              Conectamos su stock, su agenda, sus créditos o sus despachos con asistentes como ChatGPT, Claude y Gemini
              mediante MCP. Describa su empresa y reciba en minutos una propuesta con un rango de inversión.
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
        <dl className={`grid grid-cols-2 gap-3 sm:gap-4 ${cifras.length === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
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
              bajada="Empresas conectadas, organizaciones, universidades y eventos, región por región. Las empresas que se cotizan y conectan también aparecen aquí." />
            {destacadas.length > 0 && <p className="text-sm font-semibold text-slate-900 mb-3">Regiones con más {TEXTO_CAPA[capaDestacada]}</p>}
            <ul className="space-y-2.5 mb-8">
              {destacadas.map(r => (
                <li key={r.id} className="grid grid-cols-[8.5rem_1fr_2rem] items-center gap-3 text-sm">
                  <span className="text-slate-700 truncate">{r.shortName}</span>
                  <span className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <span className="block h-full rounded-full bg-blue-600" style={{ width: `${((valoresDestacados[r.id] || 0) / maxDestacada) * 100}%` }} />
                  </span>
                  <span className="text-right font-semibold text-slate-900 tabular-nums">{valoresDestacados[r.id] || 0}</span>
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
              <button type="button" onClick={() => onVerMapa(capaDestacada)}
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
            <MiniMapa regions={regions} valores={valoresDestacados} unidad={TEXTO_CAPA[capaDestacada]} onClick={() => onVerMapa(capaDestacada)} />
            <p className="mt-4 text-xs text-slate-500">{TEXTO_CAPA[capaDestacada].charAt(0).toUpperCase() + TEXTO_CAPA[capaDestacada].slice(1)} por región · Clic para abrir el mapa</p>
          </div>
        </div>
      </section>

      {/* ================= Boletín ================= */}
      <SuscripcionBoletin origen="inicio" />

      {/* ================= Agentes de IA ================= */}
      <section className="rounded-[2rem] bg-slate-950 text-white px-6 py-10 sm:px-10 sm:py-12 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center [&>*]:min-w-0">
          <div>
            <p className="text-sm font-semibold text-sky-300 mb-2 flex items-center gap-2"><Bot className="w-4 h-4" /> Véalo funcionando aquí mismo</p>
            <h2 className="font-['Outfit'] font-bold text-3xl sm:text-4xl tracking-tight leading-[1.1]">Este sitio ya se comunica con agentes de IA</h2>
            <p className="mt-4 text-slate-300 text-base sm:text-lg leading-relaxed">
              Un asistente como Claude o ChatGPT puede conectarse al Radar y responder por usted: qué empresas están conectadas
              en su región, qué acciones piden otras empresas o cuánto costaría conectar la suya. Es lo mismo que haremos con su empresa.
            </p>
            {herramientasWebMcp > 0 && (
              <p className="mt-3 text-sm text-slate-400">En este navegador, además, hay {herramientasWebMcp} herramientas WebMCP disponibles para asistentes.</p>
            )}
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <p className="text-sm text-slate-300 mb-2">Dirección para conectar su asistente</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 min-w-0 truncate rounded-lg bg-black/40 px-3 py-2.5 text-sm text-sky-200">{urlMcp}</code>
              <button type="button" onClick={copiar}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-slate-900 px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 cursor-pointer flex-shrink-0">
                {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />} {copiado ? 'Copiada' : 'Copiar'}
              </button>
            </div>
            <p className="mt-5 text-sm text-slate-300 mb-2">Lo que el asistente puede hacer aquí</p>
            <ul className="space-y-2 text-sm">
              {[
                ['Ver qué empresas están conectadas, por región', 'getListaEmpresasConMCP'],
                ['Conocer las tareas y métodos más pedidos', 'getTiposMCPGenerados'],
                ['Pedir una propuesta con rango de precio', 'solicitar_precotizacion'],
              ].map(([d, n]) => (
                <li key={n} className="flex gap-2.5">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-300" />
                  <span><span className="text-white">{d}</span> <code className="text-xs text-slate-500">{n}()</code></span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-slate-500">En Claude: Ajustes → Conectores → Agregar conector personalizado.</p>
          </div>
        </div>
      </section>

      {/* ================= Cierre ================= */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 to-blue-800 text-white px-6 py-12 sm:px-12 sm:py-16 text-center">
        <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-white/10 blur-2xl" />
        <h2 className="relative font-['Outfit'] font-extrabold text-3xl sm:text-5xl tracking-tight leading-[1.08] max-w-3xl mx-auto">
          Dé el primer paso hacia una empresa conectada con IA
        </h2>
        <p className="relative mt-4 text-blue-100 text-lg max-w-xl mx-auto">Cuéntenos cómo trabaja hoy y reciba en minutos una propuesta a su medida, sin costo ni compromiso.</p>
        <div className="relative mt-8 flex justify-center">
          <button type="button" onClick={onCotizar}
            className="group inline-flex items-center gap-2 rounded-2xl bg-white text-blue-700 font-bold px-8 py-4 text-lg shadow-xl hover:bg-blue-50 transition-colors cursor-pointer">
            Empezar ahora <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
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
