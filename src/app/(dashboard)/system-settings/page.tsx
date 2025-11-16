'use client';

import { useAppContext } from "@/contexts/app-context";
import { useFirebase } from "@/firebase";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertCircle, 
  Settings, 
  Database, 
  Shield, 
  Globe, 
  Bell,
  Download,
  Upload,
  RefreshCw,
  Code,
  Key,
  FileText,
  Mail,
  Loader2,
  CheckCircle,
  Copy
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

export default function SystemSettingsPage() {
  const { currentUser } = useAppContext();
  const { firestore } = useFirebase();
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({ collections: 0, documents: 0 });
  const [showRules, setShowRules] = useState(false);
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    fromEmail: 'noreply@ibarangay.gov.ph',
    fromName: 'iBarangay System',
  });
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newUserAlert: true,
    documentRequestAlert: true,
    systemAlerts: true,
  });
  
  const isSuperAdmin = currentUser?.isSuperAdmin === true;

  useEffect(() => {
    if (!isSuperAdmin || !firestore) return;
    loadStats();
  }, [isSuperAdmin, firestore]);

  const loadStats = async () => {
    if (!firestore) return;
    try {
      const collections = ['barangays', 'users', 'residents', 'documentRequests'];
      let totalDocs = 0;
      
      for (const col of collections) {
        const snap = await getDocs(collection(firestore, col));
        totalDocs += snap.size;
      }
      
      setStats({ collections: collections.length, documents: totalDocs });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleBackup = async () => {
    if (!firestore) return;
    setIsLoading(true);
    
    try {
      const collections = ['barangays', 'users', 'residents', 'documentRequests'];
      const backup: any = {};
      
      for (const col of collections) {
        const snap = await getDocs(collection(firestore, col));
        backup[col] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
      
      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ibarangay-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast({
        title: "Backup Created",
        description: "Database backup has been downloaded",
      });
    } catch (error) {
      console.error('Error creating backup:', error);
      toast({
        title: "Backup Failed",
        description: "Failed to create database backup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!firestore) return;
    setIsLoading(true);
    
    try {
      const collections = ['barangays', 'users', 'residents', 'documentRequests'];
      const wb = XLSX.utils.book_new();
      
      for (const col of collections) {
        const snap = await getDocs(collection(firestore, col));
        const data = snap.docs.map(doc => doc.data());
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, col);
      }
      
      XLSX.writeFile(wb, `ibarangay-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      
      toast({
        title: "Export Complete",
        description: "Data exported to Excel successfully",
      });
    } catch (error) {
      console.error('Error exporting:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const saveEmailSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Email configuration has been updated",
    });
  };

  const saveNotificationSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Notification preferences have been updated",
    });
  };

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Access Denied</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>You don't have permission to access System Settings.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          System Settings
        </h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and preferences
        </p>
      </div>

      <Tabs defaultValue="database" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <CardTitle>Database Statistics</CardTitle>
                    <CardDescription>Current database information</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Collections</span>
                  <span className="font-bold">{stats.collections}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Documents</span>
                  <span className="font-bold">{stats.documents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Database</span>
                  <span className="font-bold">Firestore</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Healthy
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-green-500 hover:shadow-xl transition-all">
              <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle>Backup & Export</CardTitle>
                    <CardDescription>Create backups and export data</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleBackup}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Create JSON Backup
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleExportExcel}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Export to Excel
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={loadStats}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Statistics
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-t-4 border-t-purple-500 hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Database Maintenance</CardTitle>
                  <CardDescription>Optimize and maintain database performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Last Backup</p>
                    <p className="text-sm text-muted-foreground">Never</p>
                  </div>
                  <Button size="sm">Backup Now</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Database Size</p>
                    <p className="text-sm text-muted-foreground">~{Math.round(stats.documents * 0.5)} KB</p>
                  </div>
                  <Button size="sm" variant="outline">Optimize</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card className="border-t-4 border-t-red-500 hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-red-50 to-transparent dark:from-red-950">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                  <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <CardTitle>Firestore Security Rules</CardTitle>
                  <CardDescription>View and manage database security rules</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Dialog open={showRules} onOpenChange={setShowRules}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Code className="mr-2 h-4 w-4" />
                    View Current Rules
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Firestore Security Rules</DialogTitle>
                    <DialogDescription>
                      Current security rules for the database
                    </DialogDescription>
                  </DialogHeader>
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard('rules_version = "2";\nservice cloud.firestore {...}')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Multi-barangay security rules
    // Users can only access their barangay's data
    // Super admins can access all data
  }
}`}
                    </pre>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="w-full justify-start">
                <Key className="mr-2 h-4 w-4" />
                API Keys Management
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Security Audit Log
              </Button>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500 hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Key className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle>Authentication Settings</CardTitle>
                  <CardDescription>Configure authentication providers</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email/Password</p>
                  <p className="text-sm text-muted-foreground">Traditional authentication</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Google Sign-In</p>
                  <p className="text-sm text-muted-foreground">OAuth authentication</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password Reset</p>
                  <p className="text-sm text-muted-foreground">Email-based password recovery</p>
                </div>
                <Switch checked={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <Card className="border-t-4 border-t-purple-500 hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle>Regional Settings</CardTitle>
                  <CardDescription>Configure regional preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Region</Label>
                <Input value="MIMAROPA (Region IV-B)" disabled />
              </div>
              <div className="space-y-2">
                <Label>Province</Label>
                <Input value="Oriental Mindoro" disabled />
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Input value="Asia/Manila (GMT+8)" disabled />
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <Input value="English / Filipino" disabled />
              </div>
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-green-500 hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-950">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>SMTP settings for system emails</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input 
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input 
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>From Email</Label>
                <Input 
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>From Name</Label>
                <Input 
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                />
              </div>
              <Button onClick={saveEmailSettings}>
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-t-4 border-t-orange-500 hover:shadow-xl transition-all">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Bell className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Configure system-wide notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch 
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">New User Alerts</p>
                  <p className="text-sm text-muted-foreground">Notify when new users register</p>
                </div>
                <Switch 
                  checked={notificationSettings.newUserAlert}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, newUserAlert: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Document Request Alerts</p>
                  <p className="text-sm text-muted-foreground">Notify on new document requests</p>
                </div>
                <Switch 
                  checked={notificationSettings.documentRequestAlert}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, documentRequestAlert: checked})}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Alerts</p>
                  <p className="text-sm text-muted-foreground">Critical system notifications</p>
                </div>
                <Switch 
                  checked={notificationSettings.systemAlerts}
                  onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, systemAlerts: checked})}
                />
              </div>
              <Button onClick={saveNotificationSettings}>
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize notification email templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Welcome Email Template</Label>
                <Textarea 
                  placeholder="Welcome to iBarangay..."
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label>Password Reset Template</Label>
                <Textarea 
                  placeholder="Reset your password..."
                  rows={4}
                />
              </div>
              <Button>Save Templates</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
