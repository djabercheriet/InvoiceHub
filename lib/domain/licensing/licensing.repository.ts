import { createClient } from '@/lib/supabase/server';

export async function getLicenseByKey(licenseKey: string) {
  const supabase = await createClient();
  return await supabase
    .from('licenses')
    .select('*, company:company_id(name)')
    .eq('license_key', licenseKey)
    .single();
}

export async function checkActivation(licenseId: string, deviceId: string) {
  const supabase = await createClient();
  return await supabase
    .from('activations')
    .select('*')
    .eq('license_id', licenseId)
    .eq('device_id', deviceId)
    .maybeSingle();
}
