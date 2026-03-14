'use client';

import { useState, useEffect } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(auth?.currentUser || null);
  const [loading, setLoading] = useState(!auth || auth.currentUser === undefined);

  useEffect(() => {
    if (!auth) return;

    // Set initial user if already available
    setUser(auth.currentUser);
    setLoading(false);

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error("Auth state change error:", error);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
