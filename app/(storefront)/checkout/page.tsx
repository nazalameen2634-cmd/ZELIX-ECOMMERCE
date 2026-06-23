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
  const taxAmount = (subtotal - discountAmount) * 0.18;
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
    if (step === 1) {
      const cleanedPhone = formData.phone.replace(/\D/g, '');
      if (cleanedPhone.length !== 10) {
        setPhoneError('PLEASE ENTER A VALID 10-DIGIT PHONE NUMBER');
        toast('PLEASE CORRECT THE ERRORS IN THE FORM', 'error');
        return;
      } else {
        setPhoneError('');
      }
    }
    if (step < 3) {
      setStep((s) => s + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((s) => s - 1);
    }
  };

  // Process Live Razorpay Checkout
  const handleLivePayment = async (orderId: string) => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast('RAZORPAY GATEWAY FAILED TO LOAD', 'error');
      setIsPlacingOrder(false);
      return;
    }

    try {
      // Create Razorpay Order on server
      const response = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalTotal,
          receipt: orderId,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.id) {
        throw new Error(data.message || 'Razorpay order creation failed');
      }

      // Configure SDK options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        name: 'ZELIX STOREFRONT',
        description: `ORDER PAYMENT Receipt: ${orderId}`,
        order_id: data.id,
        callback_url: `${window.location.origin}/api/checkout/verify-payment-redirect?order_id=${orderId}`,
        handler: async function (paymentResponse: any) {
          setIsPlacingOrder(true);
          try {
            // Verify payment signature on backend
            const verifyRes = await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: orderId,
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                // Pass cart items so they get saved to order_items table
                order_items: items.map((item) => ({
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

            if (verifyRes.ok) {
              toast('PAYMENT VERIFIED AND ORDER CONFIRMED', 'success');
              clearCart();
              setCheckoutSuccessOrder({
                order_number: orderId,
                total: finalTotal
              });
            } else {
              const errData = await verifyRes.json();
              toast(errData.message || 'SIGNATURE VERIFICATION FAILED. SUPPORT CONTACTED.', 'error');
            }
          } catch (e) {
            console.error(e);
            toast('VERIFICATION EXCEPTION TRIGGERED', 'error');
          } finally {
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#000000',
        },
        modal: {
          ondismiss: function () {
            setIsPlacingOrder(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'GATEWAY INITIATION EXCEPTION', 'error');
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

    // Try live insertion to Supabase first
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([finalOrder])
        .select('id, order_number')
        .single();

      if (error) {
        throw error;
      }

      // Insert order items to DB immediately
      const orderItemsRows = items.map((item) => ({
        order_id: data.id,
        product_id: item.product.id,
        variant_id: item.variantId || null,
        title: item.product.title,
        variant_info: { size: item.size, color: item.color },
        quantity: item.quantity,
        unit_price: item.price,
        line_total: item.price * item.quantity,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsRows);
      if (itemsError) {
        console.error('Error inserting order items upfront:', itemsError);
      }

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

      // 1. If live Razorpay publishable keys are present, open payment gateway
      if (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        await handleLivePayment(data.order_number);
      } else {
        // 2. Fallback to Simulated Checkout success
        setTimeout(async () => {
          // Update payment status to paid in preview mode
          await supabase
            .from('orders')
            .update({ payment_status: 'paid', fulfillment_status: 'processing' })
            .eq('id', data.id);

          // Insert order timeline log
          await supabase.from('order_timeline').insert([{
            order_id: data.id,
            status: 'processing',
            note: 'Order paid and processed in mock payment mode',
          }]);

          toast('PREVIEW ORDER PLACED SUCCESSFULLY', 'success');
          clearCart();
          setIsPlacingOrder(false);
          setCheckoutSuccessOrder({
            order_number: data.order_number,
            total: finalTotal
          });
        }, 1500);
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
      <div className="bg-black min-h-screen py-24 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="border border-white/5 bg-neutral-950/40 p-10 md:p-16 rounded-sm max-w-3xl w-full text-center flex flex-col items-center shadow-2xl relative overflow-hidden"
        >
          {/* Subtle grid background for premium tech-wear feel */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-24 h-24 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E] mb-8"
          >
            <CheckCircle2 size={48} />
          </motion.div>

          <span className="font-mono text-[10px] tracking-[0.2em] text-neutral-500 uppercase mb-3">
            TRANSACTION VERIFIED
          </span>
          <h1 className="text-[32px] md:text-[48px] font-sans font-black tracking-tight uppercase text-white mb-8 leading-none">
            ORDER CONFIRMED
          </h1>

          <div className="w-full border-t border-b border-white/5 py-8 my-8 flex flex-col gap-5 font-mono text-[11px] text-left">
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-neutral-500">ORDER NUMBER</span>
              <span className="text-white font-bold tracking-widest text-sm">{checkoutSuccessOrder.order_number}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-neutral-500">TOTAL AMOUNT</span>
              <span className="text-[#C9A96E] font-black text-sm">{formatCurrency(checkoutSuccessOrder.total)}</span>
            </div>
            <div className="flex justify-between border-b border-white/5 pb-4">
              <span className="text-neutral-500">SHIPPING TO</span>
              <span className="text-white uppercase font-bold text-right max-w-sm truncate">
                {formData.fullName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">DELIVERY METHOD</span>
              <span className="text-white uppercase font-bold text-right">
                {shippingMethod === 'express' ? 'EXPRESS ARCHIVE DELIVERY' : 'STANDARD DELIVERY'}
              </span>
            </div>
          </div>

          <p className="font-sans text-[13px] text-neutral-400 max-w-lg mb-10 leading-relaxed">
            Your order has been logged into the system. A confirmation email with details of the package tracking has been sent to <span className="text-white font-semibold">{formData.email}</span>.
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
    <div className="bg-black min-h-screen py-16">
      <div className="container-custom">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col gap-2 mb-12 border-b border-white/5 pb-8">
          <span className="font-mono text-[9px] tracking-widest text-neutral-500 uppercase flex items-center gap-2">
            <Link href="/cart" className="hover:text-white transition-colors flex items-center gap-1.5">
              <ArrowLeft size={11} /> RETURN TO BAG
            </Link>
          </span>
          <h1 className="text-[28px] md:text-[36px] font-sans font-black tracking-tight uppercase text-white mt-2">
            CHECKOUT
          </h1>
        </div>

        {/* Checkout Steps navigation indicators */}
        <div className="flex items-center justify-between max-w-lg mx-auto mb-16 relative">
          {/* Progress bar */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/10 -translate-y-1/2 z-0" />
          <div
            style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            className="absolute top-1/2 left-0 h-[1px] bg-white -translate-y-1/2 z-0 transition-all duration-300"
          />

          {/* Steps */}
          {[
            { id: 1, label: 'SHIPPING', icon: <Truck size={12} /> },
            { id: 2, label: 'METHOD', icon: <ClipboardList size={12} /> },
            { id: 3, label: 'PAYMENT', icon: <CreditCard size={12} /> },
          ].map((item) => (
            <div key={item.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full border flex items-center justify-center font-mono text-[11px] font-bold transition-all duration-300 ${
                  step >= item.id ? 'bg-white text-black border-white' : 'bg-black border-white/10 text-neutral-500'
                }`}
              >
                {step > item.id ? <CheckCircle2 size={14} className="text-black" /> : item.icon}
              </div>
              <span
                className={`font-mono text-[9px] font-bold tracking-widest uppercase mt-2 transition-colors duration-300 ${
                  step >= item.id ? 'text-white' : 'text-neutral-600'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
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
                  <h2 className="font-mono text-[11px] font-black tracking-widest text-white uppercase border-b border-white/5 pb-4 mb-6">
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
                      label="APARTMENT, SUITE, UNIT (OPTIONAL)"
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
                        <div className="relative border rounded-sm bg-neutral-950 border-white/10 hover:border-white/20 transition-colors duration-200">
                          <label className="absolute left-4 top-1 text-[9px] font-mono font-semibold tracking-wider uppercase text-neutral-500">
                            STATE / PROVINCE
                          </label>
                          <select
                            value={formData.state}
                            onChange={(e) => handleInputChange('state', e.target.value)}
                            className="w-full px-4 pt-5 pb-2 text-[13px] text-white bg-transparent outline-none appearance-none cursor-pointer font-sans"
                            style={{ colorScheme: 'dark' }}
                          >
                            <option value="" disabled className="bg-neutral-950 text-neutral-500">SELECT STATE</option>
                            {INDIAN_STATES.map((st) => (
                              <option key={st} value={st.toUpperCase()} className="bg-neutral-950 text-white uppercase font-mono">
                                {st.toUpperCase()}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500 font-mono text-[9px]">
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

                    <Button type="submit" variant="primary" className="self-end mt-6">
                      CONTINUE TO SHIPPING METHOD
                    </Button>
                  </form>
                </motion.div>
              )}

              {step === 2 && (
                /* Step 2: Shipping Method Selector */
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col"
                >
                  <h2 className="font-mono text-[11px] font-black tracking-widest text-white uppercase border-b border-white/5 pb-4 mb-6">
                    SELECT DELIVERY SERVICE
                  </h2>
                  <form onSubmit={handleNextStep} className="flex flex-col gap-4">
                    {/* Method Radio Cards */}
                    <div className="flex flex-col gap-3">
                      {/* Standard option */}
                      <label
                        className={`flex items-center justify-between p-5 border rounded-sm cursor-pointer transition-colors ${
                          shippingMethod === 'standard' ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/20 bg-neutral-950/40'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={shippingMethod === 'standard'}
                            onChange={() => setShippingMethod('standard')}
                            className="accent-white cursor-pointer"
                          />
                          <div>
                            <span className="font-mono text-[11px] font-bold text-white tracking-widest uppercase">
                              STANDARD DELIVERY
                            </span>
                            <span className="block text-[12px] text-neutral-500 mt-1 font-sans">
                              ESTIMATED ARRIVAL IN 5-7 BUSINESS DAYS
                            </span>
                          </div>
                        </div>
                        <span className="text-[12px] font-semibold text-green-400">
                          FREE
                        </span>
                      </label>

                      {/* Express option */}
                      <label
                        className={`flex items-center justify-between p-5 border rounded-sm cursor-pointer transition-colors ${
                          shippingMethod === 'express' ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/20 bg-neutral-950/40'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="shippingMethod"
                            checked={shippingMethod === 'express'}
                            onChange={() => setShippingMethod('express')}
                            className="accent-white cursor-pointer"
                          />
                          <div>
                            <span className="font-mono text-[11px] font-bold text-white tracking-widest uppercase">
                              EXPRESS ARCHIVE DELIVERY
                            </span>
                            <span className="block text-[12px] text-neutral-500 mt-1 font-sans">
                              ESTIMATED ARRIVAL IN 2-3 BUSINESS DAYS
                            </span>
                          </div>
                        </div>
                        <span className="text-[12px] font-semibold text-green-400">
                          FREE
                        </span>
                      </label>
                    </div>

                    <div className="flex justify-between mt-8">
                      <Button type="button" variant="outline" onClick={handlePrevStep}>
                        GO BACK
                      </Button>
                      <Button type="submit" variant="primary">
                        CONTINUE TO PAYMENT
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}

              {step === 3 && (
                /* Step 3: Payment Section & Custom Elements Fallback */
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-mono text-[11px] font-black tracking-widest text-white uppercase border-b border-white/5 pb-4 mb-6">
                    SECURE TRANSACTION METHOD
                  </h2>

                  <div className="flex flex-col gap-6">
                    {/* Razorpay element styling mock card input */}
                    <div className="border border-white/10 bg-neutral-950 p-6 rounded-sm">
                      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                        <div className="flex items-center gap-2">
                          <CreditCard className="text-neutral-400" size={16} />
                          <span className="font-mono text-[10px] font-bold tracking-widest text-white uppercase">
                            RAZORPAY PAYMENTS PORTAL
                          </span>
                        </div>
                        <Shield className="text-green-500" size={14} />
                      </div>

                      {/* Razorpay explanation */}
                      <div className="flex flex-col items-center justify-center py-8 text-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                          <Shield className="text-green-500" size={24} />
                        </div>
                        <div>
                          <h4 className="font-sans font-bold text-white text-sm tracking-wide mb-2">SECURE ENCRYPTED CHECKOUT</h4>
                          <p className="font-mono text-[10px] text-neutral-500 tracking-wider leading-relaxed max-w-sm mx-auto">
                            By clicking below, you will open the secure Razorpay payment gateway to complete your transaction using UPI, Cards, Netbanking, or Wallets.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <Button type="button" variant="outline" onClick={handlePrevStep} disabled={isPlacingOrder}>
                        GO BACK
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        onClick={handlePlaceOrder}
                        isLoading={isPlacingOrder}
                      >
                        {isPlacingOrder ? (
                          <span className="flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" /> PLACING ORDER
                          </span>
                        ) : (
                          'PAY & PLACE ORDER'
                        )}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Order Review Panel */}
          <div className="lg:col-span-4">
            <div className="border border-white/5 bg-neutral-950/40 p-6 rounded-sm flex flex-col">
              <h3 className="font-mono text-[10px] font-bold tracking-widest text-white uppercase border-b border-white/5 pb-4 mb-6">
                ORDER REVIEW ({items.length})
              </h3>

              {/* Items List */}
              <div className="flex flex-col gap-4 border-b border-white/5 pb-5 mb-5 max-h-[280px] overflow-y-auto hide-scrollbar">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <img
                      src={item.product.images?.[0]?.image_url || item.product.og_image_url || '/placeholder.jpg'}
                      alt={item.product.title}
                      className="w-10 aspect-[3/4] object-cover rounded-sm border border-white/5 bg-neutral-900 shrink-0"
                    />
                    <div className="flex-1">
                      <h4 className="text-[11px] font-bold text-white tracking-wide uppercase line-clamp-1">
                        {item.product.title}
                      </h4>
                      <p className="text-[9px] font-mono text-neutral-500 tracking-widest uppercase mt-0.5">
                        Qty: {item.quantity} | Size: {item.size}
                      </p>
                    </div>
                    <span className="text-[12px] font-semibold text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Calculations */}
              <div className="flex flex-col gap-3 font-mono text-[10px] tracking-wide text-neutral-500 border-b border-white/5 pb-5 mb-5">
                <div className="flex justify-between">
                  <span>BAG SUB-TOTAL</span>
                  <span className="text-white font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>COUPON DISCOUNT</span>
                    <span className="font-semibold">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>TAX FEE (18%)</span>
                  <span className="text-white font-semibold">{formatCurrency(taxAmount)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-[10px] font-black tracking-widest text-white uppercase">
                  TOTAL AMOUNT
                </span>
                <span className="text-[18px] font-extrabold text-white">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-neutral-900/90 border border-white/10 p-8 rounded-sm max-w-md w-[90%] text-center flex flex-col items-center gap-6 shadow-2xl backdrop-blur-xl"
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
                  className="absolute inset-2 rounded-full border-2 border-transparent border-b-white border-l-white opacity-40"
                />
                <CreditCard className="text-white animate-pulse" size={24} />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="font-mono text-[12px] font-black tracking-widest text-white uppercase">
                  PROCESSING TRANSACTION
                </h3>
                <p className="font-mono text-[9px] text-neutral-500 tracking-wider leading-relaxed">
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
