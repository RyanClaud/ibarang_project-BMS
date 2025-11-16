/**
 * Quick Setup Script for Multi-Barangay System
 * Run this once to automatically set up everything you need
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Your Firebase config (copy from your .env or firebase config)
const firebaseConfig = {
  // You'll need to fill these in from your Firebase project settings
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function quickSetup() {
  console.log('🚀 Starting Quick Setup...\n');

  try {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const firestore = getFirestore(app);
    const auth = getAuth(app);

    // Step 1: Create Default Barangay
    console.log('📍 Step 1: Creating default barangay...');
    const barangayRef = doc(firestore, 'barangays', 'default');
    await setDoc(barangayRef, {
      id: 'default',
      name: 'Barangay Mina De Oro',
      address: 'Bongabong, Oriental Mindoro',
      municipality: 'Bongabong',
      province: 'Oriental Mindoro',
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    console.log('✅ Default barangay created!\n');

    // Step 2: Create Super Admin Auth User
    console.log('👤 Step 2: Creating super admin authentication...');
    const email = 'admin@dict.gov.ph';
    const password = 'Admin@123456'; // Change this to a secure password!
    
    let userId;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      userId = userCredential.user.uid;
      console.log('✅ Super admin auth user created!');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   User ID: ${userId}\n`);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('⚠️  Auth user already exists, using existing user...\n');
        // You'll need to get the existing user ID manually
        userId = 'EXISTING_USER_ID'; // Replace with actual ID if needed
      } else {
        throw error;
      }
    }

    // Step 3: Create Super Admin Firestore Document
    console.log('📝 Step 3: Creating super admin user document...');
    const userRef = doc(firestore, 'users', userId);
    await setDoc(userRef, {
      id: userId,
      name: 'DICT Super Admin',
      email: email,
      role: 'Admin',
      barangayId: 'default',
      isSuperAdmin: true,
      avatarUrl: `https://picsum.photos/seed/${userId}/100/100`,
    });
    console.log('✅ Super admin user document created!\n');

    // Success!
    console.log('🎉 Setup Complete!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 Your Super Admin Credentials:');
    console.log('═══════════════════════════════════════');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log('═══════════════════════════════════════\n');
    console.log('🔐 IMPORTANT: Change this password after first login!\n');
    console.log('✨ You can now login to your app with these credentials.');
    console.log('✨ You should see the "Barangays" menu item in the sidebar.\n');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error('\nPlease check:');
    console.error('1. Your Firebase configuration is correct');
    console.error('2. You have internet connection');
    console.error('3. Firebase project is properly set up');
  }
}

// Run the setup
quickSetup();
