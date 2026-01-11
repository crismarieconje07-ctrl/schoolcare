
"use client";

import { useState } from "react";
import { collectionGroup, orderBy, query } from "firebase/firestore";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { Report, Status } from "@/lib/types";
import { STATUSES } from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";
import ReportCard from "./report-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const firestore = useFirestore();
  const [activeTab, setActiveTab] = useState<Status>("Pending");

  const reportsQuery = useMemoFirebase(() => {
    return query(collectionGroup(firestore, "reports"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: reports, isLoading } = useCollection<Report>(reportsQuery);

  const reportsByStatus = (status: Status) => {
    return reports?.filter((report) => report.status === status) || [];
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Status)} className="flex flex-col flex-1 min-h-0">
        <TabsList className="grid w-full grid-cols-3">
          {STATUSES.map((statusInfo) => (
            <TabsTrigger key={statusInfo.value} value={statusInfo.value}>
              {statusInfo.label} ({reportsByStatus(statusInfo.value).length})
            </TabsTrigger>
          ))}
        </TabsList>
        {STATUSES.map((statusInfo) => (
          <TabsContent key={statusInfo.value} value={statusInfo.value} className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-4">
                {reportsByStatus(statusInfo.value).length > 0 ? (
                  reportsByStatus(statusInfo.value).map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center pt-8">
                    No reports in this status.
                  </p>
                )}
              </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
