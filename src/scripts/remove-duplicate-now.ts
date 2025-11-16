/**
 * Quick Fix: Remove Duplicate Users
 * This will remove duplicate user entries while keeping the correct ones
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function removeDuplicates() {
  console.log('🔧 Starting duplicate removal...\n');

  try {
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);

    // Load all users
    const usersSnap = await getDocs(collection(firestore, 'users'));
    const users = usersSnap.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as any[];

    console.log(`📊 Total users in system: ${users.length}\n`);

    // Group by email
    const emailGroups = new Map<string, any[]>();
    
    users.forEach(user => {
      if (user.email) {
        if (!emailGroups.has(user.email)) {
          emailGroups.set(user.email, []);
        }
        emailGroups.get(user.email)!.push(user);
      }
    });

    let totalDuplicates = 0;
    let totalRemoved = 0;

    // Process each email group
    for (const [email, userList] of emailGroups.entries()) {
      if (userList.length > 1) {
        console.log(`\n📧 Email: ${email}`);
        console.log(`   Found ${userList.length} users`);
        totalDuplicates += userList.length - 1;

        // Find which one to keep
        let toKeep = null;
        const toDelete = [];

        for (const user of userList) {
          // Check if this user has a corresponding resident record
          const residentDoc = await getDoc(doc(firestore, 'residents', user.id));
          
          if (residentDoc.exists()) {
            // This is the real user with resident data
            toKeep = user;
            console.log(`   ✅ KEEP: ${user.id} - ${user.name} (has resident record)`);
          } else {
            // This is a duplicate without resident data
            toDelete.push(user);
            console.log(`   ❌ DELETE: ${user.id} - ${user.name} (no resident record)`);
          }
        }

        // If no user has resident record, keep the first one
        if (!toKeep && userList.length > 0) {
          toKeep = userList[0];
          toDelete.push(...userList.slice(1));
          console.log(`   ⚠️  No resident records found, keeping first user: ${toKeep.id}`);
        }

        // Delete duplicates
        for (const user of toDelete) {
          try {
            await deleteDoc(doc(firestore, 'users', user.id));
            totalRemoved++;
            console.log(`   🗑️  Deleted: ${user.id}`);
          } catch (error) {
            console.error(`   ❌ Failed to delete ${user.id}:`, error);
          }
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ CLEANUP COMPLETE!');
    console.log('='.repeat(60));
    console.log(`📊 Duplicate users found: ${totalDuplicates}`);
    console.log(`🗑️  Users removed: ${totalRemoved}`);
    console.log(`✅ Users remaining: ${users.length - totalRemoved}`);
    console.log('\n💡 Tip: Refresh your browser to see the changes\n');

  } catch (error) {
    console.error('❌ Error:', error);
    console.error('\nMake sure:');
    console.error('1. Your .env.local file has all Firebase credentials');
    console.error('2. You have internet connection');
    console.error('3. Firebase project is accessible\n');
  }
}

// Run it
removeDuplicates();
