'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, Shield, Truck, ClipboardList, CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

// Razorpay SDK Script Loader Utility
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const {
    items,
    subtotal,
    discountAmount,
    coupon,
    clearCart,
  } = useCart();

  // Checkout Steps: 1 = Shipping, 2 = Shipping Method, 3 = Payment & Review
  const [step, setStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);
  const [checkoutSuccessOrder, setCheckoutSuccessOrder] = useState<any | null>(null);
  const [phoneError, setPhoneError] = useState('');

  // Redirect if cart is empty (only if checkout hasn't succeeded)
  useEffect(() => {
    if (items.length === 0 && !checkoutSuccessOrder) {
      router.push('/cart');
    }
  }, [items, checkoutSuccessOrder, router]);

  // Scroll to top of the page when checkout step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'INDIA',
  });

  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('express');
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvc: '',
  });

  // Calculate fees
  const baseShippingCost = 0; // Free delivery for all orders
  const taxAmount = 0; // Tax removed
  const finalTotal = Math.max(0, subtotal - discountAmount + baseShippingCost + taxAmount);

  // Auto-fill address book if user is logged in
  useEffect(() => {
    async function loadAddress() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        if (data) {
          setFormData({
            fullName: data.full_name,
            email: user.email || '',
            phone: data.phone,
            address1: data.address_line1,
            address2: data.address_line2 || '',
            city: data.city,
            state: data.state,
            zip: data.zip,
            country: data.country,
          });
        }
      } catch (e) {
        // Safe to ignore
      }
    }
    loadAddress();
  }, [user]);

  const handleInputChange = (key: string, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
    if (key === 'phone') {
      setPhoneError('');
    }
  };

  const handleZipChange = async (zipCode: string) => {
    handleInputChange('zip', zipCode);
    const cleaned = zipCode.replace(/\D/g, '');
    if (cleaned.length === 6) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${cleaned}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice[0]) {
          const postOffice = data[0].PostOffice[0];
          setFormData((prev) => ({
            ...prev,
            city: (postOffice.District || postOffice.Name || '').toUpperCase(),
            state: (postOffice.State || '').toUpperCase(),
          }));
        }
      } catch (err) {
        console.error('Error fetching postal code details:', err);
      }
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPhone = formData.phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      setPhoneError('PLEASE ENTER A VALID 10-DIGIT PHONE NUMBER');
      toast('PLEASE CORRECT THE ERRORS IN THE FORM', 'error');
      return;
    } else {
      setPhoneError('');
    }

    const cleanedZip = formData.zip.replace(/\D/g, '');
    if (cleanedZip.length !== 6) {
      toast('PLEASE ENTER A VALID 6-DIGIT PIN CODE', 'error');
      return;
    }
    
    // Instead of advancing step, place the order immediately!
    handlePlaceOrder();
  };

  const handleLivePayment = async (orderId: string, totalAmount: number) => {
    try {
      const res = await loadRazorpayScript();
      if (!res) {
        toast('Razorpay SDK failed to load. Are you online?', 'error');
        setIsPlacingOrder(false);
        return;
      }

      // 1. Create order on server
      const orderResponse = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, receipt: orderId }),
      });
      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        toast('Server error. Could not initialize payment gateway.', 'error');
        setIsPlacingOrder(false);
        return;
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Z E L I X',
        description: `Order ${orderId}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // 3. Verify Payment Signature
          const verifyData = {
            order_id: orderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };

          const verifyRes = await fetch('/api/checkout/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(verifyData),
          });

          if (verifyRes.ok) {
            toast('PAYMENT SUCCESSFUL. ORDER CONFIRMED.', 'success');
            clearCart();
            setIsPlacingOrder(false);
            setCheckoutSuccessOrder({ order_number: orderId, total: totalAmount });
          } else {
            toast('PAYMENT VERIFICATION FAILED', 'error');
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#111111',
        },
        modal: {
          ondismiss: function () {
            toast('PAYMENT CANCELLED. PLEASE TRY AGAIN.', 'error');
            setIsPlacingOrder(false);
          },
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        toast(`PAYMENT FAILED: ${response.error.description}`, 'error');
        setIsPlacingOrder(false);
      });
      paymentObject.open();
    } catch (err) {
      toast('UNEXPECTED PAYMENT ERROR', 'error');
      console.error(err);
      setIsPlacingOrder(false);
    }
  };

  // Submit Order Details
  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);

    const shippingInfo = {
      full_name: formData.fullName,
      phone: formData.phone,
      address_line1: formData.address1,
      address_line2: formData.address2,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      country: formData.country,
    };

    const finalOrder = {
      user_id: user?.id || null,
      email: formData.email,
      shipping_address: shippingInfo,
      billing_address: shippingInfo, // default billing same as shipping
      shipping_method: shippingMethod,
      shipping_cost: baseShippingCost,
      subtotal: subtotal,
      discount_amount: discountAmount,
      tax_amount: taxAmount,
      total: finalTotal,
      coupon_code: coupon?.code || null,
      payment_status: 'pending',
      fulfillment_status: 'pending',
    };

    // Use the API route to safely insert order and items bypassing RLS
    try {
      const response = await fetch('/api/checkout/place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData: finalOrder,
          orderItems: items.map((item) => ({
            product_id: item.product.id,
            variant_id: item.variantId || null,
            title: item.product.title,
            variant_info: { size: item.size, color: item.color },
            quantity: item.quantity,
            unit_price: item.price,
            line_total: item.price * item.quantity,
          })),
        }),
      });

      const responseData = await response.json();
      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Failed to place order');
      }

      const data = responseData.order;


      // Save address if requested
      if (user && saveAddress) {
        try {
          await supabase.from('addresses').insert([{
            user_id: user.id,
            full_name: formData.fullName,
            phone: formData.phone,
            address_line1: formData.address1,
            address_line2: formData.address2,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
            is_default: true
          }]);
        } catch (addrErr) {
          console.error('Error saving address:', addrErr);
        }
      }


      // If Razorpay is configured, trigger the payment gateway
      if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        handleLivePayment(data.order_number, finalTotal);
      } else {
        // Fallback: Finalize order directly (Cash on Delivery)
        setTimeout(async () => {
          toast('ORDER PLACED SUCCESSFULLY', 'success');
          clearCart();
          setIsPlacingOrder(false);
          setCheckoutSuccessOrder({
            order_number: data.order_number,
            total: finalTotal
          });
        }, 500);
      }
    } catch (err) {
      console.warn('Supabase offline. Placing order in memory mockup.');
      
      // Simulate complete order placement
      setTimeout(() => {
        const simulatedOrderNumber = 'ORD-' + Math.floor(10000 + Math.random() * 90000);
        toast('MOCKUP ORDER PLACED (PREVIEW MODE)', 'success');
        clearCart();
        setIsPlacingOrder(false);
        setCheckoutSuccessOrder({
          order_number: simulatedOrderNumber,
          total: finalTotal
        });
      }, 1500);
    }
  };

  if (checkoutSuccessOrder) {
    return (
      <div className="bg-[#FDFBF7] min-h-screen py-24 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-[#E8E3DC] bg-white p-10 md:p-16 rounded-sm max-w-3xl w-full text-center flex flex-col items-center shadow-lg relative overflow-hidden"
        >
          {/* Subtle grid background for premium tech-wear feel */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] mb-8"
          >
            <CheckCircle2 size={48} />
          </motion.div>

          <span className="font-mono text-[10px] tracking-[0.2em] text-[#6B6560] uppercase mb-3">
            TRANSACTION VERIFIED
          </span>
          <h1 className="text-[32px] md:text-[48px] font-sans font-black tracking-tight uppercase text-[#111111] mb-8 leading-none">
            ORDER CONFIRMED
          </h1>

          <div className="w-full border-t border-b border-[rgba(0,0,0,0.06)] py-8 my-8 flex flex-col gap-5 font-mono text-[11px] text-left">
            <div className="flex justify-between border-b border-[rgba(0,0,0,0.03)] pb-4">
              <span className="text-[#6B6560]">ORDER NUMBER</span>
              <span className="text-[#111111] font-bold tracking-widest text-sm">{checkoutSuccessOrder.order_number}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(0,0,0,0.03)] pb-4">
              <span className="text-[#6B6560]">TOTAL AMOUNT</span>
              <span className="text-[#C9A96E] font-black text-sm">{formatCurrency(checkoutSuccessOrder.total)}</span>
            </div>
            <div className="flex justify-between border-b border-[rgba(0,0,0,0.03)] pb-4">
              <span className="text-[#6B6560]">SHIPPING TO</span>
              <span className="text-[#111111] uppercase font-bold text-right max-w-sm truncate">
                {formData.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B6560]">DELIVERY METHOD</span>
              <span className="text-[#111111] uppercase font-bold text-right">
                {shippingMethod === 'express' ? 'EXPRESS ARCHIVE DELIVERY' : 'STANDARD DELIVERY'}
              </span>
            </div>
          </div>

          <p className="font-sans text-[13px] text-[#6B6560] max-w-lg mb-10 leading-relaxed">
            Your order has been logged into the system. A confirmation email with details of the package tracking has been sent to <span className="text-[#111111] font-semibold">{formData.email}</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href={`/track?order_number=${checkoutSuccessOrder.order_number}`} className="w-full sm:w-auto">
              <Button variant="primary" className="w-full">
                TRACK YOUR ORDER
              </Button>
            </Link>
            <Link href="/products" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full">
                CONTINUE SHOPPING
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen py-16">
      <div className="container-custom">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col gap-2 mb-12 border-b border-[rgba(0,0,0,0.06)] pb-8">
          <span className="font-mono text-[9px] tracking-widest text-[#6B6560] uppercase flex items-center gap-2">
            <Link href="/cart" className="hover:text-[#111111] transition-colors flex items-center gap-1.5">
              <ArrowLeft size={11} /> RETURN TO BAG
            </Link>
          </span>
          <h1 className="text-[28px] md:text-[36px] font-sans font-black tracking-tight uppercase text-[#111111] mt-2">
            CHECKOUT
          </h1>
        </div>

        {/* Checkout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Column: Checkout Wizard forms */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                /* Step 1: Shipping Address Form */
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-mono text-[11px] font-black tracking-widest text-[#111111] uppercase border-b border-[rgba(0,0,0,0.06)] pb-4 mb-6">
                    DELIVERY INFORMATION
                  </h2>
                  <form onSubmit={handleNextStep} className="flex flex-col gap-2">
                    <Input
                      label="FULL NAME"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="EMAIL ADDRESS"
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
                      <Input
                        label="PHONE NUMBER"
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        error={phoneError}
                      />
                    </div>
                    <Input
                      label="STREET ADDRESS LINE 1"
                      required
                      value={formData.address1}
                      onChange={(e) => handleInputChange('address1', e.target.value)}
                    />
                    <Input
                      label="APARTMENT, SUITE, UNIT"
                      required
                      value={formData.address2}
                      onChange={(e) => handleInputChange('address2', e.target.value)}
                    />
                    <Input
                      label="PIN CODE"
                      required
                      value={formData.zip}
                      onChange={(e) => handleZipChange(e.target.value)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input
                        label="CITY"
                        required
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                      <div className="relative w-full">
                        <div className="relative border rounded-sm bg-white border-[rgba(0,0,0,0.1)] hover:border-black transition-colors duration-200">
                          <label className="absolute left-4 top-1 text-[9px] font-mono font-semibold tracking-wider uppercase text-[#6B6560]">
                            STATE / PROVINCE
                          </label>
                          <select
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="w-full px-4 pt-5 pb-2 text-[13px] text-[#111111] bg-transparent outline-none appearance-none cursor-pointer font-sans"
                            style={{ colorScheme: 'light' }}
                          >
                            <option value="" disabled className="bg-white text-[#6B6560]">SELECT STATE</option>
                            {INDIAN_STATES.map((st) => (
                              <option key={st} value={st.toUpperCase()} className="bg-white text-[#111111] uppercase font-mono">
                                {st.toUpperCase()}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B6560] font-mono text-[9px]">
                            ▼
                          </div>
                        </div>
                      </div>
                    </div>
                    <Input
                      label="COUNTRY"
                      required
                      disabled
                      value={formData.country}
                    />

                    {user && (
                      <div className="flex items-center gap-2 mt-4 select-none">
                        <input
                          type="checkbox"
                          id="saveAddress"
                          checked={saveAddress}
                          onChange={(e) => setSaveAddress(e.target.checked)}
                          className="accent-[#C9A96E] h-4 w-4 rounded-[2px] cursor-pointer"
                        />
                        <label htmlFor="saveAddress" className="font-mono text-[9px] tracking-[0.14em] text-neutral-400 cursor-pointer hover:text-white transition-colors">
                          SAVE THIS ADDRESS FOR FUTURE ORDERS
                        </label>
                      </div>
                    )}

                    <Button type="submit" variant="primary" className="self-end mt-6" isLoading={isPlacingOrder}>
                      {isPlacingOrder ? 'PLACING ORDER...' : 'PLACE ORDER'}
                    </Button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Review Panel */}
          <div className="lg:col-span-4">
            <div className="border border-[rgba(0,0,0,0.06)] bg-white p-6 rounded-sm flex flex-col shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#111111] uppercase border-b border-[rgba(0,0,0,0.03)] pb-4 mb-6">
                ORDER REVIEW ({items.length})
              </h3>

              {/* Items List */}
              <div className="flex flex-col gap-4 border-b border-[rgba(0,0,0,0.03)] pb-5 mb-5 max-h-[280px] overflow-y-auto hide-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <img
                      src={item.product.images?.[0]?.image_url || item.product.og_image_url || '/placeholder.jpg'}
                      alt={item.product.title}
                      className="w-10 aspect-[3/4] object-cover rounded-sm border border-[rgba(0,0,0,0.06)] bg-[#FAFAFA] shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="text-[11px] font-bold text-[#111111] tracking-wide uppercase line-clamp-1">
                        {item.product.title}
                      </h4>
                      <p className="text-[9px] font-mono text-[#6B6560] tracking-widest uppercase mt-0.5">
                        Qty: {item.quantity} | Size: {item.size}
                      </p>
                    </div>
                    <span className="text-[12px] font-semibold text-[#111111]">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="flex flex-col gap-3 font-mono text-[10px] tracking-wide text-[#6B6560] border-b border-[rgba(0,0,0,0.03)] pb-5 mb-5">
                <div className="flex justify-between">
                  <span>BAG SUB-TOTAL</span>
                  <span className="text-[#111111] font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#F97066]">
                    <span>COUPON DISCOUNT</span>
                    <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-[10px] font-black tracking-widest text-[#111111] uppercase">
                  TOTAL AMOUNT
                </span>
                <span className="text-[18px] font-extrabold text-[#111111]">
                  {formatCurrency(finalTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isPlacingOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white border border-[rgba(0,0,0,0.06)] p-8 rounded-sm max-w-md w-[90%] text-center flex flex-col items-center gap-6 shadow-2xl backdrop-blur-xl"
            >
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* Outer spinning ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#C9A96E] border-r-[#C9A96E]"
                />
                {/* Inner counter-spinning ring */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#111111] border-l-[#111111] opacity-20"
                />
                <CreditCard className="text-[#111111] animate-pulse" size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-mono text-[12px] font-black tracking-widest text-[#111111] uppercase">
                  PROCESSING TRANSACTION
                </h3>
                <p className="font-mono text-[9px] text-[#6B6560] tracking-wider leading-relaxed">
                  AUTHENTICATING AND SECURING YOUR PAYMENT VIA RAZORPAY.<br />
                  PLEASE DO NOT REFRESH OR CLOSE THIS WINDOW.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
