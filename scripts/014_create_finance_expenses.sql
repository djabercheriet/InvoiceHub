-- Migration: Create Finance Expenses Table
-- Phase 4: Finance Module

CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    category TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view expenses of their company" ON public.expenses;
CREATE POLICY "Users can view expenses of their company"
  ON public.expenses FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = expenses.company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert expenses to their company" ON public.expenses;
CREATE POLICY "Users can insert expenses to their company"
  ON public.expenses FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update expenses of their company" ON public.expenses;
CREATE POLICY "Users can update expenses of their company"
  ON public.expenses FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = expenses.company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete expenses of their company" ON public.expenses;
CREATE POLICY "Users can delete expenses of their company"
  ON public.expenses FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = expenses.company_id AND user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_expenses_company ON public.expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);

-- Triggers
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMENT ON TABLE public.expenses IS 'Tracks company expenses for Profit & Loss calculations.';
