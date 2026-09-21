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
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { Organization, EcosystemEvent } from '../types';

export const ADMIN_EMAIL = 'cabscryptocontacto@gmail.com';

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

export function isUserAdmin(user: User | null): boolean {
  if (!user || !user.email) return false;
  return user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
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
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, WAITLIST_COLLECTION);
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
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, SUBMISSIONS_COLLECTION);
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

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Sanitize document IDs to fit strict Firestore rules: ^[a-zA-Z0-9_\-]+$
function sanitizeId(rawId: string): string {
  return rawId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 120);
}

/**
 * Persists an Organization into Firestore cloud database.
 */
export async function saveOrganizationToFirestore(org: Organization): Promise<void> {
  const cleanId = sanitizeId(org.id || `org-${Date.now()}`);
  const path = `${ORGS_COLLECTION}/${cleanId}`;

  try {
    const payload: Record<string, any> = {
      id: cleanId,
      name: org.name.trim(),
      type: org.type,
      regionId: org.regionId,
      city: org.city?.trim() || 'Chile',
      sector: org.sector,
      website: org.website?.trim() || '',
      tagline: org.tagline?.trim() || '',
      aiUseCase: org.aiUseCase?.trim() || 'Uso de inteligencia artificial en procesos productivos.',
      toolsUsed: Array.isArray(org.toolsUsed) ? org.toolsUsed : [],
      hiringStatus: Boolean(org.hiringStatus),
      openRoles: Array.isArray(org.openRoles) ? org.openRoles : [],
      foundedYear: Number(org.foundedYear) || new Date().getFullYear(),
      verified: Boolean(org.verified),
      createdAt: new Date().toISOString()
    };

    if (org.contactEmail?.trim()) {
      payload.contactEmail = org.contactEmail.trim();
    }
    if (org.fundingStage?.trim()) {
      payload.fundingStage = org.fundingStage.trim();
    }

    await setDoc(doc(db, ORGS_COLLECTION, cleanId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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

/**
 * Persists an EcosystemEvent into Firestore cloud database.
 */
export async function saveEventToFirestore(event: EcosystemEvent): Promise<void> {
  const cleanId = sanitizeId(event.id || `event-${Date.now()}`);
  const path = `${EVENTS_COLLECTION}/${cleanId}`;

  try {
    const payload: Record<string, any> = {
      id: cleanId,
      title: event.title.trim(),
      type: event.type,
      organizer: event.organizer.trim(),
      dateStr: event.dateStr.trim(),
      status: event.status,
      regionId: event.regionId,
      locationName: event.locationName.trim(),
      isVirtual: Boolean(event.isVirtual),
      participantsCount: Number(event.participantsCount) || 100,
      tags: Array.isArray(event.tags) ? event.tags : [],
      isRegistrationUrgent: Boolean(event.isRegistrationUrgent),
      daysUntilDeadline: Number(event.daysUntilDeadline) || 15,
      createdAt: new Date().toISOString()
    };

    if (event.prizePool?.trim()) {
      payload.prizePool = event.prizePool.trim();
    }
    if (event.registrationUrl?.trim()) {
      payload.registrationUrl = event.registrationUrl.trim();
    }
    if (event.registrationDeadline?.trim()) {
      payload.registrationDeadline = event.registrationDeadline.trim();
    }
    if (event.notificationText?.trim()) {
      payload.notificationText = event.notificationText.trim();
    }

    await setDoc(doc(db, EVENTS_COLLECTION, cleanId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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
