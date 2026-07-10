import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getAdminSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
};

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const supabase = getAdminSupabase();
    
    const images = payload.images;
    const variants = payload.variants;
    delete payload.images;
    delete payload.variants;

    // 1. Insert product
    const { data: newProd, error: prodError } = await supabase
      .from('products')
      .insert(payload)
      .select('*')
      .single();

    if (prodError) throw new Error(prodError.message);

    // 2. Insert images
    if (images && Array.isArray(images)) {
      const validImages = images.filter(img => img && img.trim() !== '');
      if (validImages.length > 0) {
        const imageRows = validImages.map((url, i) => ({
          product_id: newProd.id,
          image_url: url,
          sort_order: i
        }));
        await supabase.from('product_images').insert(imageRows);
      }
    }

    // 3. Insert variants
    if (variants && Array.isArray(variants) && variants.length > 0) {
      const variantRows = variants.map(v => ({
        ...v,
        product_id: newProd.id
      }));
      await supabase.from('product_variants').insert(variantRows);
    }

    return NextResponse.json({ success: true, data: newProd }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*)');
    if (error) throw error;
    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
