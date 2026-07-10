import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getAdminSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
};

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const payload = await req.json();
    const supabase = getAdminSupabase();
    
    // Extract images and variants from payload, then delete them from payload so they don't break products update
    const images = payload.images;
    const variants = payload.variants;
    delete payload.images;
    delete payload.variants;

    // 1. Update product
    const { error: prodError } = await supabase
      .from('products')
      .update(payload)
      .eq('id', params.id);

    if (prodError) throw new Error(prodError.message);

    // 2. Update images (delete all and re-insert)
    if (images && Array.isArray(images)) {
      await supabase.from('product_images').delete().eq('product_id', params.id);
      
      const validImages = images.filter(img => img && img.trim() !== '');
      if (validImages.length > 0) {
        const imageRows = validImages.map((url, i) => ({
          product_id: params.id,
          image_url: url,
          sort_order: i
        }));
        await supabase.from('product_images').insert(imageRows);
      }
    }

    // 3. Update variants (delete all and re-insert)
    if (variants && Array.isArray(variants)) {
      await supabase.from('product_variants').delete().eq('product_id', params.id);
      if (variants.length > 0) {
        const variantRows = variants.map(v => ({
          ...v,
          product_id: params.id
        }));
        await supabase.from('product_variants').insert(variantRows);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getAdminSupabase();
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
