import { createClient } from '@/lib/supabase/server';

export async function getCompanyByUserId(userId: string) {
  const supabase = await createClient();
  return await supabase
    .from('companies')
    .select('*')
    .eq('user_id', userId)
    .single();
}

export async function updateCompany(companyId: string, updates: any) {
  const supabase = await createClient();
  return await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId)
    .select()
    .single();
}

export async function getCompanySubscription(companyId: string) {
  const supabase = await createClient();
  return await supabase
    .from('subscriptions')
    .select(`
      id,
      status,
      subscription_type,
      current_period_start,
      current_period_end,
      is_trial_active,
      trial_end_date,
      plan:plan_id (
        id,
        name,
        description,
        monthly_price,
        yearly_price,
        max_invoices,
        max_customers,
        max_products,
        max_users,
        features
      )
    `)
    .eq('company_id', companyId)
    .single();
}

export async function createSubscription(companyId: string, subscription: any) {
  const supabase = await createClient();
  return await supabase
    .from('subscriptions')
    .insert({
      ...subscription,
      company_id: companyId,
    })
    .select()
    .single();
}

export async function upgradeSubscription(subscriptionId: string, newPlanId: string) {
  const supabase = await createClient();
  return await supabase
    .from('subscriptions')
    .update({
      plan_id: newPlanId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single();
}

export async function cancelSubscription(subscriptionId: string) {
  const supabase = await createClient();
  return await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .select()
    .single();
}

export async function getSubscriptionUsage(subscriptionId: string) {
  const supabase = await createClient();
  return await supabase
    .from('subscription_usage')
    .select('*')
    .eq('subscription_id', subscriptionId);
}
