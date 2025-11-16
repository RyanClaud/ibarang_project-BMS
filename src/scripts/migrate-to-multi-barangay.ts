/**
 * Migration script to add barangayId to existing data
 * 
 * This script should be run once to migrate existing single-barangay data
 * to the new multi-barangay structure.
 * 
 * Usage: Run this from a Node.js environment with Firebase Admin SDK
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { DEFAULT_BARANGAY_ID, createDefaultBarangay } from '../lib/barangay-utils';

/**
 * IMPORTANT: Before running this script:
 * 1. Set up Firebase Admin SDK credentials
 * 2. Backup your Firestore database
 * 3. Test on a development/staging environment first
 */

async function migrateToMultiBarangay() {
  console.log('Starting migration to multi-barangay structure...');
  
  // Initialize Firebase Admin (you'll need to provide your service account)
  // const serviceAccount = require('./path-to-your-service-account.json');
  // initializeApp({
  //   credential: cert(serviceAccount)
  // });
  
  const db = getFirestore();
  const batch = db.batch();
  let batchCount = 0;
  const BATCH_LIMIT = 500;

  try {
    // Step 1: Create default barangay document
    console.log('Step 1: Creating default barangay...');
    const defaultBarangay = createDefaultBarangay();
    const barangayRef = db.collection('barangays').doc(DEFAULT_BARANGAY_ID);
    batch.set(barangayRef, defaultBarangay);
    batchCount++;

    // Step 2: Migrate users collection
    console.log('Step 2: Migrating users...');
    const usersSnapshot = await db.collection('users').get();
    for (const doc of usersSnapshot.docs) {
      if (!doc.data().barangayId) {
        batch.update(doc.ref, { 
          barangayId: DEFAULT_BARANGAY_ID,
          isSuperAdmin: doc.data().role === 'Admin' ? true : false
        });
        batchCount++;
        
        if (batchCount >= BATCH_LIMIT) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} operations`);
          batchCount = 0;
        }
      }
    }
    console.log(`Migrated ${usersSnapshot.size} users`);

    // Step 3: Migrate residents collection
    console.log('Step 3: Migrating residents...');
    const residentsSnapshot = await db.collection('residents').get();
    for (const doc of residentsSnapshot.docs) {
      if (!doc.data().barangayId) {
        batch.update(doc.ref, { barangayId: DEFAULT_BARANGAY_ID });
        batchCount++;
        
        if (batchCount >= BATCH_LIMIT) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} operations`);
          batchCount = 0;
        }
      }
    }
    console.log(`Migrated ${residentsSnapshot.size} residents`);

    // Step 4: Migrate documentRequests collection
    console.log('Step 4: Migrating document requests...');
    const requestsSnapshot = await db.collection('documentRequests').get();
    for (const doc of requestsSnapshot.docs) {
      if (!doc.data().barangayId) {
        batch.update(doc.ref, { barangayId: DEFAULT_BARANGAY_ID });
        batchCount++;
        
        if (batchCount >= BATCH_LIMIT) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} operations`);
          batchCount = 0;
        }
      }
    }
    console.log(`Migrated ${requestsSnapshot.size} document requests`);

    // Step 5: Migrate payments collection (if exists)
    console.log('Step 5: Migrating payments...');
    const paymentsSnapshot = await db.collection('payments').get();
    for (const doc of paymentsSnapshot.docs) {
      if (!doc.data().barangayId) {
        batch.update(doc.ref, { barangayId: DEFAULT_BARANGAY_ID });
        batchCount++;
        
        if (batchCount >= BATCH_LIMIT) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} operations`);
          batchCount = 0;
        }
      }
    }
    console.log(`Migrated ${paymentsSnapshot.size} payments`);

    // Step 6: Migrate officials collection (if exists)
    console.log('Step 6: Migrating officials...');
    const officialsSnapshot = await db.collection('officials').get();
    for (const doc of officialsSnapshot.docs) {
      if (!doc.data().barangayId) {
        batch.update(doc.ref, { barangayId: DEFAULT_BARANGAY_ID });
        batchCount++;
        
        if (batchCount >= BATCH_LIMIT) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} operations`);
          batchCount = 0;
        }
      }
    }
    console.log(`Migrated ${officialsSnapshot.size} officials`);

    // Commit any remaining operations
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} operations`);
    }

    console.log('✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update Firestore security rules');
    console.log('2. Deploy the updated application code');
    console.log('3. Test all functionality thoroughly');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Uncomment to run the migration
// migrateToMultiBarangay()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

export { migrateToMultiBarangay };
