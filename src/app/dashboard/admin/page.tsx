import AdminDashboard from "@/components/admin/admin-dashboard";

export default function AdminDashboardPage() {
    return (
        <div className="space-y-8 h-full flex flex-col">
            <div>
              <h1 className="text-3xl font-bold font-headline">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage and track all maintenance reports.</p>
            </div>
            <AdminDashboard />
        </div>
    );
}
