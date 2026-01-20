"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "@/firebase/client";
import { useAuthProfile } from "@/hooks/use-auth-profile";

/* ---------------- TYPES ---------------- */

type Report = {
  id: string;
  category: string;
  description: string;
  status: string;
  roomNumber?: string;
  createdAt?: any;
};

/* ---------------- CATEGORY COLOR MAP ---------------- */

const categoryBorder: Record<string, string> = {
  chair: "border-l-indigo-500",
  fan: "border-l-green-500",
  window: "border-l-sky-500",
  light: "border-l-yellow-400",
  sanitation: "border-l-pink-500",
  other: "border-l-slate-400",
};

/* ---------------- COMPONENT ---------------- */

export default function ReportsPage() {
  const router = useRouter();
  const { user, loading } = useAuthProfile();

  const [reports, setReports] = useState<Report[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading || !user) return;

    const fetchReports = async () => {
      try {
        const q = query(
          collection(db, "users", user.uid, "reports"),
          orderBy("createdAt", "desc")
        );

        const snap = await getDocs(q);

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Report, "id">),
        }));

        setReports(data);
      } catch (err) {
        console.error("Failed to fetch reports", err);
      } finally {
        setFetching(false);
      }
    };

    fetchReports();
  }, [user, loading]);

  if (fetching) {
    return <div className="py-6 text-muted-foreground">Loading reports...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="py-6 text-muted-foreground">
        You haven’t submitted any reports yet.
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {reports.map((report) => (
        <button
          key={report.id}
          onClick={() =>
            router.push(`/dashboard/reports/${report.id}`)
          }
          className={`
            text-left rounded-xl border-l-4 border bg-white p-5
            shadow-sm hover:shadow-lg hover:-translate-y-0.5
            transition-all duration-200
            ${categoryBorder[report.category] ?? "border-l-slate-300"}
          `}
        >
          {/* HEADER */}
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-lg font-semibold capitalize">
              {report.category}
            </h3>

            <span
              className="
                rounded-full px-3 py-1 text-xs font-medium
                bg-blue-100 text-blue-700
                animate-pulse shadow-md
              "
            >
              {report.status}
            </span>
          </div>

          {/* DESCRIPTION */}
          <p className="mt-2 text-sm text-gray-700 line-clamp-3">
            {report.description}
          </p>

          {/* ROOM */}
          {report.roomNumber && (
            <p className="mt-2 text-xs text-muted-foreground">
              Room: {report.roomNumber}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}
