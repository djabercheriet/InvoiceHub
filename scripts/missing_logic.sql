-- Incremental Database Fine-Tuning
-- Run this script in your Supabase SQL Editor.

-- ============================================
-- 1. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user signup
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
  -- Automatically assign 'super_admin' if email matches NEXT_PUBLIC_SUPER_ADMIN_EMAIL
  INSERT INTO public.profiles (id, company_id, full_name, role)
  VALUES (
    new.id,
    new_company_id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    CASE 
      WHEN new.email = 'djabercheriet@gmail.com' THEN 'super_admin'
      ELSE 'owner'
    END
  )
  ON CONFLICT (id) DO NOTHING;

  -- Additionally populate the `users` table for legacy compatibility
  INSERT INTO public.users (id, company_id, email, full_name, role)
  VALUES (
    new.id,
    new_company_id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    CASE 
      WHEN new.email = 'djabercheriet@gmail.com' THEN 'super_admin'
      ELSE 'admin'
    END
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function for incrementing usage (used by authorization checks)
CREATE OR REPLACE FUNCTION increment_usage(
  p_subscription_id UUID,
  p_metric_name TEXT,
  p_amount INTEGER DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.subscription_usage (subscription_id, metric_name, current_usage, reset_date)
  VALUES (p_subscription_id, p_metric_name, p_amount, CURRENT_DATE + INTERVAL '1 month')
  ON CONFLICT (subscription_id, metric_name) 
  DO UPDATE SET current_usage = public.subscription_usage.current_usage + p_amount;
END;
$$;

-- ============================================
-- 2. SEED DEFAULT PLANS
-- ============================================

INSERT INTO public.subscription_plans (name, description, monthly_price, yearly_price, max_invoices, max_customers, max_products, max_users, features)
VALUES
  ('Free', 'Perfect for getting started', 0, 0, 10, 5, 20, 1, '{"invoices": true, "basic_reports": true}'),
  ('Pro', 'For growing businesses', 29, 290, 500, 500, 1000, 5, '{"invoices": true, "advanced_reports": true, "api_access": true, "priority_support": true}'),
  ('Enterprise', 'For large organizations', 99, 990, 0, 0, 0, 100, '{"invoices": true, "advanced_reports": true, "api_access": true, "priority_support": true, "custom_integrations": true, "dedicated_support": true}')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 3. ENABLE RLS & POLICIES (MISSING TABLES)
-- ============================================

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "payments_select" ON public.payments;
DROP POLICY IF EXISTS "stock_movements_select" ON public.stock_movements;
DROP POLICY IF EXISTS "clients_select" ON public.clients;
DROP POLICY IF EXISTS "suppliers_select" ON public.suppliers;

CREATE POLICY "payments_select" ON public.payments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.invoices JOIN public.companies ON companies.id = invoices.company_id 
    WHERE invoices.id = payments.invoice_id AND companies.user_id = auth.uid()
  ));

CREATE POLICY "stock_movements_select" ON public.stock_movements FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.companies WHERE companies.id = stock_movements.company_id AND companies.user_id = auth.uid()
  ));

CREATE POLICY "clients_select" ON public.clients FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.companies WHERE companies.id = clients.company_id AND companies.user_id = auth.uid()
  ));

CREATE POLICY "suppliers_select" ON public.suppliers FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.companies WHERE companies.id = suppliers.company_id AND companies.user_id = auth.uid()
  ));
-- ============================================
-- 4. DEMO SEED DATA (OPTIONAL)
-- ============================================

-- This section adds sample data for a 'Demo Org' to help you visualize the dashboard.
-- It will attempt to find the first company in the database to attach data to.

DO $$
DECLARE
    target_company_id UUID;
    cat_electronics_id UUID;
    cat_services_id UUID;
BEGIN
    -- 1. Find a company to attach demo data to (or use the one created by handle_new_user)
    SELECT id INTO target_company_id FROM public.companies LIMIT 1;

    IF target_company_id IS NOT NULL THEN
        -- 2. Seed Categories
        INSERT INTO public.categories (company_id, name, description)
        VALUES 
            (target_company_id, 'Electronics', 'Hardware and gadgets'),
            (target_company_id, 'Professional Services', 'Consulting and technical work')
        ON CONFLICT DO NOTHING;

        SELECT id INTO cat_electronics_id FROM public.categories WHERE name = 'Electronics' AND company_id = target_company_id LIMIT 1;
        SELECT id INTO cat_services_id FROM public.categories WHERE name = 'Professional Services' AND company_id = target_company_id LIMIT 1;

        -- 3. Seed Products
        INSERT INTO public.products (company_id, category_id, name, sku, unit_price, quantity, min_stock_level)
        VALUES 
            (target_company_id, cat_electronics_id, 'MacBook Pro M3', 'MBP-M3-001', 2499.00, 15, 5),
            (target_company_id, cat_electronics_id, 'Dell UltraSharp 27"', 'DELL-U27-005', 599.00, 3, 5), -- Low stock alert trigger
            (target_company_id, cat_services_id, 'Cloud Migration Service', 'SRV-CLOUD-01', 5000.00, 1, 0)
        ON CONFLICT DO NOTHING;

        -- 4. Seed Customers
        INSERT INTO public.customers (company_id, name, email, phone, address)
        VALUES 
            (target_company_id, 'TechCorp Solutions', 'billing@techcorp.com', '+1-555-0100', '123 Innovation Drive, SF'),
            (target_company_id, 'Global Logistics Inc', 'finance@globallog.com', '+1-555-0200', '789 Supply Chain Way, NY')
        ON CONFLICT DO NOTHING;

        -- 5. Seed Invoices (Sample data for the dashboard charts)
        -- Note: In a real app, you'd insert line items too
        INSERT INTO public.invoices (company_id, customer_id, invoice_number, total, status, issue_date, due_date)
        SELECT 
            target_company_id, 
            (SELECT id FROM public.customers WHERE company_id = target_company_id LIMIT 1),
            'INV-2024-001',
            3098.00,
            'paid',
            CURRENT_DATE - INTERVAL '30 days',
            CURRENT_DATE - INTERVAL '15 days'
        WHERE NOT EXISTS (SELECT 1 FROM public.invoices WHERE invoice_number = 'INV-2024-001');

        INSERT INTO public.invoices (company_id, customer_id, invoice_number, total, status, issue_date, due_date)
        SELECT 
            target_company_id, 
            (SELECT id FROM public.customers WHERE company_id = target_company_id LIMIT 1),
            'INV-2024-002',
            599.00,
            'draft',
            CURRENT_DATE - INTERVAL '5 days',
            CURRENT_DATE + INTERVAL '10 days'
        WHERE NOT EXISTS (SELECT 1 FROM public.invoices WHERE invoice_number = 'INV-2024-002');
    END IF;
END $$;
