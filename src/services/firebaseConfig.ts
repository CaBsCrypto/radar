import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { initializeFirestore, getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App (reuse existing instance if already initialized)
export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with explicit databaseId from config
// Uses experimentalAutoDetectLongPolling for smooth connectivity inside preview/iframe environments
let firestoreInstance: Firestore;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId
  );
} catch {
  // If already initialized, retrieve existing instance for this databaseId
  firestoreInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId);
}

export const db: Firestore = firestoreInstance;

// Initialize Firebase Auth
export const auth: Auth = getAuth(app);

export { firebaseConfig };
export default app;
