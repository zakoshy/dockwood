'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { type FirebaseApp } from 'firebase/app';
import { type Auth } from 'firebase/auth';
import { type Firestore } from 'firebase/firestore';
import { initializeFirebase } from './index';

type FirebaseContextType = {
  app: FirebaseApp | null;
  auth: Auth | null;
  db: Firestore | null;
};

const FirebaseContext = createContext<FirebaseContextType>({
  app: null,
  auth: null,
  db: null,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  // Initialize Firebase once on the client side
  const services = useMemo(() => {
    if (typeof window === 'undefined') return { app: null, auth: null, db: null };
    return initializeFirebase();
  }, []);

  return (
    <FirebaseContext.Provider value={services}>
      {children}
    </FirebaseContext.Provider>
  );
}

export const useFirebase = () => useContext(FirebaseContext);
export const useAuth = () => useContext(FirebaseContext).auth;
export const useFirestore = () => useContext(FirebaseContext).db;
