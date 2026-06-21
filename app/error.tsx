'use client';

import React, { useEffect } from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception to console
    console.error('Next.js Page Boundary Exception:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center text-white px-6 font-mono selection:bg-white selection:text-black">
      <div className="flex flex-col items-center max-w-md text-center">
        
        {/* Warning Indicator */}
        <div className="w-16 h-16 rounded-full border border-red-500/20 flex items-center justify-center bg-neutral-950 mb-8 shadow-[0_4px_30px_rgba(239,68,68,0.01)]">
          <AlertTriangle size={22} className="text-red-500 animate-pulse" />
        </div>

        <span className="text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase mb-3 block">
          RUNTIME OVERFLOW EXCEPTION
        </span>
        
        <h1 className="text-[28px] font-black tracking-widest uppercase mb-4 leading-none text-white">
          SYSTEM FAULT DETECTED
        </h1>
        
        <p className="text-[12px] font-sans text-neutral-400 leading-relaxed mb-4 max-w-xs">
          An exception interrupted execution while compiling this coordinate.
        </p>

        {error.message && (
          <div className="w-full bg-neutral-950 border border-white/5 p-4 rounded-sm mb-10 text-left font-mono text-[9px] tracking-wider text-neutral-500 max-h-[120px] overflow-y-auto uppercase select-text">
            <span className="text-red-500 font-bold block mb-1">LOG DETAIL:</span>
            {error.message}
          </div>
        )}

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 border border-white/10 hover:border-white px-8 py-3.5 rounded-full text-[10px] font-bold tracking-widest transition-all hover:bg-white hover:text-black duration-300 cursor-pointer"
          >
            <RefreshCw size={11} />
            RETRY TRANSACTION
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-900 border border-white/5 px-8 py-3.5 rounded-full text-[10px] font-bold tracking-widest transition-colors duration-300"
          >
            <Home size={11} />
            GO TO HOME
          </Link>
        </div>
      </div>
    </div>
  );
}
