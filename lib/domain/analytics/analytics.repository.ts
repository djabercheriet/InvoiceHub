import { createClient } from '@/lib/supabase/server';

export async function upsertKpiSnapshot(snapshot: {
  company_id: string;
  metric_name: string;
  metric_value: number;
  group_period: string;
  period_date?: string | null;
}) {
  const supabase = await createClient();
  return await supabase
    .from('company_kpi_snapshots')
    .upsert({
      ...snapshot,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'company_id, metric_name, group_period, period_date'
    });
}

export async function getSummaryStats(companyId: string) {
  const supabase = await createClient();
  return await supabase
    .from('company_kpi_snapshots')
    .select('metric_name, metric_value')
    .eq('company_id', companyId)
    .eq('group_period', 'all_time');
}

export async function getKpiSeries(companyId: string, metricName: string, period: string = 'monthly') {
  const supabase = await createClient();
  return await supabase
    .from('company_kpi_snapshots')
    .select('period_date, metric_value')
    .eq('company_id', companyId)
    .eq('metric_name', metricName)
    .eq('group_period', period)
    .order('period_date', { ascending: true });
}

export async function getRawRevenueStats(companyId: string) {
  const supabase = await createClient();
  
  // Dynamic calculation for billed vs received
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total, base_currency_total, status, issue_date, paid_at')
    .eq('company_id', companyId);
    
  return invoices || [];
}
