import { analyticsService } from '@/lib/domain/analytics/analytics.service';

/**
 * Worker to handle analytics-related tasks in the background.
 */
export async function processAnalyticsJob(payload: { companyId: string; metricType?: string }) {
  const { companyId } = payload;
  
  console.log(`[Worker: Analytics] Recalculating stats for company ${companyId}...`);
  
  // For now, we always perform a full re-sync to ensure snapshots match reality
  await analyticsService.syncCompanyStats(companyId);
  
  console.log(`[Worker: Analytics] Stats synchronized for company ${companyId}.`);
}
