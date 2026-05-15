-- USERS & AUTH
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  company TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- HELPER FOR RLS (To avoid recursion)
-- Using SECURITY DEFINER and setting search_path is key to bypassing RLS safely
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
DECLARE
  current_role TEXT;
BEGIN
  SELECT role INTO current_role FROM public.profiles WHERE id = auth.uid();
  RETURN current_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- KATEGORI
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('artikel', 'layanan', 'portofolio', 'event')),
  description TEXT,
  icon TEXT, 
  color TEXT DEFAULT '#F5C518',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ARTIKEL
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  cover_image TEXT,
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES profiles(id),
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LAYANAN
CREATE TABLE IF NOT EXISTS services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT,
  description TEXT,
  cover_image TEXT,
  price_start DECIMAL(15,2),
  price_type TEXT CHECK (price_type IN ('fixed', 'range', 'custom')),
  duration_estimate TEXT,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  whatsapp_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE,
  location TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PORTFOLIOS
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  video_url TEXT,
  type TEXT DEFAULT 'photo' CHECK (type IN ('photo', 'video')),
  client_name TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USEFUL LINKS (Social/Shortcuts)
CREATE TABLE IF NOT EXISTS useful_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CLIENT LOGOS
CREATE TABLE IF NOT EXISTS client_logos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  logo_url TEXT NOT NULL,
  website_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS & POLICIES (Idempotent)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE useful_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_logos ENABLE ROW LEVEL SECURITY;

-- Utility function to drop policy and recreate safely
DO $$
BEGIN
    -- CLEANUP POTENTIAL RECURSIVE POLICIES
    -- Only drop if the table exists to avoid 42P01 error
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'articles') THEN
        DROP POLICY IF EXISTS "Admins can manage articles" ON articles;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'services') THEN
        DROP POLICY IF EXISTS "Admins can manage services" ON services;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'events') THEN
        DROP POLICY IF EXISTS "Admins can manage events" ON events;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'portfolios') THEN
        DROP POLICY IF EXISTS "Admins can manage portfolios" ON portfolios;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'useful_links') THEN
        DROP POLICY IF EXISTS "Admins can manage useful_links" ON useful_links;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'client_logos') THEN
        DROP POLICY IF EXISTS "Admins can manage client_logos" ON client_logos;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DROP POLICY IF EXISTS "Admin access" ON profiles;
        DROP POLICY IF EXISTS "Admins can manage profiles" ON profiles;
    END IF;

    -- PROFILES (KEEP IT SIMPLE: OWN ACCESS + PUBLIC SELECT)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public profiles are viewable by everyone') THEN
        CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile') THEN
        CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
    END IF;

    -- READ ACCESS FOR ALL TABLES
    PERFORM (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view articles') OR 
    (CREATE POLICY "Anyone can view articles" ON articles FOR SELECT USING (true));
    
    PERFORM (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view categories') OR 
    (CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true));
    
    PERFORM (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view services') OR 
    (CREATE POLICY "Anyone can view services" ON services FOR SELECT USING (true));
    
    PERFORM (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view events') OR 
    (CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true));
    
    PERFORM (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view portfolios') OR 
    (CREATE POLICY "Anyone can view portfolios" ON portfolios FOR SELECT USING (true));
    
    PERFORM (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view useful_links') OR 
    (CREATE POLICY "Anyone can view useful_links" ON useful_links FOR SELECT USING (true));
    
    PERFORM (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view client_logos') OR 
    (CREATE POLICY "Anyone can view client_logos" ON client_logos FOR SELECT USING (true));

    -- ADMIN FULL ACCESS (USING is_admin() function to avoid recursion)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage articles') THEN
        CREATE POLICY "Admins can manage articles" ON articles FOR ALL USING (is_admin());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage services') THEN
        CREATE POLICY "Admins can manage services" ON services FOR ALL USING (is_admin());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage events') THEN
        CREATE POLICY "Admins can manage events" ON events FOR ALL USING (is_admin());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage portfolios') THEN
        CREATE POLICY "Admins can manage portfolios" ON portfolios FOR ALL USING (is_admin());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage useful_links') THEN
        CREATE POLICY "Admins can manage useful_links" ON useful_links FOR ALL USING (is_admin());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage client_logos') THEN
        CREATE POLICY "Admins can manage client_logos" ON client_logos FOR ALL USING (is_admin());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage categories') THEN
        CREATE POLICY "Admins can manage categories" ON categories FOR ALL USING (is_admin());
    END IF;

    -- Note: Removed recursive "Admins can manage profiles" policy on the profiles table itself.
    -- Own-profile policies are sufficient for admins to manage their own records.

END
$$;
