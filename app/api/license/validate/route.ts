import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { errorResponse, successResponse } from '@/lib/api/utils'
import { signLicensePayload } from '@/lib/license/security'

/**
 * POST /api/license/validate
 * Validates that a license is active and the device is registered.
 * Payload: { licenseKey: string, deviceId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseKey, deviceId } = body

    if (!licenseKey || !deviceId) {
      return errorResponse('licenseKey and deviceId are required', 400)
    }

    const normalizedKey = licenseKey.trim().toUpperCase()
    console.log(`[POS Validation] Checking key: "${normalizedKey}" for Device: "${deviceId}"`)

    // Use admin client to check license and activations
    const supabase = createAdminClient()

    // 1. Get license details
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('license_key', normalizedKey)
      .maybeSingle()

    if (licenseError || !license) {
      console.warn(`[POS Validation] Invalid key attempt: "${normalizedKey}"`)
      return errorResponse('Invalid license key', 404)
    }

    // 2. Check status and expiry
    if (license.status !== 'active') {
      return NextResponse.json({
        success: false,
        error: `License is ${license.status}`,
        metadata: { status: license.status, server_time: new Date().toISOString() }
      }, { status: 403 })
    }

    if (license.expiry_date && new Date(license.expiry_date) < new Date()) {
      return errorResponse('License has expired', 400)
    }

    // 3. Check if device is registered
    const { data: activation, error: activationError } = await supabase
      .from('activations')
      .select('id')
      .eq('license_id', license.id)
      .eq('device_id', deviceId)
      .single()

    if (activationError || !activation) {
      return errorResponse('Device not registered for this license', 403)
    }

    const responsePayload = {
      licenseKey: normalizedKey,
      deviceId: deviceId,
      isLifetime: license.is_lifetime,
      expiryDate: license.expiry_date,
      serverTime: new Date().toISOString()
    }

    // Sign the response
    const signature = signLicensePayload(responsePayload)

    return successResponse(
      {
        valid: true,
        ...responsePayload,
        signature,
        status: license.status,
      },
      'License is valid'
    )
  } catch (error: any) {
    console.error('Error in POST /api/license/validate:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
