import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { CartProvider } from '@/context/CartContext';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
});

import { createClient } from '@supabase/supabase-js';

export async function generateMetadata(): Promise<Metadata> {
  let title = 'ZELIX GEMS - Where India Finds Timeless Elegance';
  let description = 'Where India Finds Timeless Elegance. Certified diamonds, hallmarked gold & ethically sourced gemstones.';
  let ogImage = '/og-image.jpg';
  let verificationCode = '';

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from('seo_settings').select('*').eq('id', 1).single();
      if (data) {
        if (data.meta_title_template) {
          title = data.meta_title_template.replace('{Site Name}', 'ZELIX').replace('{Page Title} | ', '');
        }
        if (data.default_meta_description) description = data.default_meta_description;
        if (data.og_default_image_url) ogImage = data.og_default_image_url;
        if (data.search_console_meta) {
          // extract the content attribute if it's a full meta tag, or just use it directly
          const match = data.search_console_meta.match(/content="([^"]+)"/);
          verificationCode = match ? match[1] : data.search_console_meta;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to fetch SEO settings');
  }

  return {
    title: {
      default: title,
      template: '%s | ZELIX'
    },
    description: description,
    metadataBase: new URL('https://www.zelix.shop'),
    keywords: ['ZELIX', 'Streetwear', 'Technical Wear', 'Activewear', 'Fashion', 'Apparel'],
    authors: [{ name: 'ZELIX' }],
    creator: 'ZELIX',
    publisher: 'ZELIX',
    formatDetection: { email: false, address: false, telephone: false },
    openGraph: {
      title: title,
      description: description,
      url: 'https://www.zelix.shop',
      siteName: 'ZELIX',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [ogImage],
    },
    verification: {
      google: verificationCode || undefined,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`antialiased bg-background text-foreground selection:bg-accent selection:text-white ${playfair.variable} ${inter.variable} font-sans`}>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

