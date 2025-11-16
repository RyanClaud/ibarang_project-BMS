/**
 * Quick setup script to create the default barangay
 * Run this in your browser console or as a one-time setup function
 */

import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { DEFAULT_BARANGAY_ID, createDefaultBarangay } from '../lib/barangay-utils';

/**
 * Creates the default barangay document in Firestore
 * This should be run once during initial setup
 */
export async function setupDefaultBarangay() {
  try {
    const firestore = getFirestore();
    const defaultBarangay = createDefaultBarangay();
    
    const barangayRef = doc(firestore, 'barangays', DEFAULT_BARANGAY_ID);
    await setDoc(barangayRef, defaultBarangay, { merge: true });
    
    console.log('✅ Default barangay created successfully!');
    console.log('Barangay ID:', DEFAULT_BARANGAY_ID);
    console.log('Barangay Name:', defaultBarangay.name);
    
    return defaultBarangay;
  } catch (error) {
    console.error('❌ Failed to create default barangay:', error);
    throw error;
  }
}

/**
 * Browser console helper
 * Copy and paste this into your browser console while logged into the app:
 * 
 * import { setupDefaultBarangay } from './src/scripts/setup-default-barangay';
 * setupDefaultBarangay();
 */

// For direct execution in Node.js environment
if (typeof window === 'undefined') {
  console.log('This script should be run in a browser environment with Firebase initialized.');
  console.log('Alternatively, use the migrate-to-multi-barangay.ts script with Firebase Admin SDK.');
}
