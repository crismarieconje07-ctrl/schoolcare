import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { credential } from 'firebase-admin';

export function initializeAdminApp(): App {
  const appName = 'firebase-admin-app-schoolcare';
  const existingApp = getApps().find(app => app.name === appName);
  if (existingApp) {
    return existingApp;
  }

  // Use applicationDefault() which is the standard for Google Cloud environments
  // like App Hosting. It automatically finds the service account credentials.
  try {
    const newApp = initializeApp({
      credential: credential.applicationDefault(),
    }, appName);
    return newApp;
  } catch (error: any) {
    console.error("Failed to initialize Firebase Admin SDK with applicationDefault:", error.message);
    throw new Error("Could not initialize Firebase Admin SDK. Ensure you are in a valid Google Cloud environment or have GOOGLE_APPLICATION_CREDENTIALS set.");
  }
}
