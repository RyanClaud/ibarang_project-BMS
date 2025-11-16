'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFirebase } from '@/firebase';
import { collection, addDoc, writeBatch, doc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ImportBarangaysPage() {
  const { firestore } = useFirebase();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const downloadTemplate = () => {
    const csvContent = `Barangay Name,Municipality,Province,Address,Contact Number,Seal/Logo URL
Mina De Oro,Bongabong,Oriental Mindoro,"Bongabong, Oriental Mindoro",+63 123 456 7890,
San Isidro,Bongabong,Oriental Mindoro,"Bongabong, Oriental Mindoro",+63 123 456 7891,
Poblacion,Calapan City,Oriental Mindoro,"Calapan City, Oriental Mindoro",+63 123 456 7892,`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'barangay_import_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        toast({
          title: 'Invalid File',
          description: 'Please select a CSV file',
          variant: 'destructive',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const obj: any = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      return obj;
    });
  };

  const handleImport = async () => {
    if (!file || !firestore) return;

    setIsImporting(true);
    setResults(null);

    try {
      const text = await file.text();
      const barangays = parseCSV(text);
      
      let successCount = 0;
      let failedCount = 0;
      const errors: string[] = [];

      // Use batch for better performance
      const batch = writeBatch(firestore);
      const barangaysToAdd: any[] = [];

      for (const row of barangays) {
        try {
          if (!row['Barangay Name'] || !row['Municipality'] || !row['Province']) {
            errors.push(`Skipped row: Missing required fields`);
            failedCount++;
            continue;
          }

          const barangayData = {
            name: row['Barangay Name'],
            municipality: row['Municipality'],
            province: row['Province'],
            address: row['Address'] || `${row['Municipality']}, ${row['Province']}`,
            contactNumber: row['Contact Number'] || '',
            sealLogoUrl: row['Seal/Logo URL'] || '',
            isActive: true,
            createdAt: new Date().toISOString(),
          };

          barangaysToAdd.push(barangayData);
          successCount++;
        } catch (error: any) {
          errors.push(`Failed to add ${row['Barangay Name']}: ${error.message}`);
          failedCount++;
        }
      }

      // Add barangays in batches of 500 (Firestore limit)
      for (let i = 0; i < barangaysToAdd.length; i += 500) {
        const batchData = barangaysToAdd.slice(i, i + 500);
        const currentBatch = writeBatch(firestore);
        
        for (const data of batchData) {
          const docRef = doc(collection(firestore, 'barangays'));
          currentBatch.set(docRef, data);
        }
        
        await currentBatch.commit();
      }

      setResults({ success: successCount, failed: failedCount, errors });
      
      toast({
        title: 'Import Complete',
        description: `Successfully imported ${successCount} barangays`,
      });
    } catch (error: any) {
      console.error('Import error:', error);
      toast({
        title: 'Import Failed',
        description: error.message || 'Failed to import barangays',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/barangays">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">Import Barangays</h1>
          <p className="text-muted-foreground">Bulk import barangays from CSV file</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              How to Import
            </CardTitle>
            <CardDescription>Follow these steps to import barangays</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Download Template</p>
                  <p className="text-sm text-muted-foreground">Get the CSV template with the correct format</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Fill in Data</p>
                  <p className="text-sm text-muted-foreground">Add your barangay information to the CSV file</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Upload & Import</p>
                  <p className="text-sm text-muted-foreground">Upload the file and click import</p>
                </div>
              </div>
            </div>

            <Button onClick={downloadTemplate} variant="outline" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>

            <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <strong>Required fields:</strong> Barangay Name, Municipality, Province
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload CSV File
            </CardTitle>
            <CardDescription>Select your CSV file to import</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvFile">CSV File</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isImporting}
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <Button
              onClick={handleImport}
              disabled={!file || isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import Barangays
                </>
              )}
            </Button>

            {results && (
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">{results.success} barangays imported successfully</span>
                </div>
                
                {results.failed > 0 && (
                  <div className="flex items-start gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-medium">{results.failed} failed</p>
                      {results.errors.length > 0 && (
                        <ul className="text-xs mt-1 space-y-1">
                          {results.errors.slice(0, 5).map((error, i) => (
                            <li key={i}>• {error}</li>
                          ))}
                          {results.errors.length > 5 && (
                            <li>• ... and {results.errors.length - 5} more</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => router.push('/barangays')}
                  variant="outline"
                  className="w-full"
                >
                  View Barangays
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Oriental Mindoro Quick Import */}
      <Card>
        <CardHeader>
          <CardTitle>Oriental Mindoro Quick Setup</CardTitle>
          <CardDescription>Pre-configured data for Oriental Mindoro municipalities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {[
              { name: 'Baco', count: 26 },
              { name: 'Bansud', count: 14 },
              { name: 'Bongabong', count: 19 },
              { name: 'Bulalacao', count: 15 },
              { name: 'Calapan City', count: 62 },
              { name: 'Gloria', count: 28 },
              { name: 'Mansalay', count: 21 },
              { name: 'Naujan', count: 69 },
              { name: 'Pinamalayan', count: 25 },
              { name: 'Pola', count: 25 },
              { name: 'Puerto Galera', count: 13 },
              { name: 'Roxas', count: 9 },
              { name: 'San Teodoro', count: 18 },
              { name: 'Socorro', count: 15 },
              { name: 'Victoria', count: 27 },
            ].map((municipality) => (
              <div
                key={municipality.name}
                className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <p className="font-medium text-sm">{municipality.name}</p>
                <p className="text-xs text-muted-foreground">{municipality.count} barangays</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Total: 15 municipalities, 426 barangays
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
