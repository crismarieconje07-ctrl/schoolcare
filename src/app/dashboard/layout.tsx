"use client";

import Link from "next/link";
import { ReactNode } from "react";
import {
  ClipboardList,
  PlusCircle,
  Wrench,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-muted/40">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* BRAND */}
        <div className="px-6 py-4 flex items-center gap-2 font-bold text-xl">
          <Wrench className="h-6 w-6 text-primary" />
          SchoolCare
        </div>

        {/* NAV */}
        <nav className="flex-1 px-4 space-y-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"
            )}
          >
            <ClipboardList className="h-4 w-4" />
            My Reports
          </Link>

          <Link
            href="/dashboard/submit-report"
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"
            )}
          >
            <PlusCircle className="h-4 w-4" />
            Submit Report
          </Link>
        </nav>

        {/* LOGOUT */}
        <div className="px-4 py-4 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
