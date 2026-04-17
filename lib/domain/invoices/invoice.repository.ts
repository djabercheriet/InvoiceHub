import { createClient } from '@/lib/supabase/server';
import { Invoice, InvoiceItem } from './invoice.types';

export async function getInvoices(companyId: string) {
  const supabase = await createClient();
  return await supabase
    .from('invoices')
    .select('*, customers(name), profiles(full_name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
}

export async function getInvoiceById(invoiceId: string) {
  const supabase = await createClient();
  return await supabase
    .from('invoices')
    .select(`
      *,
      customers(name, email, phone, address),
      profiles(full_name),
      invoice_items(*, products(name, sku))
    `)
    .eq('id', invoiceId)
    .single();
}

export async function createInvoice(companyId: string, userId: string, invoice: Partial<Invoice>) {
  const supabase = await createClient();
  return await supabase
    .from('invoices')
    .insert({
      ...invoice,
      company_id: companyId,
      created_by: userId,
    })
    .select()
    .single();
}

export async function updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
  const supabase = await createClient();
  return await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single();
}

export async function deleteInvoice(invoiceId: string) {
  const supabase = await createClient();
  return await supabase
    .from('invoices')
    .delete()
    .eq('id', invoiceId);
}

export async function getInvoiceItems(invoiceId: string) {
  const supabase = await createClient();
  return await supabase
    .from('invoice_items')
    .select('*, products(name, sku)')
    .eq('invoice_id', invoiceId);
}

export async function createInvoiceItems(items: Partial<InvoiceItem>[]) {
  const supabase = await createClient();
  return await supabase
    .from('invoice_items')
    .insert(items);
}

export async function updateInvoiceItem(itemId: string, updates: Partial<InvoiceItem>) {
  const supabase = await createClient();
  return await supabase
    .from('invoice_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();
}

export async function deleteInvoiceItem(itemId: string) {
  const supabase = await createClient();
  return await supabase
    .from('invoice_items')
    .delete()
    .eq('id', itemId);
}

export async function getInvoicesByCustomerId(customerId: string) {
  const supabase = await createClient();
  return await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
}

export async function getInvoiceByToken(token: string) {
  const supabase = await createClient();
  return await supabase
    .from('invoices')
    .select(`
      *,
      customers(name, email, phone, address),
      invoice_items(*, products(name, sku))
    `)
    .eq('public_token', token)
    .single();
}
