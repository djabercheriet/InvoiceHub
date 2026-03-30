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

// ============================================
// SUBSCRIPTIONS
// ============================================

export async function getSubscriptionPlans() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('monthly_price', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return { data: null, error }
  }
}

export async function getCompanySubscription(companyId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
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
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return { data: null, error }
  }
}

export async function createSubscription(
  companyId: string,
  planId: string,
  type: 'monthly' | 'yearly' = 'monthly'
) {
  try {
    const supabase = await createClient()
    
    // Calculate dates
    const startDate = new Date()
    const endDate = new Date()
    if (type === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1)
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1)
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        company_id: companyId,
        plan_id: planId,
        subscription_type: type,
        current_period_start: startDate.toISOString().split('T')[0],
        current_period_end: endDate.toISOString().split('T')[0],
        status: 'trial',
        is_trial_active: true,
        trial_start_date: startDate.toISOString().split('T')[0],
        trial_end_date: new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error creating subscription:', error)
    return { data: null, error }
  }
}

export async function upgradeSubscription(
  subscriptionId: string,
  newPlanId: string
) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        plan_id: newPlanId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error upgrading subscription:', error)
    return { data: null, error }
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscriptionId)
      .select()
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return { data: null, error }
  }
}

export async function getSubscriptionUsage(subscriptionId: string) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('subscription_usage')
      .select('*')
      .eq('subscription_id', subscriptionId)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching subscription usage:', error)
    return { data: null, error }
  }
}
