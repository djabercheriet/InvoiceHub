-- Migration: Add domain column to companies table
-- Reason: Required for professional organization branding and seeding protocols.

ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS domain TEXT;

COMMENT ON COLUMN public.companies.domain IS 'Primary web domain of the organization (e.g., example.io)';
