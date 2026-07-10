'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';

const SUPPORT_LINKS = [
  { label: 'Shipping & Returns', href: '/shipping-returns' },
  { label: 'Contact Support',    href: '/contact' },
  { label: 'Size Guide',         href: '/size-guide' },
  { label: 'FAQ',                href: '/faq' },
];
const LEGAL_LINKS = [
  { label: 'Privacy Policy',  href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
  { label: 'Accessibility',   href: '/accessibility' },
];
const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
  {
    label: 'Twitter',
    href: 'https://x.com',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
          toast('ALREADY SUBSCRIBED', 'info');
        } else {
          toast('SUBSCRIPTION FAILED. PLEASE TRY AGAIN.', 'error');
        }
      } else {
        toast('WELCOME TO ZELIX', 'success');
        setEmail('');
      }
    } catch {
      toast('WELCOME TO ZELIX (PREVIEW)', 'success');
      setEmail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full mt-auto bg-background border-t border-border">

      {/* ─── Brand hero strip ─── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 border-b border-border">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Left: Wordmark + tagline */}
          <div className="flex flex-col gap-4">
            <div className="font-serif font-bold text-foreground text-4xl uppercase tracking-widest">
              ZELIX
            </div>
            <p className="font-sans text-sm tracking-wide text-muted max-w-xs">
              ELEVATING THE EVERYDAY.<br />DESIGNED WITH PURPOSE.
            </p>
          </div>


        </div>
      </div>

      {/* ─── Links grid ─── */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-16 border-b border-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12">

          {/* Shop */}
          <div>
            <h4 className="font-sans text-xs font-semibold tracking-widest uppercase mb-6 text-foreground">
              Shop
            </h4>
            <ul className="flex flex-col gap-4">
              {['New Arrivals', 'Outerwear', 'Apparel', 'Footwear', 'Accessories'].map((item) => (
                <li key={item}>
                  <Link
                    href={`/products?category=${item.toLowerCase().replace(' ', '-')}`}
                    className="font-sans text-sm text-muted hover:text-accent transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-sans text-xs font-semibold tracking-widest uppercase mb-6 text-foreground">
              Support
            </h4>
            <ul className="flex flex-col gap-4">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-muted hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-sans text-xs font-semibold tracking-widest uppercase mb-6 text-foreground">
              Legal
            </h4>
            <ul className="flex flex-col gap-4">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-muted hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Follow */}
          <div>
            <h4 className="font-sans text-xs font-semibold tracking-widest uppercase mb-6 text-foreground">
              Follow
            </h4>
            <ul className="flex flex-col gap-4">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 font-sans text-sm text-muted hover:text-accent transition-colors duration-200"
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
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-sans text-xs tracking-widest uppercase text-muted">
            © 2026 ZELIX. ALL RIGHTS RESERVED.
          </span>
          <span className="font-sans text-xs tracking-widest uppercase text-muted">
            Global Design
          </span>
        </div>
      </div>
    </footer>
  );
}
