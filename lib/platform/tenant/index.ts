/**
 * Tenant Module (PRD V2)
 * Manages the current organization context cleanly.
 */

import { createClient } from "@/lib/supabase/server";

export interface TenantContext {
  id: string;
  name: string;
  plan: string;
  role: string;
}

/**
 * Retrieves the current active tenant (company) for the logged-in user.
 */
export async function getCurrentTenant(): Promise<TenantContext | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Get user profile to find company_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', user.id)
    .single();

  if (!profile || !profile.company_id) return null;

  // Get company details
  const { data: company } = await supabase
    .from('companies')
    .select('id, name')
    .eq('id', profile.company_id)
    .single();

  if (!company) return null;

  // Get subscription tier
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan:subscription_plans(name)')
    .eq('company_id', company.id)
    .single();

  return {
    id: company.id,
    name: company.name,
    plan: (subscription?.plan as any)?.name || 'starter',
    role: profile.role || 'staff'
  };
}
