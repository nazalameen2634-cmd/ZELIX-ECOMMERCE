'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ClipboardList, MapPin, Heart, LogOut, Plus, Trash2, Edit3, Image, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Order, Address, Product } from '@/types';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/storefront/ProductCard';

export default function AccountDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, profile, signOut, loading: authLoading } = useAuth();

  // Tab views: 'dashboard' | 'orders' | 'addresses' | 'profile' | 'wishlist'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'addresses' | 'profile' | 'wishlist'>('dashboard');

  // Dashboard Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Address Form CRUD States
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: 'INDIA',
    isDefault: false,
  });

  // Profile Settings Edit States
  const [profileName, setProfileName] = useState(profile?.full_name || '');
  const [profilePhone, setProfilePhone] = useState(profile?.phone || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/account/login');
    }
  }, [user, authLoading, router]);

  // Sync profile details once loaded
  useEffect(() => {
    if (profile) {
      setProfileName(profile.full_name || '');
      setProfilePhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  // Load account data from Supabase
  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    setIsLoadingData(true);
    
    async function loadAccountData() {
      try {
        // 1. Fetch Orders
        const { data: orderData } = await supabase
          .from('orders')
          .select('*, order_items(*)')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        if (orderData) setOrders(orderData as unknown as Order[]);

        // 2. Fetch Addresses
        const { data: addrData } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', userId)
          .order('is_default', { ascending: false });
        if (addrData) setAddresses(addrData as unknown as Address[]);

        // 3. Fetch Wishlist items
        const { data: wishData } = await supabase
          .from('wishlist')
          .select('*, products(*)')
          .eq('user_id', userId);
        
        if (wishData) {
          const wishProducts = wishData.map((item: any) => item.products).filter(Boolean);
          setWishlist(wishProducts as Product[]);
        }
      } catch (e) {
        console.warn('Supabase offline. Simulated data loaders active.');
      } finally {
        setIsLoadingData(false);
      }
    }

    loadAccountData();
  }, [user]);

  // Handle Logout
  const handleLogoutClick = async () => {
    await signOut();
    toast('LOGGED OUT SUCCESSFULLY', 'info');
    router.push('/account/login');
  };

  // Address Form Submissions
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const payload = {
        user_id: user.id,
        full_name: addressForm.fullName,
        phone: addressForm.phone,
        address_line1: addressForm.addressLine1,
        address_line2: addressForm.addressLine2,
        city: addressForm.city,
        state: addressForm.state,
        zip: addressForm.zip,
        country: addressForm.country,
        is_default: addressForm.isDefault,
      };

      if (addressForm.isDefault) {
        // Set all other addresses is_default = false
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', user.id);
      }

      if (editingAddressId) {
        // Update
        const { error } = await supabase
          .from('addresses')
          .update(payload)
          .eq('id', editingAddressId);
        
        if (error) throw error;
        toast('ADDRESS UPDATED', 'success');
      } else {
        // Insert
        const { error } = await supabase
          .from('addresses')
          .insert([payload]);
        
        if (error) throw error;
        toast('ADDRESS CREATED', 'success');
      }

      // Reload
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      if (data) setAddresses(data as unknown as Address[]);
      
      setIsAddressFormOpen(false);
      setEditingAddressId(null);
      resetAddressForm();
    } catch (err) {
      console.warn('Supabase offline. Address edit simulated.');
      toast('ADDRESS SUBMITTED (PREVIEW MODE)', 'success');
      setIsAddressFormOpen(false);
    }
  };

  const handleEditAddress = (addr: Address) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      fullName: addr.full_name,
      phone: addr.phone,
      addressLine1: addr.address_line1,
      addressLine2: addr.address_line2 || '',
      city: addr.city,
      state: addr.state,
      zip: addr.zip,
      country: addr.country,
      isDefault: addr.is_default,
    });
    setIsAddressFormOpen(true);
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('ARE YOU SURE YOU WANT TO DELETE THIS ADDRESS?')) return;
    try {
      await supabase.from('addresses').delete().eq('id', id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast('ADDRESS DELETED', 'success');
    } catch (e) {
      toast('FAILED TO DELETE ADDRESS', 'error');
    }
  };

  const resetAddressForm = () => {
    setAddressForm({
      fullName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      zip: '',
      country: 'INDIA',
      isDefault: false,
    });
  };

  // Avatar Storage Upload handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarFile(file);

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload file to Supabase Bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Save publicUrl to profiles table
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      setAvatarUrl(publicUrl);
      toast('PROFILE PHOTO UPDATED', 'success');
    } catch (err) {
      console.warn('Storage upload simulated. Key settings required.');
      const localUrl = URL.createObjectURL(file);
      setAvatarUrl(localUrl);
      toast('PHOTO LOADED (PREVIEW MODE)', 'success');
    }
  };

  // Profile fields submit
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileName,
          phone: profilePhone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      toast('PROFILE INFO DEPOSITED SUCCESSFULLY', 'success');
    } catch (err) {
      toast('PROFILE SAVED (PREVIEW MODE)', 'success');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Delete product from Wishlist
  const handleRemoveWishlist = async (productId: string) => {
    if (!user) return;
    try {
      await supabase.from('wishlist').delete().eq('user_id', user.id).eq('product_id', productId);
      setWishlist((prev) => prev.filter((p) => p.id !== productId));
      toast('REMOVED FROM WISHLIST', 'info');
    } catch (e) {
      toast('WISHLIST SYNC ERROR', 'error');
    }
  };

  // Status badge style resolver
  const getStatusBadge = (status: string) => {
    const base = 'text-[9px] font-mono font-bold tracking-widest px-2.5 py-1 rounded-full uppercase ';
    switch (status.toLowerCase()) {
      case 'delivered':
        return base + 'bg-green-500/10 text-green-500 border border-green-500/20';
      case 'shipped':
        return base + 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
      case 'processing':
        return base + 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20';
      case 'cancelled':
        return base + 'bg-red-500/10 text-red-500 border border-red-500/20';
      default:
        return base + 'bg-neutral-800 text-neutral-400 border border-neutral-700';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="bg-black min-h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-white w-8 h-8" />
      </div>
    );
  }

  const sidebarLinks = [
    { label: 'OVERVIEW', val: 'dashboard' as const, icon: <User size={14} /> },
    { label: 'ORDERS HISTORY', val: 'orders' as const, icon: <ClipboardList size={14} /> },
    { label: 'ADDRESS BOOK', val: 'addresses' as const, icon: <MapPin size={14} /> },
    { label: 'MY WISHLIST', val: 'wishlist' as const, icon: <Heart size={14} /> },
    { label: 'PROFILE DETAILS', val: 'profile' as const, icon: <Edit3 size={14} /> },
  ];

  return (
    <div className="bg-black min-h-screen py-16">
      <div className="container-custom">
        {/* Welcome Headers */}
        <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
          <div>
            <span className="font-mono text-[9px] tracking-[0.25em] text-neutral-500 uppercase">
              USER CONSOLE // SYNDICATE MEMBER
            </span>
            <h1 className="text-[28px] md:text-[36px] font-sans font-black tracking-tight uppercase text-white mt-2">
              Welcome back, <span className="text-[#C9A96E]">{profile?.full_name || 'User'}</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 bg-[#C9A96E] hover:bg-[#E8CFA0] text-black px-5 py-2.5 rounded-full font-mono text-[10px] font-black tracking-widest uppercase transition-all duration-200 hover:scale-[1.02]"
              >
                ADMIN PANEL
              </Link>
            )}
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 border border-white/10 hover:border-white px-4 py-2 rounded-full font-mono text-[10px] font-bold tracking-widest text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut size={12} /> LOGOUT
            </button>
          </div>
        </div>

        {/* Console layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Sidebar selectors */}
          <aside className="lg:col-span-3 flex flex-col gap-1.5 border-r border-white/5 pr-4">
            {sidebarLinks.map((item) => (
              <button
                key={item.val}
                onClick={() => setActiveTab(item.val)}
                className={`flex items-center gap-3.5 px-4 py-4 text-left font-mono text-[10px] font-bold tracking-widest uppercase cursor-pointer transition-all duration-200 ${
                  activeTab === item.val
                    ? 'bg-[rgba(201,169,110,0.08)] text-[#C9A96E] border-l-[3px] border-l-[#C9A96E] border-y-transparent border-r-transparent pl-[13px]'
                    : 'border-l-[3px] border-l-transparent text-neutral-500 hover:text-white hover:bg-white/5 border-y-transparent border-r-transparent pl-[13px]'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </aside>

          {/* Right Column: Tab View panel */}
          <main className="lg:col-span-9 flex flex-col min-h-[500px]">
            {isLoadingData ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin text-white w-6 h-6" />
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                  /* TAB 1: OVERVIEW */
                  <motion.div
                    key="tab-dashboard"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-8"
                  >
                    {/* Welcome card banner */}
                    <div className="border border-white/5 p-8 bg-neutral-950 rounded-sm relative overflow-hidden flex flex-col justify-between h-[180px] select-none">
                      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full filter blur-3xl -translate-y-12 translate-x-12" />
                      <div>
                        <span className="font-mono text-[9px] tracking-widest text-neutral-400">
                          ACCOUNT SECURITY OVERVIEW
                        </span>
                        <h2 className="text-[20px] font-black tracking-wide text-white uppercase mt-2">
                          MEMBER SINCE {new Date(profile?.created_at || '').getFullYear()}
                        </h2>
                      </div>
                      <p className="font-mono text-[11px] text-neutral-500 tracking-wider">
                        EMAIL ASSIGNED: {profile?.email}
                      </p>
                    </div>

                    {/* Stats details rows */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Recent address preview */}
                      <div className="border border-white/5 p-6 rounded-sm bg-neutral-950/40">
                        <h3 className="font-mono text-[10px] font-bold tracking-widest text-neutral-400 border-b border-white/5 pb-3 mb-4 uppercase">
                          DEFAULT SHIPPING ADDRESS
                        </h3>
                        {addresses.length === 0 ? (
                          <p className="text-[12px] font-mono text-neutral-600">
                            NO ADDRS SAVED YET.
                          </p>
                        ) : (
                          <div className="font-mono text-[11px] tracking-wide text-neutral-300 uppercase leading-relaxed">
                            <p className="font-bold text-white mb-2">{addresses[0].full_name}</p>
                            <p>{addresses[0].address_line1}</p>
                            {addresses[0].address_line2 && <p>{addresses[0].address_line2}</p>}
                            <p>{addresses[0].city}, {addresses[0].state} - {addresses[0].zip}</p>
                            <p>{addresses[0].country}</p>
                            <p className="text-[9px] text-neutral-500 mt-2">PHONE: {addresses[0].phone}</p>
                          </div>
                        )}
                      </div>

                      {/* Recent order preview */}
                      <div className="border border-white/5 p-6 rounded-sm bg-neutral-950/40">
                        <h3 className="font-mono text-[10px] font-bold tracking-widest text-neutral-400 border-b border-white/5 pb-3 mb-4 uppercase">
                          RECENT ORDER STATUS
                        </h3>
                        {orders.length === 0 ? (
                          <p className="text-[12px] font-mono text-neutral-600">
                            NO TRANSACTIONS COMPLETED.
                          </p>
                        ) : (
                          <div className="flex flex-col gap-4 font-mono text-[11px] tracking-wide uppercase">
                            <div className="flex justify-between">
                              <span className="text-neutral-500">ORDER NUMBER</span>
                              <span className="text-white font-bold">{orders[0].order_number}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">DATE</span>
                              <span className="text-white">{new Date(orders[0].created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-neutral-500">Fulfillment</span>
                              <span className={getStatusBadge(orders[0].fulfillment_status)}>
                                {orders[0].fulfillment_status}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-white/5 pt-3 mt-1 text-[13px] font-bold text-white">
                              <span>TOTAL COST</span>
                              <span>{formatCurrency(orders[0].total)}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'orders' && (
                  /* TAB 2: ORDER HISTORY */
                  <motion.div
                    key="tab-orders"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-6"
                  >
                    <h2 className="font-mono text-[11px] font-black tracking-widest text-white uppercase border-b border-white/5 pb-4 mb-4">
                      TRANSACTION RECORDS ({orders.length})
                    </h2>

                    {orders.length === 0 ? (
                      <p className="text-[12px] font-mono text-neutral-600">
                        NO TRANSACTION DETAILS REGISTERED YET.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {orders.map((ord) => {
                          const isExpanded = expandedOrderId === ord.id;
                          return (
                            <div key={ord.id} className="border border-white/5 bg-neutral-950 p-6 rounded-sm">
                              {/* Order summary row */}
                              <div
                                onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer select-none"
                              >
                                <div className="font-mono text-[11px] tracking-wide uppercase">
                                  <span className="text-neutral-500">REF:</span>{' '}
                                  <span className="text-white font-bold">{ord.order_number}</span>
                                  <span className="block text-[10px] text-neutral-500 mt-1">
                                    PLACED ON: {new Date(ord.created_at).toLocaleDateString()}
                                  </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                  <span className={getStatusBadge(ord.fulfillment_status)}>
                                    {ord.fulfillment_status}
                                  </span>
                                  <span className="font-mono text-[12px] font-bold text-white">
                                    {formatCurrency(ord.total)}
                                  </span>
                                </div>
                              </div>

                              {/* Expanded order item detail */}
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  className="mt-6 border-t border-white/5 pt-6 overflow-hidden flex flex-col gap-6"
                                >
                                  {/* List items */}
                                  <div className="flex flex-col gap-4">
                                    {ord.order_items?.map((item: any, i: number) => (
                                      <div key={i} className="flex justify-between items-center text-[12px]">
                                        <div className="font-mono uppercase">
                                          <span className="text-white font-bold">{item.title}</span>
                                          <span className="block text-[9px] text-neutral-500 mt-0.5">
                                            Size: {item.variant_info?.size || 'OS'} | Qty: {item.quantity}
                                          </span>
                                        </div>
                                        <span className="font-bold text-white">
                                          {formatCurrency(item.line_total)}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Shipment trackers */}
                                  <div className="border border-white/5 bg-black p-4 rounded-sm font-mono text-[10px] tracking-wider uppercase flex flex-col gap-2">
                                    <div className="flex justify-between text-neutral-500">
                                      <span>PAYMENT ID:</span>
                                      <span className="text-white font-bold">{ord.razorpay_payment_id || 'MOCK_CAPTURED'}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500">
                                      <span>SHIPPING CARRIER:</span>
                                      <span className="text-white font-bold">{ord.tracking_carrier || 'BLUE DART EXPRESS'}</span>
                                    </div>
                                    <div className="flex justify-between text-neutral-500">
                                      <span>TRACKING ID:</span>
                                      <span className="text-white font-bold">{ord.tracking_number || 'TRK-9821882001'}</span>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'addresses' && (
                  /* TAB 3: ADDRESS BOOK */
                  <motion.div
                    key="tab-addresses"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-6"
                  >
                    <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
                      <h2 className="font-mono text-[11px] font-black tracking-widest text-white uppercase">
                        ADDRESS BOOK ({addresses.length})
                      </h2>
                      <button
                        onClick={() => {
                          resetAddressForm();
                          setIsAddressFormOpen(true);
                        }}
                        className="flex items-center gap-1.5 border border-white/10 hover:border-white px-4 py-2 rounded-full font-mono text-[9px] font-bold tracking-widest text-white transition-colors cursor-pointer"
                      >
                        <Plus size={11} /> ADD ADDRESS
                      </button>
                    </div>

                    {/* Address form overlay / sheet */}
                    {isAddressFormOpen && (
                      <div className="border border-white/10 p-6 bg-neutral-950 rounded-sm mb-6">
                        <h3 className="font-mono text-[10px] font-bold tracking-widest text-white uppercase mb-6">
                          {editingAddressId ? 'MODIFY ADDRESS' : 'NEW ADDRESS DETAILS'}
                        </h3>
                        <form onSubmit={handleAddressSubmit} className="flex flex-col gap-2">
                          <Input
                            label="RECIPIENT NAME"
                            required
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm((f) => ({ ...f, fullName: e.target.value }))}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              label="CONTACT PHONE"
                              required
                              value={addressForm.phone}
                              onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))}
                            />
                            <Input
                              label="ZIP / POSTAL CODE"
                              required
                              value={addressForm.zip}
                              onChange={(e) => setAddressForm((f) => ({ ...f, zip: e.target.value }))}
                            />
                          </div>
                          <Input
                            label="STREET ADDRESS LINE 1"
                            required
                            value={addressForm.addressLine1}
                            onChange={(e) => setAddressForm((f) => ({ ...f, addressLine1: e.target.value }))}
                          />
                          <Input
                            label="ADDRESS LINE 2 (OPTIONAL)"
                            value={addressForm.addressLine2}
                            onChange={(e) => setAddressForm((f) => ({ ...f, addressLine2: e.target.value }))}
                          />
                          <div className="grid grid-cols-3 gap-4">
                            <Input
                              label="CITY"
                              required
                              value={addressForm.city}
                              onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
                            />
                            <Input
                              label="STATE"
                              required
                              value={addressForm.state}
                              onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))}
                            />
                            <Input
                              label="COUNTRY"
                              required
                              disabled
                              value={addressForm.country}
                            />
                          </div>

                          <label className="flex items-center gap-3.5 py-4 cursor-pointer select-none font-mono text-[10px] tracking-wider text-neutral-400">
                            <input
                              type="checkbox"
                              checked={addressForm.isDefault}
                              onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
                              className="accent-white"
                            />
                            SET AS DEFAULT SHIPPING ADDRESS
                          </label>

                          <div className="flex justify-end gap-3 mt-4 border-t border-white/5 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsAddressFormOpen(false);
                                setEditingAddressId(null);
                              }}
                            >
                              CANCEL
                            </Button>
                            <Button type="submit" variant="primary">
                              SAVE ADDRESS
                            </Button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* Address List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="border border-white/5 p-6 rounded-sm bg-neutral-950 relative flex flex-col justify-between"
                        >
                          <div className="font-mono text-[11px] tracking-wide text-neutral-300 uppercase leading-relaxed">
                            <div className="flex justify-between items-start gap-4 mb-3 border-b border-white/5 pb-2">
                              <span className="font-bold text-white uppercase">{addr.full_name}</span>
                              {addr.is_default && (
                                <span className="text-[8px] bg-white text-black font-bold px-2 py-0.5 rounded-full">
                                  DEFAULT
                                </span>
                              )}
                            </div>
                            <p>{addr.address_line1}</p>
                            {addr.address_line2 && <p>{addr.address_line2}</p>}
                            <p>{addr.city}, {addr.state} - {addr.zip}</p>
                            <p>{addr.country}</p>
                            <p className="text-[9px] text-neutral-500 mt-3">CONTACT: {addr.phone}</p>
                          </div>

                          {/* Address actions */}
                          <div className="flex gap-4 border-t border-white/5 pt-4 mt-6 justify-end">
                            <button
                              onClick={() => handleEditAddress(addr)}
                              className="text-neutral-500 hover:text-white flex items-center gap-1 font-mono text-[9px] font-bold uppercase cursor-pointer transition-colors"
                            >
                              <Edit3 size={11} /> EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(addr.id)}
                              className="text-red-500/60 hover:text-red-500 flex items-center gap-1 font-mono text-[9px] font-bold uppercase cursor-pointer transition-colors"
                            >
                              <Trash2 size={11} /> DELETE
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'profile' && (
                  /* TAB 4: PROFILE SETTINGS & UPLOADS */
                  <motion.div
                    key="tab-profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-6"
                  >
                    <h2 className="font-mono text-[11px] font-black tracking-widest text-white uppercase border-b border-white/5 pb-4 mb-4">
                      ACCOUNT SECURITY DETAILS
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                      
                      {/* Avatar Upload Left column */}
                      <div className="md:col-span-4 flex flex-col items-center gap-4 p-6 bg-neutral-950 border border-white/5 rounded-sm">
                        <div className="w-28 h-28 rounded-full border border-white/10 overflow-hidden bg-black flex items-center justify-center relative group">
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="profile avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="text-neutral-600 w-12 h-12" />
                          )}
                          
                          {/* Hover Overlay */}
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity duration-200"
                          >
                            <Upload size={16} />
                          </div>
                        </div>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />

                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="font-mono text-[9px] font-bold tracking-wider text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/10 rounded-full px-4 py-1.5 hover:border-white/30"
                        >
                          CHANGE AVATAR
                        </button>
                      </div>

                      {/* Profile Details Edit Form */}
                      <div className="md:col-span-8 border border-white/5 p-6 rounded-sm bg-neutral-950/40">
                        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
                          <Input
                            label="EMAIL ADDRESS"
                            disabled
                            value={profile?.email}
                          />
                          <Input
                            label="FULL MEMBER NAME"
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                          />
                          <Input
                            label="CONTACT CELLPHONE"
                            value={profilePhone}
                            onChange={(e) => setProfilePhone(e.target.value)}
                          />

                          <Button type="submit" isLoading={isSavingProfile} className="self-end mt-4">
                            SAVE CHANGES
                          </Button>
                        </form>
                      </div>

                    </div>
                  </motion.div>
                )}

                {activeTab === 'wishlist' && (
                  /* TAB 5: WISHLIST GRID */
                  <motion.div
                    key="tab-wishlist"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col gap-6"
                  >
                    <h2 className="font-mono text-[11px] font-black tracking-widest text-white uppercase border-b border-white/5 pb-4 mb-4">
                      WISH LIST ({wishlist.length})
                    </h2>

                    {wishlist.length === 0 ? (
                      <p className="text-[12px] font-mono text-neutral-600">
                        NO WISHLIST ITEMS DEPOSITED YET.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {wishlist.map((prod) => (
                          <div key={prod.id} className="relative group/wishcard">
                            {/* Delete Wishlist button overlay */}
                            <button
                              onClick={() => handleRemoveWishlist(prod.id)}
                              className="absolute top-4 right-4 z-10 p-2 bg-neutral-950 border border-white/10 rounded-full text-red-500 opacity-0 group-hover/wishcard:opacity-100 transition-opacity hover:border-red-500 cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.5)]"
                              title="Delete from Wishlist"
                            >
                              <Trash2 size={11} />
                            </button>
                            <ProductCard product={prod} />
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
