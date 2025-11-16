'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { DocumentRequest } from '@/lib/types';
import { useAppContext } from '@/contexts/app-context';

interface PaymentVerificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  request: DocumentRequest;
  onSuccess: () => void;
}

export function PaymentVerificationDialog({
  isOpen,
  onClose,
  request,
  onSuccess,
}: PaymentVerificationDialogProps) {
  const { firestore } = useFirebase();
  const { currentUser } = useAppContext();
  const [isProcessing, setIsProcessing] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  const handleVerify = async () => {
    if (!firestore || !currentUser) return;

    setIsProcessing(true);

    try {
      const requestRef = doc(firestore, 'documentRequests', request.id);
      await updateDoc(requestRef, {
        status: 'Payment Verified',
        'paymentDetails.verifiedBy': currentUser.id,
        'paymentDetails.verifiedDate': new Date().toISOString(),
        'paymentDetails.remarks': remarks || 'Payment verified',
        paymentVerifiedDate: new Date().toISOString(),
      });

      toast({
        title: 'Payment Verified',
        description: 'Payment has been confirmed. Document can now be prepared.',
      });

      onSuccess();
      onClose();
      setRemarks('');
    } catch (error: any) {
      console.error('Error verifying payment:', error);
      toast({
        title: 'Verification Failed',
        description: error.message || 'Failed to verify payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!firestore || !currentUser) return;

    if (!remarks.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for rejecting the payment',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      const requestRef = doc(firestore, 'documentRequests', request.id);
      await updateDoc(requestRef, {
        status: 'Approved', // Back to Approved so resident can resubmit
        'paymentDetails.verifiedBy': currentUser.id,
        'paymentDetails.verifiedDate': new Date().toISOString(),
        'paymentDetails.remarks': remarks,
        rejectionReason: `Payment rejected: ${remarks}`,
      });

      toast({
        title: 'Payment Rejected',
        description: 'Resident will be notified to resubmit payment proof',
        variant: 'destructive',
      });

      onSuccess();
      onClose();
      setRemarks('');
    } catch (error: any) {
      console.error('Error rejecting payment:', error);
      toast({
        title: 'Rejection Failed',
        description: error.message || 'Failed to reject payment',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const paymentDetails = request.paymentDetails;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Verify Payment</DialogTitle>
            <DialogDescription>
              Review payment details for {request.residentName}'s {request.documentType}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {/* Request Details */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Resident:</span>
                <span className="text-sm">{request.residentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Document:</span>
                <span className="text-sm">{request.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Amount:</span>
                <span className="text-sm font-bold">₱{request.amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Details */}
            {paymentDetails && (
              <div className="space-y-3">
                <h4 className="font-semibold">Payment Information</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Payment Method</Label>
                    <p className="text-sm font-medium">{paymentDetails.method}</p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Reference Number</Label>
                    <p className="text-sm font-medium">{request.referenceNumber || 'N/A'}</p>
                  </div>
                  
                  {paymentDetails.transactionId && (
                    <div className="col-span-2">
                      <Label className="text-xs text-muted-foreground">Transaction ID</Label>
                      <p className="text-sm font-medium font-mono">{paymentDetails.transactionId}</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Payment Date</Label>
                    <p className="text-sm font-medium">
                      {new Date(paymentDetails.paymentDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Payment Proof Image */}
                {(paymentDetails.screenshotUrl || paymentDetails.screenshotBase64 || paymentDetails.proofImageUrl) && (
                  <div className="space-y-2">
                    <Label>Payment Proof</Label>
                    <div className="border rounded-lg p-2 bg-muted">
                      <img
                        src={paymentDetails.screenshotUrl || paymentDetails.screenshotBase64 || paymentDetails.proofImageUrl}
                        alt="Payment proof"
                        className="max-h-64 mx-auto rounded cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => setShowImageModal(true)}
                      />
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => setShowImageModal(true)}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View Full Size
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Remarks */}
            <div className="space-y-2">
              <Label htmlFor="remarks">
                Remarks {!remarks.trim() && '(Required for rejection)'}
              </Label>
              <Textarea
                id="remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any notes or comments about this payment..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 flex-shrink-0 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Reject Payment
            </Button>
            <Button
              type="button"
              onClick={handleVerify}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Verify Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Full Size Image Modal */}
      {showImageModal && (paymentDetails?.screenshotUrl || paymentDetails?.screenshotBase64 || paymentDetails?.proofImageUrl) && (
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Payment Proof</DialogTitle>
            </DialogHeader>
            <div className="max-h-[80vh] overflow-auto">
              <img
                src={paymentDetails.screenshotUrl || paymentDetails.screenshotBase64 || paymentDetails.proofImageUrl}
                alt="Payment proof full size"
                className="w-full rounded"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
