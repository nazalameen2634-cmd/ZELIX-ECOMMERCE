'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronDown, ChevronUp, Star, Check, Minus, Plus } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';
import ProductCard from '@/components/storefront/ProductCard';
import { supabase } from '@/lib/supabase';

interface ProductDetailsProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetails({
  product,
  relatedProducts,
}: ProductDetailsProps) {
  const { addItem } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Active States
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('BLACK');
  const [quantity, setQuantity] = useState(1);
  
  // Accordion Sections open/close
  const [accordions, setAccordions] = useState({
    description: true,
    specs: false,
    shipping: false,
  });

  const mainImageRef = useRef<HTMLImageElement>(null);

  // Product Images list
  const dbImages = (product.images || (product as any).product_images)?.map((img: any) => img.image_url) || [];
  const productImages = dbImages.length > 0 ? dbImages : [product.og_image_url || '/placeholder.jpg'];

  // Colors and sizes configuration from options
  const uniqueColors = new Set<string>();
  const uniqueSizes = new Set<string>();
  if (product.variants) {
    product.variants.forEach(v => {
      if (v.option_values && Array.isArray(v.option_values)) {
        v.option_values.forEach((ov: any) => {
          if (ov.option_name === 'Color') uniqueColors.add(ov.value);
          if (ov.option_name === 'Size') uniqueSizes.add(ov.value);
        });
      }
    });
  }
  const colors = Array.from(uniqueColors);
  const sizes = Array.from(uniqueSizes).length > 0 ? Array.from(uniqueSizes) : ['S', 'M', 'L', 'XL'];

  // Accordion toggle
  const toggleAccordion = (section: 'description' | 'specs' | 'shipping') => {
    setAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Magnifying Glass Hover Zoom (Desktop)
  

  // Add to Cart
  const handleAddToCart = () => {
    // Fetch variant ID if matching combinations
    let matchedVariantId = null;
    if (product.variants && product.variants.length > 0) {
      const match = product.variants.find((v) =>
        v.option_values.some((ov) => ov.option_name.toLowerCase() === 'size' && ov.value === selectedSize)
      );
      if (match) matchedVariantId = match.id;
    }

    addItem(product, quantity, selectedSize, selectedColor, matchedVariantId, mainImageRef.current);
    toast('ADDED TO SHOPPING BAG', 'success');
  };


  return (
    <div className="bg-background py-8 md:py-16">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <div className="text-[10px] font-sans font-bold tracking-widest text-muted uppercase mb-6 md:mb-12">
          <Link href="/" className="hover:text-foreground transition-colors">HOME</Link>{" // "}
          <Link href="/products" className="hover:text-foreground transition-colors">PRODUCTS</Link>{" // "}
          <span className="text-foreground">{product.title}</span>
        </div>

        {/* Primary Page Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24">
          
          {/* Left Column: Image Galleries */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Main Image Viewport with Hover Zoom */}
            <div
              
              className="relative w-full aspect-[3/4] overflow-hidden bg-card border border-border rounded-sm cursor-zoom-in"
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={productImages[activeImageIdx]}
                  ref={mainImageRef}
                  src={productImages[activeImageIdx]}
                  alt={`${product.title} details`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              
            </div>

            {/* Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                {productImages.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIdx(idx);
                      // Trigger pulse scale feedback on main image
                      if (mainImageRef.current) {
                        mainImageRef.current.style.transform = 'scale(0.98)';
                        setTimeout(() => {
                          if (mainImageRef.current) mainImageRef.current.style.transform = 'scale(1)';
                        }, 150);
                      }
                    }}
                    className={`relative w-20 aspect-[3/4] shrink-0 overflow-hidden border rounded-sm transition-all bg-card ${
                      activeImageIdx === idx ? 'border-accent' : 'border-border opacity-55 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Information Panel */}
          <div className="lg:col-span-7 flex flex-col">
            {/* Title & SKU */}
            <div className="mb-6 border-b border-border pb-6">
              <span className="font-sans text-[9px] tracking-[0.25em] text-muted uppercase block mb-1">
                ZELIX SYNDICATE // INVENTORY ID: {product.sku}
              </span>
              <h1 className="text-[28px] md:text-[40px] font-serif font-bold tracking-tight text-foreground uppercase leading-none">
                {product.title}
              </h1>
            </div>


            {/* Pricing Section */}
            <div className="mb-8">
              {product.sale_price !== null && product.sale_price !== undefined ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-[26px] font-sans font-bold text-red-500">
                    {formatCurrency(product.sale_price)}
                  </span>
                  <span className="text-[16px] font-sans text-muted line-through">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-[26px] font-sans font-bold text-accent">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>



            {/* Quantity Selector & Add to Cart button */}
            <div className="flex flex-col gap-4 border-b border-border pb-8 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                {/* Quantity */}
                <div className="flex items-center justify-between border border-border rounded-full px-6 py-3.5 bg-card sm:w-auto w-full">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="text-muted hover:text-foreground disabled:opacity-30 transition-colors cursor-pointer px-2"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-sans text-[11px] font-bold text-foreground min-w-[20px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 99, q + 1))}
                    className="text-muted hover:text-foreground transition-colors cursor-pointer px-2"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 && product.track_inventory && !product.allow_backorders}
                  className="flex-1 py-4 bg-accent text-white font-sans text-[11px] font-bold tracking-[0.2em] rounded-full flex items-center justify-center gap-2 hover:bg-accent-hover hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-sm disabled:bg-muted/30 disabled:text-neutral-600 disabled:cursor-not-allowed disabled:scale-100"
                >
                  <ShoppingBag size={12} />
                  {product.stock_quantity === 0 && product.track_inventory && !product.allow_backorders
                    ? 'OUT OF STOCK'
                    : 'ADD TO SHOPPING BAG'}
                </button>
              </div>
            </div>

            {/* Accodion lists */}
            <div className="flex flex-col border-b border-border">
              
              {/* Description */}
              <div className="border-b border-border py-4 last:border-0">
                <button
                  onClick={() => toggleAccordion('description')}
                  className="w-full flex justify-between items-center text-left cursor-pointer"
                >
                  <span className="font-sans text-[11px] font-bold tracking-widest uppercase text-foreground">
                    SPECIFICATIONS & MATERIALS
                  </span>
                  {accordions.description ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: accordions.description ? 'auto' : 0 }}
                  className="overflow-hidden font-sans text-[13px] leading-relaxed text-muted mt-3"
                >
                  <p className="pb-2 whitespace-pre-line">{product.description}</p>
                  <p className="pt-2 text-[11px] font-sans text-muted uppercase">
                    Reactive dyed // Pre-shrunk // Double needle stitch structure.
                  </p>
                </motion.div>
              </div>


              {/* Shipping & Returns */}
              <div className="border-b border-border py-4 last:border-0">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex justify-between items-center text-left cursor-pointer"
                >
                  <span className="font-sans text-[11px] font-bold tracking-widest uppercase text-foreground">
                    SHIPPING & RETURNS
                  </span>
                  {accordions.shipping ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: accordions.shipping ? 'auto' : 0 }}
                  className="overflow-hidden font-sans text-[13px] leading-relaxed text-muted mt-3"
                >
                  <p>
                    All items are shipped via express carrier within 48 hours of drop order.
                    We support a 7-day exchange window for sizing and material replacements.
                  </p>
                </motion.div>
              </div>

              {/* Additional Information */}
              {product.additional_info && (
                <div className="border-b border-border py-4 last:border-0">
                  <button
                    onClick={() => toggleAccordion('shipping')} // reusing toggle or adding new
                    className="w-full flex justify-between items-center text-left cursor-pointer"
                  >
                    <span className="font-sans text-[11px] font-bold tracking-widest uppercase text-foreground">
                      ADDITIONAL INFORMATION
                    </span>
                    <ChevronDown size={14} className="opacity-50" />
                  </button>
                  <motion.div
                    initial={{ height: 'auto' }}
                    animate={{ height: 'auto' }}
                    className="font-sans text-[13px] leading-relaxed text-muted mt-3"
                  >
                    <div dangerouslySetInnerHTML={{ __html: product.additional_info }} />
                  </motion.div>
                </div>
              )}

            </div>
          </div>
        </div>



        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-border pt-20">
            <div className="flex justify-between items-end mb-12">
              <h2 className="font-serif text-[11px] font-bold tracking-widest uppercase text-foreground">
                RELATED PRODUCTS
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
