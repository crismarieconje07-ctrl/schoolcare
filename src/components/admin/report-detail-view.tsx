
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import type { Report } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Image from "next/image";
import { User, MapPin, Calendar, Tag, FileText, StickyNote, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PRIORITIES, STATUSES } from '@/lib/constants';
import { useState, useEffect } from 'react';
import { db } from '@/firebase/client';

interface ReportDetailProps {
  userId: string;
  reportId: string;
}

const formSchema = z.object({
  status: z.enum(STATUSES.map(s => s.value) as [string, ...string[]]),
  priority: z.enum(PRIORITIES.map(p => p.value) as [string, ...string[]]),
  internalNotes: z.string().optional(),
});

const ReportDetail = ({ userId, reportId }: ReportDetailProps) => {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportRef = useMemoFirebase(() => {
    if (!firestore || !userId || !reportId) return null;
    return doc(firestore, "users", userId, "reports", reportId);
  }, [firestore, userId, reportId]);
  
  const { data: report, isLoading } = useDoc<Report>(reportRef);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'Pending',
      priority: 'Low',
      internalNotes: '',
    },
  });

  useEffect(() => {
    if (report) {
      form.reset({
        status: report.status,
        priority: report.priority,
        internalNotes: report.internalNotes || '',
      });
    }
  }, [report, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!reportRef) return;
    setIsSubmitting(true);
    
    try {
        await updateDoc(reportRef, {
            ...values,
            updatedAt: serverTimestamp(),
        });
        toast({ title: "Report Updated", description: "The report details have been saved." });
    } catch (error: any) {
        toast({ variant: "destructive", title: "Update Failed", description: error.message });
    }

    setIsSubmitting(false);
  }


  if (isLoading) {
    return <ReportDetailSkeleton />;
  }

  if (!report) {
    return <p className="text-center text-muted-foreground">Report not found.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold font-headline">Report Details</CardTitle>
        <CardDescription>Review and manage the submitted issue.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <InfoSection icon={Tag} label="Category" value={report.category} />
                    <InfoSection icon={MapPin} label="Room" value={report.roomNumber} />
                    <InfoSection icon={User} label="Reported By" value={report.userDisplayName} />
                    <InfoSection icon={Calendar} label="Date" value={report.createdAt ? format(report.createdAt.toDate(), "PPPp") : 'N/A'} />
                </div>

                {report.imageUrl && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Tag className="h-4 w-4" /> Photo
                        </h3>
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                            <Image src={report.imageUrl} alt="Report image" fill className="object-cover" />
                        </div>
                    </div>
                )}
                
                <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Description
                    </h3>
                    <p className="text-base">{report.description}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                
                <FormField
                    control={form.control}
                    name="internalNotes"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="flex items-center gap-2"><StickyNote className="h-4 w-4" />Internal Notes</FormLabel>
                        <FormControl>
                            <Textarea placeholder="Add notes for the maintenance team..." {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const InfoSection = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="space-y-1">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {label}
        </h3>
        <p className="text-base font-medium">{value}</p>
    </div>
);


const ReportDetailSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="w-full aspect-video rounded-lg" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-32" />
        </CardContent>
    </Card>
);

export default ReportDetail;
