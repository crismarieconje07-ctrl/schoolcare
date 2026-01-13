
import { getApps, initializeApp, App, ServiceAccount } from "firebase-admin/app";
import { credential } from 'firebase-admin';

export function initializeAdminApp(): App {
  const appName = 'firebase-admin-app-schoolcare';
  const existingApp = getApps().find(app => app.name === appName);
  if (existingApp) {
    return existingApp;
  }

  // This is the robust way to handle credentials passed as a JSON string
  // via an environment variable in App Hosting.
  try {
    const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!serviceAccountString) {
      throw new Error("The FIREBASE_SERVICE_ACCOUNT environment variable is not set. Please add it as a secret in your App Hosting backend configuration.");
    }
    
    const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

    const newApp = initializeApp({
      credential: credential.cert(serviceAccount),
    }, appName);
    
    return newApp;

  } catch (error: any) {
    console.error("Failed to initialize Firebase Admin SDK. Error:", error.message);
    if (error instanceof SyntaxError) {
      throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT. Make sure it's a valid JSON string.");
    }
    throw new Error(`Could not initialize Firebase Admin SDK: ${error.message}`);
  }
}
