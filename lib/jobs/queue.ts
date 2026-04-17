import { Job, JobType, JobPayload } from './types';
import { processJob } from '@/lib/jobs/worker';
import { Client } from "@upstash/qstash";

// Driver selection: 'in-process' or 'qstash'
const DRIVER = process.env.JOB_DRIVER || 'in-process';

const qstashClient = process.env.QSTASH_TOKEN ? new Client({ token: process.env.QSTASH_TOKEN }) : null;

/**
 * Enqueue a new background job
 */
export async function enqueue<T extends JobType>(
  type: T, 
  payload: JobPayload[T], 
  options: { maxAttempts?: number } = {}
) {
  const job: Job<T> = {
    id: Math.random().toString(36).substring(7),
    type,
    payload,
    attempts: 0,
    maxAttempts: options.maxAttempts || 3,
    createdAt: new Date().toISOString(),
  };

  if (DRIVER === 'qstash') {
    return await enqueueQStash(job);
  } else {
    return await enqueueInProcess(job);
  }
}

/**
 * Fallback driver: Next.js 'after' or async backgrounding
 */
async function enqueueInProcess<T extends JobType>(job: Job<T>) {
  const startTime = Date.now();
  console.log(`[Queue: In-Process] Enqueued job ${job.id} (${job.type}) at ${job.createdAt}`);
  
  const executeWithRetry = async (currentJob: Job<T>) => {
    try {
      currentJob.attempts++;
      await processJob(currentJob);
      const duration = Date.now() - startTime;
      console.log(`[Queue: SUCCESS] Job ${currentJob.id} (${currentJob.type}) finished in ${duration}ms.`);
    } catch (error) {
      console.error(`[Queue: ERROR] Job ${currentJob.id} (${currentJob.type}) failed (Attempt ${currentJob.attempts}/${currentJob.maxAttempts}):`, error);
      
      if (currentJob.attempts < currentJob.maxAttempts) {
        // Exponential backoff: 2s, 4s, 8s...
        const delay = Math.pow(2, currentJob.attempts) * 1000;
        console.log(`[Queue: RETRY] Job ${currentJob.id} in ${delay}ms...`);
        setTimeout(() => executeWithRetry(currentJob), delay);
      } else {
        console.error(`[Queue: FATAL] Job ${currentJob.id} failed after maximum attempts.`);
      }
    }
  };

  // Try to use Next.js 'after' if available for perfect non-blocking
  try {
    const { after } = await import('next/server');
    after(() => executeWithRetry(job));
  } catch {
    // Fallback to simple async if 'after' is not available
    executeWithRetry(job);
  }
}

/**
 * QStash driver for reliable, signed background jobs.
 */
async function enqueueQStash<T extends JobType>(job: Job<T>) {
  console.log(`[Queue: QStash] Enqueuing job ${job.id} to Upstash...`);
  
  if (!qstashClient) {
    console.error('[Queue: QStash] ERROR: QSTASH_TOKEN missing. Falling back to In-Process driver.');
    return await enqueueInProcess(job);
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 
                  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

  try {
    await qstashClient.publishJSON({
      url: `${baseUrl}/api/webhooks/qstash`,
      body: job,
      retries: job.maxAttempts || 3,
    });
    console.log('[Queue: QStash] Job submitted successfully.');
  } catch (error) {
    console.error('[Queue: QStash] Failed to submit job:', error);
    // Fallback to in-process if QStash API fails
    return await enqueueInProcess(job);
  }
}
