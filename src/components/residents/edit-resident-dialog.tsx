'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription as FormHelperText,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, User, Mail, MapPin, Home, Hash } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Resident } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const residentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  purok: z.string().min(1, 'Purok / Sitio is required'),
  birthdate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format. Please use MM-dd-yyyy.',
  }),
  householdNumber: z.string().min(1, 'Household number is required'),
});

type ResidentFormData = z.infer<typeof residentSchema>;

interface EditResidentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateResident: (residentId: string, dataToUpdate: Partial<Resident>) => void;
  resident: Resident;
}

export function EditResidentDialog({ isOpen, onClose, onUpdateResident, resident }: EditResidentDialogProps) {
  const form = useForm<ResidentFormData>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      purok: '',
      birthdate: '',
      householdNumber: '',
    },
  });

  useEffect(() => {
    if (resident) {
      form.reset({
        firstName: resident.firstName,
        lastName: resident.lastName,
        email: resident.email,
        purok: resident.purok,
        birthdate: resident.birthdate,
        householdNumber: resident.householdNumber,
      });
    }
  }, [resident, form]);

  const onSubmit = (data: ResidentFormData) => {
    const dataToUpdate: Partial<Resident> = {
      ...data,
      address: `${data.purok}, Brgy. Mina De Oro, Bongabong, Oriental Mindoro`,
    }
    onUpdateResident(resident.id, dataToUpdate);
    toast({
        title: 'Resident Updated',
        description: `${data.firstName} ${data.lastName}'s information has been updated.`,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-purple-50 to-transparent dark:from-purple-950 p-6 -m-6 mb-0">
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <User className="h-6 w-6 text-purple-600" />
            Edit Resident Information
          </DialogTitle>
          <DialogDescription className="text-base">
            Update the resident's details below. All changes will be saved to the system.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-purple-600" />
                Personal Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-600" />
                        First Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Juan" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-600" />
                        Last Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Dela Cruz" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-purple-600" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="juan.cruz@example.com" 
                        className="h-11 bg-muted" 
                        {...field} 
                        disabled 
                      />
                    </FormControl>
                    <FormHelperText className="text-xs bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded p-2">
                      <strong>⚠️ Security:</strong> Email addresses cannot be changed for security reasons. 
                      To update a login email, the user account must be re-created.
                    </FormHelperText>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birthdate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-purple-600" />
                      Date of Birth
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input placeholder="MM-dd-yyyy" className="h-11" {...field} />
                      </FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-0 top-0 h-11 hover:bg-purple-100 dark:hover:bg-purple-900"
                          >
                            <CalendarIcon className="h-4 w-4 text-purple-600" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown-nav"
                            fromYear={new Date().getFullYear() - 100}
                            toYear={new Date().getFullYear()}
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, 'MM-dd-yyyy') : '')}
                            disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Location Information Section */}
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
                        <Input placeholder="HH-001" className="h-11" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline" size="lg">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" size="lg" className="bg-purple-600 hover:bg-purple-700">
                <User className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
