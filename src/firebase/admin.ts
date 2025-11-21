import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (server-side only)
// Only initialize if we have the required environment variables
function initializeAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  // Skip initialization during build time if env vars are missing
  if (!projectId || !clientEmail || !privateKey) {
    console.warn('⚠️ Firebase Admin SDK not initialized - missing environment variables');
    return null;
  }

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization error:', error);
    return null;
  }
}

// Initialize on import
const app = initializeAdmin();

// Export functions that check if admin is initialized
export function getAdminAuth() {
  if (!app) {
    throw new Error('Firebase Admin SDK is not initialized');
  }
  return admin.auth();
}

export function getAdminDb() {
  if (!app) {
    throw new Error('Firebase Admin SDK is not initialized');
  }
  return admin.firestore();
}

// Legacy exports for backward compatibility
export const adminAuth = app ? admin.auth() : null as any;
export const adminDb = app ? admin.firestore() : null as any;
export default admin;
