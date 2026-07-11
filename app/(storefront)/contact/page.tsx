import React from 'react';
import { Mail, MapPin, AtSign, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      {/* Hero */}
      <section className="border-b border-black/10 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-4">ZELIX / CONTACT</span>
          <h1 className="font-black text-[40px] md:text-[60px] uppercase tracking-wide leading-none mb-6">
            GET IN<br />TOUCH
          </h1>
          <p className="font-mono text-[12px] text-neutral-600 max-w-lg leading-relaxed tracking-wide">
            WHETHER YOU HAVE A COLLABORATION IDEA, PRESS INQUIRY, OR JUST WANT TO TALK — WE'RE OPEN.
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-10">
            <div>
              <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase block mb-6">REACH US</span>
              <div className="flex flex-col gap-6">
                {[
                  { icon: <Mail size={16} />, label: 'EMAIL', value: 'zelixupdates@gmail.com', href: 'mailto:zelixupdates@gmail.com' },
                  { icon: <AtSign size={16} />, label: 'INSTAGRAM', value: '@zelix.gems', href: 'https://instagram.com/zelix.gems' },
                  { icon: <MessageCircle size={16} />, label: 'WHATSAPP', value: '8606213948', href: 'https://wa.me/8606213948' },
                  { icon: <MapPin size={16} />, label: 'LOCATION', value: 'CALICUT , INDIA', href: null },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 border border-black/10 rounded-sm flex items-center justify-center text-neutral-600 flex-shrink-0 mt-0.5">{item.icon}</div>
                    <div>
                      <span className="font-mono text-[9px] text-neutral-500 tracking-widest uppercase block mb-1">{item.label}</span>
                      {item.href ? (
                        <a href={item.href} className="font-mono text-[12px] text-black hover:text-neutral-600 transition-colors">{item.value}</a>
                      ) : (
                        <span className="font-mono text-[12px] text-black">{item.value}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-black/10 pt-8">
              <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase block mb-4">RESPONSE TIMES</span>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'GENERAL ENQUIRIES', time: '2–3 BUSINESS DAYS' },
                  { label: 'SUPPORT REQUESTS', time: 'WITHIN 24 HOURS' },
                  { label: 'PRESS & COLLABS', time: '3–5 BUSINESS DAYS' },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between font-mono text-[10px]">
                    <span className="text-neutral-600">{row.label}</span>
                    <span className="text-black">{row.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-black/10 pt-8">
              <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase block mb-4">QUICK LINKS</span>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'ORDER SUPPORT', href: '/contact-support' },
                  { label: 'FAQ', href: '/faq' },
                ].map((link, i) => (
                  <Link key={i} href={link.href} className="font-mono text-[11px] text-neutral-600 hover:text-black transition-colors flex items-center gap-2">
                    <span className="text-neutral-400">→</span> {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
