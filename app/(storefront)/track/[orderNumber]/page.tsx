import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase';
import { ShieldCheck, Truck, Clock, Package, AlertCircle, Calendar } from 'lucide-react';

interface PageProps {
  params: {
    orderNumber: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `TRACK ORDER ${params.orderNumber} | ZELIX`,
    description: `Real-time shipment and fulfillment status tracking for ZELIX order ${params.orderNumber}.`,
  };
}

export default async function TrackOrderPage({ params }: PageProps) {
  const { orderNumber } = params;

  // Fetch the order along with its order items and timeline
  const queryField = orderNumber.startsWith('ORD-') ? 'order_number' : 'id';
  
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq(queryField, orderNumber)
    .maybeSingle();

  if (error || !order) {
    notFound();
  }

  // Fetch timeline logs
  const { data: timeline } = await supabaseAdmin
    .from('order_timeline')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: false });

  // Fetch order items
  const { data: items } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  const orderItems = items || [];
  const timelineLogs = timeline || [];

  // Estimated delivery date (5 days from creation)
  const estDate = new Date(order.created_at);
  estDate.setDate(estDate.getDate() + 5);
  const formattedEstDate = estDate.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Calculate progress step
  const getFulfillmentStep = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 1;
      case 'processing': return 2; // confirmed / packed
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return -1;
      default: return 1;
    }
  };

  const currentStep = getFulfillmentStep(order.fulfillment_status);

  return (
    <main className="min-h-screen bg-black text-white py-24 px-4 sm:px-6 lg:px-8 font-mono">
      <div className="max-w-3xl mx-auto border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
        
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-800 pb-6 mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-widest text-[#C9A96E]">ZELIX TRACKING</h1>
            <p className="text-zinc-500 text-xs mt-1">ORDER ID: {order.order_number}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className={`inline-block px-3 py-1 text-xs border uppercase tracking-wider font-semibold ${
              order.fulfillment_status === 'delivered' ? 'border-emerald-500 text-emerald-400 bg-emerald-950/20' :
              order.fulfillment_status === 'cancelled' ? 'border-red-500 text-red-400 bg-red-950/20' :
              'border-[#C9A96E] text-[#C9A96E] bg-[#C9A96E]/5'
            }`}>
              {order.fulfillment_status === 'processing' ? 'CONFIRMED & PACKED' : order.fulfillment_status}
            </span>
          </div>
        </div>

        {/* Timeline Visualization */}
        {order.fulfillment_status !== 'cancelled' ? (
          <div className="mb-12">
            <div className="relative flex justify-between items-center w-full">
              {/* Progress Line */}
              <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-zinc-800 -translate-y-1/2 z-0" />
              <div 
                className="absolute left-0 top-1/2 h-[2px] bg-[#C9A96E] -translate-y-1/2 z-0 transition-all duration-500" 
                style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
              />

              {/* Steps */}
              {[
                { label: 'PLACED', step: 1 },
                { label: 'CONFIRMED', step: 2 },
                { label: 'SHIPPED', step: 3 },
                { label: 'DELIVERED', step: 4 }
              ].map((s) => (
                <div key={s.step} className="relative z-10 flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold ${
                    currentStep >= s.step
                      ? 'bg-black border-[#C9A96E] text-[#C9A96E]'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}>
                    {s.step}
                  </div>
                  <span className="text-[10px] mt-2 tracking-widest text-zinc-400 font-semibold">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border border-red-900/50 bg-red-950/10 p-4 flex items-center gap-3 mb-10 text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold uppercase tracking-wider">THIS ORDER HAS BEEN CANCELLED</p>
              <p className="text-zinc-400 text-xs mt-1">If you have any questions, please contact client support.</p>
            </div>
          </div>
        )}

        {/* Courier / Shipping Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-zinc-800 pb-8 mb-8">
          <div className="border border-zinc-800 bg-zinc-900/40 p-4">
            <h3 className="text-xs text-zinc-500 tracking-wider mb-2 uppercase flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#C9A96E]" /> Courier & Shipment
            </h3>
            {order.tracking_number ? (
              <div className="space-y-1 text-sm text-zinc-300">
                <p><span className="text-zinc-500">Carrier:</span> {order.tracking_carrier || 'Blue Dart'}</p>
                <p><span className="text-zinc-500">Tracking:</span> <span className="text-[#C9A96E] select-all font-mono">{order.tracking_number}</span></p>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 mt-2 font-mono">Courier Assignment Pending</p>
            )}
          </div>

          <div className="border border-zinc-800 bg-zinc-900/40 p-4">
            <h3 className="text-xs text-zinc-500 tracking-wider mb-2 uppercase flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C9A96E]" /> Estimated Delivery
            </h3>
            {order.fulfillment_status === 'delivered' ? (
              <p className="text-sm text-emerald-400 flex items-center gap-2 mt-1">
                <ShieldCheck className="w-4 h-4" /> Package Delivered Successfully
              </p>
            ) : (
              <p className="text-sm text-zinc-300 font-mono mt-1">{formattedEstDate}</p>
            )}
          </div>
        </div>

        {/* Detailed Timeline updates */}
        <div className="mb-10">
          <h2 className="text-sm font-bold tracking-widest text-[#C9A96E] uppercase mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4" /> STATUS LOGS
          </h2>
          <div className="relative pl-6 border-l border-zinc-800 space-y-8">
            {timelineLogs.length > 0 ? (
              timelineLogs.map((log) => (
                <div key={log.id} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-[30px] top-[4px] w-2.5 h-2.5 rounded-full border border-black bg-[#C9A96E]" />
                  
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-sm font-semibold uppercase tracking-wider text-zinc-200">
                        {log.status === 'processing' ? 'Confirmed & Packed' : log.status}
                      </p>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(log.created_at).toLocaleString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {log.note && <p className="text-xs text-zinc-400 mt-1">{log.note}</p>}
                  </div>
                </div>
              ))
            ) : (
              <div className="relative">
                <div className="absolute -left-[30px] top-[4px] w-2.5 h-2.5 rounded-full border border-black bg-zinc-600" />
                <div>
                  <p className="text-sm uppercase tracking-wider text-zinc-400">Order Initiated</p>
                  <p className="text-xs text-zinc-600 mt-1">Awaiting status synchronizations.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoice & Order Summary */}
        <div className="border-t border-zinc-800 pt-8 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold tracking-widest text-zinc-400 uppercase">ORDER DETAILS</h2>
            <Link 
              href={`/api/orders/${order.id}/invoice/pdf`}
              target="_blank"
              className="text-xs text-[#C9A96E] hover:underline font-semibold"
            >
              DOWNLOAD PDF INVOICE
            </Link>
          </div>
          
          <div className="space-y-4 mb-6">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-start border-b border-zinc-900 pb-3 text-xs">
                <div>
                  <p className="font-semibold text-zinc-300">{item.title}</p>
                  {item.variant_info && Object.keys(item.variant_info).length > 0 && (
                    <p className="text-zinc-500 text-[10px] mt-1">
                      {Object.entries(item.variant_info).map(([k, v]) => `${k}: ${v}`).join(' // ')}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-zinc-400">{item.quantity} x ₹{item.unit_price}</p>
                  <p className="font-semibold text-[#C9A96E] mt-1">₹{item.line_total}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="bg-zinc-900/40 p-4 border border-zinc-900 text-xs space-y-2">
            <div className="flex justify-between text-zinc-500">
              <span>SUBTOTAL</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-red-400">
                <span>DISCOUNT ({order.coupon_code})</span>
                <span>-₹{order.discount_amount}</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500">
              <span>SHIPPING COST</span>
              <span>₹{order.shipping_cost}</span>
            </div>
            {order.tax_amount > 0 && (
              <div className="flex justify-between text-zinc-500">
                <span>GST TAX (18% INCL)</span>
                <span>₹{order.tax_amount}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-white border-t border-zinc-800 pt-2 mt-2">
              <span className="text-[#C9A96E]">TOTAL</span>
              <span className="text-[#C9A96E]">₹{order.total}</span>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-12">
          <Link href="/products" className="text-xs text-zinc-500 hover:text-white uppercase tracking-widest border border-zinc-800 hover:border-white px-6 py-2 transition-all">
            RETURN TO CATALOG
          </Link>
        </div>

      </div>
    </main>
  );
}
