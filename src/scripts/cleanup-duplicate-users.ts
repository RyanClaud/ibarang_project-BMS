/**
 * Cleanup Script for Duplicate Users
 * Run this once to remove duplicate user entries
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

// Your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function cleanupDuplicateUsers() {
  console.log('🔍 Starting duplicate user cleanup...\n');

  try {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    // Load all users
    const usersSnap = await getDocs(collection(firestore, 'users'));
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    console.log(`📊 Total users found: ${users.length}\n`);

    // Find duplicates by email
    const emailMap = new Map<string, any[]>();
    users.forEach(user => {
      const email = (user as any).email;
      if (email) {
        if (!emailMap.has(email)) {
          emailMap.set(email, []);
        }
        emailMap.get(email)!.push(user);
      }
    });

    // Find and remove duplicates
    let duplicatesFound = 0;
    let duplicatesRemoved = 0;

    for (const [email, userList] of emailMap.entries()) {
      if (userList.length > 1) {
        duplicatesFound++;
        console.log(`\n⚠️  Found ${userList.length} users with email: ${email}`);
        
        // Sort by creation date or keep the first one
        userList.sort((a, b) => {
          // Keep the one that has more complete data or was created first
          const aHasResident = (a as any).residentId ? 1 : 0;
          const bHasResident = (b as any).residentId ? 1 : 0;
          return bHasResident - aHasResident;
        });

        // Keep the first one, delete the rest
        const toKeep = userList[0];
        const toDelete = userList.slice(1);

        console.log(`   ✅ Keeping: ${toKeep.id} (${(toKeep as any).name})`);
        
        for (const user of toDelete) {
          console.log(`   ❌ Deleting: ${user.id} (${(user as any).name})`);
          try {
            await deleteDoc(doc(firestore, 'users', user.id));
            duplicatesRemoved++;
          } catch (error) {
            console.error(`   ⚠️  Failed to delete ${user.id}:`, error);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✨ Cleanup Complete!');
    console.log('='.repeat(50));
    console.log(`📊 Duplicate emails found: ${duplicatesFound}`);
    console.log(`🗑️  Duplicate users removed: ${duplicatesRemoved}`);
    console.log(`✅ Remaining users: ${users.length - duplicatesRemoved}`);

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run the cleanup
cleanupDuplicateUsers();
