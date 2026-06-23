'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Truck, Search, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';

export default function TrackGeneralPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [orderNumber, setOrderNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'TRACK YOUR ORDER | ZELIX';
  }, []);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast('PLEASE ENTER A VALID ORDER NUMBER', 'error');
      return;
    }
    setIsSubmitting(true);
    // Format if they forgot ORD- prefix
    let target = orderNumber.trim().toUpperCase();
    if (!target.startsWith('ORD-') && /^\d+$/.test(target)) {
      target = `ORD-${target}`;
    }
    
    router.push(`/track/${target}`);
  };

  return (
    <main className="min-h-screen bg-black text-white py-24 px-4 sm:px-6 lg:px-8 font-mono flex items-center justify-center">
      <div className="max-w-md w-full border border-zinc-800 bg-zinc-950 p-8 relative overflow-hidden shadow-2xl">
        {/* Subtle grid background for premium tech-wear feel */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-6"
          >
            <Truck size={20} />
          </motion.div>

          <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase mb-2">
            LOGISTICS & FULFILLMENT
          </span>
          <h1 className="text-[20px] font-sans font-black tracking-tight uppercase text-white mb-4">
            TRACK YOUR SHIPMENT
          </h1>
          <p className="font-sans text-[11px] text-neutral-400 mb-8 leading-relaxed max-w-xs">
            Enter your 8-digit order number (e.g. ORD-12345) to view real-time status and package logs.
          </p>

          <form onSubmit={handleTrack} className="w-full flex flex-col gap-4">
            <div className="relative">
              <Input
                label="ORDER NUMBER"
                required
                placeholder="ORD-XXXXX"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full text-center tracking-widest uppercase font-bold text-white placeholder-neutral-700"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'RETRIEVING STATUS...' : (
                <span className="flex items-center justify-center gap-2">
                  TRACK ORDER <ArrowRight size={12} />
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
