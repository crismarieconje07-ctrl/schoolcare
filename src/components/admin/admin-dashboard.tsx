"use client";

import { useCollection } from "@/firebase/firestore/use-collection";
import { ReportCard } from "./report-card";

type Report = {
  id: string;
  path: string;
  status: string;
  createdAt: any;
};

const STATUSES = ["pending", "in_progress", "resolved"];

export default function AdminDashboard() {
  const { data: reports, loading, error } = useCollection<Report>(
    "reports",
    true // 🔥 collectionGroup
  );

  if (loading) return <p className="p-6">Loading reports…</p>;
  if (error) return <p className="p-6 text-red-500">{error.message}</p>;

  const reportsByStatus = (status: string) =>
    reports.filter((r) => r.status === status);

  return (
    <div className="p-6 space-y-10">
      {STATUSES.map((status) => (
        <section key={status}>
          <h2 className="text-xl font-semibold capitalize mb-4">
            {status.replace("_", " ")}
          </h2>

          {reportsByStatus(status).length > 0 ? (
            <div className="grid gap-4">
              {reportsByStatus(status).map((report) => (
                <ReportCard
                  key={report.path} // ✅ UNIQUE & STABLE
                  report={report}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              No reports in this category
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
