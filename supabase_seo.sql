-- 1. Create SEO Settings Table (Global)
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id bigint PRIMARY KEY,
  meta_title_template text NOT NULL DEFAULT '{Page Title} | {Site Name}',
  default_meta_description text NOT NULL DEFAULT '',
  og_default_image_url text,
  ga_tracking_id text,
  fb_pixel_id text,
  search_console_meta text,
  robots_txt text NOT NULL DEFAULT 'User-agent: *
Allow: /
Sitemap: https://www.zelix.shop/sitemap.xml',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Page SEO Table (Per Page Overrides)
CREATE TABLE IF NOT EXISTS public.page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text UNIQUE NOT NULL,
  meta_title text NOT NULL,
  meta_description text NOT NULL,
  og_image_url text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Insert default global SEO record
INSERT INTO public.seo_settings (id, meta_title_template, default_meta_description, ga_tracking_id, fb_pixel_id)
VALUES (
  1, 
  '{Page Title} | {Site Name}', 
  'Sleek technical activewear and streetwear silhouetted for the post-modern aesthetic. Heavyweight cotton and performance membranes.',
  'G-XXXXXXXXXX',
  '1234567890'
) ON CONFLICT (id) DO NOTHING;

-- 4. Enable RLS (Row Level Security)
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;

-- 5. Create policies to allow public read access
CREATE POLICY "Enable public read access for seo_settings" ON public.seo_settings FOR SELECT USING (true);
CREATE POLICY "Enable public read access for page_seo" ON public.page_seo FOR SELECT USING (true);

-- 6. Create policies to allow admin write access (Assuming you have an auth setup or just allow for now)
CREATE POLICY "Enable insert for authenticated users only" ON public.seo_settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON public.seo_settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.page_seo FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON public.page_seo FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
