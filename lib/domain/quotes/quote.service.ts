import { quoteSchema, QuoteSchema } from './quote.schema';
import * as quoteRepository from './quote.repository';
import { Quote, QuoteItem, CreateQuoteData } from './quote.types';
import { emitEvent } from '@/lib/events';
import { activityService } from '@/lib/domain/activities/activity.service';
import { invoiceService } from '@/lib/domain/invoices/invoice.service';

export const quoteService = {
  async getQuotes(companyId: string) {
    const { data, error } = await quoteRepository.getQuotes(companyId);
    if (error) throw error;
    return data;
  },

  async getQuoteById(quoteId: string) {
    const { data, error } = await quoteRepository.getQuoteById(quoteId);
    if (error) throw error;
    return data;
  },

  async createQuote(companyId: string, userId: string, quoteData: QuoteSchema) {
    // 1. Validate form data
    const validated = quoteSchema.parse(quoteData);

    // 2. Calculate totals
    const subtotal = validated.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = validated.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.taxRate / 100)), 0);
    const discountAmount = validated.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * (item.discountPercent / 100)), 0);
    const total = subtotal + taxAmount - discountAmount;

    // 3. Create the quote record
    const { data: quote, error } = await quoteRepository.createQuote(companyId, userId, {
      customer_id: validated.customerId,
      quote_number: validated.quoteNumber,
      status: 'draft',
      issue_date: validated.issueDate,
      valid_until: validated.validUntil,
      notes: validated.notes,
      currency: validated.currency,
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total,
    });

    if (error) throw error;

    // 4. Create items
    const itemsToCreate = validated.items.map(item => ({
      quote_id: quote.id,
      product_id: item.productId,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      discount_percent: item.discountPercent,
      tax_rate: item.taxRate,
      total: (item.quantity * item.unitPrice) * (1 - item.discountPercent / 100) * (1 + item.taxRate / 100)
    }));

    await quoteRepository.createQuoteItems(itemsToCreate);

    // 5. Log activity
    await activityService.logActivity({
      companyId,
      entityType: 'quote',
      entityId: quote.id,
      activityType: 'quote.created',
      userId,
      metadata: { total: quote.total, quoteNumber: quote.quote_number }
    });

    // 6. Emit event
    emitEvent('quote.created' as any, {
      quoteId: quote.id,
      companyId,
      userId,
      total: quote.total
    });

    return quote;
  },

  async updateQuote(quoteId: string, updates: Partial<Quote>) {
    const { data, error } = await quoteRepository.updateQuote(quoteId, updates);
    if (error) throw error;

    // Log status change if status was updated
    if (updates.status) {
      await activityService.logActivity({
        companyId: data.company_id,
        entityType: 'quote',
        entityId: quoteId,
        activityType: `quote.${updates.status}` as any, // e.g. 'quote.accepted'
        metadata: { updates }
      });
    }

    return data;
  },

  async deleteQuote(quoteId: string) {
    const { error } = await quoteRepository.deleteQuote(quoteId);
    if (error) throw error;
    return true;
  },

  /**
   * IMPORTANT: Convert Quote to Invoice
   * This implements Task 2 of Phase 2
   */
  async convertToInvoice(quoteId: string, userId: string) {
    const quote = await this.getQuoteById(quoteId);
    if (!quote) throw new Error('Quote not found');
    if (quote.status === 'converted') throw new Error('Quote already converted');

    // 1. Create the invoice
    const newInvoice = await invoiceService.createInvoice(quote.company_id, userId, {
      invoiceType: 'sale',
      customerName: quote.customers?.name || 'Customer',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days default
      notes: `Converted from Quote ${quote.quote_number}. ${quote.notes || ''}`,
      currency: quote.currency,
      items: quote.quote_items.map((item: any) => ({
        productId: item.product_id,
        designation: item.description,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        discount: item.discount_percent,
        taxRate: item.tax_rate,
        unitType: 'unit'
      }))
    } as any);

    // 2. Update quote status
    await this.updateQuote(quoteId, { 
      status: 'converted',
      metadata: { ...(quote.metadata as any), converted_to_invoice_id: newInvoice.id }
    });

    // 3. Log conversion activity
    await activityService.logActivity({
      companyId: quote.company_id,
      entityType: 'quote',
      entityId: quoteId,
      activityType: 'quote.converted' as any,
      userId,
      metadata: { invoiceId: newInvoice.id, invoiceNumber: newInvoice.invoice_number }
    });

    return newInvoice;
  }
};
