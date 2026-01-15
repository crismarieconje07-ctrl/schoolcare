import Link from "next/link";

export default function AdminDashboard() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link
        href="/dashboard/admin/reports"
        className="border rounded-lg p-4 hover:bg-muted"
      >
        <h2 className="font-semibold">View Reports</h2>
        <p className="text-sm text-muted-foreground">
          See all submitted reports
        </p>
      </Link>

      <Link
        href="/dashboard/admin/analytics"
        className="border rounded-lg p-4 hover:bg-muted"
      >
        <h2 className="font-semibold">Analytics</h2>
        <p className="text-sm text-muted-foreground">
          View report statistics
        </p>
      </Link>
    </div>
  );
}
