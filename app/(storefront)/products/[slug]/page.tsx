import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types';
import ProductDetails from '@/components/storefront/ProductDetails';

// 1. Enable Incremental Static Regeneration (ISR) revalidating every 60 seconds
export const revalidate = 60;

// 2. Pre-generate static paths for active products
export async function generateStaticParams() {
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug')
      .eq('status', 'active');
      
    return products?.map((p) => ({ slug: p.slug })) || [];
  } catch (err) {
    console.warn('Supabase offline during build path generation. Static fallback.');
    return [];
  }
}

// 3. Dynamic SEO Metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('title, description, og_image_url')
      .eq('slug', params.slug)
      .eq('status', 'active')
      .single();

    if (!product) return {};

    return {
      title: product.title,
      description: product.description?.substring(0, 160) || 'View this product on ZELIX.',
      openGraph: {
        title: product.title,
        description: product.description?.substring(0, 160),
        images: product.og_image_url ? [product.og_image_url] : [],
      },
    };
  } catch {
    return {};
  }
}

// 4. Page component
export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;

  let product: Product | null = null;
  let relatedProducts: Product[] = [];

  try {
    // A. Fetch main product details with joined options, images, and variants
    const { data: prodData } = await supabase
      .from('products')
      .select('*, categories(*), product_images(*), product_options(*), product_variants(*)')
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (prodData) {
      product = prodData as Product;

      if (product.category_id) {
        const { data: relData } = await supabase
          .from('products')
          .select('*, product_images(*)')
          .eq('category_id', product.category_id)
          .eq('status', 'active')
          .neq('id', product.id)
          .limit(4);
        
        if (relData) relatedProducts = relData as Product[];
      }
    }
  } catch (err) {
    console.warn('Supabase fetch failed during SSR. Fallback mock details loaded.');
  }

  // Fallback mocks if Supabase is offline or product not found in DB
  if (!product) {
    const mockCatalog: any[] = [];

    const matchedMock = mockCatalog.find((p) => p.slug === slug);
    if (matchedMock) {
      product = matchedMock as unknown as Product;
      // Setup mock list for references
      relatedProducts = mockCatalog.filter((p) => p.slug !== slug) as unknown as Product[];
    } else {
      // Return 404 if not found in DB nor mocks
      notFound();
    }
  }

  return (
    <ProductDetails
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
