import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import Link from "next/link";

type PageProps = {
  params: {
    id: string;
  };
};

export default async function AdminReportDetailPage({ params }: PageProps) {
  const docRef = doc(db, "reports", params.id);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold">Report not found</h1>
        <Link href="/dashboard/admin/reports" className="text-primary underline">
          Back to reports
        </Link>
      </div>
    );
  }

  const report = snap.data();

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Report Details</h1>

      <div className="space-y-2">
        <p><strong>Category:</strong> {report.category}</p>
        <p><strong>Room:</strong> {report.roomNumber}</p>
        <p><strong>Status:</strong> {report.status}</p>
        <p><strong>Priority:</strong> {report.priority}</p>
        <p><strong>Description:</strong></p>
        <p className="border rounded p-3">{report.description}</p>
      </div>

      <Link
        href="/dashboard/admin/reports"
        className="inline-block text-primary underline"
      >
        ← Back to reports
      </Link>
    </div>
  );
}
