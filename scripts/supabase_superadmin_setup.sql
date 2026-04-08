-- Super Admin Full Initialization & Mock Data Wipe
-- Run this in your Supabase SQL Editor

-- 1. Create Super Admin Verification Function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT (auth.jwt() ->> 'email') = 'djabercheriet@gmail.com';
$$;

-- 2. Modify Existing RLS Policies to allow Super Admin bypass
-- (Policies in Postgres are PERMISSIVE by default, so adding a new policy ORs with existing ones)

-- COMPANIES
DROP POLICY IF EXISTS super_admin_all_companies ON companies;
CREATE POLICY super_admin_all_companies ON companies AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- PROFILES
DROP POLICY IF EXISTS super_admin_all_profiles ON profiles;
CREATE POLICY super_admin_all_profiles ON profiles AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- CUSTOMERS
DROP POLICY IF EXISTS super_admin_all_customers ON customers;
CREATE POLICY super_admin_all_customers ON customers AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- PRODUCTS
DROP POLICY IF EXISTS super_admin_all_products ON products;
CREATE POLICY super_admin_all_products ON products AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- CATEGORIES
DROP POLICY IF EXISTS super_admin_all_categories ON categories;
CREATE POLICY super_admin_all_categories ON categories AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- INVOICES
DROP POLICY IF EXISTS super_admin_all_invoices ON invoices;
CREATE POLICY super_admin_all_invoices ON invoices AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- INVOICE ITEMS
DROP POLICY IF EXISTS super_admin_all_invoice_items ON invoice_items;
CREATE POLICY super_admin_all_invoice_items ON invoice_items AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- PAYMENTS
DROP POLICY IF EXISTS super_admin_all_payments ON payments;
CREATE POLICY super_admin_all_payments ON payments AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- STOCK MOVEMENTS
DROP POLICY IF EXISTS super_admin_all_stock_movements ON stock_movements;
CREATE POLICY super_admin_all_stock_movements ON stock_movements AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- SUBSCRIPTIONS
DROP POLICY IF EXISTS super_admin_all_subscriptions ON subscriptions;
CREATE POLICY super_admin_all_subscriptions ON subscriptions AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- PLATFORM SETTINGS
DROP POLICY IF EXISTS super_admin_all_platform_settings ON platform_settings;
CREATE POLICY super_admin_all_platform_settings ON platform_settings AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- SUBSCRIPTION PLANS
DROP POLICY IF EXISTS super_admin_all_subscription_plans ON subscription_plans;
CREATE POLICY super_admin_all_subscription_plans ON subscription_plans AS PERMISSIVE FOR ALL TO public USING (is_super_admin());

-- 3. Wipe current demo data (TRUNCATE removes records but preserves structure)
-- Note: CASCADE will wipe dependent records automatically.
-- This WILL NOT touch Auth users or platform settings!
TRUNCATE 
  invoices, 
  customers, 
  products, 
  categories, 
  payments, 
  stock_movements 
CASCADE;
