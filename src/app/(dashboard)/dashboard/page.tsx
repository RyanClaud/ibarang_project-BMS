'use client';

import { RequestForm } from "@/components/requests/request-form";
import { RequestHistory } from "@/components/requests/request-history";
import { StatCard } from "@/components/dashboard/stat-card";
import { RequestsChart } from "@/components/dashboard/requests-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { DocumentStatusAlert } from "@/components/notifications/document-status-alert";
import { CircleDollarSign, FileText, Users, CheckCircle, Loader2, Hourglass, Banknote, FileSearch, Receipt } from "lucide-react";
import { useMemo, useState } from "react";
import { useAppContext } from "@/contexts/app-context";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DocumentRequest, DocumentRequestStatus } from "@/lib/types";
import { PaymentDialog } from "@/components/requests/payment-dialog";
import { PaymentReceipt } from "@/components/documents/payment-receipt";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const statusColors: Record<DocumentRequestStatus, string> = {
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  Approved: "bg-sky-100 text-sky-800 border-sky-200",
  "Payment Submitted": "bg-purple-100 text-purple-800 border-purple-200",
  "Payment Verified": "bg-blue-100 text-blue-800 border-blue-200",
  "Ready for Pickup": "bg-emerald-100 text-emerald-800 border-emerald-200",
  Released: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
};


export default function DashboardPage() {
  const { currentUser, residents, documentRequests, isDataLoading, barangayConfig } = useAppContext();
  const [paymentRequest, setPaymentRequest] = useState<DocumentRequest | null>(null);
  const [receiptRequest, setReceiptRequest] = useState<DocumentRequest | null>(null);
  const router = useRouter();

  const user = currentUser;

  const residentInfo = useMemo(() => {
    if (user?.role === 'Resident' && user.residentId && residents) {
      return residents.find(res => res.id === user.residentId);
    }
    return undefined;
  }, [user, residents]);
  
  const residentRequests = useMemo(() => {
    if (user?.role === 'Resident' && documentRequests) {
      return documentRequests;
    }
    return [];
  }, [user, documentRequests]);

  // Common stats
  const safeDocumentRequests = documentRequests || [];
  const safeResidents = residents || [];

  const totalRevenue = safeDocumentRequests
    .filter(req => req.status === 'Released' || req.status === 'Payment Verified')
    .reduce((sum, req) => sum + (req.amount || 0), 0);
  const approvedRequests = safeDocumentRequests.filter(req => ['Approved', 'Payment Submitted', 'Payment Verified', 'Ready for Pickup', 'Released'].includes(req.status)).length;
  const pendingRequests = safeDocumentRequests.filter(req => req.status === 'Pending').length;
  const pendingPayments = safeDocumentRequests.filter(req => req.status === 'Approved').length;


  if (!user || isDataLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Resident Dashboard
  if (user.role === "Resident") {
    const totalRequests = residentRequests.length;
    const completedRequests = residentRequests.filter(r => r.status === 'Released').length;

    const handleViewReceipt = (request: DocumentRequest) => {
        setReceiptRequest(request);
    };

    return (
      <>
        {paymentRequest && (
            <PaymentDialog
            isOpen={!!paymentRequest}
            onClose={() => setPaymentRequest(null)}
            request={paymentRequest}
            />
        )}
        
        {/* Receipt Dialog */}
        {receiptRequest && (
          <Dialog open={!!receiptRequest} onOpenChange={(open) => !open && setReceiptRequest(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Official Receipt</DialogTitle>
              </DialogHeader>
              <PaymentReceipt request={receiptRequest} />
            </DialogContent>
          </Dialog>
        )}
        
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950 dark:via-purple-950 dark:to-pink-950 p-6 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-3">
                <span className="text-4xl">👋</span>
                Welcome back, {residentInfo?.firstName || 'Resident'}!
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your document requests and submit new ones below
              </p>
            </div>
            
            {/* Status Notifications */}
            <DocumentStatusAlert 
              requests={residentRequests} 
              onPayNow={(request) => setPaymentRequest(request)}
            />
            
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="animate-fade-in [--animation-delay:100ms] opacity-0">
                    <StatCard
                        title="Total Requests"
                        value={totalRequests.toString()}
                        icon={FileText}
                        description="All document requests you have made."
                        color="blue"
                    />
                </div>
                <div className="animate-fade-in [--animation-delay:200ms] opacity-0">
                    <StatCard
                        title="Completed Requests"
                        value={completedRequests.toString()}
                        icon={CheckCircle}
                        description="Documents that have been released to you."
                        color="green"
                    />
                </div>
            </div>

            <div className="pt-2">
                <h2 className="text-2xl font-bold font-headline tracking-tight flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  Request a New Document
                </h2>
                <p className="text-muted-foreground mt-1">
                  Fill out the form below. Your information will be auto-filled.
                </p>
            </div>
            <div className="animate-fade-in [--animation-delay:300ms] opacity-0">
                <RequestForm />
            </div>
    
            <div className="pt-6">
              <h2 className="text-2xl font-bold font-headline tracking-tight flex items-center gap-2">
                <span className="text-2xl">📋</span>
                My Request History
              </h2>
              <p className="text-muted-foreground mt-1">
                Track the status of your current and past document requests.
              </p>
            </div>
            <div className="rounded-lg border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="font-semibold">Tracking No.</TableHead>
                        <TableHead className="font-semibold">Document</TableHead>
                        <TableHead className="hidden sm:table-cell font-semibold">Date</TableHead>
                        <TableHead className="font-semibold">Amount</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="text-right font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {residentRequests.length ? (
                        residentRequests.map((request) => (
                            <TableRow key={request.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="font-medium">
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-mono">
                                {request.trackingNumber}
                                </span>
                            </TableCell>
                            <TableCell className="font-medium">{request.documentType}</TableCell>
                            <TableCell className="hidden sm:table-cell text-muted-foreground">
                                {new Date(request.requestDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </TableCell>
                            <TableCell className="font-semibold">
                                {request.amount.toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={cn("font-semibold text-xs", statusColors[request.status])}>
                                {request.status}
                                </Badge>
                            </TableCell>
                             <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                {request.status === 'Approved' && request.amount > 0 && (
                                <Button size="sm" onClick={() => setPaymentRequest(request)} className="h-9">
                                    <Banknote className="mr-2 h-4 w-4"/>
                                    Pay Now
                                </Button>
                                )}
                                {request.status === 'Approved' && request.amount === 0 && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                    Free - No Payment
                                </Badge>
                                )}
                                {(request.status === 'Payment Verified' || request.status === 'Ready for Pickup' || request.status === 'Released') && (
                                <Button variant="outline" size="sm" onClick={() => handleViewReceipt(request)} className="h-9">
                                    <Receipt className="mr-2 h-4 w-4"/>
                                    Receipt
                                </Button>
                                )}
                                </div>
                            </TableCell>
                            </TableRow>
                        ))
                        ) : (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                <span className="text-4xl">📄</span>
                                <p className="font-medium">No document requests yet</p>
                                <p className="text-sm">Submit your first request using the form above</p>
                            </div>
                            </TableCell>
                        </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
      </>
    );
  }

  // Barangay Captain Dashboard
  if (user.role === "Barangay Captain") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {barangayConfig?.sealLogoUrl && (
            <img src={barangayConfig.sealLogoUrl} alt="Barangay Seal" className="h-16 w-16 object-contain" />
          )}
          <h1 className="text-3xl font-bold font-headline tracking-tight">Captain's Dashboard</h1>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="animate-fade-in [--animation-delay:100ms] opacity-0">
              <StatCard
                title="Total Residents"
                value={safeResidents.length.toString()}
                icon={Users}
                description="The total number of registered residents."
                color="purple"
              />
          </div>
          <div className="animate-fade-in [--animation-delay:200ms] opacity-0">
              <StatCard
                title="Pending Requests"
                value={pendingRequests.toString()}
                icon={Hourglass}
                description="Documents awaiting approval."
                color="orange"
              />
          </div>
          <div className="animate-fade-in [--animation-delay:300ms] opacity-0">
              <StatCard
                title="Approved Requests"
                value={approvedRequests.toString()}
                icon={FileText}
                description="Total documents approved."
                color="green"
              />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-full lg:col-span-4">
            <RequestsChart />
          </div>
          <div className="col-span-full lg:col-span-3">
            <RecentActivity />
          </div>
        </div>
      </div>
    );
  }

  // Secretary Dashboard
  if (user.role === "Secretary") {
    const verifiedRequests = safeDocumentRequests.filter(req => 
      ['Payment Verified', 'Ready for Pickup', 'Released'].includes(req.status)
    ).length;
    const todayRequests = safeDocumentRequests.filter(req => {
      const today = new Date();
      const reqDate = new Date(req.requestDate);
      return reqDate.toDateString() === today.toDateString();
    }).length;

    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex items-center gap-4 pb-2">
          {barangayConfig?.sealLogoUrl && (
            <img src={barangayConfig.sealLogoUrl} alt="Barangay Seal" className="h-16 w-16 object-contain" />
          )}
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">Secretary's Dashboard</h1>
            <p className="text-muted-foreground mt-1">Manage residents and process document requests</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="animate-fade-in [--animation-delay:100ms] opacity-0">
            <StatCard
              title="Total Residents"
              value={safeResidents.length.toString()}
              icon={Users}
              description="Registered residents in the system"
              color="purple"
            />
          </div>
          <div className="animate-fade-in [--animation-delay:200ms] opacity-0">
            <StatCard
              title="Pending Requests"
              value={pendingRequests.toString()}
              icon={Hourglass}
              description="Awaiting verification and approval"
              color="orange"
            />
          </div>
          <div className="animate-fade-in [--animation-delay:300ms] opacity-0">
            <StatCard
              title="Verified Documents"
              value={verifiedRequests.toString()}
              icon={CheckCircle}
              description="Documents verified and processed"
              color="green"
            />
          </div>
          <div className="animate-fade-in [--animation-delay:400ms] opacity-0">
            <StatCard
              title="Today's Requests"
              value={todayRequests.toString()}
              icon={FileSearch}
              description="New requests received today"
              color="blue"
            />
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in [--animation-delay:500ms] opacity-0">
          <Link href="/residents">
            <div className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-purple-50 to-white p-6 transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Resident Management</h3>
                  <p className="text-sm text-muted-foreground">Add, edit, and manage resident records</p>
                </div>
                <Users className="h-8 w-8 text-purple-600 opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>

          <Link href="/requests">
            <div className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-orange-50 to-white p-6 transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Document Verification</h3>
                  <p className="text-sm text-muted-foreground">Review and verify document requests</p>
                </div>
                <FileSearch className="h-8 w-8 text-orange-600 opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>

          <Link href="/settings">
            <div className="group relative overflow-hidden rounded-lg border bg-gradient-to-br from-blue-50 to-white p-6 transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Settings</h3>
                  <p className="text-sm text-muted-foreground">Manage barangay information and system</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600 opacity-80 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity Section */}
        <div className="grid gap-4 animate-fade-in [--animation-delay:600ms] opacity-0">
          <div className="col-span-full">
            <div className="mb-4">
              <h2 className="text-2xl font-bold font-headline tracking-tight">Recent Activity</h2>
              <p className="text-muted-foreground">Latest document requests and updates</p>
            </div>
            <RecentActivity />
          </div>
        </div>
      </div>
    );
  }

  // Treasurer Dashboard
  if (user.role === "Treasurer") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          {barangayConfig?.sealLogoUrl && (
            <img src={barangayConfig.sealLogoUrl} alt="Barangay Seal" className="h-16 w-16 object-contain" />
          )}
          <h1 className="text-3xl font-bold font-headline tracking-tight">Treasurer's Dashboard</h1>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="animate-fade-in [--animation-delay:100ms] opacity-0">
              <StatCard
                title="Total Revenue"
                value={totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}
                icon={CircleDollarSign}
                description="Total revenue collected from documents."
                color="green"
              />
          </div>
          <div className="animate-fade-in [--animation-delay:200ms] opacity-0">
              <StatCard
                title="Pending Payments"
                value={pendingPayments.toString()}
                icon={Banknote}
                description="Approved requests awaiting payment."
                color="orange"
              />
          </div>
        </div>
        <div className="text-center py-4">
            <Link href="/payments">
                <Button>
                    Go to Payments
                </Button>
            </Link>
        </div>
      </div>
    );
  }
  
  // Admin Dashboard (Fallback)
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        {barangayConfig?.sealLogoUrl && (
          <img src={barangayConfig.sealLogoUrl} alt="Barangay Seal" className="h-16 w-16 object-contain" />
        )}
        <h1 className="text-3xl font-bold font-headline tracking-tight">Admin Dashboard</h1>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="animate-fade-in [--animation-delay:100ms] opacity-0">
            <StatCard
              title="Total Residents"
              value={safeResidents.length.toString()}
              icon={Users}
              description="The total number of registered residents."
              color="purple"
            />
        </div>
        <div className="animate-fade-in [--animation-delay:200ms] opacity-0">
            <StatCard
              title="Approved Requests"
              value={approvedRequests.toString()}
              icon={FileText}
              description="Total documents approved this month."
              color="green"
            />
        </div>
        <div className="animate-fade-in [--animation-delay:300ms] opacity-0">
            <StatCard
              title="Total Revenue"
              value={totalRevenue.toLocaleString('en-US', { style: 'currency', currency: 'PHP' })}
              icon={CircleDollarSign}
              description="Total revenue collected this month."
              color="blue"
            />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-full lg:col-span-4">
          <RequestsChart />
        </div>
        <div className="col-span-full lg:col-span-3">
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
