import React, { useState } from 'react';
import { Newspaper, Loader2, Check } from 'lucide-react';
import { registerWaitlistSubscriber } from '../lib/firebase';

interface SuscripcionBoletinProps {
  /** Origen guardado en waitlist_subscribers.source (visible en el panel de administración). */
  origen: string;
}

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Suscripción al boletín semanal del Radar.
 * Guarda en `waitlist_subscribers`, la misma colección que lista el panel de administración.
 */
export const SuscripcionBoletin: React.FC<SuscripcionBoletinProps> = ({ origen }) => {
  const [correo, setCorreo] = useState('');
  const [estado, setEstado] = useState<'inicial' | 'enviando' | 'listo' | 'error'>('inicial');
  const [mensaje, setMensaje] = useState('');

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = correo.trim().toLowerCase();
    if (!CORREO_VALIDO.test(limpio)) {
      setEstado('error'); setMensaje('Revise que el correo esté bien escrito, por ejemplo: contacto@empresa.cl');
      return;
    }
    setEstado('enviando'); setMensaje('');
    try {
      await registerWaitlistSubscriber({ email: limpio, source: origen, interests: ['Hackathons', 'Oportunidades', 'Fondos', 'Eventos'] });
      setEstado('listo');
    } catch (err) {
      console.warn('No se pudo registrar la suscripción', err);
      setEstado('error'); setMensaje('No pudimos registrar su correo en este momento. Intente nuevamente en unos minutos.');
    }
  };

  return (
    <section id="suscripcion-boletin" aria-labelledby="boletin-titulo"
      className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-blue-50 px-6 py-8 sm:px-10 sm:py-10">
      <div className="grid lg:grid-cols-[1fr_1.1fr] gap-6 lg:gap-10 items-center">
        <div className="flex gap-4">
          <span className="w-12 h-12 rounded-2xl bg-blue-600 text-white grid place-items-center flex-shrink-0 shadow-md shadow-blue-600/25">
            <Newspaper className="w-6 h-6" />
          </span>
          <div>
            <h2 id="boletin-titulo" className="font-['Outfit'] font-bold text-2xl sm:text-3xl tracking-tight text-slate-900 leading-tight">
              Boletín semanal del Radar
            </h2>
            <p className="mt-1.5 text-[15px] text-slate-600 leading-relaxed">
              Cada lunes: hackathons, fondos concursables, convocatorias abiertas y novedades de IA en Chile. Sin costo.
            </p>
          </div>
        </div>

        {estado === 'listo' ? (
          <p role="status" className="flex items-center gap-3 rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4 text-emerald-800 font-medium">
            <Check className="w-5 h-5 flex-shrink-0" /> Listo. Recibirá el próximo boletín en {correo.trim().toLowerCase()}.
          </p>
        ) : (
          <form onSubmit={enviar} noValidate>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <label htmlFor="boletin-correo" className="sr-only">Correo electrónico</label>
              <input id="boletin-correo" type="email" inputMode="email" autoComplete="email" value={correo}
                onChange={e => { setCorreo(e.target.value); if (estado === 'error') setEstado('inicial'); }}
                placeholder="Su correo electrónico"
                className={`flex-1 min-w-0 rounded-xl border bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 ${
                  estado === 'error' ? 'border-rose-400' : 'border-slate-300'
                }`} />
              <button type="submit" disabled={estado === 'enviando'}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-3.5 transition-colors cursor-pointer">
                {estado === 'enviando' ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Suscribirme
              </button>
            </div>
            <p className={`mt-2 text-sm ${estado === 'error' ? 'text-rose-600' : 'text-slate-500'}`} role={estado === 'error' ? 'alert' : undefined}>
              {estado === 'error' ? mensaje : 'Puede darse de baja cuando quiera.'}
            </p>
          </form>
        )}
      </div>
    </section>
  );
};
