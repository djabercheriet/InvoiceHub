import { registerHandler } from '../emitter';
import { automationService } from '@/lib/domain/automation/automation.service';

/**
 * Initializes the Automation event engine.
 * Listens to global system events and forwards them to the smart workflow engine.
 */
export function initAutomationHandler() {
  
  // Rule: When stock runs low, check if any company workflows exist for this.
  registerHandler('product.stock_low', async (event) => {
    const { companyId, productId, quantity, min_stock_level } = event.payload;
    await automationService.triggerEvent(
      companyId, 
      'product.stock_low', 
      `Stock for Product ${productId.substring(0,6)} dropped to ${quantity} (Below min: ${min_stock_level})`
    );
  });

  // Rule: When payments are recorded
  registerHandler('payment.recorded', async (event) => {
    const { companyId, amount, invoiceId } = event.payload;
    await automationService.triggerEvent(
      companyId, 
      'payment.recorded', 
      `Payment of $${amount} collected for Invoice ${invoiceId.substring(0,6)}`
    );
  });

  // Example for catching status updates
  registerHandler('invoice.updated', async (event) => {
    const { companyId, invoiceId, status } = event.payload;
    if (status) {
      await automationService.triggerEvent(
        companyId, 
        'invoice.status_changed', 
        `Invoice ${invoiceId.substring(0,6)} moved to status: ${status}`
      );
    }
  });

  console.log('[Event Engine] Automation handler registered.');
}
