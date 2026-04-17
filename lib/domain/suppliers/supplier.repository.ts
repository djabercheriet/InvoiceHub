import { createClient } from '@/lib/supabase/server';
import { Supplier, CreateSupplierData, UpdateSupplierData } from './supplier.types';

export async function getSuppliers(companyId: string) {
  const supabase = await createClient();
  return await supabase
    .from('suppliers')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('name');
}

export async function getSupplierById(supplierId: string) {
  const supabase = await createClient();
  return await supabase
    .from('suppliers')
    .select('*')
    .eq('id', supplierId)
    .single();
}

export async function createSupplier(companyId: string, data: CreateSupplierData) {
  const supabase = await createClient();
  return await supabase
    .from('suppliers')
    .insert({ ...data, company_id: companyId })
    .select()
    .single();
}

export async function updateSupplier(supplierId: string, updates: UpdateSupplierData) {
  const supabase = await createClient();
  return await supabase
    .from('suppliers')
    .update(updates)
    .eq('id', supplierId)
    .select()
    .single();
}

export async function deleteSupplier(supplierId: string) {
  const supabase = await createClient();
  // Soft delete
  return await supabase
    .from('suppliers')
    .update({ is_active: false })
    .eq('id', supplierId);
}
