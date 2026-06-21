'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, isAdmin, loading } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/account/login');
      } else if (!isAdmin) {
        router.push('/');
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isAdmin, loading, router]);

  if (loading || !isAuthorized) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center gap-6"
        style={{ background: '#080808' }}
      >
        <div
          className="font-sans text-[#C9A96E] text-[36px] font-black tracking-[0.4em]"
        >
          ZELIX
        </div>
        <Loader2 className="animate-spin w-5 h-5" style={{ color: '#C9A96E' }} />
        <span className="font-mono text-[9px] tracking-[0.24em]" style={{ color: '#4A4642' }}>
          VALIDATING PERMISSIONS...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full" style={{ background: '#0A0A0A', color: '#E8E4DF' }}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar */}
        <div
          className="hidden lg:flex items-center justify-end px-10 shrink-0"
          style={{ height: '72px', borderBottom: '1px solid rgba(245,240,235,0.06)', background: '#0A0A0A' }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3ECF8E' }} />
              <span className="font-mono text-[8px] tracking-[0.18em]" style={{ color: '#4A4642' }}>
                SYSTEM ONLINE
              </span>
            </div>
            <div className="font-mono text-[8px] tracking-[0.14em]" style={{ color: '#4A4642' }}>
              {profile?.full_name || user?.email || 'ADMIN'}
            </div>
          </div>
        </div>

        <main className="flex-1 p-6 lg:p-10 xl:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
