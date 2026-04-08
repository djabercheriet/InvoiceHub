-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  monthly_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  yearly_price NUMERIC(12, 2),
  is_active BOOLEAN DEFAULT true,
  
  -- Feature limits
  max_invoices INTEGER DEFAULT 0, -- 0 = unlimited
  max_customers INTEGER DEFAULT 0,
  max_products INTEGER DEFAULT 0,
  max_users INTEGER DEFAULT 1,
  
  -- Features - JSON for flexibility
  features JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table (links companies to plans)
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE REFERENCES public.companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trial')),
  
  -- Billing info
  subscription_type TEXT DEFAULT 'monthly' CHECK (subscription_type IN ('monthly', 'yearly')),
  current_period_start DATE NOT NULL DEFAULT CURRENT_DATE,
  current_period_end DATE NOT NULL,
  
  -- Payment tracking
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  
  -- Trial info
  trial_start_date DATE,
  trial_end_date DATE,
  is_trial_active BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscription usage table (track usage against limits)
CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- 'invoices', 'customers', 'products', 'users'
  current_usage INTEGER DEFAULT 0,
  reset_date DATE NOT NULL,
  
  UNIQUE(subscription_id, metric_name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_company ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_subscription ON public.subscription_usage(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (everyone can read active plans)
CREATE POLICY "subscription_plans_select_active" ON public.subscription_plans FOR SELECT 
  USING (is_active = true);
CREATE POLICY "subscription_plans_admin" ON public.subscription_plans FOR ALL 
  USING (auth.jwt() ->> 'email' = ANY(ARRAY['admin@example.com'])); -- Replace with actual admin check

-- RLS Policies for subscriptions (users can see their company's subscription)
CREATE POLICY "subscriptions_select" ON public.subscriptions FOR SELECT 
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
CREATE POLICY "subscriptions_update" ON public.subscriptions FOR UPDATE 
  USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('owner', 'admin')));

-- RLS Policies for subscription_usage
CREATE POLICY "subscription_usage_select" ON public.subscription_usage FOR SELECT 
  USING (subscription_id IN (
    SELECT id FROM public.subscriptions 
    WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  ));

-- Insert default plans
INSERT INTO public.subscription_plans (name, description, monthly_price, yearly_price, max_invoices, max_customers, max_products, max_users, features)
VALUES
  (
    'Free',
    'Perfect for getting started',
    0,
    0,
    10,
    5,
    20,
    1,
    '{"invoices": true, "basic_reports": true}'::jsonb
  ),
  (
    'Pro',
    'For growing businesses',
    29,
    290,
    500,
    500,
    1000,
    5,
    '{"invoices": true, "advanced_reports": true, "api_access": true, "priority_support": true}'::jsonb
  ),
  (
    'Enterprise',
    'For large organizations',
    99,
    990,
    0,
    0,
    0,
    100,
    '{"invoices": true, "advanced_reports": true, "api_access": true, "priority_support": true, "custom_integrations": true, "dedicated_support": true}'::jsonb
  )
ON CONFLICT (name) DO NOTHING;
