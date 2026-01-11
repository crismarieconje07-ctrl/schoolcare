
"use client";

import UserReportsTable from '@/components/dashboard/user-reports-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks';
import { CATEGORIES } from '@/lib/constants';
import { CategoryIcon } from '@/components/shared/category-icon';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        {loading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h1 className="text-3xl font-bold font-headline">
            Hi, {userProfile?.displayName?.split(' ')[0] || 'there'}
          </h1>
        )}
        <p className="text-muted-foreground">Report a facility issue</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {CATEGORIES.map((category) => (
          <Button
            key={category.value}
            variant="outline"
            className="h-24 flex-col gap-2 justify-center"
            asChild
          >
            <Link href={`/dashboard/submit-report?category=${category.value}`}>
              <CategoryIcon category={category.value} className="h-10 w-10" />
              <span className="text-sm font-medium">{category.label}</span>
            </Link>
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Reports</CardTitle>
          <CardDescription>A list of all the reports you have submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserReportsTable />
        </CardContent>
      </Card>
    </div>
  );
}
