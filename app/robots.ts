import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let allow = '/';
  let disallow = ['/admin/', '/api/admin/', '/checkout/'];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from('seo_settings').select('robots_txt').eq('id', 1).single();
      if (data && data.robots_txt) {
        // Simple parse to extract Allow/Disallow
        const lines = data.robots_txt.split('\n');
        disallow = [];
        lines.forEach((line: string) => {
          if (line.toLowerCase().startsWith('disallow:')) {
            disallow.push(line.split(':')[1].trim());
          }
          if (line.toLowerCase().startsWith('allow:')) {
            allow = line.split(':')[1].trim();
          }
        });
      }
    }
  } catch (err) {
    console.warn('Failed to fetch robots.txt settings');
  }

  return {
    rules: {
      userAgent: '*',
      allow: allow,
      disallow: disallow,
    },
    sitemap: 'https://www.zelix.shop/sitemap.xml',
  };
}
