
"use client";

import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import type { Report } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { CategoryIcon } from "@/components/shared/category-icon";
import { format } from "date-fns";
import { CATEGORIES } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function UserReportsList() {
  const { user } = useUser();
  const firestore = useFirestore();

  const reportsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, "users", user.uid, "reports"), orderBy("createdAt", "desc"));
  }, [firestore, user]);
  
  const { data: reports, isLoading } = useCollection<Report>(reportsQuery);

  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <Card className="flex items-center justify-center h-40">
        <p className="text-center text-muted-foreground">You haven't submitted any reports yet.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <Card key={report.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CategoryIcon category={report.category} />
              <div>
                <p className="font-bold text-lg">{getCategoryLabel(report.category)}</p>
                <p className="text-sm text-muted-foreground">Room {report.roomNumber}</p>
              </div>
            </div>
            <div className="text-right">
              <StatusBadge status={report.status} />
              <p className="text-sm text-muted-foreground mt-1">
                {report.createdAt ? format(report.createdAt.toDate(), "MMM d, h:mm a") : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
