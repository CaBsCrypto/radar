import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType, conLimite } from '../lib/firebase';
import { Organization, EcosystemEvent, PropuestaPublica } from '../types';

export const SUPERADMIN_EMAIL = 'cabscryptocontacto@gmail.com';
export const ADMIN_EMAIL = SUPERADMIN_EMAIL;

export const TEAM_MEMBER_EMAILS: readonly string[] = [
  'martin.fuentes.r@usach.cl',
  'paolo.fardella@usach.cl',
  'sebastian.salles@usach.cl',
  'israel.aguilar@usach.cl',
  'crwom01@gmail.com',
  'alphadocere@gmail.com'
] as const;

export const ADMIN_WHITELIST: readonly string[] = [
  SUPERADMIN_EMAIL,
  ...TEAM_MEMBER_EMAILS
];

const ORGS_COLLECTION = 'organizations';
const EVENTS_COLLECTION = 'events';
const WAITLIST_COLLECTION = 'waitlist_subscribers';
const SUBMISSIONS_COLLECTION = 'business_submissions';

// Types for Admin Dashboard
export interface WaitlistSubscriberDoc {
  id: string;
  email: string;
  source?: string;
  status: 'active' | 'unsubscribed';
  interests?: string[];
  preferredRegionId?: string;
  frequency?: string;
  createdAt: string;
}

export interface BusinessSubmissionDoc {
  id: string;
  companyName: string;
  contactName: string;
  role?: string;
  email: string;
  phone?: string;
  regionId?: string;
  website?: string;
  currentTechState?: string;
  agentGoal?: string;
  status?: 'pending' | 'contacted' | 'verified';
  createdAt: string;
  date?: string;
}

// ==========================================
// Authentication Helpers
// ==========================================

export function subscribeAuthState(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
}

export type AdminRole = 'superadmin' | 'viewer' | null;

export function getUserRole(user: User | null): AdminRole {
  if (!user || !user.email) return null;
  const email = user.email.toLowerCase().trim();
  if (email === SUPERADMIN_EMAIL.toLowerCase()) {
    return 'superadmin';
  }
  if (TEAM_MEMBER_EMAILS.some(e => e.toLowerCase() === email)) {
    return 'viewer';
  }
  return null;
}

export function isUserAuthorizedForAdmin(user: User | null): boolean {
  return getUserRole(user) !== null;
}

export function isUserSuperAdmin(user: User | null): boolean {
  return getUserRole(user) === 'superadmin';
}

export function isUserAdmin(user: User | null): boolean {
  return isUserSuperAdmin(user);
}

// ==========================================
// Admin Data Fetching
// ==========================================

export async function fetchAllSubscribers(): Promise<WaitlistSubscriberDoc[]> {
  try {
    const q = query(collection(db, WAITLIST_COLLECTION));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<WaitlistSubscriberDoc, 'id'>)
    }));
    // Sort client-side by date descending
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, WAITLIST_COLLECTION);
    return [];
  }
}

export function subscribeWaitlistSubscribers(
  onUpdate: (subs: WaitlistSubscriberDoc[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, WAITLIST_COLLECTION),
    (snapshot) => {
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<WaitlistSubscriberDoc, 'id'>)
      }));
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(list);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, WAITLIST_COLLECTION);
      }
    }
  );
}

export async function fetchAllBusinessSubmissions(): Promise<BusinessSubmissionDoc[]> {
  try {
    const snapshot = await getDocs(collection(db, SUBMISSIONS_COLLECTION));
    const list = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<BusinessSubmissionDoc, 'id'>)
    }));
    return list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, SUBMISSIONS_COLLECTION);
    return [];
  }
}

export function subscribeBusinessSubmissions(
  onUpdate: (subs: BusinessSubmissionDoc[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, SUBMISSIONS_COLLECTION),
    (snapshot) => {
      const list = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<BusinessSubmissionDoc, 'id'>)
      }));
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      onUpdate(list);
    },
    (error) => {
      if (onError) {
        onError(error);
      } else {
        handleFirestoreError(error, OperationType.LIST, SUBMISSIONS_COLLECTION);
      }
    }
  );
}

export async function updateBusinessSubmissionStatus(
  id: string, 
  status: 'pending' | 'contacted' | 'verified'
): Promise<void> {
  const path = `${SUBMISSIONS_COLLECTION}/${id}`;
  try {
    await updateDoc(doc(db, SUBMISSIONS_COLLECTION, id), { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteBusinessSubmission(id: string): Promise<void> {
  const path = `${SUBMISSIONS_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, SUBMISSIONS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function deleteSubscriber(id: string): Promise<void> {
  const path = `${WAITLIST_COLLECTION}/${id}`;
  try {
    await deleteDoc(doc(db, WAITLIST_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==========================================
// CSV Export Utility
// ==========================================

export function exportToCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => 
      headers.map(header => {
        let val = row[header];
        if (val === undefined || val === null) val = '';
        if (Array.isArray(val)) val = val.join(';');
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      }).join(',')
    )
  ].join('\r\n');

  const blob = new Blob(['\uFEFF', csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Sanitize document IDs to fit strict Firestore rules: ^[a-zA-Z0-9_\-]+$
function sanitizeId(rawId: string): string {
  return rawId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 120);
}

/** Documento de organización listo para Firestore (solo campos que aceptan las reglas). */
export function payloadOrganizacion(org: Organization): Record<string, unknown> {
  const cleanId = sanitizeId(org.id || `org-${Date.now()}`);
  const payload: Record<string, unknown> = {
    id: cleanId,
    name: org.name.trim(),
    type: org.type,
    regionId: org.regionId,
    city: org.city?.trim() || '',
    sector: org.sector,
    website: org.website?.trim() || '',
    tagline: org.tagline?.trim() || '',
    aiUseCase: org.aiUseCase?.trim() || '',
    toolsUsed: Array.isArray(org.toolsUsed) ? org.toolsUsed.slice(0, 30) : [],
    hiringStatus: Boolean(org.hiringStatus),
    openRoles: Array.isArray(org.openRoles) ? org.openRoles.slice(0, 30) : [],
    foundedYear: Math.round(Number(org.foundedYear)) || new Date().getFullYear(),
    verified: Boolean(org.verified),
    createdAt: org.createdAt || new Date().toISOString(),
  };
  if (org.contactEmail?.trim()) payload.contactEmail = org.contactEmail.trim();
  if (org.fundingStage?.trim()) payload.fundingStage = org.fundingStage.trim();
  return payload;
}

/** Guarda (crea o reemplaza) una organización. Solo la cuenta administradora puede hacerlo. */
export async function saveOrganizationToFirestore(org: Organization): Promise<void> {
  const payload = payloadOrganizacion(org);
  const id = String(payload.id);
  try {
    await setDoc(doc(db, ORGS_COLLECTION, id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORGS_COLLECTION}/${id}`);
  }
}

export async function eliminarOrganizacion(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ORGS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORGS_COLLECTION}/${id}`);
  }
}

/**
 * Fetches all Organizations currently stored in Firestore.
 */
export async function fetchOrganizationsFromFirestore(): Promise<Organization[]> {
  try {
    const snapshot = await getDocs(collection(db, ORGS_COLLECTION));
    return snapshot.docs.map(docSnap => docSnap.data() as Organization);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ORGS_COLLECTION);
    return [];
  }
}

/**
 * Subscribes to real-time updates for Organizations in Firestore.
 */
export function subscribeOrganizations(
  onUpdate: (orgs: Organization[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, ORGS_COLLECTION),
    (snapshot) => {
      const orgs = snapshot.docs.map(docSnap => docSnap.data() as Organization);
      onUpdate(orgs);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, ORGS_COLLECTION);
    }
  );
}

/** Documento de evento listo para Firestore (solo campos que aceptan las reglas, sin valores inventados). */
export function payloadEvento(event: EcosystemEvent): Record<string, unknown> {
  const cleanId = sanitizeId(event.id || `event-${Date.now()}`);
  const payload: Record<string, unknown> = {
    id: cleanId,
    title: event.title.trim(),
    type: event.type,
    organizer: event.organizer.trim(),
    dateStr: event.dateStr.trim(),
    status: event.status,
    regionId: event.regionId,
    locationName: event.locationName.trim(),
    isVirtual: Boolean(event.isVirtual),
    tags: Array.isArray(event.tags) ? event.tags.slice(0, 20) : [],
    createdAt: event.createdAt || new Date().toISOString(),
  };
  const texto: (keyof EcosystemEvent)[] = ['prizePool', 'registrationUrl', 'registrationDeadline', 'fechaInicio', 'fechaFin', 'fechaCierre'];
  texto.forEach(k => {
    const v = event[k];
    if (typeof v === 'string' && v.trim()) payload[k] = v.trim();
  });
  if (event.oculto) payload.oculto = true;
  return payload;
}

/** Guarda (crea o reemplaza) un evento. Solo la cuenta administradora puede hacerlo. */
export async function saveEventToFirestore(event: EcosystemEvent): Promise<void> {
  const payload = payloadEvento(event);
  const id = String(payload.id);
  try {
    await setDoc(doc(db, EVENTS_COLLECTION, id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${EVENTS_COLLECTION}/${id}`);
  }
}

export async function eliminarEvento(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, EVENTS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${EVENTS_COLLECTION}/${id}`);
  }
}

// ==========================================
// Propuestas del público (pendientes de aprobación)
// ==========================================

const PROPUESTAS_COLLECTION = 'propuestas_publicas';

/** El público propone un evento u organización. No se publica hasta que un administrador la aprueba. */
export async function enviarPropuestaPublica(
  propuesta: { tipo: 'evento'; datos: EcosystemEvent } | { tipo: 'organizacion'; datos: Organization }
): Promise<void> {
  const id = `prop_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const datos = propuesta.tipo === 'evento' ? payloadEvento(propuesta.datos) : payloadOrganizacion(propuesta.datos);
  try {
    await conLimite(setDoc(doc(db, PROPUESTAS_COLLECTION, id), { id, tipo: propuesta.tipo, datos, createdAt: new Date().toISOString() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${PROPUESTAS_COLLECTION}/${id}`);
  }
}

export function subscribePropuestas(
  onUpdate: (propuestas: PropuestaPublica[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, PROPUESTAS_COLLECTION),
    (snapshot) => onUpdate(snapshot.docs.map(d => d.data() as PropuestaPublica).sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
    (error) => { if (onError) onError(error); }
  );
}

/** Publica la propuesta en su colección y la retira de la lista de pendientes. */
export async function aprobarPropuesta(p: PropuestaPublica): Promise<void> {
  if (p.tipo === 'evento') await saveEventToFirestore(p.datos);
  else await saveOrganizationToFirestore(p.datos);
  await rechazarPropuesta(p.id);
}

export async function rechazarPropuesta(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, PROPUESTAS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${PROPUESTAS_COLLECTION}/${id}`);
  }
}

/**
 * Fetches all EcosystemEvents currently stored in Firestore.
 */
export async function fetchEventsFromFirestore(): Promise<EcosystemEvent[]> {
  try {
    const snapshot = await getDocs(collection(db, EVENTS_COLLECTION));
    return snapshot.docs.map(docSnap => docSnap.data() as EcosystemEvent);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, EVENTS_COLLECTION);
    return [];
  }
}

/**
 * Subscribes to real-time updates for Events in Firestore.
 */
export function subscribeEvents(
  onUpdate: (events: EcosystemEvent[]) => void,
  onError?: (err: unknown) => void
): () => void {
  return onSnapshot(
    collection(db, EVENTS_COLLECTION),
    (snapshot) => {
      const events = snapshot.docs.map(docSnap => docSnap.data() as EcosystemEvent);
      onUpdate(events);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, EVENTS_COLLECTION);
    }
  );
}
