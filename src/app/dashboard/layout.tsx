"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from '@/lib/hooks';
import AppSidebar from '@/components/layout/sidebar';
import AppHeader from '@/components/layout/header';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <AppHeader />
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
