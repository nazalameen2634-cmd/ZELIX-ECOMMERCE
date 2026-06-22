import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const queryField = id.startsWith('ORD-') ? 'order_number' : 'id';
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .eq(queryField, id)
      .maybeSingle();

    if (!order || orderError) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { data: items, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('*')
      .eq('order_id', order.id);

    const orderItems = items || [];

    const { data: existingInvoice } = await supabaseAdmin
      .from('invoices')
      .select('*')
      .eq('order_id', order.id)
      .maybeSingle();

    const fileName = `${order.order_number}.pdf`;
    const publicDir = path.join(process.cwd(), 'public', 'invoices');
    const filePath = path.join(publicDir, fileName);
    const pdfUrl = `/invoices/${fileName}`;

    if (existingInvoice && fs.existsSync(filePath)) {
      const fileBuffer = fs.readFileSync(filePath);
      return new Response(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${fileName}"`,
        },
      });
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFont('helvetica', 'normal');

    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('ZELIX', 20, 25);
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('POST-MODERN ACTIVEWEAR & STREETWEAR', 20, 30);
    doc.text('WWW.ZELIX.SHOP | CONTACT@ZELIX.SHOP', 20, 34);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 140, 25);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`INVOICE NO: INV-${order.order_number.replace('ORD-', '')}`, 140, 30);
    doc.text(`ORDER ID: ${order.order_number}`, 140, 34);
    const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    doc.text(`DATE: ${orderDate}`, 140, 38);
    doc.text(`STATUS: ${order.payment_status.toUpperCase()}`, 140, 42);

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(20, 48, 190, 48);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('SHIPPING ADDRESS', 20, 56);
    doc.text('BILLING ADDRESS', 110, 56);

    doc.setFont('helvetica', 'normal');
    const sa = order.shipping_address || {};
    const ba = order.billing_address || {};

    let y = 62;
    doc.text(sa.full_name || '', 20, y);
    doc.text(ba.full_name || '', 110, y);
    y += 4;
    doc.text(sa.address_line1 || '', 20, y);
    doc.text(ba.address_line1 || '', 110, y);
    y += 4;
    if (sa.address_line2 || ba.address_line2) {
      doc.text(sa.address_line2 || '', 20, y);
      doc.text(ba.address_line2 || '', 110, y);
      y += 4;
    }
    doc.text(`${sa.city || ''}, ${sa.state || ''} - ${sa.zip || ''}`, 20, y);
    doc.text(`${ba.city || ''}, ${ba.state || ''} - ${ba.zip || ''}`, 110, y);
    y += 4;
    doc.text(sa.country || '', 20, y);
    doc.text(ba.country || '', 110, y);
    y += 4;
    doc.text(`TEL: ${sa.phone || ''}`, 20, y);
    doc.text(`TEL: ${ba.phone || ''}`, 110, y);

    y += 12;
    doc.setFillColor(0, 0, 0);
    doc.rect(20, y, 170, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('PRODUCT DESCRIPTION', 22, y + 5);
    doc.text('UNIT PRICE', 110, y + 5);
    doc.text('QTY', 145, y + 5);
    doc.text('TOTAL', 165, y + 5);

    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    y += 7;

    orderItems.forEach((item: any) => {
      y += 6;
      doc.setFont('helvetica', 'bold');
      doc.text(item.title, 22, y);

      let variantStr = '';
      if (item.variant_info && Object.keys(item.variant_info).length > 0) {
        variantStr = Object.entries(item.variant_info)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' // ');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 100, 100);
      doc.text(variantStr, 22, y + 4);

      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`INR ${item.unit_price}`, 110, y);
      doc.text(String(item.quantity), 147, y);
      doc.text(`INR ${item.line_total}`, 165, y);

      y += 6;
      doc.setDrawColor(230);
      doc.setLineWidth(0.1);
      doc.line(20, y, 190, y);
    });

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text('SUBTOTAL', 110, y);
    doc.text(`INR ${order.subtotal}`, 165, y);

    if (order.discount_amount > 0) {
      y += 5;
      doc.text(`DISCOUNT (${order.coupon_code || ''})`, 110, y);
      doc.text(`-INR ${order.discount_amount}`, 165, y);
    }

    y += 5;
    doc.text('TAX (18% GST INCL)', 110, y);
    doc.text(`INR ${order.tax_amount}`, 165, y);

    y += 5;
    doc.text('SHIPPING COST', 110, y);
    doc.text(`INR ${order.shipping_cost}`, 165, y);

    y += 6;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(110, y - 2, 190, y - 2);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT', 110, y);
    doc.text(`INR ${order.total}`, 165, y);

    y = 265;
    doc.setDrawColor(200);
    doc.setLineWidth(0.2);
    doc.line(20, y, 190, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 120, 120);
    doc.text('THANK YOU FOR PATRONIZING ZELIX. ALL SALES ON DESIGN LAB ARTIFACTS ARE REGISTERED.', 20, y + 5);
    doc.text(`INVOICE GENERATED SYSTEMATICALLY ON ${new Date().toISOString()}`, 20, y + 9);

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    fs.writeFileSync(filePath, pdfBuffer);

    if (!existingInvoice) {
      const { error: insertError } = await supabaseAdmin
        .from('invoices')
        .insert({
          order_id: order.id,
          invoice_number: `INV-${order.order_number.replace('ORD-', '')}`,
          pdf_url: pdfUrl,
        });
      if (insertError) {
        console.error('Failed to insert invoice record:', insertError);
      }
    }

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileName}"`,
      },
    });

  } catch (error: any) {
    console.error('Error generating PDF invoice:', error);
    return NextResponse.json({ error: error.message || 'Server error generating invoice' }, { status: 500 });
  }
}
