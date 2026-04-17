import * as analyticsRepository from './analytics.repository';
import { withCache } from '@/lib/cache';

export const analyticsService = {
  async getSummaryStats(companyId: string) {
    return withCache(`analytics:summary:${companyId}`, async () => {
      const { data } = await analyticsRepository.getSummaryStats(companyId);
      
      // Transform array to object
      const stats: Record<string, number> = {};
      data?.forEach(row => {
        stats[row.metric_name] = Number(row.metric_value);
      });
      
      return stats;
    }, 900); // 15 minute cache
  },

  async getRevenueTrend(companyId: string) {
    return withCache(`analytics:trend:${companyId}`, async () => {
      const { data: billed } = await analyticsRepository.getKpiSeries(companyId, 'billed_revenue');
      const { data: received } = await analyticsRepository.getKpiSeries(companyId, 'received_revenue');
      
      // Merge for Recharts
      const trend = billed?.map((b, i) => ({
        date: new Date(b.period_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
        billed: Number(b.metric_value),
        received: Number(received?.[i]?.metric_value || 0)
      }));
      
      return trend || [];
    }, 900); // 15 minute cache
  },

  /**
   * Recalculates all snapshots for a company.
   * Usually triggered by a background job.
   */
  async syncCompanyStats(companyId: string) {
    const invoices = await analyticsRepository.getRawRevenueStats(companyId);
    
    let billedTotal = 0;
    let receivedTotal = 0;
    
    const monthlyStats: Record<string, { billed: number; received: number }> = {};

    invoices.forEach(inv => {
      billedTotal += Number(inv.base_currency_total);
      if (inv.status === 'paid') {
        receivedTotal += Number(inv.base_currency_total);
      }

      // Group by month
      const monthKey = inv.issue_date.substring(0, 7) + '-01'; // YYYY-MM-01
      if (!monthlyStats[monthKey]) monthlyStats[monthKey] = { billed: 0, received: 0 };
      
      monthlyStats[monthKey].billed += Number(inv.base_currency_total);
      
      if (inv.paid_at) {
        const paidMonthKey = inv.paid_at.substring(0, 7) + '-01';
        if (!monthlyStats[paidMonthKey]) monthlyStats[paidMonthKey] = { billed: 0, received: 0 };
        monthlyStats[paidMonthKey].received += Number(inv.base_currency_total);
      }
    });

    // 1. Update All-Time Stats
    await analyticsRepository.upsertKpiSnapshot({
      company_id: companyId,
      metric_name: 'billed_revenue',
      metric_value: billedTotal,
      group_period: 'all_time'
    });

    await analyticsRepository.upsertKpiSnapshot({
      company_id: companyId,
      metric_name: 'received_revenue',
      metric_value: receivedTotal,
      group_period: 'all_time'
    });

    // 2. Update Monthly Series
    for (const [date, data] of Object.entries(monthlyStats)) {
      await analyticsRepository.upsertKpiSnapshot({
        company_id: companyId,
        metric_name: 'billed_revenue',
        metric_value: data.billed,
        group_period: 'monthly',
        period_date: date
      });

      await analyticsRepository.upsertKpiSnapshot({
        company_id: companyId,
        metric_name: 'received_revenue',
        metric_value: data.received,
        group_period: 'monthly',
        period_date: date
      });
    }
  },

  /**
   * One-time job to backfill analytics for all companies.
   */
  async backfillAllCompanies() {
    const supabase = await (await import('@/lib/supabase/server')).createClient();
    const { data: companies } = await supabase.from('companies').select('id');
    
    if (!companies) return;
    
    console.log(`[Analytics] Starting backfill for ${companies.length} companies...`);
    for (const company of companies) {
      await this.syncCompanyStats(company.id);
    }
    console.log(`[Analytics] Backfill completed.`);
  }
};
