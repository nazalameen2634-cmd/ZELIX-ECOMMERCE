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
  title: {
    default: 'ZELIX | Post-Modern Technical Wear',
    template: '%s | ZELIX'
  },
  description: 'Sleek technical activewear and streetwear silhouetted for the post-modern aesthetic.',
  metadataBase: new URL('https://www.zelix.shop'),
  keywords: ['ZELIX', 'Streetwear', 'Technical Wear', 'Activewear', 'Fashion', 'Apparel'],
  authors: [{ name: 'ZELIX' }],
  creator: 'ZELIX',
  publisher: 'ZELIX',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'ZELIX | Post-Modern Technical Wear',
    description: 'Sleek technical activewear and streetwear silhouetted for the post-modern aesthetic.',
    url: 'https://www.zelix.shop',
    siteName: 'ZELIX',
    images: [
      {
        url: '/og-image.jpg', // You can add a default OG image later
        width: 1200,
        height: 630,
        alt: 'ZELIX - Post-Modern Technical Wear',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZELIX | Post-Modern Technical Wear',
    description: 'Sleek technical activewear and streetwear silhouetted for the post-modern aesthetic.',
    images: ['/og-image.jpg'], // Update with actual image if needed
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE_HERE', // User can replace this with actual code
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

