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
            <h3 className="font-mono text-[11px] font-bold tracking-[0.2em] text-[#F5F0EB]">FINAL SALE</h3>
            <p className="text-[12px] leading-relaxed" style={{ color: '#8C827A' }}>
              All purchases are final. Returns are only accepted for damaged or incorrect items with a valid unboxing video.
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
            <h2 className="font-mono text-[13px] font-bold tracking-[0.2em] text-[#C9A96E]">2. FINAL SALE POLICY</h2>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              All purchases made through ZELIX are considered final. We do not offer returns, exchanges, or refunds except in cases where a product is received damaged or an incorrect item is delivered.
            </p>
          </section>

          <div style={{ height: '1px', background: 'rgba(245,240,235,0.05)' }} />

          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-[13px] font-bold tracking-[0.2em] text-[#C9A96E]">3. IN-STORE PURCHASES</h2>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              For purchases made at our physical store, every product is thoroughly inspected before being handed over to the customer. Once an item has been sold and accepted, we cannot be held responsible for any damage, defects, or issues arising thereafter, as we are unable to verify how the product has been handled or used.
            </p>
          </section>

          <div style={{ height: '1px', background: 'rgba(245,240,235,0.05)' }} />

          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-[13px] font-bold tracking-[0.2em] text-[#C9A96E]">4. DAMAGED OR INCORRECT ORDERS</h2>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              If you receive a damaged product or an item different from what you ordered, please contact us within 48 hours of delivery.
            </p>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              To process your request, an unboxing video is mandatory. Claims submitted without a valid unboxing video cannot be reviewed.
            </p>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF] font-semibold mt-2">The unboxing video must:</p>
            <ul className="list-disc pl-5 text-[14px] leading-relaxed text-[#D4CBBF] flex flex-col gap-1">
              <li>Show the sealed package from all sides (360° view) before opening.</li>
              <li>Record the entire unboxing process in one continuous video.</li>
              <li>Contain no cuts, edits, pauses, or interruptions.</li>
              <li>Clearly display the damaged or incorrect product received.</li>
            </ul>
          </section>

          <div style={{ height: '1px', background: 'rgba(245,240,235,0.05)' }} />

          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-[13px] font-bold tracking-[0.2em] text-[#C9A96E]">5. RETURN ELIGIBILITY</h2>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              If your claim is approved, the product must be:
            </p>
            <ul className="list-disc pl-5 text-[14px] leading-relaxed text-[#D4CBBF] flex flex-col gap-1">
              <li>Unused and in its original condition.</li>
              <li>Returned with all original packaging, tags, accessories, and invoices.</li>
              <li>Shipped back within the timeframe communicated by our support team.</li>
            </ul>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF] mt-2">
              Once the returned product is received and successfully inspected, any eligible refund will be processed within 3 working days to the original payment method, where applicable.
            </p>
          </section>

          <div style={{ height: '1px', background: 'rgba(245,240,235,0.05)' }} />

          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-[13px] font-bold tracking-[0.2em] text-[#C9A96E]">6. NON-RETURNABLE CASES</h2>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              Returns, exchanges, or refunds will not be accepted for:
            </p>
            <ul className="list-disc pl-5 text-[14px] leading-relaxed text-[#D4CBBF] flex flex-col gap-1">
              <li>Change of mind.</li>
              <li>Incorrect size, color, or design selection made by the customer.</li>
              <li>Normal wear and tear.</li>
              <li>Damage caused after delivery due to misuse, improper handling, accidental damage, or inadequate care.</li>
              <li>Claims submitted without a valid unboxing video.</li>
              <li>Claims reported more than 48 hours after delivery.</li>
            </ul>
          </section>

          <div style={{ height: '1px', background: 'rgba(245,240,235,0.05)' }} />

          <section className="flex flex-col gap-4">
            <h2 className="font-mono text-[13px] font-bold tracking-[0.2em] text-[#C9A96E]">CONTACT US</h2>
            <p className="text-[14px] leading-relaxed text-[#D4CBBF]">
              If you have any questions regarding your order or this policy, our support team is always happy to assist you.
            </p>
            <div className="text-[14px] leading-relaxed text-[#D4CBBF] mt-2">
              <strong>ZELIX Customer Support</strong><br/>
              Customer Support: 8606213948<br/>
              Website: <a href="https://www.zelix.shop" style={{ color: '#C9A96E' }}>www.zelix.shop</a>
            </div>
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
