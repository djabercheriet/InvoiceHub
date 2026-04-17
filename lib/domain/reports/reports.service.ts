import { createClient } from '@/lib/supabase/client';

export const reportsService = {
  
  async getSalesData(companyId: string, startDate?: string, endDate?: string) {
    const supabase = createClient();
    
    let query = supabase
      .from('invoices')
      .select('id, invoice_number, total, status, issue_date, customers(name)')
      .eq('company_id', companyId);

    if (startDate) query = query.gte('issue_date', startDate);
    if (endDate) query = query.lte('issue_date', endDate);

    const { data: invoices, error } = await query;
    if (error) throw error;

    const paidInvoices = invoices?.filter((i: any) => i.status === 'paid') || [];
    
    // Aggregations
    const totalRevenue = paidInvoices.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0);
    const invoiceCount = invoices?.length || 0;
    const paidCount = paidInvoices.length;

    return {
      invoices: invoices || [],
      totalRevenue,
      invoiceCount,
      paidCount
    };
  },

  async getSalesComparison(companyId: string) {
    const supabase = createClient();
    
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

    const [currentPeriod, lastPeriod] = await Promise.all([
      this.getSalesData(companyId, currentMonthStart, currentMonthEnd),
      this.getSalesData(companyId, lastMonthStart, lastMonthEnd)
    ]);

    const revDiff = currentPeriod.totalRevenue - lastPeriod.totalRevenue;
    const revGrowthPct = lastPeriod.totalRevenue === 0 
      ? (currentPeriod.totalRevenue > 0 ? 100 : 0) 
      : (revDiff / lastPeriod.totalRevenue) * 100;

    return {
      currentRevenue: currentPeriod.totalRevenue,
      lastRevenue: lastPeriod.totalRevenue,
      growthPct: revGrowthPct
    };
  },

  async getInventoryValuation(companyId: string) {
    const supabase = createClient();
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, sku, quantity, unit_price, min_stock_level, categories(name)')
      .eq('company_id', companyId);

    if (error) throw error;

    let totalValuation = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products?.forEach((p: any) => {
      totalValuation += (p.unit_price || 0) * (p.quantity || 0);
      if (p.quantity <= 0) outOfStockCount++;
      else if (p.quantity <= (p.min_stock_level || 0)) lowStockCount++;
    });

    return {
      products: products || [],
      totalValuation,
      totalItems: products?.length || 0,
      lowStockCount,
      outOfStockCount
    };
  }
};
