
"use client";

import UserReportsTable from '@/components/dashboard/user-reports-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks';
import { CATEGORIES } from '@/lib/constants';
import { CategoryIcon } from '@/components/shared/category-icon';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Category } from '@/lib/types';

const categoryColors: Record<Category, string> = {
    chair: 'hsl(221 39% 49%)',
    fan: 'hsl(198 93% 62%)',
    window: 'hsl(204 90% 53%)',
    light: 'hsl(54 96% 50%)',
    sanitation: 'hsl(142 69% 45%)',
    other: 'hsl(215 14% 65%)',
};

export default function DashboardPage() {
  const { userProfile, loading } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        {loading ? (
          <Skeleton className="h-9 w-48 mb-1" />
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
            className="h-24 flex-col gap-2 justify-center text-primary-foreground hover:text-primary-foreground/90 transition-all hover:opacity-90"
            style={{ backgroundColor: categoryColors[category.value] }}
            asChild
          >
            <Link href={`/dashboard/submit-report?category=${category.value}`}>
              <CategoryIcon category={category.value} className="h-10 w-10 bg-transparent text-primary-foreground" />
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
