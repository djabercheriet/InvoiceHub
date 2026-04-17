import { createClient } from '@/lib/supabase/server';

export async function getProducts(companyId: string) {
  const supabase = await createClient();
  return await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
}

export async function getProductById(productId: string) {
  const supabase = await createClient();
  return await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', productId)
    .single();
}

export async function createProduct(companyId: string, product: any) {
  const supabase = await createClient();
  return await supabase
    .from('products')
    .insert({
      ...product,
      company_id: companyId,
    })
    .select()
    .single();
}

export async function updateProduct(productId: string, updates: any) {
  const supabase = await createClient();
  return await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  return await supabase
    .from('products')
    .delete()
    .eq('id', productId);
}

export async function getCategories(companyId: string) {
  const supabase = await createClient();
  return await supabase
    .from('categories')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: true });
}

export async function createCategory(companyId: string, category: any) {
  const supabase = await createClient();
  return await supabase
    .from('categories')
    .insert({
      ...category,
      company_id: companyId,
    })
    .select()
    .single();
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  return await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);
}
