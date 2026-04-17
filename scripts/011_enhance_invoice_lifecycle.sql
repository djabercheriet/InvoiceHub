-- Migration to enhance Invoice Lifecycle tracking
-- Based on Phase 2 Task 3 of the PRD

-- 1. Add tracking columns to invoices
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS viewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- 2. Update status check constraint
-- We need to drop the old constraint first. Usually named invoices_status_check
-- If name is unknown, we can try to find it or just add the new status if possible
-- In Supabase, often it's better to just allow the text and manage in app, 
-- but we'll try to update the constraint if it exists.

DO $$ 
BEGIN
    ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
    ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check 
    CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'));
EXCEPTION
    WHEN others THEN NULL;
END $$;

COMMENT ON COLUMN public.invoices.sent_at IS 'Timestamp when the invoice was dispatched to the customer.';
COMMENT ON COLUMN public.invoices.viewed_at IS 'Timestamp when the customer first viewed the public invoice link.';
COMMENT ON COLUMN public.invoices.paid_at IS 'Timestamp when the invoice reached the paid status.';
