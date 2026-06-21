'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, Category, HeroSlide } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import OrderTrackingSection from '@/components/storefront/OrderTrackingSection';

// ─── Default Data ──────────────────────────────────────────
const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1800&auto=format&fit=crop',
    heading: 'FORM FOLLOWS UTILITY',
    subheading: 'SUMMER DROP VOL. 01 — TECHNICAL STREETWEAR BUILT FOR POST-MODERN ENVIRONMENTS.',
    cta_text: 'EXPLORE THE COLLECTION',
    cta_link: '/products',
    sort_order: 1,
    is_active: true,
  },
  {
    id: 'slide-2',
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1800&auto=format&fit=crop',
    heading: 'TACTICAL LAYERS',
    subheading: 'WATERPROOF MEMBRANES, FIDLOCK LOCKS & HARD SHELLS DESIGNED FOR RESILIENCE.',
    cta_text: 'SHOP OUTERWEAR',
    cta_link: '/products?category=outerwear',
    sort_order: 2,
    is_active: true,
  },
  {
    id: 'slide-3',
    image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1800&auto=format&fit=crop',
    heading: 'CORE SYSTEM',
    subheading: 'HEAVYWEIGHT ESSENTIALS IN 500GSM COTTON TERRY AND PREMIUM MERINO WOOL.',
    cta_text: 'SHOP ESSENTIALS',
    cta_link: '/products?category=apparel',
    sort_order: 3,
    is_active: true,
  },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-1', title: 'MATRIX PARKA COAT', slug: 'matrix-parka-coat', price: 26000, sale_price: 21999,
    sale_start: null, sale_end: null,
    description: 'Immersive full-length technical coat. Waterproof membrane, magnetic collar lock, and adjustable harness system.',
    category_id: 'cat-1', sku: 'ZLX-OUT-MPK', stock_quantity: 12, track_inventory: true,
    allow_backorders: false, status: 'draft', meta_title: '', meta_description: '',
    tags: ['OUTERWEAR', 'PREMIUM'], created_at: '2026-06-18T12:00:00Z', updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p-2', title: 'SILENT RUNNER BOOTS', slug: 'silent-runner-boots', price: 38000, sale_price: null,
    sale_start: null, sale_end: null,
    description: 'Chunky hybrid combat boot with vibram sole, quick-lace locking mechanism, and premium Italian distressed leather.',
    category_id: 'cat-2', sku: 'ZLX-FOT-SRB', stock_quantity: 5, track_inventory: true,
    allow_backorders: false, status: 'draft', meta_title: '', meta_description: '',
    tags: ['FOOTWEAR', 'LIMITED'], created_at: '2026-06-18T12:00:00Z', updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p-3', title: 'ECLIPSE OVERSIZED HOODIE', slug: 'eclipse-oversized-hoodie', price: 12000, sale_price: null,
    sale_start: null, sale_end: null,
    description: 'Heavyweight 500GSM organic cotton hoodie. Drop shoulder silhouette, invisible side pockets, raw-edge seam details.',
    category_id: 'cat-3', sku: 'ZLX-APP-EOH', stock_quantity: 24, track_inventory: true,
    allow_backorders: false, status: 'draft', meta_title: '', meta_description: '',
    tags: ['APPAREL', 'ESSENTIALS'], created_at: '2026-06-18T12:00:00Z', updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
  },
  {
    id: 'p-4', title: 'KINETIC UTILITY TROUSERS', slug: 'kinetic-utility-trousers', price: 18000, sale_price: 14999,
    sale_start: null, sale_end: null,
    description: 'Ergonomic trousers with modular cargo compartments, articulated knees, and custom nylon web belt.',
    category_id: 'cat-3', sku: 'ZLX-APP-KUT', stock_quantity: 8, track_inventory: true,
    allow_backorders: false, status: 'draft', meta_title: '', meta_description: '',
    tags: ['APPAREL', 'UTILITY'], created_at: '2026-06-18T12:00:00Z', updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
  },
];

const LIVE_CATEGORIES = [
  { id: '1', name: 'Accessories', slug: 'accessories', image_url: '/products/sunglasses.png', description: 'Avant-garde visor sunglasses, Cuban links, tactical chest rigs, and cuff beanies.' },
  { id: '2', name: 'Pants',       slug: 'pants',       image_url: '/products/cargo.png',      description: 'Functional cargo trousers, parachute balloon pants, and tech joggers.' },
  { id: '3', name: 'Shoes',       slug: 'shoes',       image_url: '/products/sneakers.png',   description: 'Futuristic runner silhouettes, cyber high-tops, and cushioned knit slides.' },
  { id: '4', name: 'T-Shirts',    slug: 'tshirt',      image_url: '/products/hoodie.png',     description: 'Minimalist unisex tees featuring premium heavy combed cotton construction.' },
  { id: '5', name: 'Tracksuits',  slug: 'track',       image_url: '/products/hoodie.png',     description: 'Technical track jackets, windbreakers, fusion kurtas, and streetwear hoodies.' },
];

// ─── Testimonials ───────────────────────────────────────────
const TESTIMONIALS = [
  { quote: '"ZELIX cargo trousers are the finest tactical gear I have worn. The water resistance is extraordinary—and the silhouette is perfectly oversized. Worth every rupee."', name: 'RITESH K.', location: 'MUMBAI' },
  { quote: '"The 500GSM hoodie feels like wearing structured armour yet impossibly soft inside. The fit is flawless. I am already waiting for Drop 02."', name: 'NEHA S.', location: 'BENGALURU' },
  { quote: '"I ordered the Matrix Parka for a winter trip. People stopped me every single day asking where I bought it. Nothing else looks like ZELIX."', name: 'ARJUN M.', location: 'DELHI' },
];

// ─── Marquee Content ───────────────────────────────────────
const MARQUEE_ITEMS = [
  'UNISEX ARCHIVE', 'TECHNICAL MODULARITY', 'HEAVYWEIGHT ORGANICS',
  'UV400 OPTICS', 'VIBRAM OUTSOLES', 'FORM FOLLOWS UTILITY',
  'DROP VOL. 01', 'POST-MODERN SILHOUETTES', 'WATERPROOF MEMBRANES',
];

// ─── Stagger container ─────────────────────────────────────
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const fadeUpItem = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] } },
};

export default function HomePage() {
  const [heroSlides, setHeroSlides]     = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [activeSlide, setActiveSlide]   = useState(0);
  const [newArrivals, setNewArrivals]   = useState<Product[]>(MOCK_PRODUCTS);
  const [bestSellers, setBestSellers]   = useState<Product[]>(MOCK_PRODUCTS);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [announcement, setAnnouncement] = useState({ active: true, text: '' });
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroParallax  = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroOpacity   = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const intervalRef   = useRef<NodeJS.Timeout | null>(null);

  // ─── Data fetch ────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const { data: slides } = await supabase.from('hero_slides').select('*').eq('is_active', true).order('sort_order');
        if (slides?.length) setHeroSlides(slides);

        const { data: news } = await supabase.from('products').select('*, images:product_images(*)').eq('status', 'active').order('created_at', { ascending: false }).limit(4);
        if (news?.length) setNewArrivals(news as Product[]);

        const { data: best } = await supabase.from('products').select('*, images:product_images(*)').eq('status', 'active').limit(4);
        if (best?.length) setBestSellers(best as Product[]);

        const { data: cats } = await supabase.from('categories').select('*').order('sort_order');
        if (cats) setCategories(cats as Category[]);

        const { data: settings } = await supabase.from('site_settings').select('announcement_bar_active, announcement_bar_text').single();
        if (settings) setAnnouncement({ active: settings.announcement_bar_active, text: settings.announcement_bar_text });
      } catch {
        console.warn('Supabase offline. Premium preview catalog active.');
      }
    }
    loadData();
  }, []);

  // ─── Carousel auto-advance ─────────────────────────────
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveSlide((p) => (p + 1) % heroSlides.length);
    }, 7000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [heroSlides]);

  const goToSlide = (i: number) => {
    setActiveSlide(i);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => setActiveSlide((p) => (p + 1) % heroSlides.length), 7000);
  };

  // ─── Testimonial auto-advance ──────────────────────────
  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  const displayCategories = LIVE_CATEGORIES;

  return (
    <div className="flex flex-col w-full min-h-screen" style={{ background: '#080808' }}>

      {/* ═══════════════════════════════════
          1. ANNOUNCEMENT BAR
      ═══════════════════════════════════ */}
      {announcement.active && (
        <div className="border-b overflow-hidden select-none flex items-center" style={{ background: '#C9A96E', borderColor: 'rgba(245,240,235,0.1)', height: '36px' }}>
          <div className="flex animate-marquee-fast">
            {Array(10).fill(announcement.text || 'SUMMER DROP VOL. 01 OUT NOW // FREE SHIPPING ABOVE ₹5,000 // EXPLORE THE COLLECTION').map((t, i) => (
              <span key={i} className="shrink-0 mx-12 font-mono font-bold tracking-[0.18em] text-[9px] uppercase" style={{ color: '#080808' }}>
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════
          2. HERO SECTION — COPIED FROM LIVE
      ═══════════════════════════════════ */}
      <section ref={heroRef} className="relative h-[85vh] flex items-center justify-center overflow-hidden border-b border-border">
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-background z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)]" />
        
        {/* Background Image */}
        <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
          <img
            alt="Hero Background"
            className="object-cover object-center w-full h-full scale-105 blur-sm"
            src="/products/cargo.png"
          />
        </div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-20 flex flex-col items-center">
          <span className="inline-block border border-accent/40 text-accent text-[10px] font-mono font-bold uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-full mb-6 bg-accent/5 animate-pulse-glow">
            Summer Drop // Volume 01
          </span>
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter text-white uppercase select-none mb-6">
            ZELIX<span className="text-zinc-600 font-light font-mono">//</span>WEAR
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground uppercase tracking-widest max-w-xl mb-10 leading-relaxed font-light">
            Sleek technical activewear and streetwear silhouetted for the post-modern aesthetic. Genderless &amp; heavy duty.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors rounded"
            >
              Shop Collections
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right h-4 w-4"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </Link>
            <Link
              href="/products?category=track"
              className="inline-flex items-center justify-center px-8 py-4 glass text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all rounded"
            >
              View Lookbook
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          4. CATEGORIES — BROWSE BY CATEGORY
      ═══════════════════════════════════ */}
      <section className="bg-[#0d0d11] border-y border-border py-20 sm:py-32" style={{ borderColor: 'rgba(245,240,235,0.05)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs font-mono text-accent uppercase tracking-widest block mb-2" style={{ color: '#C9A96E' }}>
              Tailored Silhouettes
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold uppercase tracking-tight text-white font-sans">
              Browse By Category
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {displayCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group relative h-80 rounded overflow-hidden border border-border/80 flex flex-col justify-end p-6 hover:border-white/30 transition-all duration-300"
                style={{ borderColor: 'rgba(245,240,235,0.05)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
                <div className="absolute inset-0 bg-zinc-950 scale-100 group-hover:scale-105 transition-transform duration-700 ease-out">
                  <img
                    alt={cat.name}
                    className="object-cover opacity-35 mix-blend-luminosity group-hover:opacity-50 transition-opacity w-full h-full"
                    src={cat.image_url}
                  />
                </div>
                <div className="relative z-20 text-left">
                  <h3 className="text-base font-bold uppercase tracking-wider text-white mb-1 group-hover:text-accent transition-colors font-sans" style={{ color: '#F5F0EB' }}>
                    {cat.name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-sans">
                    {(cat as any).description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          5. FEATURED DROPS
      ═══════════════════════════════════ */}
      <section className="py-32 border-b" style={{ background: '#060606', borderColor: 'rgba(245,240,235,0.04)' }}>
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="flex justify-between items-end mb-16"
          >
            <div>
              <motion.div variants={fadeUpItem} className="section-label mb-5 font-mono font-bold tracking-widest text-[#C9A96E]">
                SELECTED GARMENTS
              </motion.div>
              <motion.h2
                variants={fadeUpItem}
                className="text-[36px] md:text-[56px] font-sans font-extrabold uppercase tracking-tight leading-[0.9] text-[#F5F0EB]"
              >
                Featured Drops
              </motion.h2>
            </div>
            <motion.div variants={fadeUpItem}>
              <Link
                href="/products"
                className="group flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.2em] uppercase pb-1 transition-all duration-300"
                style={{ color: '#6B6560', borderBottom: '1px solid rgba(107,101,96,0.4)' }}
              >
                VIEW ALL
                <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {newArrivals.slice(0, 4).map((product) => (
              <motion.div key={product.id} variants={fadeUpItem}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          6. EDITORIAL FEATURE BANNER
      ═══════════════════════════════════ */}
      <section className="relative border-b overflow-hidden" style={{ height: '70vh', minHeight: '460px', borderColor: 'rgba(245,240,235,0.04)' }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1800&auto=format&fit=crop)',
            filter: 'brightness(0.28) saturate(0.6)',
          }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.5) 60%, rgba(8,8,8,0.3) 100%)' }} />

        <div className="relative z-10 h-full flex items-center container-custom">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeUpItem} className="section-label mb-8">
              SUMMER DROP 01 · EXCLUSIVE ACCESS
            </motion.div>
            <motion.h2
              variants={fadeUpItem}
              className="font-sans font-extrabold uppercase tracking-tight leading-[0.9] mb-10 max-w-2xl text-[#F5F0EB]"
              style={{
                fontSize: 'clamp(36px, 6vw, 80px)',
              }}
            >
              Built for those who move without noise.
            </motion.h2>
            <motion.div variants={fadeUpItem}>
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 font-mono text-[10px] font-bold tracking-[0.22em] uppercase px-8 py-4 border transition-all duration-500"
                style={{ borderColor: '#C9A96E', color: '#C9A96E' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#C9A96E'; (e.currentTarget as HTMLElement).style.color = '#080808'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#C9A96E'; }}
              >
                EXPLORE THE FULL COLLECTION
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          7. BEST SELLERS
      ═══════════════════════════════════ */}
      <section className="py-32 border-b" style={{ background: '#080808', borderColor: 'rgba(245,240,235,0.04)' }}>
        <div className="container-custom">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
            className="flex justify-between items-end mb-16"
          >
            <div>
              <motion.div variants={fadeUpItem} className="section-label mb-5">
                MOST REQUESTED
              </motion.div>
              <motion.h2
                variants={fadeUpItem}
                className="text-[36px] md:text-[56px] font-sans font-extrabold uppercase tracking-tight leading-[0.9] text-[#F5F0EB]"
              >
                Best Sellers
              </motion.h2>
            </div>
            <motion.div variants={fadeUpItem}>
              <Link
                href="/products?sort=best-selling"
                className="group flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.2em] uppercase pb-1 transition-all duration-300"
                style={{ color: '#6B6560', borderBottom: '1px solid rgba(107,101,96,0.4)' }}
              >
                VIEW ALL
                <ArrowUpRight size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {bestSellers.slice(0, 4).map((product) => (
              <motion.div key={product.id} variants={fadeUpItem}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          8. TRUST PILLARS
      ═══════════════════════════════════ */}
      <section className="py-20 border-b" style={{ background: '#060606', borderColor: 'rgba(245,240,235,0.04)' }}>
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x" style={{ borderColor: 'rgba(245,240,235,0.06)' }}>
            {[
              { icon: '⟴', title: 'EXPRESS SHIPPING',  body: 'Free express shipping on all orders above ₹5,000, anywhere in India.' },
              { icon: '↺', title: '7-DAY EXCHANGE',    body: 'Exchange or return within 7 days — no questions, full transparency.' },
              { icon: '⊕', title: 'SECURE CHECKOUT',   body: 'UPI, cards, and netbanking powered by Razorpay\'s encrypted infrastructure.' },
            ].map((pillar, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className="flex flex-col items-center text-center px-12 py-10 gap-5"
              >
                <span className="text-[28px]" style={{ color: '#C9A96E' }}>{pillar.icon}</span>
                <h4 className="font-mono text-[10px] font-bold tracking-[0.22em]" style={{ color: '#F5F0EB' }}>{pillar.title}</h4>
                <p className="text-[12px] leading-relaxed" style={{ color: '#6B6560', fontFamily: 'Geist, Inter, sans-serif' }}>{pillar.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          9. TESTIMONIALS — EDITORIAL SLIDER
      ═══════════════════════════════════ */}
      <section className="py-32 border-b" style={{ background: '#080808', borderColor: 'rgba(245,240,235,0.04)' }}>
        <div className="container-narrow">
          <div className="section-label mb-12">VERIFIED COMMUNITY</div>

          <div className="relative min-h-[260px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Giant opening quote */}
                <div
                  className="font-sans leading-none mb-4 text-[120px] text-[rgba(201,169,110,0.15)] font-black"
                  style={{
                    lineHeight: 0.7,
                  }}
                >
                  &quot;
                </div>
                <p
                  className="font-sans font-medium leading-relaxed mb-10 max-w-3xl text-[#D4CBBF]"
                  style={{
                    fontSize: 'clamp(18px, 2.5vw, 28px)',
                  }}
                >
                  {TESTIMONIALS[activeTestimonial].quote.replace(/^"|"$/g, '')}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-[1px]" style={{ background: '#C9A96E' }} />
                  <span className="font-mono text-[10px] font-bold tracking-[0.2em]" style={{ color: '#C9A96E' }}>
                    {TESTIMONIALS[activeTestimonial].name}
                  </span>
                  <span className="font-mono text-[9px] tracking-widest" style={{ color: '#4A4642' }}>
                    {"// "}{TESTIMONIALS[activeTestimonial].location}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Dots */}
            <div className="flex gap-3 mt-12">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className="cursor-pointer transition-all duration-300 rounded-full"
                  style={{
                    width: i === activeTestimonial ? '24px' : '6px',
                    height: '6px',
                    background: i === activeTestimonial ? '#C9A96E' : 'rgba(245,240,235,0.12)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════
          10. ORDER TRACKING
      ═══════════════════════════════════ */}
      <OrderTrackingSection />

      {/* ═══════════════════════════════════
          11. NEWSLETTER STRIP
      ═══════════════════════════════════ */}
      <section className="py-24" style={{ background: '#060606' }}>
        <div className="container-narrow flex flex-col lg:flex-row items-center justify-between gap-10">
          <div>
            <div className="section-label mb-5">PRIVATE CIRCLE</div>
            <h2
              className="text-[32px] md:text-[44px] font-sans font-extrabold uppercase tracking-tight leading-[0.9] text-[#F5F0EB]"
            >
              First access.<br />Always.
            </h2>
          </div>
          <div className="w-full lg:w-auto lg:min-w-[400px]">
            <p className="font-mono text-[10px] tracking-[0.15em] mb-6" style={{ color: '#6B6560' }}>
              JOIN THE ZELIX INNER CIRCLE FOR EARLY DROPS, PRIVATE SALES AND RARE RELEASES.
            </p>
            <form className="flex items-end gap-0 border-b" style={{ borderColor: 'rgba(245,240,235,0.2)' }}>
              <input
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                className="flex-1 py-3 bg-transparent font-mono text-[10px] tracking-[0.15em] outline-none"
                style={{ color: '#F5F0EB' }}
              />
              <button
                type="submit"
                className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.2em] pb-3 transition-colors duration-300"
                style={{ color: '#C9A96E' }}
              >
                SUBSCRIBE <ArrowRight size={10} />
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
