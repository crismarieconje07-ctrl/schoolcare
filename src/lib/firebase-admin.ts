
import { initializeApp, getApps, App, ServiceAccount, cert } from 'firebase-admin/app';

export function initializeAdminApp(): App {
  const appName = 'firebase-admin-app';
  const existingApp = getApps().find(app => app?.name === appName);
  if (existingApp) {
      return existingApp;
  }

  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
    }

    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

    const newApp = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    }, appName);

    return newApp;

  } catch (error: any) {
    console.error("Failed to initialize Firebase Admin SDK:", error.message);
    // Re-throwing the error is important so that server actions fail loudly
    // instead of proceeding with an uninitialized app.
    throw new Error(`Firebase Admin SDK initialization failed: ${error.message}`);
  }
}
