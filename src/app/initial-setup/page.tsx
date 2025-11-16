'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';

// Import Firebase directly (not through context to avoid auth issues)
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function InitialSetupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [error, setError] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  // Form inputs
  const [email, setEmail] = useState('admin@dict.gov.ph');
  const [password, setPassword] = useState('Admin@123456');
  const [barangayName, setBarangayName] = useState('Barangay Mina De Oro');
  const [municipality, setMunicipality] = useState('Bongabong');
  const [province, setProvince] = useState('Oriental Mindoro');

  const handleSetup = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Initialize Firebase (if not already initialized)
      const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
      const firestore = getFirestore(app);
      const auth = getAuth(app);

      console.log('🚀 Starting setup...');

      // Step 1: Create Default Barangay
      console.log('📍 Creating default barangay...');
      const barangayRef = doc(firestore, 'barangays', 'default');
      await setDoc(barangayRef, {
        id: 'default',
        name: barangayName,
        address: `${municipality}, ${province}`,
        municipality: municipality,
        province: province,
        isActive: true,
        createdAt: new Date().toISOString(),
      });
      console.log('✅ Barangay created!');

      // Step 2: Create Super Admin Auth User
      console.log('👤 Creating super admin authentication...');
      let userId;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userId = userCredential.user.uid;
        console.log('✅ Auth user created!');
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          throw new Error('This email is already registered. Please use the login page or choose a different email.');
        }
        throw authError;
      }

      // Step 3: Create Super Admin Firestore Document
      console.log('📝 Creating super admin user document...');
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
      console.log('✅ User document created!');

      // Success!
      setCredentials({ email, password });
      setSetupComplete(true);
      console.log('🎉 Setup complete!');

    } catch (err: any) {
      console.error('❌ Setup error:', err);
      setError(err.message || 'Setup failed. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-700 to-orange-600">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Card className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
                <div className="relative bg-green-500/20 p-4 rounded-full">
                  <CheckCircle className="h-16 w-16 text-green-400" />
                </div>
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Setup Complete! 🎉</CardTitle>
            <CardDescription className="text-white/70">
              Your iBarangay system is ready to use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/10 p-4 rounded-lg space-y-3 border border-white/20">
              <h3 className="font-semibold text-white text-center">Your Super Admin Credentials</h3>
              <div className="space-y-2">
                <div className="bg-white/5 p-3 rounded">
                  <p className="text-xs text-white/60 mb-1">Email</p>
                  <p className="text-white font-mono text-sm">{credentials.email}</p>
                </div>
                <div className="bg-white/5 p-3 rounded">
                  <p className="text-xs text-white/60 mb-1">Password</p>
                  <p className="text-white font-mono text-sm">{credentials.password}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-500/20 border border-orange-500/50 p-4 rounded-lg">
              <p className="text-sm text-orange-200 text-center">
                ⚠️ <strong>Important:</strong> Change this password after your first login!
              </p>
            </div>

            <Button 
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login Page
            </Button>

            <p className="text-center text-white/60 text-xs">
              You should see the "Barangays" menu after logging in
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-700 to-orange-600">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <Card className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative bg-white/95 backdrop-blur-xl p-6 rounded-full border-4 border-white/50 shadow-2xl">
              <Image 
                src="/icon.png" 
                alt="iBarangay Logo" 
                width={80} 
                height={80} 
                className="object-contain drop-shadow-lg"
              />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl text-white">Initial System Setup</CardTitle>
            <CardDescription className="text-white/70">
              Set up your iBarangay system in one click
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/90 font-medium">Super Admin Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/40 h-11"
              disabled={isLoading}
              placeholder="admin@dict.gov.ph"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/90 font-medium">Super Admin Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/40 h-11"
              disabled={isLoading}
              placeholder="Minimum 6 characters"
            />
            <p className="text-xs text-white/60">You can change this later</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barangay" className="text-white/90 font-medium">Barangay Name</Label>
            <Input
              id="barangay"
              value={barangayName}
              onChange={(e) => setBarangayName(e.target.value)}
              className="bg-white/10 border-white/30 text-white placeholder:text-white/40 h-11"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="municipality" className="text-white/90 font-medium">Municipality</Label>
              <Input
                id="municipality"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/40 h-11"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province" className="text-white/90 font-medium">Province</Label>
              <Input
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="bg-white/10 border-white/30 text-white placeholder:text-white/40 h-11"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <Button
            onClick={handleSetup}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold h-12 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up your system...
              </>
            ) : (
              'Start Setup'
            )}
          </Button>

          <div className="bg-blue-500/20 border border-blue-500/50 p-3 rounded-lg">
            <p className="text-xs text-blue-200 text-center">
              ℹ️ This creates a default barangay and super admin account. Run this only once!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
