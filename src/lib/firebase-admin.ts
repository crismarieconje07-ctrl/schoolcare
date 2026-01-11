
import { initializeApp, getApps, App, type ServiceAccount } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

let app: App;

export async function initializeAdminApp() {
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }
  
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) : null;

  app = initializeApp({
    credential: serviceAccount ? credential.cert(serviceAccount) : credential.applicationDefault(),
  });

  return app;
}
