import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { SyncAuthContext } from './types';
import { isValidStoreId } from './validation';

export class SyncAuthError extends Error {
  constructor(public message: string, public status: number = 401) {
    super(message);
    this.name = 'SyncAuthError';
  }
}

/**
 * Authenticates the requesting POS terminal and authorizes its access to storeId.
 * Never trusts client-provided companyId or licenseId.
 */
export async function authenticateSyncRequest(
  request: NextRequest,
  requestedStoreId: string
): Promise<SyncAuthContext> {
  // 1. Validate storeId format
  if (!isValidStoreId(requestedStoreId)) {
    throw new SyncAuthError('Invalid or malformed storeId format', 400);
  }

  // 2. Extract credentials from headers (with body/query fallback)
  let licenseKey = request.headers.get('x-license-key')?.trim();
  let deviceId = request.headers.get('x-device-id')?.trim();

  // If header not found, check Authorization header as Bearer key
  if (!licenseKey) {
    const authHeader = request.headers.get('authorization')?.trim();
    if (authHeader?.startsWith('Bearer ')) {
      licenseKey = authHeader.substring(7).trim();
    }
  }

  // Final check: URL search params (for pull)
  if (!licenseKey || !deviceId) {
    const { searchParams } = new URL(request.url);
    if (!licenseKey) licenseKey = searchParams.get('licenseKey')?.trim();
    if (!deviceId) deviceId = searchParams.get('deviceId')?.trim();
  }

  if (!licenseKey || !deviceId) {
    throw new SyncAuthError('Authentication required: Missing X-License-Key or X-Device-Id header', 401);
  }

  const normalizedKey = licenseKey.toUpperCase();
  const supabase = createAdminClient();

  // 3. Verify License in Database
  const { data: license, error: licenseError } = await supabase
    .from('licenses')
    .select('id, license_key, company_id, status')
    .eq('license_key', normalizedKey)
    .maybeSingle();

  if (licenseError || !license) {
    throw new SyncAuthError('Invalid license key', 401);
  }

  if (license.status !== 'active') {
    throw new SyncAuthError(`License is ${license.status}`, 403);
  }

  // 4. Verify Device Activation for this License
  const { data: activation, error: activationError } = await supabase
    .from('activations')
    .select('id, device_id')
    .eq('license_id', license.id)
    .eq('device_id', deviceId)
    .maybeSingle();

  if (activationError || !activation) {
    throw new SyncAuthError('Device not activated under this license. Activation required.', 403);
  }

  // 5. Store-to-Tenant Authorization Binding
  // Check if store already exists
  const { data: existingStore, error: storeFetchError } = await supabase
    .from('pos_stores')
    .select('store_id, company_id, license_id')
    .eq('store_id', requestedStoreId)
    .maybeSingle();

  if (storeFetchError) {
    console.error('[Sync Auth] Error fetching pos_stores:', storeFetchError);
    throw new SyncAuthError('Internal database error during store authorization', 500);
  }

  if (existingStore) {
    // Enforce tenant boundary:
    // If store is company-bound: license must belong to the same company.
    if (existingStore.company_id && license.company_id) {
      if (existingStore.company_id !== license.company_id) {
        throw new SyncAuthError('Forbidden: store belongs to another organization', 403);
      }
    } else {
      // Direct license binding
      if (existingStore.license_id !== license.id) {
        throw new SyncAuthError('Forbidden: store belongs to another license', 403);
      }
    }
  } else {
    // Store does not exist yet: First-use auto-provisioning for this authenticated tenant
    const { error: insertStoreError } = await supabase
      .from('pos_stores')
      .insert({
        store_id: requestedStoreId,
        company_id: license.company_id || null,
        license_id: license.id,
        created_by_device: deviceId,
        last_cursor: 0
      });

    if (insertStoreError) {
      // Possible race condition if another terminal created it concurrently
      const { data: retryStore } = await supabase
        .from('pos_stores')
        .select('store_id, company_id, license_id')
        .eq('store_id', requestedStoreId)
        .maybeSingle();

      if (!retryStore) {
        console.error('[Sync Auth] Failed to register new store:', insertStoreError);
        throw new SyncAuthError('Failed to initialize store authorization', 500);
      }

      // Check ownership on the concurrently registered store
      if (retryStore.company_id && license.company_id && retryStore.company_id !== license.company_id) {
        throw new SyncAuthError('Forbidden: store belongs to another organization', 403);
      } else if (retryStore.license_id !== license.id) {
        throw new SyncAuthError('Forbidden: store belongs to another license', 403);
      }
    }
  }

  return {
    licenseId: license.id,
    licenseKey: normalizedKey,
    companyId: license.company_id || null,
    deviceId,
    storeId: requestedStoreId
  };
}
