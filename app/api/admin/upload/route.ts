import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const getAdminSupabase = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `public/${fileName}`;
    
    const supabase = getAdminSupabase();

    if (supabase) {
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (!error) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 });
      } else {
        console.warn('Supabase storage upload failed, falling back to local storage:', error.message);
      }
    }

    // Local Fallback
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const localFilePath = path.join(uploadDir, fileName);
    fs.writeFileSync(localFilePath, buffer);
    
    return NextResponse.json({ url: `/uploads/${fileName}` }, { status: 200 });

  } catch (error: any) {
    console.error('Upload catch error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
