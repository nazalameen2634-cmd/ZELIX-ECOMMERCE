'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Order {
  id: string;
  order_number: string;
  total: number;
  payment_status: string;
  fulfillment_status: string;
  created_at: string;
}

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const data = await res.json();
        
        if (res.ok) {
          setOrders(data.orders || []);
        } else {
          setError(data.error || 'Failed to load orders.');
        }
      } catch (err) {
        setError('An unexpected error occurred.');
      } finally {
        setFetching(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading || (fetching && user)) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-black px-4 pt-32 pb-16 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl mx-auto w-full"
      >
        <div className="mb-12 border-b border-gray-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold tracking-[0.1em] uppercase mb-2">My Orders</h1>
            <p className="text-gray-500 text-sm tracking-wide">View your past purchases</p>
          </div>
          <Link href="/products" className="text-xs tracking-widest uppercase font-semibold text-gray-500 hover:text-black transition-colors underline underline-offset-4">
            Continue Shopping
          </Link>
        </div>

        {error ? (
          <div className="text-red-500 bg-red-50 p-4 rounded-md border border-red-100">{error}</div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 text-center border border-gray-200 rounded-lg shadow-sm">
            <h2 className="text-lg font-serif font-semibold mb-2">No orders found</h2>
            <p className="text-gray-500 text-sm mb-6">You haven't placed any orders yet.</p>
            <Link href="/products" className="inline-block px-8 py-3 bg-black text-white text-xs tracking-widest uppercase font-semibold hover:bg-gray-800 transition-colors">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-gray-300 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="text-xs text-gray-500 tracking-widest uppercase font-semibold">
                    Order {order.order_number}
                  </div>
                  <div className="text-sm">
                    {new Date(order.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <div className="text-xs text-gray-500 tracking-widest uppercase font-semibold">Status</div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block w-2 h-2 rounded-full ${order.fulfillment_status === 'delivered' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-sm capitalize">{order.fulfillment_status}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1 md:text-right">
                  <div className="text-xs text-gray-500 tracking-widest uppercase font-semibold">Total</div>
                  <div className="text-lg font-semibold">₹{order.total}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
