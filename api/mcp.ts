/**
 * /api/mcp — servidor MCP remoto del Radar (Streamable HTTP, sin estado).
 * Para conectarlo: agregar https://radar.browns.studio/api/mcp como conector MCP en Claude, ChatGPT u otro cliente.
 * Usa GEMINI_API_KEY (u OPENAI_API_KEY) de las variables de entorno para solicitar_precotizacion.
 */
import { manejarMcp } from '../server/mcp.ts';

interface Solicitud {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}
interface Respuesta {
  status: (codigo: number) => Respuesta;
  setHeader: (nombre: string, valor: string) => void;
  end: (cuerpo?: string) => void;
}

export default async function handler(req: Solicitud, res: Respuesta) {
  const reenviada = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(reenviada) ? reenviada[0] : reenviada || 'desconocida').split(',')[0].trim();
  const r = await manejarMcp({ method: req.method, headers: req.headers, body: req.body }, process.env, ip);
  Object.entries(r.headers).forEach(([k, v]) => res.setHeader(k, v));
  res.status(r.status).end(r.body);
}
