import { createClient } from '@/lib/supabase/server';
import { Payment, CreatePaymentInput } from './payment.types';

export async function getPaymentsByInvoice(invoiceId: string) {
  const supabase = await createClient();
  return await supabase
    .from('payments')
    .select('*')
    .eq('invoice_id', invoiceId)
    .order('created_at', { ascending: false });
}

export async function createPayment(payment: any) {
  const supabase = await createClient();
  return await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();
}

export async function getPaymentsByCompany(companyId: string) {
  const supabase = await createClient();
  return await supabase
    .from('payments')
    .select('*, invoices(invoice_number), customers(name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
}
