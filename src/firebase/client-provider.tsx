'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';
import { FirebaseProvider } from './provider';

// This function can be simplified as we initialize once
function getSdks(app: FirebaseApp) {
  return {
    auth: getAuth(app),
    firestore: getFirestore(app),
    storage: getStorage(app),
  };
}

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [sdks, setSdks] = useState<{
    app: FirebaseApp;
    auth: Auth;
    firestore: Firestore;
    storage: FirebaseStorage;
  } | null>(null);

  useEffect(() => {
    // This effect runs once on the client to initialize Firebase
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const { auth, firestore, storage } = getSdks(app);
    setSdks({ app, auth, firestore, storage });
  }, []); // Empty dependency array ensures this runs only once

  // Render nothing until Firebase is initialized on the client
  if (!sdks) {
    return null;
  }

  return (
    <FirebaseProvider
      firebaseApp={sdks.app}
      auth={sdks.auth}
      firestore={sdks.firestore}
      storage={sdks.storage}
    >
      {children}
    </FirebaseProvider>
  );
}
