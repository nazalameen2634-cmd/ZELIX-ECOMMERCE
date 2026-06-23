import fs from 'fs';
import path from 'path';
import { supabaseAdmin } from './supabaseServer';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string; // Base64 content
  }[];
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || 'ZELIX <orders@zelix.shop>';

  let isSimulated = true;
  let status: 'sent' | 'failed' = 'sent';
  let errorMessage: string | null = null;

  if (apiKey && apiKey !== 'placeholder' && !apiKey.includes('xxx')) {
    isSimulated = false;
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: to,
          subject: subject,
          html: html,
          attachments: attachments,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        status = 'failed';
        errorMessage = errData.message || response.statusText;
      }
    } catch (e: any) {
      status = 'failed';
      errorMessage = e.message || String(e);
    }
  }

  console.log(`[Email Notification] To: ${to} | Subject: ${subject} | Status: ${isSimulated ? 'simulated' : status}`);
  if (errorMessage) {
    console.error(`[Email Notification Error]: ${errorMessage}`);
  }

  return { success: status === 'sent', simulated: isSimulated, error: errorMessage };
}

// Orchestrate Email Success Flow (Sends Email with PDF Attachment)
export async function triggerOrderEmailFlow(orderIdOrNumber: string) {
  try {
    const queryField = orderIdOrNumber.startsWith('ORD-') ? 'order_number' : 'id';
    
    // 1. Fetch order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq(queryField, orderIdOrNumber)
      .maybeSingle();

    if (!order || orderError) {
      console.error('triggerOrderEmailFlow: Order not found:', orderIdOrNumber, orderError);
      return;
    }

    // 2. Fetch order items
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    const orderItems = items || [];
    const itemsListHtml = orderItems
      .map((item: any) => `<li><strong>${item.title}</strong> x ${item.quantity} - INR ${item.unit_price}</li>`)
      .join('');

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // 3. Pre-generate the invoice PDF on the local filesystem
    try {
      await fetch(`${appUrl}/api/orders/${order.id}/invoice/pdf`, { method: 'GET' });
    } catch (pdfErr) {
      console.error('Error pre-generating PDF:', pdfErr);
    }

    // 4. Read PDF file and convert to Base64 for Resend attachment
    const attachments: { filename: string; content: string }[] = [];
    const fileName = `${order.order_number}.pdf`;
    const filePath = path.join(process.cwd(), 'public', 'invoices', fileName);

    if (fs.existsSync(filePath)) {
      const pdfBuffer = fs.readFileSync(filePath);
      attachments.push({
        filename: `invoice-${order.order_number}.pdf`,
        content: pdfBuffer.toString('base64'),
      });
    }

    // 5. Construct Email HTML Body
    const customerName = order.shipping_address?.full_name || 'Customer';
    const trackingLink = `${appUrl}/track/${order.order_number}`;
    
    const sa = order.shipping_address || {};
    const addressLine = sa.address_line1 + (sa.address_line2 ? `, ${sa.address_line2}` : '');
    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });

    const productRowsHtml = orderItems
      .map((item: any) => `
        <tr>
          <td style="border-bottom: 1px solid #eee; padding: 12px; color: #1f2937; font-size: 14px;">${item.title}</td>
          <td align="center" style="border-bottom: 1px solid #eee; padding: 12px; color: #4b5563; font-size: 14px;">${item.quantity}</td>
          <td align="right" style="border-bottom: 1px solid #eee; padding: 12px; color: #1f2937; font-size: 14px; font-weight: bold;">₹${item.unit_price}</td>
        </tr>
      `)
      .join('');

    const customerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Order Confirmation</title>
</head>

<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td align="center" style="background:#111827;padding:40px 20px;">
<h1 style="color:#ffffff;margin:0;font-size:36px;font-family:monospace;letter-spacing:4px;font-weight:bold;margin-bottom:10px;">
ZELIX
</h1>
<h2 style="color:#ffffff;margin:0;font-size:24px;font-weight:normal;letter-spacing:1px;">
Order Confirmed 🎉
</h2>
<p style="color:#d1d5db;margin-top:10px;font-size:14px;letter-spacing:0.5px;">
Thank you for shopping with us.
</p>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:40px;">

<p style="font-size:18px;color:#111827;">
Hi <strong>${customerName}</strong>,
</p>

<p style="color:#6b7280;line-height:1.8;">
We've received your order and it's now being processed.
We'll notify you again once your package has been shipped.
</p>

<!-- Order Box -->
<table width="100%" cellpadding="15" cellspacing="0"
style="background:#f9fafb;border-radius:12px;margin-top:25px;">

<tr>
<td>
<strong>Order ID:</strong> #${order.order_number}
</td>
<td align="right">
<strong>Date:</strong> ${orderDate}
</td>
</tr>

</table>

<!-- Products -->
<h3 style="margin-top:35px;color:#111827;">
Order Summary
</h3>

<table width="100%" cellpadding="12" cellspacing="0"
style="border-collapse:collapse;">

<tr style="background:#f9fafb;">
<th align="left">Product</th>
<th align="center">Qty</th>
<th align="right">Price</th>
</tr>

${productRowsHtml}

</table>

<!-- Total -->
<table width="100%" cellpadding="15" cellspacing="0"
style="margin-top:20px;background:#111827;border-radius:12px;">

<tr>
<td style="color:#ffffff;font-size:18px;">
Total
</td>
<td align="right" style="color:#ffffff;font-size:24px;font-weight:bold;">
₹${order.total}
</td>
</tr>

</table>

<!-- Tracking Button -->
<div style="text-align:center;margin-top:35px;">
<a href="${trackingLink}"
style="
background:#111827;
color:#ffffff;
text-decoration:none;
padding:14px 32px;
border-radius:10px;
font-weight:bold;
display:inline-block;">
Track Order
</a>
</div>

<!-- Shipping -->
<h3 style="margin-top:40px;color:#111827;">
Shipping Address
</h3>

<p style="color:#6b7280;line-height:1.8;">
${customerName}<br>
${addressLine}<br>
${sa.city || ''}, ${sa.state || ''}<br>
${sa.zip || ''}
</p>

</td>
</tr>

<!-- Footer -->
<tr>
<td align="center" style="background:#f9fafb;padding:30px;">

<p style="margin:0;color:#111827;font-weight:bold;letter-spacing:1px;font-family:monospace;">
ZELIX
</p>

<p style="margin-top:10px;color:#6b7280;font-size:14px;">
Questions? Contact us anytime.
</p>

<p style="margin-top:5px;">
<a href="mailto:orders@zelix.shop"
style="color:#111827;text-decoration:none;">
orders@zelix.shop
</a>
</p>

</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
    `;

    // 6. Send Email to Customer
    await sendEmail({
      to: order.email,
      subject: `[ZELIX] ORDER CONFIRMATION - ${order.order_number}`,
      html: customerHtml,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    // 7. Send Admin Notification Email
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@zelix.shop';
    const adminHtml = `
      <div style="font-family: monospace, sans-serif; background-color: #000; color: #fff; padding: 30px;">
        <h2 style="font-size: 20px; color: #ff0000; border-bottom: 1px solid #222; padding-bottom: 15px;">🚨 NEW ORDER INCOMING</h2>
        <p style="font-size: 12px; color: #ccc;">A new order was placed and confirmed on Zelix Storefront.</p>
        <ul style="font-size: 12px; color: #aaa; line-height: 2;">
          <li><strong>Order Number:</strong> ${order.order_number}</li>
          <li><strong>Customer:</strong> ${customerName} (${order.email})</li>
          <li><strong>Total Value:</strong> INR ${order.total}</li>
          <li><strong>Payment Method:</strong> Razorpay</li>
        </ul>
        <p style="font-size: 11px; color: #666; margin-top: 30px;">Please check your Zelix Admin Portal to manage this shipment.</p>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `🚨 [ZELIX ADMIN] NEW ORDER PLACED - ${order.order_number}`,
      html: adminHtml,
    });

    // 8. Log into timeline
    await supabaseAdmin.from('order_timeline').insert([
      {
        order_id: order.id,
        status: order.fulfillment_status,
        note: `Confirmation email with PDF invoice sent to ${order.email}`,
      },
    ]);

  } catch (err) {
    console.error('Error triggering order success email flow:', err);
  }
}

// ─── Status Update Email (Shipped / Delivered / Cancelled) ─────────────────
export async function sendStatusUpdateEmail(order: any, newStatus: string) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@zelix.shop';
    const customerName = order.shipping_address?.full_name || 'Customer';
    const orderNumber = order.order_number;
    const trackingLink = `${appUrl}/track/${orderNumber}`;
    const trackingNumber = order.tracking_number || '';
    const trackingCarrier = order.tracking_carrier || '';

    // ── Determine subject, header colour, icon, and status message ──
    let subject = '';
    let headerBg = '#111827';
    let headerIcon = '📦';
    let headerTitle = 'Order Update';
    let statusMessage = '';
    let extraBlock = '';

    if (newStatus === 'shipped') {
      subject = `[ZELIX] YOUR ORDER HAS SHIPPED - ${orderNumber}`;
      headerBg = '#0f4c81';
      headerIcon = '🚚';
      headerTitle = 'Your Order is On the Way!';
      statusMessage = `Great news! Your order <strong>${orderNumber}</strong> has been shipped and is on its way to you.`;
      if (trackingNumber) {
        extraBlock = `
          <table width="100%" cellpadding="14" cellspacing="0" style="background:#f0f7ff;border-radius:12px;margin-top:20px;">
            <tr>
              <td>
                <p style="margin:0 0 6px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Courier Partner</p>
                <p style="margin:0;font-size:16px;font-weight:bold;color:#111827;">${trackingCarrier || 'Standard Courier'}</p>
              </td>
            </tr>
            <tr>
              <td>
                <p style="margin:0 0 6px 0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Tracking ID</p>
                <p style="margin:0;font-size:16px;font-weight:bold;color:#0f4c81;font-family:monospace;">${trackingNumber}</p>
              </td>
            </tr>
          </table>`;
      }
    } else if (newStatus === 'delivered') {
      subject = `[ZELIX] ORDER DELIVERED - ${orderNumber}`;
      headerBg = '#064e3b';
      headerIcon = '✅';
      headerTitle = 'Order Delivered!';
      statusMessage = `Your order <strong>${orderNumber}</strong> has been successfully delivered. We hope you love your new items!`;
      extraBlock = `
        <table width="100%" cellpadding="14" cellspacing="0" style="background:#f0fdf4;border-radius:12px;margin-top:20px;">
          <tr>
            <td style="font-size:14px;color:#065f46;line-height:1.7;">
              🌟 <strong>Enjoying your order?</strong><br/>
              Share your experience or drop us a note at <a href="mailto:orders@zelix.shop" style="color:#065f46;">orders@zelix.shop</a>.
            </td>
          </tr>
        </table>`;
    } else if (newStatus === 'cancelled') {
      subject = `[ZELIX] ORDER CANCELLED - ${orderNumber}`;
      headerBg = '#7f1d1d';
      headerIcon = '❌';
      headerTitle = 'Order Cancelled';
      statusMessage = `Your order <strong>${orderNumber}</strong> has been cancelled. If you did not request this, please contact our support immediately.`;
      extraBlock = `
        <table width="100%" cellpadding="14" cellspacing="0" style="background:#fef2f2;border-radius:12px;margin-top:20px;">
          <tr>
            <td style="font-size:14px;color:#991b1b;line-height:1.7;">
              💬 <strong>Need help?</strong><br/>
              Reach us at <a href="mailto:orders@zelix.shop" style="color:#991b1b;">orders@zelix.shop</a> and we'll sort it out for you.
            </td>
          </tr>
        </table>`;
    } else {
      subject = `[ZELIX] ORDER STATUS UPDATE - ${orderNumber}`;
      statusMessage = `Your order <strong>${orderNumber}</strong> status has been updated to <strong>${newStatus.toUpperCase()}</strong>.`;
    }

    // ── Build order items list ──
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    const orderItems: any[] = items || [];
    const productRowsHtml = orderItems
      .map(
        (item: any) => `
        <tr>
          <td style="border-bottom:1px solid #eee;padding:12px;color:#1f2937;font-size:14px;">${item.title}</td>
          <td align="center" style="border-bottom:1px solid #eee;padding:12px;color:#4b5563;font-size:14px;">${item.quantity}</td>
          <td align="right" style="border-bottom:1px solid #eee;padding:12px;color:#1f2937;font-size:14px;font-weight:bold;">₹${item.unit_price}</td>
        </tr>`
      )
      .join('');

    // ── Customer email HTML ──
    const customerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${headerTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 25px rgba(0,0,0,0.08);">

<!-- Header -->
<tr>
<td align="center" style="background:${headerBg};padding:40px 20px;">
  <h1 style="color:#ffffff;margin:0;font-size:36px;font-family:monospace;letter-spacing:4px;font-weight:bold;margin-bottom:10px;">ZELIX</h1>
  <h2 style="color:#ffffff;margin:0;font-size:22px;font-weight:normal;letter-spacing:1px;">${headerIcon} ${headerTitle}</h2>
</td>
</tr>

<!-- Content -->
<tr>
<td style="padding:40px;">
  <p style="font-size:18px;color:#111827;">Hi <strong>${customerName}</strong>,</p>
  <p style="color:#6b7280;line-height:1.8;font-size:15px;">${statusMessage}</p>

  ${extraBlock}

  <!-- Order Reference -->
  <table width="100%" cellpadding="15" cellspacing="0" style="background:#f9fafb;border-radius:12px;margin-top:25px;">
    <tr>
      <td><strong style="color:#111827;">Order ID:</strong> <span style="color:#374151;">#${orderNumber}</span></td>
      <td align="right"><strong style="color:#111827;">Amount:</strong> <span style="color:#374151;">₹${order.total}</span></td>
    </tr>
  </table>

  <!-- Products -->
  <h3 style="margin-top:35px;color:#111827;">Order Summary</h3>
  <table width="100%" cellpadding="12" cellspacing="0" style="border-collapse:collapse;">
    <tr style="background:#f9fafb;">
      <th align="left" style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Product</th>
      <th align="center" style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Qty</th>
      <th align="right" style="color:#6b7280;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Price</th>
    </tr>
    ${productRowsHtml}
  </table>

  <!-- CTA Button -->
  <div style="text-align:center;margin-top:35px;">
    <a href="${trackingLink}" style="background:${headerBg};color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:bold;display:inline-block;font-size:14px;">Track Your Order</a>
  </div>
</td>
</tr>

<!-- Footer -->
<tr>
<td align="center" style="background:#f9fafb;padding:30px;">
  <p style="margin:0;color:#111827;font-weight:bold;letter-spacing:1px;font-family:monospace;">ZELIX</p>
  <p style="margin-top:10px;color:#6b7280;font-size:14px;">Questions? Contact us anytime.</p>
  <p style="margin-top:5px;"><a href="mailto:orders@zelix.shop" style="color:#111827;text-decoration:none;">orders@zelix.shop</a></p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>`;

    await sendEmail({
      to: order.email,
      subject,
      html: customerHtml,
    });

    // ── Admin notification ──
    const statusLabel = newStatus === 'processing' ? 'CONFIRMED & PACKED' : newStatus.toUpperCase();
    const adminHtml = `
      <div style="font-family:monospace,sans-serif;background:#000;color:#fff;padding:30px;">
        <h2 style="font-size:18px;color:#facc15;border-bottom:1px solid #222;padding-bottom:15px;">📋 ORDER STATUS CHANGED → ${statusLabel}</h2>
        <ul style="font-size:12px;color:#aaa;line-height:2;">
          <li><strong>Order:</strong> ${orderNumber}</li>
          <li><strong>Customer:</strong> ${customerName} (${order.email})</li>
          <li><strong>New Status:</strong> ${statusLabel}</li>
          ${trackingNumber ? `<li><strong>Tracking ID:</strong> ${trackingNumber} (${trackingCarrier})</li>` : ''}
          <li><strong>Total:</strong> ₹${order.total}</li>
        </ul>
        <p style="font-size:11px;color:#555;margin-top:30px;">This is an automated notification from the Zelix Admin system.</p>
      </div>`;

    await sendEmail({
      to: adminEmail,
      subject: `[ZELIX ADMIN] ORDER ${statusLabel} - ${orderNumber}`,
      html: adminHtml,
    });

    // Log to timeline
    await supabaseAdmin.from('order_timeline').insert([
      {
        order_id: order.id,
        status: newStatus,
        note: `Status update email (${statusLabel}) sent to ${order.email}`,
      },
    ]);

    console.log(`[Email] Status update email sent for ${orderNumber} → ${statusLabel}`);
  } catch (err) {
    console.error('Error sending status update email:', err);
  }
}
