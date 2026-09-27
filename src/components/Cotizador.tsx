import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, Bot, Loader2, AlertTriangle, RotateCcw, Check, Copy, Trash2, Undo2, Map as MapIcon } from 'lucide-react';
import type { ChileRegion, McpSolicitud, PropuestaMcp, SolicitudCotizador } from '../types';
import {
  DONDE_INFO, EJEMPLOS, PRESETS, SOLICITUD_VACIA, TAREAS_COMUNES, esPresetIntacto, solucionesPara,
} from '../data/cotizadorData';
import {
  cambiarEstadoSolicitud, contarPorRegion, eliminarSolicitud, esModoDemo, guardarSolicitud, salirModoDemo,
  solicitarPropuesta, vaciarDemo,
} from '../services/cotizadorService';
import { setManejadorSolicitud } from '../lib/webmcp';
import { PropuestaModal } from './PropuestaModal';

interface CotizadorProps {
  regions: ChileRegion[];
  solicitudes: McpSolicitud[];
  herramientasWebMcp: number;
  /** Lleva al mapa del Radar, opcionalmente con una región abierta. */
  onVerMapa: (regionId?: string) => void;
  /** Región elegida al llegar desde el mapa. */
  regionInicial?: string;
  onNotify?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

type Errores = Partial<Record<'companyName' | 'regionId' | 'tareas' | 'dondeInfo' | 'email', string>>;

const BORRADOR_KEY = 'cotizador_borrador_v1';
const MODO_DEMO = esModoDemo();

function validar(d: SolicitudCotizador): Errores {
  const e: Errores = {};
  if (!d.companyName.trim()) e.companyName = 'Ingrese el nombre de la empresa.';
  if (!d.regionId) e.regionId = 'Seleccione una región.';
  if (!d.tareas.length && !d.tareasExtra.trim()) e.tareas = 'Marque al menos una tarea o descríbala.';
  if (!d.dondeInfo) e.dondeInfo = 'Seleccione dónde está hoy la información.';
  if (d.email.trim() && (!/^\S+@\S+\.\S+$/.test(d.email.trim()) || !d.contactName.trim())) {
    e.email = 'Para dejar un correo, indique también su nombre y revise que el correo esté bien escrito.';
  }
  return e;
}

/* ---------- piezas de formulario ---------- */
const Pregunta: React.FC<{ id: string; titulo: string; ayuda?: string; error?: string; children: React.ReactNode }> = ({
  id, titulo, ayuda, error, children,
}) => (
  <fieldset id={id} className="mb-7 scroll-mt-28">
    <legend className="font-['Outfit'] font-semibold text-[17px] text-slate-900 dark:text-white mb-1">{titulo}</legend>
    {ayuda && <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{ayuda}</p>}
    <div className={ayuda ? '' : 'mt-2'}>{children}</div>
    {error && <p role="alert" className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>}
  </fieldset>
);

const claseCampo = (conError?: boolean) =>
  `w-full rounded-xl border bg-white dark:bg-slate-950 px-3.5 py-2.5 text-[15px] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition ${
    conError ? 'border-rose-400 dark:border-rose-500' : 'border-slate-200 dark:border-slate-700'
  }`;

const Opcion: React.FC<{ marcada: boolean; tipo: 'checkbox' | 'radio'; nombre: string; onCambio: () => void; titulo: string; ayuda?: string }> = ({
  marcada, tipo, nombre, onCambio, titulo, ayuda,
}) => (
  <label className={`relative flex items-start gap-2.5 rounded-xl border px-3.5 py-3 cursor-pointer transition-colors ${
    marcada
      ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:border-blue-500'
      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-600'
  }`}>
    <input type={tipo} name={nombre} checked={marcada} onChange={onCambio} className="peer sr-only" />
    <span aria-hidden className={`mt-0.5 flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center border-2 transition-colors ${
      tipo === 'radio' ? 'rounded-full' : 'rounded-md'
    } ${marcada ? 'border-blue-600 bg-blue-600' : 'border-slate-300 dark:border-slate-600'} peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/50`}>
      {marcada && (tipo === 'radio' ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : <Check className="h-3 w-3 text-white" strokeWidth={3} />)}
    </span>
    <span className="min-w-0">
      <span className="block text-[14.5px] font-medium leading-snug text-slate-800 dark:text-slate-100">{titulo}</span>
      {ayuda && <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ayuda}</span>}
    </span>
  </label>
);

/** URL del servidor MCP remoto, para conectar el Radar a Claude, ChatGPT u otro asistente. */
const ServidorMcp: React.FC = () => {
  const url = `${window.location.origin}/api/mcp`;
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
      <span>¿Usa Claude o ChatGPT? Conecte el Radar como servidor MCP:</span>
      <code className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[13px]">{url}</code>
      <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopiado(true); setTimeout(() => setCopiado(false), 1600); } catch { /* sin portapapeles */ } }}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
        {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />} {copiado ? 'Copiada' : 'Copiar'}
      </button>
    </div>
  );
};

export const Cotizador: React.FC<CotizadorProps> = ({ regions, solicitudes, herramientasWebMcp, onVerMapa, onNotify, regionInicial = '' }) => {
  const [datos, setDatos] = useState<SolicitudCotizador>(() =>
    regionInicial ? { ...SOLICITUD_VACIA, regionId: regionInicial } : (MODO_DEMO ? PRESETS[0].datos : SOLICITUD_VACIA));
  const [presetActivo, setPresetActivo] = useState<number>(MODO_DEMO ? 0 : -1);
  const [errores, setErrores] = useState<Errores>({});
  const [borradorRestaurado, setBorradorRestaurado] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [propuesta, setPropuesta] = useState<PropuestaMcp | null>(null);
  const [datosPropuesta, setDatosPropuesta] = useState<SolicitudCotizador>(SOLICITUD_VACIA);
  const [esEjemplo, setEsEjemplo] = useState(false);
  const [solicitudId, setSolicitudId] = useState<string | null>(null);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const primeraCarga = useRef(true);
  /** Evita duplicar el punto en el mapa al regenerar la misma empresa. */
  const ultimaGuardada = useRef<{ clave: string; id: string } | null>(null);

  const nombreRegion = useCallback((id: string) => regions.find(r => r.id === id)?.name || id, [regions]);

  /* ---------- borrador ---------- */
  useEffect(() => {
    if (MODO_DEMO || regionInicial) return;
    try {
      const guardado = localStorage.getItem(BORRADOR_KEY);
      if (guardado) {
        const d = { ...SOLICITUD_VACIA, ...(JSON.parse(guardado) as Partial<SolicitudCotizador>) };
        if (d.companyName || d.tareas.length || d.tareasExtra) { setDatos(d); setBorradorRestaurado(true); }
      }
    } catch { /* sin almacenamiento */ }
  }, []);

  useEffect(() => {
    if (primeraCarga.current) { primeraCarga.current = false; return; }
    if (MODO_DEMO) return;
    try { localStorage.setItem(BORRADOR_KEY, JSON.stringify(datos)); } catch { /* sin almacenamiento */ }
  }, [datos]);

  const descartarBorrador = () => {
    try { localStorage.removeItem(BORRADOR_KEY); } catch { /* sin almacenamiento */ }
    setDatos(SOLICITUD_VACIA); setBorradorRestaurado(false); setErrores({}); setPresetActivo(-1);
  };

  /* ---------- edición ---------- */
  const actualizar = <K extends keyof SolicitudCotizador>(campo: K, valor: SolicitudCotizador[K]) => {
    setDatos(prev => {
      const siguiente = { ...prev, [campo]: valor };
      if (campo === 'tareas') {
        const ofrecidas = solucionesPara(valor as string[]);
        siguiente.soluciones = prev.soluciones.filter(s => ofrecidas.includes(s));
      }
      return siguiente;
    });
    setPresetActivo(-1);
    setErrores(prev => ({ ...prev, [campo === 'tareasExtra' ? 'tareas' : campo]: undefined }));
  };

  const alternar = (campo: 'tareas' | 'soluciones', valor: string) =>
    actualizar(campo, datos[campo].includes(valor) ? datos[campo].filter(v => v !== valor) : [...datos[campo], valor]);

  const usarPreset = (i: number) => {
    setDatos(PRESETS[i].datos); setPresetActivo(i); setErrores({}); setErrorGeneral(null); setBorradorRestaurado(false);
  };

  /* ---------- generación ---------- */
  const generar = useCallback(async (d: SolicitudCotizador): Promise<string> => {
    const errs = validar(d);
    setErrores(errs);
    const primero = Object.keys(errs)[0];
    if (primero) {
      document.getElementById('q-' + primero)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return 'Faltan datos: ' + Object.values(errs).join(' ');
    }

    setGenerando(true); setErrorGeneral(null);
    const r = await solicitarPropuesta(d);
    let p: PropuestaMcp | null = null;
    let ejemplo = false;
    if (r.ok) {
      p = r.propuesta;
    } else if ((r.code === 'sin_clave' || r.code === 'red' || r.status === 404) && esPresetIntacto(d) && EJEMPLOS[d.companyName]) {
      p = EJEMPLOS[d.companyName]; ejemplo = true;
    } else {
      setGenerando(false);
      const mensaje = r.code === 'sin_clave' || r.code === 'red' || r.status === 404
        ? 'La IA no está disponible en este momento. Con la IA desconectada solo se pueden ver las tres empresas de ejemplo sin modificar.'
        : r.error;
      setErrorGeneral(mensaje);
      return 'No se pudo generar la propuesta. ' + mensaje;
    }

    setPropuesta(p); setDatosPropuesta(d); setEsEjemplo(ejemplo); setErrorGuardado(null);
    const clave = `${d.companyName.trim().toLowerCase()}|${d.regionId}`;
    try {
      if (ultimaGuardada.current?.clave === clave) {
        setSolicitudId(ultimaGuardada.current.id);
      } else {
        setSolicitudId(null);
        // Si la base de datos no responde en 10 s, se muestra igual la propuesta con un aviso.
        const s = await Promise.race([
          guardarSolicitud(d, p),
          new Promise<never>((_, rechazar) => setTimeout(() => rechazar(new Error('tiempo')), 10000)),
        ]);
        ultimaGuardada.current = { clave, id: s.id };
        setSolicitudId(s.id);
      }
    } catch (e) {
      console.warn('No se pudo guardar la solicitud', e);
      setErrorGuardado('La propuesta se generó, pero no se pudo registrar en el mapa. Revise la conexión o los permisos de Firestore.');
    }
    setGenerando(false);
    setModalAbierto(true);
    try { if (!MODO_DEMO) localStorage.removeItem(BORRADOR_KEY); } catch { /* sin almacenamiento */ }

    const pk = p.recommendedPackageId;
    return JSON.stringify({
      empresa: d.companyName,
      titular: p.headline,
      metodos_mcp: p.suggestedTools.map(t => ({ metodo: t.name, que_hace: t.description })),
      paquete_recomendado: pk,
      es_ejemplo_guardado: ejemplo,
      siguiente_paso: 'La solicitud quedó registrada en el mapa como postulante. Browns Studio la revisará.',
    }, null, 2);
  }, []);

  /* WebMCP: un asistente puede completar y enviar el formulario */
  useEffect(() => {
    setManejadorSolicitud(async (parcial) => {
      const d = { ...SOLICITUD_VACIA, ...parcial };
      setDatos(d); setPresetActivo(-1); setBorradorRestaurado(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return generar(d);
    });
    return () => setManejadorSolicitud(null);
  }, [generar]);

  const enviar = (e: React.FormEvent) => { e.preventDefault(); void generar(datos); };

  /* ---------- mapa y aprobación ---------- */
  const porRegion = useMemo(() => contarPorRegion(solicitudes), [solicitudes]);
  const conectadas = solicitudes.filter(s => s.estado === 'conectada').length;
  const regionesActivas = Object.keys(porRegion).length;
  const solicitudActual = solicitudes.find(s => s.id === solicitudId) || null;

  const cambiarEstado = async (id: string, estado: 'postulando' | 'conectada') => {
    try { await cambiarEstadoSolicitud(id, estado); }
    catch { onNotify?.('Solo la cuenta administradora puede aprobar empresas.', 'error'); }
  };

  const solucionesOfrecidas = solucionesPara(datos.tareas);

  return (
    <div className="space-y-4 pb-6">
      {/* Encabezado */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-5 sm:px-7 sm:py-6 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Cotizador WebMCP
          </span>
          {herramientasWebMcp > 0 && (
            <span title="Un asistente de IA en este navegador puede usar estas herramientas"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <Bot className="w-3.5 h-3.5" /> WebMCP activo: {herramientasWebMcp} herramientas
            </span>
          )}
          {MODO_DEMO && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-medium">
              Modo demostración: los datos quedan en este navegador
              <button type="button" onClick={salirModoDemo} className="underline underline-offset-2 cursor-pointer">Salir</button>
            </span>
          )}
        </div>
        <h1 className="font-['Outfit'] font-bold text-2xl sm:text-3xl tracking-tight text-slate-900 dark:text-white">
          Cuéntenos cómo trabaja hoy
        </h1>
        <p className="mt-1.5 text-[15px] text-slate-600 dark:text-slate-400 max-w-[62ch]">
          Cinco preguntas. Con ellas identificamos qué podría resolver por sí solo un asistente de IA en su empresa,
          qué métodos MCP habría que habilitar y cuánto costaría.
        </p>
        <ServidorMcp />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Formulario */}
        <form onSubmit={enviar} noValidate className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-6 sm:px-7 shadow-xs">
          <div className="mb-6">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">¿Solo quiere ver cómo funciona? Pruebe con un ejemplo</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p, i) => (
                <button key={p.etiqueta} type="button" onClick={() => usarPreset(i)} aria-pressed={presetActivo === i}
                  className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors cursor-pointer ${
                    presetActivo === i
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}>
                  {p.etiqueta}
                </button>
              ))}
            </div>
          </div>

          {borradorRestaurado && (
            <div className="mb-6 flex items-center justify-between gap-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 px-4 py-2.5 text-sm text-blue-800 dark:text-blue-200">
              <span>Recuperamos lo que había escrito antes.</span>
              <button type="button" onClick={descartarBorrador} className="font-medium underline underline-offset-2 cursor-pointer">Empezar de cero</button>
            </div>
          )}

          <Pregunta id="q-companyName" titulo="¿Cómo se llama su empresa?" error={errores.companyName}>
            <input value={datos.companyName} onChange={e => actualizar('companyName', e.target.value)}
              placeholder="Nombre con el que la conocen sus clientes" className={claseCampo(!!errores.companyName)} maxLength={150} />
          </Pregunta>

          <Pregunta id="q-regionId" titulo="¿En qué región opera?" error={errores.regionId}>
            <select value={datos.regionId} onChange={e => actualizar('regionId', e.target.value)} className={claseCampo(!!errores.regionId)}>
              <option value="" disabled>Seleccione una región</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Pregunta>

          <Pregunta id="q-tareas" titulo="¿Qué consultas o tareas se repiten todos los días?"
            ayuda="Lo que sus clientes preguntan una y otra vez, o lo que su equipo hace de forma mecánica. Puede marcar varias."
            error={errores.tareas}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              {TAREAS_COMUNES.map(t => (
                <Opcion key={t} tipo="checkbox" nombre="tareas" titulo={t} marcada={datos.tareas.includes(t)} onCambio={() => alternar('tareas', t)} />
              ))}
            </div>
            <textarea value={datos.tareasExtra} onChange={e => actualizar('tareasExtra', e.target.value)} rows={2} maxLength={600}
              placeholder="¿Otra tarea? Descríbala aquí (opcional)" className={claseCampo()} />
          </Pregunta>

          <Pregunta id="q-soluciones" titulo="¿Cómo lo resuelven hoy?"
            ayuda={solucionesOfrecidas.length ? 'Opciones según lo que marcó arriba.' : 'Marque primero una tarea para ver opciones, o descríbalo.'}>
            {solucionesOfrecidas.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {solucionesOfrecidas.map(s => (
                  <Opcion key={s} tipo="checkbox" nombre="soluciones" titulo={s} marcada={datos.soluciones.includes(s)} onCambio={() => alternar('soluciones', s)} />
                ))}
              </div>
            )}
            <textarea value={datos.solucionesExtra} onChange={e => actualizar('solucionesExtra', e.target.value)} rows={2} maxLength={600}
              placeholder="Por ejemplo: abro la planilla, busco el dato y respondo por WhatsApp (opcional)" className={claseCampo()} />
          </Pregunta>

          <Pregunta id="q-dondeInfo" titulo="¿Dónde está hoy esa información?" ayuda="Seleccione la opción más parecida. No importa el nombre técnico." error={errores.dondeInfo}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup">
              {DONDE_INFO.map(o => (
                <Opcion key={o.valor} tipo="radio" nombre="dondeInfo" titulo={o.valor} ayuda={o.ayuda}
                  marcada={datos.dondeInfo === o.valor} onCambio={() => actualizar('dondeInfo', o.valor)} />
              ))}
            </div>
          </Pregunta>

          <details id="q-email" className="mb-6 rounded-xl border border-slate-200 dark:border-slate-700 open:pb-4 scroll-mt-28" open={!!errores.email || undefined}>
            <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              Agregar datos de contacto <span className="font-normal text-slate-500">(opcional, para que lo contactemos)</span>
            </summary>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 pt-1">
              {([
                ['contactName', 'Su nombre', 'text'], ['role', 'Cargo', 'text'],
                ['email', 'Correo', 'email'], ['phone', 'WhatsApp', 'tel'],
              ] as const).map(([campo, etiqueta, tipo]) => (
                <label key={campo} className="block">
                  <span className="block text-sm text-slate-600 dark:text-slate-400 mb-1">{etiqueta}</span>
                  <input type={tipo} value={datos[campo]} onChange={e => actualizar(campo, e.target.value)} className={claseCampo(campo === 'email' && !!errores.email)} />
                </label>
              ))}
              <label className="block sm:col-span-2">
                <span className="block text-sm text-slate-600 dark:text-slate-400 mb-1">A qué se dedican</span>
                <input value={datos.industry} onChange={e => actualizar('industry', e.target.value)} placeholder="Venden productos, atienden con hora…" className={claseCampo()} />
              </label>
            </div>
            {errores.email && <p role="alert" className="px-4 mt-2 text-sm text-rose-600 dark:text-rose-400">{errores.email}</p>}
          </details>

          <label className="flex items-start gap-3 mb-6 cursor-pointer">
            <input type="checkbox" checked={datos.consiente} onChange={e => actualizar('consiente', e.target.checked)}
              className="mt-1 h-4 w-4 rounded accent-blue-600 flex-shrink-0" />
            <span className="text-sm text-slate-700 dark:text-slate-300 leading-snug">
              Autorizo que la empresa aparezca con su nombre en el mapa una vez conectada
              <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Mientras postula, solo se contabiliza su región, sin nombre.</span>
            </span>
          </label>

          <button type="submit" disabled={generando}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-wait text-white font-semibold text-base px-5 py-3.5 shadow-sm transition-colors cursor-pointer">
            {generando ? <><Loader2 className="w-5 h-5 animate-spin" /> Redactando la propuesta…</> : <><Sparkles className="w-5 h-5" /> Ver la propuesta</>}
          </button>

          {errorGeneral && (
            <div role="alert" className="mt-4 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-3">
              <p className="flex items-start gap-2 text-sm text-rose-800 dark:text-rose-200">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {errorGeneral}
              </p>
              <div className="flex flex-wrap gap-3 mt-2 pl-6 text-sm">
                <button type="button" onClick={() => void generar(datos)} className="font-medium text-rose-800 dark:text-rose-200 underline underline-offset-2 cursor-pointer">Intentar de nuevo</button>
                <button type="button" onClick={() => usarPreset(0)} className="font-medium text-rose-800 dark:text-rose-200 underline underline-offset-2 cursor-pointer">Ver un ejemplo</button>
              </div>
            </div>
          )}

          {propuesta && !modalAbierto && (
            <button type="button" onClick={() => setModalAbierto(true)} className="mt-3 w-full text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline cursor-pointer">
              Volver a abrir la última propuesta
            </button>
          )}
        </form>

        {/* Mapa de solicitudes */}
        <aside className="lg:col-span-5 space-y-3">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 pt-4 pb-3 shadow-xs">
            <p className="font-['Outfit'] font-bold text-xl leading-tight text-slate-900 dark:text-white">
              {solicitudes.length
                ? <>{solicitudes.length} {solicitudes.length === 1 ? 'solicitud' : 'solicitudes'} en {regionesActivas} {regionesActivas === 1 ? 'región' : 'regiones'}.{' '}
                    {conectadas > 0 && <span className="text-blue-600 dark:text-blue-400">{conectadas} ya {conectadas === 1 ? 'conectada' : 'conectadas'}.</span>}</>
                : 'Todavía no hay solicitudes. La primera enciende su región.'}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Cada propuesta suma su región al mapa. Cuando Browns Studio conecta a la empresa, pasa a ser empresa MCP.
            </p>
            <button type="button" onClick={() => onVerMapa()}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              <MapIcon className="w-4 h-4" /> Ver solicitudes en el mapa
            </button>
          </div>

          {MODO_DEMO ? (
            <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl px-5 py-4">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h2 className="font-['Outfit'] font-bold text-base text-slate-900 dark:text-white">Aprobar empresas</h2>
                {solicitudes.length > 0 && (
                  <button type="button" onClick={() => { if (confirm('¿Vaciar las solicitudes de esta demostración?')) vaciarDemo(); }}
                    className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1 cursor-pointer">
                    <RotateCcw className="w-3 h-3" /> Vaciar
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Simula la decisión de Browns Studio. En el sitio publicado esto se hace desde el panel de administración.
              </p>
              {solicitudes.length === 0 && <p className="text-sm text-slate-500 py-2">Genere una propuesta para sumar la primera.</p>}
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {solicitudes.map(s => (
                  <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{s.empresa || 'Empresa sin nombre'}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {nombreRegion(s.regionId)},{' '}
                        {s.estado === 'conectada'
                          ? <span className="text-blue-600 dark:text-blue-400 font-medium">conectada{s.consiente ? '' : ', sin nombre'}</span>
                          : 'postulando'}
                      </p>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {s.estado === 'conectada'
                        ? <button type="button" onClick={() => void cambiarEstado(s.id, 'postulando')} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"><Undo2 className="w-3 h-3" /> Revertir</button>
                        : <button type="button" onClick={() => void cambiarEstado(s.id, 'conectada')} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"><Check className="w-3 h-3" /> Aprobar</button>}
                      <button type="button" onClick={() => void eliminarSolicitud(s.id)} aria-label={`Quitar ${s.empresa || 'solicitud'}`} className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      <PropuestaModal
        abierto={modalAbierto}
        propuesta={propuesta}
        datos={datosPropuesta}
        regionNombre={nombreRegion(datosPropuesta.regionId)}
        esEjemplo={esEjemplo}
        solicitud={solicitudActual}
        errorGuardado={errorGuardado}
        modoDemo={MODO_DEMO}
        onCerrar={() => setModalAbierto(false)}
        onRegenerar={() => { setModalAbierto(false); void generar(datosPropuesta); }}
        onVerMapa={() => { setModalAbierto(false); onVerMapa(datosPropuesta.regionId); }}
        onAprobarDemo={(id) => void cambiarEstado(id, 'conectada')}
      />
    </div>
  );
};
