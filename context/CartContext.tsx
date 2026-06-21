'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '@/types';

interface FlyingItem {
  id: string;
  src: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  endX: number;
  endY: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product,
    quantity: number,
    size: string,
    color?: string,
    variantId?: string | null,
    imageElement?: HTMLImageElement | null
  ) => void;
  removeItem: (itemIndex: number) => void;
  updateQuantity: (itemIndex: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  itemCount: number;
  coupon: Coupon | null;
  applyCoupon: (coupon: Coupon | null) => void;
  discountAmount: number;
  isCartBouncing: boolean;
  triggerCartBounce: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart items from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('zelix_cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
    const savedCoupon = localStorage.getItem('zelix_coupon');
    if (savedCoupon) {
      try {
        setCoupon(JSON.parse(savedCoupon));
      } catch (e) {
        console.error('Error loading coupon:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart items to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('zelix_cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  // Save coupon to localStorage on changes
  useEffect(() => {
    if (isLoaded) {
      if (coupon) {
        localStorage.setItem('zelix_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('zelix_coupon');
      }
    }
  }, [coupon, isLoaded]);

  const triggerCartBounce = () => {
    setIsCartBouncing(true);
    setTimeout(() => setIsCartBouncing(false), 600);
  };

  const addItem = (
    product: Product,
    quantity: number,
    size: string,
    color?: string,
    variantId?: string | null,
    imageElement?: HTMLImageElement | null
  ) => {
    // 1. Ghost Flying Animation
    if (imageElement) {
      const rect = imageElement.getBoundingClientRect();
      const cartIconEl = document.getElementById('cart-icon-btn');
      const cartRect = cartIconEl?.getBoundingClientRect();
      
      const startX = rect.left + window.scrollX;
      const startY = rect.top + window.scrollY;
      const endX = cartRect ? cartRect.left + cartRect.width / 2 + window.scrollX : window.innerWidth - 60;
      const endY = cartRect ? cartRect.top + cartRect.height / 2 + window.scrollY : 30;

      const flyId = Math.random().toString(36).substring(2, 9);
      const mainImageSrc = product.images?.[0]?.image_url || product.og_image_url || '/placeholder.jpg';

      setFlyingItems((prev) => [
        ...prev,
        {
          id: flyId,
          src: mainImageSrc,
          startX,
          startY,
          width: rect.width,
          height: rect.height,
          endX,
          endY,
        },
      ]);

      // Trigger cart bounce after flying animation finishes
      setTimeout(() => {
        setFlyingItems((prev) => prev.filter((item) => item.id !== flyId));
        triggerCartBounce();
      }, 850);
    } else {
      triggerCartBounce();
    }

    // 2. Add item to cart list
    setItems((prev) => {
      // Check if duplicate variant/size already in cart
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.size === size &&
          item.color === color
      );

      // Determine price (check if variant override or product sale price exists)
      let finalPrice = product.price;
      if (product.sale_price !== null && product.sale_price !== undefined) {
        finalPrice = product.sale_price;
      }

      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].quantity;
        const maxStock = product.stock_quantity;
        // Don't exceed stock if tracking inventory and backorders not allowed
        let newQty = currentQty + quantity;
        if (product.track_inventory && !product.allow_backorders) {
          newQty = Math.min(newQty, maxStock);
        }
        updated[existingIndex].quantity = newQty;
        return updated;
      }

      return [
        ...prev,
        {
          product,
          quantity,
          size,
          color,
          variantId,
          price: finalPrice,
        },
      ];
    });
  };

  const removeItem = (itemIndex: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== itemIndex));
  };

  const updateQuantity = (itemIndex: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== itemIndex) return item;
        const maxStock = item.product.stock_quantity;
        let newQty = quantity;
        if (item.product.track_inventory && !item.product.allow_backorders) {
          newQty = Math.min(Math.max(1, quantity), maxStock);
        }
        return { ...item, quantity: Math.max(1, newQty) };
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setCoupon(null);
  };

  const applyCoupon = (newCoupon: Coupon | null) => {
    setCoupon(newCoupon);
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  let discountAmount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      discountAmount = (subtotal * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        itemCount,
        coupon,
        applyCoupon,
        discountAmount,
        isCartBouncing,
        triggerCartBounce,
      }}
    >
      {children}

      {/* Flying Ghost Image Animation Portal/Overlay */}
      {flyingItems.map((item) => (
        <FlyingImageGhost key={item.id} {...item} />
      ))}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Internal ghost image component
import { motion as m } from 'framer-motion';
function FlyingImageGhost({
  src,
  startX,
  startY,
  width,
  height,
  endX,
  endY,
}: FlyingItem) {
  // We use keyframes to represent a bezier arc
  return (
    <m.img
      src={src}
      alt="flying product"
      initial={{
        position: 'absolute',
        top: startY,
        left: startX,
        width: width,
        height: height,
        opacity: 0.9,
        scale: 1,
        rotate: 0,
        zIndex: 9999,
        pointerEvents: 'none',
        borderRadius: '4px',
        objectFit: 'cover',
      }}
      animate={{
        top: [startY, startY - 100, endY], // arc path
        left: [startX, (startX + endX) / 2, endX],
        width: width * 0.15,
        height: height * 0.15,
        opacity: [0.9, 0.7, 0],
        scale: [1, 0.8, 0.15],
        rotate: 15,
      }}
      transition={{
        duration: 0.8,
        ease: [0.25, 1, 0.5, 1], // ease out cubic
      }}
    />
  );
}
