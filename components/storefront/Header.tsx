'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, User, Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
  onSearchOpen: () => void;
  onCartOpen: () => void;
}

const NAV_LINKS = [
  {
    label: 'SHOP',
    href: '/products',
    sub: [
      { label: 'NEW ARRIVALS', href: '/products?sort=newest' },
      { label: 'OUTERWEAR',   href: '/products?category=outerwear' },
      { label: 'APPAREL',     href: '/products?category=apparel' },
      { label: 'FOOTWEAR',    href: '/products?category=footwear' },
      { label: 'ACCESSORIES', href: '/products?category=accessories' },
    ],
  },
  { label: 'ABOUT',   href: '/about',   sub: [] },
  { label: 'CONTACT', href: '/contact', sub: [] },
];

export default function Header({ onSearchOpen, onCartOpen }: HeaderProps) {
  const pathname = usePathname();
  const { itemCount, isCartBouncing } = useCart();
  const { user, isAdmin } = useAuth();

  const [isScrolled, setIsScrolled]           = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown]     = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between transition-all duration-700 ${
          isScrolled
            ? 'h-[64px] px-8 md:px-16 bg-[rgba(6,6,6,0.92)] backdrop-blur-2xl border-b border-[rgba(245,240,235,0.07)]'
            : 'h-[80px] px-8 md:px-16 bg-transparent border-b border-transparent'
        }`}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        {/* Left — Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10 flex-1">
          {NAV_LINKS.map((link) => (
            <div
              key={link.href}
              className="relative group"
              onMouseEnter={() => link.sub.length > 0 ? setActiveDropdown(link.href) : setActiveDropdown(null)}
            >
              <Link
                href={link.href}
                className={`flex items-center gap-1 font-mono text-[10px] font-bold tracking-[0.2em] transition-all duration-300 pb-0.5 border-b ${
                  pathname === link.href || pathname.startsWith(link.href + '?')
                    ? 'text-[#C9A96E] border-[#C9A96E]'
                    : 'text-[#9A9490] border-transparent hover:text-[#F5F0EB] hover:border-[#C9A96E]'
                }`}
              >
                {link.label}
                {link.sub.length > 0 && (
                  <ChevronDown size={9} className={`transition-transform duration-200 ${activeDropdown === link.href ? 'rotate-180' : ''}`} />
                )}
              </Link>

              {/* Mega dropdown */}
              <AnimatePresence>
                {activeDropdown === link.href && link.sub.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full left-0 mt-4 w-52 bg-[rgba(10,10,10,0.98)] backdrop-blur-2xl border border-[rgba(245,240,235,0.07)] rounded-[2px] py-3 shadow-[0_24px_80px_rgba(0,0,0,0.7)]"
                    onMouseEnter={() => setActiveDropdown(link.href)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {link.sub.map((sub) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="flex items-center justify-between px-5 py-3 font-mono text-[9px] font-bold tracking-[0.18em] text-[#6B6560] hover:text-[#C9A96E] hover:bg-[rgba(201,169,110,0.04)] transition-all duration-200 group/sub"
                      >
                        {sub.label}
                        <ArrowRight size={9} className="opacity-0 group-hover/sub:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        {/* Left — Mobile hamburger */}
        <div className="flex lg:hidden flex-1 justify-start">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 text-[#9A9490] hover:text-[#F5F0EB] transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Center — Brand wordmark */}
        {/* Center — Brand wordmark */}
        <Link
          href="/"
          className="text-center select-none group/logo"
        >
          <span className="block font-sans text-[20px] md:text-[24px] font-black tracking-[0.3em] text-[#F5F0EB] group-hover/logo:text-[#C9A96E] transition-colors duration-500 uppercase ml-[0.3em]">
            ZELIX
          </span>
        </Link>

        {/* Right — Icon Actions */}
        <div className="flex items-center gap-7 flex-1 justify-end">
          {/* Search */}
          <button
            onClick={onSearchOpen}
            className="text-[#6B6560] hover:text-[#F5F0EB] transition-colors duration-300 cursor-pointer"
            aria-label="Search"
          >
            <Search size={17} />
          </button>

          {/* Account */}
          <Link
            href={isAdmin ? '/admin' : user ? '/account' : '/account/login'}
            className={`transition-colors duration-300 ${
              pathname.startsWith('/admin') || pathname.startsWith('/account')
                ? 'text-[#C9A96E]'
                : 'text-[#6B6560] hover:text-[#F5F0EB]'
            }`}
            aria-label="Account"
          >
            <User size={17} />
          </Link>

          {/* Cart */}
          <button
            id="cart-icon-btn"
            onClick={onCartOpen}
            className="relative text-[#6B6560] hover:text-[#F5F0EB] transition-colors duration-300 cursor-pointer"
            aria-label="Shopping bag"
          >
            <motion.div animate={isCartBouncing ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.35 }}>
              <ShoppingBag size={17} />
            </motion.div>
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key="cart-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="absolute -top-2 -right-2.5 flex items-center justify-center w-4 h-4 rounded-full text-[8px] font-bold font-mono"
                  style={{ background: '#C9A96E', color: '#080808' }}
                >
                  {itemCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </header>

      {/* ─── Full-Screen Mobile Menu ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ clipPath: 'inset(0 0 100% 0)' }}
            animate={{ clipPath: 'inset(0 0 0% 0)' }}
            exit={{ clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] bg-[#060606] flex flex-col"
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-8 h-[80px] border-b border-[rgba(245,240,235,0.06)]">
              <span className="font-sans text-[20px] font-black tracking-[0.25em] text-[#F5F0EB]">
                ZELIX
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-[#6B6560] hover:text-[#F5F0EB] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex flex-col justify-center flex-1 px-10 gap-2">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -32 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-5 border-b border-[rgba(245,240,235,0.05)] group"
                  >
                    <span
                      className={`font-sans text-[36px] font-bold tracking-tight uppercase leading-none transition-colors duration-300 ${
                        pathname === link.href ? 'text-[#C9A96E]' : 'text-[rgba(245,240,235,0.6)] group-hover:text-[#F5F0EB]'
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}

              {/* Account link */}
              <motion.div
                initial={{ opacity: 0, x: -32 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + NAV_LINKS.length * 0.08, duration: 0.5 }}
                className="mt-8"
              >
                <Link
                  href={isAdmin ? '/admin' : user ? '/account' : '/account/login'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 font-mono text-[10px] font-bold tracking-[0.22em] text-[#6B6560] hover:text-[#C9A96E] transition-colors"
                >
                  <User size={13} />
                  {isAdmin ? 'ADMIN CONSOLE' : user ? 'MY ACCOUNT' : 'LOGIN / REGISTER'}
                </Link>
              </motion.div>
            </div>

            {/* Footer */}
            <div className="px-10 pb-10 flex items-center justify-between">
              <span className="font-mono text-[8px] font-bold tracking-[0.2em] text-[#282420]">
                © 2026 ZELIX. ALL RIGHTS RESERVED.
              </span>
              <span className="font-mono text-[8px] tracking-[0.15em] text-[#282420]">
                DESIGNED IN INDIA
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
