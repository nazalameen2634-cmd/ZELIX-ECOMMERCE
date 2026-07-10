'use client';

import React, { useState, useEffect } from 'react';
import { Tag, Plus, Search, Trash2, Edit2, CheckCircle2, XCircle, Save, X, Calendar, Percent, Landmark } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount: number;
  usage_limit: number | null;
  per_customer_limit: number;
  times_used: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  created_at: string;
}

const MOCK_COUPONS: Coupon[] = [
  {
    id: 'c1',
    code: 'ZELIX10',
    type: 'percentage',
    value: 10,
    min_order_amount: 2000,
    usage_limit: 500,
    per_customer_limit: 1,
    times_used: 142,
    valid_from: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c2',
    code: 'TACTICAL500',
    type: 'fixed',
    value: 500,
    min_order_amount: 5000,
    usage_limit: 100,
    per_customer_limit: 1,
    times_used: 48,
    valid_from: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    valid_to: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c3',
    code: 'WELCOME15',
    type: 'percentage',
    value: 15,
    min_order_amount: 0,
    usage_limit: null,
    per_customer_limit: 1,
    times_used: 289,
    valid_from: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'c4',
    code: 'EXPIRINGSOON',
    type: 'percentage',
    value: 20,
    min_order_amount: 3000,
    usage_limit: 50,
    per_customer_limit: 1,
    times_used: 50,
    valid_from: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    valid_to: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    is_active: false,
    created_at: new Date().toISOString(),
  },
];

export default function AdminCoupons() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [usageLimit, setUsageLimit] = useState('');
  const [perCustomerLimit, setPerCustomerLimit] = useState('1');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setCoupons(data as Coupon[]);
      } else {
        setCoupons(MOCK_COUPONS);
      }
    } catch (err) {
      console.warn('Unable to query Supabase coupons. Seeding mock coupons.', err);
      setCoupons(MOCK_COUPONS);
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = (coupon: Coupon) => {
    setIsEditing(true);
    setEditId(coupon.id);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value.toString());
    setMinOrderAmount(coupon.min_order_amount.toString());
    setUsageLimit(coupon.usage_limit ? coupon.usage_limit.toString() : '');
    setPerCustomerLimit(coupon.per_customer_limit.toString());
    
    // Format timestamp for datetime-local input (YYYY-MM-DDTHH:MM)
    const fromDateStr = new Date(coupon.valid_from).toISOString().slice(0, 16);
    const toDateStr = new Date(coupon.valid_to).toISOString().slice(0, 16);
    setValidFrom(fromDateStr);
    setValidTo(toDateStr);
    setIsActive(coupon.is_active);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditId(null);
    setCode('');
    setType('percentage');
    setValue('');
    setMinOrderAmount('0');
    setUsageLimit('');
    setPerCustomerLimit('1');
    setValidFrom('');
    setValidTo('');
    setIsActive(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !value.trim() || !validFrom || !validTo) {
      toast('Please complete all required fields', 'error');
      return;
    }

    const payload = {
      code: code.trim().toUpperCase(),
      type,
      value: parseFloat(value),
      min_order_amount: parseFloat(minOrderAmount) || 0,
      usage_limit: usageLimit ? parseInt(usageLimit) : null,
      per_customer_limit: parseInt(perCustomerLimit) || 1,
      valid_from: new Date(validFrom).toISOString(),
      valid_to: new Date(validTo).toISOString(),
      is_active: isActive,
    };

    try {
      if (editId) {
        // Edit update via API
        const response = await fetch('/api/admin/coupons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editId }),
        });

        if (!response.ok) {
          const errRes = await response.json().catch(() => ({}));
          throw new Error(errRes.message || 'API update failed');
        }
        const resData = await response.json();

        setCoupons(
          coupons.map((c) => (c.id === editId ? { ...c, ...resData.data } : c))
        );
        toast('Coupon updated successfully', 'success');
      } else {
        // Create insert via API
        const response = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errRes = await response.json().catch(() => ({}));
          throw new Error(errRes.message || 'API creation failed');
        }
        const resData = await response.json();

        setCoupons([resData.data as Coupon, ...coupons]);
        toast('Coupon created successfully', 'success');
      }
      handleCancel();
    } catch (err: any) {
      console.error('Coupon save error:', err);
      toast(`Failed to save coupon: ${err.message || 'Unknown error'}`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errRes = await response.json().catch(() => ({}));
        throw new Error(errRes.message || 'API deletion failed');
      }

      setCoupons(coupons.filter((c) => c.id !== id));
      toast('Coupon removed successfully', 'success');
    } catch (err) {
      setCoupons(coupons.filter((c) => c.id !== id));
      toast('Simulated: Coupon removed offline', 'success');
    }
  };

  const toggleStatus = async (coupon: Coupon) => {
    const nextStatus = !coupon.is_active;
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: coupon.id, is_active: nextStatus }),
      });

      if (!response.ok) throw new Error('API update failed');
      const resData = await response.json();

      setCoupons(
        coupons.map((c) => (c.id === coupon.id ? { ...c, ...resData.data } : c))
      );
      toast(`Coupon status set to ${nextStatus ? 'ACTIVE' : 'INACTIVE'}`, 'success');
    } catch (err) {
      setCoupons(
        coupons.map((c) => (c.id === coupon.id ? { ...c, is_active: nextStatus } : c))
      );
      toast(`Simulated: Coupon set to ${nextStatus ? 'ACTIVE' : 'INACTIVE'}`, 'success');
    }
  };

  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-sans font-black tracking-tight text-[#111111] uppercase mt-2">
            COUPON MANAGEMENT
          </h1>
          <p className="text-[12px] text-[#4A4642] font-mono tracking-wider uppercase mt-1">
            GENERATE CAMPAIGNS, VALIDITY CAPS, AND PROMOTIONAL DISCOUNTS
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Create / Edit Coupon */}
        <div className="lg:col-span-4 bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm p-6">
          <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-3 mb-6 uppercase flex items-center gap-2">
            <Tag size={12} /> {isEditing ? 'EDIT DISCOUNT CAMPAIGN' : 'ADD NEW DISCOUNT CAMPAIGN'}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                COUPON CODE *
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ZELIX25"
                className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono uppercase"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  TYPE *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
                  className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                >
                  <option value="percentage">PERCENTAGE</option>
                  <option value="fixed">FIXED VALUE</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  DISCOUNT VALUE *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === 'percentage' ? '15' : '500'}
                    min="1"
                    className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm pl-3 pr-8 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#282420] font-mono text-[11px]">
                    {type === 'percentage' ? <Percent size={12} /> : <Landmark size={12} />}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  MIN ORDER VAL
                </label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                  USAGE LIMIT
                </label>
                <input
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="Unlimited"
                  min="1"
                  className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                VALID FROM *
              </label>
              <input
                type="datetime-local"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono font-bold tracking-widest text-[#282420] uppercase mb-1.5">
                VALID UNTIL *
              </label>
              <input
                type="datetime-local"
                value={validTo}
                onChange={(e) => setValidTo(e.target.value)}
                className="w-full text-[13px] bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm px-3.5 py-2.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
                required
              />
            </div>

            <div className="flex items-center gap-2 border-t border-[rgba(0,0,0,0.03)] pt-4">
              <input
                type="checkbox"
                id="isActiveCheckbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-[rgba(245,240,235,0.1)] text-[#111111] focus:ring-black cursor-pointer"
              />
              <label htmlFor="isActiveCheckbox" className="text-[11px] font-mono font-bold tracking-widest text-[#6B6560] uppercase select-none cursor-pointer">
                CAMPAIGN IS ACTIVE
              </label>
            </div>

            <div className="flex gap-3 mt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 py-3 px-4 border border-[rgba(0,0,0,0.06)] hover:border-black transition-colors rounded-sm text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1 cursor-pointer"
                >
                  <X size={14} /> CANCEL
                </button>
              )}
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-black text-[#FFFFFF] hover:bg-neutral-900 transition-colors rounded-sm text-[11px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save size={14} /> {isEditing ? 'SAVE CHANGES' : 'CREATE COUPON'}
              </button>
            </div>
          </form>
        </div>

        {/* Right List: Coupons Table */}
        <div className="lg:col-span-8 bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm p-6">
          <div className="flex justify-between items-center border-b border-[rgba(0,0,0,0.03)] pb-4 mb-6 gap-4">
            <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] uppercase shrink-0">
              EXISTING CAMPAIGNS ({filteredCoupons.length})
            </h3>
            <div className="relative w-full max-w-[280px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code..."
                className="w-full text-[12px] bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] rounded-sm pl-8 pr-3.5 py-1.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#282420]" size={13} />
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-[12px] text-[#111111]">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.03)] text-[#282420] font-mono text-[10px] uppercase">
                  <th className="pb-3 font-semibold">CODE</th>
                  <th className="pb-3 font-semibold">REDUCTION VALUE</th>
                  <th className="pb-3 font-semibold">MIN ORDER</th>
                  <th className="pb-3 font-semibold">TIMES USED</th>
                  <th className="pb-3 font-semibold">STATUS</th>
                  <th className="pb-3 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center font-mono text-[#282420]">
                      SYNCING PROMO REGISTRY...
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center font-mono text-[#282420]">
                      NO CAMPAIGNS GENERATED YET.
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => {
                    const isExpired = new Date(coupon.valid_to).getTime() < Date.now();
                    const isFullyUsed = coupon.usage_limit ? coupon.times_used >= coupon.usage_limit : false;
                    const isInactive = !coupon.is_active || isExpired || isFullyUsed;
                    
                    return (
                      <tr
                        key={coupon.id}
                        className="border-b border-neutral-50 last:border-0 hover:bg-[#FAFAFA]/50 transition-colors"
                      >
                        <td className="py-3.5 font-bold font-mono text-[#111111] uppercase tracking-wider">{coupon.code}</td>
                        <td className="py-3.5 font-mono text-[#D4CBBF]">
                          {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `${formatCurrency(coupon.value)} OFF`}
                        </td>
                        <td className="py-3.5 font-mono text-[#4A4642]">
                          {coupon.min_order_amount > 0 ? formatCurrency(coupon.min_order_amount) : '-'}
                        </td>
                        <td className="py-3.5 font-mono text-[#6B6560]">
                          {coupon.times_used} / {coupon.usage_limit || '∞'}
                        </td>
                        <td className="py-3.5">
                          <button
                            onClick={() => toggleStatus(coupon)}
                            className="flex items-center gap-1 cursor-pointer"
                            title="Click to toggle active status"
                          >
                            {isInactive ? (
                              <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-red-50 text-red-600 uppercase flex items-center gap-1 border border-red-100">
                                <XCircle size={10} /> {isExpired ? 'EXPIRED' : isFullyUsed ? 'EXHAUSTED' : 'INACTIVE'}
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-green-50 text-green-700 uppercase flex items-center gap-1 border border-green-100">
                                <CheckCircle2 size={10} /> ACTIVE
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleEditClick(coupon)}
                              className="p-1.5 text-[#4A4642] hover:text-[#111111] transition-colors rounded-md hover:bg-[#121212] cursor-pointer"
                              title="Edit Coupon"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="p-1.5 text-[#4A4642] hover:text-red-600 transition-colors rounded-md hover:bg-red-50 cursor-pointer"
                              title="Delete Coupon"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
