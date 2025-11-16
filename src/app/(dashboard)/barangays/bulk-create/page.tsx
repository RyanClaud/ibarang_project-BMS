'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useFirebase } from '@/firebase';
import { collection, writeBatch, doc, query, where, getDocs } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, CheckCircle, Building2, MapPin } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Import PSGC data
const phData = require('ph-geo-admin-divisions');

interface Municipality {
  name: string;
  code: string;
  provinceId: string;
}

interface Barangay {
  name: string;
  code: string;
  municipalityId: string;
}

export default function BulkCreateBarangaysPage() {
  const { firestore } = useFirebase();
  const router = useRouter();
  
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('');
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [selectedBarangays, setSelectedBarangays] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);
  const [existingBarangays, setExistingBarangays] = useState<Set<string>>(new Set());

  // Load Oriental Mindoro municipalities on mount
  useEffect(() => {
    loadMunicipalities();
  }, []);

  // Load barangays when municipality is selected
  useEffect(() => {
    if (selectedMunicipality) {
      loadBarangays(selectedMunicipality);
      checkExistingBarangays(selectedMunicipality);
    }
  }, [selectedMunicipality]);

  const loadMunicipalities = () => {
    try {
      const { provinces, municipalities: allMunicipalities } = phData;
      
      // Find Oriental Mindoro
      const orientalMindoro = provinces.find((p: any) => 
        p.name && p.name.toLowerCase().includes('oriental mindoro')
      );
      
      if (!orientalMindoro) {
        toast({
          title: 'Error',
          description: 'Oriental Mindoro province not found',
          variant: 'destructive',
        });
        return;
      }
      
      // Get municipalities in Oriental Mindoro
      const orientalMindoroMunicipalities = allMunicipalities
        .filter((m: any) => m.provinceId === orientalMindoro.provinceId)
        .map((m: any) => ({
          name: m.name,
          code: m.municipalityId,
          provinceId: m.provinceId,
        }))
        .sort((a: Municipality, b: Municipality) => a.name.localeCompare(b.name));
      
      setMunicipalities(orientalMindoroMunicipalities);
    } catch (error) {
      console.error('Error loading municipalities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load municipalities',
        variant: 'destructive',
      });
    }
  };

  const loadBarangays = (municipalityCode: string) => {
    try {
      const { baranggays: allBarangays } = phData;
      const municipality = municipalities.find(m => m.code === municipalityCode);
      
      if (!municipality) return;
      
      const municipalityBarangays = allBarangays
        .filter((b: any) => 
          b.municipalityId === municipalityCode &&
          b.provinceId === municipality.provinceId
        )
        .map((b: any) => ({
          name: b.name,
          code: b.psgcId || '',
          municipalityId: b.municipalityId,
        }))
        .sort((a: Barangay, b: Barangay) => a.name.localeCompare(b.name));
      
      setBarangays(municipalityBarangays);
      setSelectedBarangays(new Set());
    } catch (error) {
      console.error('Error loading barangays:', error);
      toast({
        title: 'Error',
        description: 'Failed to load barangays',
        variant: 'destructive',
      });
    }
  };

  const checkExistingBarangays = async (municipalityCode: string) => {
    if (!firestore) return;
    
    try {
      const municipality = municipalities.find(m => m.code === municipalityCode);
      if (!municipality) return;
      
      const q = query(
        collection(firestore, 'barangays'),
        where('municipality', '==', municipality.name)
      );
      
      const snapshot = await getDocs(q);
      const existing = new Set(snapshot.docs.map(doc => doc.data().name));
      setExistingBarangays(existing);
    } catch (error) {
      console.error('Error checking existing barangays:', error);
    }
  };

  const toggleBarangay = (barangayName: string) => {
    const newSelected = new Set(selectedBarangays);
    if (newSelected.has(barangayName)) {
      newSelected.delete(barangayName);
    } else {
      newSelected.add(barangayName);
    }
    setSelectedBarangays(newSelected);
  };

  const selectAll = () => {
    const newBarangays = barangays.filter(b => !existingBarangays.has(b.name));
    setSelectedBarangays(new Set(newBarangays.map(b => b.name)));
  };

  const deselectAll = () => {
    setSelectedBarangays(new Set());
  };

  const handleCreate = async () => {
    if (!firestore || selectedBarangays.size === 0) return;

    setIsCreating(true);

    try {
      const municipality = municipalities.find(m => m.code === selectedMunicipality);
      if (!municipality) throw new Error('Municipality not found');

      const barangaysToCreate = barangays.filter(b => selectedBarangays.has(b.name));
      
      // Create in batches of 500 (Firestore limit)
      for (let i = 0; i < barangaysToCreate.length; i += 500) {
        const batch = writeBatch(firestore);
        const batchData = barangaysToCreate.slice(i, i + 500);
        
        for (const barangay of batchData) {
          const docRef = doc(collection(firestore, 'barangays'));
          
          // Generate admin email
          const cleanName = barangay.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .substring(0, 30);
          const adminEmail = `admin@ibarangay${cleanName}.com`;
          
          batch.set(docRef, {
            name: barangay.name,
            municipality: municipality.name,
            province: 'Oriental Mindoro',
            region: 'MIMAROPA',
            psgcCode: barangay.code,
            address: `${barangay.name}, ${municipality.name}, Oriental Mindoro`,
            contactNumber: '',
            sealLogoUrl: '',
            adminEmail: adminEmail,
            isActive: true,
            createdAt: new Date().toISOString(),
          });
        }
        
        await batch.commit();
      }

      toast({
        title: 'Success',
        description: `Created ${barangaysToCreate.length} barangays successfully. Admin accounts can be created separately from the Barangays page.`,
      });

      // Refresh existing barangays
      await checkExistingBarangays(selectedMunicipality);
      setSelectedBarangays(new Set());
      
    } catch (error: any) {
      console.error('Creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create barangays',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedMunicipalityData = municipalities.find(m => m.code === selectedMunicipality);
  const availableBarangays = barangays.filter(b => !existingBarangays.has(b.name));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/barangays">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Bulk Create Barangays</h1>
          <p className="text-muted-foreground">Create multiple barangays from official PSGC data</p>
        </div>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                <MapPin className="h-4 w-4" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Bulk Create Workflow
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                This feature creates barangay records only. Admin accounts can be created separately 
                from the Barangays page using the "Create Admin" button for each barangay.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Municipality Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Select Municipality
            </CardTitle>
            <CardDescription>Choose a municipality in Oriental Mindoro</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Municipality</Label>
              <Select value={selectedMunicipality} onValueChange={setSelectedMunicipality}>
                <SelectTrigger>
                  <SelectValue placeholder="Select municipality..." />
                </SelectTrigger>
                <SelectContent>
                  {municipalities.map((municipality) => (
                    <SelectItem key={municipality.code} value={municipality.code}>
                      {municipality.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMunicipalityData && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Barangays:</span>
                  <span className="font-medium">{barangays.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Already Created:</span>
                  <span className="font-medium">{existingBarangays.size}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-medium text-green-600">{availableBarangays.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selected:</span>
                  <span className="font-medium text-blue-600">{selectedBarangays.size}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Barangay Selection */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Select Barangays
                </CardTitle>
                <CardDescription>
                  {selectedMunicipalityData 
                    ? `Choose barangays to create in ${selectedMunicipalityData.name}`
                    : 'Select a municipality first'}
                </CardDescription>
              </div>
              {barangays.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={selectAll}
                    disabled={availableBarangays.length === 0}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={deselectAll}
                    disabled={selectedBarangays.size === 0}
                  >
                    Deselect All
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedMunicipality ? (
              <div className="text-center py-12 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Select a municipality to view its barangays</p>
              </div>
            ) : barangays.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No barangays found for this municipality</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[500px] overflow-y-auto p-2">
                  {barangays.map((barangay) => {
                    const isExisting = existingBarangays.has(barangay.name);
                    const isSelected = selectedBarangays.has(barangay.name);
                    
                    return (
                      <div
                        key={barangay.code}
                        className={`flex items-center space-x-2 p-3 rounded-lg border transition-colors ${
                          isExisting
                            ? 'bg-muted/50 opacity-60'
                            : isSelected
                            ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <Checkbox
                          id={barangay.code}
                          checked={isSelected}
                          onCheckedChange={() => toggleBarangay(barangay.name)}
                          disabled={isExisting || isCreating}
                        />
                        <label
                          htmlFor={barangay.code}
                          className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {barangay.name}
                          {isExisting && (
                            <span className="ml-2 text-xs text-muted-foreground">(Already created)</span>
                          )}
                        </label>
                        {isSelected && <CheckCircle className="h-4 w-4 text-blue-600" />}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleCreate}
                    disabled={selectedBarangays.size === 0 || isCreating}
                    className="flex-1"
                  >
                    {isCreating ? (
                      <>Creating {selectedBarangays.size} barangays...</>
                    ) : (
                      <>Create {selectedBarangays.size} Selected Barangays</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/barangays')}
                  >
                    View All Barangays
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
