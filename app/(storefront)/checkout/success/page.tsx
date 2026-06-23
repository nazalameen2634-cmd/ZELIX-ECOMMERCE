'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'ORD-10001';
  const [order, setOrder] = useState<any>(null);

  // Fetch order details from Supabase
  useEffect(() => {
    async function fetchOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();
      if (error) {
        console.error('Failed to fetch order details', error);
        return;
      }
      setOrder(data);
    }
    fetchOrder();
  }, [orderNumber]);

  // Trigger confetti burst on success mount
  useEffect(() => {
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.55 },
      colors: ['#FFFFFF', '#333333', '#888888'],
    });
  }, []);

  const renderPaymentStatus = () => {
    if (!order) return null;
    const status = order.payment_status?.toUpperCase() || 'PENDING';
    const colorClasses =
      status === 'PAID'
        ? 'bg-green-900/40 text-green-400 border border-green-800'
        : status === 'PENDING'
        ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'
        : 'bg-red-900/40 text-red-400 border border-red-800';
    return (
      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase ${colorClasses}`}> {status} </span>
    );
  };

  const renderRazorpayInfo = () => {
    if (!order) return null;
    return (
      <div className="mt-4 text-[11px] text-neutral-400">
        <div><span className="font-mono text-[#4A4642] uppercase">RAZORPAY PAYMENT ID:</span> {order.razorpay_payment_id || '—'}</div>
        <div><span className="font-mono text-[#4A4642] uppercase">RAZORPAY ORDER ID:</span> {order.razorpay_order_id || '—'}</div>
      </div>
    );
  };

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
    <div className="bg-black min-h-screen py-24 flex items-center justify-center px-4">
      <div className="container-custom max-w-3xl w-full text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-white/5 bg-neutral-950/40 p-10 md:p-16 rounded-sm w-full text-center flex flex-col items-center shadow-2xl relative overflow-hidden"
        >
          {/* Subtle grid background for premium tech-wear feel */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] mb-8"
          >
            <CheckCircle2 size={48} />
          </motion.div>

          <span className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-3">
            TRANSACTION APPROVED
          </span>
          <h1 className="text-[32px] md:text-[48px] font-sans font-black tracking-tight uppercase text-white mb-8 leading-none">
            ORDER CONFIRMED
          </h1>

          <div className="w-full border-t border-b border-white/5 py-8 my-8 flex flex-col gap-5 font-mono text-[11px] text-left">
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-neutral-500">ORDER NUMBER</span>
              <span className="text-white font-bold tracking-widest text-sm">{orderNumber}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-neutral-500">TOTAL AMOUNT</span>
              <span className="text-[#C9A96E] font-black text-sm">
                {order ? formatCurrency(order.total) : 'LOADING...'}
              </span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-neutral-500">SHIPPING TO</span>
              <span className="text-white uppercase font-bold text-right max-w-sm truncate">
                {order?.shipping_address?.full_name || 'LOADING...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">DELIVERY METHOD</span>
              <span className="text-white uppercase font-bold text-right">
                {order?.shipping_method === 'express' ? 'EXPRESS ARCHIVE DELIVERY' : 'STANDARD DELIVERY'}
              </span>
            </div>
          </div>

          <p className="font-sans text-[13px] text-neutral-400 max-w-lg mb-10 leading-relaxed">
            Your order has been logged into the system. A confirmation email with details of the package tracking has been sent to <span className="text-white font-semibold">{order?.email || 'your email'}</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href={`/track?order_number=${orderNumber}`} className="w-full sm:w-auto">
              <button className="px-8 py-4 bg-white hover:bg-neutral-200 text-black font-mono text-[10px] font-bold tracking-widest rounded-sm w-full transition-colors uppercase">
                TRACK YOUR ORDER
              </button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <button className="px-8 py-4 border border-white/10 hover:border-white text-white font-mono text-[10px] font-bold tracking-widest rounded-sm w-full transition-colors uppercase">
                CONTINUE SHOPPING
              </button>
            </Link>
          </div>
        </motion.div>
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
