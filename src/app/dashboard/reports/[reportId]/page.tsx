"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useAuthProfile } from "@/hooks/use-auth-profile";

type Report = {
  category: string;
  description: string;
  status: string;
  roomNumber?: string;
  createdAt?: any;
};

export default function ReportDetailsPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const router = useRouter();
  const { user, loading } = useAuthProfile();

  const [report, setReport] = useState<Report | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading || !user || !reportId) return;

    const fetchReport = async () => {
      try {
        const ref = doc(db, "users", user.uid, "reports", reportId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          router.replace("/dashboard");
          return;
        }

        setReport(snap.data() as Report);
      } catch (err) {
        console.error("Failed to load report", err);
      } finally {
        setFetching(false);
      }
    };

    fetchReport();
  }, [user, loading, reportId, router]);

  if (loading || fetching) {
    return <div className="p-6">Loading report...</div>;
  }

  if (!report) {
    return <div className="p-6">Report not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <button
        onClick={() => router.back()}
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to My Reports
      </button>

      <div className="rounded-xl border bg-white p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold capitalize">
            {report.category}
          </h1>

          <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
            {report.status}
          </span>
        </div>

        {report.roomNumber && (
          <p className="text-sm text-muted-foreground">
            Room: {report.roomNumber}
          </p>
        )}

        <p className="text-gray-700">{report.description}</p>

        {report.createdAt && (
          <p className="text-sm text-gray-500">
            Submitted on{" "}
            {report.createdAt.toDate().toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
