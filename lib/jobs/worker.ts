import { processInvoiceJob } from '@/lib/jobs/workers/invoice.worker';
import { processAnalyticsJob } from '@/lib/jobs/workers/analytics.worker';
import { processEmailJob } from '@/lib/jobs/workers/email.worker';
import { Job } from './types';

/**
 * Main worker entry point. Dispatches specific jobs to their handlers.
 */
export async function processJob(job: Job<any>): Promise<void> {
  console.log(`[Worker] Processing job ${job.id} (${job.type})...`);

  switch (job.type) {
    case 'INVOICE_PROCESS':
      await processInvoiceJob(job.payload);
      break;

    case 'ANALYTICS_AGGREGATE':
      await processAnalyticsJob(job.payload);
      break;

    case 'EMAIL_SEND':
      await processEmailJob(job.payload);
      break;

    default:
      console.warn(`[Worker] Unknown job type: ${job.type}`);
  }
}
