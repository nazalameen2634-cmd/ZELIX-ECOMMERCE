'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  {
    category: 'ORDERS',
    items: [
      { q: 'HOW DO I PLACE AN ORDER?', a: 'Browse our collections, select your size, and add items to your cart. Proceed to checkout, fill in your shipping details, and complete payment via Razorpay — our secure payment gateway.' },
      { q: 'CAN I MODIFY OR CANCEL MY ORDER?', a: 'Orders can be modified or cancelled within 1 hour of placement. After this window, the order enters fulfillment and cannot be changed. Please contact support immediately if you need to make a change.' },
      { q: 'HOW DO I TRACK MY ORDER?', a: 'Once your order is shipped, you will receive a tracking number via email. You can also view your tracking details in your account under "My Orders".' },
      { q: 'DO YOU OFFER CASH ON DELIVERY?', a: 'Yes, we offer Cash on Delivery (COD) for select pin codes across India. COD availability will be shown at checkout based on your delivery address.' },
    ],
  },
  {
    category: 'SHIPPING',
    items: [
      { q: 'HOW LONG DOES DELIVERY TAKE?', a: 'Standard delivery takes 3–5 business days. Express courier takes 1–2 business days. Delivery times may vary depending on your location.' },
      { q: 'IS SHIPPING FREE?', a: 'Yes — shipping is completely free on all orders, regardless of cart value.' },
      { q: 'DO YOU SHIP INTERNATIONALLY?', a: 'Currently, we only ship within India. International shipping is coming soon. Join our waitlist to be notified when we expand.' },
    ],
  },
  {
    category: 'RETURNS & EXCHANGES',
    items: [
      { q: 'WHAT IS YOUR RETURN POLICY?', a: 'We accept returns within 7 days of delivery. Items must be unworn, unwashed, and in their original packaging with tags attached.' },
      { q: 'HOW DO I INITIATE A RETURN?', a: 'Go to your account, select the order, and click "Request Return". Our team will arrange a reverse pickup within 2 business days.' },
      { q: 'HOW LONG DO REFUNDS TAKE?', a: 'Once we receive and inspect the returned item, refunds are processed within 5–7 business days to your original payment method.' },
    ],
  },
  {
    category: 'PRODUCTS',
    items: [
      { q: 'HOW DO I FIND MY SIZE?', a: 'Visit our Size Guide page for detailed measurements and fit recommendations. All Zelix garments are designed with a structured, oversized silhouette.' },
      { q: 'ARE YOUR PRODUCTS LIMITED EDITION?', a: 'Most Zelix drops are produced in limited quantities. Once a product sells out, it may not be restocked. Sign up for restock notifications on the product page.' },
      { q: 'HOW SHOULD I CARE FOR MY ZELIX PIECES?', a: 'Machine wash cold, inside out, on a gentle cycle. Do not tumble dry. Lay flat to dry. Avoid direct ironing on printed areas. Full care instructions are on the garment label.' },
    ],
  },
  {
    category: 'ACCOUNT & PAYMENTS',
    items: [
      { q: 'DO I NEED AN ACCOUNT TO ORDER?', a: 'You can checkout as a guest. However, creating an account lets you track orders, save addresses, and access exclusive early access drops.' },
      { q: 'IS MY PAYMENT INFORMATION SECURE?', a: 'Yes. All transactions are processed through Razorpay, which is PCI DSS Level 1 compliant. We do not store any card or banking details.' },
      { q: 'WHAT PAYMENT METHODS DO YOU ACCEPT?', a: 'We accept UPI, net banking, credit/debit cards, wallets (Paytm, PhonePe, etc.), and Cash on Delivery through our Razorpay integration.' },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center py-5 text-left group"
      >
        <span className="font-mono text-[11px] font-bold tracking-wide uppercase text-white group-hover:text-neutral-300 transition-colors pr-4">{q}</span>
        <span className="flex-shrink-0 text-neutral-500">
          {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>
      {open && (
        <div className="pb-5">
          <p className="font-mono text-[11px] text-neutral-400 leading-relaxed tracking-wide max-w-2xl">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('ORDERS');

  const current = faqs.find((f) => f.category === activeCategory) || faqs[0];

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero */}
      <section className="border-b border-white/5 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-4">ZELIX / SUPPORT</span>
          <h1 className="font-black text-[40px] md:text-[60px] uppercase tracking-wide leading-none mb-6">
            FREQUENTLY<br />ASKED
          </h1>
          <p className="font-mono text-[12px] text-neutral-400 max-w-lg leading-relaxed tracking-wide">
            ANSWERS TO OUR MOST COMMON QUESTIONS. CAN'T FIND WHAT YOU'RE LOOKING FOR?{' '}
            <a href="/contact-support" className="text-white underline underline-offset-4 hover:text-neutral-300 transition-colors">CONTACT SUPPORT →</a>
          </p>
        </div>
      </section>

      {/* Category Nav + Questions */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <div className="md:w-48 flex-shrink-0">
            <nav className="flex flex-row md:flex-col gap-1">
              {faqs.map((f) => (
                <button
                  key={f.category}
                  onClick={() => setActiveCategory(f.category)}
                  className={`text-left px-4 py-2.5 rounded-sm font-mono text-[9px] font-bold tracking-widest uppercase transition-all ${
                    activeCategory === f.category ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'
                  }`}
                >
                  {f.category}
                </button>
              ))}
            </nav>
          </div>

          {/* Questions */}
          <div className="flex-1">
            <h2 className="font-black text-[16px] uppercase tracking-wide mb-2">{current.category}</h2>
            <p className="font-mono text-[9px] text-neutral-600 tracking-widest mb-8">{current.items.length} QUESTIONS</p>
            <div>
              {current.items.map((item, i) => (
                <AccordionItem key={i} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
