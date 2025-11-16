'use client';

import { useAppContext } from "@/contexts/app-context";
import { useFirebase } from "@/firebase";
import { useState, useEffect } from "react";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Shield,
  Settings,
  Database,
  Globe,
  Upload
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Barangay, User, Resident, DocumentRequest } from "@/lib/types";

interface BarangayStats {
  id: string;
  name: string;
  totalUsers: number;
  totalResidents: number;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  releasedRequests: number;
  isActive: boolean;
}

export default function SuperAdminDashboard() {
  const { currentUser } = useAppContext();
  const { firestore } = useFirebase();
  const router = useRouter();
  
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [barangayStats, setBarangayStats] = useState<BarangayStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemStats, setSystemStats] = useState({
    totalBarangays: 0,
    activeBarangays: 0,
    totalUsers: 0,
    totalResidents: 0,
    totalRequests: 0,
    pendingRequests: 0,
  });

  // Check if user is super admin
  const isSuperAdmin = currentUser?.isSuperAdmin === true;

  // Filter barangays based on search query
  const filteredBarangayStats = barangayStats.filter(stat => 
    stat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isSuperAdmin || !firestore) return;
    loadDashboardData();
  }, [isSuperAdmin, firestore]);

  const loadDashboardData = async () => {
    if (!firestore) return;
    
    setIsLoading(true);
    try {
      // Load all barangays
      const barangaysSnap = await getDocs(collection(firestore, 'barangays'));
      const barangaysData = barangaysSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Barangay));
      setBarangays(barangaysData);

      // Load all users
      const usersSnap = await getDocs(collection(firestore, 'users'));
      const allUsers = usersSnap.docs.map(doc => doc.data() as User);

      // Load all residents
      const residentsSnap = await getDocs(collection(firestore, 'residents'));
      const allResidents = residentsSnap.docs.map(doc => doc.data() as Resident);

      // Load all document requests
      const requestsSnap = await getDocs(collection(firestore, 'documentRequests'));
      const allRequests = requestsSnap.docs.map(doc => doc.data() as DocumentRequest);

      // Calculate stats per barangay
      const stats: BarangayStats[] = barangaysData.map(barangay => {
        const barangayUsers = allUsers.filter(u => u.barangayId === barangay.id);
        const barangayResidents = allResidents.filter(r => r.barangayId === barangay.id);
        const barangayRequests = allRequests.filter(r => r.barangayId === barangay.id);

        return {
          id: barangay.id,
          name: barangay.name,
          totalUsers: barangayUsers.length,
          totalResidents: barangayResidents.length,
          totalRequests: barangayRequests.length,
          pendingRequests: barangayRequests.filter(r => r.status === 'Pending').length,
          approvedRequests: barangayRequests.filter(r => r.status === 'Approved').length,
          releasedRequests: barangayRequests.filter(r => r.status === 'Released').length,
          isActive: barangay.isActive,
        };
      });
      setBarangayStats(stats);

      // Calculate system-wide stats
      setSystemStats({
        totalBarangays: barangaysData.length,
        activeBarangays: barangaysData.filter(b => b.isActive).length,
        totalUsers: allUsers.length,
        totalResidents: allResidents.length,
        totalRequests: allRequests.length,
        pendingRequests: allRequests.filter(r => r.status === 'Pending').length,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
              <p>You don't have permission to access the Super Admin Dashboard.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Super Admin Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-20 animate-pulse bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            System-wide overview and management
          </p>
        </div>
        <Button onClick={() => router.push('/barangays')}>
          <Building2 className="mr-2 h-4 w-4" />
          Manage Barangays
        </Button>
      </div>

      {/* System-Wide Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Barangays</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{systemStats.totalBarangays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemStats.activeBarangays} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all barangays
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{systemStats.totalResidents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered residents
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Document Requests</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{systemStats.totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemStats.pendingRequests} pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="barangays">Barangays</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Quick Actions */}
            <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common administrative tasks</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/barangays/import')}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Import Barangays (CSV)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/barangays')}
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  Manage Barangays
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/residents')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  View All Residents
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/documents')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View All Requests
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push('/reports')}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Generate Reports
                </Button>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="border-t-4 border-t-green-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>System Health</CardTitle>
                    <CardDescription>Current system status</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Database</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Authentication</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Storage</span>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Active Barangays</span>
                  </div>
                  <Badge variant="outline">
                    {systemStats.activeBarangays}/{systemStats.totalBarangays}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="border-t-4 border-t-purple-500 hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Barangay Performance</CardTitle>
                  <CardDescription>Overview of all barangays</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {barangayStats.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No barangays found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {barangayStats.slice(0, 5).map(stat => (
                    <div 
                      key={stat.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                      onClick={() => router.push('/barangays')}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`p-2 rounded-full transition-all ${stat.isActive ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <Building2 className={`h-5 w-5 ${stat.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold group-hover:text-primary transition-colors">{stat.name}</p>
                            <Badge variant={stat.isActive ? "default" : "secondary"} className="text-xs">
                              {stat.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {stat.totalResidents} residents • {stat.totalUsers} users
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stat.totalRequests}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{stat.pendingRequests}</p>
                          <p className="text-xs text-muted-foreground">Pending</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {stat.totalRequests > 0 
                              ? Math.round(((stat.totalRequests - stat.pendingRequests) / stat.totalRequests) * 100)
                              : 0}%
                          </p>
                          <p className="text-xs text-muted-foreground">Complete</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {barangayStats.length > 5 && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push('/barangays')}
                    >
                      View All {barangayStats.length} Barangays
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Barangays Tab */}
        <TabsContent value="barangays" className="space-y-4">
          <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>All Barangays</CardTitle>
                    <CardDescription>Manage and monitor all barangays in the system</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search barangays..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
                    />
                    <svg
                      className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredBarangayStats.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No barangays found matching your search.' : 'No barangays available.'}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBarangayStats.map(stat => (
                  <Card key={stat.id} className="relative overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{stat.name}</CardTitle>
                          <Badge 
                            variant={stat.isActive ? "default" : "secondary"}
                            className="mt-2"
                          >
                            {stat.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <Building2 className="h-8 w-8 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Users</p>
                          <p className="font-semibold">{stat.totalUsers}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Residents</p>
                          <p className="font-semibold">{stat.totalResidents}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Requests</p>
                          <p className="font-semibold">{stat.totalRequests}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pending</p>
                          <p className="font-semibold text-orange-600">{stat.pendingRequests}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => router.push('/barangays')}
                      >
                        Manage
                      </Button>
                    </CardContent>
                  </Card>
                ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-t-4 border-t-green-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>Document Request Trends</CardTitle>
                    <CardDescription>System-wide request statistics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Requests</span>
                    <span className="font-bold">{systemStats.totalRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pending</span>
                    <span className="font-bold text-orange-600">{systemStats.pendingRequests}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Completion Rate</span>
                    <span className="font-bold text-green-600">
                      {systemStats.totalRequests > 0 
                        ? Math.round(((systemStats.totalRequests - systemStats.pendingRequests) / systemStats.totalRequests) * 100)
                        : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-purple-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>User Distribution</CardTitle>
                    <CardDescription>Users across all barangays</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Users</span>
                    <span className="font-bold">{systemStats.totalUsers}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Residents</span>
                    <span className="font-bold">{systemStats.totalResidents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg per Barangay</span>
                    <span className="font-bold">
                      {systemStats.totalBarangays > 0 
                        ? Math.round(systemStats.totalResidents / systemStats.totalBarangays)
                        : 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Settings className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>System Information</CardTitle>
                    <CardDescription>Platform details and configuration</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Platform</span>
                  <span className="text-sm font-medium">iBarangay v2.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Environment</span>
                  <Badge variant="outline">Production</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Database</span>
                  <span className="text-sm font-medium">Firestore</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Region</span>
                  <span className="text-sm font-medium">MIMAROPA</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-orange-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Database className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle>Administrative Tools</CardTitle>
                    <CardDescription>System management utilities</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Database className="mr-2 h-4 w-4" />
                  Database Backup
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  System Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="mr-2 h-4 w-4" />
                  API Configuration
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
