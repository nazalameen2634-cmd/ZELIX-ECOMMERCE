'use client';

import React, { useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, Box, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'ORD-10001';

  // Trigger confetti burst on success mount
  useEffect(() => {
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#FFFFFF', '#333333', '#888888'],
    });
  }, []);

  const drawPath = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { type: 'spring', duration: 1.2, bounce: 0 },
        opacity: { duration: 0.01 },
      },
    },
  } as const;

  return (
    <div className="bg-black min-h-[75vh] flex items-center py-16">
      <div className="container-custom max-w-xl text-center flex flex-col items-center">
        
        {/* Animated SVG Path Checkmark */}
        <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center bg-neutral-950 shadow-[0_10px_30px_rgba(255,255,255,0.02)] mb-8 relative">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M20 6L9 17L4 12"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={drawPath}
              initial="hidden"
              animate="visible"
            />
          </svg>
        </div>

        {/* Text Details */}
        <span className="font-mono text-[9px] font-bold tracking-[0.25em] text-neutral-500 uppercase mb-3 block">
          TRANSACTION APPROVED
        </span>
        <h1 className="text-[28px] md:text-[34px] font-black tracking-wide text-white uppercase mb-4 leading-tight">
          THANK YOU FOR YOUR ORDER
        </h1>
        <p className="text-[13px] font-sans text-neutral-400 max-w-sm mb-12 leading-relaxed">
          Your payment has been successfully processed. Order <span className="font-mono font-bold text-white uppercase">{orderNumber}</span> is now being prepared in our design lab.
        </p>

        {/* Info card */}
        <div className="w-full bg-neutral-950 border border-white/5 p-6 rounded-sm mb-12 font-mono text-[10px] tracking-wider text-left uppercase flex flex-col gap-3">
          <div className="flex justify-between items-center text-neutral-500">
            <span>ORDER REFERENCE:</span>
            <span className="text-white font-bold">{orderNumber}</span>
          </div>
          <div className="flex justify-between items-center text-neutral-500">
            <span>ESTIMATED DELIVERY:</span>
            <span className="text-white font-bold">2 - 3 BUSINESS DAYS</span>
          </div>
          <div className="flex justify-between items-center text-neutral-500">
            <span>SHIPPING PARTNER:</span>
            <span className="text-white font-bold">EXPRESS COURIER SERVICES</span>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link
            href="/account"
            className="flex items-center justify-center gap-2 border border-white/10 hover:border-white px-8 py-4 rounded-full font-mono text-[10px] font-bold tracking-widest text-white transition-colors"
          >
            <Box size={12} />
            TRACK ORDER
          </Link>
          
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 bg-white hover:bg-neutral-200 px-8 py-4 rounded-full font-mono text-[10px] font-bold tracking-widest text-black transition-all"
          >
            <ShoppingBag size={12} />
            CONTINUE SHOPPING <ArrowRight size={12} />
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="bg-black min-h-[85vh] flex items-center justify-center text-white font-mono text-[10px] tracking-widest uppercase">
        LOADING TRANSACTION STATUS...
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
