
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

import { firebaseConfig } from './config';

interface FirebaseServerServices {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  storage: FirebaseStorage;
}

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): FirebaseServerServices {
  if (!getApps().length) {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }
  return getSdks(getApp());
}

function getSdks(firebaseApp: FirebaseApp): FirebaseServerServices {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp),
  };
}
