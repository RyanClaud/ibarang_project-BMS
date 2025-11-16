/**
 * Migration Script: Fix Resident Document IDs
 * 
 * Problem: Resident documents were created with auto-generated IDs instead of user UIDs
 * Solution: Copy resident data to new documents with user UID as document ID
 * 
 * Run with: npx tsx src/scripts/fix-resident-ids.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firebaseConfig } from '../firebase/config';

async function fixResidentIds() {
  console.log('🔧 Starting resident ID migration...\n');

  // Initialize Firebase
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const firestore = getFirestore(app);

  try {
    // Get all residents
    const residentsSnapshot = await getDocs(collection(firestore, 'residents'));
    console.log(`Found ${residentsSnapshot.docs.length} resident documents\n`);

    let fixed = 0;
    let skipped = 0;
    let errors = 0;

    for (const residentDoc of residentsSnapshot.docs) {
      const residentData = residentDoc.data();
      const currentDocId = residentDoc.id;
      const userId = residentData.userId;

      console.log(`Processing: ${residentData.firstName} ${residentData.lastName}`);
      console.log(`  Current Doc ID: ${currentDocId}`);
      console.log(`  User ID: ${userId}`);

      // Check if document ID matches user ID
      if (currentDocId === userId) {
        console.log(`  ✅ Already correct - skipping\n`);
        skipped++;
        continue;
      }

      try {
        // Create new document with user ID as document ID
        await setDoc(doc(firestore, 'residents', userId), {
          ...residentData,
          id: userId, // Ensure id field matches document ID
        });

        console.log(`  ✅ Created new document with ID: ${userId}`);

        // Delete old document
        await deleteDoc(doc(firestore, 'residents', currentDocId));
        console.log(`  🗑️  Deleted old document: ${currentDocId}\n`);

        fixed++;
      } catch (error: any) {
        console.error(`  ❌ Error: ${error.message}\n`);
        errors++;
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`  ✅ Fixed: ${fixed}`);
    console.log(`  ⏭️  Skipped (already correct): ${skipped}`);
    console.log(`  ❌ Errors: ${errors}`);
    console.log(`  📝 Total: ${residentsSnapshot.docs.length}`);

    if (fixed > 0) {
      console.log('\n✨ Migration completed successfully!');
      console.log('   Residents can now request documents.');
    } else if (skipped === residentsSnapshot.docs.length) {
      console.log('\n✨ All resident IDs are already correct!');
    }

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
fixResidentIds()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
