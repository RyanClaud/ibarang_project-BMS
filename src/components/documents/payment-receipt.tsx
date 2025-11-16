'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Printer } from 'lucide-react';
import type { DocumentRequest } from '@/lib/types';
import { useAppContext } from '@/contexts/app-context';

interface PaymentReceiptProps {
  request: DocumentRequest;
}

export function PaymentReceipt({ request }: PaymentReceiptProps) {
  const { barangayConfig } = useAppContext();
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Official Receipt - ${request.trackingNumber}</title>
              <style>
                @page {
                  size: A4;
                  margin: 10mm;
                }
                body {
                  font-family: Arial, sans-serif;
                  padding: 10px;
                  max-width: 800px;
                  margin: 0 auto;
                  font-size: 12px;
                }
                .receipt {
                  border: 2px solid #000;
                  padding: 15px;
                  background: white;
                }
                .header {
                  text-align: center;
                  margin-bottom: 12px;
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                }
                .header img {
                  width: 50px !important;
                  height: 50px !important;
                  margin: 5px auto !important;
                }
                .title {
                  font-size: 18px;
                  font-weight: bold;
                  margin: 5px 0;
                }
                .subtitle {
                  font-size: 11px;
                  color: #666;
                }
                .content {
                  margin: 10px 0;
                }
                .row {
                  display: flex;
                  justify-content: space-between;
                  margin: 5px 0;
                  padding: 3px 0;
                }
                .label {
                  font-weight: bold;
                  font-size: 11px;
                }
                .amount {
                  font-size: 16px;
                  font-weight: bold;
                  text-align: center;
                  margin: 10px 0;
                  padding: 10px;
                  border: 2px solid #000;
                }
                .footer {
                  margin-top: 12px;
                  padding-top: 10px;
                  border-top: 2px solid #000;
                  font-size: 9px;
                  text-align: center;
                }
                .note {
                  background: #f0f0f0;
                  padding: 8px;
                  margin: 10px 0;
                  border-left: 3px solid #666;
                  font-size: 10px;
                }
                .payment-proof {
                  margin: 10px 0;
                  border: 1px solid #ddd;
                  padding: 5px;
                  background: #f9f9f9;
                }
                .payment-proof img {
                  max-width: 100%;
                  max-height: 200px;
                  display: block;
                  margin: 0 auto;
                  object-fit: contain;
                }
                @media print {
                  body { padding: 0; }
                  .no-print { display: none; }
                  .receipt { 
                    padding: 12px;
                    page-break-inside: avoid;
                  }
                  .payment-proof img {
                    max-height: 180px;
                  }
                  .header img {
                    width: 45px !important;
                    height: 45px !important;
                  }
                }
              </style>
            </head>
            <body>
              ${receiptRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const receiptNumber = `RCP-${new Date().getFullYear()}-${request.trackingNumber?.split('-')[1] || '001'}`;
  const paymentDetails = request.paymentDetails;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 no-print">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Print Receipt
        </Button>
        <Button onClick={handlePrint} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div ref={receiptRef} className="receipt p-4">
            {/* Header */}
            <div className="header text-center border-b-2 border-black pb-3 mb-3">
              <div className="text-lg font-bold mb-1">OFFICIAL RECEIPT</div>
              {barangayConfig?.sealLogoUrl && (
                <img
                  src={barangayConfig.sealLogoUrl}
                  alt="Barangay Seal"
                  className="w-12 h-12 mx-auto my-2"
                />
              )}
              <div className="text-base font-semibold">{barangayConfig?.name || 'Barangay'}</div>
              <div className="text-xs text-muted-foreground">
                {barangayConfig?.address || 'Address'}
              </div>
            </div>

            {/* Receipt Details */}
            <div className="content space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="label">Receipt No:</span>
                <span className="font-mono">{receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="label">Date Issued:</span>
                <span>{new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
              <div className="flex justify-between">
                <span className="label">Tracking No:</span>
                <span className="font-mono">{request.trackingNumber}</span>
              </div>
            </div>

            <div className="my-3 border-t border-gray-300"></div>

            {/* Payer Information */}
            <div className="content space-y-2">
              <div>
                <span className="label text-xs">Received from:</span>
                <div className="text-sm font-semibold">{request.residentName}</div>
              </div>
              
              <div>
                <span className="label text-xs">For payment of:</span>
                <div className="text-sm font-semibold">{request.documentType}</div>
              </div>
            </div>

            {/* Amount */}
            <div className="amount border-2 border-black p-2 my-3">
              <div className="text-xs text-muted-foreground">Amount Paid</div>
              <div className="text-2xl font-bold">₱{request.amount.toFixed(2)}</div>
            </div>

            {/* Payment Details */}
            <div className="content space-y-1">
              <div className="my-2 border-t border-gray-300"></div>
              
              <div className="space-y-1 text-xs">
                {/* Always show payment method */}
                <div className="flex justify-between">
                  <span className="label">Payment Method:</span>
                  <span>{paymentDetails?.method || (request.amount === 0 ? 'Free' : 'N/A')}</span>
                </div>
                
                {/* Show transaction ID if available */}
                {paymentDetails?.transactionId && paymentDetails.transactionId !== 'N/A - Free Document' && (
                  <div className="flex justify-between">
                    <span className="label">Transaction ID:</span>
                    <span className="font-mono text-xs">{paymentDetails.transactionId}</span>
                  </div>
                )}
                
                {/* Show reference number if available */}
                {request.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="label">Reference Number:</span>
                    <span className="font-mono">{request.referenceNumber}</span>
                  </div>
                )}
                
                {/* Show payment date if available */}
                {paymentDetails?.paymentDate && (
                  <div className="flex justify-between">
                    <span className="label">Payment Date:</span>
                    <span>{new Date(paymentDetails.paymentDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                )}
                
                {/* Show approval date if no payment date */}
                {!paymentDetails?.paymentDate && request.approvalDate && (
                  <div className="flex justify-between">
                    <span className="label">Approved Date:</span>
                    <span>{new Date(request.approvalDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}</span>
                  </div>
                )}
                
                {/* Show verified by if available */}
                {paymentDetails?.verifiedBy && (
                  <div className="flex justify-between">
                    <span className="label">Verified by:</span>
                    <span>Barangay Treasurer</span>
                  </div>
                )}
                
                {/* Show status */}
                <div className="flex justify-between">
                  <span className="label">Status:</span>
                  <span className="font-semibold text-green-600">{request.status}</span>
                </div>
              </div>

              {/* Payment Proof Screenshot - Only for paid documents with screenshot */}
              {(paymentDetails?.screenshotUrl || paymentDetails?.screenshotBase64) && paymentDetails.method !== 'Free' && request.amount > 0 && (
                <div className="payment-proof mt-3 border-t border-gray-300 pt-2">
                  <div className="mb-1">
                    <span className="label text-xs">Payment Proof:</span>
                  </div>
                  <div className="border border-gray-300 rounded overflow-hidden bg-gray-50 p-1">
                    <img
                      src={paymentDetails.screenshotUrl || paymentDetails.screenshotBase64}
                      alt="Payment Proof Screenshot"
                      className="w-full h-auto max-h-48 object-contain mx-auto"
                      style={{ display: 'block' }}
                    />
                  </div>
                  <div className="mt-1 text-center">
                    <p className="text-[9px] text-green-600 font-semibold">
                      ✓ Verified by Barangay Treasurer
                    </p>
                  </div>
                </div>
              )}
              
              {/* Free document notice */}
              {request.amount === 0 && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-xs text-green-800 font-semibold">
                    ✓ This is a free document - No payment required
                  </p>
                </div>
              )}
            </div>

            {/* Important Note */}
            <div className="note bg-blue-50 border-l-3 border-blue-500 p-2 my-3">
              <p className="text-xs font-semibold mb-1">IMPORTANT NOTE:</p>
              <p className="text-[10px]">
                This is an official receipt for payment only. The actual document will be 
                released upon completion of processing. Please present this receipt when claiming.
              </p>
            </div>

            {/* Footer */}
            <div className="footer border-t-2 border-black pt-2 mt-3 text-center text-[9px]">
              <p className="font-semibold">Track your request: {request.trackingNumber}</p>
              <p className="text-muted-foreground mt-1">
                This is a computer-generated receipt. Issued: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
