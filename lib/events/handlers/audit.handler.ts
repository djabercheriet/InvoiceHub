import { registerHandler } from '../emitter';

// Audit Logger Handler
// Listens to all important events and logs them for debugging and later persistence in Phase 7
export function initAuditHandler() {
  const eventTypes: any[] = [
    'invoice.created', 
    'invoice.updated', 
    'customer.created', 
    'product.created',
    'product.stock_low'
  ];

  eventTypes.forEach(type => {
    registerHandler(type, async (event) => {
      console.log(`[AUDIT] ${event.timestamp} - ${event.type}:`, JSON.stringify(event.payload));
      
      // Phase 7: Persist to 'audit_logs' table in Supabase
    });
  });
}
