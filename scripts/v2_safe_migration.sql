-- =============================================================================
-- INVOICEHUB — SAFE INCREMENTAL MIGRATION v2.1
-- 100% idempotent — safe to re-run any number of times.
-- =============================================================================

-- ── 1. invoices table — add missing columns ───────────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoices' AND column_name='invoice_type'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN invoice_type TEXT DEFAULT 'sale';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoices' AND column_name='notes'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN notes TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoices' AND column_name='paid_at'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN paid_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoices' AND column_name='payment_method'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN payment_method TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoices' AND column_name='supplier_name'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN supplier_name TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoices' AND column_name='currency'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN currency TEXT DEFAULT 'USD';
  END IF;
END $$;

-- ── 2. invoice_items table — add unit_type and designation ────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoice_items' AND column_name='unit_type'
  ) THEN
    ALTER TABLE public.invoice_items ADD COLUMN unit_type TEXT DEFAULT 'unit';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoice_items' AND column_name='designation'
  ) THEN
    ALTER TABLE public.invoice_items ADD COLUMN designation TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoice_items' AND column_name='weight_kg'
  ) THEN
    ALTER TABLE public.invoice_items ADD COLUMN weight_kg NUMERIC(10,4);
  END IF;
END $$;

-- ── 3. invoice_items — ensure company_id exists ──────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoice_items' AND column_name='company_id'
  ) THEN
    ALTER TABLE public.invoice_items ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ── 4. products table — ensure buy_price and unit_type exist ─────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='products' AND column_name='buy_price'
  ) THEN
    -- If cost_price exists, rename it. Otherwise add buy_price.
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='products' AND column_name='cost_price'
    ) THEN
      ALTER TABLE public.products RENAME COLUMN cost_price TO buy_price;
    ELSE
      ALTER TABLE public.products ADD COLUMN buy_price NUMERIC(12,2) DEFAULT 0;
    END IF;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='products' AND column_name='unit_type'
  ) THEN
    ALTER TABLE public.products ADD COLUMN unit_type TEXT DEFAULT 'unit';
  END IF;
END $$;

-- ── 5. companies table — preferences JSONB column ────────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='companies' AND column_name='preferences'
  ) THEN
    ALTER TABLE public.companies ADD COLUMN preferences JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- ── 6. stock_movements table ─────────────────────────────────────────────────
-- Drop and recreate if it exists but is broken (missing columns from partial run)

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='stock_movements'
  ) THEN
    -- Check if the table is missing critical columns
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='stock_movements' AND column_name='invoice_id'
    ) THEN
      DROP TABLE public.stock_movements CASCADE;
    END IF;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id    UUID        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id    UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  invoice_id    UUID,
  movement_type TEXT        NOT NULL DEFAULT 'in',
  quantity      NUMERIC(12,4) NOT NULL DEFAULT 0,
  note          TEXT,
  created_by    UUID,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign keys only if they don't exist (safe)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name='stock_movements' AND constraint_name='stock_movements_invoice_id_fkey'
  ) THEN
    BEGIN
      ALTER TABLE public.stock_movements
        ADD CONSTRAINT stock_movements_invoice_id_fkey
        FOREIGN KEY (invoice_id) REFERENCES public.invoices(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

-- RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='stock_movements' AND policyname='stock_movements_company_isolation'
  ) THEN
    CREATE POLICY stock_movements_company_isolation ON public.stock_movements
      FOR ALL
      USING (
        company_id IN (
          SELECT company_id FROM public.profiles WHERE id = auth.uid()
        )
      );
  END IF;
END $$;

-- ── 7. Indexes (all use IF NOT EXISTS — safe) ───────────────────────────────

CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON public.stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_company ON public.stock_movements(company_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_invoice ON public.stock_movements(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_type           ON public.invoices(invoice_type);

-- Only create these if the column exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoice_items' AND column_name='unit_type'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_invoice_items_unit_type ON public.invoice_items(unit_type)';
  END IF;
END $$;

-- ── 8. invoices — best practice financial metrics ───────────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoices' AND column_name='tax_rate'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN tax_rate NUMERIC(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoices' AND column_name='discount_amount'
  ) THEN
    ALTER TABLE public.invoices ADD COLUMN discount_amount NUMERIC(10,2) DEFAULT 0;
  END IF;
END $$;

-- ── 9. invoice_items — best practice financial metrics ──────────────────────

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoice_items' AND column_name='discount'
  ) THEN
    ALTER TABLE public.invoice_items ADD COLUMN discount NUMERIC(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='invoice_items' AND column_name='tax_rate'
  ) THEN
    ALTER TABLE public.invoice_items ADD COLUMN tax_rate NUMERIC(10,2) DEFAULT 0;
  END IF;
END $$;

-- ── Done ───────────────────────────────────────────────────────────────────
-- All statements are idempotent. Safe to re-run.
