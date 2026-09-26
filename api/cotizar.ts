/**
 * POST /api/cotizar — función serverless de Vercel.
 * Recibe los datos del cotizador y devuelve la propuesta generada por la IA.
 * Requiere GEMINI_API_KEY (u OPENAI_API_KEY) en las variables de entorno del proyecto en Vercel.
 */
import { cotizar } from '../server/cotizar';

interface Solicitud {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}
interface Respuesta {
  status: (codigo: number) => Respuesta;
  setHeader: (nombre: string, valor: string) => void;
  json: (cuerpo: unknown) => void;
}

export default async function handler(req: Solicitud, res: Respuesta) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const reenviada = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(reenviada) ? reenviada[0] : reenviada || 'desconocida').split(',')[0].trim();
  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  const resultado = await cotizar(cuerpo, process.env, ip);
  return res.status(resultado.status).json(resultado.body);
}
