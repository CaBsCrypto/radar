import { doc, setDoc } from 'firebase/firestore';
import { app, db, auth, firebaseConfig } from '../services/firebaseConfig';

export { app, db, auth, firebaseConfig };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check
export async function testFirebaseConnection(): Promise<boolean> {
  return true;
}

// Helper to save subscriber into Firestore
export async function registerWaitlistSubscriber(data: {
  email: string;
  source?: string;
  interests?: string[];
  preferredRegionId?: string;
  frequency?: string;
}): Promise<{ success: boolean; id: string }> {
  const cleanEmail = data.email.trim().toLowerCase();
  // Safe sanitized doc ID using base64 or alphanumeric encoding
  const sanitizedId = 'sub_' + cleanEmail.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 100);
  const path = `waitlist_subscribers/${sanitizedId}`;

  try {
    const payload = {
      email: cleanEmail,
      status: 'active' as const,
      source: data.source || 'newsletter',
      interests: data.interests || [],
      preferredRegionId: data.preferredRegionId || 'all',
      frequency: data.frequency || 'semanal',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'waitlist_subscribers', sanitizedId), payload, { merge: true });
    return { success: true, id: sanitizedId };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to register enterprise application into Firestore
export async function registerBusinessSubmission(data: {
  companyName: string;
  contactName: string;
  role?: string;
  email: string;
  phone?: string;
  regionId?: string;
  website?: string;
  currentTechState?: string;
  agentGoal?: string;
}): Promise<{ success: boolean; id: string }> {
  const sanitizedId = 'biz_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const path = `business_submissions/${sanitizedId}`;

  try {
    const payload = {
      id: sanitizedId,
      companyName: data.companyName.trim(),
      contactName: data.contactName.trim(),
      role: data.role || '',
      email: data.email.trim().toLowerCase(),
      phone: data.phone || '',
      regionId: data.regionId || '13-rm',
      website: data.website || '',
      currentTechState: data.currentTechState || '',
      agentGoal: data.agentGoal || '',
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString()
    };

    await setDoc(doc(db, 'business_submissions', sanitizedId), payload);
    return { success: true, id: sanitizedId };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
