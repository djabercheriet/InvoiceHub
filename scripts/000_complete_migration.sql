-- Complete Database Migration for Supabase
-- This is the single source of truth for the database schema
-- Run this migration to properly set up the database from scratch

-- ============================================
-- 1. CREATE TABLES
-- ============================================

-- Drop all tables in correct order (foreign key constraints)
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;

-- Create companies table (for multi-tenant support)
CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  currency TEXT DEFAULT 'USD',
  tax_rate NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name TEXT,
  role TEXT DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'staff')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products/inventory table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT,
  description TEXT,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  cost_price NUMERIC(12, 2) DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customers table
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(12, 2) DEFAULT 0,
  tax_amount NUMERIC(12, 2) DEFAULT 0,
  discount_amount NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invoice_items table
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5, 2) DEFAULT 0,
  total NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_companies_user ON public.companies(user_id);
CREATE INDEX idx_profiles_company ON public.profiles(company_id);
CREATE INDEX idx_categories_company ON public.categories(company_id);
CREATE INDEX idx_products_company ON public.products(company_id);
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_sku ON public.products(sku);
CREATE INDEX idx_customers_company ON public.customers(company_id);
CREATE INDEX idx_invoices_company ON public.invoices(company_id);
CREATE INDEX idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product ON public.invoice_items(product_id);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Profiles policies
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Companies policies
CREATE POLICY "companies_select" ON public.companies FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "companies_update" ON public.companies FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "companies_insert" ON public.companies FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Categories policies
CREATE POLICY "categories_select" ON public.categories FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = categories.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "categories_insert" ON public.categories FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "categories_update" ON public.categories FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = categories.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "categories_delete" ON public.categories FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = categories.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Products policies
CREATE POLICY "products_select" ON public.products FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = products.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "products_insert" ON public.products FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "products_update" ON public.products FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = products.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "products_delete" ON public.products FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = products.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Customers policies
CREATE POLICY "customers_select" ON public.customers FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = customers.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "customers_insert" ON public.customers FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "customers_update" ON public.customers FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = customers.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "customers_delete" ON public.customers FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = customers.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Invoices policies
CREATE POLICY "invoices_select" ON public.invoices FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = invoices.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "invoices_insert" ON public.invoices FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "invoices_update" ON public.invoices FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = invoices.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "invoices_delete" ON public.invoices FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = invoices.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Invoice items policies
CREATE POLICY "invoice_items_select" ON public.invoice_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      JOIN public.companies ON companies.id = invoices.company_id
      WHERE invoices.id = invoice_items.invoice_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_items_insert" ON public.invoice_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices
      JOIN public.companies ON companies.id = invoices.company_id
      WHERE invoices.id = invoice_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_items_update" ON public.invoice_items FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      JOIN public.companies ON companies.id = invoices.company_id
      WHERE invoices.id = invoice_items.invoice_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "invoice_items_delete" ON public.invoice_items FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.invoices
      JOIN public.companies ON companies.id = invoices.company_id
      WHERE invoices.id = invoice_items.invoice_id
      AND companies.user_id = auth.uid()
    )
  );

-- ============================================
-- 5. CREATE TRIGGERS AND FUNCTIONS
-- ============================================

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Function to create company and profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id UUID;
BEGIN
  -- Create a new company for the user
  INSERT INTO public.companies (user_id, name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'company_name', 'My Company'),
    new.email
  )
  RETURNING id INTO new_company_id;

  -- Create the user profile linked to the company
  INSERT INTO public.profiles (id, company_id, full_name, role)
  VALUES (
    new.id,
    new_company_id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    'owner'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- END OF MIGRATION
-- ============================================
