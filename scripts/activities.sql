-- Create activities table for tracking domain events
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    entity_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('invoice', 'quote', 'customer', 'product', 'payment')),
    activity_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Select policy: Users can see activities for their company
DROP POLICY IF EXISTS "activities_select" ON public.activities;
CREATE POLICY "activities_select" ON public.activities 
FOR SELECT USING (
    company_id IN (
        SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_activities_entity ON public.activities(entity_id, entity_type);
CREATE INDEX IF NOT EXISTS idx_activities_company ON public.activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);

COMMENT ON TABLE public.activities IS 'Stores historical logs of domain-level actions for timelines and audit trails.';
