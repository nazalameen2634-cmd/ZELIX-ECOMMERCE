import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export const metadata = {
  title: 'Legal — ZELIX',
  description: 'Legal documents and policies for ZELIX.',
};

const legalDocs = [
  { title: 'PRIVACY POLICY', href: '/privacy-policy', desc: 'HOW WE COLLECT, USE, AND PROTECT YOUR PERSONAL INFORMATION.' },
  { title: 'TERMS OF SERVICE', href: '/terms-of-service', desc: 'THE RULES AND GUIDELINES GOVERNING YOUR USE OF ZELIX.' },
  { title: 'ACCESSIBILITY STATEMENT', href: '/accessibility', desc: 'OUR COMMITMENT TO AN INCLUSIVE AND ACCESSIBLE EXPERIENCE.' },
  { title: 'RETURN & REFUND POLICY', href: '/faq#returns', desc: 'CONDITIONS AND PROCEDURES FOR RETURNS AND REFUNDS.' },
  { title: 'SHIPPING POLICY', href: '/faq#shipping', desc: 'DELIVERY TIMELINES, METHODS, AND FREE SHIPPING TERMS.' },
];

export default function LegalPage() {
  return (
    <div className="bg-black text-white min-h-screen">
      <section className="border-b border-white/5 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <span className="font-mono text-[9px] tracking-[0.3em] text-neutral-500 uppercase block mb-4">ZELIX / LEGAL</span>
          <h1 className="font-black text-[40px] md:text-[60px] uppercase tracking-wide leading-none mb-6">LEGAL<br />DOCUMENTATION</h1>
          <p className="font-mono text-[12px] text-neutral-400 max-w-lg leading-relaxed tracking-wide">
            ALL OF ZELIX'S LEGAL POLICIES AND COMPLIANCE DOCUMENTS. PLEASE READ THESE CAREFULLY AS THEY GOVERN YOUR USE OF OUR SERVICES.
          </p>
        </div>
      </section>

      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          {legalDocs.map((doc, i) => (
            <Link
              key={i}
              href={doc.href}
              className="flex items-center justify-between border border-white/5 rounded-sm p-6 hover:border-white/15 hover:bg-white/[0.02] transition-all group"
            >
              <div>
                <span className="font-mono text-[9px] text-neutral-600 tracking-widest uppercase block mb-1">DOC {String(i + 1).padStart(2, '0')}</span>
                <h2 className="font-black text-[14px] uppercase tracking-wide mb-1">{doc.title}</h2>
                <p className="font-mono text-[10px] text-neutral-500 tracking-wide">{doc.desc}</p>
              </div>
              <ChevronRight size={16} className="text-neutral-600 group-hover:text-white transition-colors flex-shrink-0 ml-6" />
            </Link>
          ))}
        </div>

        <div className="max-w-3xl mx-auto mt-12 p-6 border border-white/5 rounded-sm">
          <p className="font-mono text-[10px] text-neutral-500 leading-relaxed tracking-wide">
            LAST UPDATED: JUNE 2025. IF YOU HAVE QUESTIONS ABOUT OUR LEGAL POLICIES, PLEASE CONTACT US AT{' '}
            <a href="mailto:legal@zelix.store" className="text-white underline underline-offset-4 hover:text-neutral-300 transition-colors">legal@zelix.store</a>
          </p>
        </div>
      </section>
    </div>
  );
}
