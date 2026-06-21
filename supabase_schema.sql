-- ZELIX Storefront Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables to prevent foreign key and type mismatches on re-run
DROP TABLE IF EXISTS public.media CASCADE;
DROP TABLE IF EXISTS public.wishlist CASCADE;
DROP TABLE IF EXISTS public.hero_slides CASCADE;
DROP TABLE IF EXISTS public.subscribers CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.order_timeline CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.product_variants CASCADE;
DROP TABLE IF EXISTS public.product_option_values CASCADE;
DROP TABLE IF EXISTS public.product_options CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.page_seo CASCADE;
DROP TABLE IF EXISTS public.seo_settings CASCADE;
DROP TABLE IF EXISTS public.site_settings CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Define Enums
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('customer', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'product_status') THEN
        CREATE TYPE product_status AS ENUM ('draft', 'active');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status_enum') THEN
        CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fulfillment_status_enum') THEN
        CREATE TYPE fulfillment_status_enum AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'coupon_type_enum') THEN
        CREATE TYPE coupon_type_enum AS ENUM ('percentage', 'fixed');
    END IF;
END $$;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'customer' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Site Settings Table (One row only)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    site_name TEXT DEFAULT 'ZELIX' NOT NULL,
    tagline TEXT DEFAULT 'Post-Modern Activewear & Streetwear',
    logo_url TEXT,
    logo_inverted_url TEXT,
    favicon_url TEXT,
    contact_email TEXT DEFAULT 'contact@zelix.shop',
    contact_phone TEXT,
    business_address TEXT,
    currency_code TEXT DEFAULT 'INR' NOT NULL,
    currency_symbol TEXT DEFAULT '₹' NOT NULL,
    tax_rate NUMERIC DEFAULT 18.0 NOT NULL, -- percentage
    tax_inclusive BOOLEAN DEFAULT TRUE NOT NULL,
    announcement_bar_active BOOLEAN DEFAULT TRUE NOT NULL,
    announcement_bar_text TEXT DEFAULT 'SUMMER DROP OUT NOW // FREE SHIPPING OVER ₹5000',
    announcement_bar_link TEXT,
    announcement_bar_color TEXT DEFAULT '#000000',
    social_instagram TEXT,
    social_facebook TEXT,
    social_twitter TEXT,
    social_tiktok TEXT,
    social_youtube TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SEO Settings Table (One row only)
CREATE TABLE IF NOT EXISTS public.seo_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    meta_title_template TEXT DEFAULT '{Page Title} | {Site Name}' NOT NULL,
    default_meta_description TEXT DEFAULT 'Sleek technical activewear and streetwear silhouetted for the post-modern aesthetic.' NOT NULL,
    og_default_image_url TEXT,
    ga_tracking_id TEXT,
    fb_pixel_id TEXT,
    search_console_meta TEXT,
    robots_txt TEXT DEFAULT 'User-agent: *' || chr(10) || 'Allow: /' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Page SEO Table
CREATE TABLE IF NOT EXISTS public.page_seo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_slug TEXT UNIQUE NOT NULL,
    meta_title TEXT NOT NULL,
    meta_description TEXT NOT NULL,
    og_image_url TEXT
);

-- 5. Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT, -- Rich text HTML
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    price NUMERIC NOT NULL,
    sale_price NUMERIC CHECK (sale_price < price),
    sale_start TIMESTAMP WITH TIME ZONE,
    sale_end TIMESTAMP WITH TIME ZONE,
    sku TEXT UNIQUE NOT NULL,
    stock_quantity INT DEFAULT 0 NOT NULL,
    track_inventory BOOLEAN DEFAULT TRUE NOT NULL,
    allow_backorders BOOLEAN DEFAULT FALSE NOT NULL,
    status product_status DEFAULT 'draft' NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    og_image_url TEXT,
    tags TEXT[] DEFAULT '{}'::text[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Product Images Table
CREATE TABLE IF NOT EXISTS public.product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    alt_text TEXT
);

-- 8. Product Options Table
CREATE TABLE IF NOT EXISTS public.product_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL, -- "Size", "Color"
    sort_order INT DEFAULT 0 NOT NULL
);

-- 9. Product Option Values Table
CREATE TABLE IF NOT EXISTS public.product_option_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    option_id UUID REFERENCES public.product_options(id) ON DELETE CASCADE NOT NULL,
    value TEXT NOT NULL, -- "XL", "Red"
    sort_order INT DEFAULT 0 NOT NULL
);

-- 10. Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    sku TEXT NOT NULL,
    price NUMERIC, -- Variant price override
    stock_quantity INT DEFAULT 0 NOT NULL,
    option_values JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array of {option_name, value}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Addresses Table
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    zip TEXT NOT NULL,
    country TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 12. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    shipping_address JSONB NOT NULL,
    billing_address JSONB NOT NULL,
    shipping_method TEXT NOT NULL,
    shipping_cost NUMERIC DEFAULT 0.0 NOT NULL,
    subtotal NUMERIC NOT NULL,
    discount_amount NUMERIC DEFAULT 0.0 NOT NULL,
    tax_amount NUMERIC DEFAULT 0.0 NOT NULL,
    total NUMERIC NOT NULL,
    coupon_code TEXT,
    payment_status payment_status_enum DEFAULT 'pending' NOT NULL,
    fulfillment_status fulfillment_status_enum DEFAULT 'pending' NOT NULL,
    razorpay_payment_id TEXT,
    tracking_number TEXT,
    tracking_carrier TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    variant_info JSONB DEFAULT '{}'::jsonb NOT NULL,
    quantity INT CHECK (quantity > 0) NOT NULL,
    unit_price NUMERIC NOT NULL,
    line_total NUMERIC NOT NULL
);

-- 14. Order Timeline Table
CREATE TABLE IF NOT EXISTS public.order_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    note TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    title TEXT,
    body TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    type coupon_type_enum NOT NULL,
    value NUMERIC NOT NULL,
    min_order_amount NUMERIC DEFAULT 0.0 NOT NULL,
    usage_limit INT,
    per_customer_limit INT DEFAULT 1,
    times_used INT DEFAULT 0 NOT NULL,
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    applicable_products UUID[] DEFAULT '{}'::uuid[] NOT NULL,
    applicable_categories UUID[] DEFAULT '{}'::uuid[] NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 17. Subscribers Table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 18. Hero Slides Table
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    heading TEXT NOT NULL,
    subheading TEXT,
    cta_text TEXT DEFAULT 'SHOP NOW' NOT NULL,
    cta_link TEXT DEFAULT '/products' NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- 19. Wishlist Table
CREATE TABLE IF NOT EXISTS public.wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- 20. Media Table
CREATE TABLE IF NOT EXISTS public.media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    filename TEXT NOT NULL,
    size INT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist(user_id);


-- DATABASE TRIGGERS & FUNCTIONS

-- Trigger to auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seo_settings_updated_at BEFORE UPDATE ON public.seo_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-generate order_number sequence
CREATE SEQUENCE IF NOT EXISTS public.orders_order_number_seq START WITH 10001;

CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ORD-' || nextval('public.orders_order_number_seq');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_order_number();

-- Decrement product stock on order item creation (if track_inventory = true)
CREATE OR REPLACE FUNCTION public.decrement_stock_on_order_item()
RETURNS TRIGGER AS $$
DECLARE
    v_track_inventory BOOLEAN;
BEGIN
    -- Check if product tracks inventory
    SELECT track_inventory INTO v_track_inventory FROM public.products WHERE id = NEW.product_id;
    
    IF v_track_inventory = TRUE THEN
        IF NEW.variant_id IS NOT NULL THEN
            UPDATE public.product_variants
            SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
            WHERE id = NEW.variant_id;
        ELSE
            UPDATE public.products
            SET stock_quantity = GREATEST(0, stock_quantity - NEW.quantity)
            WHERE id = NEW.product_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_decrement_stock
    AFTER INSERT ON public.order_items
    FOR EACH ROW
    EXECUTE FUNCTION public.decrement_stock_on_order_item();

-- Recalculate coupon times_used on order creation with coupon
CREATE OR REPLACE FUNCTION public.handle_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.coupon_code IS NOT NULL AND NEW.coupon_code <> '' THEN
        UPDATE public.coupons
        SET times_used = times_used + 1
        WHERE code = NEW.coupon_code;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_handle_coupon
    AFTER INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_coupon_usage();

-- Trigger to automatically create a profile row for new auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url',
        'customer'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY "Allow public select profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow users to update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Allow admins all access to profiles" ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 2. Site Settings Policies
CREATE POLICY "Allow public select site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Allow admins all access to site_settings" ON public.site_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. SEO Settings Policies
CREATE POLICY "Allow public select seo_settings" ON public.seo_settings FOR SELECT USING (true);
CREATE POLICY "Allow admins all access to seo_settings" ON public.seo_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Page SEO Policies
CREATE POLICY "Allow public select page_seo" ON public.page_seo FOR SELECT USING (true);
CREATE POLICY "Allow admins all access to page_seo" ON public.page_seo FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Categories Policies
CREATE POLICY "Allow public select categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow admins all access to categories" ON public.categories FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 6. Products Policies
CREATE POLICY "Allow public select active products" ON public.products FOR SELECT USING (status = 'active' OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Allow admins all access to products" ON public.products FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 7. Product Images Policies
CREATE POLICY "Allow public select product_images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Allow admins all access to product_images" ON public.product_images FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 8. Product Options Policies
CREATE POLICY "Allow public select product_options" ON public.product_options FOR SELECT USING (true);
CREATE POLICY "Allow admins all access to product_options" ON public.product_options FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 9. Product Option Values Policies
CREATE POLICY "Allow public select product_option_values" ON public.product_option_values FOR SELECT USING (true);
CREATE POLICY "Allow admins all access to product_option_values" ON public.product_option_values FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 10. Product Variants Policies
CREATE POLICY "Allow public select product_variants" ON public.product_variants FOR SELECT USING (true);
CREATE POLICY "Allow admins all access to product_variants" ON public.product_variants FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 11. Addresses Policies
CREATE POLICY "Allow users to select own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow users to delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

-- 12. Orders Policies
CREATE POLICY "Allow users to select own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id OR email = (SELECT email FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admins all access to orders" ON public.orders FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 13. Order Items Policies
CREATE POLICY "Allow users to select own order_items" ON public.order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_items.order_id 
        AND (orders.user_id = auth.uid() OR orders.email = (SELECT email FROM public.profiles WHERE id = auth.uid()))
    )
);
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admins all access to order_items" ON public.order_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 14. Order Timeline Policies
CREATE POLICY "Allow users to select own order timeline" ON public.order_timeline FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.orders 
        WHERE orders.id = order_timeline.order_id 
        AND (orders.user_id = auth.uid() OR orders.email = (SELECT email FROM public.profiles WHERE id = auth.uid()))
    )
);
CREATE POLICY "Allow admins all access to order_timeline" ON public.order_timeline FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 15. Reviews Policies
CREATE POLICY "Allow public select reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Allow admins and owners to delete reviews" ON public.reviews FOR DELETE USING (
    auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 16. Coupons Policies
CREATE POLICY "Allow public select active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admins all access to coupons" ON public.coupons FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 17. Subscribers Policies
CREATE POLICY "Allow public insert subscribers" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admins all access to subscribers" ON public.subscribers FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 18. Hero Slides Policies
CREATE POLICY "Allow public select active hero_slides" ON public.hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Allow admins all access to hero_slides" ON public.hero_slides FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 19. Wishlist Policies
CREATE POLICY "Allow users to manage own wishlist" ON public.wishlist FOR ALL USING (auth.uid() = user_id);

-- 20. Media Policies
CREATE POLICY "Allow public select media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Allow authenticated upload media" ON public.media FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "Allow admins all access to media" ON public.media FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Seed Initial site_settings
INSERT INTO public.site_settings (id, site_name, tagline, contact_email, contact_phone, business_address, currency_code, currency_symbol, tax_rate, tax_inclusive)
VALUES (1, 'ZELIX', 'Post-Modern Activewear & Streetwear', 'contact@zelix.shop', '+91 98765 43210', '120 Fashion Avenue, Tech District, India', 'INR', '₹', 18.0, true)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial seo_settings
INSERT INTO public.seo_settings (id, meta_title_template, default_meta_description)
VALUES (1, '{Page Title} | {Site Name}', 'Sleek technical activewear and streetwear silhouetted for the post-modern aesthetic. Heavyweight cotton and performance membranes.')
ON CONFLICT (id) DO NOTHING;
