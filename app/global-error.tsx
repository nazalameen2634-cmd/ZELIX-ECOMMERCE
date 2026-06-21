'use client';

import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-mono min-h-screen flex flex-col justify-center items-center px-6 selection:bg-white selection:text-black">
        <div className="flex flex-col items-center max-w-md text-center">
          
          {/* Diagnostic Icon */}
          <div className="w-16 h-16 rounded-full border border-red-500/20 flex items-center justify-center bg-neutral-950 mb-8">
            <AlertCircle size={22} className="text-red-500 animate-pulse" />
          </div>

          <span className="text-[10px] font-bold tracking-[0.3em] text-red-500 uppercase mb-3 block">
            FATAL SHELL SYSTEM FAULT
          </span>
          
          <h1 className="text-[28px] font-black tracking-widest uppercase mb-4 leading-none text-white">
            ROOT LAYOUT OVERFLOW
          </h1>
          
          <p className="text-[12px] font-sans text-neutral-400 leading-relaxed mb-8 max-w-xs">
            A fatal exception occurred in the primary page structure shell.
          </p>

          {/* Retry Button */}
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 border border-white/10 hover:border-white px-8 py-3.5 rounded-full text-[10px] font-bold tracking-widest transition-all hover:bg-white hover:text-black duration-300 cursor-pointer"
          >
            <RefreshCw size={11} />
            RELOAD SYSTEM ROOT
          </button>
        </div>
      </body>
    </html>
  );
}
