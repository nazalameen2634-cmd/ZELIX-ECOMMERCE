'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ChevronDown, ChevronUp, Star, Check, Minus, Plus } from 'lucide-react';
import { Product, Review } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';
import ProductCard from '@/components/storefront/ProductCard';
import { supabase } from '@/lib/supabase';

interface ProductDetailsProps {
  product: Product;
  relatedProducts: Product[];
  initialReviews: Review[];
}

export default function ProductDetails({
  product,
  relatedProducts,
  initialReviews,
}: ProductDetailsProps) {
  const { addItem } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();

  // Active States
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('BLACK');
  const [quantity, setQuantity] = useState(1);
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });

  // Review Form States
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [newRating, setNewRating] = useState(5);
  const [newReviewTitle, setNewReviewTitle] = useState('');
  const [newReviewBody, setNewReviewBody] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Accordion Sections open/close
  const [accordions, setAccordions] = useState({
    description: true,
    specs: false,
    shipping: false,
  });

  const mainImageRef = useRef<HTMLImageElement>(null);

  // Product Images list
  const productImages = product.images?.map((img) => img.image_url) || [
    product.og_image_url || '/placeholder.jpg',
  ];

  // Colors and sizes configuration from options
  const colors = ['BLACK', 'TACTICAL GREY', 'OFF-WHITE'];
  const sizes = product.options?.find((o) => o.name.toLowerCase() === 'size')?.values?.map((v) => v.value) || ['S', 'M', 'L', 'XL'];

  // Accordion toggle
  const toggleAccordion = (section: 'description' | 'specs' | 'shipping') => {
    setAccordions((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Magnifying Glass Hover Zoom (Desktop)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

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

  // Submit Review to Supabase
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast('PLEASE SIGN IN TO SUBMIT A REVIEW', 'error');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newReview = {
        product_id: product.id,
        user_id: user.id,
        rating: newRating,
        title: newReviewTitle.toUpperCase(),
        body: newReviewBody,
        is_verified: true,
      };

      const { data, error } = await supabase
        .from('reviews')
        .insert([newReview])
        .select('*')
        .single();

      if (error) {
        console.error(error);
        toast('FAILED TO SUBMIT REVIEW', 'error');
      } else {
        toast('REVIEW SUBMITTED SUCCESSFULLY', 'success');
        setReviews((prev) => [
          {
            ...data,
            profile: {
              id: user.id,
              full_name: profile?.full_name || 'Verified User',
              email: profile?.email || '',
              avatar_url: profile?.avatar_url || null,
              role: profile?.role || 'customer',
              phone: profile?.phone || null,
              created_at: profile?.created_at || new Date().toISOString(),
              updated_at: profile?.updated_at || new Date().toISOString(),
            },
          } as Review,
          ...prev,
        ]);
        setNewReviewTitle('');
        setNewReviewBody('');
      }
    } catch (err) {
      console.warn('Supabase offline. Simulated review submission.');
      const localReview: Review = {
        id: Math.random().toString(),
        product_id: product.id,
        user_id: user.id,
        rating: newRating,
        title: newReviewTitle.toUpperCase(),
        body: newReviewBody,
        is_verified: true,
        created_at: new Date().toISOString(),
        profile: {
          id: user.id,
          full_name: profile?.full_name || 'Verified Customer',
          email: profile?.email || '',
          avatar_url: profile?.avatar_url || null,
          role: 'customer',
          phone: profile?.phone || null,
          created_at: profile?.created_at || new Date().toISOString(),
          updated_at: profile?.updated_at || new Date().toISOString(),
        },
      };
      setReviews((prev) => [localReview, ...prev]);
      setNewReviewTitle('');
      setNewReviewBody('');
      toast('REVIEW ADDED (PREVIEW MODE)', 'success');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Star Ratings calculations
  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

  const starsBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="bg-black py-16">
      <div className="container-custom">
        {/* Breadcrumbs */}
        <div className="text-[10px] font-mono font-bold tracking-widest text-neutral-500 uppercase mb-12">
          <Link href="/" className="hover:text-white transition-colors">HOME</Link>{" // "}
          <Link href="/products" className="hover:text-white transition-colors">PRODUCTS</Link>{" // "}
          <span className="text-white">{product.title}</span>
        </div>

        {/* Primary Page Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24">
          
          {/* Left Column: Image Galleries */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Main Image Viewport with Hover Zoom */}
            <div
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-950 border border-white/5 rounded-sm cursor-zoom-in"
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

              {/* Magnifying glass overlay box */}
              <div
                style={{
                  ...zoomStyle,
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${productImages[activeImageIdx]})`,
                  backgroundSize: '200%',
                  pointerEvents: 'none',
                }}
                className="hidden md:block transition-[background-position] duration-75"
              />
            </div>

            {/* Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto hide-scrollbar">
                {productImages.map((img, idx) => (
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
                    className={`relative w-20 aspect-[3/4] shrink-0 overflow-hidden border rounded-sm transition-all bg-neutral-950 ${
                      activeImageIdx === idx ? 'border-white' : 'border-white/5 opacity-55 hover:opacity-100'
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
            <div className="mb-6 border-b border-white/5 pb-6">
              <span className="font-mono text-[9px] tracking-[0.25em] text-neutral-500 uppercase block mb-1">
                ZELIX SYNDICATE // INVENTORY ID: {product.sku}
              </span>
              <h1 className="text-[28px] md:text-[40px] font-sans font-black tracking-tight text-white uppercase leading-none">
                {product.title}
              </h1>
            </div>

            {/* Reviews Quick Rating */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-6">
                <div className="flex text-[#C9A96E]">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < Math.round(Number(avgRating)) ? 'fill-[#C9A96E] text-[#C9A96E]' : 'text-neutral-700'}
                      />
                    ))}
                </div>
                <span className="font-mono text-[10px] tracking-wider font-bold text-neutral-400">
                  {avgRating} ({reviews.length} VERIFIED REVIEWS)
                </span>
              </div>
            )}

            {/* Pricing Section */}
            <div className="mb-8">
              {product.sale_price !== null && product.sale_price !== undefined ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-[26px] font-mono font-bold text-red-500">
                    {formatCurrency(product.sale_price)}
                  </span>
                  <span className="text-[16px] font-mono text-neutral-500 line-through">
                    {formatCurrency(product.price)}
                  </span>
                </div>
              ) : (
                <span className="text-[26px] font-mono font-bold text-[#C9A96E]">
                  {formatCurrency(product.price)}
                </span>
              )}
            </div>

            {/* Variant Selectors: Colors */}
            <div className="flex flex-col gap-3 mb-6">
              <span className="font-mono text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                SWATCH // COLOR: {selectedColor}
              </span>
              <div className="flex items-center gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`relative w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer transition-all ${
                      selectedColor === color
                        ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.15)]'
                        : 'border-white/10 opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                  >
                    <span
                      style={{
                        backgroundColor:
                          color === 'BLACK' ? '#111111' : color === 'TACTICAL GREY' ? '#555555' : '#EFEFEE',
                      }}
                      className="w-6 h-6 rounded-full block"
                    />
                    {selectedColor === color && (
                      <Check size={12} className={color === 'OFF-WHITE' ? 'text-black absolute' : 'text-white absolute'} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Variant Selectors: Sizing */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                  SIZE: {selectedSize}
                </span>
                <Link
                  href="#size-guide"
                  className="font-mono text-[9px] text-neutral-500 hover:text-white tracking-wider uppercase underline underline-offset-4"
                >
                  SIZE CHART
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const isOutOfStock = product.stock_quantity === 0 && product.track_inventory && !product.allow_backorders;
                  return (
                    <button
                      key={size}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`border px-5 py-3 font-mono text-[11px] font-bold rounded-sm transition-all cursor-pointer select-none ${
                        isOutOfStock
                          ? 'border-white/5 text-neutral-700 cursor-not-allowed line-through'
                          : selectedSize === size
                          ? 'bg-white text-black border-white'
                          : 'border-white/10 text-neutral-400 hover:border-white/30 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector & Add to Cart button */}
            <div className="flex flex-col gap-4 border-b border-white/5 pb-8 mb-8">
              <div className="flex gap-4 items-center">
                {/* Quantity */}
                <div className="flex items-center border border-white/10 rounded-full px-4 py-3 gap-6 bg-neutral-950">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="text-neutral-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-mono text-[11px] font-bold text-white min-w-[15px] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock_quantity || 99, q + 1))}
                    className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 && product.track_inventory && !product.allow_backorders}
                  className="flex-1 py-4 bg-[#C9A96E] text-black font-mono text-[11px] font-bold tracking-[0.2em] rounded-full flex items-center justify-center gap-2 hover:bg-[#E8CFA0] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-[0_4px_20px_rgba(201,169,110,0.15)] disabled:bg-neutral-900 disabled:text-neutral-600 disabled:cursor-not-allowed disabled:scale-100"
                >
                  <ShoppingBag size={12} />
                  {product.stock_quantity === 0 && product.track_inventory && !product.allow_backorders
                    ? 'OUT OF STOCK'
                    : 'ADD TO SHOPPING BAG'}
                </button>
              </div>
            </div>

            {/* Accodion lists */}
            <div className="flex flex-col border-b border-white/5">
              
              {/* Description */}
              <div className="border-b border-white/5 py-4 last:border-0">
                <button
                  onClick={() => toggleAccordion('description')}
                  className="w-full flex justify-between items-center text-left cursor-pointer"
                >
                  <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-white">
                    SPECIFICATIONS & MATERIALS
                  </span>
                  {accordions.description ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: accordions.description ? 'auto' : 0 }}
                  className="overflow-hidden font-sans text-[13px] leading-relaxed text-neutral-400 mt-3"
                >
                  <p className="pb-2">{product.description}</p>
                  <p className="pt-2 text-[11px] font-mono text-neutral-500 uppercase">
                    Reactive dyed // Pre-shrunk // Double needle stitch structure.
                  </p>
                </motion.div>
              </div>

              {/* Technical Specifications table */}
              <div className="border-b border-white/5 py-4 last:border-0">
                <button
                  onClick={() => toggleAccordion('specs')}
                  className="w-full flex justify-between items-center text-left cursor-pointer"
                >
                  <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-white">
                    TECHNICAL DATA
                  </span>
                  {accordions.specs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: accordions.specs ? 'auto' : 0 }}
                  className="overflow-hidden text-[12px] font-mono tracking-wider text-neutral-400 mt-3"
                >
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-neutral-500 font-bold">FABRIC WEIGHT</td>
                        <td className="py-2.5 text-white text-right">500GSM / FRENCH TERRY</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-neutral-500 font-bold">COMPOSITION</td>
                        <td className="py-2.5 text-white text-right">100% ORGANIC COTTON</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-neutral-500 font-bold">ORIGIN</td>
                        <td className="py-2.5 text-white text-right">INDIA DESIGN LABS</td>
                      </tr>
                    </tbody>
                  </table>
                </motion.div>
              </div>

              {/* Shipping & Returns */}
              <div className="border-b border-white/5 py-4 last:border-0">
                <button
                  onClick={() => toggleAccordion('shipping')}
                  className="w-full flex justify-between items-center text-left cursor-pointer"
                >
                  <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-white">
                    SHIPPING & RETURNS
                  </span>
                  {accordions.shipping ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: accordions.shipping ? 'auto' : 0 }}
                  className="overflow-hidden font-sans text-[13px] leading-relaxed text-neutral-400 mt-3"
                >
                  <p>
                    All items are shipped via express carrier within 48 hours of drop order.
                    We support a 7-day exchange window for sizing and material replacements.
                  </p>
                </motion.div>
              </div>

              {/* Additional Information */}
              {product.additional_info && (
                <div className="border-b border-white/5 py-4 last:border-0">
                  <button
                    onClick={() => toggleAccordion('shipping')} // reusing toggle or adding new
                    className="w-full flex justify-between items-center text-left cursor-pointer"
                  >
                    <span className="font-mono text-[11px] font-bold tracking-widest uppercase text-white">
                      ADDITIONAL INFORMATION
                    </span>
                    <ChevronDown size={14} className="opacity-50" />
                  </button>
                  <motion.div
                    initial={{ height: 'auto' }}
                    animate={{ height: 'auto' }}
                    className="font-sans text-[13px] leading-relaxed text-neutral-400 mt-3"
                  >
                    <div dangerouslySetInnerHTML={{ __html: product.additional_info }} />
                  </motion.div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <section className="border-t border-white/5 pt-20 mb-24">
          <h2 className="font-mono text-[11px] font-black tracking-widest uppercase text-white mb-12">
            CUSTOMER REVIEWS ({reviews.length})
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left: Star Breakdown Bar Chart */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-neutral-950 border border-white/5 rounded-sm p-6">
                <span className="font-mono text-[10px] tracking-widest text-neutral-500 uppercase">
                  AVERAGE RATINGS
                </span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-[36px] font-black text-white">{avgRating}</span>
                  <span className="text-[14px] text-neutral-500">/ 5.0</span>
                </div>

                <div className="flex text-white mt-2">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.round(Number(avgRating)) ? 'fill-white text-white' : 'text-neutral-700'}
                      />
                    ))}
                </div>

                {/* Star lists */}
                <div className="flex flex-col gap-2 mt-8">
                  {starsBreakdown.map(({ stars, count, percentage }) => (
                    <div key={stars} className="flex items-center gap-4 text-[10px] font-mono">
                      <span className="text-neutral-500 font-bold">{stars}★</span>
                      <div className="flex-1 h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                        <div style={{ width: `${percentage}%` }} className="h-full bg-white" />
                      </div>
                      <span className="text-neutral-500 text-right min-w-[15px]">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Reviews List & Submit Form */}
            <div className="lg:col-span-8 flex flex-col gap-10">
              
              {/* Form Submission */}
              {user ? (
                <div className="border border-white/5 bg-neutral-950 p-6 rounded-sm">
                  <h3 className="font-mono text-[11px] font-extrabold tracking-widest text-white uppercase mb-6">
                    SUBMIT A VERIFIED REVIEW
                  </h3>
                  <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                    
                    {/* Star Rating select */}
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-neutral-500 uppercase">
                        YOUR RATING:
                      </span>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="cursor-pointer text-neutral-500 hover:text-white"
                          >
                            <Star
                              size={16}
                              className={star <= newRating ? 'fill-white text-white' : 'text-neutral-800'}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border border-white/10 rounded-sm bg-neutral-900">
                      <input
                        type="text"
                        required
                        value={newReviewTitle}
                        onChange={(e) => setNewReviewTitle(e.target.value)}
                        placeholder="REVIEW HEADLINE (E.G. EXCELLENT COAT)"
                        className="w-full px-4 py-3 bg-transparent text-[11px] font-mono tracking-widest text-white uppercase placeholder-neutral-600 outline-none border-b border-white/5"
                      />
                      <textarea
                        required
                        rows={4}
                        value={newReviewBody}
                        onChange={(e) => setNewReviewBody(e.target.value)}
                        placeholder="Write details about comfort, size, and material..."
                        className="w-full px-4 py-3 bg-transparent text-[13px] text-white placeholder-neutral-500 outline-none resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="self-end px-6 py-3 bg-white text-black font-mono text-[10px] font-bold tracking-widest rounded-full uppercase hover:bg-neutral-200 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingReview ? 'SUBMITTING...' : 'PUBLISH REVIEW'}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="border border-white/5 bg-neutral-950 p-6 rounded-sm text-center">
                  <p className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-4">
                    YOU MUST LOG IN TO WRITE A REVIEW FOR THIS PRODUCT
                  </p>
                  <Link
                    href="/account/login"
                    className="inline-block px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-white font-mono text-[10px] font-bold tracking-widest rounded-full uppercase transition-colors"
                  >
                    LOGIN TO ACCOUNT
                  </Link>
                </div>
              )}

              {/* Reviews Cards List */}
              <div className="flex flex-col gap-6">
                {reviews.length === 0 ? (
                  <p className="text-[12px] font-mono text-neutral-700 tracking-wider">
                    NO REVIEWS POSTED YET. BE THE FIRST TO SUBMIT.
                  </p>
                ) : (
                  reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border-b border-white/5 pb-6 last:border-b-0"
                    >
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div>
                          <h4 className="text-[12px] font-bold text-white tracking-wide uppercase">
                            {review.title || 'VERIFIED FEEDBACK'}
                          </h4>
                          <div className="flex text-white mt-1 gap-1">
                            {Array(5)
                              .fill(0)
                              .map((_, i) => (
                                <Star
                                  key={i}
                                  size={10}
                                  className={i < review.rating ? 'fill-white text-white' : 'text-neutral-800'}
                                />
                              ))}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] font-mono font-bold text-neutral-300 block">
                            {review.profile?.full_name?.toUpperCase() || 'ANONYMOUS'}
                          </span>
                          <span className="text-[9px] font-mono text-neutral-500 block mt-0.5">
                            {new Date(review.created_at || '').toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <p className="text-[13px] leading-relaxed text-neutral-400 font-sans mt-3">
                        {review.body}
                      </p>

                      {review.is_verified && (
                        <span className="inline-block mt-3 text-[9px] font-mono text-green-500 font-semibold tracking-wider">
                          ✓ VERIFIED PURCHASE
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-white/5 pt-20">
            <div className="flex justify-between items-end mb-12">
              <h2 className="font-mono text-[11px] font-black tracking-widest uppercase text-white">
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
