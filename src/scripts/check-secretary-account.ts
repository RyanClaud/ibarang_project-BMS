/**
 * Diagnostic Script: Check Secretary Account
 * 
 * This script checks if the secretary account has proper permissions
 * 
 * Run with: npx tsx src/scripts/check-secretary-account.ts
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { firebaseConfig } from '../firebase/config';

async function checkSecretaryAccount() {
  console.log('🔍 Checking secretary account...\n');

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const firestore = getFirestore(app);

  try {
    // Find secretary user by email
    const usersQuery = query(
      collection(firestore, 'users'),
      where('email', '==', 'secretary@ibarangayminadeoro.com')
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    
    if (usersSnapshot.empty) {
      console.log('❌ Secretary user not found in Firestore!');
      console.log('   The user document may not have been created properly.');
      console.log('\n💡 Solution: Re-create the secretary account from the admin panel.');
      return;
    }

    const secretaryDoc = usersSnapshot.docs[0];
    const secretaryData = secretaryDoc.data();
    
    console.log('✅ Secretary user found!');
    console.log('\n📋 User Document:');
    console.log('   Document ID:', secretaryDoc.id);
    console.log('   Name:', secretaryData.name || '❌ MISSING');
    console.log('   Email:', secretaryData.email || '❌ MISSING');
    console.log('   Role:', secretaryData.role || '❌ MISSING');
    console.log('   Barangay ID:', secretaryData.barangayId || '❌ MISSING');
    console.log('   Is Super Admin:', secretaryData.isSuperAdmin || false);
    
    // Check for issues
    const issues = [];
    
    if (!secretaryData.role) {
      issues.push('❌ Missing "role" field');
    } else if (secretaryData.role === 'Resident') {
      issues.push('❌ Role is "Resident" (should be "Secretary")');
    }
    
    if (!secretaryData.barangayId) {
      issues.push('❌ Missing "barangayId" field');
    }
    
    if (!secretaryData.name) {
      issues.push('⚠️  Missing "name" field');
    }
    
    if (issues.length > 0) {
      console.log('\n🚨 Issues Found:');
      issues.forEach(issue => console.log('   ' + issue));
      
      console.log('\n🔧 How to Fix:');
      console.log('   1. Go to Firebase Console');
      console.log('   2. Navigate to Firestore Database');
      console.log('   3. Open users collection');
      console.log(`   4. Find document: ${secretaryDoc.id}`);
      console.log('   5. Update the following fields:');
      if (!secretaryData.role || secretaryData.role === 'Resident') {
        console.log('      - role: "Secretary"');
      }
      if (!secretaryData.barangayId) {
        console.log('      - barangayId: [copy from admin user]');
      }
      if (!secretaryData.name) {
        console.log('      - name: "Secretary Name"');
      }
      console.log('   6. Save changes');
      console.log('   7. Log out and log back in');
    } else {
      console.log('\n✅ All required fields are present!');
      
      // Check if barangay exists
      if (secretaryData.barangayId) {
        const barangayDoc = await getDoc(doc(firestore, 'barangays', secretaryData.barangayId));
        if (barangayDoc.exists()) {
          console.log('\n✅ Barangay exists:', barangayDoc.data().name);
        } else {
          console.log('\n❌ Barangay document not found!');
          console.log('   Barangay ID:', secretaryData.barangayId);
        }
      }
      
      console.log('\n🔍 Testing permissions...');
      console.log('   The secretary should be able to:');
      console.log('   ✅ Read users collection (has role)');
      console.log('   ✅ List residents (isStaff() = true)');
      console.log('   ✅ View document requests');
      
      console.log('\n💡 If still getting permission errors:');
      console.log('   1. Clear browser cache (Ctrl+Shift+Delete)');
      console.log('   2. Hard refresh (Ctrl+F5)');
      console.log('   3. Log out and log back in');
      console.log('   4. Check browser console for detailed errors');
    }
    
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
  }
}

checkSecretaryAccount()
  .then(() => {
    console.log('\n✅ Check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Check failed:', error);
    process.exit(1);
  });
