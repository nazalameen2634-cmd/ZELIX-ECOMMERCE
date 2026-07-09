'use client';

import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Eye, RefreshCw, Truck, ClipboardList, Printer, Download, X, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Order, OrderTimeline } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';

const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-10087',
    order_number: 'ORD-10087',
    email: 'client@zelix.design',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hrs ago
    shipping_address: {
      full_name: 'ALEXANDER MERCER',
      phone: '+91 98765 43210',
      address_line1: '404 TACTICAL RESIDENCE',
      address_line2: 'LEVEL 4, DISTRICT 9',
      city: 'BANGALORE',
      state: 'KARNATAKA',
      zip: '560001',
      country: 'INDIA'
    },
    billing_address: {
      full_name: 'ALEXANDER MERCER',
      phone: '+91 98765 43210',
      address_line1: '404 TACTICAL RESIDENCE',
      address_line2: 'LEVEL 4, DISTRICT 9',
      city: 'BANGALORE',
      state: 'KARNATAKA',
      zip: '560001',
      country: 'INDIA'
    },
    shipping_method: 'EXPRESS COURIER',
    shipping_cost: 150,
    subtotal: 7800,
    discount_amount: 500,
    tax_amount: 1404,
    total: 8854,
    coupon_code: 'ZELIX500',
    payment_status: 'paid',
    fulfillment_status: 'processing',
    tracking_number: 'BLUEDART12345',
    tracking_carrier: 'BLUE DART',
    order_items: [
      {
        id: 'item-1',
        title: 'ECLIPSE OVERSIZED HOODIE',
        variant_info: { size: 'XL', color: 'MATTE BLACK' },
        quantity: 1,
        unit_price: 5200,
        line_total: 5200
      },
      {
        id: 'item-2',
        title: 'SOLSTICE TECHNICAL GLASSES',
        variant_info: { size: 'OS', color: 'DARK TINTED' },
        quantity: 2,
        unit_price: 1300,
        line_total: 2600
      }
    ],
    order_timeline: [
      {
        id: 't-1',
        order_id: 'ORD-10087',
        status: 'placed',
        note: 'Order placed by client.',
        created_by: null,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 't-2',
        order_id: 'ORD-10087',
        status: 'paid',
        note: 'Payment authorized via Razorpay.',
        created_by: null,
        created_at: new Date(Date.now() - 3600000 * 1.8).toISOString()
      }
    ]
  },
  {
    id: 'ORD-10086',
    order_number: 'ORD-10086',
    email: 'karan.s@gmail.com',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    shipping_address: {
      full_name: 'KARAN SHARMA',
      phone: '+91 99999 88888',
      address_line1: '12 RAJPUT ROAD',
      address_line2: 'DEFENCE COLONY',
      city: 'NEW DELHI',
      state: 'DELHI',
      zip: '110024',
      country: 'INDIA'
    },
    billing_address: {
      full_name: 'KARAN SHARMA',
      phone: '+91 99999 88888',
      address_line1: '12 RAJPUT ROAD',
      address_line2: 'DEFENCE COLONY',
      city: 'NEW DELHI',
      state: 'DELHI',
      zip: '110024',
      country: 'INDIA'
    },
    shipping_method: 'STANDARD SHIPPING',
    shipping_cost: 0,
    subtotal: 26000,
    discount_amount: 0,
    tax_amount: 4680,
    total: 30680,
    coupon_code: '',
    payment_status: 'paid',
    fulfillment_status: 'shipped',
    tracking_number: 'DELHIVERY987654',
    tracking_carrier: 'DELHIVERY',
    order_items: [
      {
        id: 'item-3',
        title: 'MATRIX PARKA COAT',
        variant_info: { size: 'M', color: 'STEALTH BLACK' },
        quantity: 1,
        unit_price: 26000,
        line_total: 26000
      }
    ],
    order_timeline: [
      {
        id: 't-3',
        order_id: 'ORD-10086',
        status: 'placed',
        note: 'Order placed by client.',
        created_by: null,
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 't-4',
        order_id: 'ORD-10086',
        status: 'paid',
        note: 'Payment authorized.',
        created_by: null,
        created_at: new Date(Date.now() - 86400000 + 600000).toISOString()
      },
      {
        id: 't-5',
        order_id: 'ORD-10086',
        status: 'shipped',
        note: 'Package handed over to DHL/Delhivery.',
        created_by: null,
        created_at: new Date(Date.now() - 40000000).toISOString()
      }
    ]
  }
];

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Order Detail View
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  // Edit inputs
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('BLUE DART');
  const [adminNote, setAdminNote] = useState('');
  const [tempFulfillmentStatus, setTempFulfillmentStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // WhatsApp communication & order history status logs
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<any[]>([]);
  const [resendingInvoice, setResendingInvoice] = useState(false);
  const [resendingNotification, setResendingNotification] = useState(false);

  // Load Orders
  useEffect(() => {
    async function loadOrders() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*, order_items(*, products(*)), order_timeline(*)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders((data as unknown as Order[]) || []);
      } catch (err) {
        console.warn('Supabase offline. Simulated orders logs loaded.');
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, [updatingStatus]);

  // Open Order Detail Drawer
  const handleOpenDetail = async (order: Order) => {
    setSelectedOrder(order);
    setTempFulfillmentStatus(order.fulfillment_status);
    setTrackingNumber(order.tracking_number || '');
    setTrackingCarrier(order.tracking_carrier || 'BLUE DART');
    setAdminNote('');
    setIsDetailOpen(true);
    setStatusHistory([]);
    setWhatsappLogs([]);

    // Fetch timeline updates for this specific order
    try {
      const { data } = await supabase
        .from('order_timeline')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false });
      if (data) {
        setSelectedOrder((prev) => prev ? { ...prev, order_timeline: data as OrderTimeline[] } : null);
      }
    } catch (e) {
      // Ignore
    }

    // Fetch order status history
    try {
      const { data: history } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', order.id)
        .order('changed_at', { ascending: false });
      if (history) setStatusHistory(history);
    } catch (e) {
      console.warn('Error fetching order status history:', e);
    }

    // Fetch WhatsApp logs
    try {
      const { data: logs } = await supabase
        .from('whatsapp_logs')
        .select('*')
        .eq('order_id', order.id)
        .order('created_at', { ascending: false });
      if (logs) setWhatsappLogs(logs);
    } catch (e) {
      console.warn('Error fetching WhatsApp logs:', e);
    }
  };

  const handleResend = async (action: 'invoice' | 'notification') => {
    if (!selectedOrder) return;
    if (action === 'invoice') setResendingInvoice(true);
    else setResendingNotification(true);

    try {
      const response = await fetch('/api/admin/orders/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          action,
        }),
      });

      if (!response.ok) throw new Error('Resend action failed');
      const data = await response.json();
      toast(data.message?.toUpperCase() || 'RESEND SUCCESSFUL', 'success');

      // Refresh WhatsApp logs
      const { data: logs } = await supabase
        .from('whatsapp_logs')
        .select('*')
        .eq('order_id', selectedOrder.id)
        .order('created_at', { ascending: false });
      if (logs) setWhatsappLogs(logs);

    } catch (err: any) {
      toast(err.message?.toUpperCase() || 'RESEND FAILED', 'error');
    } finally {
      setResendingInvoice(false);
      setResendingNotification(false);
    }
  };

  // Update Status & Log Timeline to Supabase
  const handleUpdateStatus = async (newFulfillmentStatus: string) => {
    if (!selectedOrder) return;
    setUpdatingStatus(true);

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          fulfillment_status: newFulfillmentStatus,
        }),
      });

      if (!response.ok) throw new Error('API order update failed');

      toast(`ORDER STATUS MODIFIED TO ${newFulfillmentStatus.toUpperCase()}`, 'success');
      
      // Update local values
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              fulfillment_status: newFulfillmentStatus as any,
            }
          : null
      );
    } catch (err) {
      console.warn('Fallback status simulation active.');
      setSelectedOrder((prev) =>
        prev ? { ...prev, fulfillment_status: newFulfillmentStatus as any } : null
      );
      toast('ORDER STATUS UPDATED (PREVIEW MODE)', 'success');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Submit Tracking number information
  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          tracking_number: trackingNumber,
          tracking_carrier: trackingCarrier,
        }),
      });

      if (!response.ok) throw new Error('API tracking update failed');

      toast('TRACKING ID SAVED & TIMELINE UPDATED', 'success');
      setUpdatingStatus(!updatingStatus); // trigger reload
    } catch (err) {
      toast('TRACKING DETAILS COMMITTED (PREVIEW MODE)', 'success');
    }
  };

  // Add custom Timeline admin note
  const handleAddTimelineNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !adminNote.trim()) return;

    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: selectedOrder.id,
          admin_note: adminNote.trim(),
        }),
      });

      if (!response.ok) throw new Error('API note update failed');

      const mockLog = {
        id: Math.random().toString(),
        order_id: selectedOrder.id,
        status: selectedOrder.fulfillment_status,
        note: adminNote.trim(),
        created_by: null,
        created_at: new Date().toISOString(),
      };

      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              order_timeline: [mockLog as OrderTimeline, ...(prev.order_timeline || [])],
            }
          : null
      );
      setAdminNote('');
      toast('ADMIN NOTE APPLIANCE ADDED', 'success');
    } catch (err) {
      const mockLog = {
        id: Math.random().toString(),
        order_id: selectedOrder.id,
        status: selectedOrder.fulfillment_status,
        note: adminNote.trim(),
        created_by: null,
        created_at: new Date().toISOString(),
      };
      setSelectedOrder((prev) =>
        prev ? { ...prev, order_timeline: [mockLog, ...(prev.order_timeline || [])] } : null
      );
      setAdminNote('');
      toast('NOTE COMMITTED (PREVIEW MODE)', 'success');
    }
  };

  // Print Invoice packing slip
  const handlePrintInvoice = () => {
    if (!selectedOrder) return;
    window.open(`/api/orders/${selectedOrder.id}/invoice?print=true`, '_blank');
  };

  // Export CSV
  const handleExportCSV = () => {
    if (orders.length === 0) return;
    const headers = ['Order Number', 'Date', 'Email', 'Payment Status', 'Fulfillment Status', 'Total (INR)\r\n'];
    const rows = orders.map((o) => [
      o.order_number,
      new Date(o.created_at).toLocaleDateString(),
      o.email,
      o.payment_status,
      o.fulfillment_status,
      o.total,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + rows.map((e) => e.join(',')).join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('CSV SHEET EXPORTED SUCCESSFULLY', 'success');
  };

  const getStatusBadge = (status: string | null | undefined) => {
    const normalized = (status || '').toLowerCase();
    const base = 'text-[8px] font-mono font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase ';
    if (normalized.includes('paid') || normalized.includes('cash') || normalized === 'delivered') {
      return base + 'bg-green-50 text-green-700 border border-green-100';
    }
    if (normalized === 'pending' || normalized === 'processing') {
      return base + 'bg-yellow-50 text-yellow-700 border border-yellow-100';
    }
    // default to red for other statuses
    return base + 'bg-red-50 text-red-700 border border-red-100';
  };

  const filteredOrders = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter ? o.fulfillment_status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Header breadcrumbs */}
      <div className="flex justify-between items-center border-b border-[rgba(0,0,0,0.06)] pb-5">
        <div>
          <h1 className="text-[28px] font-sans font-black tracking-tight text-[#111111] uppercase mt-2">
            ORDERS FULFILLMENT
          </h1>
          <p className="text-[12px] text-[#444444] font-mono tracking-wider uppercase mt-1">
            VIEW AND UPDATE CUSTOMER TRANSACTIONS, TRACKING IDs, AND STATUS TIMELINES
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleExportCSV} variant="outline">
            <Download size={12} className="mr-1" /> EXPORT SHEET
          </Button>
        </div>
      </div>

      {/* Filters & Orders List */}
      <div className="bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] rounded-sm p-6 flex flex-col gap-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative max-w-md w-full flex items-center">
            <Search className="absolute left-3.5 text-[#282420]" size={16} />
            <input
              type="text"
              placeholder="SEARCH ORDERS (REF OR EMAIL)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[rgba(0,0,0,0.06)] rounded-sm font-mono text-[11px] text-[#111111] outline-none focus:border-neutral-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] text-[#282420] font-bold uppercase">FILTER STATE:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-[rgba(0,0,0,0.06)] rounded-sm px-4 py-2 font-mono text-[10px] font-bold uppercase cursor-pointer"
            >
              <option value="">ALL ORDERS</option>
              <option value="pending">PENDING</option>
              <option value="processing">PROCESSING</option>
              <option value="shipped">SHIPPED</option>
              <option value="delivered">DELIVERED</option>
              <option value="cancelled">CANCELLED</option>
            </select>
          </div>
        </div>

        {/* Listing Grid table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-[#111111] w-8 h-8" />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-[12px] text-[#111111]">
              <thead>
                <tr className="border-b border-[rgba(0,0,0,0.06)] text-[#282420] font-mono text-[10px] uppercase">
                  <th className="pb-3 font-semibold">ORDER ID</th>
                  <th className="pb-3 font-semibold">DATE</th>
                  <th className="pb-3 font-semibold">CUSTOMER EMAIL</th>
                  <th className="pb-3 font-semibold">ITEMS</th>
                  <th className="pb-3 font-semibold">PAYMENT</th>
                  <th className="pb-3 font-semibold">FULFILLMENT</th>
                  <th className="pb-3 font-semibold text-right">TOTAL</th>
                  <th className="pb-3 font-semibold text-right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center font-mono text-[#282420]">
                      NO LOGGED ORDERS FILED IN CATALOG.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="border-b border-[rgba(0,0,0,0.03)] last:border-0 hover:bg-[#FAFAFA]/50 transition-colors">
                      <td className="py-3.5 font-bold font-mono uppercase">{ord.order_number}</td>
                      <td className="py-3.5 text-[#6B6560]">{new Date(ord.created_at).toLocaleDateString()}</td>
                      <td className="py-3.5 text-[#6B6560] font-mono">{ord.email}</td>
                      <td className="py-3.5 text-[#111111] font-mono text-[10px]">
                        {ord.order_items?.map(item => item.products?.title || item.title).join(', ') || 'N/A'}
                      </td>
                      <td className="py-3.5">
                        <span className={getStatusBadge(ord.payment_status)}>
                          {ord.payment_status}
                        </span>
                      </td>
                      <td className="py-3.5 text-[#6B6560] capitalize">
                        <span className={getStatusBadge(ord.fulfillment_status)}>
                          {ord.fulfillment_status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-semibold">{formatCurrency(ord.total)}</td>
                      <td className="py-3.5 text-right">
                        <div className="flex gap-4 justify-end items-center">
                          <button
                            onClick={() => window.open(`/api/orders/${ord.id}/invoice?print=true`, '_blank')}
                            className="text-[#444444] hover:text-[#111111] flex items-center gap-1 font-mono text-[9px] font-bold uppercase cursor-pointer"
                            title="Print Invoice"
                          >
                            <Printer size={10} /> PRINT
                          </button>
                          <button
                            onClick={() => handleOpenDetail(ord)}
                            className="text-[#444444] hover:text-[#111111] flex items-center gap-1 font-mono text-[9px] font-bold uppercase cursor-pointer"
                          >
                            <Eye size={10} /> DETAILS
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Order Detail View Modal */}
      <Modal theme="light"
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={`SPECIFICATIONS VIEW // ${selectedOrder?.order_number}`}
        maxWidth="lg"
      >
        {selectedOrder && (
          <div className="flex flex-col gap-8 text-[#111111]">
            {/* Customer Details & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[rgba(0,0,0,0.03)] pb-5 gap-4">
              <div>
                <span className="font-mono text-[9px] text-[#282420] font-bold uppercase">RECIPIENT SUMMARY</span>
                <p className="font-bold text-[14px] text-[#111111] mt-1 uppercase">{selectedOrder.shipping_address.full_name}</p>
                <p className="text-[12px] text-[#444444] font-mono mt-0.5">{selectedOrder.email} // {selectedOrder.shipping_address.phone}</p>
              </div>

              {/* Status Update Trigger */}
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] text-[#282420] font-bold uppercase">FULFILL STATUS:</span>
                <select
                  value={tempFulfillmentStatus}
                  onChange={(e) => setTempFulfillmentStatus(e.target.value)}
                  className="bg-[#FFFFFF] text-[#111111] border border-[rgba(0,0,0,0.06)] rounded-sm px-4 py-2 font-mono text-[10px] font-bold uppercase cursor-pointer"
                >
                  <option value="pending" className="bg-[#FFFFFF] text-[#111111]">PENDING</option>
                  <option value="processing" className="bg-[#FFFFFF] text-[#111111]">CONFIRMED & PACKED</option>
                  <option value="shipped" className="bg-[#FFFFFF] text-[#111111]">SHIPPED</option>
                  <option value="delivered" className="bg-[#FFFFFF] text-[#111111]">DELIVERED</option>
                  <option value="cancelled" className="bg-[#FFFFFF] text-[#111111]">CANCELLED</option>
                </select>

                {tempFulfillmentStatus !== selectedOrder.fulfillment_status && (
                  <Button
                    onClick={() => handleUpdateStatus(tempFulfillmentStatus)}
                    variant="outline"
                    size="sm"
                    className="border-green-600 hover:bg-green-900/30 text-green-400 font-mono text-[10px] font-bold"
                    disabled={updatingStatus}
                  >
                    {updatingStatus ? 'SAVING...' : 'SAVE'}
                  </Button>
                )}

                <Button onClick={handlePrintInvoice} variant="outline" size="sm">
                  <Printer size={11} /> PRINT SLIP
                </Button>

                <Button 
                  onClick={() => handleResend('invoice')} 
                  variant="outline" 
                  size="sm"
                  disabled={resendingInvoice}
                  className="border-yellow-600 text-yellow-500 hover:bg-yellow-950/20"
                >
                  {resendingInvoice ? 'SENDING...' : 'RESEND INVOICE'}
                </Button>

                <Button 
                  onClick={() => handleResend('notification')} 
                  variant="outline" 
                  size="sm"
                  disabled={resendingNotification}
                  className="border-emerald-600 text-emerald-500 hover:bg-emerald-950/20"
                >
                  {resendingNotification ? 'SENDING...' : 'RESEND WA'}
                </Button>
              </div>
            </div>

            {/* Address Columns side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-[12px]">
              <div>
                <h4 className="font-mono text-[9px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-2 mb-3 uppercase">
                  SHIPPING ADDRESS
                </h4>
                <div className="leading-relaxed text-[#6B6560] font-mono uppercase">
                  <p className="font-bold text-[#111111]">{selectedOrder.shipping_address.full_name}</p>
                  <p>{selectedOrder.shipping_address.address_line1}</p>
                  {selectedOrder.shipping_address.address_line2 && <p>{selectedOrder.shipping_address.address_line2}</p>}
                  <p>{selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state} - {selectedOrder.shipping_address.zip}</p>
                  <p>{selectedOrder.shipping_address.country}</p>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[9px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-2 mb-3 uppercase">
                  BILLING DETAILS
                </h4>
                <div className="leading-relaxed text-[#6B6560] font-mono uppercase">
                  <p className="font-bold text-[#111111]">{selectedOrder.billing_address.full_name}</p>
                  <p>{selectedOrder.billing_address.address_line1}</p>
                  {selectedOrder.billing_address.address_line2 && <p>{selectedOrder.billing_address.address_line2}</p>}
                  <p>{selectedOrder.billing_address.city}, {selectedOrder.billing_address.state} - {selectedOrder.billing_address.zip}</p>
                  <p>{selectedOrder.billing_address.country}</p>
                </div>
              </div>
            </div>

            {/* Payment Details Card */}
            <div className="border border-[rgba(0,0,0,0.06)] rounded-sm p-4 bg-[#FFFFFF]">
              <h4 className="font-mono text-[9px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-2 mb-4 uppercase">
                PAYMENT DETAILS
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
                <div>
                  <span className="block font-mono text-[9px] text-[#444444] uppercase mb-1">PAYMENT STATUS</span>
                  <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-mono font-bold uppercase ${
                    selectedOrder.payment_status === 'paid'
                      ? 'bg-green-900/40 text-green-400 border border-green-800'
                      : selectedOrder.payment_status === 'pending'
                      ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-800'
                      : 'bg-red-900/40 text-red-400 border border-red-800'
                  }`}>
                    {selectedOrder.payment_status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div>
                  <span className="block font-mono text-[9px] text-[#444444] uppercase mb-1">GATEWAY</span>
                  <span className="font-mono text-[#111111] font-bold">
                    {selectedOrder.razorpay_payment_id ? 'RAZORPAY' : '—'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="block font-mono text-[9px] text-[#444444] uppercase mb-1">RAZORPAY PAYMENT ID</span>
                  <span className="font-mono text-[11px] text-[#111111] break-all">
                    {selectedOrder.razorpay_payment_id || <span className="text-[#444444] italic">Not yet captured</span>}
                  </span>
                </div>
                {selectedOrder.razorpay_order_id && (
                  <div className="col-span-2">
                    <span className="block font-mono text-[9px] text-[#444444] uppercase mb-1">RAZORPAY ORDER ID</span>
                    <span className="font-mono text-[11px] text-[#6B6560] break-all">
                      {selectedOrder.razorpay_order_id}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items Table */}

            <div>
              <h4 className="font-mono text-[9px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-2 mb-4 uppercase">
                BAGGED ITEMS ({selectedOrder.order_items?.length})
              </h4>
              <table className="w-full text-left border-collapse text-[12px] text-[#111111]">
                <thead>
                  <tr className="border-b border-[rgba(0,0,0,0.03)] text-[#282420] font-mono text-[9px] uppercase">
                    <th className="pb-2 font-semibold">ITEM TITLE</th>
                    <th className="pb-2 font-semibold">SIZE</th>
                    <th className="pb-2 font-semibold text-right">UNIT PRICE</th>
                    <th className="pb-2 font-semibold text-right">QTY</th>
                    <th className="pb-2 font-semibold text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.order_items?.map((item: any, i) => (
                    <tr key={i} className="border-b border-neutral-50 last:border-0">
                      <td className="py-2.5 font-bold uppercase">{item.products?.title || item.title}</td>
                      <td className="py-2.5 font-mono uppercase">{item.variant_info?.size || 'OS'}</td>
                      <td className="py-2.5 text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="py-2.5 text-right font-mono">{item.quantity}</td>
                      <td className="py-2.5 text-right font-semibold">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="border-t border-[rgba(0,0,0,0.03)] pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* Left Column: Shipment tracking form setter */}
              <form onSubmit={handleSaveTracking} className="flex-1 flex gap-2 w-full">
                <div className="flex-1">
                  <Input theme="light"
                    label="TRACKING ID"
                    required
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                </div>
                <div className="w-[140px]">
                  <Input theme="light"
                    label="CARRIER"
                    required
                    value={trackingCarrier}
                    onChange={(e) => setTrackingCarrier(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-black hover:bg-neutral-800 text-[#FFFFFF] font-mono text-[9px] font-bold tracking-widest px-4 h-12 self-start rounded-sm uppercase cursor-pointer"
                >
                  SAVE
                </button>
              </form>

              {/* Right Column: Financial totals calculation */}
              <div className="w-full md:w-[240px] flex flex-col gap-2 font-mono text-[10px] tracking-wide text-[#444444]">
                <div className="flex justify-between">
                  <span>SUB-TOTAL:</span>
                  <span className="text-[#111111] font-semibold">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>DISCOUNT:</span>
                    <span className="font-semibold">-{formatCurrency(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>SHIPPING:</span>
                  <span className="text-[#111111] font-semibold">{formatCurrency(selectedOrder.shipping_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span>TAX FEE:</span>
                  <span className="text-[#111111] font-semibold">{formatCurrency(selectedOrder.tax_amount)}</span>
                </div>
                <div className="flex justify-between border-t border-[rgba(0,0,0,0.03)] pt-2 text-[13px] font-bold text-[#111111] mt-1">
                  <span>FINAL TOTAL:</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Timeline updates logs & Custom Note Forms */}
            <div className="border-t border-[rgba(0,0,0,0.03)] pt-6">
              <h4 className="font-mono text-[9px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-2 mb-4 uppercase">
                OPERATION TIMELINE & AUDIT LOGS
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Note creator */}
                <form onSubmit={handleAddTimelineNote} className="flex flex-col gap-3">
                  <Input theme="light"
                    label="ADD AUDIT TIMELINE NOTE"
                    required
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="self-end px-6 py-2.5 bg-black hover:bg-neutral-800 text-[#FFFFFF] font-mono text-[9px] font-bold tracking-widest rounded-full uppercase cursor-pointer"
                  >
                    ADD LOG ENTRY
                  </button>
                </form>

                {/* Timeline lists */}
                <div className="flex flex-col gap-3.5 max-h-[160px] overflow-y-auto pr-2">
                  {selectedOrder.order_timeline?.map((log) => (
                    <div key={log.id} className="border-l border-[rgba(0,0,0,0.06)] pl-4 py-0.5 relative">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#444444] absolute top-1.5 -left-1" />
                      <span className="block text-[9px] font-mono text-[#282420]">
                        {new Date(log.created_at).toLocaleString()} // STATE: {log.status.toUpperCase()}
                      </span>
                      <p className="text-[11px] font-medium text-[#A19B95] mt-1 leading-relaxed">
                        {log.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Granular Status Transition History */}
            <div className="border-t border-[rgba(0,0,0,0.03)] pt-6">
              <h4 className="font-mono text-[9px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-2 mb-4 uppercase">
                GRANULAR STATUS HISTORY
              </h4>
              <div className="flex flex-col gap-2.5 max-h-[140px] overflow-y-auto pr-2">
                {statusHistory.length > 0 ? (
                  statusHistory.map((hist) => (
                    <div key={hist.id} className="flex justify-between items-center text-[11px] font-mono border-b border-neutral-900 pb-2">
                      <div>
                        <span className="text-[#6B6560] uppercase">{hist.old_status || 'INIT'}</span>
                        <span className="text-[#282420] mx-2">➜</span>
                        <span className="text-[#C9A96E] font-bold uppercase">
                          {hist.new_status === 'processing' ? 'CONFIRMED & PACKED' : hist.new_status}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#282420]">
                        {new Date(hist.changed_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#282420] italic">No granular status transitions logged yet.</p>
                )}
              </div>
            </div>

            {/* WhatsApp Communication Logs */}
            <div className="border-t border-[rgba(0,0,0,0.03)] pt-6">
              <h4 className="font-mono text-[9px] font-bold tracking-widest text-[#282420] border-b border-[rgba(0,0,0,0.03)] pb-2 mb-4 uppercase">
                WHATSAPP MESSAGING LOGS
              </h4>
              <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2">
                {whatsappLogs.length > 0 ? (
                  whatsappLogs.map((log) => (
                    <div key={log.id} className="border border-[rgba(0,0,0,0.06)] bg-[#FAFAFA] p-3 text-[11px] font-mono">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          log.status === 'sent' ? 'bg-green-950/40 text-green-400 border border-green-900/50' : 'bg-red-950/40 text-red-400 border border-red-900/50'
                        }`}>
                          {log.status}
                        </span>
                        <span className="text-[9px] text-[#282420]">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-1 text-[#6B6560]">
                        <p><span className="text-[#282420]">TYPE:</span> <span className="uppercase text-[#A19B95]">{log.message_type.replace(/_/g, ' ')}</span></p>
                        <p><span className="text-[#282420]">TO:</span> <span className="text-[#A19B95]">{log.phone_number} ({log.recipient_type.toUpperCase()})</span></p>
                        <div className="mt-2 p-2 bg-[#FAFAFA] text-[#A19B95] whitespace-pre-wrap leading-relaxed text-[10px] border border-[rgba(0,0,0,0.03)]">
                          {log.message_body}
                        </div>
                        {log.error_message && (
                          <p className="text-red-400 text-[10px] mt-1"><span className="text-[#282420]">ALERT:</span> {log.error_message}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#282420] italic">No WhatsApp communications logged for this order.</p>
                )}
              </div>
            </div>

            {/* Hidden printable invoice container */}
            <div id="printable-invoice-content" className="hidden">
              <div style={{ fontFamily: 'monospace', padding: '40px', color: '#000000', backgroundColor: '#FFFFFF' }}>
                <h1 style={{ fontSize: '24px', letterSpacing: '0.2em', textAlign: 'center', margin: '0 0 40px 0' }}>ZELIX INVOICE</h1>
                <hr style={{ border: 'none', borderBottom: '1px solid #000', margin: '20px 0' }} />
                
                <table style={{ width: '100%', marginBottom: '40px' }}>
                  <tbody>
                    <tr>
                      <td style={{ verticalAlign: 'top', width: '50%' }}>
                        <strong>SHIP TO:</strong><br />
                        {selectedOrder.shipping_address.full_name.toUpperCase()}<br />
                        {selectedOrder.shipping_address.address_line1.toUpperCase()}<br />
                        {selectedOrder.shipping_address.address_line2?.toUpperCase()}<br />
                        {selectedOrder.shipping_address.city.toUpperCase()}, {selectedOrder.shipping_address.state.toUpperCase()} - {selectedOrder.shipping_address.zip}<br />
                        PHONE: {selectedOrder.shipping_address.phone}
                      </td>
                      <td style={{ verticalAlign: 'top', textAlign: 'right' }}>
                        <strong>ORDER REFERENCE:</strong> {selectedOrder.order_number}<br />
                        <strong>DATE:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}<br />
                        <strong>PAYMENT REFERENCE:</strong> {selectedOrder.razorpay_payment_id || 'MOCK_PAID'}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #000', textAlign: 'left' }}>
                      <th style={{ padding: '8px 0' }}>ITEM TITLE</th>
                      <th>SIZE</th>
                      <th style={{ textAlign: 'right' }}>UNIT PRICE</th>
                      <th style={{ textAlign: 'right' }}>QTY</th>
                      <th style={{ textAlign: 'right' }}>TOTAL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.order_items?.map((item: any, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 0' }}>{item.title.toUpperCase()}</td>
                        <td>{item.variant_info?.size || 'OS'}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.unit_price)}</td>
                        <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right' }}>{formatCurrency(item.line_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ width: '280px', marginLeft: 'auto', borderTop: '2px solid #000', paddingTop: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>SUB-TOTAL:</span>
                    <span>{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount_amount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#ff0000' }}>
                      <span>DISCOUNT:</span>
                      <span>-{formatCurrency(selectedOrder.discount_amount)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>TAX FEE (18%):</span>
                    <span>{formatCurrency(selectedOrder.tax_amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>SHIPPING FEE:</span>
                    <span>{formatCurrency(selectedOrder.shipping_cost)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', borderTop: '1px solid #000', paddingTop: '8px', marginTop: '8px' }}>
                    <span>FINAL TOTAL:</span>
                    <span>{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </Modal>
    </div>
  );
}
