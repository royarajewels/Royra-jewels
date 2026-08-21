-- ============================================================================
-- ROYRA JEWELS - PRODUCTION SECURE SUPABASE POSTGRESQL SCHEMA
-- STRICT ROLE-BASED AUTHORIZATION & ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
-- Default role is strictly 'customer'. Only promoted users receive 'admin'.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'staff', 'customer')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  product_type TEXT DEFAULT 'Solitaire',
  short_description TEXT,
  description TEXT,
  regular_price NUMERIC(10,2) NOT NULL CHECK (regular_price >= 0),
  sale_price NUMERIC(10,2) CHECK (sale_price >= 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  stock_quantity INTEGER DEFAULT 10 CHECK (stock_quantity >= 0),
  low_stock_alert INTEGER DEFAULT 3 CHECK (low_stock_alert >= 0),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Out of Stock', 'Archived')),
  metal TEXT DEFAULT '18K Solid Gold / 925 Sterling Silver',
  purity TEXT,
  stone_name TEXT DEFAULT 'Certified Gemstone',
  stone_type TEXT,
  weight TEXT,
  finish TEXT DEFAULT '18K High Polish',
  collection TEXT DEFAULT 'everyday',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCT IMAGES TABLE (One-to-Many Relationship with products)
CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  storage_path TEXT,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- ============================================================================
-- 6. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 7. REUSABLE ROLE-BASED ADMIN CHECK FUNCTION
-- Evaluates whether the currently authenticated caller has role = 'admin'
-- ============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public STABLE;

-- 8. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 9. SAFE IDEMPOTENT RLS POLICIES FOR PROFILES
-- ============================================================================
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 10. SAFE IDEMPOTENT RLS POLICIES FOR CATEGORIES
-- ============================================================================
DROP POLICY IF EXISTS "Allow public read active categories" ON public.categories;
DROP POLICY IF EXISTS "Admin insert categories" ON public.categories;
DROP POLICY IF EXISTS "Admin update categories" ON public.categories;
DROP POLICY IF EXISTS "Admin delete categories" ON public.categories;

CREATE POLICY "Allow public read active categories"
  ON public.categories FOR SELECT
  USING (status = 'Active' OR public.is_admin());

CREATE POLICY "Admin insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 11. SAFE IDEMPOTENT RLS POLICIES FOR PRODUCTS
-- ============================================================================
DROP POLICY IF EXISTS "Allow public read active products" ON public.products;
DROP POLICY IF EXISTS "Admin insert products" ON public.products;
DROP POLICY IF EXISTS "Admin update products" ON public.products;
DROP POLICY IF EXISTS "Admin delete products" ON public.products;

CREATE POLICY "Allow public read active products"
  ON public.products FOR SELECT
  USING (status = 'Active' OR public.is_admin());

CREATE POLICY "Admin insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 12. SAFE IDEMPOTENT RLS POLICIES FOR PRODUCT_IMAGES
-- ============================================================================
DROP POLICY IF EXISTS "Allow public read active product images" ON public.product_images;
DROP POLICY IF EXISTS "Admin insert product images" ON public.product_images;
DROP POLICY IF EXISTS "Admin update product images" ON public.product_images;
DROP POLICY IF EXISTS "Admin delete product images" ON public.product_images;

CREATE POLICY "Allow public read active product images"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = product_images.product_id
        AND products.status = 'Active'
    )
    OR public.is_admin()
  );

CREATE POLICY "Admin insert product images"
  ON public.product_images FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin update product images"
  ON public.product_images FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin delete product images"
  ON public.product_images FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================================
-- 13. SUPABASE STORAGE BUCKET & ADMIN-ONLY STORAGE POLICIES
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read storage product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin upload storage product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin update storage product images" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete storage product images" ON storage.objects;

CREATE POLICY "Public read storage product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload storage product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin update storage product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin delete storage product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND public.is_admin());

-- ============================================================================
-- 14. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- All new user signups are assigned role = 'customer' by default.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Royra Customer'),
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 15. ADMIN PROMOTION COMMAND
-- Replace 'YOUR_ADMIN_EMAIL' with your email to grant admin privileges:
-- ============================================================================
-- UPDATE public.profiles
-- SET role = 'admin', updated_at = NOW()
-- WHERE email = 'YOUR_ADMIN_EMAIL';
