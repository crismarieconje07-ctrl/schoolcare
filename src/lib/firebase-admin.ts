
import { initializeApp, getApps, App, type ServiceAccount } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

let app: App;

export function initializeAdminApp() {
  if (process.env.NODE_ENV === 'development' && getApps().length) {
    return getApps()[0];
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
    : undefined;

  if (serviceAccount) {
    app = initializeApp({
      credential: credential.cert(serviceAccount),
    }, 'firebase-admin-app-' + Date.now());
  } else {
    app = initializeApp({
       credential: credential.applicationDefault(),
    }, 'firebase-admin-app-' + Date.now());
  }


  return app;
}
