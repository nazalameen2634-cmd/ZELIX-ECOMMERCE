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

export const metadata: Metadata = {
  title: 'ZELIX | Post-Modern Technical Wear',
  description: 'Sleek technical activewear and streetwear silhouetted for the post-modern aesthetic.',
  metadataBase: new URL('http://localhost:3000'),
  openGraph: {
    title: 'ZELIX | Post-Modern Technical Wear',
    description: 'Sleek technical activewear and streetwear silhouetted for the post-modern aesthetic.',
    type: 'website',
  },
};

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

