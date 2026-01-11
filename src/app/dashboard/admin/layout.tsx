"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useFirebase();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userProfile?.role !== 'admin') {
      router.replace('/dashboard');
    }
  }, [userProfile, loading, router]);

  if (loading || userProfile?.role !== 'admin') {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
}
