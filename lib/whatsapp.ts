import { supabaseAdmin } from './supabaseServer';

interface SendWhatsAppParams {
  orderId?: string;
  phoneNumber: string;
  recipientType: 'customer' | 'admin';
  messageType: 'order_confirmation' | 'shipment_update' | 'invoice_ready' | 'admin_alert';
  messageBody: string;
}

export async function sendWhatsAppMessage({
  orderId,
  phoneNumber,
  recipientType,
  messageType,
  messageBody,
}: SendWhatsAppParams) {
  const accessToken = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER || '+919876543210';

  const targetPhoneNumber = recipientType === 'admin' ? adminPhoneNumber : phoneNumber;
  // Meta requires numbers to have country code and NO '+' sign (e.g. '919876543210')
  const cleanPhoneNumber = targetPhoneNumber.replace(/\D/g, '');
  
  let status: 'sent' | 'failed' = 'sent';
  let errorMessage: string | null = null;
  let isSimulated = true;

  if (accessToken && phoneNumberId && accessToken !== 'placeholder' && phoneNumberId !== 'placeholder') {
    isSimulated = false;
    try {
      const response = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhoneNumber,
          type: 'text',
          text: {
            preview_url: true,
            body: messageBody
          }
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        status = 'failed';
        errorMessage = errData.error?.message || response.statusText;
      }
    } catch (e: any) {
      status = 'failed';
      errorMessage = e.message || String(e);
    }
  }

  // Log to database using supabaseAdmin
  try {
    const logData = {
      order_id: orderId || null,
      phone_number: targetPhoneNumber,
      recipient_type: recipientType,
      message_type: messageType,
      message_body: messageBody,
      status: isSimulated ? 'sent' : status,
      error_message: isSimulated ? '(Simulated Mode)' : errorMessage,
      created_at: new Date().toISOString()
    };

    await supabaseAdmin.from('whatsapp_logs').insert(logData);
  } catch (dbErr) {
    console.error('Database logging error for WhatsApp:', dbErr);
  }

  return { success: status === 'sent', simulated: isSimulated, error: errorMessage };
}

// Format date helper
function getEstimatedDeliveryDate(dateStr: string) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 5); // 5 days estimated
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

// 1. Send Order Confirmation
export async function sendOrderConfirmationWhatsApp(order: any, invoiceUrl?: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const customerName = order.shipping_address?.full_name || 'Customer';
  const orderNumber = order.order_number;
  const total = order.total;
  const estDate = getEstimatedDeliveryDate(order.created_at || new Date().toISOString());
  const phone = order.shipping_address?.phone || '';

  const itemsList = order.order_items || [];
  const itemsSummary = itemsList.map((item: any) => `- ${item.title} x ${item.quantity}`).join('\n');

  let body = `*ZELIX ORDER CONFIRMED* 📦\n\n`;
  body += `Hello ${customerName},\n`;
  body += `Your order has been placed successfully!\n\n`;
  body += `*Order ID:* ${orderNumber}\n`;
  body += `*Total Amount:* ₹${total}\n`;
  body += `*Estimated Delivery:* ${estDate}\n\n`;
  body += `*Order Summary:*\n${itemsSummary}\n\n`;
  body += `*Track Order:* ${appUrl}/track/${orderNumber}\n`;
  if (invoiceUrl) {
    body += `*Download Invoice:* ${invoiceUrl}\n`;
  }
  body += `\nThank you for shopping with ZELIX.`;

  return sendWhatsAppMessage({
    orderId: order.id,
    phoneNumber: phone,
    recipientType: 'customer',
    messageType: 'order_confirmation',
    messageBody: body
  });
}

// 2. Send Invoice
export async function sendInvoiceWhatsApp(order: any, invoiceUrl: string) {
  const customerName = order.shipping_address?.full_name || 'Customer';
  const orderNumber = order.order_number;
  const phone = order.shipping_address?.phone || '';

  let body = `*ZELIX INVOICE AVAILABLE* 📄\n\n`;
  body += `Hello ${customerName},\n`;
  body += `The PDF invoice for order ${orderNumber} is now ready.\n\n`;
  body += `*Download link:* ${invoiceUrl}\n\n`;
  body += `Thank you,\nZELIX Support.`;

  return sendWhatsAppMessage({
    orderId: order.id,
    phoneNumber: phone,
    recipientType: 'customer',
    messageType: 'invoice_ready',
    messageBody: body
  });
}

// 3. Send Shipment Updates
export async function sendShipmentUpdateWhatsApp(order: any, oldStatus: string, newStatus: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const customerName = order.shipping_address?.full_name || 'Customer';
  const orderNumber = order.order_number;
  const phone = order.shipping_address?.phone || '';
  const trackingNumber = order.tracking_number || '';
  const trackingCarrier = order.tracking_carrier || '';
  const estDate = getEstimatedDeliveryDate(order.created_at || new Date().toISOString());

  let statusText = newStatus.toUpperCase();
  if (newStatus === 'processing') statusText = 'CONFIRMED & PACKED';
  else if (newStatus === 'shipped') statusText = 'SHIPPED';
  else if (newStatus === 'delivered') statusText = 'DELIVERED';
  else if (newStatus === 'cancelled') statusText = 'CANCELLED';

  let body = `*ZELIX ORDER UPDATE* 🚚\n\n`;
  body += `Hello ${customerName},\n`;
  body += `Your order *${orderNumber}* status has been updated to: *${statusText}*.\n\n`;
  
  if (newStatus === 'shipped' && trackingNumber) {
    body += `*Courier Partner:* ${trackingCarrier || 'Blue Dart/Delhivery'}\n`;
    body += `*Tracking ID:* ${trackingNumber}\n\n`;
  }
  
  body += `*Estimated Delivery:* ${estDate}\n`;
  body += `*Track Order details:* ${appUrl}/track/${orderNumber}\n\n`;
  body += `Thank you for shopping with ZELIX.`;

  return sendWhatsAppMessage({
    orderId: order.id,
    phoneNumber: phone,
    recipientType: 'customer',
    messageType: 'shipment_update',
    messageBody: body
  });
}

// 4. Send Admin Alerts
export async function sendAdminAlertWhatsApp(order: any, alertType: 'new_order' | 'cancellation' | 'return_request') {
  const orderNumber = order.order_number;
  const customerName = order.shipping_address?.full_name || 'Customer';
  const total = order.total;

  let header = '🚨 *NEW ORDER ALERT* 🚨';
  if (alertType === 'cancellation') header = '⚠️ *ORDER CANCELLED* ⚠️';
  else if (alertType === 'return_request') header = '🔄 *RETURN REQUESTED* 🔄';

  let body = `${header}\n\n`;
  body += `*Order ID:* ${orderNumber}\n`;
  body += `*Customer:* ${customerName}\n`;
  body += `*Total Amount:* ₹${total}\n`;
  body += `*Time:* ${new Date().toLocaleString('en-IN')}\n\n`;
  body += `Please review this order in the Zelix Admin Console.`;

  return sendWhatsAppMessage({
    orderId: order.id,
    phoneNumber: '', // Will fallback to ADMIN_PHONE_NUMBER
    recipientType: 'admin',
    messageType: 'admin_alert',
    messageBody: body
  });
}

// 5. Orchestrate Order Success Flow (Generate PDF & Send Notifications)
export async function triggerOrderSuccessFlow(orderIdOrNumber: string) {
  try {
    const queryField = orderIdOrNumber.startsWith('ORD-') ? 'order_number' : 'id';
    
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq(queryField, orderIdOrNumber)
      .maybeSingle();

    if (!order || orderError) {
      console.error('triggerOrderSuccessFlow: Order not found:', orderIdOrNumber, orderError);
      return;
    }

    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    const fullOrder = {
      ...order,
      order_items: items || []
    };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    try {
      await fetch(`${appUrl}/api/orders/${order.id}/invoice/pdf`, { method: 'GET' });
    } catch (pdfErr) {
      console.error('Error pre-generating PDF:', pdfErr);
    }

    const publicInvoiceUrl = `${appUrl}/invoices/${order.order_number}.pdf`;

    await sendOrderConfirmationWhatsApp(fullOrder, publicInvoiceUrl);
    await sendAdminAlertWhatsApp(fullOrder, 'new_order');

  } catch (err) {
    console.error('Error triggering order success flow:', err);
  }
}

