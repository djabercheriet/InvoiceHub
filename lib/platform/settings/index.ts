/**
 * Settings Module (PRD V2)
 * Bridge to fetch platform and tenant-specific configurations dynamically.
 */

import { createClient } from "@/lib/supabase/server";

export interface PlatformSettings {
  site_name: string;
  support_email: string;
  global_currency: string;
  global_tax_rate: number;
}

/**
 * Fetches global platform settings.
 */
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('platform_settings')
    .select('*')
    .single();

  return {
    site_name: data?.site_name || 'Bntec',
    support_email: data?.support_email || 'support@bntec.app',
    global_currency: data?.global_currency || 'USD',
    global_tax_rate: data?.global_tax_rate ?? 0
  };
}

/**
 * Fetches preferences for a specific company/tenant.
 */
export async function getTenantPreferences(companyId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('companies')
    .select('preferences')
    .eq('id', companyId)
    .single();

  return data?.preferences || {};
}
