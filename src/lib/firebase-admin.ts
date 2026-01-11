
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

let app: App;

export async function initializeAdminApp() {
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }
  
  app = initializeApp({
    credential: credential.applicationDefault(),
  });

  return app;
}
