import UserReportsTable from '@/components/dashboard/user-reports-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default async function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">My Reports</h1>
          <p className="text-muted-foreground">View and track your submitted maintenance reports.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/submit-report">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Submissions</CardTitle>
          <CardDescription>A list of all the reports you have submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserReportsTable />
        </CardContent>
      </Card>
    </div>
  );
}
