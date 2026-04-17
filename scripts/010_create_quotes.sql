-- Migration to create Quotes and Quote Items
-- Following the structural pattern of Invoices

-- 1. Create Quotes table
CREATE TABLE IF NOT EXISTS public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    quote_number TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired', 'converted')),
    issue_date DATE DEFAULT CURRENT_DATE,
    valid_until DATE,
    subtotal NUMERIC(12, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Quote Items table
CREATE TABLE IF NOT EXISTS public.quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- 4. Quotes Policies (Multi-tenant)
CREATE POLICY "Users can view quotes of their company"
  ON public.quotes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = quotes.company_id AND user_id = auth.uid()));

CREATE POLICY "Users can insert quotes to their company"
  ON public.quotes FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid()));

CREATE POLICY "Users can update quotes of their company"
  ON public.quotes FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = quotes.company_id AND user_id = auth.uid()));

CREATE POLICY "Users can delete quotes of their company"
  ON public.quotes FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = quotes.company_id AND user_id = auth.uid()));

-- 5. Quote Items Policies
CREATE POLICY "Users can view quote items of their quotes"
  ON public.quote_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.quotes JOIN public.companies ON companies.id = quotes.company_id 
                 WHERE quotes.id = quote_items.quote_id AND companies.user_id = auth.uid()));

CREATE POLICY "Users can insert quote items to their quotes"
  ON public.quote_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.quotes JOIN public.companies ON companies.id = quotes.company_id 
                      WHERE quotes.id = quote_id AND companies.user_id = auth.uid()));

-- 6. Indexes
CREATE INDEX IF NOT EXISTS idx_quotes_company ON public.quotes(company_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer ON public.quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_number ON public.quotes(quote_number);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote ON public.quote_items(quote_id);

-- 7. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMENT ON TABLE public.quotes IS 'Stores sales quotes that can be converted to invoices.';
COMMENT ON TABLE public.quote_items IS 'Line items associated with a specific quote.';
