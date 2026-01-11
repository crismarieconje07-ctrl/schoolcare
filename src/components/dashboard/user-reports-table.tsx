"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/hooks";
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
  const { user } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, where("userId", "==", user.uid), orderBy("createdAt", "desc"));

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
  }, [user]);
  
  const getCategoryLabel = (value: string) => {
    return CATEGORIES.find(c => c.value === value)?.label || value;
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (reports.length === 0) {
    return <p className="text-center text-muted-foreground">You haven&apos;t submitted any reports yet.</p>
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
              {report.createdAt ? format(report.createdAt, "MMM d, yyyy") : 'N/A'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
