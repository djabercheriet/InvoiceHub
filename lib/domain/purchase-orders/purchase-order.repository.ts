import { createClient } from '@/lib/supabase/server';
import { PurchaseOrder, PurchaseOrderItem, CreatePOData, CreatePOItemData } from './purchase-order.types';

export async function getPurchaseOrders(companyId: string) {
  const supabase = await createClient();
  return await supabase
    .from('purchase_orders')
    .select('*, suppliers(name, email, phone)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
}

export async function getPurchaseOrderById(poId: string) {
  const supabase = await createClient();
  return await supabase
    .from('purchase_orders')
    .select(`
      *,
      suppliers(name, email, phone, address),
      purchase_order_items(*, products(name, sku, quantity))
    `)
    .eq('id', poId)
    .single();
}

export async function createPurchaseOrder(companyId: string, userId: string, data: CreatePOData) {
  const supabase = await createClient();
  return await supabase
    .from('purchase_orders')
    .insert({ ...data, company_id: companyId, created_by: userId })
    .select()
    .single();
}

export async function updatePurchaseOrder(poId: string, updates: Partial<PurchaseOrder>) {
  const supabase = await createClient();
  return await supabase
    .from('purchase_orders')
    .update(updates)
    .eq('id', poId)
    .select()
    .single();
}

export async function createPurchaseOrderItems(items: CreatePOItemData[]) {
  const supabase = await createClient();
  return await supabase
    .from('purchase_order_items')
    .insert(items);
}

export async function deletePurchaseOrder(poId: string) {
  const supabase = await createClient();
  return await supabase
    .from('purchase_orders')
    .delete()
    .eq('id', poId);
}
