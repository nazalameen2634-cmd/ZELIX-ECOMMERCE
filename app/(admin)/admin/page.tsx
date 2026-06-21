'use client';

import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  DollarSign, ShoppingCart, Users, AlertTriangle,
  ChevronRight, TrendingUp, TrendingDown, Package, ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';
import { Order, Product } from '@/types';

// ─── Mock data ─────────────────────────────────────────────
const MOCK_REVENUE_DATA = [
  { date: '12 Jun', revenue: 42000 },
  { date: '13 Jun', revenue: 38000 },
  { date: '14 Jun', revenue: 56000 },
  { date: '15 Jun', revenue: 72000 },
  { date: '16 Jun', revenue: 64000 },
  { date: '17 Jun', revenue: 85000 },
  { date: '18 Jun', revenue: 95000 },
];

const MOCK_TOP_PRODUCTS = [
  { name: 'MATRIX PARKA',   sales: 48 },
  { name: 'SILENT RUNNER',  sales: 32 },
  { name: 'ECLIPSE HOODIE', sales: 65 },
  { name: 'KINETIC TROUSER', sales: 40 },
  { name: 'SOLSTICE GLASS', sales: 25 },
];

// ─── Stat Card ─────────────────────────────────────────────
function StatCard({
  label, value, suffix = '', trend, trendUp, icon: Icon, glowColor,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  trend: string;
  trendUp: boolean;
  icon: React.ElementType;
  glowColor: string;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-[4px] p-7 flex flex-col justify-between transition-all duration-500 group"
      style={{
        background: 'linear-gradient(135deg, #121212 0%, #0F0F0F 100%)',
        border: '1px solid rgba(245,240,235,0.06)',
        minHeight: '140px',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = `${glowColor}20`;
        (e.currentTarget as HTMLElement).style.boxShadow = `0 0 40px ${glowColor}10, 0 16px 48px rgba(0,0,0,0.4)`;
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,240,235,0.06)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
      }}
    >
      {/* Top line glow */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${glowColor}, transparent)` }}
      />

      {/* Icon glow orb */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
        style={{ background: glowColor, filter: 'blur(24px)' }}
      />

      <div className="flex items-center justify-between relative z-10">
        <span className="font-mono text-[8px] font-bold tracking-[0.22em]" style={{ color: '#4A4642' }}>
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-[3px] flex items-center justify-center"
          style={{ background: `${glowColor}12`, color: glowColor }}
        >
          <Icon size={14} />
        </div>
      </div>

      <div className="flex items-end gap-3 mt-4 relative z-10">
        <span className="font-mono font-bold leading-none" style={{ fontSize: '28px', color: '#F5F0EB' }}>
          {value}
        </span>
        {suffix && <span className="font-mono text-[11px] pb-0.5" style={{ color: '#6B6560' }}>{suffix}</span>}
        <div className={`flex items-center gap-1 font-mono text-[9px] font-bold pb-0.5`} style={{ color: trendUp ? '#3ECF8E' : '#F97066' }}>
          {trendUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trend}
        </div>
      </div>
    </div>
  );
}

// ─── Custom Tooltip ────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[3px] px-4 py-3 shadow-2xl"
      style={{ background: '#161616', border: '1px solid rgba(245,240,235,0.08)', fontFamily: 'Geist Mono, monospace' }}
    >
      <div className="text-[8px] tracking-widest mb-1.5" style={{ color: '#4A4642' }}>{label}</div>
      <div className="text-[13px] font-bold" style={{ color: '#C9A96E' }}>
        {formatCurrency(payload[0].value)}
      </div>
    </div>
  );
}

function BarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[3px] px-4 py-3 shadow-2xl"
      style={{ background: '#161616', border: '1px solid rgba(245,240,235,0.08)', fontFamily: 'Geist Mono, monospace' }}
    >
      <div className="text-[8px] tracking-widest mb-1.5" style={{ color: '#4A4642' }}>{label}</div>
      <div className="text-[13px] font-bold" style={{ color: '#4F8EF7' }}>
        {payload[0].value} units
      </div>
    </div>
  );
}

// ─── Status badge ──────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    paid:     { color: '#3ECF8E', bg: 'rgba(62,207,142,0.08)',  border: 'rgba(62,207,142,0.2)'  },
    pending:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
    failed:   { color: '#F97066', bg: 'rgba(249,112,102,0.08)', border: 'rgba(249,112,102,0.2)' },
    refunded: { color: '#9A9490', bg: 'rgba(154,148,144,0.08)', border: 'rgba(154,148,144,0.2)' },
  };
  const s = map[status] || map.pending;
  return (
    <span
      className="font-mono text-[8px] font-bold tracking-[0.14em] px-2.5 py-1 rounded-[2px] uppercase"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}
    >
      {status}
    </span>
  );
}

// ─── Main Dashboard ────────────────────────────────────────
export default function AdminDashboard() {
  const [mounted, setMounted]             = useState(false);
  const [revenueData, setRevenueData]     = useState(MOCK_REVENUE_DATA);
  const [topProducts, setTopProducts]     = useState(MOCK_TOP_PRODUCTS);
  const [recentOrders, setRecentOrders]   = useState<Order[]>([]);
  const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
  const [stats, setStats] = useState({ revenue: 384000, orders: 86, customers: 42, avgValue: 4465 });

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: ordersData } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false });

        const orders = (ordersData as Order[]) || [];
        setRecentOrders(orders.slice(0, 8));

        const { count: custCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        const { data: stockData } = await supabase
          .from('products')
          .select('*')
          .lt('stock_quantity', 10)
          .eq('status', 'active');
        if (stockData) setLowStockItems(stockData as Product[]);

        const totalRevenue    = orders.reduce((s, o) => s + (o.payment_status === 'paid' ? o.total : 0), 0);
        const avgOrderValue   = orders.length > 0 ? totalRevenue / orders.length : 0;

        setStats({
          revenue:    totalRevenue   || 384000,
          orders:     orders.length  || 86,
          customers:  custCount      || 42,
          avgValue:   avgOrderValue  || 4465,
        });

        if (orders.length > 0) {
          const map: Record<string, number> = {};
          orders.slice(0, 30).forEach((o) => {
            const d = new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
            map[d]  = (map[d] || 0) + (o.payment_status === 'paid' ? o.total : 0);
          });
          const formatted = Object.entries(map).map(([date, revenue]) => ({ date, revenue })).reverse();
          if (formatted.length) setRevenueData(formatted);
        }
      } catch {
        console.warn('Admin Dashboard: Supabase offline. Preview data active.');
      }
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col gap-10 w-full">

      {/* ─── Page header ─── */}
      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono text-[9px] font-bold tracking-[0.25em] mb-3" style={{ color: '#4A4642' }}>
            ZELIX CONSOLE // DASHBOARD
          </div>
          <h1
            className="font-sans font-extrabold uppercase text-[#F5F0EB] text-[32px] leading-none tracking-tight"
          >
            Overview
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-2 font-mono text-[8px] tracking-[0.18em]" style={{ color: '#4A4642' }}>
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3ECF8E' }} />
          LIVE DATA
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="TOTAL REVENUE"    value={formatCurrency(stats.revenue)}  trend="+12.4%"  trendUp icon={DollarSign}   glowColor="#C9A96E" />
        <StatCard label="TOTAL ORDERS"     value={stats.orders}                   trend="+8.2%"   trendUp icon={ShoppingCart} glowColor="#4F8EF7" />
        <StatCard label="REGISTERED USERS" value={stats.customers}                trend="+15.5%"  trendUp icon={Users}        glowColor="#3ECF8E" />
        <StatCard label="AVG ORDER VALUE"  value={formatCurrency(stats.avgValue)} trend="-2.1%"  trendUp={false} icon={TrendingUp} glowColor="#F97066" />
      </div>

      {/* ─── Charts ─── */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* Area chart */}
          <div
            className="lg:col-span-8 rounded-[4px] p-7 flex flex-col"
            style={{ background: '#0F0F0F', border: '1px solid rgba(245,240,235,0.06)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="font-mono text-[8px] font-bold tracking-[0.22em] mb-1" style={{ color: '#4A4642' }}>
                  REVENUE TIMELINE
                </div>
                <div className="font-mono text-[20px] font-bold" style={{ color: '#F5F0EB' }}>
                  {formatCurrency(stats.revenue)}
                </div>
              </div>
              <span className="font-mono text-[8px] tracking-widest px-3 py-1.5 rounded-[2px]" style={{ color: '#3ECF8E', background: 'rgba(62,207,142,0.08)', border: '1px solid rgba(62,207,142,0.15)' }}>
                LAST 7 DAYS
              </span>
            </div>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#C9A96E" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#C9A96E" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(245,240,235,0.04)" />
                  <XAxis dataKey="date" stroke="#282420" fontSize={8} tickLine={false} tick={{ fontFamily: 'Geist Mono', fill: '#4A4642', fontSize: 8 }} />
                  <YAxis stroke="transparent" fontSize={8} tickLine={false} axisLine={false} tick={{ fontFamily: 'Geist Mono', fill: '#4A4642', fontSize: 8 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(201,169,110,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={1.5} fill="url(#goldGrad)" dot={false} activeDot={{ r: 4, fill: '#C9A96E', stroke: '#080808', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar chart */}
          <div
            className="lg:col-span-4 rounded-[4px] p-7 flex flex-col"
            style={{ background: '#0F0F0F', border: '1px solid rgba(245,240,235,0.06)' }}
          >
            <div className="font-mono text-[8px] font-bold tracking-[0.22em] mb-2" style={{ color: '#4A4642' }}>
              TOP PERFORMING
            </div>
            <div className="font-mono text-[11px] mb-8" style={{ color: '#9A9490' }}>
              Units sold
            </div>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} margin={{ top: 5, right: 0, left: -28, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(245,240,235,0.04)" />
                  <XAxis dataKey="name" stroke="transparent" fontSize={7} tickLine={false} tick={{ fontFamily: 'Geist Mono', fill: '#4A4642', fontSize: 7 }} />
                  <YAxis stroke="transparent" fontSize={8} tickLine={false} axisLine={false} tick={{ fontFamily: 'Geist Mono', fill: '#4A4642', fontSize: 8 }} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(245,240,235,0.02)' }} />
                  <Bar dataKey="sales" fill="#4F8EF7" radius={[2, 2, 0, 0]} barSize={16} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ─── Orders + Low Stock ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Recent Orders Table */}
        <div
          className="lg:col-span-8 rounded-[4px] overflow-hidden"
          style={{ background: '#0F0F0F', border: '1px solid rgba(245,240,235,0.06)' }}
        >
          <div className="flex items-center justify-between px-7 py-5 border-b" style={{ borderColor: 'rgba(245,240,235,0.05)' }}>
            <div className="font-mono text-[9px] font-bold tracking-[0.2em]" style={{ color: '#9A9490' }}>
              RECENT ORDERS
            </div>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 font-mono text-[8px] font-bold tracking-[0.16em] transition-colors duration-200"
              style={{ color: '#4A4642' }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = '#C9A96E')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = '#4A4642')}
            >
              MANAGE <ChevronRight size={11} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(245,240,235,0.04)' }}>
                  {['ORDER', 'EMAIL', 'PAYMENT', 'FULFILLMENT', 'TOTAL'].map((h, i) => (
                    <th
                      key={h}
                      className="px-7 py-3 font-mono text-[8px] font-bold tracking-[0.18em]"
                      style={{ color: '#4A4642', textAlign: i === 4 ? 'right' : 'left' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-7 py-10 text-center font-mono text-[10px] tracking-widest" style={{ color: '#4A4642' }}>
                      NO ORDERS FILED YET
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="transition-colors duration-150"
                      style={{ borderBottom: '1px solid rgba(245,240,235,0.03)' }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(245,240,235,0.015)')}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                    >
                      <td className="px-7 py-4 font-mono text-[10px] font-bold" style={{ color: '#C9A96E' }}>
                        #{order.order_number}
                      </td>
                      <td className="px-7 py-4 font-mono text-[10px]" style={{ color: '#9A9490' }}>
                        {order.email}
                      </td>
                      <td className="px-7 py-4">
                        <StatusBadge status={order.payment_status} />
                      </td>
                      <td className="px-7 py-4 font-mono text-[9px] capitalize" style={{ color: '#6B6560' }}>
                        {order.fulfillment_status}
                      </td>
                      <td className="px-7 py-4 font-mono text-[11px] font-bold text-right" style={{ color: '#F5F0EB' }}>
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock */}
        <div
          className="lg:col-span-4 rounded-[4px]"
          style={{ background: '#0F0F0F', border: '1px solid rgba(245,240,235,0.06)' }}
        >
          <div className="flex items-center gap-2.5 px-7 py-5 border-b" style={{ borderColor: 'rgba(245,240,235,0.05)' }}>
            <AlertTriangle size={12} style={{ color: '#F59E0B' }} />
            <span className="font-mono text-[9px] font-bold tracking-[0.2em]" style={{ color: '#9A9490' }}>
              LOW STOCK ALERTS
            </span>
          </div>

          <div className="flex flex-col divide-y p-4 gap-0" style={{ borderColor: 'rgba(245,240,235,0.03)' }}>
            {lowStockItems.length === 0 ? (
              <div className="py-10 text-center">
                <Package size={20} className="mx-auto mb-3" style={{ color: '#282420' }} />
                <p className="font-mono text-[9px] tracking-widest" style={{ color: '#4A4642' }}>
                  ALL STOCK LEVELS OPTIMAL
                </p>
              </div>
            ) : (
              lowStockItems.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between py-4 px-3 rounded-[3px] transition-colors"
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'rgba(245,240,235,0.02)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  <div>
                    <div className="font-mono text-[9px] font-bold tracking-wider mb-0.5" style={{ color: '#D4CBBF' }}>
                      {p.title}
                    </div>
                    <div className="font-mono text-[7px] tracking-widest" style={{ color: '#4A4642' }}>
                      {p.sku}
                    </div>
                  </div>
                  <span
                    className="font-mono text-[9px] font-bold px-2.5 py-1 rounded-[2px]"
                    style={{ color: '#F97066', background: 'rgba(249,112,102,0.08)', border: '1px solid rgba(249,112,102,0.2)' }}
                  >
                    {p.stock_quantity}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
