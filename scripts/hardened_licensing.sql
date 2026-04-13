-- Hardened Licensing & Telemetry Migration
-- Run this in your Supabase SQL Editor

-- 1. Update Licenses Table
ALTER TABLE public.licenses 
ADD COLUMN IF NOT EXISTS max_devices INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS is_lifetime BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired'));

-- Ensure status check is correct if it already existed
ALTER TABLE public.licenses DROP CONSTRAINT IF EXISTS licenses_status_check;
ALTER TABLE public.licenses ADD CONSTRAINT licenses_status_check CHECK (status IN ('active', 'revoked', 'expired'));

-- 2. Update Activations Table (linked to license)
ALTER TABLE public.activations
ADD COLUMN IF NOT EXISTS device_name TEXT,
ADD COLUMN IF NOT EXISTS last_sync TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- 3. Create POS Telemetry Table for anonymous tracking
CREATE TABLE IF NOT EXISTS public.pos_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID REFERENCES public.licenses(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    store_name TEXT,
    location JSONB, -- { city, country, region }
    analytics JSONB, -- { invoices_count, products_count, version, os_platform }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on Telemetry
ALTER TABLE public.pos_telemetry ENABLE ROW LEVEL SECURITY;

-- Only Admins can view telemetry
CREATE POLICY "pos_telemetry_admin_select" ON public.pos_telemetry 
FOR SELECT USING (auth.role() = 'service_role'); -- backend only

-- 4. Atomic Activation Function (Updated)
CREATE OR REPLACE FUNCTION activate_pos_license(
  p_license_key TEXT,
  p_device_id TEXT,
  p_device_name TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_license_id UUID;
  v_max_dev INTEGER;
  v_curr_dev INTEGER;
  v_is_lifetime BOOLEAN;
  v_expiry TIMESTAMPTZ;
  v_status TEXT;
BEGIN
  -- 1. Find license
  SELECT id, max_devices, is_lifetime, expiry_date, status 
  INTO v_license_id, v_max_dev, v_is_lifetime, v_expiry, v_status
  FROM public.licenses
  WHERE license_key = p_license_key
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid license key');
  END IF;

  -- 2. Check status
  IF v_status != 'active' THEN
    RETURN jsonb_build_object('success', false, 'error', 'License is ' || v_status);
  END IF;

  -- 3. Check expiry (if not lifetime)
  IF NOT v_is_lifetime AND v_expiry < NOW() THEN
    UPDATE public.licenses SET status = 'expired' WHERE id = v_license_id;
    RETURN jsonb_build_object('success', false, 'error', 'License has expired');
  END IF;

  -- 4. Check if device already activated
  IF EXISTS (SELECT 1 FROM public.activations WHERE license_id = v_license_id AND device_id = p_device_id) THEN
    -- Update device info and return success
    UPDATE public.activations 
    SET device_name = p_device_name, last_sync = NOW() 
    WHERE license_id = v_license_id AND device_id = p_device_id;
    
    RETURN jsonb_build_object('success', true, 'is_lifetime', v_is_lifetime, 'expiry_date', v_expiry, 'message', 'Device already activated');
  END IF;

  -- 5. Check device limit
  SELECT COUNT(*) INTO v_curr_dev FROM public.activations WHERE license_id = v_license_id;
  
  IF v_curr_dev >= v_max_dev THEN
    RETURN jsonb_build_object('success', false, 'error', 'Maximum device limit reached (' || v_max_dev || ')');
  END IF;

  -- 6. Activate new device
  INSERT INTO public.activations (license_id, device_id, device_name)
  VALUES (v_license_id, p_device_id, p_device_name);

  RETURN jsonb_build_object(
    'success', true, 
    'is_lifetime', v_is_lifetime, 
    'expiry_date', v_expiry,
    'message', 'Activation successful'
  );
END;
$$;
