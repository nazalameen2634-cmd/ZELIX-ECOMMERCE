'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

const SUPPORT_LINKS = [
  { label: 'SHIPPING & RETURNS', href: '/shipping-returns' },
  { label: 'CONTACT SUPPORT',    href: '/contact' },
  { label: 'SIZE GUIDE',         href: '/size-guide' },
  { label: 'FAQ',                href: '/faq' },
];
const LEGAL_LINKS = [
  { label: 'PRIVACY POLICY',  href: '/privacy-policy' },
  { label: 'TERMS OF SERVICE', href: '/terms-of-service' },
  { label: 'ACCESSIBILITY',   href: '/accessibility' },
];
const SOCIAL_LINKS = [
  {
    label: 'INSTAGRAM',
    href: 'https://instagram.com',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'X / TWITTER',
    href: 'https://x.com',
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l11.733 16h4.267l-11.733-16z"/><path d="M4 20l6.768-6.768m2.46-2.46l6.772-6.772"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const { toast } = useToast();
  const [email, setEmail]           = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('subscribers').insert([{ email }]);
      if (error) {
        if (error.code === '23505') {
          toast('ALREADY SUBSCRIBED TO THE INNER CIRCLE', 'info');
        } else {
          toast('SUBSCRIPTION FAILED. PLEASE TRY AGAIN.', 'error');
        }
      } else {
        toast('WELCOME TO THE ZELIX INNER CIRCLE', 'success');
        setEmail('');
      }
    } catch {
      toast('WELCOME TO THE ZELIX INNER CIRCLE (PREVIEW)', 'success');
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer style={{ background: '#060606', borderTop: '1px solid rgba(245,240,235,0.05)' }} className="w-full mt-auto">

      {/* ─── Brand hero strip ─── */}
      <div className="container-custom py-20 border-b" style={{ borderColor: 'rgba(245,240,235,0.05)' }}>
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Left: Wordmark + tagline */}
          <div className="flex flex-col gap-5">
            <div
              className="font-sans font-black tracking-widest text-[#F5F0EB] text-[40px] uppercase mb-1"
            >
              ZELIX
            </div>
            <p className="font-mono text-[9px] tracking-[0.2em] max-w-xs" style={{ color: '#4A4642' }}>
              POST-MODERN TECHNICAL WEAR.<br />DESIGNED IN INDIA.
            </p>
          </div>

          {/* Right: Newsletter */}
          <div className="w-full lg:max-w-sm">
            <div className="section-label mb-5">PRIVATE INNER CIRCLE</div>
            <p className="font-mono text-[10px] tracking-[0.14em] leading-relaxed mb-6" style={{ color: '#6B6560' }}>
              Early release access, private sales, and rare archive drops — reserved for subscribers.
            </p>
            <form onSubmit={handleSubscribe} className="flex items-end gap-3 border-b pb-3" style={{ borderColor: 'rgba(245,240,235,0.14)' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ENTER YOUR EMAIL"
                disabled={isSubmitting}
                className="flex-1 bg-transparent font-mono text-[10px] tracking-[0.15em] outline-none placeholder-[#4A4642] disabled:opacity-50"
                style={{ color: '#F5F0EB' }}
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-[0.2em] cursor-pointer transition-colors duration-300 disabled:opacity-40"
                style={{ color: '#C9A96E' }}
              >
                {isSubmitting ? '...' : <><span>JOIN</span><ArrowRight size={10} /></>}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* ─── Links grid ─── */}
      <div className="container-custom py-16 border-b" style={{ borderColor: 'rgba(245,240,235,0.05)' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Shop */}
          <div>
            <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-6" style={{ color: '#F5F0EB' }}>
              SHOP
            </h4>
            <ul className="flex flex-col gap-3.5">
              {['NEW ARRIVALS', 'OUTERWEAR', 'APPAREL', 'FOOTWEAR', 'ACCESSORIES'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/products?category=${item.toLowerCase().replace(' ', '-')}`}
                    className="font-mono text-[10px] tracking-[0.12em] transition-colors duration-200"
                    style={{ color: '#4A4642' }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#C9A96E')}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#4A4642')}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-6" style={{ color: '#F5F0EB' }}>
              SUPPORT
            </h4>
            <ul className="flex flex-col gap-3.5">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-mono text-[10px] tracking-[0.12em] transition-colors duration-200"
                    style={{ color: '#4A4642' }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#C9A96E')}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#4A4642')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-6" style={{ color: '#F5F0EB' }}>
              LEGAL
            </h4>
            <ul className="flex flex-col gap-3.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-mono text-[10px] tracking-[0.12em] transition-colors duration-200"
                    style={{ color: '#4A4642' }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#C9A96E')}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#4A4642')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow */}
          <div>
            <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-6" style={{ color: '#F5F0EB' }}>
              FOLLOW
            </h4>
            <ul className="flex flex-col gap-3.5">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 font-mono text-[10px] tracking-[0.12em] transition-colors duration-200"
                    style={{ color: '#4A4642' }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#C9A96E')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#4A4642')}
                  >
                    {link.icon} {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Bottom bar ─── */}
      <div className="container-custom py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-mono text-[8px] tracking-[0.18em]" style={{ color: '#282420' }}>
            © 2026 ZELIX. ALL RIGHTS RESERVED.
          </span>
          <span className="font-mono text-[8px] tracking-[0.14em]" style={{ color: '#282420' }}>
              DESIGNED IN INDIA
            </span>
        </div>
      </div>
    </footer>
  );
}
