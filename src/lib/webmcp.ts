/**
 * Herramientas WebMCP del Radar.
 *
 * Un asistente de IA en el navegador (Chrome con WebMCP) puede descubrirlas e invocarlas en este sitio:
 *  - getListaEmpresasConMCP   → empresas conectadas con MCP, filtrables por región.
 *  - getTiposMCPGenerados     → métodos MCP propuestos y cuántas veces se repiten.
 *  - solicitar_precotizacion  → completa y envía el cotizador, y devuelve la propuesta.
 *
 * La API vive en document.modelContext en Chrome reciente; versiones anteriores usaban navigator.modelContext.
 * Documentación: https://developer.chrome.com/docs/ai/webmcp/imperative-api
 */
import type { ChileRegion, McpSolicitud, SolicitudCotizador } from '../types';
import { DONDE_INFO, TAREAS_COMUNES } from '../data/cotizadorData';

interface HerramientaWebMcp {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string>;
  annotations?: { readOnlyHint?: boolean };
}

interface ModelContext {
  registerTool?: (tool: HerramientaWebMcp) => unknown;
  provideContext?: (ctx: { tools: HerramientaWebMcp[] }) => unknown;
}

/** Resultado de pedir una pre-cotización desde un asistente (lo entrega el componente Cotizador). */
export type ManejadorSolicitud = (datos: Partial<SolicitudCotizador>) => Promise<string>;

/* ---------- puente con el Cotizador ---------- */
let manejador: ManejadorSolicitud | null = null;
const esperando: ((m: ManejadorSolicitud) => void)[] = [];

/** El Cotizador se registra al montarse y se da de baja al desmontarse. */
export function setManejadorSolicitud(m: ManejadorSolicitud | null): void {
  manejador = m;
  if (m) esperando.splice(0).forEach(r => r(m));
}

function esperarManejador(ms = 4000): Promise<ManejadorSolicitud | null> {
  if (manejador) return Promise.resolve(manejador);
  return new Promise(resolve => {
    const t = setTimeout(() => resolve(null), ms);
    esperando.push(m => { clearTimeout(t); resolve(m); });
  });
}

/* ---------- registro ---------- */
export interface OpcionesWebMcp {
  regiones: ChileRegion[];
  /** Devuelve las solicitudes vigentes (se consulta en cada llamada, así nunca queda desactualizado). */
  getSolicitudes: () => McpSolicitud[];
  /** Lleva la app a la pestaña del cotizador. */
  irAlCotizador: () => void;
}

export function obtenerModelContext(): ModelContext | null {
  const d = document as Document & { modelContext?: ModelContext };
  const n = navigator as Navigator & { modelContext?: ModelContext };
  return d.modelContext || n.modelContext || null;
}

/* Las opciones vigentes se guardan aquí, así las herramientas siempre leen los datos más recientes. */
let opciones: OpcionesWebMcp | null = null;
let registro: Promise<number> | null = null;

/**
 * Registra las herramientas una sola vez por página (React en modo estricto monta dos veces en desarrollo,
 * y registrar dos veces el mismo nombre falla). Devuelve cuántas quedaron registradas; 0 si el navegador
 * no soporta WebMCP.
 */
export function registrarHerramientasWebMcp(op: OpcionesWebMcp): Promise<number> {
  opciones = op;
  if (!registro) registro = registrar();
  return registro;
}

async function registrar(): Promise<number> {
  const mc = obtenerModelContext();
  if (!mc || !opciones) return 0;
  const op = new Proxy({} as OpcionesWebMcp, { get: (_, k: keyof OpcionesWebMcp) => (opciones as OpcionesWebMcp)[k] });

  const nombreRegion = (id: string) => op.regiones.find(r => r.id === id)?.name || id;
  const idRegion = (texto: string) => {
    const t = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return op.regiones.find(r => [r.id, r.name, r.shortName].some(v =>
      v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(t)))?.id || '';
  };
  const nombresRegion = op.regiones.map(r => r.name);

  const herramientas: HerramientaWebMcp[] = [
    {
      name: 'getListaEmpresasConMCP',
      description: 'Devuelve las empresas chilenas que ya están conectadas con MCP a través de Browns Studio, con su región y los métodos MCP que exponen. Se puede filtrar por región.',
      inputSchema: {
        type: 'object',
        properties: { region: { type: 'string', description: 'Región de Chile para filtrar. Opcional.', enum: nombresRegion } },
      },
      annotations: { readOnlyHint: true },
      execute: async (args) => {
        const filtro = typeof args.region === 'string' && args.region ? idRegion(args.region) : '';
        const lista = op.getSolicitudes()
          .filter(s => s.estado === 'conectada' && (!filtro || s.regionId === filtro))
          .map(s => ({
            empresa: s.consiente && s.empresa ? s.empresa : 'Empresa conectada (nombre reservado)',
            region: nombreRegion(s.regionId),
            metodos_mcp: s.metodos,
          }));
        if (!lista.length) return `No hay empresas conectadas${filtro ? ' en ' + nombreRegion(filtro) : ''} por ahora.`;
        return JSON.stringify({ total: lista.length, empresas: lista }, null, 2);
      },
    },
    {
      name: 'getTiposMCPGenerados',
      description: 'Resume qué métodos MCP se han propuesto a partir de las solicitudes recibidas y cuántas veces se repite cada uno, junto con las tareas que más se repiten. Sirve para detectar servicios que conviene estandarizar.',
      inputSchema: { type: 'object', properties: {} },
      annotations: { readOnlyHint: true },
      execute: async () => {
        const solicitudes = op.getSolicitudes();
        if (!solicitudes.length) return 'Aún no hay solicitudes.';
        const contar = (valores: string[]) => Object.entries(valores.reduce<Record<string, number>>((acc, v) => {
          acc[v] = (acc[v] || 0) + 1; return acc;
        }, {})).sort((a, b) => b[1] - a[1]).map(([nombre, veces]) => ({ nombre, veces }));
        return JSON.stringify({
          solicitudes: solicitudes.length,
          metodos_mcp: contar(solicitudes.flatMap(s => s.metodos)),
          tareas_repetitivas: contar(solicitudes.flatMap(s => s.categorias || [])),
        }, null, 2);
      },
    },
    {
      name: 'solicitar_precotizacion',
      description: 'Completa y envía el cotizador de Browns Studio para una empresa chilena y devuelve la propuesta: métodos MCP sugeridos, paquete y rango de precio estimado. La solicitud queda registrada en el mapa como postulante.',
      inputSchema: {
        type: 'object',
        required: ['empresa', 'region', 'tareas'],
        properties: {
          empresa: { type: 'string', description: 'Nombre de la empresa.' },
          region: { type: 'string', description: 'Región de Chile donde opera.', enum: nombresRegion },
          tareas: {
            type: 'array', description: 'Tareas o consultas que se repiten todos los días. Use las opciones cuando calcen.',
            items: { type: 'string', enum: TAREAS_COMUNES },
          },
          otras_tareas: { type: 'string', description: 'Otras tareas repetitivas, en texto libre.' },
          como_lo_resuelven: { type: 'string', description: 'Cómo lo resuelven hoy.' },
          donde_esta_la_informacion: { type: 'string', enum: DONDE_INFO.map(o => o.valor) },
          autoriza_aparecer_en_mapa: { type: 'boolean', description: 'Si autoriza que la empresa aparezca con su nombre una vez conectada.' },
        },
      },
      execute: async (args) => {
        op.irAlCotizador();
        const m = await esperarManejador();
        if (!m) return 'No se pudo abrir el cotizador. Intente nuevamente.';
        const tareas = Array.isArray(args.tareas) ? (args.tareas as unknown[]).filter((t): t is string => typeof t === 'string') : [];
        return m({
          companyName: String(args.empresa || ''),
          regionId: idRegion(String(args.region || '')),
          tareas: tareas.filter(t => TAREAS_COMUNES.includes(t)),
          tareasExtra: [String(args.otras_tareas || ''), ...tareas.filter(t => !TAREAS_COMUNES.includes(t))].filter(Boolean).join('. '),
          solucionesExtra: String(args.como_lo_resuelven || ''),
          dondeInfo: String(args.donde_esta_la_informacion || 'No estoy seguro'),
          consiente: args.autoriza_aparecer_en_mapa === true,
        });
      },
    },
  ];

  let total = 0;
  if (typeof mc.registerTool === 'function') {
    for (const h of herramientas) {
      try {
        await mc.registerTool(h);
        total += 1;
      } catch (e) {
        console.warn('WebMCP: no se registró', h.name, e);
      }
    }
  } else if (typeof mc.provideContext === 'function') {
    try { await mc.provideContext({ tools: herramientas }); total = herramientas.length; } catch (e) { console.warn('WebMCP:', e); }
  }
  return total;
}
