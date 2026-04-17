import { registerHandler } from '../emitter';
import { enqueue } from '@/lib/jobs/queue';

// Jobs Handler
// Bridges the Event System with the Background Job System
export function initJobsHandler() {
  
  // When an invoice is created, trigger the heavy background processing (PDF + Email)
  registerHandler('invoice.created', async (event) => {
    const { invoiceId, companyId, userId } = event.payload;
    
    console.log(`[Event Handler: Jobs] Triggering background process for invoice ${invoiceId}`);
    
    await enqueue('INVOICE_PROCESS', {
      invoiceId,
      companyId,
      userId,
      shouldSendEmail: true // Default behavior
    });
  });

  // Future: product.stock_low -> Trigger low stock notification job
}
