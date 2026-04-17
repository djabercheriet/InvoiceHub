import { registerHandler } from '../emitter';
import { invoiceService } from '@/lib/domain/invoices/invoice.service';
import { inventoryService } from '@/lib/domain/inventory/inventory.service';
import { enqueue } from '@/lib/jobs/queue';

export function initInventoryHandler() {
  
  registerHandler('product.stock_low', async (event) => {
    const { productId, companyId, quantity, min_stock_level } = event.payload;
    
    console.log(`[Inventory Handler] Processing low stock alert for product ${productId}...`);

    // 1. Fetch full product details (including supplier)
    const product = await inventoryService.getProductById(productId);
    
    if (product?.supplier_id) {
      console.log(`[Inventory Handler] Auto-generating Draft Purchase Order for product ${product.name}...`);

      // 2. Calculate Reorder Quantity: (Min Stock * 2) - Current Qty
      const reorderQty = (Number(min_stock_level) * 2) - Number(quantity);
      
      if (reorderQty > 0) {
        // 3. Create Draft Purchase Invoice
        const draftPO = await invoiceService.createInvoice(companyId, 'SYSTEM', {
          invoice_type: 'purchase',
          status: 'draft',
          supplier_id: product.supplier_id,
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
          items: [
            {
              product_id: productId,
              description: `Automated Reorder: ${product.name}`,
              quantity: reorderQty,
              unit_price: product.buy_price || product.cost_price || 0,
              total: reorderQty * (product.buy_price || product.cost_price || 0)
            }
          ],
          total: reorderQty * (product.buy_price || product.cost_price || 0),
          notes: `Automated reorder triggered by low stock alert (${quantity} <= ${min_stock_level})`
        } as any);

        console.log(`[Inventory Handler] Draft PO created: ${draftPO.id}`);

        // 4. Trigger Email Notification (Background Job)
        await enqueue('INVOICE_PROCESS', {
          invoiceId: draftPO.id,
          companyId: companyId,
          userId: 'SYSTEM',
          shouldSendEmail: true
        });
      }
    } else {
      console.log(`[Inventory Handler] No supplier linked for product ${product.name}. Skipping automated PO generation.`);
    }
  });
}
