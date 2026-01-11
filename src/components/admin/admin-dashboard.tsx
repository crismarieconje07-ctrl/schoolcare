"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Report, Status } from "@/lib/types";
import { STATUSES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import ReportCard from "./report-card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const AdminDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reportsData: Report[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        reportsData.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        } as Report);
      });
      setReports(reportsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const reportsByStatus = (status: Status) => {
    return reports.filter((report) => report.status === status);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-[500px] rounded-lg" />
        <Skeleton className="h-[500px] rounded-lg" />
        <Skeleton className="h-[500px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {STATUSES.map((statusInfo) => (
                <div key={statusInfo.value} className="bg-muted/50 rounded-lg flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-lg font-semibold font-headline flex items-center gap-2">
                            <statusInfo.icon className="h-5 w-5" />
                            {statusInfo.label} ({reportsByStatus(statusInfo.value).length})
                        </h2>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {reportsByStatus(statusInfo.value).length > 0 ? (
                                reportsByStatus(statusInfo.value).map((report) => (
                                    <ReportCard key={report.id} report={report} />
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center pt-4">No reports in this status.</p>
                            )}
                        </div>
                        <ScrollBar orientation="vertical" />
                    </ScrollArea>
                </div>
            ))}
        </div>
    </div>
  );
};

export default AdminDashboard;
