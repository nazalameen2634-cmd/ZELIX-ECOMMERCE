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

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p-1', title: 'MATRIX PARKA COAT', slug: 'matrix-parka-coat', price: 26000, sale_price: 21999,
    sale_start: null, sale_end: null,
    description: 'Immersive full-length technical coat. Waterproof membrane, magnetic collar lock, adjustable harness system.',
    category_id: 'cat-1', sku: 'ZLX-OUT-MPK', stock_quantity: 12, track_inventory: true,
    allow_backorders: false, status: 'draft', meta_title: '', meta_description: '',
    tags: ['OUTERWEAR', 'PREMIUM'], created_at: '2026-06-18T12:00:00Z', updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=600&auto=format&fit=crop',
    additional_info: null,
  },
  {
    id: 'p-2', title: 'SILENT RUNNER BOOTS', slug: 'silent-runner-boots', price: 38000, sale_price: null,
    sale_start: null, sale_end: null,
    description: 'Chunky hybrid combat boot with vibram sole, quick-lace locking and premium Italian distressed leather.',
    category_id: 'cat-2', sku: 'ZLX-FOT-SRB', stock_quantity: 5, track_inventory: true,
    allow_backorders: false, status: 'draft', meta_title: '', meta_description: '',
    tags: ['FOOTWEAR', 'LIMITED'], created_at: '2026-06-18T12:00:00Z', updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=600&auto=format&fit=crop',
    additional_info: null,
  },
  {
    id: 'p-3', title: 'ECLIPSE OVERSIZED HOODIE', slug: 'eclipse-oversized-hoodie', price: 12000, sale_price: null,
    sale_start: null, sale_end: null,
    description: 'Heavyweight 500GSM organic cotton hoodie. Drop shoulder silhouette, invisible side pockets.',
    category_id: 'cat-3', sku: 'ZLX-APP-EOH', stock_quantity: 24, track_inventory: true,
    allow_backorders: false, status: 'draft', meta_title: '', meta_description: '',
    tags: ['APPAREL', 'ESSENTIALS'], created_at: '2026-06-18T12:00:00Z', updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop',
    additional_info: null,
  },
  {
    id: 'p-4', title: 'KINETIC UTILITY TROUSERS', slug: 'kinetic-utility-trousers', price: 18000, sale_price: 14999,
    sale_start: null, sale_end: null,
    description: 'Ergonomic trousers with modular cargo compartments, articulated knees, custom nylon web belt.',
    category_id: 'cat-3', sku: 'ZLX-APP-KUT', stock_quantity: 8, track_inventory: true,
    allow_backorders: false, status: 'draft', meta_title: '', meta_description: '',
    tags: ['APPAREL', 'UTILITY'], created_at: '2026-06-18T12:00:00Z', updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=600&auto=format&fit=crop',
    additional_info: null,
  },
  {
    id: 'p-5', title: 'SOLSTICE GLASSES', slug: 'solstice-glasses', price: 9000, sale_price: null,
    sale_start: null, sale_end: null,
    description: 'Acetate frame sunglasses. 100% UV protection, steel custom hardware, signature dark tint.',
    category_id: 'cat-4', sku: 'ZLX-ACC-SLG', stock_quantity: 15, track_inventory: true,
    allow_backorders: false, status: 'draft', meta_title: '', meta_description: '',
    tags: ['ACCESSORIES', 'GLASSES'], created_at: '2026-06-18T12:00:00Z', updated_at: '2026-06-18T12:00:00Z',
    og_image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop',
    additional_info: null,
  },
];

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
        <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-4" style={{ color: '#9A9490' }}>
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
              className="text-left font-mono text-[10px] tracking-[0.12em] py-1 transition-colors duration-200"
              style={{ color: sortParam === opt.value ? '#C9A96E' : '#4A4642' }}
            >
              {opt.label}
              {sortParam === opt.value && <span className="ml-2" style={{ color: '#C9A96E' }}>✦</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: 'rgba(245,240,235,0.05)' }} />

      {/* Categories */}
      <div>
        <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-4" style={{ color: '#9A9490' }}>
          CATEGORY
        </h4>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onUpdateFilter('category', null)}
            className="text-left font-mono text-[10px] tracking-[0.12em] py-1 transition-colors"
            style={{ color: !categoryParam ? '#C9A96E' : '#4A4642' }}
          >
            ALL PIECES
            {!categoryParam && <span className="ml-2">✦</span>}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { onUpdateFilter('category', cat.slug); onClose?.(); }}
              className="text-left font-mono text-[10px] tracking-[0.12em] py-1 transition-colors"
              style={{ color: categoryParam === cat.slug ? '#C9A96E' : '#4A4642' }}
            >
              {cat.name}
              {categoryParam === cat.slug && <span className="ml-2">✦</span>}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(245,240,235,0.05)' }} />

      {/* Sizes */}
      <div>
        <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-4" style={{ color: '#9A9490' }}>
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
                  ? { background: '#C9A96E', color: '#080808', border: '1px solid #C9A96E' }
                  : { background: 'transparent', color: '#4A4642', border: '1px solid rgba(245,240,235,0.07)' }
              }
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '1px', background: 'rgba(245,240,235,0.05)' }} />

      {/* Price */}
      <div>
        <h4 className="font-mono text-[9px] font-bold tracking-[0.22em] mb-4" style={{ color: '#9A9490' }}>
          MAX PRICE
        </h4>
        <input
          type="range" min="0" max="50000" step="1000"
          value={priceMaxParam}
          onChange={(e) => onUpdateFilter('maxPrice', e.target.value)}
          className="w-full cursor-pointer"
          style={{ accentColor: '#C9A96E' }}
        />
        <div className="flex justify-between mt-2 font-mono text-[9px]" style={{ color: '#6B6560' }}>
          <span>₹0</span>
          <span style={{ color: '#C9A96E' }}>{formatCurrency(priceMaxParam)}</span>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onClearAll}
        className="font-mono text-[9px] font-bold tracking-[0.18em] pt-2 border-b pb-1 transition-colors duration-200 text-left"
        style={{ color: '#4A4642', borderColor: 'rgba(245,240,235,0.08)' }}
        onMouseEnter={(e) => ((e.target as HTMLElement).style.color = '#F97066')}
        onMouseLeave={(e) => ((e.target as HTMLElement).style.color = '#4A4642')}
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

  const [products, setProducts]         = useState<Product[]>(MOCK_PRODUCTS);
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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await supabase.from('categories').select('*').order('sort_order');
        if (data) setCategories(data as Category[]);
      } catch {}
    };
    fetchCategories();
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchProducts(1, true);
  }, [categoryParam, sortParam, sizeParam, searchParam, priceMinParam, priceMaxParam]);

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
      let filtered = MOCK_PRODUCTS.filter((p) => p.status === 'active');
      if (categoryParam) filtered = filtered.filter((p) => p.tags.some((t) => t.toLowerCase() === categoryParam));
      if (searchParam)   filtered = filtered.filter((p) => p.title.toLowerCase().includes(searchParam.toLowerCase()));
      filtered = filtered.filter((p) => p.price >= priceMinParam && p.price <= priceMaxParam);
      if (sortParam === 'price-asc')  filtered.sort((a, b) => a.price - b.price);
      if (sortParam === 'price-desc') filtered.sort((a, b) => b.price - a.price);
      setProducts(filtered);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

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
    <div style={{ background: '#080808', minHeight: '100vh' }}>

      {/* ─── Editorial Header ─── */}
      <div
        className="relative overflow-hidden border-b"
        style={{ borderColor: 'rgba(245,240,235,0.05)', paddingTop: '100px', paddingBottom: '60px' }}
      >
        {/* Ghost text */}
        <div
          className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden font-sans font-black tracking-tighter text-[rgba(245,240,235,0.02)]"
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
            <span className="font-mono text-[10px] tracking-[0.18em]" style={{ color: '#4A4642' }}>
              {products.length} PIECES AVAILABLE
            </span>
            {categoryParam && (
              <>
                <span style={{ color: '#282420' }}>·</span>
                <span className="font-mono text-[9px] tracking-[0.15em] px-2.5 py-1 rounded-[1px]" style={{ color: '#C9A96E', background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}>
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
              style={{ border: '1px solid rgba(245,240,235,0.08)', color: '#9A9490' }}
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
                style={{ color: '#C9A96E', background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)' }}
              >
                {chip.label}
                <button onClick={() => updateFilter(chip.key, null)} style={{ color: 'rgba(201,169,110,0.5)' }}>
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
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {Array(6).fill(null).map((_, i) => (
                  <div key={i} className="flex flex-col gap-4">
                    <div className="w-full rounded-[2px] shimmer-bg" style={{ aspectRatio: '3/4' }} />
                    <div className="h-4 w-3/4 shimmer-bg rounded-[2px]" />
                    <div className="h-3 w-1/4 shimmer-bg rounded-[2px]" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-32 flex flex-col items-center gap-5 border rounded-[2px]" style={{ borderColor: 'rgba(245,240,235,0.05)' }}>
                <span className="font-sans text-[60px] text-[rgba(245,240,235,0.04)] leading-none font-bold">∅</span>
                <p className="font-mono text-[10px] tracking-[0.2em]" style={{ color: '#4A4642' }}>NO PIECES MATCH YOUR FILTERS</p>
                <button
                  onClick={clearAll}
                  className="font-mono text-[9px] font-bold tracking-[0.18em] border-b pb-0.5 transition-colors"
                  style={{ color: '#C9A96E', borderColor: 'rgba(201,169,110,0.4)' }}
                >
                  RESET ALL
                </button>
              </div>
            ) : (
              <motion.div
                layout
                className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-12"
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
              <div className="flex justify-center mt-16 border-t pt-12" style={{ borderColor: 'rgba(245,240,235,0.05)' }}>
                <button
                  onClick={() => { setLoadingMore(true); const next = page + 1; setPage(next); fetchProducts(next, false); }}
                  disabled={loadingMore}
                  className="flex items-center gap-3 font-mono text-[10px] font-bold tracking-[0.2em] px-10 py-4 rounded-[2px] cursor-pointer transition-all duration-300 disabled:opacity-40"
                  style={{ border: '1px solid rgba(245,240,235,0.12)', color: '#9A9490' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#C9A96E'; (e.currentTarget as HTMLElement).style.color = '#C9A96E'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,240,235,0.12)'; (e.currentTarget as HTMLElement).style.color = '#9A9490'; }}
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
              style={{ background: '#0D0D0D', border: '1px solid rgba(245,240,235,0.07)', borderBottom: 'none' }}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'rgba(245,240,235,0.06)' }}>
                <div className="section-label">FILTERS</div>
                <button onClick={() => setIsMobileFiltersOpen(false)} style={{ color: '#4A4642' }}>
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
                  style={{ background: '#C9A96E', color: '#080808' }}
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
            <div className="w-full overflow-hidden rounded-[2px] border" style={{ aspectRatio: '3/4', background: '#111', borderColor: 'rgba(245,240,235,0.06)' }}>
              <img ref={qvImageRef} src={quickViewProduct.og_image_url || '/placeholder.jpg'} alt={quickViewProduct.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-between py-2">
              <div>
                <div className="section-label mb-4">{quickViewProduct.sku}</div>
                <h3 className="font-sans font-extrabold uppercase tracking-tight text-[24px] text-[#F5F0EB] mb-3 leading-none">
                  {quickViewProduct.title}
                </h3>
                <div className="font-mono text-[16px] font-bold mb-6" style={{ color: '#C9A96E' }}>
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
                        style={selectedSize === sz ? { background: '#C9A96E', color: '#080808', border: '1px solid #C9A96E' } : { border: '1px solid rgba(245,240,235,0.1)', color: '#6B6560' }}
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
                style={{ background: '#C9A96E', color: '#080808' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = '#E8CFA0')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = '#C9A96E')}
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080808' }}>
        <div className="flex flex-col items-center gap-4">
          <div
            className="font-sans text-[#C9A96E] text-[32px] font-black tracking-[0.4em]"
          >
            ZELIX
          </div>
          <div className="w-4 h-4 rounded-full animate-spin border border-[#C9A96E] border-t-transparent" />
        </div>
      </div>
    }>
      <ProductsListContent />
    </Suspense>
  );
}
