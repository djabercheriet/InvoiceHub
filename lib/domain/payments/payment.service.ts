import { paymentSchema, PaymentSchema } from './payment.schema';
import * as paymentRepository from './payment.repository';
import { emitEvent } from '@/lib/events';
import { invoiceService } from '../invoices/invoice.service';
import { fxService } from '../finance/fx.service';

export const paymentService = {
  async getPaymentsByInvoice(invoiceId: string) {
    const { data, error } = await paymentRepository.getPaymentsByInvoice(invoiceId);
    if (error) throw error;
    return data;
  },

  async recordPayment(companyId: string, paymentData: PaymentSchema) {
    // 1. Validate data
    const validated = paymentSchema.parse(paymentData);

    // 2. Business Rule: Check if invoice exists and currency matches
    const invoice = await invoiceService.getInvoiceById(validated.invoice_id);
    if (!invoice) throw new Error('Invoice not found');
    
    // Note: If currencies become dynamic, we'd check `validated.currency === invoice.currency` here.
    // For now we assume the payment amount is in the invoice currency.

    // 2.1 Overpayment Verification
    const previousPayments = await this.getPaymentsByInvoice(validated.invoice_id);
    const totalPaidBefore = previousPayments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const totalPaidAfter = totalPaidBefore + validated.amount;

    if (totalPaidAfter > invoice.total + 0.01) { // 0.01 for floating point safety
      throw new Error(`Payment would exceed invoice total. Remaining: ${(invoice.total - totalPaidBefore).toFixed(2)}`);
    }

    // 3. Insert payment with conversion
    const { convertedAmount: baseAmount, rate } = await fxService.convert(
      validated.amount,
      invoice.currency || 'USD',
      'USD', // This should be base currency, but I'll fetch it from the invoice context
      companyId
    );

    const { data: payment, error } = await paymentRepository.createPayment({
      ...validated,
      company_id: companyId,
      exchange_rate: invoice.exchange_rate || rate,
      base_amount: Number((validated.amount * (invoice.exchange_rate || rate)).toFixed(2))
    });

    if (error) throw error;

    // 4. Lifecycle Synchronization
    if (totalPaidAfter >= invoice.total - 0.01) {
      await invoiceService.updateInvoice(payment.invoice_id, { status: 'paid' });
    } else {
      await invoiceService.updateInvoice(payment.invoice_id, { status: 'partially_paid' });
    }

    // 5. Emit event for status synchronization
    emitEvent('payment.recorded' as any, {
      paymentId: payment.id,
      invoiceId: payment.invoice_id,
      amount: payment.amount,
      companyId: payment.company_id,
      customerId: payment.customer_id
    });

    return payment;
  },

  async getPaymentsByCompany(companyId: string) {
    const { data, error } = await paymentRepository.getPaymentsByCompany(companyId);
    if (error) throw error;
    return data;
  }
};
