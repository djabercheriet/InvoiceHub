import * as poRepository from './purchase-order.repository';
import { CreatePOData, CreatePOItemData } from './purchase-order.types';
import { activityService } from '@/lib/domain/activities/activity.service';
import { createClient } from '@/lib/supabase/server';

export const purchaseOrderService = {
  async getPurchaseOrders(companyId: string) {
    const { data, error } = await poRepository.getPurchaseOrders(companyId);
    if (error) throw error;
    return data;
  },

  async getPurchaseOrderById(poId: string) {
    const { data, error } = await poRepository.getPurchaseOrderById(poId);
    if (error) throw error;
    return data;
  },

  async createPurchaseOrder(companyId: string, userId: string, payload: {
    supplierId?: string;
    expectedDate?: string;
    notes?: string;
    items: { productId?: string; description: string; quantity: number; unitPrice: number }[];
  }) {
    const total = payload.items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
    const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: po, error } = await poRepository.createPurchaseOrder(companyId, userId, {
      supplier_id: payload.supplierId,
      po_number: poNumber,
      status: 'draft',
      total,
      expected_date: payload.expectedDate,
      notes: payload.notes,
    });
    if (error) throw error;

    const items: CreatePOItemData[] = payload.items.map(i => ({
      purchase_order_id: po.id,
      product_id: i.productId || null,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      total: i.quantity * i.unitPrice,
    }));
    await poRepository.createPurchaseOrderItems(items);

    await activityService.logActivity({
      companyId,
      entityType: 'purchase_order',
      entityId: po.id,
      activityType: 'purchase_order.created',
      userId,
      metadata: { poNumber, total }
    });

    return po;
  },

  /**
   * CORE BUSINESS LOGIC: Receive a Purchase Order
   * - Marks PO as 'received'
   * - Increments stock for each product item
   * - Creates stock_movement entries for full audit trail
   */
  async receiveOrder(poId: string, userId: string) {
    const supabase = await createClient();

    // 1. Fetch the full PO with items
    const po = await this.getPurchaseOrderById(poId);
    if (!po) throw new Error('Purchase Order not found');
    if (po.status === 'received') throw new Error('Purchase Order already received');
    if (po.status === 'cancelled') throw new Error('Cannot receive a cancelled order');

    // 2. For each line item, increment product stock
    for (const item of po.purchase_order_items) {
      if (!item.product_id) continue;

      // Get current stock
      const { data: product } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', item.product_id)
        .single();

      if (!product) continue;

      const newQty = (product.quantity || 0) + item.quantity;

      // Update stock
      await supabase
        .from('products')
        .update({ quantity: newQty })
        .eq('id', item.product_id);

      // Create stock movement record
      await supabase.from('stock_movements').insert({
        company_id: po.company_id,
        product_id: item.product_id,
        movement_type: 'in',
        quantity: item.quantity,
        note: `PO Receipt — ${po.po_number}`,
      });
    }

    // 3. Mark PO as received
    const { data: updatedPO, error } = await poRepository.updatePurchaseOrder(poId, {
      status: 'received',
      received_at: new Date().toISOString(),
    });
    if (error) throw error;

    // 4. Log activity
    await activityService.logActivity({
      companyId: po.company_id,
      entityType: 'purchase_order',
      entityId: poId,
      activityType: 'purchase_order.received',
      userId,
      metadata: { poNumber: po.po_number, itemCount: po.purchase_order_items.length }
    });

    return updatedPO;
  },

  async updatePurchaseOrder(poId: string, updates: Partial<{ status: string; notes: string }>) {
    const { data, error } = await poRepository.updatePurchaseOrder(poId, updates as any);
    if (error) throw error;
    return data;
  },

  async deletePurchaseOrder(poId: string) {
    const { error } = await poRepository.deletePurchaseOrder(poId);
    if (error) throw error;
    return true;
  }
};
