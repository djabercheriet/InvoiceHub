import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { errorResponse, successResponse } from '@/lib/api/utils'

/**
 * POST /api/license/sync
 * Receives telemetry and heartbeat data from POS clients.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { licenseKey, deviceId, telemetry } = body

    if (!licenseKey || !deviceId || !telemetry) {
      return errorResponse('Missing required sync data', 400)
    }

    const supabase = createAdminClient()

    // 1. Verify license exists and is active
    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('id, status')
      .eq('license_key', licenseKey)
      .single()

    if (licenseError || !license) {
      return errorResponse('Invalid license', 403)
    }

    if (license.status !== 'active') {
      return errorResponse('License ' + license.status, 403)
    }

    // 2. Upsert telemetry data
    const { error: syncError } = await supabase
      .from('pos_telemetry')
      .upsert({
        license_id: license.id,
        device_id: deviceId,
        store_name: telemetry.storeName,
        location: telemetry.location,
        analytics: telemetry.analytics,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'license_id, device_id'
      })

    if (syncError) {
      console.error('[Telemetry Sync] DB Error:', syncError)
      return errorResponse('Failed to sync telemetry', 500)
    }

    // 3. Update activation last_sync
    await supabase
      .from('activations')
      .update({ last_sync: new Date().toISOString(), ip_address: request.headers.get('x-forwarded-for') || 'unknown' })
      .match({ license_id: license.id, device_id: deviceId })

    return successResponse({ synced: true, serverTime: new Date().toISOString() }, 'Sync successful')
  } catch (error: any) {
    console.error('Error in POST /api/license/sync:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
