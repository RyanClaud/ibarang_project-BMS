"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFirebase } from "@/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Loader2, Banknote } from "lucide-react";
import { useAppContext } from "@/contexts/app-context";
import type { DocumentPricing } from "@/lib/types";

const DEFAULT_PRICING: DocumentPricing = {
  "Barangay Clearance": 50.00,
  "Certificate of Residency": 75.00,
  "Certificate of Indigency": 0.00,
  "Business Permit": 250.00,
  "Good Moral Character Certificate": 100.00,
  "Solo Parent Certificate": 0.00,
};

const DOCUMENT_ICONS: Record<keyof DocumentPricing, string> = {
  'Barangay Clearance': '📋',
  'Certificate of Residency': '🏠',
  'Certificate of Indigency': '🤝',
  'Business Permit': '💼',
  'Good Moral Character Certificate': '⭐',
  'Solo Parent Certificate': '👨‍👧',
};

export function DocumentPricingForm() {
  const { firestore, areServicesAvailable } = useFirebase();
  const { currentUser } = useAppContext();
  const [pricing, setPricing] = useState<DocumentPricing>(DEFAULT_PRICING);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPricing = async () => {
      if (!firestore || !currentUser?.barangayId) return;
      setIsLoading(true);
      try {
        const barangayRef = doc(firestore, 'barangays', currentUser.barangayId);
        const barangaySnap = await getDoc(barangayRef);
        if (barangaySnap.exists()) {
          const data = barangaySnap.data();
          setPricing(data.documentPricing || DEFAULT_PRICING);
        }
      } catch (e) {
        console.error("Failed to fetch pricing:", e);
        toast({ 
          title: "Error", 
          description: "Could not fetch document pricing.", 
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    if (areServicesAvailable) {
      fetchPricing();
    } else {
      setIsLoading(false);
    }
  }, [firestore, areServicesAvailable, currentUser?.barangayId]);

  const handlePriceChange = (docType: keyof DocumentPricing, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPricing(prev => ({
      ...prev,
      [docType]: numValue
    }));
  };

  const handleSave = async () => {
    if (!firestore || !currentUser?.barangayId) {
      toast({ 
        title: "Firebase not initialized.", 
        description: "Please try again later.", 
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    try {
      const barangayRef = doc(firestore, 'barangays', currentUser.barangayId);
      await setDoc(barangayRef, {
        documentPricing: pricing
      }, { merge: true });

      toast({ 
        title: "Pricing Updated", 
        description: "Document pricing has been saved successfully." 
      });
    } catch (error: any) {
      console.error("Error saving pricing: ", error);
      toast({ 
        title: "Save Failed", 
        description: error.message || "Could not save pricing.", 
        variant: "destructive" 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setPricing(DEFAULT_PRICING);
    toast({ 
      title: "Reset to Defaults", 
      description: "Pricing has been reset. Click 'Save Changes' to apply." 
    });
  };

  if (isLoading) {
    return (
      <Card className="border-t-4 border-t-green-500">
        <CardContent className="flex justify-center items-center p-8">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-t-4 border-t-green-500 hover:shadow-xl transition-all">
      <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950">
        <CardTitle className="flex items-center gap-2">
          <Banknote className="h-6 w-6 text-green-600" />
          Document Pricing
        </CardTitle>
        <CardDescription>
          Set the fees for each document type in your barangay. These prices will be shown to residents when they request documents.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Tip:</strong> Set the price to ₱0.00 for documents that should be provided free of charge.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {(Object.keys(pricing) as Array<keyof DocumentPricing>).map((docType) => (
            <div key={docType} className="space-y-2">
              <Label htmlFor={docType} className="flex items-center gap-2">
                <span className="text-lg">{DOCUMENT_ICONS[docType]}</span>
                {docType}
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                  ₱
                </span>
                <Input
                  id={docType}
                  type="number"
                  min="0"
                  step="0.01"
                  value={pricing[docType]}
                  onChange={(e) => handlePriceChange(docType, e.target.value)}
                  className="pl-8 h-11"
                  placeholder="0.00"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 flex justify-between">
        <Button 
          variant="outline" 
          onClick={handleResetToDefaults}
          disabled={isSaving}
        >
          Reset to Defaults
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || !areServicesAvailable}
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </CardFooter>
    </Card>
  );
}
