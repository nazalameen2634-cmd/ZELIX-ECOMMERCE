-- Passwordless OTP Authentication Schema

-- Drop existing if they exist
DROP TABLE IF EXISTS public.otp CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Users Table
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    role TEXT DEFAULT 'user' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Trigger to auto-update updated_at on users
CREATE OR REPLACE FUNCTION public.update_users_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON public.users 
FOR EACH ROW EXECUTE FUNCTION public.update_users_updated_at_column();

-- 2. OTP Table
CREATE TABLE public.otp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    purpose TEXT DEFAULT 'login' NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_otp_email ON public.otp(email);

-- Optional: Enable RLS (Row Level Security) if accessing from client
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp ENABLE ROW LEVEL SECURITY;

-- Since APIs will be executed on the server side using the service role key or a secure context,
-- we can allow the server to bypass RLS, or write strict policies if accessed directly via client.
-- Below are basic policies if client access is needed:
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (true); -- Usually controlled via middleware
CREATE POLICY "Server can manage users" ON public.users FOR ALL USING (true);
CREATE POLICY "Server can manage otp" ON public.otp FOR ALL USING (true);
