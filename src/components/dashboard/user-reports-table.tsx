"use client";

import { useMemo } from "react";
import { collection, query, orderBy } from "firebase/firestore";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import type { Report } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { CategoryIcon } from "@/components/shared/category-icon";
import { format } from "date-fns";
import { CATEGORIES } from "@/lib/constants";

export default function UserReportsTable() {
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
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return <p className="text-center text-muted-foreground">You haven't submitted any reports yet.</p>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Category</TableHead>
          <TableHead>Room</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead className="text-right">Submitted</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <TableRow key={report.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <CategoryIcon category={report.category} />
              </div>
            </TableCell>
            <TableCell className="font-medium">{report.roomNumber}</TableCell>
            <TableCell className="max-w-xs truncate">{report.description}</TableCell>
            <TableCell>
              <StatusBadge status={report.status} />
            </TableCell>
            <TableCell>
              <PriorityBadge priority={report.priority} />
            </TableCell>
            <TableCell className="text-right">
              {report.createdAt ? format(report.createdAt.toDate(), "MMM d, yyyy") : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
