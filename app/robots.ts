import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/admin/', '/checkout/'],
    },
    sitemap: 'https://www.zelix.shop/sitemap.xml',
  };
}
