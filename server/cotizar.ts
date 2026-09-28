/**
 * Núcleo del cotizador WebMCP: arma el prompt, llama a la IA y valida la propuesta.
 *
 * Se usa desde dos lugares:
 *  - api/cotizar.ts   → función serverless en Vercel (producción).
 *  - vite.config.ts   → middleware para `npm run dev` (desarrollo local).
 *
 * La clave de la IA vive solo en el servidor (variables de entorno). Nunca llega al navegador.
 */
import type { PropuestaMcp } from '../src/types.ts';
import { PAQUETES } from '../src/data/cotizadorData.ts';

export interface EntornoIA {
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  OPENAI_API_KEY?: string;
  OPENAI_MODEL?: string;
}

export interface RespuestaCotizar {
  status: number;
  body: { propuesta?: PropuestaMcp; modelo?: string; error?: string; code?: string };
}

const PROMPT_SISTEMA = `Eres analista preventa de Browns Studio, empresa chilena que conecta los sistemas de
una empresa con agentes de IA usando MCP (Model Context Protocol).
Recibes lo que una empresa contó sobre su operación diaria y propones los métodos MCP que habría que exponer.

REGLAS ESTRICTAS:
1. Responde SOLO con un objeto JSON válido. Sin texto ni bloques de código alrededor.
2. PROHIBIDO inventar cifras: nada de latencias, porcentajes de ahorro, volúmenes ni resultados medidos.
3. recommendedPackageId es exactamente uno de: pack-starter, pack-scale, pack-enterprise.
   "Planillas, papel o WhatsApp" o "No estoy seguro", o un alcance acotado: pack-starter.
   "Un sistema propio de la empresa" con acciones que modifican datos: pack-scale.
   "Un software que contratamos": pack-scale, o pack-enterprise si hay permisos distintos por cliente o auditoría.
4. suggestedTools: exactamente 3, derivadas de las tareas repetitivas que describe la empresa.
   "name" en snake_case, en español y sin tildes, nada genérico. "title" es esa acción para una persona,
   de 2 a 4 palabras. Al menos una debe ejecutar una acción, no solo consultar.
   "benefit": el trabajo manual concreto que deja de hacerse, en menos de 12 palabras, sin cifras.
5. Español de Chile, lenguaje de negocio y trato formal de usted. Nunca tutear.
6. outreachMessage: primera persona del plural, trato de usted, saludo formal ("Estimada" o "Estimado" y el
   nombre si se conoce), máximo 400 caracteres, sin promesas de resultados, cierra pidiendo una reunión.
7. openQuestions: exactamente 2 dudas a resolver en la primera reunión.
8. headline: el gancho de la propuesta, máximo 70 caracteres, tratando de usted a la empresa, sin cifras,
   sin signos de exclamación. Ejemplo de forma: "Que sus clientes sepan qué hay disponible sin tener que escribirle".

Esquema exacto:
{"headline":"","summary":"","suggestedTools":[{"name":"","title":"","description":"","benefit":""}],
"recommendedPackageId":"","justification":"","outreachMessage":"","openQuestions":["",""]}`;

/* ---------- validación de entrada ---------- */
const texto = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const lista = (v: unknown, maxItems: number, maxLen: number): string[] =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, maxItems).map(x => x.trim().slice(0, maxLen)) : [];

function armarPrompt(entrada: Record<string, unknown>): string | null {
  const empresa = texto(entrada.companyName, 150);
  const region = texto(entrada.regionId, 50);
  const tareas = lista(entrada.tareas, 12, 80);
  const tareasExtra = texto(entrada.tareasExtra, 600);
  if (!empresa || !region || (!tareas.length && !tareasExtra)) return null;
  const soluciones = lista(entrada.soluciones, 16, 80);
  const solucionesExtra = texto(entrada.solucionesExtra, 600);
  return `EMPRESA
Nombre: ${empresa}
Contacto: ${texto(entrada.contactName, 120) || 'no informado'} (${texto(entrada.role, 80) || 'cargo no informado'})
Región: ${region}
Rubro: ${texto(entrada.industry, 120) || 'no informado'}
Tareas que se repiten: ${[...tareas, tareasExtra].filter(Boolean).join('; ')}
Cómo lo resuelven hoy: ${[...soluciones, solucionesExtra].filter(Boolean).join('; ') || 'no informado'}
Dónde está la información: ${texto(entrada.dondeInfo, 80) || 'No estoy seguro'}

Paquetes disponibles (precios en rango referencial CLP): ${JSON.stringify(Object.fromEntries(Object.entries(PAQUETES).map(([id, p]) => [id, { nombre: p.nombre, precio: p.precio, plazo: p.plazo, paraQuien: p.paraQuien }])))}
Genera la propuesta según el esquema. Si falta un dato clave, no lo inventes: refléjalo en openQuestions.`;
}

/* ---------- validación de salida ---------- */
function esPropuesta(d: unknown): d is PropuestaMcp {
  const p = d as PropuestaMcp;
  return !!p && typeof p.headline === 'string' && typeof p.summary === 'string' &&
    Array.isArray(p.suggestedTools) && p.suggestedTools.length === 3 &&
    p.suggestedTools.every(t => t && typeof t.name === 'string' && typeof t.description === 'string') &&
    p.recommendedPackageId in PAQUETES &&
    typeof p.justification === 'string' && typeof p.outreachMessage === 'string' &&
    Array.isArray(p.openQuestions);
}

const limpiarJson = (s: string) => s.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

/* ---------- proveedores ---------- */
let modeloGeminiCache = '';

async function elegirModeloGemini(key: string): Promise<string> {
  const r = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + encodeURIComponent(key));
  const d = await r.json() as { models?: { name: string; supportedGenerationMethods?: string[] }[]; error?: { message?: string } };
  if (!r.ok) throw Object.assign(new Error(d.error?.message || 'No se pudo listar modelos'), { status: r.status });
  const usables = (d.models || [])
    .filter(m => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map(m => m.name.replace(/^models\//, ''))
  const preferidos = ['gemini-flash-latest', 'gemini-3.7-flash', 'gemini-3.8-flash'];
  const elegido = preferidos.find(p => usables.includes(p))
    || usables.find(n => /flash/i.test(n) && !/preview|exp|lite|2\.5/i.test(n))
    || usables.find(n => /flash/i.test(n))
    || usables[0];
  if (!elegido) throw new Error('La clave no tiene modelos de texto habilitados');
  return elegido;
}

async function llamarGemini(env: EntornoIA, prompt: string, reintento = true): Promise<{ texto: string; modelo: string }> {
  const key = env.GEMINI_API_KEY as string;
  const modelo = env.GEMINI_MODEL || modeloGeminiCache || (modeloGeminiCache = await elegirModeloGemini(key));
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelo)}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: PROMPT_SISTEMA }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.5 },
    }),
  });
  const d = await r.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[]; error?: { message?: string } };
  if ((r.status === 404 || r.status === 503) && reintento) {
    // Si el modelo da 404 o 503 (alta demanda), alternar a gemini-3.7-flash o gemini-flash-latest
    const alternativo = modelo === 'gemini-flash-latest' ? 'gemini-3.7-flash' : 'gemini-flash-latest';
    modeloGeminiCache = alternativo;
    return llamarGemini({ ...env, GEMINI_MODEL: alternativo }, prompt, false);
  }
  if (!r.ok) throw Object.assign(new Error(d.error?.message || 'Error de Gemini'), { status: r.status });
  return { texto: (d.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join(''), modelo };
}

async function llamarOpenAI(env: EntornoIA, prompt: string): Promise<{ texto: string; modelo: string }> {
  const modelo = env.OPENAI_MODEL || 'gpt-4o-mini';
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.OPENAI_API_KEY },
    body: JSON.stringify({
      model: modelo, response_format: { type: 'json_object' },
      messages: [{ role: 'system', content: PROMPT_SISTEMA }, { role: 'user', content: prompt }],
    }),
  });
  const d = await r.json() as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
  if (!r.ok) throw Object.assign(new Error(d.error?.message || 'Error de OpenAI'), { status: r.status });
  return { texto: d.choices?.[0]?.message?.content || '', modelo };
}

/* ---------- límite simple por IP (protege la cuota ante abuso) ---------- */
const ventana = new Map<string, number[]>();
function excedeLimite(ip: string, maximo = 8, ms = 60_000): boolean {
  const ahora = Date.now();
  const previas = (ventana.get(ip) || []).filter(t => ahora - t < ms);
  previas.push(ahora);
  ventana.set(ip, previas);
  return previas.length > maximo;
}

/* ---------- punto de entrada ---------- */
export async function cotizar(entrada: unknown, env: EntornoIA, ip = 'local'): Promise<RespuestaCotizar> {
  if (!env.GEMINI_API_KEY && !env.OPENAI_API_KEY) {
    return { status: 503, body: { code: 'sin_clave', error: 'El servidor no tiene una clave de IA configurada.' } };
  }
  if (excedeLimite(ip)) {
    return { status: 429, body: { code: 'limite', error: 'Demasiadas solicitudes seguidas. Espere un minuto e intente nuevamente.' } };
  }
  const prompt = armarPrompt((entrada || {}) as Record<string, unknown>);
  if (!prompt) {
    return { status: 400, body: { code: 'datos', error: 'Faltan datos: nombre de la empresa, región y al menos una tarea.' } };
  }
  try {
    const { texto: salida, modelo } = env.GEMINI_API_KEY ? await llamarGemini(env, prompt) : await llamarOpenAI(env, prompt);
    if (!salida) return { status: 502, body: { code: 'vacia', error: 'La IA devolvió una respuesta vacía. Intente nuevamente.' } };
    const propuesta: unknown = JSON.parse(limpiarJson(salida));
    if (!esPropuesta(propuesta)) {
      return { status: 502, body: { code: 'formato', error: 'La respuesta de la IA no cumple el formato esperado. Intente nuevamente.' } };
    }
    return { status: 200, body: { propuesta, modelo } };
  } catch (e) {
    const err = e as Error & { status?: number };
    if (err.status === 429) {
      return { status: 429, body: { code: 'cuota', error: 'Se alcanzó el límite de uso de la IA. Espere un minuto e intente nuevamente.' } };
    }
    console.error('[cotizar]', err.message);
    return { status: 500, body: { code: 'ia', error: 'No se pudo generar la propuesta. Intente nuevamente.' } };
  }
}
