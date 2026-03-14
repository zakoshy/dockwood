'use client';

import { initializeApp, getApps, type FirebaseApp, getApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * Idempotently initializes Firebase services.
 * Ensures that app, auth, and firestore instances are only created once.
 */
export function initializeFirebase() {
  let app: FirebaseApp;
  
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  return { app, auth, db };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
