-- Patch for Phase 3: Suppliers
-- Adds missing is_active column if the table was created before the column was added to the schema.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'suppliers'
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.suppliers ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;
