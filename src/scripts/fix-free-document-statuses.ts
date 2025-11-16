/**
 * Fix Free Document Statuses
 * 
 * This script updates existing "Approved" documents with amount = 0
 * to "Payment Verified" status (auto-skip payment for free documents)
 * 
 * Run with: npx tsx src/scripts/fix-free-document-statuses.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { firebaseConfig } from '../firebase/config';

async function fixFreeDocumentStatuses() {
  console.log('🔧 Fixing free document statuses...\n');

  // Initialize Firebase
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const firestore = getFirestore(app);

  try {
    // Get all document requests with "Approved" status and amount = 0
    const requestsRef = collection(firestore, 'documentRequests');
    const approvedQuery = query(requestsRef, where('status', '==', 'Approved'), where('amount', '==', 0));
    const snapshot = await getDocs(approvedQuery);

    if (snapshot.empty) {
      console.log('✅ No free documents with "Approved" status found. All good!');
      return;
    }

    console.log(`📋 Found ${snapshot.size} free document(s) with "Approved" status\n`);

    let updated = 0;
    let failed = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const docRef = doc(firestore, 'documentRequests', docSnap.id);

      try {
        // Update to "Payment Verified" with free payment details
        await updateDoc(docRef, {
          status: 'Payment Verified',
          paymentDetails: {
            method: 'Free',
            transactionId: 'N/A - Free Document',
            paymentDate: new Date().toISOString(),
            screenshotUrl: null,
          }
        });

        console.log(`✅ Updated: ${data.trackingNumber} - ${data.documentType}`);
        console.log(`   Resident: ${data.residentName}`);
        console.log(`   Status: Approved → Payment Verified\n`);
        updated++;
      } catch (error) {
        console.error(`❌ Failed to update ${data.trackingNumber}:`, error);
        failed++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📝 Total: ${snapshot.size}\n`);

    if (updated > 0) {
      console.log('🎉 Free documents have been updated!');
      console.log('   Residents will now see these documents as "Payment Verified"');
      console.log('   Secretary can now mark them as "Ready for Pickup"\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run the script
fixFreeDocumentStatuses()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
