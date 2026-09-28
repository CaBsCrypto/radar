import React, { useEffect, useState } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import type { ChileRegion, EcosystemEvent, Organization } from '../types';
import { FormularioEntidad } from './FormularioEntidad';

interface AddEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
  regions: ChileRegion[];
  onAddOrganization: (org: Organization) => Promise<void> | void;
  onAddEvent: (event: EcosystemEvent) => Promise<void> | void;
  /** Pestaña con la que abre el formulario. */
  tipoInicial?: 'organizacion' | 'evento';
}

/**
 * Propuesta pública de una organización o evento.
 * No se publica al instante: queda pendiente hasta que un administrador la aprueba en /admin.
 */
export const AddEntityModal: React.FC<AddEntityModalProps> = ({ isOpen, onClose, regions, onAddOrganization, onAddEvent, tipoInicial }) => {
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    if (!isOpen) { setEnviado(false); return; }
    const alTeclear = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div id="add-entity-modal-backdrop" onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
      <div id="add-entity-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="titulo-sumar" onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl relative my-auto">
        <button type="button" id="btn-close-add-modal" onClick={onClose} aria-label="Cerrar"
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-800 cursor-pointer">
          <X className="w-5 h-5" />
        </button>

        {enviado ? (
          <div className="py-12 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">¡Gracias! Recibimos su propuesta</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              La revisaremos y, si todo está en orden, la publicaremos en el Radar en los próximos días.
            </p>
            <button type="button" onClick={onClose} className="mt-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-sm font-semibold cursor-pointer">Cerrar</button>
          </div>
        ) : (
          <>
            <div className="pr-10 mb-5">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Sumar al Radar
              </span>
              <h2 id="titulo-sumar" className="text-xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] mt-2">Proponga una organización o un evento</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Revisamos cada propuesta antes de publicarla, para que el Radar muestre solo información real.
              </p>
            </div>
            <FormularioEntidad
              regions={regions}
              tipoInicial={tipoInicial}
              textoBoton="Enviar propuesta"
              onGuardar={async (e) => {
                if (e.tipo === 'organizacion') await onAddOrganization(e.datos);
                else await onAddEvent(e.datos);
                setEnviado(true);
              }}
              onCancelar={onClose}
            />
          </>
        )}
      </div>
    </div>
  );
};
