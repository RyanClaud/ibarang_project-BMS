'use client';

import { useAppContext } from "@/contexts/app-context";
import { useFirebase } from "@/firebase";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  BarChart3,
  Users,
  FileText,
  Building2,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import type { Barangay, User, Resident, DocumentRequest } from "@/lib/types";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function SystemAnalyticsPage() {
  const { currentUser } = useAppContext();
  const { firestore } = useFirebase();
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalBarangays: 0,
    activeBarangays: 0,
    totalUsers: 0,
    totalResidents: 0,
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    releasedRequests: 0,
    rejectedRequests: 0,
    barangayPerformance: [] as any[],
    requestsByType: {} as Record<string, number>,
    usersByRole: {} as Record<string, number>,
  });

  // Prepare pie chart data
  const statusData = [
    { name: 'Pending', value: analytics.pendingRequests, color: '#f59e0b' },
    { name: 'Approved', value: analytics.approvedRequests, color: '#3b82f6' },
    { name: 'Released', value: analytics.releasedRequests, color: '#10b981' },
    { name: 'Rejected', value: analytics.rejectedRequests, color: '#ef4444' },
  ].filter(item => item.value > 0);

  const isSuperAdmin = currentUser?.isSuperAdmin === true;

  useEffect(() => {
    if (!isSuperAdmin || !firestore) return;
    loadAnalytics();
  }, [isSuperAdmin, firestore]);

  const loadAnalytics = async () => {
    if (!firestore) return;
    
    setIsLoading(true);
    try {
      // Load all data
      const [barangaysSnap, usersSnap, residentsSnap, requestsSnap] = await Promise.all([
        getDocs(collection(firestore, 'barangays')),
        getDocs(collection(firestore, 'users')),
        getDocs(collection(firestore, 'residents')),
        getDocs(collection(firestore, 'documentRequests')),
      ]);

      const barangays = barangaysSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Barangay));
      const users = usersSnap.docs.map(doc => doc.data() as User);
      const residents = residentsSnap.docs.map(doc => doc.data() as Resident);
      const requests = requestsSnap.docs.map(doc => doc.data() as DocumentRequest);

      // Calculate analytics
      const requestsByType: Record<string, number> = {};
      const usersByRole: Record<string, number> = {};
      
      requests.forEach(req => {
        requestsByType[req.documentType] = (requestsByType[req.documentType] || 0) + 1;
      });

      users.forEach(user => {
        usersByRole[user.role] = (usersByRole[user.role] || 0) + 1;
      });

      // Barangay performance
      const barangayPerformance = barangays.map(barangay => {
        const barangayRequests = requests.filter(r => r.barangayId === barangay.id);
        const barangayResidents = residents.filter(r => r.barangayId === barangay.id);
        
        return {
          name: barangay.name,
          residents: barangayResidents.length,
          requests: barangayRequests.length,
          pending: barangayRequests.filter(r => r.status === 'Pending').length,
          completed: barangayRequests.filter(r => r.status === 'Released').length,
          completionRate: barangayRequests.length > 0 
            ? Math.round((barangayRequests.filter(r => r.status === 'Released').length / barangayRequests.length) * 100)
            : 0,
        };
      });

      setAnalytics({
        totalBarangays: barangays.length,
        activeBarangays: barangays.filter(b => b.isActive).length,
        totalUsers: users.length,
        totalResidents: residents.length,
        totalRequests: requests.length,
        pendingRequests: requests.filter(r => r.status === 'Pending').length,
        approvedRequests: requests.filter(r => r.status === 'Approved').length,
        releasedRequests: requests.filter(r => r.status === 'Released').length,
        rejectedRequests: requests.filter(r => r.status === 'Rejected').length,
        barangayPerformance,
        requestsByType,
        usersByRole,
      });

    } catch (error) {
      console.error('Error loading analytics:', error);
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
              <p>You don't have permission to access System Analytics.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline tracking-tight">System Analytics</h1>
        <div className="grid gap-4 md:grid-cols-4">
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

  const completionRate = analytics.totalRequests > 0
    ? Math.round((analytics.releasedRequests / analytics.totalRequests) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          System Analytics
        </h1>
        <p className="text-muted-foreground">
          Cross-barangay analytics and insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-400">{analytics.totalRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.pendingRequests} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white dark:from-green-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700 dark:text-green-400">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.releasedRequests} completed
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Barangays</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{analytics.activeBarangays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              of {analytics.totalBarangays} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-white dark:from-orange-950 dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Residents</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Users className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400">{analytics.totalResidents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.totalUsers} users
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="barangays">Barangay Performance</TabsTrigger>
          <TabsTrigger value="documents">Document Types</TabsTrigger>
          <TabsTrigger value="users">User Distribution</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Request Status Distribution</CardTitle>
                    <CardDescription>Current status of all document requests</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {analytics.totalRequests === 0 ? (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No request data available</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-full h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: any) => [`${value} requests`, 'Count']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                        <span>Pending: {analytics.pendingRequests}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#3b82f6]"></div>
                        <span>Approved: {analytics.approvedRequests}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
                        <span>Released: {analytics.releasedRequests}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                        <span>Rejected: {analytics.rejectedRequests}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>System Health Metrics</CardTitle>
                    <CardDescription>Overall system performance indicators</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      {
                        name: 'Completion Rate',
                        value: completionRate,
                        fill: '#10b981'
                      },
                      {
                        name: 'Active Barangays',
                        value: analytics.totalBarangays > 0 ? Math.round((analytics.activeBarangays / analytics.totalBarangays) * 100) : 0,
                        fill: '#3b82f6'
                      },
                      {
                        name: 'Avg Residents',
                        value: analytics.totalBarangays > 0 ? Math.min(Math.round(analytics.totalResidents / analytics.totalBarangays), 100) : 0,
                        fill: '#8b5cf6'
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Barangay Performance Tab */}
        <TabsContent value="barangays" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-t-4 border-t-purple-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>Barangay Requests Comparison</CardTitle>
                    <CardDescription>Total requests per barangay</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={analytics.barangayPerformance.slice(0, 10)}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={90} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="requests" fill="#3b82f6" name="Total Requests" />
                    <Bar dataKey="completed" fill="#10b981" name="Completed" />
                    <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>Completion Rate by Barangay</CardTitle>
                    <CardDescription>Performance efficiency comparison</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={analytics.barangayPerformance
                      .sort((a, b) => b.completionRate - a.completionRate)
                      .slice(0, 10)}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" width={90} />
                    <Tooltip />
                    <Bar dataKey="completionRate" fill="#10b981" name="Completion Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Residents Distribution</CardTitle>
                  <CardDescription>Number of residents per barangay</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.barangayPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="residents" stroke="#8b5cf6" strokeWidth={2} name="Residents" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Types Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-t-4 border-t-orange-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <CardTitle>Document Request Types</CardTitle>
                    <CardDescription>Distribution of document types requested</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.requestsByType)
                        .sort(([, a], [, b]) => b - a)
                        .map(([type, count]) => ({ name: type, value: count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name.substring(0, 15)} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(analytics.requestsByType).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Document Type Breakdown</CardTitle>
                    <CardDescription>Request count by document type</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={Object.entries(analytics.requestsByType)
                      .sort(([, a], [, b]) => b - a)
                      .map(([type, count]) => ({ name: type, count }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-t-4 border-t-purple-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <CardTitle>User Role Distribution</CardTitle>
                    <CardDescription>Users by role across all barangays</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.usersByRole)
                        .sort(([, a], [, b]) => b - a)
                        .map(([role, count]) => ({ name: role, value: count }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(analytics.usersByRole).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>User Count by Role</CardTitle>
                    <CardDescription>Total users in each role</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(analytics.usersByRole)
                      .sort(([, a], [, b]) => b - a)
                      .map(([role, count]) => ({ name: role, count }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>System Overview</CardTitle>
                  <CardDescription>Total users and residents across the system</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart
                  data={[
                    { category: 'Total Users', count: analytics.totalUsers, fill: '#3b82f6' },
                    { category: 'Total Residents', count: analytics.totalResidents, fill: '#10b981' },
                    { category: 'Active Barangays', count: analytics.activeBarangays, fill: '#8b5cf6' },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
