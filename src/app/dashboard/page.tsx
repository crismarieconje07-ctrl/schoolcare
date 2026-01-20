"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// 🔐 auth profile hook (already in your project)
import { useAuthProfile } from "@/hooks/use-auth-profile";

// 👉 My Reports
import ReportsPage from "./reports/page";

// 👉 categories
import { CATEGORIES } from "@/lib/constants/categories";
import { CategoryIcon } from "@/components/shared/category-icon";
import type { Category } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuthProfile();

  // redirect if logged out
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="p-6 space-y-10">
      {/* ======================
    GREETING HEADER
====================== */}
<div className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
  <h1 className="text-3xl font-bold">
    Hi, {userProfile?.displayName ?? "there"} 👋
  </h1>
  <p className="text-blue-100">
    Report a facility issue
  </p>
</div>

      {/* ======================
    CATEGORIES
====================== */}
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
  {CATEGORIES.map((category) => {
    const Icon = category.icon;

    return (
      <button
      key={`${category.value}-${category.label}`}
        onClick={() =>
          router.push(`/dashboard/submit-report?category=${category.value}`)
        }
        className="rounded-2xl p-6 flex flex-col items-center justify-center gap-3 shadow-sm transition hover:scale-[1.02]"
        style={{ backgroundColor: category.color }}
      >
        {Icon && <Icon className="h-8 w-8 text-white" />}
        <span className="text-white font-semibold">
          {category.label}
        </span>
      </button>
    );
  })}
</div>

      {/* ======================
          MY REPORTS
      ====================== */}
      <div>
        <h2 className="text-2xl font-bold">My Reports</h2>
        <p className="text-muted-foreground mb-4">
          A list of all the reports you have submitted.
        </p>

        <ReportsPage />
      </div>
    </div>
  );
}
