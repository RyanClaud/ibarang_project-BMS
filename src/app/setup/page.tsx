'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SetupPage() {
  const { firestore, auth } = useFirebase();
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
    if (!firestore || !auth) {
      setError('Firebase not initialized. Please refresh the page.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Step 1: Create Default Barangay
      console.log('Creating default barangay...');
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

      // Step 2: Create Super Admin Auth User
      console.log('Creating super admin authentication...');
      let userId;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        userId = userCredential.user.uid;
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          throw new Error('This email is already registered. Please use a different email or login with existing credentials.');
        }
        throw authError;
      }

      // Step 3: Create Super Admin Firestore Document
      console.log('Creating super admin user document...');
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

      // Success!
      setCredentials({ email, password });
      setSetupComplete(true);
      console.log('Setup complete!');

    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || 'Setup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-700 to-orange-600">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-2xl border-white/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-green-500/20 p-4 rounded-full">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Setup Complete! 🎉</CardTitle>
            <CardDescription className="text-white/70">
              Your iBarangay system is ready to use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/10 p-4 rounded-lg space-y-2">
              <h3 className="font-semibold text-white">Your Super Admin Credentials:</h3>
              <div className="space-y-1 text-sm">
                <p className="text-white/90">
                  <span className="font-medium">Email:</span> {credentials.email}
                </p>
                <p className="text-white/90">
                  <span className="font-medium">Password:</span> {credentials.password}
                </p>
              </div>
            </div>

            <div className="bg-orange-500/20 p-4 rounded-lg">
              <p className="text-sm text-orange-200">
                ⚠️ <strong>Important:</strong> Please change this password after your first login!
              </p>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-900 via-blue-700 to-orange-600">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-2xl border-white/20">
        <CardHeader>
          <CardTitle className="text-2xl text-white">Quick Setup</CardTitle>
          <CardDescription className="text-white/70">
            Automatically set up your iBarangay system in one click
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/90">Super Admin Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/30 text-white"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/90">Super Admin Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/30 text-white"
              disabled={isLoading}
            />
            <p className="text-xs text-white/60">Minimum 6 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="barangay" className="text-white/90">Barangay Name</Label>
            <Input
              id="barangay"
              value={barangayName}
              onChange={(e) => setBarangayName(e.target.value)}
              className="bg-white/10 border-white/30 text-white"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="municipality" className="text-white/90">Municipality</Label>
              <Input
                id="municipality"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="bg-white/10 border-white/30 text-white"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province" className="text-white/90">Province</Label>
              <Input
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="bg-white/10 border-white/30 text-white"
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
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up...
              </>
            ) : (
              'Start Setup'
            )}
          </Button>

          <div className="bg-blue-500/20 p-3 rounded-lg">
            <p className="text-xs text-blue-200">
              ℹ️ This will create a default barangay and super admin account. You can add more barangays later.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
