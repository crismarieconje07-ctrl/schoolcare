
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { credential } from 'firebase-admin';

export function initializeAdminApp(): App {
  const appName = 'firebase-admin-app';
  // Check if the app is already initialized to prevent errors
  const existingApp = getApps().find(app => app?.name === appName);
  if (existingApp) {
      return existingApp;
  }

  // Use applicationDefault() which is the standard for Google Cloud environments
  // like App Hosting. It automatically finds the service account credentials.
  const newApp = initializeApp({
     credential: credential.applicationDefault(),
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  }, appName);

  return newApp;
}
