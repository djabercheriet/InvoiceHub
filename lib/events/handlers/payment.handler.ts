import { registerHandler } from '../emitter';
import { invoiceService } from '@/lib/domain/invoices/invoice.service';
import { paymentService } from '@/lib/domain/payments/payment.service';

export function initPaymentHandler() {
  
  registerHandler('payment.recorded', async (event) => {
    const { invoiceId } = event.payload;
    
    console.log(`[Payment Handler] Syncing status for invoice ${invoiceId}...`);

    // 1. Fetch current invoice total
    const invoice = await invoiceService.getInvoiceById(invoiceId);
    if (!invoice) return;

    // 2. Sum all recorded payments
    const payments = await paymentService.getPaymentsByInvoice(invoiceId);
    const totalPaid = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    // 3. Determine new status
    let newStatus = 'unpaid';
    if (totalPaid >= invoice.total) {
      newStatus = 'paid';
    } else if (totalPaid > 0) {
      newStatus = 'partially_paid';
    }

    // 4. Update invoice
    console.log(`[Payment Handler] Updating status: ${invoice.status} -> ${newStatus} (Paid: ${totalPaid}/${invoice.total})`);
    
    await invoiceService.updateInvoice(invoiceId, { 
      status: newStatus,
      paid_at: newStatus === 'paid' ? new Date().toISOString() : null
    } as any);
  });
}
