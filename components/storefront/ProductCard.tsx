'use client';

import React, { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [isHovered, setIsHovered]       = useState(false);
  const [tilt, setTilt]                 = useState({ x: 0, y: 0 });
  const cardRef                         = useRef<HTMLDivElement>(null);
  const imageRef                        = useRef<HTMLImageElement>(null);

  const mainImage  = product.images?.[0]?.image_url || product.og_image_url || '/placeholder.jpg';
  const hoverImage = product.images?.[1]?.image_url || product.images?.[0]?.image_url || product.og_image_url || '/placeholder.jpg';
  const hasSale    = product.sale_price !== null && product.sale_price !== undefined;
  const isOutOfStock = product.stock_quantity === 0 && product.track_inventory && !product.allow_backorders;
  const defaultSize  = product.options?.find((o) => o.name.toLowerCase() === 'size')?.values?.[0]?.value || 'OS';

  // ─── Magnetic tilt on mouse move ───────────────────────
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect   = cardRef.current.getBoundingClientRect();
    const cx     = rect.left + rect.width / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2);
    const dy     = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -6, y: dx * 6 }); // max 6deg
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1, defaultSize, undefined, null, imageRef.current);
  };

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col w-full cursor-pointer"
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/products/${product.slug}`} className="flex flex-col w-full">

        {/* ─── Image Frame ─── */}
        <motion.div
          animate={{ rotateX: tilt.x, rotateY: tilt.y }}
          transition={{ type: 'spring', stiffness: 200, damping: 25, mass: 0.8 }}
          className="relative w-full overflow-hidden rounded-2xl"
          style={{ aspectRatio: '3/4', background: '#111111', border: '1px solid rgba(245,240,235,0.05)' }}
        >
          {/* Status Badges */}
          <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
            {hasSale && (
              <span className="badge badge-sale font-mono text-[8px] font-bold tracking-[0.14em] px-2.5 py-1 rounded-[1px]" style={{ background: '#EF4444', color: '#fff' }}>
                SALE
              </span>
            )}
            {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
              <span className="font-mono text-[7px] font-bold tracking-[0.14em] px-2.5 py-1 rounded-[1px] border" style={{ color: '#C9A96E', borderColor: 'rgba(201,169,110,0.4)', background: 'rgba(201,169,110,0.06)' }}>
                ONLY {product.stock_quantity} LEFT
              </span>
            )}
          </div>

          {/* Main image */}
          <img
            ref={imageRef}
            src={mainImage}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: isHovered && hoverImage !== mainImage ? 0 : 1,
              transform: isHovered ? 'scale(1.04)' : 'scale(1)',
              filter: isHovered ? 'brightness(0.85)' : 'brightness(1)',
            }}
          />

          {/* Hover image */}
          {hoverImage !== mainImage && (
            <img
              src={hoverImage}
              alt={`${product.title} — view 2`}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{
                opacity: isHovered ? 1 : 0,
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
              }}
            />
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.75) 0%, transparent 55%)', opacity: isHovered ? 1 : 0.4 }}
          />

          {/* Quick Add — slides up on hover */}
          <motion.div
            animate={{ y: isHovered ? 0 : 16, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-4 bottom-4 z-20"
          >
            <button
              onClick={handleQuickAdd}
              disabled={isOutOfStock}
              className="w-full flex items-center justify-center gap-2 py-3 font-mono text-[9px] font-bold tracking-[0.18em] rounded-[2px] cursor-pointer transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
              style={
                isOutOfStock
                  ? { background: 'rgba(245,240,235,0.05)', color: '#4A4642', border: '1px solid rgba(245,240,235,0.08)' }
                  : { background: '#C9A96E', color: '#080808', border: '1px solid #C9A96E' }
              }
              onMouseEnter={(e) => {
                if (!isOutOfStock) {
                  (e.currentTarget as HTMLElement).style.background = '#E8CFA0';
                  (e.currentTarget as HTMLElement).style.borderColor = '#E8CFA0';
                }
              }}
              onMouseLeave={(e) => {
                if (!isOutOfStock) {
                  (e.currentTarget as HTMLElement).style.background = '#C9A96E';
                  (e.currentTarget as HTMLElement).style.borderColor = '#C9A96E';
                }
              }}
            >
              {isOutOfStock ? (
                'OUT OF STOCK'
              ) : (
                <><ShoppingBag size={11} /> QUICK ADD</>
              )}
            </button>
          </motion.div>
        </motion.div>

        {/* ─── Product Info ─── */}
        <div className="mt-5 flex justify-between items-start gap-3">
          <div className="flex flex-col gap-1.5 min-w-0">
            <h3
              className="font-sans font-bold text-[13px] uppercase tracking-wider leading-tight truncate text-foreground group-hover:text-accent transition-colors duration-300"
            >
              {product.title}
            </h3>
            <span className="font-mono text-[8px] tracking-[0.18em] text-muted">
              {product.sku}
            </span>
          </div>

          {/* Price */}
          <div className="flex flex-col items-end shrink-0">
            {hasSale ? (
              <>
                <span className="font-mono text-[13px] font-bold text-error">
                  {formatCurrency(product.sale_price!)}
                </span>
                <span className="font-mono text-[10px] line-through text-muted">
                  {formatCurrency(product.price)}
                </span>
              </>
            ) : (
              <span className="font-mono text-[13px] font-bold transition-colors duration-300 text-foreground group-hover:text-accent">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* ─── View Product link ─── */}
        <motion.div
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 4 }}
          transition={{ duration: 0.35 }}
          className="mt-3 flex items-center gap-1.5 font-mono text-[8px] font-bold tracking-[0.18em]"
          style={{ color: '#C9A96E' }}
        >
          VIEW DETAILS <ArrowRight size={8} />
        </motion.div>
      </Link>
    </div>
  );
}
