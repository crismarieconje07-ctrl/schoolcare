"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import type { Report } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import Image from "next/image";
import {
  User,
  MapPin,
  Calendar,
  Tag,
  FileText,
  StickyNote,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { PRIORITIES, STATUSES } from "@/lib/constants";
import { useEffect, useState } from "react";
import { db } from "@/firebase/client";

interface ReportDetailProps {
  userId: string;
  reportId: string;
}

const formSchema = z.object({
  status: z.enum(STATUSES.map((s) => s.value) as [string, ...string[]]),
  priority: z.enum(PRIORITIES.map((p) => p.value) as [string, ...string[]]),
  internalNotes: z.string().optional(),
});

const ReportDetail = ({ userId, reportId }: ReportDetailProps) => {
  const { toast } = useToast();
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const ref = doc(db, "users", userId, "reports", reportId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as Report;
          setReport(data);
          form.reset({
            status: data.status,
            priority: data.priority,
            internalNotes: data.internalNotes || "",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [userId, reportId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!report) return;

    setIsSubmitting(true);
    try {
      await updateDoc(
        doc(db, "users", userId, "reports", reportId),
        {
          ...values,
          updatedAt: serverTimestamp(),
        }
      );
      toast({
        title: "Report Updated",
        description: "The report details have been saved.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) return <ReportDetailSkeleton />;
  if (!report)
    return (
      <p className="text-center text-muted-foreground">Report not found.</p>
    );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Report Details
        </CardTitle>
        <CardDescription>
          Review and manage the submitted issue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <InfoSection icon={Tag} label="Category" value={report.category} />
              <InfoSection
                icon={MapPin}
                label="Room"
                value={report.roomNumber}
              />
              <InfoSection
                icon={User}
                label="Reported By"
                value={report.userDisplayName}
              />
              <InfoSection
                icon={Calendar}
                label="Date"
                value={
                  report.createdAt
                    ? format(report.createdAt.toDate(), "PPPp")
                    : "N/A"
                }
              />
            </div>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

const InfoSection = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) => (

  <div className="space-y-1">
    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
      <Icon className="h-4 w-4" />
      {label}
    </h3>
    <p className="text-base font-medium">{value ?? "N/A"}</p>
  </div>
);

const ReportDetailSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64 mt-1" />
    </CardHeader>
    <CardContent className="space-y-8">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
);

export default ReportDetail;
