import { createClient } from '@/lib/supabase/server';
import { Customer } from './customer.types';

export async function getCustomers(companyId: string) {
  const supabase = await createClient();
  return await supabase
    .from('customers')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
}

export async function getCustomerById(customerId: string) {
  const supabase = await createClient();
  return await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();
}

export async function createCustomer(companyId: string, customer: Partial<Customer>) {
  const supabase = await createClient();
  return await supabase
    .from('customers')
    .insert({
      ...customer,
      company_id: companyId,
    })
    .select()
    .single();
}

export async function updateCustomer(customerId: string, updates: Partial<Customer>) {
  const supabase = await createClient();
  return await supabase
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single();
}

export async function deleteCustomer(customerId: string) {
  const supabase = await createClient();
  return await supabase
    .from('customers')
    .delete()
    .eq('id', customerId);
}

export async function getCustomerByAuthId(authUserId: string) {
  const supabase = await createClient();
  return await supabase
    .from('customers')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();
}

export async function getCustomerByEmail(email: string) {
  const supabase = await createClient();
  return await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .maybeSingle();
}
