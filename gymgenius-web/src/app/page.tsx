'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dumbbell } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!hasHydrated) return;
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [hasHydrated, isAuthenticated, router]);

  return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
          <Dumbbell className="h-6 w-6 text-cyan-400" />
        </div>
        <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
          Inizializzazione sessione...
        </p>
      </div>
  );
}