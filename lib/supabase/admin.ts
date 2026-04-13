import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with the service role key.
 * Used for server-side operations that need to bypass RLS.
 * WARNING: This client has full access to the database.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL or Service Role Key is missing')
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ============================================
// ADMIN LICENSING FUNCTIONS
// ============================================

export async function adminRevokeActivation(activationId: string) {
  try {
    const supabase = createAdminClient()
    
    // 1. Get Activation
    const { data: activation, error: getErr } = await supabase
      .from('activations')
      .select('license_id')
      .eq('id', activationId)
      .single()
      
    if (getErr || !activation) throw getErr || new Error('Activation not found')

    // 2. Delete Activation
    const { error: delErr } = await supabase
      .from('activations')
      .delete()
      .eq('id', activationId)
      
    if (delErr) throw delErr

    // 3. Get License
    const { data: license, error: licErr } = await supabase
      .from('licenses')
      .select('used_devices')
      .eq('id', activation.license_id)
      .single()

    if (licErr) throw licErr

    // 4. Decrement (atomicity isn't strictly guaranteed here via separate calls, 
    // but acceptable for admin dashboard usage where concurrency is ~0).
    const { error: updateErr } = await supabase
      .from('licenses')
      .update({ used_devices: Math.max(0, (license?.used_devices || 1) - 1) })
      .eq('id', activation.license_id)

    if (updateErr) throw updateErr

    return { success: true, error: null }
  } catch (error: any) {
    console.error('Error in adminRevokeActivation:', error)
    return { success: false, error: error.message }
  }
}

export async function adminUpdateLicenseStatus(licenseId: string, status: string) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('licenses')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', licenseId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error updating license status:', error)
    return { data: null, error: error.message }
  }
}

export async function adminFetchLicenses() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('licenses')
      .select(`
        *,
        company:company_id(name, email),
        activations(*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error fetching admin licenses:', error)
    return { data: null, error: error.message }
  }
}

export async function adminCreateLicense(payload: any) {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('licenses')
      .insert({
        license_key: payload.license_key,
        max_devices: payload.max_devices || 1,
        company_id: payload.company_id || null,
        expiry_date: payload.expiry_date || null
      })
      .select()
      .single()
      
    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error creating license:', error)
    return { data: null, error: error.message }
  }
}

export async function adminDeleteLicense(licenseId: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('licenses')
      .delete()
      .eq('id', licenseId)
      
    if (error) throw error

    return { success: true, error: null }
  } catch (error: any) {
    console.error('Error in adminDeleteLicense:', error)
    return { success: false, error: error.message }
  }
}

export async function adminFetchTelemetry() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('pos_telemetry')
      .select(`
        *,
        licenses(license_key, company_id)
      `)
      .order('last_sync_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error: any) {
    console.error('Error fetching telemetry:', error)
    return { data: null, error: error.message }
  }
}
