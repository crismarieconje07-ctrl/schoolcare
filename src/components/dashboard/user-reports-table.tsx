"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { useAuthProfile } from "@/hooks/use-auth-profile";
import { db } from "@/firebase/client";
import type { Report } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserReportsTable() {
  const { user } = useAuthProfile();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !user) {
      setLoading(false);
      return;
    }

    async function loadReports() {
      try {
        const q = query(
          collection(db, "reports"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((r: any) => r.userId === user.uid);

        setReports(data as Report[]);
      } catch (err) {
        console.error(err);
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    }

    loadReports();
  }, [db, user]);

  if (loading) return <Skeleton className="h-32 w-full" />;
  if (error) return <p className="text-destructive">{error}</p>;
  if (!reports.length)
    return <p className="text-muted-foreground">No reports yet.</p>;

  return (
    <div className="space-y-2">
      {reports.map((report) => (
        <div
          key={report.id}
          className="border rounded-lg p-4 text-sm"
        >
          <p className="font-medium">{report.category}</p>
          <p className="text-muted-foreground">{report.status}</p>
        </div>
      ))}
    </div>
  );
}
