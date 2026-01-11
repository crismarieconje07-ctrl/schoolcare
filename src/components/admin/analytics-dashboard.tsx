"use client";

import { useMemo } from "react";
import { collectionGroup, query } from "firebase/firestore";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import type { Report, Category, Status } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { CATEGORIES } from "@/lib/constants";

const AnalyticsDashboard = () => {
  const firestore = useFirestore();
  
  const reportsQuery = useMemoFirebase(() => {
    return query(collectionGroup(firestore, "reports"));
  }, [firestore]);

  const { data: reports, isLoading } = useCollection<Report>(reportsQuery);

  const categoryData = useMemo(() => {
    if (!reports) return [];
    const counts: { [key in Category]?: number } = {};
    for (const report of reports) {
      counts[report.category] = (counts[report.category] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reports]);

  const roomData = useMemo(() => {
    if (!reports) return [];
    const counts: { [key: string]: number } = {};
    for (const report of reports) {
      counts[report.roomNumber] = (counts[report.roomNumber] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [reports]);

  const statusData = useMemo(() => {
    if (!reports) return [];
    const counts: { [key in Status]?: number } = {};
    for (const report of reports) {
      counts[report.status] = (counts[report.status] || 0) + 1;
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [reports]);

  const categoryColors: Record<string, string> = {
    chair: "hsl(var(--category-chairs))",
    fan: "hsl(var(--category-fans))",
    window: "hsl(var(--category-windows))",
    light: "hsl(var(--category-lights))",
    sanitation: "hsl(var(--category-sanitation))",
    other: "hsl(var(--category-others))",
  };
  
  if (isLoading) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
        </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Reports by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={categoryColors[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Most Reported Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roomData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }}/>
              <Bar dataKey="value" fill="hsl(var(--primary))" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Report Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip cursor={{ fill: 'hsl(var(--muted))' }}/>
              <Bar dataKey="value" fill="hsl(var(--accent))" barSize={40}/>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
