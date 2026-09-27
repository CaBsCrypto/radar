import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, Check, FileDown, RefreshCw, MessageCircle, MapPin, BadgeCheck, AlertTriangle } from 'lucide-react';
import type { McpSolicitud, PropuestaMcp, SolicitudCotizador } from '../types';
import { NOTA_PRECIO, PAQUETES } from '../data/cotizadorData';

interface PropuestaModalProps {
  abierto: boolean;
  propuesta: PropuestaMcp | null;
  datos: SolicitudCotizador;
  regionNombre: string;
  esEjemplo: boolean;
  solicitud: McpSolicitud | null;
  errorGuardado: string | null;
  modoDemo: boolean;
  onCerrar: () => void;
  onRegenerar: () => void;
  onVerMapa: () => void;
  onAprobarDemo?: (id: string) => void;
}

const mayuscula = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');
const hoy = () => new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });

/** Botón de copiar con confirmación breve. */
const BotonCopiar: React.FC<{ texto: string; etiqueta: string }> = ({ texto, etiqueta }) => {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try { await navigator.clipboard.writeText(texto); setCopiado(true); setTimeout(() => setCopiado(false), 1600); } catch { /* sin portapapeles */ }
      }}
      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
    >
      {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
      {copiado ? 'Copiado' : etiqueta}
    </button>
  );
};

export const PropuestaModal: React.FC<PropuestaModalProps> = ({
  abierto, propuesta, datos, regionNombre, esEjemplo, solicitud, errorGuardado, modoDemo,
  onCerrar, onRegenerar, onVerMapa, onAprobarDemo,
}) => {
  const cerrarRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    cerrarRef.current?.focus();
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', alTeclear);
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, onCerrar]);

  if (!abierto || !propuesta) return null;

  const pk = PAQUETES[propuesta.recommendedPackageId];
  const whatsapp = datos.phone.replace(/[^0-9]/g, '');
  const textoCompleto = [
    `Propuesta para ${datos.companyName}`, propuesta.headline, '',
    'Lo que pasa hoy', propuesta.summary, '',
    'Métodos MCP propuestos',
    'Cada método es una acción que su sistema pone a disposición mediante MCP, el estándar que ya utilizan ChatGPT, Claude y Gemini.',
    ...propuesta.suggestedTools.map((t, i) => `- Método MCP ${i + 1}, ${t.name}(): ${t.title}. ${t.description}${t.benefit ? ` Hoy se hace a mano: ${t.benefit}.` : ''}`),
    '', 'Inversión', `${pk.nombre}: entre ${pk.precio} CLP, ${pk.plazo}.`, NOTA_PRECIO, propuesta.justification,
    '', 'Para conversar en la primera reunión', ...propuesta.openQuestions.map(q => `- ${q}`),
    '', 'Browns Studio',
  ].join('\n');

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm overflow-y-auto print:static print:bg-white print:backdrop-blur-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="propuesta-titulo"
      onClick={onCerrar}
    >
      <div className="min-h-full flex items-start justify-center p-3 sm:p-6 print:p-0" onClick={(e) => e.stopPropagation()}>
        <div className="w-full max-w-3xl animate-[aparecer_.35s_ease-out] motion-reduce:animate-none">
          {/* Barra superior */}
          <div className="flex items-center justify-between gap-3 mb-3 print:hidden">
            <p className="text-sm font-medium text-white/90">Vista previa de la propuesta</p>
            <button
              ref={cerrarRef}
              type="button"
              onClick={onCerrar}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" /> Cerrar propuesta
            </button>
          </div>

          {/* Documento: siempre blanco, es lo que recibe el cliente */}
          <article className="print-sheet bg-white text-slate-900 rounded-2xl shadow-2xl px-6 py-8 sm:px-12 sm:py-11 print:shadow-none print:rounded-none">
            <header className="flex flex-wrap items-baseline justify-between gap-2 pb-4 mb-8 border-b-2 border-slate-900">
              <span className="font-['Outfit'] font-extrabold text-lg tracking-tight">Browns Studio</span>
              <span className="text-sm text-slate-500">
                Propuesta para {datos.companyName}, {regionNombre}. {hoy()}
              </span>
            </header>

            {esEjemplo && (
              <p className="inline-block mb-5 px-2.5 py-1 text-xs text-slate-600 border border-dashed border-slate-400 rounded print:hidden">
                Ejemplo guardado: en esta ejecución no se llamó a la IA
              </p>
            )}

            <h2 id="propuesta-titulo" className="font-['Outfit'] font-extrabold tracking-tight text-3xl sm:text-[2.6rem] leading-[1.05] mb-9 max-w-[20ch] text-balance">
              {propuesta.headline}
            </h2>

            <section className="mb-9">
              <h3 className="text-sm font-bold text-slate-500 mb-2">Lo que pasa hoy</h3>
              <p className="text-base sm:text-[17px] leading-relaxed max-w-[62ch]">{propuesta.summary}</p>
            </section>

            <section className="mb-9">
              <h3 className="text-sm font-bold text-slate-500 mb-2">Métodos MCP propuestos</h3>
              <p className="text-[15px] text-slate-600 leading-relaxed max-w-[66ch] mb-4">
                Cada método es una acción que su sistema pone a disposición mediante <strong className="text-blue-700">MCP</strong>,
                el estándar que ya utilizan ChatGPT, Claude y Gemini. El asistente invoca el método, obtiene el dato real
                y responde con él. Su empresa decide qué métodos quedan habilitados.
              </p>
              <div className="border-t border-slate-200">
                {propuesta.suggestedTools.map((t, i) => (
                  <div key={t.name + i} className="grid sm:grid-cols-2 gap-2 sm:gap-6 py-4 border-b border-slate-200 break-inside-avoid">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[11px] font-bold">Método MCP {i + 1}</span>
                        <code className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono">{t.name}()</code>
                      </div>
                      <h4 className="font-['Outfit'] font-bold text-lg leading-snug">{t.title}</h4>
                      <p className="text-[14.5px] text-slate-600">{t.description}</p>
                    </div>
                    {t.benefit && (
                      <div className="self-center sm:border-l-2 sm:border-slate-200 sm:pl-4">
                        <p className="text-xs text-slate-500 mb-0.5">Hoy se hace a mano</p>
                        <p className="text-[14.5px] leading-snug">{mayuscula(t.benefit)}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-9 break-inside-avoid">
              <h3 className="text-sm font-bold text-slate-500 mb-2">Inversión</h3>
              <div className="bg-slate-900 text-white rounded-xl px-6 py-5 print:[print-color-adjust:exact]">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-1">Rango estimado</p>
                <p className="font-['Outfit'] font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight">
                  {pk.precio}<span className="text-base font-medium opacity-70 ml-1.5">CLP</span>
                </p>
                <p className="mt-2 font-bold text-lg leading-tight">{pk.nombre} <span className="font-normal text-sm opacity-70">· {pk.plazo}</span></p>
                <p className="text-[14.5px] opacity-85 mt-3 max-w-[62ch]">{propuesta.justification}</p>
                <p className="text-xs opacity-60 mt-3">{NOTA_PRECIO}</p>
              </div>
            </section>

            <section className="break-inside-avoid">
              <h3 className="text-sm font-bold text-slate-500 mb-2">Para conversar en la primera reunión</h3>
              <ul className="divide-y divide-slate-200">
                {propuesta.openQuestions.map((q, i) => <li key={i} className="py-2 text-[15.5px] max-w-[62ch]">{q}</li>)}
              </ul>
            </section>

            <footer className="mt-10 pt-3 border-t border-slate-200 text-sm text-slate-500">
              Browns Studio, agentes de IA conectados a su operación.
            </footer>
          </article>

          {/* Estado en el mapa */}
          <div className="mt-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 print:hidden">
            {errorGuardado ? (
              <p className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /> {errorGuardado}
              </p>
            ) : solicitud ? (
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <p className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  {solicitud.estado === 'conectada'
                    ? <><BadgeCheck className="w-4 h-4 text-blue-600" /> {datos.companyName} está conectada como empresa MCP en {regionNombre}.</>
                    : <><MapPin className="w-4 h-4 text-blue-600" /> La solicitud se sumó al mapa en {regionNombre} como empresa postulante.</>}
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={onVerMapa} className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    Ver en el mapa
                  </button>
                  {modoDemo && solicitud.estado !== 'conectada' && onAprobarDemo && (
                    <button type="button" onClick={() => onAprobarDemo(solicitud.id)} className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold cursor-pointer">
                      Aprobar (demostración)
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Acciones */}
          <div className="mt-3 flex flex-wrap gap-2 print:hidden">
            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(propuesta.outreachMessage)}`}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" /> Enviar mensaje por WhatsApp
              </a>
            )}
            <BotonCopiar texto={propuesta.outreachMessage} etiqueta="Copiar mensaje de contacto" />
            <BotonCopiar texto={textoCompleto} etiqueta="Copiar propuesta en texto" />
            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              <FileDown className="w-4 h-4" /> Guardar como PDF
            </button>
            <button type="button" onClick={onRegenerar} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
              <RefreshCw className="w-4 h-4" /> Generar de nuevo
            </button>
          </div>
          <p className="mt-2 mb-6 text-xs text-white/80 print:hidden">Revise la propuesta antes de enviarla al cliente.</p>
        </div>
      </div>
    </div>
  );
};
