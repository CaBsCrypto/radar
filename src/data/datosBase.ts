/**
 * Datos base del Radar. Solo información verificable:
 * - Regiones: nombre oficial, número romano, macrozona y capital.
 * - Eventos: verificados en su página oficial el 27 de septiembre de 2026 (ver `registrationUrl`).
 *
 * Todo lo demás (directorio, universidades, empresas conectadas) se carga desde el panel de administración
 * y vive en Firestore. Los eventos de esta lista se pueden editar u ocultar desde el panel.
 */
import type { ChileRegion, EcosystemEvent } from '../types.ts';

export const CHILE_REGIONS: ChileRegion[] = [
  { id: 'arica', name: 'Arica y Parinacota', shortName: 'Arica', romanNumeral: 'XV', zone: 'Norte Grande', capital: 'Arica' },
  { id: 'tarapaca', name: 'Tarapacá', shortName: 'Tarapacá', romanNumeral: 'I', zone: 'Norte Grande', capital: 'Iquique' },
  { id: 'antofagasta', name: 'Antofagasta', shortName: 'Antofagasta', romanNumeral: 'II', zone: 'Norte Grande', capital: 'Antofagasta' },
  { id: 'atacama', name: 'Atacama', shortName: 'Atacama', romanNumeral: 'III', zone: 'Norte Chico', capital: 'Copiapó' },
  { id: 'coquimbo', name: 'Coquimbo', shortName: 'Coquimbo', romanNumeral: 'IV', zone: 'Norte Chico', capital: 'La Serena' },
  { id: 'valparaiso', name: 'Valparaíso', shortName: 'Valparaíso', romanNumeral: 'V', zone: 'Centro', capital: 'Valparaíso' },
  { id: 'metropolitana', name: 'Región Metropolitana', shortName: 'Santiago RM', romanNumeral: 'XIII', zone: 'Centro', capital: 'Santiago' },
  { id: 'ohiggins', name: "Libertador General Bernardo O'Higgins", shortName: "O'Higgins", romanNumeral: 'VI', zone: 'Centro', capital: 'Rancagua' },
  { id: 'maule', name: 'Maule', shortName: 'Maule', romanNumeral: 'VII', zone: 'Centro', capital: 'Talca' },
  { id: 'nuble', name: 'Ñuble', shortName: 'Ñuble', romanNumeral: 'XVI', zone: 'Sur', capital: 'Chillán' },
  { id: 'biobio', name: 'Biobío', shortName: 'Biobío', romanNumeral: 'VIII', zone: 'Sur', capital: 'Concepción' },
  { id: 'araucania', name: 'La Araucanía', shortName: 'Araucanía', romanNumeral: 'IX', zone: 'Sur', capital: 'Temuco' },
  { id: 'losrios', name: 'Los Ríos', shortName: 'Los Ríos', romanNumeral: 'XIV', zone: 'Sur', capital: 'Valdivia' },
  { id: 'loslagos', name: 'Los Lagos', shortName: 'Los Lagos', romanNumeral: 'X', zone: 'Sur', capital: 'Puerto Montt' },
  { id: 'aysen', name: 'Aysén del General Carlos Ibáñez del Campo', shortName: 'Aysén', romanNumeral: 'XI', zone: 'Austral', capital: 'Coyhaique' },
  { id: 'magallanes', name: 'Magallanes y de la Antártica Chilena', shortName: 'Magallanes', romanNumeral: 'XII', zone: 'Austral', capital: 'Punta Arenas' },
];

/** Eventos verificados en su página oficial. El estado se calcula con las fechas (src/lib/eventos.ts). */
export const EVENTOS_VERIFICADOS: EcosystemEvent[] = [
  {
    id: 'tellus-find-your-way-2026', title: 'Find Your Way: Hackathon', type: 'Hackathon',
    organizer: 'Tellus Cooperative', dateStr: '1 de Septiembre - 12 de Octubre, 2026',
    fechaInicio: '2026-09-01', fechaFin: '2026-10-12', fechaCierre: '2026-10-05',
    status: 'En Curso', regionId: 'metropolitana', locationName: 'En línea (Tellus, Providencia)', isVirtual: true,
    prizePool: '5.000 USDC', tags: ['Blockchain', 'Stellar', 'Web3', 'Universitarios'],
    registrationUrl: 'https://blog.telluscoop.com/p/findyourway',
  },
  {
    id: 'summit-pais-digital-2026', title: 'Summit País Digital 2026: "El Momento es Ahora"', type: 'Cumbre / Conferencia',
    organizer: 'Fundación País Digital', dateStr: '6 - 8 de Octubre, 2026',
    fechaInicio: '2026-10-06', fechaFin: '2026-10-08',
    status: 'Próximo', regionId: 'metropolitana', locationName: 'Hotel W Santiago, Las Condes', isVirtual: false,
    tags: ['IA', 'Transformación Digital', 'Salud', 'Educación'],
    registrationUrl: 'https://summit.paisdigital.org/',
  },
  {
    id: 'ntt-hack-the-challenge-2026', title: 'Hack the Challenge 2026', type: 'Hackathon',
    organizer: 'NTT DATA Chile', dateStr: '14 - 16 de Octubre, 2026',
    fechaInicio: '2026-10-14', fechaFin: '2026-10-16', fechaCierre: '2026-09-30',
    status: 'Próximo', regionId: 'metropolitana', locationName: 'Santiago', isVirtual: false,
    prizePool: 'Gift card de $250.000 por integrante del equipo ganador',
    tags: ['IA', 'Minería', 'Mantenimiento predictivo', 'Estudiantes STEM'],
    registrationUrl: 'https://cl.nttdata.com/landings/hackthechallenge',
  },
  {
    id: 'devfest-cloud-santiago-2026', title: 'DevFest Cloud Santiago 2026', type: 'Meetup Comunitario',
    organizer: 'GDG Cloud Santiago de Chile', dateStr: '17 de Octubre, 2026',
    fechaInicio: '2026-10-17', fechaFin: '2026-10-17',
    status: 'Próximo', regionId: 'metropolitana', locationName: 'INACAP Sede Apoquindo, Las Condes', isVirtual: false,
    tags: ['Google Cloud', 'IA Generativa', 'Code Labs', 'Gratuito'],
    registrationUrl: 'https://gdg.community.dev/events/details/google-gdg-cloud-santiago-de-chile-presents-devfest-cloud-santiago-2026/',
  },
  {
    id: 'rise-ai-latam-2026', title: 'RISE AI Latin America Summit 2026', type: 'Cumbre / Conferencia',
    organizer: 'Universidad de los Andes y University of Notre Dame', dateStr: '20 - 21 de Octubre, 2026',
    fechaInicio: '2026-10-20', fechaFin: '2026-10-21',
    status: 'Próximo', regionId: 'metropolitana', locationName: 'ESE Business School, Universidad de los Andes, Las Condes', isVirtual: false,
    tags: ['IA', 'Empresas', 'Salud', 'Educación'],
    registrationUrl: 'https://www.riseaisummit.ai/',
  },
  {
    id: 'redhat-summit-connect-santiago-2026', title: 'Red Hat Summit: Connect 2026 Santiago', type: 'Cumbre / Conferencia',
    organizer: 'Red Hat', dateStr: '27 de Octubre, 2026',
    fechaInicio: '2026-10-27', fechaFin: '2026-10-27',
    status: 'Próximo', regionId: 'metropolitana', locationName: 'Hotel Mandarin Oriental, Las Condes', isVirtual: false,
    tags: ['IA', 'Open Source', 'Seguridad'],
    registrationUrl: 'https://www.redhat.com/en/summit/connect/latam/santiago-2026',
  },
  {
    id: 'devfest-santiago-2026', title: 'DevFest Santiago 2026', type: 'Meetup Comunitario',
    organizer: 'GDG Santiago de Chile', dateStr: '7 de Noviembre, 2026',
    fechaInicio: '2026-11-07', fechaFin: '2026-11-07',
    status: 'Próximo', regionId: 'metropolitana', locationName: 'Universidad Andrés Bello, Providencia', isVirtual: false,
    tags: ['Google', 'Gemini', 'IA', 'Talleres'],
    registrationUrl: 'https://gdg.community.dev/events/details/google-gdg-santiago-de-chile-presents-devfest-santiago-2026/',
  },
  {
    id: 'jcc-2026', title: 'Jornadas Chilenas de Computación 2026', type: 'Cumbre / Conferencia',
    organizer: 'Sociedad Chilena de Ciencia de la Computación y Universidad de Talca', dateStr: '10 - 12 de Noviembre, 2026',
    fechaInicio: '2026-11-10', fechaFin: '2026-11-12',
    status: 'Próximo', regionId: 'maule', locationName: 'Universidad de Talca, Talca', isVirtual: false,
    tags: ['Computación', 'IA', 'Academia', 'Workshops'],
    registrationUrl: 'https://jcc2026.utalca.cl/',
  },
  {
    id: 'nasa-space-apps-chile-2026', title: 'NASA Space Apps Challenge 2026', type: 'Hackathon',
    organizer: 'NASA · en Chile, Caja La Araucana', dateStr: '14 - 15 de Noviembre, 2026',
    fechaInicio: '2026-11-14', fechaFin: '2026-11-15',
    status: 'Próximo', regionId: 'metropolitana',
    locationName: 'Parque La Araucana, La Florida · también en Antofagasta, Valparaíso, Concepción, Temuco y Punta Arenas', isVirtual: false,
    tags: ['Datos abiertos', 'Espacio', 'Gratuito', 'Varias regiones'],
    registrationUrl: 'https://www.spaceappschallenge.org/2026/',
  },
  {
    id: 'pycon-chile-2026', title: 'PyCon Chile 2026', type: 'Cumbre / Conferencia',
    organizer: 'Comunidad Python Chile', dateStr: '14 - 15 de Noviembre, 2026',
    fechaInicio: '2026-11-14', fechaFin: '2026-11-15',
    status: 'Próximo', regionId: 'metropolitana', locationName: 'Universidad Mayor, Providencia (15 de noviembre en línea)', isVirtual: false,
    tags: ['Python', 'Datos', 'IA', 'Gratuito'],
    registrationUrl: 'https://www.pycon.cl/',
  },
  {
    id: 'chile-tech-week-2026', title: 'Chile Tech Week 2026', type: 'Cumbre / Conferencia',
    organizer: 'EtM, ACVC, Platanus, Endeavor, Corfo, Start-Up Chile y otros', dateStr: '16 - 22 de Noviembre, 2026',
    fechaInicio: '2026-11-16', fechaFin: '2026-11-22',
    status: 'Próximo', regionId: 'metropolitana', locationName: 'Varias sedes en Santiago y regiones', isVirtual: false,
    tags: ['Ecosistema', 'Startups', 'IA'],
    registrationUrl: 'https://techweek.cl/events',
  },
  {
    id: 'congreso-cdo-latam-2026', title: 'Congreso CDO LATAM 2026', type: 'Cumbre / Conferencia',
    organizer: 'DCC FCFM Universidad de Chile y CENIA', dateStr: '18 - 19 de Noviembre, 2026',
    fechaInicio: '2026-11-18', fechaFin: '2026-11-19',
    status: 'Próximo', regionId: 'metropolitana', locationName: 'FCFM Universidad de Chile, Beauchef 850, Santiago', isVirtual: false,
    tags: ['Datos', 'Gobernanza de IA', 'Gratuito'],
    registrationUrl: 'https://ingenieria.uchile.cl/noticias/244568/fcfm-sera-sede-del-congreso-cdo-latam-2026-sobre-datos-e-ia',
  },
  {
    id: 'etmday-2026', title: 'EtMday 2026', type: 'Cumbre / Conferencia',
    organizer: 'Emprende tu Mente', dateStr: '19 - 21 de Noviembre, 2026',
    fechaInicio: '2026-11-19', fechaFin: '2026-11-21',
    status: 'Próximo', regionId: 'metropolitana', locationName: 'Parque Bicentenario, Vitacura', isVirtual: false,
    tags: ['Emprendimiento', 'Innovación', 'Inversión'],
    registrationUrl: 'https://etmday.org/',
  },
  {
    id: 'platanus-hack-26-santiago', title: 'Platanus Hack 26: Santiago', type: 'Hackathon',
    organizer: 'Platanus', dateStr: '20 - 22 de Noviembre, 2026',
    fechaInicio: '2026-11-20', fechaFin: '2026-11-22',
    status: 'Próximo', regionId: 'metropolitana', locationName: 'Santiago (sede por anunciar)', isVirtual: false,
    tags: ['36 horas', 'Startups', 'Builders'],
    registrationUrl: 'https://hack.platan.us/',
  },
];
