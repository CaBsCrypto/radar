/**
 * Servidor MCP remoto del Radar (transporte Streamable HTTP, sin estado).
 *
 * Expone las mismas herramientas que WebMCP, pero por internet: cualquier cliente MCP
 * (Claude, ChatGPT en planes con conectores, Cursor, MCP Inspector…) puede usarlas agregando
 * la URL https://radar.browns.studio/api/mcp, sin tener el sitio abierto.
 *
 * - Lectura y escritura en Firestore por la API REST con la clave web pública: se aplican las mismas
 *   reglas de seguridad que en el navegador (lectura pública, creación validada, sin datos de contacto).
 * - La propuesta usa el mismo núcleo del cotizador (server/cotizar.ts) y su límite por IP.
 *
 * Especificación: https://modelcontextprotocol.io/specification/2025-06-18/basic/transports
 */
import firebaseConfig from '../firebase-applet-config.json';
import { CHILE_REGIONS } from '../src/data/mockData';
import { DONDE_INFO, NOTA_PRECIO, PAQUETES, TAREAS_COMUNES } from '../src/data/cotizadorData';
import { SITIO_PUBLICO } from '../src/lib/sitio';
import type { McpSolicitud } from '../src/types';
import { cotizar, type EntornoIA } from './cotizar';

const VERSIONES = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];
const SERVIDOR = { name: 'chile-ai-radar', title: 'Chile AI Radar · Browns Studio', version: '1.0.0' };
const SITIO = SITIO_PUBLICO;

/* ---------- Firestore por REST ---------- */
type ValorFs = { stringValue?: string; booleanValue?: boolean; arrayValue?: { values?: ValorFs[] } };
const baseFs = () =>
  `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${encodeURIComponent(firebaseConfig.firestoreDatabaseId)}/documents`;

const aValor = (v: unknown): ValorFs =>
  typeof v === 'boolean' ? { booleanValue: v }
    : Array.isArray(v) ? { arrayValue: { values: v.map(aValor) } }
    : { stringValue: String(v) };

const deValor = (v: ValorFs | undefined): unknown =>
  !v ? undefined
    : v.booleanValue !== undefined ? v.booleanValue
    : v.arrayValue ? (v.arrayValue.values || []).map(deValor)
    : v.stringValue;

async function leerSolicitudes(): Promise<McpSolicitud[]> {
  const lista: McpSolicitud[] = [];
  let token = '';
  for (let pagina = 0; pagina < 5; pagina++) {
    const url = `${baseFs()}/mcp_solicitudes?pageSize=300&key=${firebaseConfig.apiKey}${token ? '&pageToken=' + encodeURIComponent(token) : ''}`;
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Firestore respondió ${r.status}`);
    const d = await r.json() as { documents?: { fields: Record<string, ValorFs> }[]; nextPageToken?: string };
    (d.documents || []).forEach(doc => {
      const f = Object.fromEntries(Object.entries(doc.fields).map(([k, v]) => [k, deValor(v)]));
      lista.push(f as unknown as McpSolicitud);
    });
    if (!d.nextPageToken) break;
    token = d.nextPageToken;
  }
  return lista;
}

async function crearSolicitud(s: McpSolicitud): Promise<void> {
  const fields = Object.fromEntries(Object.entries(s).filter(([, v]) => v !== undefined).map(([k, v]) => [k, aValor(v)]));
  const r = await fetch(`${baseFs()}/mcp_solicitudes?documentId=${encodeURIComponent(s.id)}&key=${firebaseConfig.apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fields }),
  });
  if (!r.ok) throw new Error(`Firestore respondió ${r.status}`);
}

/* ---------- regiones ---------- */
const sinTildes = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const nombreRegion = (id: string) => CHILE_REGIONS.find(r => r.id === id)?.name || id;
const idRegion = (texto: string) => {
  const t = sinTildes(texto);
  if (!t) return '';
  return CHILE_REGIONS.find(r => [r.id, r.name, r.shortName].some(v => sinTildes(v) === t))?.id
    || CHILE_REGIONS.find(r => [r.id, r.name, r.shortName].some(v => sinTildes(v).includes(t) || t.includes(sinTildes(v))))?.id
    || '';
};
const NOMBRES_REGION = CHILE_REGIONS.map(r => r.name);

/* ---------- herramientas ---------- */
interface Resultado { content: { type: 'text'; text: string }[]; structuredContent?: Record<string, unknown>; isError?: boolean }
const texto = (t: string, datos?: Record<string, unknown>, esError = false): Resultado =>
  ({ content: [{ type: 'text', text: t }], ...(datos ? { structuredContent: datos } : {}), ...(esError ? { isError: true } : {}) });

const HERRAMIENTAS = [
  {
    name: 'getListaEmpresasConMCP',
    title: 'Empresas conectadas con MCP',
    description: 'Devuelve las empresas chilenas que ya están conectadas con MCP a través de Browns Studio, con su región y los métodos MCP que exponen. Se puede filtrar por región de Chile.',
    inputSchema: {
      type: 'object',
      properties: { region: { type: 'string', description: 'Región de Chile para filtrar (opcional).', enum: NOMBRES_REGION } },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'getTiposMCPGenerados',
    title: 'Métodos MCP más solicitados',
    description: 'Resume qué métodos MCP se han propuesto a partir de las solicitudes recibidas en el Radar y cuántas veces se repite cada uno, junto con las tareas repetitivas más frecuentes. Sirve para detectar servicios que conviene estandarizar.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'solicitar_precotizacion',
    title: 'Solicitar una pre-cotización',
    description: 'Genera una pre-cotización de Browns Studio para una empresa chilena: métodos MCP sugeridos, paquete recomendado y rango de precio estimado en CLP. La solicitud queda registrada en el mapa del Radar como postulante, sin datos de contacto.',
    inputSchema: {
      type: 'object',
      required: ['empresa', 'region', 'tareas'],
      properties: {
        empresa: { type: 'string', description: 'Nombre de la empresa.' },
        region: { type: 'string', description: 'Región de Chile donde opera.', enum: NOMBRES_REGION },
        tareas: {
          type: 'array', description: 'Consultas o tareas que se repiten todos los días. Use estas opciones cuando calcen.',
          items: { type: 'string', enum: TAREAS_COMUNES },
        },
        otras_tareas: { type: 'string', description: 'Otras tareas repetitivas, en texto libre (opcional).' },
        como_lo_resuelven: { type: 'string', description: 'Cómo lo resuelven hoy (opcional).' },
        donde_esta_la_informacion: { type: 'string', enum: DONDE_INFO.map(o => o.valor), description: 'Dónde está hoy la información.' },
        autoriza_aparecer_en_mapa: { type: 'boolean', description: 'Si autoriza que la empresa aparezca con su nombre una vez conectada.' },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
];

async function ejecutar(nombre: string, args: Record<string, unknown>, env: EntornoIA, ip: string): Promise<Resultado> {
  if (nombre === 'getListaEmpresasConMCP') {
    const filtro = typeof args.region === 'string' ? idRegion(args.region) : '';
    const empresas = (await leerSolicitudes())
      .filter(s => s.estado === 'conectada' && (!filtro || s.regionId === filtro))
      .map(s => ({
        empresa: s.consiente && s.empresa ? s.empresa : 'Empresa conectada (nombre reservado)',
        region: nombreRegion(s.regionId),
        metodos_mcp: s.metodos || [],
      }));
    if (!empresas.length) return texto(`No hay empresas conectadas${filtro ? ' en ' + nombreRegion(filtro) : ''} por ahora. Mapa: ${SITIO}`, { total: 0, empresas: [] });
    const datos = { total: empresas.length, empresas };
    return texto(JSON.stringify(datos, null, 2), datos);
  }

  if (nombre === 'getTiposMCPGenerados') {
    const solicitudes = await leerSolicitudes();
    const contar = (valores: string[]) => Object.entries(valores.reduce<Record<string, number>>((a, v) => { a[v] = (a[v] || 0) + 1; return a; }, {}))
      .sort((a, b) => b[1] - a[1]).map(([nombre, veces]) => ({ nombre, veces }));
    const datos = {
      solicitudes: solicitudes.length,
      conectadas: solicitudes.filter(s => s.estado === 'conectada').length,
      metodos_mcp: contar(solicitudes.flatMap(s => s.metodos || [])),
      tareas_repetitivas: contar(solicitudes.flatMap(s => s.categorias || [])),
    };
    return texto(JSON.stringify(datos, null, 2), datos);
  }

  if (nombre === 'solicitar_precotizacion') {
    const regionId = idRegion(String(args.region || ''));
    if (!regionId) return texto('Indique una región de Chile válida.', undefined, true);
    const tareas = Array.isArray(args.tareas) ? args.tareas.filter((t): t is string => typeof t === 'string') : [];
    const entrada = {
      companyName: String(args.empresa || ''),
      regionId: nombreRegion(regionId),
      tareas: tareas.filter(t => TAREAS_COMUNES.includes(t)),
      tareasExtra: [String(args.otras_tareas || ''), ...tareas.filter(t => !TAREAS_COMUNES.includes(t))].filter(Boolean).join('. '),
      solucionesExtra: String(args.como_lo_resuelven || ''),
      dondeInfo: String(args.donde_esta_la_informacion || 'No estoy seguro'),
    };
    const r = await cotizar(entrada, env, ip);
    if (!r.body.propuesta) return texto(r.body.error || 'No se pudo generar la propuesta.', undefined, true);
    const p = r.body.propuesta;
    const consiente = args.autoriza_aparecer_en_mapa === true;

    let registrada = true;
    try {
      await crearSolicitud({
        id: 'sol_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
        regionId, estado: 'postulando', consiente,
        ...(consiente ? { empresa: entrada.companyName.trim().slice(0, 150) } : {}),
        metodos: p.suggestedTools.map(t => t.name).slice(0, 10),
        categorias: entrada.tareas.slice(0, 12),
        paquete: p.recommendedPackageId,
        createdAt: new Date().toISOString(),
      });
    } catch (e) {
      registrada = false;
      console.warn('[mcp] no se registró la solicitud', (e as Error).message);
    }

    const pk = PAQUETES[p.recommendedPackageId];
    const datos = {
      empresa: entrada.companyName,
      region: nombreRegion(regionId),
      titular: p.headline,
      diagnostico: p.summary,
      metodos_mcp: p.suggestedTools.map(t => ({ metodo: t.name, nombre: t.title, que_hace: t.description, reemplaza: t.benefit })),
      paquete: { nombre: pk.nombre, rango_estimado_clp: pk.precio, nota: NOTA_PRECIO, plazo: pk.plazo, justificacion: p.justification },
      preguntas_primera_reunion: p.openQuestions,
      registrada_en_el_mapa: registrada,
      siguiente_paso: `Para avanzar, complete sus datos de contacto en ${SITIO}/cotizador o escriba a Browns Studio.`,
    };
    return texto(JSON.stringify(datos, null, 2), datos);
  }

  return texto(`Herramienta desconocida: ${nombre}`, undefined, true);
}

/* ---------- JSON-RPC ---------- */
interface MensajeRpc { jsonrpc?: string; id?: string | number | null; method?: string; params?: Record<string, unknown> }
export interface RespuestaMcp { status: number; headers: Record<string, string>; body?: string }

const CORS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept, Mcp-Session-Id, MCP-Protocol-Version, Authorization',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, MCP-Protocol-Version',
};
const json = (status: number, cuerpo: unknown, extra: Record<string, string> = {}): RespuestaMcp =>
  ({ status, headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra }, body: JSON.stringify(cuerpo) });
const errorRpc = (id: MensajeRpc['id'], code: number, message: string) => ({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });

async function responder(m: MensajeRpc, env: EntornoIA, ip: string): Promise<unknown | null> {
  const esNotificacion = m.id === undefined;
  if (m.jsonrpc !== '2.0' || typeof m.method !== 'string') return esNotificacion ? null : errorRpc(m.id, -32600, 'Solicitud JSON-RPC inválida');
  if (esNotificacion) return null; // notifications/initialized, cancelled, etc.

  switch (m.method) {
    case 'initialize': {
      const pedida = String(m.params?.protocolVersion || '');
      return {
        jsonrpc: '2.0', id: m.id,
        result: {
          protocolVersion: VERSIONES.includes(pedida) ? pedida : VERSIONES[0],
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVIDOR,
          instructions: 'Radar del ecosistema de IA en Chile, de Browns Studio. Use getListaEmpresasConMCP para saber qué empresas ya están conectadas con MCP, getTiposMCPGenerados para ver qué métodos se piden más, y solicitar_precotizacion para cotizar la conexión de una empresa. Responda en español.',
        },
      };
    }
    case 'ping':
      return { jsonrpc: '2.0', id: m.id, result: {} };
    case 'tools/list':
      return { jsonrpc: '2.0', id: m.id, result: { tools: HERRAMIENTAS } };
    case 'tools/call': {
      const nombre = String(m.params?.name || '');
      if (!HERRAMIENTAS.some(h => h.name === nombre)) return errorRpc(m.id, -32602, `Herramienta desconocida: ${nombre}`);
      const args = (m.params?.arguments && typeof m.params.arguments === 'object' ? m.params.arguments : {}) as Record<string, unknown>;
      try {
        return { jsonrpc: '2.0', id: m.id, result: await ejecutar(nombre, args, env, ip) };
      } catch (e) {
        console.error('[mcp]', nombre, (e as Error).message);
        return { jsonrpc: '2.0', id: m.id, result: texto('No se pudo completar la consulta en este momento. Intente nuevamente.', undefined, true) };
      }
    }
    default:
      return errorRpc(m.id, -32601, `Método no soportado: ${m.method}`);
  }
}

/** Punto de entrada común para Vercel (api/mcp.ts) y para el servidor de desarrollo (vite.config.ts). */
export async function manejarMcp(
  req: { method?: string; headers: Record<string, string | string[] | undefined>; body: unknown },
  env: EntornoIA,
  ip = 'local'
): Promise<RespuestaMcp> {
  if (req.method === 'OPTIONS') return { status: 204, headers: CORS };
  if (req.method === 'GET') {
    // Sin flujo SSE: la especificación permite responder 405. Se agrega una descripción útil para quien abra la URL.
    return json(405, { servidor: SERVIDOR, transporte: 'Streamable HTTP (POST)', herramientas: HERRAMIENTAS.map(h => h.name) }, { Allow: 'POST, OPTIONS' });
  }
  if (req.method !== 'POST') return json(405, errorRpc(null, -32600, 'Método HTTP no permitido'), { Allow: 'POST, OPTIONS' });

  const version = req.headers['mcp-protocol-version'];
  const v = Array.isArray(version) ? version[0] : version;
  if (v && !VERSIONES.includes(v)) return json(400, errorRpc(null, -32600, `Versión de protocolo no soportada: ${v}`));

  let mensaje: unknown = req.body;
  if (typeof mensaje === 'string') {
    try { mensaje = JSON.parse(mensaje || '{}'); } catch { return json(400, errorRpc(null, -32700, 'JSON inválido')); }
  }

  if (Array.isArray(mensaje)) {
    // Lotes (versión 2025-03-26): se responden los que tienen id.
    const respuestas = (await Promise.all(mensaje.map(m => responder(m as MensajeRpc, env, ip)))).filter(Boolean);
    return respuestas.length ? json(200, respuestas) : { status: 202, headers: CORS };
  }
  const r = await responder((mensaje || {}) as MensajeRpc, env, ip);
  return r ? json(200, r) : { status: 202, headers: CORS };
}
