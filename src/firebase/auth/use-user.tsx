'use client';

import { useState, useEffect } from 'react';
import { type User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    
    // Immediately check if there's a currentUser already
    if (auth.currentUser) {
      setUser(auth.currentUser);
      setLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth]);

  return { user, loading };
}
