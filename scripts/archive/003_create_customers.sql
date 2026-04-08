-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
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

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view customers of their company"
  ON public.customers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = customers.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert customers to their company"
  ON public.customers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update customers of their company"
  ON public.customers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = customers.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete customers of their company"
  ON public.customers
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.companies
      WHERE companies.id = customers.company_id
      AND companies.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_customers_company ON public.customers(company_id);
