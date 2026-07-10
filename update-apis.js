const fs = require('fs');
const path = require('path');

// 1. Update PUT endpoint to handle variants and images
const putRoutePath = path.join(__dirname, 'app/api/admin/products/[id]/route.ts');
const putRouteContent = `import { NextResponse } from 'next/server';
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
`;

fs.writeFileSync(putRoutePath, putRouteContent, 'utf8');
console.log('Updated PUT route');

// 2. Update POST endpoint to handle images (variants are already handled partially, but we will consolidate)
const postRoutePath = path.join(__dirname, 'app/api/admin/products/route.ts');
const postRouteContent = `import { NextResponse } from 'next/server';
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
`;
fs.writeFileSync(postRoutePath, postRouteContent, 'utf8');
console.log('Updated POST route');
