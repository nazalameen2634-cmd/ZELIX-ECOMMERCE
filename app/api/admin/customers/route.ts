import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';

export async function GET() {
  try {
    // 1. Fetch all users from the new users table
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, phone, role, created_at')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // 2. Fetch all orders to compute stats
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('email, total, payment_status');

    if (ordersError) throw ordersError;

    // 3. Map orders to users based on email
    const enrichedUsers = (users || []).map(u => {
      const userOrders = (orders || []).filter(o => o.email === u.email);
      // Assume completed/paid orders for total spent
      const paidOrders = userOrders.filter(o => o.payment_status !== 'pending' && o.payment_status !== 'failed');
      
      return {
        ...u,
        orders_count: userOrders.length,
        total_spent: paidOrders.reduce((sum, o) => sum + Number(o.total), 0)
      };
    });

    return NextResponse.json({ success: true, customers: enrichedUsers });
  } catch (error) {
    console.error('Failed to fetch customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, role } = await request.json();

    if (!id || !role) {
      return NextResponse.json({ error: 'Missing id or role' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
