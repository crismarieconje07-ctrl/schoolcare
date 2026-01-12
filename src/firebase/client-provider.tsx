"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { firebaseConfig } from "./config";
import { FirebaseProvider, getSdks } from "./provider";
import { ReactNode } from "react";

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
