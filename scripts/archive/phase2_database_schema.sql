-- Phase 2 Database Schema Upgrade
-- Please run this script in your Supabase SQL Editor to prepare for the new features.

-- ============================================
-- 1. ADD NEW COLUMNS TO PRODUCTS
-- ============================================
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS buy_price NUMERIC(10, 2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================
-- 2. CREATE INVOICE ITEMS TABLE (IF NOT EXISTS)
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 0.00,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: company_id is inferred through the invoice. For Row Level Security (RLS), 
-- it's usually better to have company_id on every table in a multi-tenant app.
ALTER TABLE public.invoice_items ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Add unique constraint to categories for idempotent seeding
ALTER TABLE public.categories ADD CONSTRAINT categories_company_id_name_key UNIQUE (company_id, name);

-- Enable RLS
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Policies for invoice_items
DROP POLICY IF EXISTS "invoice_items_select" ON public.invoice_items;
CREATE POLICY "invoice_items_select" ON public.invoice_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.companies WHERE companies.id = invoice_items.company_id AND companies.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "invoice_items_insert" ON public.invoice_items;
CREATE POLICY "invoice_items_insert" ON public.invoice_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.companies WHERE companies.id = invoice_items.company_id AND companies.user_id = auth.uid()
  ));

-- ============================================
-- 3. CREATE STORAGE BUCKET FOR IMAGES
-- ============================================
-- Make sure the storage schema exists
CREATE SCHEMA IF NOT EXISTS storage;

-- Insert the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow public access to view images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'product-images' );

-- Allow authenticated users to upload images
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
CREATE POLICY "Auth Upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- Allow authenticated users to update their images
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
CREATE POLICY "Auth Update" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );

-- Allow authenticated users to delete their images
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
CREATE POLICY "Auth Delete" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'product-images' AND auth.role() = 'authenticated' );
