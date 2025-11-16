'use client';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, Clock, FileText, Package, XCircle } from "lucide-react";
import type { DocumentRequest } from "@/lib/types";
import { useRouter } from "next/navigation";

interface DocumentStatusAlertProps {
  requests: DocumentRequest[];
  onPayNow?: (request: DocumentRequest) => void;
}

export function DocumentStatusAlert({ requests, onPayNow }: DocumentStatusAlertProps) {
  const router = useRouter();

  // Filter requests by status
  const readyForPickup = requests.filter(r => r.status === 'Ready for Pickup');
  const paymentVerified = requests.filter(r => r.status === 'Payment Verified');
  const approved = requests.filter(r => r.status === 'Approved' && r.amount > 0);
  const rejected = requests.filter(r => r.status === 'Rejected');

  // Don't show anything if no important notifications
  if (readyForPickup.length === 0 && paymentVerified.length === 0 && approved.length === 0 && rejected.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Ready for Pickup - Highest Priority */}
      {readyForPickup.length > 0 && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
          <Package className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-900 dark:text-green-100 font-semibold">
            {readyForPickup.length} Document{readyForPickup.length > 1 ? 's' : ''} Ready for Pickup! 🎉
          </AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            <div className="mt-2 space-y-2">
              {readyForPickup.map(request => (
                <div key={request.id} className="flex items-center justify-between bg-white dark:bg-green-900 p-3 rounded-md">
                  <div>
                    <p className="font-medium">{request.documentType}</p>
                    <p className="text-sm text-muted-foreground">Tracking: {request.trackingNumber}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                    Ready
                  </Badge>
                </div>
              ))}
              <p className="text-sm mt-3">
                📍 Visit the barangay office during office hours to claim your document(s).
              </p>
              <p className="text-sm font-medium">
                ⏰ Office Hours: Monday-Friday, 8:00 AM - 5:00 PM
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Payment Verified - Document Being Prepared */}
      {paymentVerified.length > 0 && (
        <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
          <Clock className="h-5 w-5 text-blue-600" />
          <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold">
            {paymentVerified.length} Document{paymentVerified.length > 1 ? 's' : ''} Being Prepared
          </AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="mt-2 space-y-2">
              {paymentVerified.map(request => (
                <div key={request.id} className="flex items-center justify-between bg-white dark:bg-blue-900 p-3 rounded-md">
                  <div>
                    <p className="font-medium">{request.documentType}</p>
                    <p className="text-sm text-muted-foreground">Tracking: {request.trackingNumber}</p>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    In Progress
                  </Badge>
                </div>
              ))}
              <p className="text-sm mt-3">
                Your payment has been verified. The document is being prepared and will be ready soon.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Approved - Needs Payment */}
      {approved.length > 0 && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
          <Bell className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">
            Action Required: Upload Payment Proof
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <div className="mt-2 space-y-2">
              {approved.map(request => (
                <div key={request.id} className="flex items-center justify-between bg-white dark:bg-amber-900 p-3 rounded-md">
                  <div>
                    <p className="font-medium">{request.documentType}</p>
                    <p className="text-sm text-muted-foreground">
                      Amount: {request.amount.toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => onPayNow ? onPayNow(request) : router.push('/dashboard')}
                  >
                    Pay Now
                  </Button>
                </div>
              ))}
              <p className="text-sm mt-3">
                Your request has been approved. Please upload your payment proof to continue processing.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Rejected */}
      {rejected.length > 0 && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
          <XCircle className="h-5 w-5 text-red-600" />
          <AlertTitle className="text-red-900 dark:text-red-100 font-semibold">
            {rejected.length} Request{rejected.length > 1 ? 's' : ''} Rejected
          </AlertTitle>
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="mt-2 space-y-2">
              {rejected.map(request => (
                <div key={request.id} className="bg-white dark:bg-red-900 p-3 rounded-md">
                  <p className="font-medium">{request.documentType}</p>
                  <p className="text-sm text-muted-foreground">Tracking: {request.trackingNumber}</p>
                </div>
              ))}
              <p className="text-sm mt-3">
                Please contact the barangay office for more information about the rejection.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
