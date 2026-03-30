/**
 * Database Service Layer
 * Centralized Supabase queries for all data operations
 * This layer ensures consistent error handling and caching strategies
 */

import { createClient } from '@/lib/supabase/server'

// ============================================
// COMPANIES
// ============================================

export async function getCompanyByUserId(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching company:', error)
    return { data: null, error }
  }
}

export async function updateCompany(
  companyId: string,
  updates: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', companyId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating company:', error)
    return { data: null, error }
  }
}

// ============================================
// PROFILES
// ============================================

export async function getProfile(userId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return { data: null, error }
  }
}

export async function updateProfile(
  userId: string,
  updates: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { data: null, error }
  }
}

// ============================================
// PRODUCTS
// ============================================

export async function getProducts(companyId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('company_id', companyId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { data: null, error }
  }
}

export async function getProductById(productId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', productId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { data: null, error }
  }
}

export async function createProduct(companyId: string, product: Record<string, any>) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        company_id: companyId,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating product:', error)
    return { data: null, error }
  }
}

export async function updateProduct(
  productId: string,
  updates: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating product:', error)
    return { data: null, error }
  }
}

export async function deleteProduct(productId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { error }
  }
}

// ============================================
// CATEGORIES
// ============================================

export async function getCategories(companyId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { data: null, error }
  }
}

export async function createCategory(
  companyId: string,
  category: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('categories')
      .insert({
        ...category,
        company_id: companyId,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating category:', error)
    return { data: null, error }
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { error }
  }
}

// ============================================
// CUSTOMERS
// ============================================

export async function getCustomers(companyId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching customers:', error)
    return { data: null, error }
  }
}

export async function getCustomerById(customerId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching customer:', error)
    return { data: null, error }
  }
}

export async function createCustomer(
  companyId: string,
  customer: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('customers')
      .insert({
        ...customer,
        company_id: companyId,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating customer:', error)
    return { data: null, error }
  }
}

export async function updateCustomer(
  customerId: string,
  updates: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', customerId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating customer:', error)
    return { data: null, error }
  }
}

export async function deleteCustomer(customerId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting customer:', error)
    return { error }
  }
}

// ============================================
// INVOICES
// ============================================

export async function getInvoices(companyId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('invoices')
      .select('*, customers(name), profiles(full_name)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return { data: null, error }
  }
}

export async function getInvoiceById(invoiceId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers(name, email, phone, address),
        profiles(full_name),
        invoice_items(*, products(name, sku))
      `)
      .eq('id', invoiceId)
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return { data: null, error }
  }
}

export async function createInvoice(
  companyId: string,
  userId: string,
  invoice: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        ...invoice,
        company_id: companyId,
        created_by: userId,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating invoice:', error)
    return { data: null, error }
  }
}

export async function updateInvoice(
  invoiceId: string,
  updates: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating invoice:', error)
    return { data: null, error }
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', invoiceId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return { error }
  }
}

// ============================================
// INVOICE ITEMS
// ============================================

export async function getInvoiceItems(invoiceId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('invoice_items')
      .select('*, products(name, sku)')
      .eq('invoice_id', invoiceId)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching invoice items:', error)
    return { data: null, error }
  }
}

export async function createInvoiceItem(
  invoiceId: string,
  item: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('invoice_items')
      .insert({
        ...item,
        invoice_id: invoiceId,
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating invoice item:', error)
    return { data: null, error }
  }
}

export async function updateInvoiceItem(
  itemId: string,
  updates: Record<string, any>
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('invoice_items')
      .update(updates)
      .eq('id', itemId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error updating invoice item:', error)
    return { data: null, error }
  }
}

export async function deleteInvoiceItem(itemId: string) {
  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting invoice item:', error)
    return { error }
  }
}

// ============================================
// ANALYTICS/STATS
// ============================================

export async function getCompanyStats(companyId: string) {
  try {
    const supabase = await createClient()

    // Get invoice stats
    const { data: invoiceData, error: invoiceError } = await supabase
      .from('invoices')
      .select('total, status')
      .eq('company_id', companyId)

    if (invoiceError) throw invoiceError

    // Get customer count
    const { count: customerCount, error: customerError } = await supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)

    if (customerError) throw customerError

    // Get product count
    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', companyId)

    if (productError) throw productError

    // Calculate stats
    const totalRevenue = invoiceData?.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0) || 0
    const paidInvoices = invoiceData?.filter((inv: any) => inv.status === 'paid').length || 0
    const totalInvoices = invoiceData?.length || 0

    return {
      data: {
        totalRevenue,
        paidInvoices,
        totalInvoices,
        customerCount: customerCount || 0,
        productCount: productCount || 0,
      },
      error: null,
    }
  } catch (error) {
    console.error('Error fetching company stats:', error)
    return { data: null, error }
  }
}
