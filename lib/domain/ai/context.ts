import { getCompanyByUserId } from '../companies/company.repository';
import { analyticsService } from '../analytics/analytics.service';
import { createClient } from '@/lib/supabase/server';

export async function gatherBusinessContext(companyId: string) {
  const supabase = await createClient();

  // 1. Analytics Context
  const kpis = await analyticsService.getSummaryStats(companyId);
  const revenueTrend = await analyticsService.getRevenueTrend(companyId);

  // 2. Inventory Context (Low Stock)
  const { data: allProducts } = await supabase
    .from('products')
    .select('name, sku, quantity, min_stock_level')
    .eq('company_id', companyId);
    
  const lowStockProducts = (allProducts || [])
    .filter(p => p.quantity <= p.min_stock_level)
    .map(p => ({
      name: p.name,
      sku: p.sku,
      deficit: p.min_stock_level - p.quantity,
      currentStock: p.quantity
    }));

  // 3. Overdue Invoices
  const { data: overdueInvoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, base_currency_total, due_date')
    .eq('company_id', companyId)
    .eq('status', 'overdue')
    .order('base_currency_total', { ascending: false })
    .limit(5);

  return {
    kpis,
    recentTrend: revenueTrend.slice(-3), // Last 3 months for context
    lowStockAlerts: lowStockProducts.slice(0, 5),
    overdueInvoices,
    timestamp: new Date().toISOString()
  };
}
