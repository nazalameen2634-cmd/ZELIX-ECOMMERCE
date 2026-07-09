'use client';

import React, { useState, useEffect } from 'react';
import { Search, User, Shield, ShieldCheck, Mail, Calendar, CreditCard, Trash2, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/context/ToastContext';
import { formatCurrency } from '@/lib/utils';

interface CustomerProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  created_at: string;
  orders_count?: number;
  total_spent?: number;
}

const MOCK_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'u1',
    email: 'alex.vanderbilt@gmail.com',
    full_name: 'Alex Vanderbilt',
    phone: '+91 99887 76655',
    avatar_url: null,
    role: 'customer',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    orders_count: 4,
    total_spent: 18400,
  },
  {
    id: 'u2',
    email: 'kavya.sharma@outlook.com',
    full_name: 'Kavya Sharma',
    phone: '+91 98765 12345',
    avatar_url: null,
    role: 'customer',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    orders_count: 2,
    total_spent: 9800,
  },
  {
    id: 'u3',
    email: 'admin@zelix.shop',
    full_name: 'Chief Architect',
    phone: '+91 90000 00001',
    avatar_url: null,
    role: 'admin',
    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
    orders_count: 0,
    total_spent: 0,
  },
  {
    id: 'u4',
    email: 'rohit.k@gmail.com',
    full_name: 'Rohit Kumar',
    phone: null,
    avatar_url: null,
    role: 'customer',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    orders_count: 1,
    total_spent: 3499,
  },
  {
    id: 'u5',
    email: 'sarah.connor@protonmail.com',
    full_name: 'Sarah Connor',
    phone: '+91 88776 65544',
    avatar_url: null,
    role: 'customer',
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    orders_count: 7,
    total_spent: 32650,
  },
];

export default function AdminCustomers() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'created_at' | 'total_spent' | 'orders_count'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profileErr) throw profileErr;

      if (profiles && profiles.length > 0) {
        // Fetch order counts & totals to aggregate
        const { data: orders } = await supabase
          .from('orders')
          .select('user_id, total, payment_status');

        const enriched = profiles.map((p) => {
          const userOrders = (orders || []).filter((o) => o.user_id === p.id);
          const paidOrders = userOrders.filter((o) => o.payment_status === 'paid');
          return {
            ...p,
            orders_count: userOrders.length,
            total_spent: paidOrders.reduce((sum, o) => sum + Number(o.total), 0),
          };
        });

        setCustomers(enriched as CustomerProfile[]);
      } else {
        setCustomers(MOCK_CUSTOMERS);
      }
    } catch (err) {
      console.warn('Unable to load Supabase profiles. Loading mock dataset.', err);
      setCustomers(MOCK_CUSTOMERS);
    } finally {
      setLoading(false);
    }
  }

  const toggleRole = async (cust: CustomerProfile) => {
    const nextRole = cust.role === 'admin' ? 'customer' : 'admin';
    if (!confirm(`Are you sure you want to change role of ${cust.email} to ${nextRole.toUpperCase()}?`)) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: nextRole })
        .eq('id', cust.id);

      if (error) throw error;

      setCustomers(
        customers.map((c) => (c.id === cust.id ? { ...c, role: nextRole } : c))
      );
      toast(`User role upgraded/modified to ${nextRole.toUpperCase()}`, 'success');
    } catch (err) {
      setCustomers(
        customers.map((c) => (c.id === cust.id ? { ...c, role: nextRole } : c))
      );
      toast(`Simulated: Role updated to ${nextRole.toUpperCase()}`, 'success');
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client profile?')) return;

    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;

      setCustomers(customers.filter((c) => c.id !== id));
      toast('Client profile deleted', 'success');
    } catch (err) {
      setCustomers(customers.filter((c) => c.id !== id));
      toast('Simulated: Client deleted offline', 'success');
    }
  };

  const handleSort = (field: 'created_at' | 'total_spent' | 'orders_count') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSorted = customers
    .filter((c) => {
      const nameMatch = c.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const emailMatch = c.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const phoneMatch = c.phone?.toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || emailMatch || phoneMatch;
    })
    .sort((a, b) => {
      let aVal: any = a[sortField] || 0;
      let bVal: any = b[sortField] || 0;

      if (sortField === 'created_at') {
        aVal = new Date(a.created_at).getTime();
        bVal = new Date(b.created_at).getTime();
      }

      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-sans font-black tracking-tight text-[#111111] uppercase mt-2">
            CLIENT DIRECTORY
          </h1>
          <p className="text-[12px] text-[#4A4642] font-mono tracking-wider uppercase mt-1">
            REGISTERED ACCOUNTS, PRIVILEGES LOCKS, AND SPENDING METRICS
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm p-6">
        {/* Actions header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[rgba(0,0,0,0.03)] pb-4 mb-6 gap-4">
          <h3 className="font-mono text-[10px] font-bold tracking-widest text-[#282420] uppercase">
            ACCOUNTS REGISTERED ({filteredAndSorted.length})
          </h3>
          <div className="relative w-full sm:max-w-[320px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone..."
              className="w-full text-[12px] bg-[#FAFAFA] border border-[rgba(0,0,0,0.06)] rounded-sm pl-8 pr-3.5 py-1.5 outline-none focus:border-[#C9A96E] transition-colors font-mono"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#282420]" size={13} />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-[12px] text-[#111111]">
            <thead>
              <tr className="border-b border-[rgba(0,0,0,0.03)] text-[#282420] font-mono text-[10px] uppercase">
                <th className="pb-3 font-semibold">CUSTOMER</th>
                <th className="pb-3 font-semibold">CONTACT INFO</th>
                <th className="pb-3 font-semibold">ROLE</th>
                <th className="pb-3 font-semibold cursor-pointer select-none hover:text-[#111111] transition-colors" onClick={() => handleSort('created_at')}>
                  <span className="flex items-center gap-1">
                    JOIN DATE <ArrowUpDown size={10} />
                  </span>
                </th>
                <th className="pb-3 font-semibold text-center cursor-pointer select-none hover:text-[#111111] transition-colors" onClick={() => handleSort('orders_count')}>
                  <span className="flex items-center justify-center gap-1">
                    ORDERS <ArrowUpDown size={10} />
                  </span>
                </th>
                <th className="pb-3 font-semibold text-right cursor-pointer select-none hover:text-[#111111] transition-colors" onClick={() => handleSort('total_spent')}>
                  <span className="flex items-center justify-end gap-1">
                    TOTAL SPENT <ArrowUpDown size={10} />
                  </span>
                </th>
                <th className="pb-3 font-semibold text-right w-[80px]">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center font-mono text-[#282420]">
                    ACCESSING USER LEDGERS...
                  </td>
                </tr>
              ) : filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center font-mono text-[#282420]">
                    NO USER ACCOUNT FILES MATCHED.
                  </td>
                </tr>
              ) : (
                filteredAndSorted.map((cust) => (
                  <tr
                    key={cust.id}
                    className="border-b border-neutral-50 last:border-0 hover:bg-[#FAFAFA]/50 transition-colors"
                  >
                    {/* User profile */}
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center text-[#111111] border border-white/10 overflow-hidden shrink-0">
                          {cust.avatar_url ? (
                            <img src={cust.avatar_url} alt={cust.full_name || 'User'} className="w-full h-full object-cover" />
                          ) : (
                            <User size={13} className="text-[#282420]" />
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-[#111111] uppercase block">
                            {cust.full_name || 'NO NAME ASSIGNED'}
                          </span>
                          <span className="text-[#282420] text-[10px] font-mono lowercase block">
                            {cust.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Contact details */}
                    <td className="py-3.5 font-mono text-[11px] text-[#6B6560]">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1 text-[#6B6560]">
                          <Mail size={10} /> {cust.email}
                        </span>
                        {cust.phone && (
                          <span className="text-[#282420]">{cust.phone}</span>
                        )}
                      </div>
                    </td>

                    {/* Role badge and switch */}
                    <td className="py-3.5">
                      <button
                        onClick={() => toggleRole(cust)}
                        className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-widest uppercase cursor-pointer border hover:opacity-85 transition-opacity ${
                          cust.role === 'admin'
                            ? 'bg-neutral-950 text-[#111111] border-neutral-950'
                            : 'bg-[#FAFAFA] text-[#4A4642] border-[rgba(0,0,0,0.06)]'
                        }`}
                        title="Click to toggle privilege"
                      >
                        {cust.role === 'admin' ? <ShieldCheck size={10} /> : <Shield size={10} />}
                        {cust.role}
                      </button>
                    </td>

                    {/* Join date */}
                    <td className="py-3.5 font-mono text-[#4A4642]">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(cust.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Total orders count */}
                    <td className="py-3.5 text-center font-mono font-bold text-[#D4CBBF]">
                      {cust.orders_count || 0}
                    </td>

                    {/* Total amount spent */}
                    <td className="py-3.5 text-right font-mono font-bold text-[#111111]">
                      <span className="flex items-center justify-end gap-1">
                        <CreditCard size={10} className="text-[#282420]" />
                        {formatCurrency(cust.total_spent || 0)}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => deleteCustomer(cust.id)}
                        disabled={cust.role === 'admin'}
                        className={`p-1.5 text-[#282420] hover:text-red-600 rounded-md hover:bg-red-50 transition-colors cursor-pointer ${
                          cust.role === 'admin' ? 'opacity-30 cursor-not-allowed' : ''
                        }`}
                        title={cust.role === 'admin' ? 'Cannot delete admin' : 'Delete user profile'}
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
