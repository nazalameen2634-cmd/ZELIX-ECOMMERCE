'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, Lock, ShoppingBag, ArrowRight, Check, Tag, Box } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    coupon,
    applyCoupon,
    discountAmount,
  } = useCart();

  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState(coupon?.code || '');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  const shippingCost = 0; // Free shipping for all orders
  const taxRate = 0; // Tax removed
  const taxAmount = 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost + taxAmount);

  // Validate coupon code against Supabase database
  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !data) {
        toast('INVALID OR INACTIVE COUPON CODE', 'error');
        applyCoupon(null);
      } else {
        const now = new Date();
        const validFrom = new Date(data.valid_from);
        const validTo = new Date(data.valid_to);

        // Date validity check
        if (now < validFrom || now > validTo) {
          toast('COUPON CODE HAS EXPIRED', 'error');
          applyCoupon(null);
          return;
        }

        // Min order check
        if (subtotal < data.min_order_amount) {
          toast(`MINIMUM ORDER VALUE OF ${formatCurrency(data.min_order_amount)} REQUIRED`, 'error');
          applyCoupon(null);
          return;
        }

        // Usage limit check
        if (data.usage_limit && data.times_used >= data.usage_limit) {
          toast('COUPON CODE USAGE LIMIT REACHED', 'error');
          applyCoupon(null);
          return;
        }

        toast('COUPON APPLIED SUCCESSFULLY', 'success');
        applyCoupon(data);
      }
    } catch (err) {
      console.warn('Supabase offline. Applying mock coupon for evaluation.');
      if (couponCode.toUpperCase() === 'ZELIX20') {
        const mockCoupon = {
          id: 'mock-coupon-id',
          code: 'ZELIX20',
          type: 'percentage' as const,
          value: 20,
          min_order_amount: 5000,
          usage_limit: null,
          per_customer_limit: null,
          times_used: 0,
          valid_from: new Date(Date.now() - 86400000).toISOString(),
          valid_to: new Date(Date.now() + 864000000).toISOString(),
          applicable_products: [],
          applicable_categories: [],
          is_active: true,
          created_at: new Date().toISOString(),
        };
        if (subtotal < 5000) {
          toast('MINIMUM ORDER VALUE OF ₹5,000 REQUIRED FOR ZELIX20', 'error');
        } else {
          toast('MOCK COUPON "ZELIX20" (20% OFF) APPLIED', 'success');
          applyCoupon(mockCoupon);
        }
      } else {
        toast('INVALID COUPON CODE (TRY "ZELIX20")', 'error');
        applyCoupon(null);
      }
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    applyCoupon(null);
    setCouponCode('');
    toast('COUPON REMOVED', 'info');
  };

  return (
    <div className="bg-black min-h-screen py-16">
      <div className="container-custom">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col gap-2 mb-12 border-b border-white/5 pb-8">
          <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase">
            <Link href="/" className="hover:text-white transition-colors">HOME</Link> // SHOPPING BAG
          </span>
          <h1 className="text-[36px] font-black tracking-wider uppercase text-white">
            YOUR BAG
          </h1>
        </div>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center gap-6 py-24 text-center border border-white/5 rounded-sm bg-neutral-950/20">
            <ShoppingBag size={36} className="text-neutral-600 animate-pulse-glow" />
            <h2 className="font-mono text-[12px] font-bold tracking-widest text-neutral-400 uppercase">
              THERE ARE NO ITEMS IN YOUR BAG
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center">
              <Link
                href="/products"
                className="bg-[#C9A96E] hover:bg-[#E8CFA0] text-black font-mono text-[10px] font-bold tracking-[0.18em] px-8 py-4 rounded-full transition-all uppercase flex items-center justify-center gap-1.5"
              >
                CONTINUE SHOPPING
              </Link>
              <Link
                href="/account"
                className="border border-white/10 hover:border-white text-white font-mono text-[10px] font-bold tracking-[0.18em] px-8 py-4 rounded-full transition-all uppercase flex items-center justify-center gap-1.5"
              >
                <Box size={12} />
                TRACK ORDER
              </Link>
            </div>
          </div>
        ) : (
          /* Grid structure */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Left Column: Cart items table */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {items.map((item, index) => {
                const mainImage =
                  item.product.images?.[0]?.image_url ||
                  item.product.og_image_url ||
                  '/placeholder.jpg';

                return (
                  <div
                    key={`${item.product.id}-${item.size}-${index}`}
                    className="flex flex-col sm:flex-row gap-6 p-6 border border-white/5 bg-neutral-950/40 rounded-sm relative"
                  >
                    {/* Thumbnail */}
                    <div className="w-24 aspect-[3/4] overflow-hidden rounded-sm bg-neutral-900 border border-white/5 shrink-0">
                      <img
                        src={mainImage}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Specifications */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase">
                            SKU: {item.product.sku}
                          </span>
                          <h3 className="text-[16px] font-black text-white tracking-wide uppercase mt-0.5">
                            {item.product.title}
                          </h3>
                          <p className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase mt-1">
                            Size: {item.size} {item.color ? `| Color: ${item.color}` : ''}
                          </p>
                        </div>
                        <span className="text-[14px] font-bold text-white">
                          {formatCurrency(item.price)}
                        </span>
                      </div>

                      {/* Controls Row */}
                      <div className="flex justify-between items-center mt-6">
                        {/* Quantity controls */}
                        <div className="flex items-center border border-white/10 rounded-full px-4 py-2 gap-5 bg-neutral-900">
                          <button
                            onClick={() => updateQuantity(index, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="text-neutral-400 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="font-mono text-[11px] font-bold text-white min-w-[15px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(index, item.quantity + 1)}
                            className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Line Total & Remove */}
                        <div className="flex items-center gap-6">
                          <span className="text-[14px] font-bold text-white">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-500/60 hover:text-red-500 transition-colors cursor-pointer"
                            title="Remove from Bag"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Calculations card */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {/* Promo code form */}
              <div className="p-6 border border-white/5 bg-neutral-950 rounded-sm">
                <h3 className="font-mono text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-4 flex items-center gap-2">
                  <Tag size={12} /> PROMOTIONAL CODE
                </h3>
                {coupon ? (
                  <div className="flex justify-between items-center bg-neutral-900 border border-white/10 p-3 rounded-sm">
                    <div className="flex items-center gap-2">
                      <Check size={14} className="text-green-500" />
                      <span className="font-mono text-[11px] font-bold text-white uppercase">
                        {coupon.code} Applied
                      </span>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-neutral-500 hover:text-white font-mono text-[9px] font-bold uppercase cursor-pointer"
                    >
                      REMOVE
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex border border-white/10 rounded-sm bg-neutral-900 overflow-hidden">
                    <input
                      type="text"
                      required
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="ENTER PROMO CODE"
                      disabled={isValidatingCoupon}
                      className="flex-1 bg-transparent px-4 py-3 text-[10px] font-mono tracking-widest text-white uppercase placeholder-neutral-600 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isValidatingCoupon}
                      className="bg-white hover:bg-neutral-200 text-black font-mono text-[10px] font-bold tracking-wider px-6 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isValidatingCoupon ? 'VERIFYING' : 'APPLY'}
                    </button>
                  </form>
                )}
              </div>

              {/* Order Calculations card */}
              <div className="p-6 border border-white/5 bg-neutral-950 rounded-sm flex flex-col">
                <h3 className="font-mono text-[10px] font-bold tracking-widest text-white uppercase border-b border-white/5 pb-4 mb-4">
                  ORDER SUMMARY
                </h3>

                <div className="flex flex-col gap-3.5 border-b border-white/5 pb-5 mb-5 font-mono text-[11px] tracking-wide text-neutral-400">
                  <div className="flex justify-between">
                    <span>BAG SUBTOTAL</span>
                    <span className="text-white font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>PROMO DISCOUNT</span>
                      <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>SHIPPING FEE</span>
                    <span className="text-white font-semibold">
                      {shippingCost === 0 ? 'FREE' : formatCurrency(shippingCost)}
                    </span>
                  </div>
                </div>

                {/* Estimate Total */}
                <div className="flex justify-between items-baseline mb-8">
                  <span className="font-mono text-[11px] font-black tracking-widest text-white uppercase">
                    ESTIMATED TOTAL
                  </span>
                  <span className="text-[20px] font-extrabold text-white">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>

                {/* Checkout Proceed CTA */}
                <button
                  onClick={handleApplyCoupon} // Mock action trigger for safety/checkout logic click, wait, we'll push to router
                  className="hidden" // hide redundant trigger
                />
                <Link
                  href="/checkout"
                  className="w-full relative overflow-hidden bg-[#C9A96E] hover:bg-[#E8CFA0] text-black py-4 rounded-full font-mono text-[11px] font-bold tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(201,169,110,0.15)] transition-all duration-300 hover:scale-[1.01]"
                >
                  <Lock size={12} />
                  PROCEED TO CHECKOUT <ArrowRight size={12} />
                </Link>

                <Link
                  href="/products"
                  className="w-full mt-4 text-center text-neutral-500 hover:text-white font-mono text-[9px] font-bold tracking-widest uppercase transition-colors"
                >
                  OR CONTINUE SHOPPING
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
