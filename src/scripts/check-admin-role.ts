/**
 * Script to check and fix admin roles
 * 
 * This will help diagnose why barangay admins can't create staff accounts
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from 'firebase/firestore';
import { firebaseConfig } from '../firebase/config';

async function checkAdminRoles() {
  console.log('🔍 Checking Admin Roles...\n');

  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const auth = getAuth(app);

  try {
    // Get all users
    const usersSnapshot = await getDocs(collection(firestore, 'users'));
    
    console.log(`📊 Found ${usersSnapshot.size} total users\n`);
    console.log('👥 User Roles:\n');

    const adminUsers: any[] = [];
    const barangayMap = new Map();

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Group by barangay
      if (!barangayMap.has(userData.barangayId)) {
        barangayMap.set(userData.barangayId, []);
      }
      barangayMap.get(userData.barangayId).push(userData);

      // Track admins
      if (userData.role === 'Admin' || userData.isSuperAdmin) {
        adminUsers.push(userData);
      }

      console.log(`   ${userData.name}`);
      console.log(`   ├─ Email: ${userData.email}`);
      console.log(`   ├─ Role: ${userData.role}`);
      console.log(`   ├─ Barangay ID: ${userData.barangayId}`);
      console.log(`   ├─ Super Admin: ${userData.isSuperAdmin || false}`);
      console.log(`   └─ Has residentId: ${!!userData.residentId}\n`);
    }

    console.log('\n📋 Summary by Barangay:\n');
    
    for (const [barangayId, users] of barangayMap.entries()) {
      console.log(`\n🏛️  Barangay: ${barangayId}`);
      console.log(`   Total users: ${users.length}`);
      
      const admins = users.filter((u: any) => u.role === 'Admin');
      const captains = users.filter((u: any) => u.role === 'Barangay Captain');
      const secretaries = users.filter((u: any) => u.role === 'Secretary');
      const treasurers = users.filter((u: any) => u.role === 'Treasurer');
      const residents = users.filter((u: any) => u.role === 'Resident');

      console.log(`   ├─ Admins: ${admins.length}`);
      console.log(`   ├─ Captains: ${captains.length}`);
      console.log(`   ├─ Secretaries: ${secretaries.length}`);
      console.log(`   ├─ Treasurers: ${treasurers.length}`);
      console.log(`   └─ Residents: ${residents.length}`);

      if (admins.length === 0 && captains.length === 0) {
        console.log(`   ⚠️  WARNING: No Admin or Captain found for this barangay!`);
      }
    }

    console.log('\n\n💡 Recommendations:\n');
    console.log('1. Each barangay should have at least ONE user with role "Admin"');
    console.log('2. Barangay Admins should have role = "Admin" (not "Barangay Captain")');
    console.log('3. Barangay Captains are staff members, not admins');
    console.log('4. Only users with role "Admin" or isSuperAdmin=true can create staff accounts');

    console.log('\n\n🔧 To fix a user\'s role:');
    console.log('1. Go to Firestore Console');
    console.log('2. Find the user in the "users" collection');
    console.log('3. Change their "role" field to "Admin"');
    console.log('4. Save and refresh the app');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Run the script
checkAdminRoles()
  .then(() => {
    console.log('\n✅ Check completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
