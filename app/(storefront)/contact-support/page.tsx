'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Phone, Clock, ChevronRight, Send } from 'lucide-react';
import Link from 'next/link';

export default function ContactSupportPage() {
  const [form, setForm] = useState({ name: '', email: '', orderNumber: '', subject: '', message: '' });
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
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-4">ZELIX / SUPPORT</span>
          <h1 className="font-black text-[40px] md:text-[60px] uppercase tracking-wide leading-none mb-6">
            CONTACT<br />SUPPORT
          </h1>
          <p className="font-mono text-[12px] text-neutral-400 max-w-lg leading-relaxed tracking-wide">
            OUR SUPPORT TEAM IS AVAILABLE TO HELP YOU WITH ANY QUESTIONS ABOUT YOUR ORDER, PRODUCTS, OR ACCOUNT.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-16 px-6 border-b border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Mail size={20} />, label: 'EMAIL SUPPORT', value: 'support@zelix.store', sub: 'RESPONSE WITHIN 24 HRS', href: 'mailto:support@zelix.store' },
            { icon: <MessageSquare size={20} />, label: 'LIVE CHAT', value: 'START CHAT SESSION', sub: 'AVAILABLE MON–SAT', href: '#chat' },
            { icon: <Clock size={20} />, label: 'HOURS', value: '10 AM – 7 PM IST', sub: 'MONDAY TO SATURDAY', href: null },
          ].map((item, i) => (
            <div key={i} className="border border-white/5 rounded-sm p-6 hover:border-white/10 transition-colors group">
              <div className="text-neutral-500 group-hover:text-white transition-colors mb-4">{item.icon}</div>
              <span className="font-mono text-[9px] text-neutral-600 uppercase tracking-widest block mb-2">{item.label}</span>
              {item.href ? (
                <a href={item.href} className="font-bold text-[14px] uppercase text-white hover:text-neutral-300 transition-colors block mb-1">{item.value}</a>
              ) : (
                <span className="font-bold text-[14px] uppercase text-white block mb-1">{item.value}</span>
              )}
              <span className="font-mono text-[9px] text-neutral-600 tracking-widest">{item.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-black text-[22px] uppercase tracking-wide mb-2">SUBMIT A REQUEST</h2>
          <p className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase mb-10">FILL OUT THE FORM BELOW AND WE WILL GET BACK TO YOU SHORTLY</p>

          {submitted ? (
            <div className="border border-white/10 rounded-sm p-10 text-center">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-6">
                <Send size={18} />
              </div>
              <h3 className="font-black text-[18px] uppercase mb-3">REQUEST RECEIVED</h3>
              <p className="font-mono text-[11px] text-neutral-400 leading-relaxed">YOUR SUPPORT REQUEST HAS BEEN SUBMITTED. WE WILL RESPOND WITHIN 24 BUSINESS HOURS.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { id: 'name', label: 'FULL NAME', type: 'text', required: true },
                  { id: 'email', label: 'EMAIL ADDRESS', type: 'email', required: true },
                ].map(({ id, label, type, required }) => (
                  <div key={id}>
                    <label className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2">{label}</label>
                    <input
                      id={id}
                      type={type}
                      required={required}
                      value={(form as any)[id]}
                      onChange={(e) => setForm({ ...form, [id]: e.target.value })}
                      className="w-full bg-neutral-950 border border-white/5 focus:border-white/20 outline-none px-4 py-3 font-mono text-[11px] text-white rounded-sm transition-colors"
                    />
                  </div>
                ))}
              </div>
              <div>
                <label className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2">ORDER NUMBER (OPTIONAL)</label>
                <input
                  type="text"
                  value={form.orderNumber}
                  onChange={(e) => setForm({ ...form, orderNumber: e.target.value })}
                  className="w-full bg-neutral-950 border border-white/5 focus:border-white/20 outline-none px-4 py-3 font-mono text-[11px] text-white rounded-sm transition-colors"
                  placeholder="ORD-XXXXX"
                />
              </div>
              <div>
                <label className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2">SUBJECT</label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  required
                  className="w-full bg-neutral-950 border border-white/5 focus:border-white/20 outline-none px-4 py-3 font-mono text-[11px] text-white rounded-sm transition-colors"
                >
                  <option value="">SELECT A SUBJECT</option>
                  <option value="order">ORDER ISSUE</option>
                  <option value="return">RETURN / EXCHANGE</option>
                  <option value="payment">PAYMENT QUERY</option>
                  <option value="product">PRODUCT QUESTION</option>
                  <option value="other">OTHER</option>
                </select>
              </div>
              <div>
                <label className="block font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-2">MESSAGE</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-neutral-950 border border-white/5 focus:border-white/20 outline-none px-4 py-3 font-mono text-[11px] text-white rounded-sm transition-colors resize-none"
                />
              </div>
              <button
                type="submit"
                className="self-end flex items-center gap-2 bg-white hover:bg-neutral-200 text-black font-mono text-[10px] font-bold tracking-widest px-8 py-4 rounded-full uppercase transition-all"
              >
                <Send size={12} /> SUBMIT REQUEST
              </button>
            </form>
          )}

          <div className="mt-10 pt-8 border-t border-white/5">
            <p className="font-mono text-[10px] text-neutral-600 tracking-wide">
              NEED QUICK ANSWERS?&nbsp;
              <Link href="/faq" className="text-white hover:text-neutral-300 underline underline-offset-4 transition-colors">CHECK OUR FAQ</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
