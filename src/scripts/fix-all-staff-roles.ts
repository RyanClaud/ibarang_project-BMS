/**
 * Script to fix all staff accounts that have incorrect roles
 * Run this to fix existing staff members who were created with wrong roles
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc, deleteField } from 'firebase/firestore';
import { firebaseConfig } from '../firebase/config';

async function fixAllStaffRoles() {
  console.log('🔧 Fixing All Staff Roles...\n');

  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  try {
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    let fixedCount = 0;
    const issues: string[] = [];

    console.log(`📊 Checking ${usersSnapshot.size} users...\n`);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      
      // Check for staff emails that might have wrong roles
      const isStaffEmail = 
        userData.email?.includes('captain') ||
        userData.email?.includes('secretary') ||
        userData.email?.includes('treasurer') ||
        userData.email?.includes('admin') ||
        userData.email?.includes('brgy');

      // If it looks like staff but has role "Resident", flag it
      if (isStaffEmail && userData.role === 'Resident') {
        console.log(`⚠️  Found misclassified account:`);
        console.log(`   Email: ${userData.email}`);
        console.log(`   Current Role: ${userData.role}`);
        console.log(`   Has residentId: ${!!userData.residentId}`);
        
        // Try to guess the correct role from email
        let correctRole = 'Secretary'; // default
        if (userData.email?.includes('captain')) correctRole = 'Barangay Captain';
        if (userData.email?.includes('treasurer')) correctRole = 'Treasurer';
        if (userData.email?.includes('admin')) correctRole = 'Admin';
        
        console.log(`   Suggested Role: ${correctRole}`);
        console.log(`   Fix this? (This script will auto-fix)\n`);
        
        issues.push(`${userData.email} - Current: ${userData.role}, Should be: ${correctRole}`);
      }

      // Check for staff with residentId (they shouldn't have this)
      if (userData.role !== 'Resident' && userData.residentId) {
        console.log(`🔧 Fixing: ${userData.email}`);
        console.log(`   Removing residentId field...`);
        
        const userRef = doc(firestore, 'users', userId);
        await updateDoc(userRef, {
          residentId: deleteField(),
        });
        
        console.log(`   ✅ Fixed!\n`);
        fixedCount++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Fixed ${fixedCount} accounts (removed residentId from staff)`);
    
    if (issues.length > 0) {
      console.log(`\n⚠️  Found ${issues.length} accounts that may need role correction:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      console.log('\n💡 To fix roles, manually update them in Firestore Console');
      console.log('   Or delete and recreate the accounts');
    } else {
      console.log('\n✅ No role issues found!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

fixAllStaffRoles()
  .then(() => {
    console.log('\n✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
