'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Box } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col justify-center items-center text-white px-6 font-mono selection:bg-white selection:text-black">
      
      {/* Visual Accent Box */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center max-w-md text-center"
      >
        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center bg-neutral-950 mb-8 shadow-[0_4px_30px_rgba(255,255,255,0.01)]">
          <Box size={22} className="text-neutral-400" />
        </div>

        <span className="text-[10px] font-bold tracking-[0.3em] text-neutral-500 uppercase mb-3 block">
          SYSTEM ERROR // 404
        </span>
        
        <h1 className="text-[28px] font-black tracking-widest uppercase mb-4 leading-none">
          RESOURCE NOT LOCATED
        </h1>
        
        <p className="text-[12px] font-sans text-neutral-400 leading-relaxed mb-10 max-w-xs">
          The requested coordinate has been moved or is outside the boundaries of the ZELIX design network.
        </p>

        {/* CTA Link */}
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 border border-white/10 hover:border-white px-8 py-3.5 rounded-full text-[10px] font-bold tracking-widest transition-all hover:bg-white hover:text-black duration-300"
        >
          <ArrowLeft size={11} />
          RETURN TO HOME BASE
        </Link>
      </motion.div>
    </div>
  );
}
