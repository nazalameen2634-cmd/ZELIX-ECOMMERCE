'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Trash2, Plus, Minus, Lock, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { formatCurrency } from '@/lib/utils';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const router = useRouter();
  const { items, updateQuantity, removeItem, subtotal, discountAmount } = useCart();
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 z-[100]"
            style={{ background: '#000', backdropFilter: 'blur(6px)' }}
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 240 }}
            className="fixed top-0 right-0 bottom-0 w-full z-[110] flex flex-col"
            style={{
              maxWidth: '440px',
              background: '#0A0A0A',
              borderLeft: '1px solid rgba(245,240,235,0.07)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 shrink-0" style={{ height: '72px', borderBottom: '1px solid rgba(245,240,235,0.06)' }}>
              <div>
                <div
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: '#F5F0EB', fontSize: '20px', fontWeight: 300, letterSpacing: '0.04em' }}
                >
                  Your Bag
                </div>
                <div className="font-mono text-[8px] tracking-[0.2em]" style={{ color: '#4A4642' }}>
                  {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-[2px] transition-all duration-200 cursor-pointer"
                style={{ color: '#6B6560', border: '1px solid rgba(245,240,235,0.06)' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#F5F0EB'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,240,235,0.12)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#6B6560'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,240,235,0.06)'; }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Item List */}
            <div className="flex-1 overflow-y-auto px-7 py-6 hide-scrollbar">
              {items.length === 0 ? (
                /* Empty state */
                <div className="h-full flex flex-col items-center justify-center gap-6 text-center">
                  <div
                    className="flex items-center justify-center w-16 h-16 rounded-full"
                    style={{ border: '1px solid rgba(245,240,235,0.06)', color: '#282420' }}
                  >
                    <ShoppingBag size={22} />
                  </div>
                  <div>
                    <p className="font-mono text-[10px] tracking-[0.2em] mb-5" style={{ color: '#4A4642' }}>
                      YOUR BAG IS EMPTY
                    </p>
                    <button
                      onClick={onClose}
                      className="flex items-center gap-2 font-mono text-[9px] font-bold tracking-[0.18em] cursor-pointer transition-colors pb-0.5 border-b"
                      style={{ color: '#C9A96E', borderColor: 'rgba(201,169,110,0.3)' }}
                    >
                      BROWSE THE COLLECTION <ArrowRight size={9} />
                    </button>
                  </div>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item, index) => {
                    const img = item.product.images?.[0]?.image_url || item.product.og_image_url || '/placeholder.jpg';
                    return (
                      <motion.div
                        key={`${item.product.id}-${item.size}-${item.color || index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden', transition: { duration: 0.25 } }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-5 py-6 border-b"
                        style={{ borderColor: 'rgba(245,240,235,0.05)' }}
                      >
                        {/* Thumbnail */}
                        <div
                          className="w-20 shrink-0 overflow-hidden rounded-[2px]"
                          style={{ aspectRatio: '3/4', background: '#111', border: '1px solid rgba(245,240,235,0.05)' }}
                        >
                          <img src={img} alt={item.product.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4
                                className="font-light italic leading-tight truncate"
                                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '17px', color: '#D4CBBF' }}
                              >
                                {item.product.title}
                              </h4>
                              <span className="font-mono text-[12px] font-bold shrink-0" style={{ color: '#F5F0EB' }}>
                                {formatCurrency(item.price * item.quantity)}
                              </span>
                            </div>
                            <p className="font-mono text-[9px] tracking-[0.14em] mt-1.5" style={{ color: '#4A4642' }}>
                              SIZE: {item.size}{item.color ? ` · ${item.color}` : ''}
                            </p>
                          </div>

                          {/* Qty + Remove */}
                          <div className="flex items-center justify-between mt-4">
                            <div
                              className="flex items-center gap-4"
                              style={{ border: '1px solid rgba(245,240,235,0.08)', borderRadius: '2px', padding: '4px 12px' }}
                            >
                              <button
                                onClick={() => updateQuantity(index, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="transition-colors cursor-pointer disabled:opacity-25"
                                style={{ color: '#6B6560' }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#F5F0EB')}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#6B6560')}
                              >
                                <Minus size={9} />
                              </button>
                              <span className="font-mono text-[10px] font-bold min-w-[14px] text-center" style={{ color: '#F5F0EB' }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(index, item.quantity + 1)}
                                className="transition-colors cursor-pointer"
                                style={{ color: '#6B6560' }}
                                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#F5F0EB')}
                                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#6B6560')}
                              >
                                <Plus size={9} />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(index)}
                              className="transition-colors cursor-pointer"
                              style={{ color: '#4A4642' }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#F97066')}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#4A4642')}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>

            {/* Footer — Summary + Checkout */}
            {items.length > 0 && (
              <div
                className="px-7 py-6 shrink-0"
                style={{ borderTop: '1px solid rgba(245,240,235,0.06)', background: 'rgba(6,6,6,0.8)' }}
              >
                {/* Subtotal row */}
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] font-bold tracking-[0.18em]" style={{ color: '#4A4642' }}>
                      SUBTOTAL
                    </span>
                    <span className="font-mono text-[14px] font-bold" style={{ color: '#9A9490' }}>
                      {formatCurrency(subtotal)}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-[9px] font-bold tracking-[0.18em]" style={{ color: '#3ECF8E' }}>
                        DISCOUNT APPLIED
                      </span>
                      <span className="font-mono text-[13px] font-bold" style={{ color: '#3ECF8E' }}>
                        -{formatCurrency(discountAmount)}
                      </span>
                    </div>
                  )}

                  <div
                    className="flex justify-between items-baseline pt-3"
                    style={{ borderTop: '1px solid rgba(245,240,235,0.05)' }}
                  >
                    <span className="font-mono text-[10px] font-bold tracking-[0.18em]" style={{ color: '#D4CBBF' }}>
                      ESTIMATED TOTAL
                    </span>
                    <span
                      className="font-bold"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontSize: '26px', color: '#F5F0EB', fontStyle: 'italic', lineHeight: 1 }}
                    >
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>

                <p className="font-mono text-[8px] tracking-[0.14em] leading-relaxed mb-5" style={{ color: '#4A4642' }}>
                  SHIPPING & TAXES CALCULATED AT CHECKOUT. SECURE PROCESSING VIA RAZORPAY.
                </p>

                {/* Checkout CTA */}
                <button
                  onClick={() => { onClose(); router.push('/cart'); }}
                  className="w-full flex items-center justify-center gap-3 font-mono text-[10px] font-bold tracking-[0.2em] py-4 rounded-[2px] cursor-pointer transition-all duration-300"
                  style={{ background: '#C9A96E', color: '#080808' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#E8CFA0'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#C9A96E'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                >
                  <ShoppingBag size={11} />
                  VIEW BAG
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
