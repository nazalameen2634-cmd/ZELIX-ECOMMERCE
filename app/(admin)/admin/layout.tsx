'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check local storage for admin auth token
    const auth = localStorage.getItem('zelix_admin_auth');
    if (auth === 'true') {
      setIsAuthorized(true);
    }
    setIsChecking(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (email === 'admin@zelix.com' && password === 'admin@zelix@pass8806') {
      localStorage.setItem('zelix_admin_auth', 'true');
      setIsAuthorized(true);
    } else {
      setError('Invalid credentials.');
    }
  };

  if (isChecking) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center gap-6"
        style={{ background: '#F0F0F0' }}
      >
        <Loader2 className="animate-spin w-5 h-5" style={{ color: '#C9A96E' }} />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center" style={{ background: '#F0F0F0' }}>
        <div className="w-full max-w-md p-8 border" style={{ borderColor: 'rgba(0,0,0,0.1)', background: '#FAFAFA' }}>
          <div className="text-center mb-8">
            <h1 className="font-sans text-[24px] font-black tracking-[0.3em] text-[#111111] uppercase mb-2">
              ZELIX ADMIN
            </h1>
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#6B6560]">
              AUTHORIZED PERSONNEL ONLY
            </p>
          </div>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <input
                type="email"
                placeholder="EMAIL ADDRESS"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent border py-3 px-4 outline-none font-mono text-[11px] tracking-widest text-[#111111]"
                style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="PASSWORD"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border py-3 px-4 outline-none font-mono text-[11px] tracking-widest text-[#111111]"
                style={{ borderColor: 'rgba(0,0,0,0.1)' }}
                required
              />
            </div>
            
            {error && (
              <div className="text-red-500 font-mono text-[10px] tracking-widest text-center">
                {error}
              </div>
            )}
            
            <button
              type="submit"
              className="w-full py-4 mt-2 font-mono text-[11px] font-bold tracking-[0.2em] uppercase transition-colors"
              style={{ background: '#C9A96E', color: '#111111' }}
            >
              AUTHENTICATE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex w-full" style={{ background: '#FAFAFA', color: '#111111' }}>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar */}
        <div
          className="hidden lg:flex items-center justify-end px-10 shrink-0"
          style={{ height: '72px', borderBottom: '1px solid rgba(0,0,0,0.06)', background: '#FAFAFA' }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3ECF8E' }} />
              <span className="font-mono text-[8px] tracking-[0.18em]" style={{ color: '#4A4642' }}>
                SYSTEM ONLINE
              </span>
            </div>
            <div className="font-mono text-[8px] tracking-[0.14em]" style={{ color: '#4A4642' }}>
              ADMIN
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('zelix_admin_auth');
                setIsAuthorized(false);
              }}
              className="font-mono text-[8px] tracking-[0.14em] text-red-500 hover:text-red-400 uppercase"
            >
              LOGOUT
            </button>
          </div>
        </div>

        <main className="flex-1 p-6 lg:p-10 xl:p-12 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
