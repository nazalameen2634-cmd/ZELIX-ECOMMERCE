import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const searchParams = request.nextUrl.searchParams;
  const shouldPrint = searchParams.get('print') === 'true';

  let order: any = null;
  let items: any[] = [];

  // Try to query Supabase
  try {
    const queryField = id.startsWith('ORD-') ? 'order_number' : 'id';
    const { data: dbOrder, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq(queryField, id)
      .maybeSingle();

    if (dbOrder && !orderError) {
      order = dbOrder;
      
      const { data: dbItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);

      if (dbItems && !itemsError) {
        items = dbItems;
      }
    }
  } catch (error) {
    console.error('Invoice generation DB error:', error);
  }

  // Fallback to high-fidelity mock if no DB record is found
  if (!order) {
    order = {
      id: id,
      order_number: id.startsWith('ORD-') ? id : 'ORD-10087',
      email: 'client@zelix.design',
      created_at: new Date().toISOString(),
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
      fulfillment_status: 'processing'
    };

    items = [
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
    ];
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Print-optimized HTML template
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>INVOICE - ${order.order_number}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@100..900&family=Inter:wght@100..900&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Geist Mono', monospace;
          font-size: 11px;
          line-height: 1.5;
          color: #000000;
          background-color: #ffffff;
          padding: 40px;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
        }

        header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid #000000;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }

        .brand h1 {
          font-size: 24px;
          font-weight: 900;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .brand p {
          font-size: 9px;
          color: #666666;
          margin-top: 4px;
          letter-spacing: 0.05em;
        }

        .invoice-details {
          text-align: right;
          text-transform: uppercase;
        }

        .invoice-details h2 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        .invoice-details p {
          color: #444444;
        }

        .addresses {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          margin-bottom: 40px;
          text-transform: uppercase;
        }

        .address-block h3 {
          font-size: 10px;
          font-weight: 700;
          border-bottom: 1px solid #000000;
          padding-bottom: 4px;
          margin-bottom: 8px;
          color: #000000;
        }

        .address-block p {
          margin-bottom: 2px;
          color: #333333;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
          text-transform: uppercase;
        }

        th {
          background-color: #000000;
          color: #ffffff;
          font-weight: 700;
          text-align: left;
          padding: 8px;
          font-size: 9px;
          letter-spacing: 0.08em;
        }

        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e5e5;
        }

        .item-title {
          font-weight: 700;
        }

        .item-meta {
          font-size: 9px;
          color: #666666;
          margin-top: 2px;
        }

        .totals {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 40px;
          text-transform: uppercase;
        }

        .totals-table {
          width: 300px;
          margin-bottom: 0;
        }

        .totals-table td {
          padding: 6px 8px;
          border-bottom: 1px solid #e5e5e5;
        }

        .totals-table tr:last-child td {
          border-bottom: 2px solid #000000;
          font-weight: 900;
          font-size: 12px;
        }

        .footer {
          border-top: 1px solid #e5e5e5;
          padding-top: 20px;
          text-align: center;
          color: #666666;
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .no-print-bar {
          background-color: #f5f5f5;
          border: 1px solid #e5e5e5;
          padding: 12px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          text-transform: uppercase;
        }

        .btn {
          background-color: #000000;
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          font-family: 'Geist Mono', monospace;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.08em;
          text-decoration: none;
        }

        .btn-secondary {
          background-color: transparent;
          color: #000000;
          border: 1px solid #000000;
          margin-right: 10px;
        }

        @media print {
          .no-print-bar {
            display: none;
          }
          body {
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        
        <!-- Controls not shown during print -->
        <div class="no-print-bar">
          <span>INVOICE PREVIEW MODE</span>
          <div>
            <button onclick="window.history.back()" class="btn btn-secondary">BACK</button>
            <button onclick="window.print()" class="btn">PRINT INVOICE</button>
          </div>
        </div>

        <header>
          <div class="brand">
            <h1>ZELIX</h1>
            <p>POST-MODERN ACTIVEWEAR & STREETWEAR</p>
            <p>WWW.ZELIX.SHOP | CONTACT@ZELIX.SHOP</p>
          </div>
          <div class="invoice-details">
            <h2>INVOICE</h2>
            <p><strong>ORDER:</strong> ${order.order_number}</p>
            <p><strong>DATE:</strong> ${formattedDate}</p>
            <p><strong>STATUS:</strong> ${order.payment_status}</p>
          </div>
        </header>

        <section class="addresses">
          <div class="address-block">
            <h3>SHIPPING ADDRESS</h3>
            <p><strong>${order.shipping_address?.full_name || ''}</strong></p>
            <p>${order.shipping_address?.address_line1 || ''}</p>
            ${order.shipping_address?.address_line2 ? `<p>${order.shipping_address.address_line2}</p>` : ''}
            <p>${order.shipping_address?.city || ''}, ${order.shipping_address?.state || ''} - ${order.shipping_address?.zip || ''}</p>
            <p>${order.shipping_address?.country || ''}</p>
            <p>TEL: ${order.shipping_address?.phone || ''}</p>
          </div>
          <div class="address-block">
            <h3>BILLING ADDRESS</h3>
            <p><strong>${order.billing_address?.full_name || ''}</strong></p>
            <p>${order.billing_address?.address_line1 || ''}</p>
            ${order.billing_address?.address_line2 ? `<p>${order.billing_address.address_line2}</p>` : ''}
            <p>${order.billing_address?.city || ''}, ${order.billing_address?.state || ''} - ${order.billing_address?.zip || ''}</p>
            <p>${order.billing_address?.country || ''}</p>
            <p>TEL: ${order.billing_address?.phone || ''}</p>
          </div>
        </section>

        <table>
          <thead>
            <tr>
              <th style="width: 50%">PRODUCT DESCRIPTION</th>
              <th style="width: 15%; text-align: right">UNIT PRICE</th>
              <th style="width: 15%; text-align: center">QTY</th>
              <th style="width: 20%; text-align: right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr>
                <td>
                  <div class="item-title">${item.title}</div>
                  ${item.variant_info && Object.keys(item.variant_info).length > 0 ? `
                    <div class="item-meta">
                      ${Object.entries(item.variant_info).map(([k, v]) => `${k}: ${v}`).join(' // ')}
                    </div>
                  ` : ''}
                </td>
                <td style="text-align: right">₹${item.unit_price}</td>
                <td style="text-align: center">${item.quantity}</td>
                <td style="text-align: right">₹${item.line_total}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totals">
          <table class="totals-table">
            <tr>
              <td>SUBTOTAL</td>
              <td style="text-align: right">₹${order.subtotal}</td>
            </tr>
            ${order.discount_amount > 0 ? `
              <tr>
                <td>DISCOUNT ${order.coupon_code ? `(${order.coupon_code})` : ''}</td>
                <td style="text-align: right">-₹${order.discount_amount}</td>
              </tr>
            ` : ''}
            ${order.tax_amount > 0 ? `
              <tr>
                <td>TAX (18% GST INCL)</td>
                <td style="text-align: right">₹${order.tax_amount}</td>
              </tr>
            ` : ''}
            <tr>
              <td>SHIPPING COST</td>
              <td style="text-align: right">₹${order.shipping_cost}</td>
            </tr>
            <tr>
              <td>TOTAL AMOUNT</td>
              <td style="text-align: right">₹${order.total}</td>
            </tr>
          </table>
        </div>

        <footer class="footer">
          <p>THANK YOU FOR PATRONIZING ZELIX. ALL SALES ON DESIGN LAB ARTIFACTS ARE REGISTERED.</p>
          <p style="margin-top: 8px; font-size: 8px; color: #999999;">INVOICE GENERATED SYSTEMATICALLY ON ${new Date().toISOString()}</p>
        </footer>
      </div>

      ${shouldPrint ? `
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      ` : ''}
    </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}
