'use client';

import { useAppContext } from "@/contexts/app-context";
import { useFirebase } from "@/firebase";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, FileText, Download, Calendar, Building2, FileSpreadsheet, Loader2, RefreshCw, Users, FileCheck, Clock, TrendingUp, Activity } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { Barangay, User, Resident, DocumentRequest } from "@/lib/types";
import * as XLSX from 'xlsx';

export default function SystemReportsPage() {
  const { currentUser } = useAppContext();
  const { firestore } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [selectedBarangay, setSelectedBarangay] = useState<string>('all');
  const [reportType, setReportType] = useState<string>('summary');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [liveStats, setLiveStats] = useState({
    totalBarangays: 0,
    totalUsers: 0,
    totalResidents: 0,
    totalRequests: 0,
    pendingRequests: 0,
    completedRequests: 0,
    todayRequests: 0,
  });
  
  const isSuperAdmin = currentUser?.isSuperAdmin === true;

  useEffect(() => {
    if (!isSuperAdmin || !firestore) return;
    loadData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isSuperAdmin, firestore]);

  const loadData = async () => {
    if (!firestore) return;
    try {
      await Promise.all([loadBarangays(), loadLiveStats()]);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadBarangays = async () => {
    if (!firestore) return;
    try {
      const snap = await getDocs(collection(firestore, 'barangays'));
      const data = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Barangay));
      setBarangays(data);
    } catch (error) {
      console.error('Error loading barangays:', error);
    }
  };

  const loadLiveStats = async () => {
    if (!firestore) return;
    setIsLoadingStats(true);
    try {
      const [barangaysSnap, usersSnap, residentsSnap, requestsSnap] = await Promise.all([
        getDocs(collection(firestore, 'barangays')),
        getDocs(collection(firestore, 'users')),
        getDocs(collection(firestore, 'residents')),
        getDocs(collection(firestore, 'documentRequests')),
      ]);

      const requests = requestsSnap.docs.map(doc => doc.data() as DocumentRequest);
      const today = new Date().toISOString().split('T')[0];
      const todayRequests = requests.filter(r => r.requestDate?.startsWith(today));

      setLiveStats({
        totalBarangays: barangaysSnap.size,
        totalUsers: usersSnap.size,
        totalResidents: residentsSnap.size,
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'Pending').length,
        completedRequests: requests.filter(r => r.status === 'Released').length,
        todayRequests: todayRequests.length,
      });
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading live stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const generateExcelReport = async () => {
    if (!firestore) return;
    
    setIsLoading(true);
    try {
      const [usersSnap, residentsSnap, requestsSnap] = await Promise.all([
        getDocs(collection(firestore, 'users')),
        getDocs(collection(firestore, 'residents')),
        getDocs(collection(firestore, 'documentRequests')),
      ]);

      const users = usersSnap.docs.map(doc => doc.data());
      const residents = residentsSnap.docs.map(doc => doc.data());
      const requests = requestsSnap.docs.map(doc => doc.data());

      // Filter by barangay if selected
      const filteredUsers = selectedBarangay === 'all' ? users : users.filter((u: any) => u.barangayId === selectedBarangay);
      const filteredResidents = selectedBarangay === 'all' ? residents : residents.filter((r: any) => r.barangayId === selectedBarangay);
      const filteredRequests = selectedBarangay === 'all' ? requests : requests.filter((r: any) => r.barangayId === selectedBarangay);

      const wb = XLSX.utils.book_new();

      if (reportType === 'summary' || reportType === 'all') {
        const summaryData = barangays.map(b => ({
          'Barangay': b.name,
          'Municipality': b.municipality,
          'Province': b.province,
          'Active': b.isActive ? 'Yes' : 'No',
          'Total Users': users.filter((u: any) => u.barangayId === b.id).length,
          'Total Residents': residents.filter((r: any) => r.barangayId === b.id).length,
          'Total Requests': requests.filter((r: any) => r.barangayId === b.id).length,
          'Pending': requests.filter((r: any) => r.barangayId === b.id && r.status === 'Pending').length,
          'Completed': requests.filter((r: any) => r.barangayId === b.id && r.status === 'Released').length,
        }));
        const ws = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws, 'Summary');
      }

      if (reportType === 'residents' || reportType === 'all') {
        const residentData = filteredResidents.map((r: any) => ({
          'Barangay': barangays.find(b => b.id === r.barangayId)?.name || r.barangayId,
          'First Name': r.firstName,
          'Last Name': r.lastName,
          'Email': r.email,
          'Purok': r.purok,
          'Household Number': r.householdNumber,
          'Birthdate': r.birthdate,
        }));
        const ws = XLSX.utils.json_to_sheet(residentData);
        XLSX.utils.book_append_sheet(wb, ws, 'Residents');
      }

      if (reportType === 'requests' || reportType === 'all') {
        const requestData = filteredRequests.map((r: any) => ({
          'Barangay': barangays.find(b => b.id === r.barangayId)?.name || r.barangayId,
          'Tracking Number': r.trackingNumber,
          'Resident': r.residentName,
          'Document Type': r.documentType,
          'Status': r.status,
          'Request Date': r.requestDate,
          'Amount': r.amount,
        }));
        const ws = XLSX.utils.json_to_sheet(requestData);
        XLSX.utils.book_append_sheet(wb, ws, 'Requests');
      }

      const fileName = `iBarangay_Report_${selectedBarangay}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast({
        title: "Report Generated",
        description: `${fileName} has been downloaded`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Access Denied</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>You don't have permission to access System Reports.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            System Reports
          </h1>
          <p className="text-muted-foreground">
            Generate and export cross-barangay reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoadingStats}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Live Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Barangays</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{liveStats.totalBarangays}</div>
            <p className="text-xs text-muted-foreground mt-1">Active in system</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{liveStats.totalResidents}</div>
            <p className="text-xs text-muted-foreground mt-1">{liveStats.totalUsers} users</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{liveStats.totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {liveStats.pendingRequests} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Requests</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{liveStats.todayRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {liveStats.completedRequests} completed total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2 border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle>Generate Report</CardTitle>
                <CardDescription>
                  Select report parameters and export to Excel
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="residents">Residents Report</SelectItem>
                  <SelectItem value="requests">Document Requests Report</SelectItem>
                  <SelectItem value="all">Complete Report (All Data)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Barangay</Label>
              <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Barangays</SelectItem>
                  {barangays.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateExcelReport} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Excel Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-500 hover:shadow-xl transition-all">
          <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle>Quick Reports</CardTitle>
                <CardDescription>Pre-configured reports</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setReportType('summary');
                setSelectedBarangay('all');
              }}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              System Summary
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setReportType('residents');
                setSelectedBarangay('all');
              }}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              All Residents
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                setReportType('requests');
                setSelectedBarangay('all');
              }}
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              All Requests
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-t-4 border-t-purple-500 hover:shadow-xl transition-all">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <FileSpreadsheet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle>Report Types</CardTitle>
                <CardDescription>Available report formats and contents</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                  Summary Report
                </h4>
                <p className="text-sm text-muted-foreground">
                  Overview of all barangays with key metrics: users, residents, requests, and completion rates.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Residents Report
                </h4>
                <p className="text-sm text-muted-foreground">
                  Detailed list of all residents with personal information and barangay assignment.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-primary" />
                  Document Requests Report
                </h4>
                <p className="text-sm text-muted-foreground">
                  Complete list of document requests with status, dates, and tracking information.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Complete Report
                </h4>
                <p className="text-sm text-muted-foreground">
                  All data in one file with multiple sheets for comprehensive analysis.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-orange-500 hover:shadow-xl transition-all">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle>Real-Time Monitoring</CardTitle>
                <CardDescription>Live system statistics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Pending Requests</span>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {liveStats.pendingRequests}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Completed Today</span>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {liveStats.todayRequests}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Completion Rate</span>
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {liveStats.totalRequests > 0 
                    ? Math.round((liveStats.completedRequests / liveStats.totalRequests) * 100)
                    : 0}%
                </Badge>
              </div>

              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  Auto-refreshes every 30 seconds
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
