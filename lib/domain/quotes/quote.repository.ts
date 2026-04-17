import { createClient } from '@/lib/supabase/server';
import { Quote, QuoteItem, CreateQuoteData, UpdateQuoteData } from './quote.types';

export async function getQuotes(companyId: string) {
  const supabase = await createClient();
  return await supabase
    .from('quotes')
    .select('*, customers(name), profiles(full_name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });
}

export async function getQuoteById(quoteId: string) {
  const supabase = await createClient();
  return await supabase
    .from('quotes')
    .select(`
      *,
      customers(name, email, phone, address),
      profiles(full_name),
      quote_items(*, products(name, sku))
    `)
    .eq('id', quoteId)
    .single();
}

export async function createQuote(companyId: string, userId: string, quote: CreateQuoteData) {
  const supabase = await createClient();
  return await supabase
    .from('quotes')
    .insert({
      ...quote,
      company_id: companyId,
      created_by: userId,
    })
    .select()
    .single();
}

export async function updateQuote(quoteId: string, updates: UpdateQuoteData) {
  const supabase = await createClient();
  return await supabase
    .from('quotes')
    .update(updates)
    .eq('id', quoteId)
    .select()
    .single();
}

export async function deleteQuote(quoteId: string) {
  const supabase = await createClient();
  return await supabase
    .from('quotes')
    .delete()
    .eq('id', quoteId);
}

export async function getQuoteItems(quoteId: string) {
  const supabase = await createClient();
  return await supabase
    .from('quote_items')
    .select('*, products(name, sku)')
    .eq('quote_id', quoteId);
}

export async function createQuoteItems(items: Partial<QuoteItem>[]) {
  const supabase = await createClient();
  return await supabase
    .from('quote_items')
    .insert(items);
}

export async function updateQuoteItem(itemId: string, updates: Partial<QuoteItem>) {
  const supabase = await createClient();
  return await supabase
    .from('quote_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single();
}

export async function deleteQuoteItem(itemId: string) {
  const supabase = await createClient();
  return await supabase
    .from('quote_items')
    .delete()
    .eq('id', itemId);
}
