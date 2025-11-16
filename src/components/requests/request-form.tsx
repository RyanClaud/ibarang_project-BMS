"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppContext } from "@/contexts/app-context";
import { useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { FileText, User, MapPin, Banknote } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  documentType: z.enum(["Barangay Clearance", "Certificate of Residency", "Certificate of Indigency", "Business Permit", "Good Moral Character Certificate", "Solo Parent Certificate"]),
});

const DOCUMENT_PRICES: Record<string, number> = {
  'Barangay Clearance': 50.00,
  'Certificate of Residency': 75.00,
  'Certificate of Indigency': 0.00,
  'Business Permit': 250.00,
  'Good Moral Character Certificate': 100.00,
  'Solo Parent Certificate': 0.00,
};

const DOCUMENT_ICONS: Record<string, string> = {
  'Barangay Clearance': '📋',
  'Certificate of Residency': '🏠',
  'Certificate of Indigency': '🤝',
  'Business Permit': '💼',
  'Good Moral Character Certificate': '⭐',
  'Solo Parent Certificate': '👨‍👧',
};

export function RequestForm() {
  const { addDocumentRequest, currentUser, residents, documentPricing } = useAppContext();
  const [selectedDoc, setSelectedDoc] = useState<string>("Barangay Clearance");
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentType: "Barangay Clearance",
    },
  });

  const resident = useMemo(() => {
    if (currentUser?.residentId && residents) {
      return residents.find(res => res.id === currentUser.residentId);
    }
    return null;
  }, [currentUser, residents]);

  // Use barangay-specific pricing if available, otherwise fall back to defaults
  const pricing = documentPricing || DOCUMENT_PRICES;
  const selectedPrice = pricing[selectedDoc as keyof typeof DOCUMENT_PRICES] || 0;


  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser || !currentUser.residentId || !resident) {
        toast({
            title: "Error",
            description: "Could not identify the current resident. Please log in again.",
            variant: "destructive",
        });
        return;
    }

    // Get amount from barangay-specific pricing
    const amount = pricing[values.documentType] || 0;

    addDocumentRequest({
        residentId: currentUser.residentId,
        residentName: currentUser.name,
        documentType: values.documentType,
        amount: amount,
    });
    
    toast({
        title: "Request Submitted",
        description: `Your ${values.documentType} request has been submitted successfully.`,
    });
    
    form.reset({ documentType: "Barangay Clearance" });
  }

  return (
    <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="h-6 w-6 text-blue-600" />
              New Document Request
            </CardTitle>
            <CardDescription className="text-base">
              Select a document to request. Your information will be auto-filled.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 pt-6">
            <FormField
              control={form.control}
              name="documentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Document Type</FormLabel>
                  <Select 
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedDoc(value);
                    }} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select a document to request" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(Object.keys(pricing) as Array<keyof typeof DOCUMENT_PRICES>).map((docType) => {
                        const price = pricing[docType];
                        const icon = DOCUMENT_ICONS[docType];
                        return (
                          <SelectItem key={docType} value={docType} className="text-base py-3">
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="flex items-center gap-2">
                                <span>{icon}</span>
                                {docType}
                              </span>
                              <span className={`text-sm font-semibold ${price === 0 ? 'text-green-600' : 'text-blue-600'}`}>
                                {price === 0 ? 'FREE' : `₱${price.toFixed(2)}`}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Banknote className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-lg">Document Fee:</span>
                </div>
                {selectedPrice === 0 ? (
                  <Badge className="bg-green-600 text-white text-lg px-4 py-1">FREE</Badge>
                ) : (
                  <span className="text-2xl font-bold text-blue-600">
                    ₱{selectedPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {selectedPrice === 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  This document is provided free of charge
                </p>
              )}
            </div>

            {resident && (
              <div className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950 p-5 rounded-lg space-y-3 border-2 border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Your Information (Auto-filled)
                </h4>
                <div className="space-y-2 pl-7">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-medium text-muted-foreground min-w-[70px]">Name:</span>
                    <span className="text-sm font-semibold">{resident.firstName} {resident.lastName}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-purple-600 mt-0.5" />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-muted-foreground">Address:</span>
                      <p className="text-sm font-semibold">{resident.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>📌 Note:</strong> After submitting, you'll receive a tracking number to monitor your request status. 
                {selectedPrice > 0 && " Payment will be required after approval."}
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Processing time: 1-3 business days
            </p>
            <Button 
              type="submit" 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-105"
            >
              <FileText className="mr-2 h-5 w-5" />
              Submit Request
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
