import { registerHandler } from '../emitter';
import { createClient } from '@/lib/supabase/server';
import { EventType, AppEvent } from '../event.types';

/**
 * Activity Handler
 * Listens to domain events and persists them to the 'activities' table
 * for the unified activity timeline.
 */
export function initActivityHandler() {
  const trackedEvents: EventType[] = [
    'invoice.created',
    'invoice.updated',
    'customer.created',
    'product.created',
    'payment.recorded'
  ];

  trackedEvents.forEach(type => {
    registerHandler(type, async (event) => {
      try {
        const supabase = await createClient();
        const { payload } = event;

        // Extract common fields from different payloads
        let entityId = '';
        let entityType = '';
        let companyId = (payload as any).companyId;
        let metadata = { ...payload };

        if (type.startsWith('invoice.')) {
          entityId = (payload as any).invoiceId;
          entityType = 'invoice';
        } else if (type.startsWith('customer.')) {
          entityId = (payload as any).customerId;
          entityType = 'customer';
        } else if (type.startsWith('product.')) {
          entityId = (payload as any).productId;
          entityType = 'product';
        } else if (type === 'payment.recorded') {
          entityId = (payload as any).paymentId;
          entityType = 'payment';
        }

        if (!entityId || !companyId) return;

        await supabase.from('activities').insert({
          company_id: companyId,
          entity_id: entityId,
          entity_type: entityType,
          activity_type: type,
          metadata,
          created_at: event.timestamp
        });
      } catch (error) {
        console.error(`[Activity Handler] Failed to record activity for ${type}:`, error);
      }
    });
  });
}
