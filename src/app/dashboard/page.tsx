import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { getAuth } from "firebase/auth";
import type { Report } from '@/lib/types';
import UserReportsTable from '@/components/dashboard/user-reports-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

async function getUserReports(userId: string): Promise<Report[]> {
  const reportsRef = collection(db, 'reports');
  const q = query(reportsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  const reports: Report[] = [];
  querySnapshot.forEach((doc) => {
    reports.push({ id: doc.id, ...doc.data() } as Report);
  });
  return reports;
}

export default async function DashboardPage() {
  // This is a server component, but we need the current user's ID.
  // In a real app with server-side auth integration, you'd get this from the session.
  // For this demo, we'll assume a way to get the user ID on the server.
  // As a fallback for this environment, we'll pass it to a client component.
  // But for this initial load, we can't fetch user-specific data without being client-side or having a session.
  // So we will render the container and let the client component fetch the data.
  
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
