-- Migration: 016_create_pos_sync.sql
-- MIZANE POS Cloud Data Sync Schema (Idempotent, Multi-Terminal Safe, Strictly Monotonic)

-- 1. Store Registry & Multi-Tenant Authorization
CREATE TABLE IF NOT EXISTS public.pos_stores (
    store_id TEXT PRIMARY KEY,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
    created_by_device TEXT NOT NULL,
    store_name TEXT,
    last_cursor BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pos_stores_company ON public.pos_stores(company_id);
CREATE INDEX IF NOT EXISTS idx_pos_stores_license ON public.pos_stores(license_id);

-- 2. Materialized Entity State (Current Snapshot per Store)
CREATE TABLE IF NOT EXISTS public.pos_entities (
    store_id TEXT NOT NULL,
    entity_table TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    client_timestamp BIGINT NOT NULL,
    effective_timestamp BIGINT NOT NULL,
    device_id TEXT NOT NULL,
    client_operation_id TEXT NOT NULL,
    server_timestamp BIGINT NOT NULL,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (store_id, entity_table, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_pos_entities_lookup 
ON public.pos_entities (store_id, entity_table) WHERE is_deleted = false;

-- 3. Append-Only Monotonic Sync Event Log (Delta stream for pull)
CREATE TABLE IF NOT EXISTS public.pos_sync_log (
    seq BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cursor BIGINT NOT NULL,
    store_id TEXT NOT NULL,
    device_id TEXT NOT NULL,
    client_operation_id TEXT NOT NULL,
    entity_table TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE')),
    payload JSONB NOT NULL,
    client_timestamp BIGINT NOT NULL,
    effective_timestamp BIGINT NOT NULL,
    server_timestamp BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index ensuring multi-terminal idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_sync_log_idempotency 
ON public.pos_sync_log (store_id, device_id, client_operation_id);

-- Strict monotonic cursor ordering index per store
CREATE UNIQUE INDEX IF NOT EXISTS idx_pos_sync_log_store_cursor 
ON public.pos_sync_log (store_id, cursor ASC);

-- 4. Atomic Concurrency-Safe Cursor Allocator Function
-- Allocates a contiguous block of p_count cursors for p_store_id using row-level locking
CREATE OR REPLACE FUNCTION allocate_pos_sync_cursors(
    p_store_id TEXT,
    p_count INTEGER
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_start_cursor BIGINT;
BEGIN
    IF p_count <= 0 THEN
        SELECT last_cursor INTO v_start_cursor FROM public.pos_stores WHERE store_id = p_store_id;
        RETURN COALESCE(v_start_cursor, 0);
    END IF;

    -- Row-level lock on pos_stores
    SELECT last_cursor INTO v_start_cursor
    FROM public.pos_stores
    WHERE store_id = p_store_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Store % not found in pos_stores', p_store_id;
    END IF;

    -- Increment cursor block
    UPDATE public.pos_stores
    SET last_cursor = last_cursor + p_count, updated_at = NOW()
    WHERE store_id = p_store_id;

    RETURN v_start_cursor;
END;
$$;

-- 5. Row-Level Security
ALTER TABLE public.pos_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_sync_log ENABLE ROW LEVEL SECURITY;

-- Backend Service-Role only policies (prevent direct anon client tampering)
DROP POLICY IF EXISTS "pos_stores_service_role" ON public.pos_stores;
CREATE POLICY "pos_stores_service_role" ON public.pos_stores FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "pos_entities_service_role" ON public.pos_entities;
CREATE POLICY "pos_entities_service_role" ON public.pos_entities FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "pos_sync_log_service_role" ON public.pos_sync_log;
CREATE POLICY "pos_sync_log_service_role" ON public.pos_sync_log FOR ALL TO service_role USING (true) WITH CHECK (true);
