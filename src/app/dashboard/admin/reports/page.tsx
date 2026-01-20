"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/client";
import Link from "next/link";

type Report = {
  id: string;
  [key: string]: any;
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const snap = await getDocs(collection(db, "reports"));
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(data);
      } catch (err: any) {
        console.error("Admin reports error:", err);
        setError("You do not have permission to view reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <p>Loading reports…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Admin Reports</h1>

      {reports.length === 0 && <p>No reports found.</p>}

      {reports.map((r) => (
        <Link
          key={r.id}
          href={`/dashboard/admin/reports/${r.id}`}
          className="block rounded border p-3 hover:bg-muted"
        >
          Report ID: {r.id}
        </Link>
      ))}
    </div>
  );
}
