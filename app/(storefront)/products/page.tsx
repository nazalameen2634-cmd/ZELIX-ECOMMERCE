'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { X, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/types';
import ProductCard from '@/components/storefront/ProductCard';
import { formatCurrency } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import { useCart } from '@/context/CartContext';

// ─── Mock Data ─────────────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'OUTERWEAR',   slug: 'outerwear'   },
  { id: 'cat-2', name: 'FOOTWEAR',    slug: 'footwear'    },
  { id: 'cat-3', name: 'APPAREL',     slug: 'apparel'     },
  { id: 'cat-4', name: 'ACCESSORIES', slug: 'accessories' },
];

// Removed MOCK_PRODUCTS array

// ─── Filter Sidebar (shared between desktop + mobile) ──────
function FilterPanel({
  categories, categoryParam, sizeParam, sortParam, priceMaxParam,
  onUpdateFilter, onClearAll, onClose,
}: {
  categories: Category[]; categoryParam: string; sizeParam: string;
  sortParam: string; priceMaxParam: number;
  onUpdateFilter: (k: string, v: string | null) => void;
  onClearAll: () => void;
  onClose?: () => void;
}) {
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', 'OS'];

  return (
    <div className="flex flex-col gap-8">
      {/* Sort */}
      <div>
        <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-4" className="text-muted">
          SORT BY
        </h4>
        <div className="flex flex-col gap-2">
          {[
            { value: 'newest',     label: 'NEWEST ARRIVALS' },
            { value: 'price-asc',  label: 'PRICE: LOW → HIGH' },
            { value: 'price-desc', label: 'PRICE: HIGH → LOW' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdateFilter('sort', opt.value)}
              className={`text-left font-mono text-[10px] tracking-[0.12em] py-1 transition-colors duration-200 ${sortParam === opt.value ? "text-accent" : "text-muted hover:text-foreground"}`}
            >
              {opt.label}
              {sortParam === opt.value && <span className="ml-2 text-accent">✦</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'var(--color-border)' }} />

      {/* Categories */}
      <div>
        <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-4" className="text-muted">
          CATEGORY
        </h4>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onUpdateFilter('category', null)}
            className={`text-left font-mono text-[10px] tracking-[0.12em] py-1 transition-colors ${!categoryParam ? "text-accent" : "text-muted hover:text-foreground"}`}
          >
            ALL PIECES
            {!categoryParam && <span className="ml-2 text-accent">✦</span>}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { onUpdateFilter('category', cat.slug); onClose?.(); }}
              className={`text-left font-mono text-[10px] tracking-[0.12em] py-1 transition-colors ${categoryParam === cat.slug ? "text-accent" : "text-muted hover:text-foreground"}`}
            >
              {cat.name}
              {categoryParam === cat.slug && <span className="ml-2 text-accent">✦</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--color-border)' }} />

      {/* Sizes */}
      <div>
        <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-4" className="text-muted">
          SIZE
        </h4>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((sz) => (
            <button
              key={sz}
              onClick={() => onUpdateFilter('size', sizeParam === sz ? null : sz)}
              className="py-2 font-mono text-[9px] font-bold rounded-[2px] transition-all duration-200 cursor-pointer"
              style={
                sizeParam === sz
                  ? { background: 'var(--color-accent)', color: '#ffffff', border: '1px solid #C9A96E' }
                  : { background: 'transparent', color: 'var(--color-muted)', border: '1px solid rgba(232,227,220,0.07)' }
              }
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--color-border)' }} />

      {/* Price */}
      <div>
        <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-4" className="text-muted">
          MAX PRICE
        </h4>
        <input
          type="range" min="0" max="50000" step="1000"
          value={priceMaxParam}
          onChange={(e) => onUpdateFilter('maxPrice', e.target.value)}
          className="w-full cursor-pointer"
          style={{ accentColor: 'var(--color-accent)' }}
        />
        <div className="flex justify-between mt-2 font-mono text-[9px]" style={{ color: '#6B6560' }}>
          <span>₹0</span>
          <span style={{ color: 'var(--color-accent)' }}>{formatCurrency(priceMaxParam)}</span>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onClearAll}
        className="font-mono text-[9px] font-bold tracking-[0.18em] pt-2 border-b pb-1 transition-colors duration-200 text-left"
        style={{ color: 'var(--color-muted)', borderColor: 'rgba(232,227,220,0.08)' }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#F97066')}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = 'var(--color-muted)')}
      >
        RESET ALL FILTERS
      </button>
    </div>
  );
}

// ─── Main Content ──────────────────────────────────────────
function ProductsListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();

  const categoryParam  = searchParams.get('category')  || '';
  const sortParam      = searchParams.get('sort')       || 'newest';
  const sizeParam      = searchParams.get('size')       || '';
  const searchParam    = searchParams.get('search')     || '';
  const priceMinParam  = Number(searchParams.get('minPrice')) || 0;
  const priceMaxParam  = Number(searchParams.get('maxPrice')) || 50000;

  const [products, setProducts]         = useState<Product[]>([]);
  const [categories, setCategories]     = useState<Category[]>([]);
  const [loading, setLoading]           = useState(true);
  const [loadingMore, setLoadingMore]   = useState(false);
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(true);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct]       = useState<Product | null>(null);
  const [selectedSize, setSelectedSize]               = useState('M');
  const qvImageRef = useRef<HTMLImageElement>(null);
  const pageSize   = 12;

  const displayCategories = categories.length > 0 ? categories : (MOCK_CATEGORIES as unknown as Category[]);

  const fetchProducts = async (pg: number, replace = false) => {
    const from = (pg - 1) * pageSize;
    const to   = from + pageSize - 1;
    try {
      let q = supabase.from('products').select('*, categories(*), product_images(*)').eq('status', 'active');
      if (searchParam) q = q.or(`title.ilike.%${searchParam}%,description.ilike.%${searchParam}%`);
      if (categoryParam) {
        const cat = displayCategories.find((c) => c.slug === categoryParam);
        if (cat) q = q.eq('category_id', cat.id);
      }
      q = q.gte('price', priceMinParam).lte('price', priceMaxParam);
      if (sortParam === 'price-asc')  q = q.order('price', { ascending: true });
      else if (sortParam === 'price-desc') q = q.order('price', { ascending: false });
      else q = q.order('created_at', { ascending: false });
      const { data } = await q.range(from, to);
      const fetched  = (data as Product[]) || [];
      if (replace) {
        setProducts(fetched);
      } else {
        setProducts((p) => [...p, ...fetched]);
      }
      setHasMore(fetched.length === pageSize);
    } catch {
      if (replace) {
        setProducts([]);
      }
      setHasMore(false);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase.from('categories').select('*').order('sort_order');
        if (data) setCategories(data as Category[]);
      } catch {} finally {
        setCategoriesLoaded(true);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!categoriesLoaded) return;
    setLoading(true);
    setPage(1);
    fetchProducts(1, true);
  }, [categoryParam, sortParam, sizeParam, searchParam, priceMinParam, priceMaxParam, categoriesLoaded]);

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push('/products?' + params.toString());
  };
  const clearAll = () => router.push('/products');

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>

      {/* ─── Editorial Header ─── */}
      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: 'rgba(232,227,220,0.05)', paddingTop: '100px', paddingBottom: '60px' }}
      >
        {/* Ghost text */}
        <div
          className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden font-sans font-black tracking-tighter text-[rgba(232,227,220,0.02)]"
          style={{
            fontSize: 'clamp(100px, 20vw, 260px)',
            whiteSpace: 'nowrap',
            lineHeight: 1,
            paddingLeft: '40px',
          }}
        >
          STORE
        </div>

        <div className="container-custom relative z-10">
          <div className="section-label mb-6">ZELIX // SUMMER DROP VOL. 01</div>
          <h1
            className="font-sans font-extrabold uppercase tracking-tight leading-none mb-6 text-[#F5F0EB]"
            style={{
              fontSize: 'clamp(36px, 6vw, 84px)',
            }}
          >
            The Storefront.
          </h1>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] tracking-[0.18em]" style={{ color: 'var(--color-muted)' }}>
              {products.length} PIECES AVAILABLE
            </span>
            {categoryParam && (
              <>
                <span style={{ color: '#282420' }}>·</span>
                <span className="font-mono text-[9px] tracking-[0.15em] px-2.5 py-1 rounded-[1px]" style={{ color: 'var(--color-accent)', background: 'rgba(217,154,154,0.08)', border: '1px solid rgba(217,154,154,0.2)' }}>
                  {categoryParam.toUpperCase()}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-16">

        {/* ─── Top controls ─── */}
        <div className="flex items-center justify-between mb-10 gap-4">
          {/* Active chips */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Mobile filter button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.16em] px-4 py-2.5 rounded-[2px] cursor-pointer transition-all"
              style={{ border: '1px solid rgba(232,227,220,0.08)', color: '#9A9490' }}
            >
              <SlidersHorizontal size={11} /> FILTERS
            </button>

            {([
              categoryParam && { label: categoryParam.toUpperCase(), key: 'category' },
              sizeParam     && { label: `SIZE ${sizeParam}`,          key: 'size'     },
              searchParam   && { label: `"${searchParam}"`,           key: 'search'   },
            ].filter(Boolean) as { label: string; key: string }[]).map((chip) => (
              <motion.span
                key={chip.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-1.5 px-3 py-1.5 font-mono text-[9px] font-bold tracking-[0.14em] rounded-[2px]"
                style={{ color: 'var(--color-accent)', background: 'rgba(217,154,154,0.06)', border: '1px solid rgba(217,154,154,0.2)' }}
              >
                {chip.label}
                <button onClick={() => updateFilter(chip.key, null)} style={{ color: 'rgba(217,154,154,0.5)' }}>
                  <X size={9} />
                </button>
              </motion.span>
            ))}
          </div>
        </div>

        {/* ─── Layout: Sidebar + Grid ─── */}
        <div className="flex gap-14">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[200px] shrink-0">
            <div className="sticky top-28">
              <FilterPanel
                categories={displayCategories} categoryParam={categoryParam}
                sizeParam={sizeParam} sortParam={sortParam} priceMaxParam={priceMaxParam}
                onUpdateFilter={updateFilter} onClearAll={clearAll}
              />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 w-full relative">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-12">
                {Array(6).fill(null).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <div className="w-full rounded-[2px] shimmer-bg" style={{ aspectRatio: '3/4' }} />
                    <div className="h-4 w-3/4 shimmer-bg rounded-[2px]" />
                    <div className="h-3 w-1/4 shimmer-bg rounded-[2px]" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-5 border rounded-[2px]" style={{ borderColor: 'rgba(232,227,220,0.05)' }}>
                <span className="font-sans text-[60px] text-[rgba(232,227,220,0.04)] leading-none font-bold">∅</span>
                <p className="font-mono text-[10px] tracking-[0.2em]" style={{ color: 'var(--color-muted)' }}>NO PIECES MATCH YOUR FILTERS</p>
                <button
                  onClick={clearAll}
                  className="font-mono text-[9px] font-bold tracking-[0.18em] border-b pb-0.5 transition-colors"
                  style={{ color: 'var(--color-accent)', borderColor: 'rgba(217,154,154,0.4)' }}
                >
                  RESET ALL
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-12"
              >
                <AnimatePresence mode="popLayout">
                  {products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.4, delay: i * 0.04 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Load more */}
            {hasMore && !loading && (
              <div className="flex justify-center mt-16 border-t pt-12" style={{ borderColor: 'rgba(232,227,220,0.05)' }}>
                <button
                  onClick={() => { setLoadingMore(true); const next = page + 1; setPage(next); fetchProducts(next, false); }}
                  disabled={loadingMore}
                  className="flex items-center gap-3 font-mono text-[10px] font-bold tracking-[0.2em] px-10 py-4 rounded-[2px] cursor-pointer transition-all duration-300 disabled:opacity-40"
                  style={{ border: '1px solid rgba(232,227,220,0.12)', color: '#9A9490' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-accent)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(232,227,220,0.12)'; (e.currentTarget as HTMLElement).style.color = '#9A9490'; }}
                >
                  {loadingMore ? (
                    <><span className="animate-spin inline-block w-3 h-3 border border-current border-t-transparent rounded-full" /> LOADING...</>
                  ) : (
                    'LOAD MORE PIECES'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile Filter Drawer ─── */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 0.7 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 z-[100]" style={{ background: '#000' }}
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed bottom-0 inset-x-0 z-[110] rounded-t-[8px] overflow-y-auto max-h-[88vh] hide-scrollbar"
              style={{ background: '#0D0D0D', border: '1px solid rgba(232,227,220,0.07)', borderBottom: 'none' }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(232,227,220,0.06)' }}>
                <div className="section-label">FILTERS</div>
                <button onClick={() => setIsMobileFiltersOpen(false)} style={{ color: 'var(--color-muted)' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="p-6">
                <FilterPanel
                  categories={displayCategories} categoryParam={categoryParam}
                  sizeParam={sizeParam} sortParam={sortParam} priceMaxParam={priceMaxParam}
                  onUpdateFilter={updateFilter} onClearAll={clearAll}
                  onClose={() => setIsMobileFiltersOpen(false)}
                />
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full mt-8 py-4 font-mono text-[10px] font-bold tracking-[0.2em] rounded-[2px] cursor-pointer transition-all"
                  style={{ background: 'var(--color-accent)', color: '#ffffff' }}
                >
                  APPLY FILTERS
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Quick View Modal ─── */}
      <Modal isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} title="" maxWidth="lg">
        {quickViewProduct && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="w-full overflow-hidden rounded-[2px] border" style={{ aspectRatio: '3/4', background: '#111', borderColor: 'rgba(232,227,220,0.06)' }}>
              <img ref={qvImageRef} src={quickViewProduct.og_image_url || '/placeholder.jpg'} alt={quickViewProduct.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-between py-2">
              <div>
                <div className="section-label mb-4">{quickViewProduct.sku}</div>
                <h3 className="font-sans font-extrabold uppercase tracking-tight text-[24px] text-[#F5F0EB] mb-3 leading-none">
                  {quickViewProduct.title}
                </h3>
                <div className="font-mono text-[16px] font-bold mb-6" style={{ color: 'var(--color-accent)' }}>
                  {formatCurrency(quickViewProduct.sale_price ?? quickViewProduct.price)}
                </div>
                <p className="text-[13px] leading-relaxed mb-8" style={{ color: '#6B6560', fontFamily: 'Geist, Inter, sans-serif' }}>
                  {quickViewProduct.description}
                </p>
                <div className="flex flex-col gap-3 mb-8">
                  <span className="font-mono text-[9px] font-bold tracking-[0.18em]" style={{ color: '#6B6560' }}>SELECT SIZE</span>
                  <div className="flex flex-wrap gap-2">
                    {['S', 'M', 'L', 'XL'].map((sz) => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSize(sz)}
                        className="px-4 py-2 font-mono text-[9px] font-bold rounded-[2px] cursor-pointer transition-all"
                        style={selectedSize === sz ? { background: 'var(--color-accent)', color: '#ffffff', border: '1px solid #C9A96E' } : { border: '1px solid rgba(232,227,220,0.1)', color: '#6B6560' }}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={() => { addItem(quickViewProduct, 1, selectedSize, undefined, null, qvImageRef.current); setQuickViewProduct(null); }}
                className="w-full py-4 flex items-center justify-center gap-2.5 font-mono text-[10px] font-bold tracking-[0.18em] rounded-[2px] cursor-pointer transition-all"
                style={{ background: 'var(--color-accent)', color: '#ffffff' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#E8CFA0')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--color-accent)')}
              >
                <ShoppingBag size={13} /> ADD TO BAG
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#ffffff' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="font-sans text-accent text-[32px] font-black tracking-[0.4em]"
          >
            ZELIX
          </div>
          <div className="w-4 h-4 rounded-full animate-spin border border-accent border-t-transparent" />
        </div>
      </div>
    }>
      <ProductsListContent />
    </Suspense>
  );
}
