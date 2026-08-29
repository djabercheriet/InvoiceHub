import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { errorResponse, successResponse } from '@/lib/api/utils'
import { signEcdsaPayload, signLicensePayload } from '@/lib/license/security'

/**
 * POST /api/license/activate
 * Activates a license for a specific device.
 * Payload: { licenseKey: string, deviceId: string, deviceName?: string, product?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseKey, deviceId, product } = body

    if (!licenseKey || !deviceId) {
      return errorResponse('licenseKey and deviceId are required', 400)
    }

    const normalizedKey = licenseKey.trim().toUpperCase()
    console.log(`[POS Activation] Attempting to activate key: "${normalizedKey}" for Device: "${deviceId}"`)

    // Use admin client to bypass RLS for activation logic
    const supabase = createAdminClient()

    // 1. Fetch license details from database
    const { data: licenseRecord, error: licenseFetchError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', normalizedKey)
      .maybeSingle()

    if (licenseFetchError || !licenseRecord) {
      console.warn(`[POS Activation] Key not found: "${normalizedKey}"`)
      return errorResponse('Invalid license key', 404)
    }

    // Call the atomic activation RPC
    const { data, error } = await supabase.rpc('activate_pos_license', {
      p_license_key: normalizedKey,
      p_device_id: deviceId,
      p_device_name: body.deviceName || null
    })

    if (error) {
      console.error('[POS Activation] RPC Error:', error)
      return errorResponse('Database error during activation', 500)
    }

    if (!data.success) {
      console.warn(`[POS Activation] Failed: ${data.error}`)
      return errorResponse(data.error || 'Activation failed', 400)
    }

    console.log(`[POS Activation] SUCCESS: ${normalizedKey}`)

    const isMizanePos = !product || product === 'MIZANE_POS'

    if (isMizanePos) {
      // MIZANE POS: ECDSA P-256 with nested { signature, payload }
      const signedPayload = {
        licenseId: licenseRecord.id,
        licenseKey: normalizedKey,
        organizationId: licenseRecord.company_id || null,
        product: 'MIZANE_POS',
        edition: licenseRecord.edition || 'Pro',
        features: licenseRecord.features || ['pos', 'inventory', 'analytics', 'reports', 'cloud_sync'],
        deviceId: deviceId,
        isLifetime: !!data.is_lifetime,
        issuedAt: licenseRecord.created_at ? new Date(licenseRecord.created_at).toISOString() : new Date().toISOString(),
        expiresAt: data.expiry_date ? new Date(data.expiry_date).toISOString() : (licenseRecord.expiry_date ? new Date(licenseRecord.expiry_date).toISOString() : null),
        gracePeriodDays: licenseRecord.grace_period_days || 14
      }

      // Sign the payload with ECDSA P-256
      const signature = signEcdsaPayload(signedPayload)

      return successResponse(
        {
          signature,
          payload: signedPayload
        },
        data.message || 'License activated successfully'
      )
    }

    // Legacy products fallback (flat HMAC)
    const legacyResponsePayload = {
      licenseKey: normalizedKey,
      deviceId: deviceId,
      isLifetime: data.is_lifetime,
      expiryDate: data.expiry_date ? new Date(data.expiry_date).toISOString() : null,
      serverTime: new Date().toISOString()
    }

    const legacySignature = signLicensePayload(legacyResponsePayload)

    return successResponse(
      {
        ...legacyResponsePayload,
        signature: legacySignature,
        message: data.message
      },
      'License activated successfully'
    )
  } catch (error: any) {
    console.error('Error in POST /api/license/activate:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}

