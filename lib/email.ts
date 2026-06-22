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
  const fromEmail = process.env.EMAIL_FROM || 'ZELIX <onboarding@resend.dev>';

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

    const customerHtml = `
      <div style="font-family: monospace, sans-serif; background-color: #000; color: #fff; padding: 40px; max-width: 600px; margin: 0 auto; border: 1px solid #111;">
        <h2 style="font-size: 24px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; border-bottom: 1px solid #222; padding-bottom: 20px; color: #fff;">ZELIX ORDER CONFIRMED</h2>
        <p style="font-size: 13px; color: #aaa; line-height: 1.6;">Hello ${customerName},</p>
        <p style="font-size: 13px; color: #aaa; line-height: 1.6;">Your drop selection has been verified and registered. Your invoice details are listed below:</p>
        
        <table style="width: 100%; font-size: 12px; color: #ccc; margin: 30px 0; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #666;">ORDER ID</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #fff;">${order.order_number}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">TOTAL AMOUNT</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #C9A96E;">INR ${order.total}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #666;">PAYMENT STATUS</td>
            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #00ff00;">${order.payment_status.toUpperCase()}</td>
          </tr>
        </table>

        <div style="background-color: #0a0a0a; border: 1px solid #1a1a1a; padding: 20px; margin-bottom: 30px;">
          <h4 style="margin-top: 0; font-size: 11px; letter-spacing: 1px; color: #fff;">ITEMS PREPARED FOR SHIPMENT</h4>
          <ul style="padding-left: 20px; font-size: 12px; color: #ccc; line-height: 1.8; margin-bottom: 0;">
            ${itemsListHtml}
          </ul>
        </div>

        <p style="text-align: center; margin: 40px 0 20px 0;">
          <a href="${trackingLink}" style="background-color: #fff; color: #000; padding: 14px 28px; text-decoration: none; font-size: 11px; font-weight: bold; letter-spacing: 1.5px; text-transform: uppercase;">TRACK SHIPMENT</a>
        </p>

        <p style="font-size: 10px; color: #444; border-top: 1px solid #222; padding-top: 20px; text-align: center; line-height: 1.5;">
          THANK YOU FOR SHOPPING WITH ZELIX.<br>
          ALL DROP ITEMS ARE LIMITED ARCHIVE SELECTIONS.
        </p>
      </div>
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
