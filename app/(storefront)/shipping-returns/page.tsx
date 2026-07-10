'use client';

import React from 'react';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function ShippingReturnsPage() {
  return (
    <div style={{ background: '#080808', minHeight: '100vh', paddingTop: '120px', paddingBottom: '80px' }}>
      
      {/* Editorial Header */}
      <div className="relative overflow-hidden border-b mb-16" style={{ borderColor: 'rgba(245,240,235,0.05)', paddingBottom: '40px' }}>
        <div className="container-custom relative z-10">
          <div className="section-label mb-4">SUPPORT & POLICIES</div>
          <h1 className="font-sans font-extrabold uppercase tracking-tight leading-none text-[#F5F0EB] text-[40px] md:text-[64px] mb-4">
            Shipping & Returns.
          </h1>
          <p className="font-mono text-[10px] tracking-[0.18em]" style={{ color: '#6B6560' }}>
            LAST UPDATED // JUNE 23, 2026
          </p>
        </div>
      </div>

      <div className="container-narrow">
        
        {/* Core Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="p-8 border flex flex-col gap-4" style={{ borderColor: 'rgba(245,240,235,0.05)', background: '#0b0b0f' }}>
            <span style={{ color: '#C9A96E' }}><Truck size={24} /></span>
            <h3 className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#F5F0EB]">FREE EXPRESS DELIVERY</h3>
            <p className="text-[12px] leading-relaxed" style={{ color: '#8C827A' }}>
              Complimentary express shipping across India on all orders.
            </p>
          </div>
          <div className="p-8 border flex flex-col gap-4" style={{ borderColor: 'rgba(245,240,235,0.05)', background: '#0b0b0f' }}>
            <span style={{ color: '#C9A96E' }}><RotateCcw size={24} /></span>
            <h3 className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#F5F0EB]">7-DAY EASY RETURNS</h3>
            <p className="text-[12px] leading-relaxed" style={{ color: '#8C827A' }}>
              Unhappy with your selection? Return or exchange unworn pieces within 7 days.
            </p>
          </div>
          <div className="p-8 border flex flex-col gap-4" style={{ borderColor: 'rgba(245,240,235,0.05)', background: '#0b0b0f' }}>
            <span style={{ color: '#C9A96E' }}><ShieldCheck size={24} /></span>
            <h3 className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#F5F0EB]">INSURED SHIPMENTS</h3>
            <p className="text-[12px] leading-relaxed" style={{ color: '#8C827A' }}>
              Every delivery is 100% insured until it reaches your doorstep for complete peace of mind.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="flex flex-col gap-12 text-left font-sans">
          
          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-[13px] font-bold tracking-[0.2em] text-[#C9A96E]">1. DOMESTIC SHIPPING</h2>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              All products are dispatched within 24-48 hours of order confirmation. Standard delivery times are 3-5 business days depending on your location. Deliveries to metro cities usually arrive within 2-3 business days.
            </p>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              Once shipped, you will receive an automated email and WhatsApp notification with your Blue Dart tracking number and link.
            </p>
          </section>

          <div style={{ height: '1px', background: 'rgba(245,240,235,0.05)' }} />

          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-[13px] font-bold tracking-[0.2em] text-[#C9A96E]">2. RETURN POLICY</h2>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              We offer a 7-day return and exchange policy for all items in their original, unused condition, including all original packaging, tags, and GIA certificates (if applicable).
            </p>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              Please note that custom-made, engraved, or modified jewelry pieces are final sale and cannot be returned or exchanged.
            </p>
          </section>

          <div style={{ height: '1px', background: 'rgba(245,240,235,0.05)' }} />

          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-[13px] font-bold tracking-[0.2em] text-[#C9A96E]">3. REFUND TIMELINE</h2>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              Once we receive your return, our quality assurance team will inspect the item. Approved returns will be processed within 5-7 business days, and the refund will be credited back to your original payment method (Razorpay/UPI/Bank Account).
            </p>
          </section>

          <div style={{ height: '1px', background: 'rgba(245,240,235,0.05)' }} />

          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-[13px] font-bold tracking-[0.2em] text-[#C9A96E]">NEED ASSISTANCE?</h2>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              If you have any questions regarding your shipment or need to start a return, please reach out to us at <a href="mailto:orders@zelix.shop" style={{ color: '#C9A96E' }}>orders@zelix.shop</a> or use our WhatsApp Support.
            </p>
          </section>

        </div>

        {/* Back Button */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/"
            className="font-mono text-[10px] font-bold tracking-[0.2em] border px-6 py-3 transition-colors text-[#F5F0EB]"
            style={{ borderColor: 'rgba(245,240,235,0.1)' }}
          >
            RETURN TO HOME
          </Link>
        </div>

      </div>
    </div>
  );
}
