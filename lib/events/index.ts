import { initAuditHandler } from './handlers/audit.handler';
import { initAnalyticsHandler } from './handlers/analytics.handler';
import { initJobsHandler } from './handlers/jobs.handler';
import { initPaymentHandler } from './handlers/payment.handler';
import { initInventoryHandler } from './handlers/inventory.handler';
import { initActivityHandler } from './handlers/activity.handler';
import { initAutomationHandler } from './handlers/automation.handler';

let initialized = false;

/**
 * Initialize all event handlers.
 * This should be called once at application startup or via a singleton pattern.
 */
export function initEventSystem() {
  if (initialized) return;

  console.log('[Event Engine] Initializing handlers...');

  initAuditHandler();
  initAnalyticsHandler();
  initJobsHandler();
  initPaymentHandler();
  initInventoryHandler();
  initActivityHandler();
  initAutomationHandler();

  initialized = true;
  console.log('[Event Engine] All handlers registered.');
}

// Auto-initialize if imported (Next.js server-side modules are persistent in dev/prod)
initEventSystem();

export * from './emitter';
export * from './event.types';
