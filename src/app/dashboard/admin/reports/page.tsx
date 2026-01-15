"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/firebase/client";

type Report = {
  id: string;
  title?: string;
  status?: string;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReports() {
      try {
        const q = query(
          collection(db, "reports"),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Report, "id">),
        }));

        setReports(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, []);

  if (loading) {
    return <p className="text-muted-foreground">Loading reports…</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Reports</h1>
        <p className="text-muted-foreground">
          All submitted maintenance reports
        </p>
      </div>

      {reports.length === 0 && (
        <p className="text-muted-foreground">No reports found.</p>
      )}

      <div className="space-y-4">
        {reports.map(report => (
          <Link
            key={report.id}
            href={`/dashboard/admin/report/${report.id}`}
            className="block border rounded-lg p-4 hover:bg-muted transition"
          >
            <p className="font-medium">
              {report.title ?? "Untitled Report"}
            </p>
            <p className="text-sm text-muted-foreground">
              Status: {report.status ?? "pending"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
