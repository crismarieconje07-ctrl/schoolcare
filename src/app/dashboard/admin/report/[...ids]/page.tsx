
import ReportDetail from '@/components/admin/report-detail-view';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function ReportDetailPage({ params }: { params: { ids: string[] } }) {
  const [userId, reportId] = params.ids;

  if (!userId || !reportId) {
    return (
        <div className="text-center">
            <p>Invalid report URL.</p>
            <Button asChild variant="link">
                <Link href="/dashboard/admin">Go back to Admin Dashboard</Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
        <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
      </div>
      <ReportDetail userId={userId} reportId={reportId} />
    </div>
  );
}
