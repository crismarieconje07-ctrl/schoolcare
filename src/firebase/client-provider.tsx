"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";
import { FirebaseProvider } from "./provider";
import { ReactNode } from "react";

function getSdks(firebaseApp: FirebaseApp) {
  return {
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp),
  };
}

// Initialize the Firebase app
const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get the SDKs
const { auth, firestore, storage } = getSdks(firebaseApp);

/**
 * Provides Firebase services to the client-side application.
 * This should be used at the root of the component tree.
 */
export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  return (
    <FirebaseProvider
      firebaseApp={firebaseApp}
      auth={auth}
      firestore={firestore}
      storage={storage}
    >
      {children}
    </FirebaseProvider>
  );
}
