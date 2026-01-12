
import { initializeApp, getApps, App, type ServiceAccount } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

let app: App;

export function initializeAdminApp() {
  if (process.env.NODE_ENV === 'development' && getApps().length > 0) {
    // In dev, reuse the existing app instance to avoid re-initialization errors
    const existingApp = getApps().find(app => app?.name === 'firebase-admin-app');
    if (existingApp) {
        return existingApp;
    }
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
    : undefined;
  
  const appName = 'firebase-admin-app';
  const existingApp = getApps().find(app => app?.name === appName);
  if (existingApp) {
      return existingApp;
  }

  if (serviceAccount) {
    app = initializeApp({
      credential: credential.cert(serviceAccount),
    }, appName);
  } else {
    app = initializeApp({
       credential: credential.applicationDefault(),
    }, appName);
  }

  return app;
}
