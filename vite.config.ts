import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {cotizar} from './server/cotizar.ts';
import {manejarMcp} from './server/mcp.ts';

/**
 * En desarrollo (`npm run dev`) atiende POST /api/cotizar con el mismo núcleo que usa Vercel en producción,
 * leyendo la clave desde el archivo .env local. Así no hace falta la CLI de Vercel para probar.
 */
function apiCotizarLocal(env: Record<string, string>): Plugin {
  return {
    name: 'api-local',
    configureServer(server) {
      server.middlewares.use('/api/cotizar', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({error: 'Método no permitido'}));
          return;
        }
        let cuerpo = '';
        req.on('data', (trozo) => { cuerpo += trozo; });
        req.on('end', async () => {
          let entrada: unknown = {};
          try { entrada = JSON.parse(cuerpo || '{}'); } catch { /* cuerpo inválido: el núcleo responde 400 */ }
          const resultado = await cotizar(entrada, env);
          res.statusCode = resultado.status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(resultado.body));
        });
      });

      // Servidor MCP remoto (mismo código que api/mcp.ts en Vercel)
      server.middlewares.use('/api/mcp', (req, res) => {
        let cuerpo = '';
        req.on('data', (trozo) => { cuerpo += trozo; });
        req.on('end', async () => {
          const r = await manejarMcp({method: req.method, headers: req.headers, body: cuerpo}, env);
          res.statusCode = r.status;
          Object.entries(r.headers).forEach(([k, v]) => res.setHeader(k, v));
          res.end(r.body);
        });
      });
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), apiCotizarLocal(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
