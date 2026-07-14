'use client';

import React, { useState } from 'react';
import { ArrowRight, Search, Package, CheckCircle2, Clock } from 'lucide-react';

interface OrderItem {
  title: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: string;
  order_number: string;
  total: number;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
  order_items: OrderItem[];
}

export default function OrderTrackingSection() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/orders/track?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Failed to fetch orders');
      
      if (data.orders.length === 0) {
        setError('No orders found for this phone number.');
        setOrders(null);
      } else {
        setOrders(data.orders);
      }
    } catch (err: any) {
      setError(err.message);
      setOrders(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-500';
      case 'shipped': return 'text-[#C9A96E]';
      case 'processing': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <section className="py-24 border-b bg-background border-border">
      <div className="container-custom">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="section-label mb-5 mx-auto w-fit text-accent font-bold tracking-widest text-[10px] uppercase">ORDER TRACKING</div>
            <h2 className="text-[32px] md:text-[44px] font-sans font-extrabold uppercase tracking-tight leading-[0.9] text-foreground mb-4">
              Where is my gear?
            </h2>
            <p className="font-mono text-[10px] tracking-[0.15em] text-muted">
              ENTER THE PHONE NUMBER USED DURING CHECKOUT TO TRACK YOUR SHIPMENT.
            </p>
          </div>

          <form onSubmit={handleTrack} className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="flex-1 relative">
              <input
                type="tel"
                placeholder="PHONE NUMBER"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white border border-border py-4 px-5 outline-none font-mono text-[11px] tracking-widest text-foreground pl-12 focus:border-accent focus:ring-1 focus:ring-accent transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-8 py-4 font-mono text-[11px] font-bold tracking-[0.2em] uppercase transition-colors whitespace-nowrap bg-foreground text-background hover:bg-muted"
            >
              {loading ? 'TRACKING...' : 'TRACK ORDER'} <ArrowRight size={14} />
            </button>
          </form>

          {error && (
            <div className="text-error text-center font-mono text-[10px] tracking-widest mb-8">
              {error}
            </div>
          )}

          {orders && (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border p-6 bg-white border-border shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(0,0,0,0.05)] pb-4 mb-4">
                    <div>
                      <h4 className="font-sans font-bold text-lg text-foreground mb-1">{order.order_number}</h4>
                      <p className="font-mono text-[9px] tracking-widest text-muted">
                        {new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono text-[11px] font-bold tracking-[0.1em] uppercase flex items-center gap-2 justify-end ${getStatusColor(order.fulfillment_status)}`}>
                        {order.fulfillment_status === 'delivered' ? <CheckCircle2 size={14} /> : 
                         order.fulfillment_status === 'pending' ? <Clock size={14} /> : <Package size={14} />}
                        {order.fulfillment_status}
                      </div>
                      <p className="font-mono text-[10px] tracking-widest text-muted mt-1">₹{order.total}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {order.order_items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-[9px] text-muted">{item.quantity}x</span>
                          <span className="font-mono text-[10px] tracking-wider text-foreground font-medium uppercase">{item.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-muted">₹{item.unit_price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
