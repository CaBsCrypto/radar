import type { EcosystemEvent } from '../types';

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** Fecha local en formato AAAA-MM-DD. */
export const hoyIso = (fecha = new Date()): string =>
  `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;

const esIso = (v?: string): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

/** "2026-10-05" → "5 de octubre de 2026". */
export function fechaLegible(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${a}`;
}

/** Texto de fechas de un evento: "14 - 16 de Octubre, 2026" o "30 de Septiembre - 2 de Octubre, 2026". */
export function textoFechas(inicio: string, fin?: string): string {
  const [a1, m1, d1] = inicio.split('-').map(Number);
  const mes = (m: number) => MESES[m - 1].charAt(0).toUpperCase() + MESES[m - 1].slice(1);
  if (!fin || fin === inicio) return `${d1} de ${mes(m1)}, ${a1}`;
  const [a2, m2, d2] = fin.split('-').map(Number);
  if (a1 === a2 && m1 === m2) return `${d1} - ${d2} de ${mes(m1)}, ${a1}`;
  if (a1 === a2) return `${d1} de ${mes(m1)} - ${d2} de ${mes(m2)}, ${a1}`;
  return `${d1} de ${mes(m1)}, ${a1} - ${d2} de ${mes(m2)}, ${a2}`;
}

const aUtc = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number);
  return Date.UTC(a, m - 1, d);
};
const diasEntre = (desde: string, hasta: string) => Math.round((aUtc(hasta) - aUtc(desde)) / 86_400_000);

/**
 * Estado del evento según sus fechas: evita que un evento pasado siga apareciendo como "Próximo".
 * Si no tiene fechas ISO, se respeta el estado guardado.
 */
export function conEstadoActual(e: EcosystemEvent, hoy = hoyIso()): EcosystemEvent {
  const r: EcosystemEvent = { ...e, tags: e.tags || [] };
  if (esIso(e.fechaInicio)) {
    const fin = esIso(e.fechaFin) ? e.fechaFin : e.fechaInicio;
    r.status = hoy > fin ? 'Finalizado' : hoy >= e.fechaInicio ? 'En Curso' : 'Próximo';
  }
  if (esIso(e.fechaCierre)) {
    const dias = diasEntre(hoy, e.fechaCierre);
    r.registrationDeadline = fechaLegible(e.fechaCierre);
    r.daysUntilDeadline = dias >= 0 ? dias : undefined;
    r.isRegistrationUrgent = dias >= 0 && dias <= 7;
  }
  return r;
}

/** true si la inscripción ya cerró (hay fecha de cierre y ya pasó). */
export const inscripcionCerrada = (e: EcosystemEvent, hoy = hoyIso()) => esIso(e.fechaCierre) && hoy > e.fechaCierre;

/** Orden: primero los que ocurren antes; los que no tienen fecha, al final. */
export const porFecha = (a: EcosystemEvent, b: EcosystemEvent) =>
  (a.fechaInicio || '9999').localeCompare(b.fechaInicio || '9999');
