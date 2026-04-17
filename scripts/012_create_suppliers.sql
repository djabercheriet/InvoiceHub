-- Migration: Create Suppliers Table
-- Phase 3: Inventory Intelligence (idempotent — safe to re-run)

CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view suppliers of their company" ON public.suppliers;
CREATE POLICY "Users can view suppliers of their company"
  ON public.suppliers FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = suppliers.company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert suppliers to their company" ON public.suppliers;
CREATE POLICY "Users can insert suppliers to their company"
  ON public.suppliers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update suppliers of their company" ON public.suppliers;
CREATE POLICY "Users can update suppliers of their company"
  ON public.suppliers FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = suppliers.company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete suppliers of their company" ON public.suppliers;
CREATE POLICY "Users can delete suppliers of their company"
  ON public.suppliers FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = suppliers.company_id AND user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS idx_suppliers_company ON public.suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_name ON public.suppliers(name);

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON public.suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMENT ON TABLE public.suppliers IS 'Vendors and suppliers linked to a company for procurement.';
