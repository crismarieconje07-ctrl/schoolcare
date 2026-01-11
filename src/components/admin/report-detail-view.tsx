
"use client";

import { useState } from 'react';
import { doc } from "firebase/firestore";
import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import type { Report } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Image from "next/image";
import { StatusBadge } from '../shared/status-badge';
import { PriorityBadge } from '../shared/priority-badge';
import { User, MapPin, Calendar, Tag, FileText, StickyNote, Edit } from 'lucide-react';
import EditReportDialog from './edit-report-dialog';
import { Button } from '../ui/button';

interface ReportDetailProps {
  userId: string;
  reportId: string;
}

const ReportDetail = ({ userId, reportId }: ReportDetailProps) => {
  const firestore = useFirestore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const reportRef = useMemoFirebase(() => {
    if (!firestore || !userId || !reportId) return null;
    return doc(firestore, "users", userId, "reports", reportId);
  }, [firestore, userId, reportId]);
  
  const { data: report, isLoading } = useDoc<Report>(reportRef);

  if (isLoading) {
    return <ReportDetailSkeleton />;
  }

  if (!report) {
    return <p className="text-center text-muted-foreground">Report not found.</p>;
  }

  return (
    <>
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold font-headline">Report Details</CardTitle>
                    <CardDescription>Review and manage the submitted issue.</CardDescription>
                </div>
                <Button onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4"/>
                    Edit Report
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                {report.imageUrl && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border">
                        <Image src={report.imageUrl} alt="Report image" fill className="object-cover" />
                    </div>
                )}
                
                <div className="grid md:grid-cols-2 gap-6">
                    <InfoSection icon={User} label="Submitted By" value={report.userDisplayName} />
                    <InfoSection icon={MapPin} label="Location" value={`Room ${report.roomNumber}`} />
                    <InfoSection icon={Calendar} label="Reported On" value={report.createdAt ? format(report.createdAt.toDate(), "PPPp") : 'N/A'} />
                    <InfoSection icon={Tag} label="Category" value={report.category} />
                    
                    <div className="flex items-start gap-3">
                        <StatusBadge status={report.status} className="mt-1" />
                    </div>
                    <div className="flex items-start gap-3">
                        <PriorityBadge priority={report.priority} className="mt-1" />
                    </div>

                    <div className="md:col-span-2">
                        <InfoSection icon={FileText} label="Full Description" value={report.description} isBlock />
                    </div>
                    
                    {report.internalNotes && (
                        <div className="md:col-span-2">
                            <InfoSection icon={StickyNote} label="Internal Notes" value={report.internalNotes} isBlock />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
        <EditReportDialog report={report} isOpen={isEditDialogOpen} setIsOpen={setIsEditDialogOpen} />
    </>
  );
};

const InfoSection = ({ icon: Icon, label, value, isBlock = false }: { icon: React.ElementType, label: string, value: string, isBlock?: boolean }) => (
    <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        </div>
        <p className={isBlock ? "text-base pl-6" : "text-base font-medium pl-6"}>{value}</p>
    </div>
);


const ReportDetailSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-6">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <div className="grid md:grid-cols-2 gap-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
                <div className="md:col-span-2">
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export default ReportDetail;
