"use client";

import Link from "next/link";

type Report = {
  id: string;
  path: string;
  status: string;
};

export function ReportCard({ report }: { report: Report }) {
  const encodedPath = encodeURIComponent(report.path);

  return (
    <Link
      href={`/admin/reports?path=${encodedPath}`}
      className="block rounded-lg border p-4 hover:bg-muted transition"
    >
      <p className="font-medium">Report ID: {report.id}</p>
      <p className="text-sm text-muted-foreground capitalize">
        Status: {report.status}
      </p>
    </Link>
  );
}
