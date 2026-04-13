import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { errorResponse, successResponse } from '@/lib/api/utils'

/**
 * POST /api/license/activate
 * Activates a license for a specific device.
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
    console.log(`[POS Activation] Attempting to activate key: "${normalizedKey}" for Device: "${deviceId}"`)

    // Use admin client to bypass RLS for activation logic
    const supabase = createAdminClient()

    // Call the atomic activation RPC
    const { data, error } = await supabase.rpc('activate_pos_license', {
      p_license_key: normalizedKey,
      p_device_id: deviceId,
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

    return successResponse(
      {
        expiry_date: data.expiry_date,
        message: data.message
      },
      'License activated successfully'
    )
  } catch (error: any) {
    console.error('Error in POST /api/license/activate:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
