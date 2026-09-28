import type { CapaMapa, EcosystemEvent, McpSolicitud, Organization } from '../types';

export type ConteosPorCapa = Record<CapaMapa, Record<string, number>>;

/** Orden de preferencia cuando dos capas tienen la misma cantidad de datos. */
export const ORDEN_CAPAS: CapaMapa[] = ['conectadas', 'solicitudes', 'organizaciones', 'eventos', 'universidades'];

/** Cuenta, por región, lo que muestra cada capa del mapa. Todo sale de datos reales (Firestore y eventos verificados). */
export function conteosPorRegion(organizaciones: Organization[], eventos: EcosystemEvent[], solicitudes: McpSolicitud[]): ConteosPorCapa {
  const c: ConteosPorCapa = { conectadas: {}, solicitudes: {}, eventos: {}, organizaciones: {}, universidades: {} };
  const sumar = (capa: CapaMapa, region: string) => { c[capa][region] = (c[capa][region] || 0) + 1; };
  solicitudes.forEach(s => {
    sumar('solicitudes', s.regionId);
    if (s.estado === 'conectada') sumar('conectadas', s.regionId);
  });
  eventos.filter(e => e.status !== 'Finalizado').forEach(e => sumar('eventos', e.regionId));
  organizaciones.forEach(o => sumar(o.type === 'Universidad' ? 'universidades' : 'organizaciones', o.regionId));
  return c;
}

export const totalDe = (porRegion: Record<string, number>) => Object.values(porRegion).reduce((a, b) => a + b, 0);

/** La capa con más datos: es la que se muestra al abrir el mapa. */
export function capaMasPoblada(conteos: ConteosPorCapa): CapaMapa {
  return ORDEN_CAPAS.reduce((mejor, capa) => (totalDe(conteos[capa]) > totalDe(conteos[mejor]) ? capa : mejor), ORDEN_CAPAS[0]);
}
