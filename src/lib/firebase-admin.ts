
import { initializeApp, getApps, App, type ServiceAccount } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

let app: App;

export function initializeAdminApp() {
  const appName = 'firebase-admin-app';
  // Check if the app is already initialized to prevent errors
  const existingApp = getApps().find(app => app?.name === appName);
  if (existingApp) {
      return existingApp;
  }

  // Use applicationDefault() which is the standard for Google Cloud environments
  // like App Hosting. It automatically finds the service account credentials.
  app = initializeApp({
     credential: credential.applicationDefault(),
  }, appName);

  return app;
}
