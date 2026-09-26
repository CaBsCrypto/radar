/**
 * Servicio del cotizador WebMCP.
 *
 * - Pide la propuesta a /api/cotizar (la clave de la IA vive en el servidor).
 * - Guarda la solicitud pública (sin datos de contacto) en `mcp_solicitudes`.
 * - Si la empresa dejó contacto, crea además el lead privado en `business_submissions` (visible en /admin).
 *
 * Modo demostración (`?demo=1`): todo se guarda en este navegador y no se toca Firestore.
 * Sirve para presentar el flujo, incluida la aprobación, sin permisos de administrador.
 */
import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { registerBusinessSubmission } from '../lib/firebase';
import type {
  EstadoSolicitud, McpSolicitud, PropuestaMcp, SolicitudCotizador, SolicitudesPorRegion,
} from '../types';

export const SOLICITUDES_COLLECTION = 'mcp_solicitudes';
const DEMO_KEY = 'cotizador_demo_solicitudes';
const DEMO_EVENT = 'cotizador-demo-cambio';

/* ---------- modo demostración ---------- */
const MODO_DEMO: boolean = (() => {
  try {
    const activo = new URLSearchParams(window.location.search).get('demo') === '1';
    if (activo) sessionStorage.setItem('cotizador_demo', '1');
    return activo || sessionStorage.getItem('cotizador_demo') === '1';
  } catch {
    return false;
  }
})();

export const esModoDemo = (): boolean => MODO_DEMO;

export function salirModoDemo(): void {
  try { sessionStorage.removeItem('cotizador_demo'); } catch { /* sin almacenamiento */ }
  window.location.href = window.location.pathname;
}

const leerDemo = (): McpSolicitud[] => {
  try { return JSON.parse(localStorage.getItem(DEMO_KEY) || '[]') as McpSolicitud[]; } catch { return []; }
};
const guardarDemo = (lista: McpSolicitud[]) => {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(lista)); } catch { /* sin almacenamiento */ }
  window.dispatchEvent(new Event(DEMO_EVENT));
};
export const vaciarDemo = () => guardarDemo([]);

/* ---------- IA ---------- */
export type ResultadoPropuesta =
  | { ok: true; propuesta: PropuestaMcp; modelo?: string }
  | { ok: false; status: number; code?: string; error: string };

export async function solicitarPropuesta(datos: SolicitudCotizador): Promise<ResultadoPropuesta> {
  try {
    const r = await fetch('/api/cotizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    const cuerpo = await r.json().catch(() => ({})) as { propuesta?: PropuestaMcp; modelo?: string; error?: string; code?: string };
    if (r.ok && cuerpo.propuesta) return { ok: true, propuesta: cuerpo.propuesta, modelo: cuerpo.modelo };
    return { ok: false, status: r.status, code: cuerpo.code, error: cuerpo.error || `Error ${r.status}` };
  } catch {
    return { ok: false, status: 0, code: 'red', error: 'No se pudo conectar con el servidor.' };
  }
}

/* ---------- solicitudes ---------- */
const nuevoId = () => 'sol_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);

/** Resumen para el lead privado de /admin (campo agentGoal, máx. 1000 caracteres según reglas). */
function resumenLead(datos: SolicitudCotizador, propuesta: PropuestaMcp): string {
  const tareas = [...datos.tareas, datos.tareasExtra].filter(Boolean).join('; ');
  const metodos = propuesta.suggestedTools.map(t => t.name).join(', ');
  return `[Cotizador] Tareas: ${tareas}. Métodos MCP propuestos: ${metodos}. Paquete: ${propuesta.recommendedPackageId}.`.slice(0, 1000);
}

export async function guardarSolicitud(datos: SolicitudCotizador, propuesta: PropuestaMcp): Promise<McpSolicitud> {
  const solicitud: McpSolicitud = {
    id: nuevoId(),
    regionId: datos.regionId,
    estado: 'postulando',
    consiente: datos.consiente,
    metodos: propuesta.suggestedTools.map(t => t.name).slice(0, 10),
    categorias: datos.tareas.slice(0, 12),
    paquete: propuesta.recommendedPackageId,
    createdAt: new Date().toISOString(),
    ...(datos.consiente ? { empresa: datos.companyName.trim().slice(0, 150) } : {}),
  };

  if (MODO_DEMO) {
    // En demo se guarda también el nombre, para poder identificar la fila en el panel de aprobación.
    guardarDemo([{ ...solicitud, empresa: datos.companyName.trim() }, ...leerDemo()]);
    return solicitud;
  }

  if (datos.email.trim() && datos.contactName.trim()) {
    try {
      const lead = await registerBusinessSubmission({
        companyName: datos.companyName,
        contactName: datos.contactName,
        role: datos.role,
        email: datos.email,
        phone: datos.phone,
        regionId: datos.regionId,
        currentTechState: datos.dondeInfo,
        agentGoal: resumenLead(datos, propuesta),
      });
      solicitud.submissionId = lead.id;
    } catch (e) {
      console.warn('No se pudo registrar el lead privado; se guarda solo la solicitud pública.', e);
    }
  }

  await setDoc(doc(db, SOLICITUDES_COLLECTION, solicitud.id), solicitud);
  return solicitud;
}

export function subscribeSolicitudes(
  onUpdate: (lista: McpSolicitud[]) => void,
  onError?: (err: unknown) => void
): () => void {
  if (MODO_DEMO) {
    const emitir = () => onUpdate(leerDemo());
    emitir();
    window.addEventListener(DEMO_EVENT, emitir);
    window.addEventListener('storage', emitir);
    return () => {
      window.removeEventListener(DEMO_EVENT, emitir);
      window.removeEventListener('storage', emitir);
    };
  }
  return onSnapshot(
    collection(db, SOLICITUDES_COLLECTION),
    (snap) => {
      const lista = snap.docs.map(d => ({ ...(d.data() as McpSolicitud), id: d.id }));
      lista.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      onUpdate(lista);
    },
    (err) => { if (onError) onError(err); }
  );
}

/** Aprobar o revertir. En producción las reglas de Firestore solo lo permiten a la cuenta administradora. */
export async function cambiarEstadoSolicitud(id: string, estado: EstadoSolicitud): Promise<void> {
  if (MODO_DEMO) {
    guardarDemo(leerDemo().map(s => (s.id === id ? { ...s, estado } : s)));
    return;
  }
  await updateDoc(doc(db, SOLICITUDES_COLLECTION, id), { estado });
}

export async function eliminarSolicitud(id: string): Promise<void> {
  if (MODO_DEMO) {
    guardarDemo(leerDemo().filter(s => s.id !== id));
    return;
  }
  await deleteDoc(doc(db, SOLICITUDES_COLLECTION, id));
}

export function contarPorRegion(lista: McpSolicitud[]): SolicitudesPorRegion {
  const conteo: SolicitudesPorRegion = {};
  lista.forEach(s => {
    const c = conteo[s.regionId] || (conteo[s.regionId] = { postulando: 0, conectadas: 0 });
    if (s.estado === 'conectada') c.conectadas += 1; else c.postulando += 1;
  });
  return conteo;
}
