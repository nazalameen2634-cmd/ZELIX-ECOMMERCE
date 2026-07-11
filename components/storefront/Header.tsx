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
  { label: 'NEW IN', href: '/products?category=new-arrivals', sub: [] },
  { label: 'RINGS', href: '/products?category=rings', sub: [] },
  { label: 'NECKLACES', href: '/products?category=necklaces', sub: [] },
  { label: 'EARRINGS', href: '/products?category=earrings', sub: [] },
  { label: 'BRACELETS', href: '/products?category=bracelets', sub: [] },
  { label: 'COLLECTIONS', href: '/products?category=collections', sub: [] },
  { label: 'ABOUT', href: '/about', sub: [] },
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
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[64px] lg:h-[80px] px-4 md:px-8 lg:px-16 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-border shadow-sm transition-all duration-300"
        onMouseLeave={() => setActiveDropdown(null)}
      >
        {/* Mobile hamburger (Left on mobile) */}
        <div className="flex lg:hidden flex-1 justify-start">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1 text-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Brand wordmark (Center on mobile, Left on desktop) */}
        <div className="flex-1 flex justify-center lg:justify-start">
          <Link href="/" className="select-none group/logo">
            <span className="block font-serif text-[20px] md:text-[24px] lg:text-[28px] font-bold tracking-[0.2em] text-foreground group-hover/logo:text-accent transition-colors duration-500 uppercase">
              ZELIX
            </span>
          </Link>
        </div>

        {/* Center — Desktop Nav */}
        <nav className="hidden lg:flex items-center justify-center gap-8 flex-[2]">
          {NAV_LINKS.map((link) => (
            <div
              key={link.href}
              className="relative group"
              onMouseEnter={() => link.sub.length > 0 ? setActiveDropdown(link.href) : setActiveDropdown(null)}
            >
              <Link
                href={link.href}
                className={`flex items-center gap-1 font-sans text-[11px] font-semibold tracking-[0.1em] transition-all duration-300 pb-0.5 border-b-2 ${
                  pathname === link.href || pathname.startsWith(link.href + '?')
                    ? 'text-accent border-accent'
                    : 'text-muted border-transparent hover:text-foreground hover:border-accent'
                }`}
              >
                {link.label}
                {link.sub.length > 0 && (
                  <ChevronDown size={10} className={`transition-transform duration-200 ${activeDropdown === link.href ? 'rotate-180' : ''}`} />
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
                    className="absolute top-full left-0 mt-4 w-52 bg-white backdrop-blur-2xl border border-border rounded-lg py-3 shadow-xl"
                    onMouseEnter={() => setActiveDropdown(link.href)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    {link.sub.map((sub: any) => (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="flex items-center justify-between px-5 py-3 font-sans text-[10px] font-semibold tracking-[0.1em] text-muted hover:text-accent hover:bg-gray-50 transition-all duration-200 group/sub"
                      >
                        {sub.label}
                        <ArrowRight size={10} className="opacity-0 group-hover/sub:opacity-100 transition-opacity" />
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>

        

        {/* Right — Icon Actions */}
        <div className="flex items-center gap-7 flex-1 justify-end">
          {/* Search */}
          <button
            onClick={onSearchOpen}
            className="text-muted hover:text-foreground transition-colors duration-300 cursor-pointer"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* User Profile / Login */}
          <Link
            href={user ? "/profile" : "/login"}
            className="text-muted hover:text-foreground transition-colors duration-300 cursor-pointer"
            aria-label={user ? "Profile" : "Login"}
          >
            <User size={18} />
          </Link>

          {/* Cart */}
          <button
            id="cart-icon-btn"
            onClick={onCartOpen}
            className="relative text-muted hover:text-foreground transition-colors duration-300 cursor-pointer"
            aria-label="Shopping bag"
          >
            <motion.div animate={isCartBouncing ? { scale: [1, 1.25, 1] } : {}} transition={{ duration: 0.35 }}>
              <ShoppingBag size={18} />
            </motion.div>
            <AnimatePresence>
              {itemCount > 0 && (
                <motion.span
                  key="cart-badge"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="absolute -top-2 -right-2.5 flex items-center justify-center w-[18px] h-[18px] rounded-full text-[9px] font-bold font-sans bg-accent text-white"
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
            className="fixed inset-0 z-[60] bg-background flex flex-col"
          >
            {/* Header row */}
            <div className="flex items-center justify-between px-8 h-[80px] border-b border-border">
              <span className="font-serif text-[24px] font-bold tracking-[0.2em] text-foreground">
                ZELIX
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted hover:text-foreground transition-colors cursor-pointer bg-white p-2 rounded-full shadow-sm"
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
                    className="block py-5 border-b border-border group"
                  >
                    <span
                      className={`font-serif text-[32px] font-semibold tracking-tight uppercase leading-none transition-colors duration-300 ${
                        pathname === link.href ? 'text-accent' : 'text-muted group-hover:text-foreground'
                      }`}
                    >
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-10 pb-10 flex items-center justify-between text-muted font-sans text-xs uppercase tracking-widest">
              <span>
                © 2026 ZELIX
              </span>
              <span>
                ELEVATED LIVING
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
