"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { Report } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PRIORITIES, STATUSES } from '@/lib/constants';
import { updateReport } from '@/lib/actions';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface EditReportDialogProps {
  report: Report;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const formSchema = z.object({
  status: z.enum(STATUSES.map(s => s.value) as [string, ...string[]]),
  priority: z.enum(PRIORITIES.map(p => p.value) as [string, ...string[]]),
  internalNotes: z.string().optional(),
});

const EditReportDialog = ({ report, isOpen, setIsOpen }: EditReportDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: report.status,
      priority: report.priority,
      internalNotes: report.internalNotes || '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const result = await updateReport({
        reportId: report.id,
        userId: report.userId,
        ...values,
    });
    setIsSubmitting(false);

    if (result.success) {
      toast({ title: "Report Updated", description: "The report details have been saved." });
      setIsOpen(false);
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: result.error });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Report</DialogTitle>
          <DialogDescription>Update the status, priority, and notes for this report.</DialogDescription>
        </DialogHeader>
        <div className="text-sm">
            <p><strong>Room:</strong> {report.roomNumber}</p>
            <p><strong>Description:</strong> {report.description}</p>
            {report.imageUrl && (
              <div className="mt-2 relative w-full aspect-video rounded-md overflow-hidden">
                <Image src={report.imageUrl} alt="Report image" fill objectFit="cover" />
              </div>
            )}
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
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
              name="internalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add notes for the maintenance team..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditReportDialog;
