import { createClient } from '@/lib/supabase/server';

export type EntityType = 'invoice' | 'quote' | 'purchase_order' | 'supplier' | 'product';

export type ActivityType = 
  | 'invoice.created' 
  | 'invoice.sent' 
  | 'invoice.viewed' 
  | 'invoice.paid' 
  | 'invoice.canceled'
  | 'quote.created'
  | 'quote.sent'
  | 'quote.accepted'
  | 'quote.rejected'
  | 'quote.converted'
  | 'purchase_order.created'
  | 'purchase_order.ordered'
  | 'purchase_order.received'
  | 'purchase_order.cancelled'
  | 'supplier.created'
  | 'product.created'
  | 'product.updated'
  | string; // allow forward-compatible activity types

export interface Activity {
  id: string;
  company_id: string;
  entity_type: EntityType;
  entity_id: string;
  activity_type: ActivityType;
  metadata: any;
  created_at: string;
  created_by?: string;
}

export const activityService = {
  async logActivity(params: {
    companyId: string;
    entityType: EntityType;
    entityId: string;
    activityType: ActivityType;
    metadata?: any;
    userId?: string;
  }) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('activities')
      .insert({
        company_id: params.companyId,
        entity_type: params.entityType,
        entity_id: params.entityId,
        activity_type: params.activityType,
        metadata: params.metadata || {},
        created_by: params.userId
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to log activity:', error);
      return null;
    }
    return data;
  },

  async getActivitiesForEntity(entityId: string, entityType: EntityType) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('entity_id', entityId)
      .eq('entity_type', entityType)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
};
