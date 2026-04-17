import { registerHandler } from '../emitter';
import { enqueue } from '@/lib/jobs/queue';
import { invalidateCache } from '@/lib/cache';

// Analytics Handler
// Listens to events to trigger metric aggregations
export function initAnalyticsHandler() {
  
  // When an invoice is created, updated, or a payment is recorded, trigger a stats refresh
  const triggerMetrics = async (event: any) => {
    const { companyId } = event.payload;
    console.log(`[Event Handler: Analytics] Queuing stats refresh for company ${companyId}...`);
    
    // Invalidate caches for this company
    await invalidateCache(`analytics:summary:${companyId}`);
    await invalidateCache(`analytics:trend:${companyId}`);

    await enqueue('ANALYTICS_AGGREGATE', {
      companyId,
      metricType: 'revenue'
    });
  };

  registerHandler('invoice.created', triggerMetrics);
  registerHandler('invoice.updated', triggerMetrics);
  registerHandler('payment.recorded', triggerMetrics);

  registerHandler('product.stock_low', async (event) => {
    const { productId, companyId, quantity } = event.payload as any;
    console.log(`[ANALYTICS] ALERT: Low stock for product ${productId} in company ${companyId}. Current level: ${quantity}`);
    
    // Future: Increment "Low Stock" KPI on dashboard
  });
}
