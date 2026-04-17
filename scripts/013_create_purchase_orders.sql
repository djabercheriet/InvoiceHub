-- Migration: Create Purchase Orders & Items Tables
-- Phase 3: Inventory Intelligence (idempotent — safe to re-run)

CREATE TABLE IF NOT EXISTS public.purchase_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    po_number TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ordered', 'received', 'cancelled')),
    total NUMERIC(12, 2) DEFAULT 0,
    expected_date DATE,
    received_at TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total NUMERIC(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- Purchase Orders Policies
DROP POLICY IF EXISTS "Users can view purchase orders of their company" ON public.purchase_orders;
CREATE POLICY "Users can view purchase orders of their company"
  ON public.purchase_orders FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = purchase_orders.company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can insert purchase orders to their company" ON public.purchase_orders;
CREATE POLICY "Users can insert purchase orders to their company"
  ON public.purchase_orders FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.companies WHERE id = company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update purchase orders of their company" ON public.purchase_orders;
CREATE POLICY "Users can update purchase orders of their company"
  ON public.purchase_orders FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = purchase_orders.company_id AND user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can delete purchase orders of their company" ON public.purchase_orders;
CREATE POLICY "Users can delete purchase orders of their company"
  ON public.purchase_orders FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.companies WHERE id = purchase_orders.company_id AND user_id = auth.uid()));

-- PO Items Policies
DROP POLICY IF EXISTS "Users can view PO items of their company" ON public.purchase_order_items;
CREATE POLICY "Users can view PO items of their company"
  ON public.purchase_order_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.purchase_orders
    JOIN public.companies ON companies.id = purchase_orders.company_id
    WHERE purchase_orders.id = purchase_order_items.purchase_order_id
    AND companies.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert PO items to their company" ON public.purchase_order_items;
CREATE POLICY "Users can insert PO items to their company"
  ON public.purchase_order_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.purchase_orders
    JOIN public.companies ON companies.id = purchase_orders.company_id
    WHERE purchase_orders.id = purchase_order_id
    AND companies.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchase_orders_company ON public.purchase_orders(company_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_po_items_order ON public.purchase_order_items(purchase_order_id);

-- Triggers
DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON public.purchase_orders;
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON public.purchase_orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMENT ON TABLE public.purchase_orders IS 'Procurement orders sent to suppliers. Receiving a PO auto-increments stock.';
COMMENT ON TABLE public.purchase_order_items IS 'Line items for a purchase order.';
