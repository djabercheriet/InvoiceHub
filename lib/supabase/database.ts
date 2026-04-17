/**
 * Database Service Layer (Shim)
 * Wraps domain services for backward compatibility.
 * NEW CODE SHOULD USE DOMAIN SERVICES DIRECTLY.
 */

import { companyService } from '@/lib/domain/companies/company.service';
import { profileService } from '@/lib/domain/profiles/profile.service';
import { inventoryService } from '@/lib/domain/inventory/inventory.service';
import { customerService } from '@/lib/domain/customers/customer.service';
import { invoiceService } from '@/lib/domain/invoices/invoice.service';
import { analyticsService } from '@/lib/domain/analytics/analytics.service';
import { licensingService } from '@/lib/domain/licensing/licensing.service';

// COMPANIES
export async function getCompanyByUserId(userId: string) {
  try {
    const data = await companyService.getCompanyByUserId(userId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateCompany(companyId: string, updates: any) {
  try {
    const data = await companyService.updateCompany(companyId, updates);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// PROFILES
export async function getProfile(userId: string) {
  try {
    const data = await profileService.getProfile(userId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateProfile(userId: string, updates: any) {
  try {
    const data = await profileService.updateProfile(userId, updates);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// PRODUCTS (INVENTORY)
export async function getProducts(companyId: string) {
  try {
    const data = await inventoryService.getProducts(companyId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getProductById(productId: string) {
  try {
    const data = await inventoryService.getProductById(productId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createProduct(companyId: string, product: any) {
  try {
    const data = await inventoryService.createProduct(companyId, product);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateProduct(productId: string, updates: any) {
  try {
    const data = await inventoryService.updateProduct(productId, updates);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteProduct(productId: string) {
  try {
    await inventoryService.deleteProduct(productId);
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// CATEGORIES
export async function getCategories(companyId: string) {
  try {
    const data = await inventoryService.getCategories(companyId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createCategory(companyId: string, category: any) {
  try {
    const data = await inventoryService.createCategory(companyId, category);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    await inventoryService.deleteCategory(categoryId);
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// CUSTOMERS
export async function getCustomers(companyId: string) {
  try {
    const data = await customerService.getCustomers(companyId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getCustomerById(customerId: string) {
  try {
    const data = await customerService.getCustomerById(customerId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createCustomer(companyId: string, customer: any) {
  try {
    const data = await customerService.createCustomer(companyId, customer);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateCustomer(customerId: string, updates: any) {
  try {
    const data = await customerService.updateCustomer(customerId, updates);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteCustomer(customerId: string) {
  try {
    await customerService.deleteCustomer(customerId);
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// INVOICES
export async function getInvoices(companyId: string) {
  try {
    const data = await invoiceService.getInvoices(companyId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getInvoiceById(invoiceId: string) {
  try {
    const data = await invoiceService.getInvoiceById(invoiceId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createInvoice(companyId: string, userId: string, invoice: any) {
  try {
    const data = await invoiceService.updateInvoice(invoice.id, invoice); // Dummy for compatibility if needed, though createInvoice is what's usually called
    // Actually, createInvoice usually takes just the data.
    // In database.ts it was:
    // const { data, error } = await supabase.from('invoices').insert({...invoice, company_id, created_by: userId}).select().single()
    // Let's use the service:
    const res = await invoiceService.createInvoice(companyId, userId, invoice);
    return { data: res, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateInvoice(invoiceId: string, updates: any) {
  try {
    const data = await invoiceService.updateInvoice(invoiceId, updates);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    await invoiceService.deleteInvoice(invoiceId);
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// INVOICE ITEMS
export async function getInvoiceItems(invoiceId: string) {
  try {
    const data = await invoiceService.getInvoiceItems(invoiceId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createInvoiceItem(invoiceId: string, item: any) {
  try {
    const res = await invoiceService.createInvoiceItems([{ ...item, invoice_id: invoiceId }]);
    return { data: res?.[0], error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function updateInvoiceItem(itemId: string, updates: any) {
  try {
    const data = await invoiceService.updateInvoiceItem(itemId, updates);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function deleteInvoiceItem(itemId: string) {
  try {
    await invoiceService.deleteInvoiceItem(itemId);
    return { error: null };
  } catch (error) {
    return { error };
  }
}

// ANALYTICS
export async function getCompanyStats(companyId: string) {
  try {
    const data = await analyticsService.getSummaryStats(companyId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// SUBSCRIPTIONS
export async function getSubscriptionPlans() {
  try {
    const supabase = await (await import('@/lib/supabase/server')).createClient();
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('monthly_price', { ascending: true });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return { data: null, error };
  }
}

export async function getCompanySubscription(companyId: string) {
  try {
    const data = await companyService.getCompanySubscription(companyId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function createSubscription(companyId: string, planId: string, type: 'monthly' | 'yearly' = 'monthly') {
  try {
    const data = await companyService.createSubscription(companyId, planId, type);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function upgradeSubscription(subscriptionId: string, newPlanId: string) {
  try {
    const data = await companyService.upgradeSubscription(subscriptionId, newPlanId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const data = await companyService.cancelSubscription(subscriptionId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function getSubscriptionUsage(subscriptionId: string) {
  try {
    const data = await companyService.getSubscriptionUsage(subscriptionId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// LICENSING
export async function getLicenseByKey(licenseKey: string) {
  try {
    const data = await licensingService.getLicenseByKey(licenseKey);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

export async function checkActivation(licenseId: string, deviceId: string) {
  try {
    const data = await licensingService.checkActivation(licenseId, deviceId);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}
