'use client';

import React, { useState } from 'react';
import { Mail, MapPin, AtSign, Send } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Hero */}
      <section className="border-b border-white/5 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-4">ZELIX / CONTACT</span>
          <h1 className="font-black text-[40px] md:text-[60px] uppercase tracking-wide leading-none mb-6">
            GET IN<br />TOUCH
          </h1>
          <p className="font-mono text-[12px] text-neutral-400 max-w-lg leading-relaxed tracking-wide">
            WHETHER YOU HAVE A COLLABORATION IDEA, PRESS INQUIRY, OR JUST WANT TO TALK — WE'RE OPEN.
          </p>
        </div>
      </section>

      {/* Two columns */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* Left: Info */}
          <div className="flex flex-col gap-10">
            <div>
              <span className="font-mono text-[9px] tracking-widest text-neutral-600 uppercase block mb-6">REACH US</span>
              <div className="flex flex-col gap-6">
                {[
                  { icon: <Mail size={16} />, label: 'GENERAL ENQUIRIES', value: 'hello@zelix.store', href: 'mailto:hello@zelix.store' },
                  { icon: <Mail size={16} />, label: 'CUSTOMER SUPPORT', value: 'support@zelix.store', href: 'mailto:support@zelix.store' },
                  { icon: <AtSign size={16} />, label: 'INSTAGRAM', value: '@zelixofficial', href: 'https://instagram.com/zelixofficial' },
                  { icon: <MapPin size={16} />, label: 'LOCATION', value: 'INDIA', href: null },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 border border-white/5 rounded-sm flex items-center justify-center text-neutral-500 flex-shrink-0 mt-0.5">{item.icon}</div>
                    <div>
                      <span className="font-mono text-[9px] text-neutral-600 tracking-widest uppercase block mb-1">{item.label}</span>
                      {item.href ? (
                        <a href={item.href} className="font-mono text-[12px] text-white hover:text-neutral-300 transition-colors">{item.value}</a>
                      ) : (
                        <span className="font-mono text-[12px] text-white">{item.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-8">
              <span className="font-mono text-[9px] tracking-widest text-neutral-600 uppercase block mb-4">RESPONSE TIMES</span>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'GENERAL ENQUIRIES', time: '2–3 BUSINESS DAYS' },
                  { label: 'SUPPORT REQUESTS', time: 'WITHIN 24 HOURS' },
                  { label: 'PRESS & COLLABS', time: '3–5 BUSINESS DAYS' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between font-mono text-[10px]">
                    <span className="text-neutral-500">{row.label}</span>
                    <span className="text-white">{row.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/5 pt-8">
              <span className="font-mono text-[9px] tracking-widest text-neutral-600 uppercase block mb-4">QUICK LINKS</span>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'ORDER SUPPORT', href: '/contact-support' },
                  { label: 'FAQ', href: '/faq' },
                  { label: 'SIZE GUIDE', href: '/size-guide' },
                ].map((link, i) => (
                  <Link key={i} href={link.href} className="font-mono text-[11px] text-neutral-400 hover:text-white transition-colors flex items-center gap-2">
                    <span className="text-neutral-700">→</span> {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            <span className="font-mono text-[9px] tracking-widest text-neutral-600 uppercase block mb-6">SEND A MESSAGE</span>
            {submitted ? (
              <div className="border border-white/10 rounded-sm p-10 text-center h-full flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-6">
                  <Send size={18} />
                </div>
                <h3 className="font-black text-[18px] uppercase mb-3">MESSAGE SENT</h3>
                <p className="font-mono text-[11px] text-neutral-400 leading-relaxed">THANK YOU FOR REACHING OUT. WE'LL BE IN TOUCH SHORTLY.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2">YOUR NAME</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/5 focus:border-white/20 outline-none px-4 py-3 font-mono text-[11px] text-white rounded-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/5 focus:border-white/20 outline-none px-4 py-3 font-mono text-[11px] text-white rounded-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2">YOUR MESSAGE</label>
                  <textarea
                    required
                    rows={7}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-neutral-950 border border-white/5 focus:border-white/20 outline-none px-4 py-3 font-mono text-[11px] text-white rounded-sm transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="self-end flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-mono text-[10px] font-bold tracking-widest px-8 py-4 rounded-full uppercase transition-all"
                >
                  <Send size={12} /> SEND MESSAGE
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
