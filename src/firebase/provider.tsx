
'use client';

import React, { DependencyList, createContext, useContext, ReactNode, useMemo, useState, useEffect } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { Auth, User, onAuthStateChanged, signOut } from 'firebase/auth';
import { FirebaseStorage } from 'firebase/storage';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener'
import type { UserProfile, UserRole } from '@/lib/types';

// Combined state for the Firebase context
export interface FirebaseContextState {
  firebaseApp: FirebaseApp | null;
  firestore: Firestore | null;
  auth: Auth | null; 
  storage: FirebaseStorage | null;
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

interface FirebaseProviderProps {
    children: ReactNode;
    firebaseApp: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
}

/**
 * Ensures a user profile exists in Firestore. If not, it creates one.
 * This function is crucial for fixing accounts that were partially created.
 */
async function ensureUserProfile(firestore: Firestore, user: User): Promise<UserProfile | null> {
  // This function should not be called for anonymous users, but we check again for safety.
  if (user.isAnonymous) {
    return null;
  }
  
  const userDocRef = doc(firestore, "users", user.uid);
  try {
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // Profile exists, return it.
      return userDoc.data() as UserProfile;
    } else {
      // Profile doesn't exist, so create it.
      const role: UserRole = user.email === "admin@schoolcare.com" ? "admin" : "student";
      
      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || "User",
        role: role,
      };

      await setDoc(userDocRef, newUserProfile);
      return newUserProfile;
    }
  } catch (error) {
      console.error("Error ensuring user profile exists:", error);
      // If we fail here, we can't proceed with a profile.
      throw new Error("Could not create or retrieve user profile.");
  }
}

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
  storage,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Effect to subscribe to Firebase auth state changes and manage session cookie
  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // ** CRITICAL FIX: If the user is anonymous, reject and sign out immediately. **
        if (firebaseUser?.isAnonymous) {
          await signOut(auth); // Actively sign out the anonymous user
          setUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }

        if (firebaseUser) {
          // User is logged in and is NOT anonymous
          const profile = await ensureUserProfile(firestore, firebaseUser);

          setUser(firebaseUser);
          setUserProfile(profile);

          if (profile) {
            // Set session cookie only for valid, non-anonymous users with profiles
            try {
              const idToken = await firebaseUser.getIdToken(true);
              await fetch('/api/auth/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
              });
            } catch (sessionError) {
              console.error("Failed to set session cookie:", sessionError);
              // Don't block login if session cookie fails, but log it.
            }
          }
        } else {
          // User is logged out
          setUser(null);
          setUserProfile(null);
          // Clear session cookie
           await fetch('/api/auth/session', { method: 'DELETE' });
        }
      } catch (e) {
          console.error("FirebaseProvider: Error during auth state change", e);
          setError(e as Error);
          setUser(null);
          setUserProfile(null);
      } finally {
        setLoading(false);
      }
    }, (authError) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", authError);
        setError(authError);
        setUser(null);
        setUserProfile(null);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]); 

  const contextValue = useMemo((): FirebaseContextState => ({
      firebaseApp,
      firestore,
      auth,
      storage,
      user,
      userProfile,
      loading,
      error,
  }), [firebaseApp, firestore, auth, storage, user, userProfile, loading, error]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextState => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }
  return context;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore | null => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp | null => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 */
export const useUser = (): { user: User | null, loading: boolean, error: Error | null } => {
  const { user, loading, error } = useFirebase();
  return { user, loading, error };
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}
