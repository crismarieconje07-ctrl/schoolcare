import AnalyticsDashboard from "@/components/admin/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Analytics</h1>
        <p className="text-muted-foreground">Visual insights into maintenance reports.</p>
      </div>
      <AnalyticsDashboard />
    </div>
  );
}
