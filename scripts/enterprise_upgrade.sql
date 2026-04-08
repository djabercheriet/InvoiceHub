-- ########################################################
-- # MASTER ENTERPRISE UPGRADE SCRIPT
-- ########################################################
-- This script ensures all columns and tables for the Bntec Enterprise 
-- SaaS platform are correctly initialized and aligned with the Master PRD.

-- ============================================
-- 1. EXPAND COMPANIES TABLE
-- ============================================
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS tax_id TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS iban TEXT,
ADD COLUMN IF NOT EXISTS swift_code TEXT,
ADD COLUMN IF NOT EXISTS billing_email TEXT;

-- ============================================
-- 2. CREATE SITE IDENTITY & GLOBAL CONFIG
-- ============================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_name TEXT DEFAULT 'Bntec',
    platform_version TEXT DEFAULT '2.1.0-ENTERPRISE',
    site_logo_url TEXT,
    site_favicon_url TEXT,
    meta_title TEXT DEFAULT 'Bntec - Enterprise SaaS',
    meta_description TEXT DEFAULT 'The next-generation protocol for financial intelligence and inventory control.',
    support_email TEXT DEFAULT 'support@bntec.app',
    social_links JSONB DEFAULT '{"twitter": "", "github": "", "linkedin": ""}'::jsonb,
    is_maintenance_mode BOOLEAN DEFAULT false,
    global_currency TEXT DEFAULT 'USD',
    global_tax_rate NUMERIC(10, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial platform settings if empty
INSERT INTO public.platform_settings (id, site_name)
SELECT gen_random_uuid(), 'Bntec'
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

-- ============================================
-- 3. ENSURE SUBSCRIPTION PLANS & TABLES (v2)
-- ============================================
-- Note: Re-creating with IF NOT EXISTS to avoid conflicts with archive/009

CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    monthly_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    yearly_price NUMERIC(12, 2) DEFAULT 0,
    max_invoices INTEGER DEFAULT 0, -- 0 = unlimited
    max_customers INTEGER DEFAULT 0,
    max_products INTEGER DEFAULT 0,
    max_users INTEGER DEFAULT 1,
    features JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Re-seed default plans if missing
INSERT INTO public.subscription_plans (name, description, monthly_price, yearly_price, max_invoices, max_customers, max_products, max_users, features)
VALUES
  ('Free', 'Perfect for individuals', 0, 0, 10, 5, 20, 1, '{"invoices": true}'),
  ('Pro', 'For growing teams', 29, 290, 500, 500, 1000, 5, '{"invoices": true, "advanced_reports": true}'),
  ('Enterprise', 'For large organizations', 99, 990, 0, 0, 0, 100, '{"unlimited": true, "dedicated_support": true}')
ON CONFLICT (name) DO NOTHING;

-- Ensure subscriptions table exists
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trial')),
    subscription_type TEXT DEFAULT 'monthly' CHECK (subscription_type IN ('monthly', 'yearly')),
    current_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
    current_period_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. RLS ENFORCEMENT & PLATFORM SECURITY
-- ============================================
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read site identity
DROP POLICY IF EXISTS "platform_settings_select" ON public.platform_settings;
CREATE POLICY "platform_settings_select" ON public.platform_settings FOR SELECT USING (true);

-- Only Super Admins can manage platform settings
-- (Super Admin check is handled in application layer by email, but we can tighten here if needed)
-- For now, allowing all authed to view, super admin logic in UI

-- Ensure RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subscriptions_select" ON public.subscriptions;
CREATE POLICY "subscriptions_select" ON public.subscriptions 
FOR SELECT USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- ============================================
-- 5. UPGRADE PRODUCTS & INVENTORIES
-- ============================================
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive'));

-- ============================================
-- 6. TRIGGERS: AUTOMATED REVENUE TRACKER
-- ============================================
-- (Will be added in future pass as needed for real-time dashboards)

COMMENT ON TABLE public.platform_settings IS 'Global system settings for site identity and platform behavior.';
COMMENT ON TABLE public.subscription_plans IS 'Available SaaS pricing tiers and their associated limits.';
