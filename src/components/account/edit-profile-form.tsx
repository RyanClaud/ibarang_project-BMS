'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/app-context';
import { useMemo } from 'react';
import { Loader2, User, Mail, MapPin, Home, Hash, Calendar } from 'lucide-react';
import type { Resident } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';


const profileSchema = z.object({
  purok: z.string().min(1, 'Purok / Sitio is required'),
  householdNumber: z.string().min(1, 'Household number is required'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function EditProfileForm() {
  const { currentUser, residents, updateResident } = useAppContext();
  const [isSaving, setIsSaving] = useState(false);

  const resident = useMemo(() => {
    if (currentUser?.residentId && residents) {
      return residents.find(res => res.id === currentUser.residentId);
    }
    return null;
  }, [currentUser, residents]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      purok: '',
      householdNumber: '',
    },
  });

  useEffect(() => {
    if (resident) {
      form.reset({
        purok: resident.purok,
        householdNumber: resident.householdNumber,
      });
    }
  }, [resident, form]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!resident) {
        toast({ title: "Error", description: "Resident profile not found.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
      const dataToUpdate: Partial<Resident> = { 
        ...data,
        address: `${data.purok}, Brgy. Mina De Oro, Bongabong, Oriental Mindoro`,
      };

      await updateResident(resident.id, dataToUpdate);
      toast({
        title: 'Profile Updated',
        description: 'Your personal information has been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to Update Profile',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
        setIsSaving(false);
    }
  };
  
  if (!resident) {
    return (
        <Card className="border-t-4 border-t-purple-500">
            <CardHeader>
                <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center items-center p-8">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="border-t-4 border-t-purple-500 hover:shadow-xl transition-all">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <User className="h-6 w-6 text-purple-600" />
              Edit Profile
            </CardTitle>
            <CardDescription className="text-base">
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Profile Header with Avatar */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border-2 border-purple-200 dark:border-purple-800">
              <Avatar className="h-20 w-20 border-4 border-purple-300 dark:border-purple-700">
                <AvatarImage src={resident.avatarUrl || undefined} alt={resident.firstName} />
                <AvatarFallback className="bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-300 text-2xl font-bold">
                  {resident.firstName?.[0]}
                  {resident.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{resident.firstName} {resident.lastName}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  {resident.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  User ID: <span className="font-mono font-semibold">{resident.userId}</span>
                </p>
              </div>
            </div>

            <Separator />

            {/* Editable Fields Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-purple-600" />
                Location Information
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="purok"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-purple-600" />
                        Purok / Sitio
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Purok 1, Sitio Riverside" 
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="householdNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-purple-600" />
                        Household Number
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., HH-001" 
                          className="h-11"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Read-Only Information */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Personal Information
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </label>
                  <div className="p-3 bg-muted rounded-lg border">
                    <p className="font-semibold">{resident.firstName} {resident.lastName}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <div className="p-3 bg-muted rounded-lg border">
                    <p className="font-semibold text-sm">{resident.email}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date of Birth
                  </label>
                  <div className="p-3 bg-muted rounded-lg border">
                    <p className="font-semibold">{resident.birthdate}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Complete Address
                  </label>
                  <div className="p-3 bg-muted rounded-lg border">
                    <p className="font-semibold text-sm">{resident.address}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>ℹ️ Note:</strong> Your name, email, birthdate, and full address cannot be changed here. 
                  Please contact your barangay administrator for assistance with these fields.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/50 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Changes will be saved immediately
            </p>
            <Button 
              type="submit" 
              disabled={isSaving}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
