import { invoiceSchema } from './invoice.schema';
import { InvoiceSchema } from './invoice.types';
import * as invoiceRepository from './invoice.repository';
import { Invoice, InvoiceItem } from './invoice.types';
import { emitEvent } from '@/lib/events';
import { fxService } from '@/lib/domain/finance/fx.service';
import { getCompanyByUserId } from '@/lib/domain/companies/company.repository';
import { activityService } from '@/lib/domain/activities/activity.service';

export const invoiceService = {
  async getInvoices(companyId: string) {
    const { data, error } = await invoiceRepository.getInvoices(companyId);
    if (error) throw error;
    return data;
  },

  async getInvoiceById(invoiceId: string) {
    const { data, error } = await invoiceRepository.getInvoiceById(invoiceId);
    if (error) throw error;
    return data;
  },

  async createInvoice(companyId: string, userId: string, invoiceData: InvoiceSchema) {
    // 1. Validate form data
    const validated = invoiceSchema.parse(invoiceData);

    // 2. Get Company Base Currency
    const { data: company } = await getCompanyByUserId(userId);
    const baseCurrency = company?.currency || 'USD';
    const invoiceCurrency = validated.currency || baseCurrency;

    // 3. Calculate initial total and base total
    const items = validated.items || [];
    const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice) * (1 - item.discount / 100) * (1 + item.taxRate / 100), 0);

    const { convertedAmount: baseTotal, rate } = await fxService.convert(
      total,
      invoiceCurrency,
      baseCurrency,
      companyId
    );

    // 4. Create the invoice record
    const { data: invoice, error } = await invoiceRepository.createInvoice(companyId, userId, {
      invoice_type: validated.invoiceType,
      issue_date: validated.issueDate,
      due_date: validated.dueDate,
      notes: validated.notes,
      currency: validated.currency,
      customer_name: validated.customerName,
      supplier_name: validated.supplierName,
      status: 'draft',
      total: 0, // Will be updated or calculated
    });

    if (error) throw error;

    // 3. Create items if any
    if (validated.items && validated.items.length > 0) {
      const itemsToCreate = validated.items.map(item => ({
        invoice_id: invoice.id,
        company_id: companyId,
        designation: item.designation,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        unit_type: item.unitType,
        discount: item.discount,
        tax_rate: item.taxRate,
        product_id: item.productId,
        total: (item.quantity * item.unitPrice) * (1 - item.discount / 100) * (1 + item.taxRate / 100)
      }));

      await this.createInvoiceItems(itemsToCreate);

      // Update invoice total after items are added
      const total = itemsToCreate.reduce((sum, item) => sum + item.total, 0);
      await this.updateInvoice(invoice.id, { total });
      invoice.total = total;
    }

    // 4. Log activity
    await activityService.logActivity({
      companyId,
      entityType: 'invoice',
      entityId: invoice.id,
      activityType: 'invoice.created',
      userId,
      metadata: { total: invoice.total }
    });

    // 5. Emit event
    emitEvent('invoice.created', {
      invoiceId: invoice.id,
      companyId,
      userId,
      total: invoice.total
    });

    return invoice;
  },

  async updateInvoice(invoiceId: string, updates: Partial<Invoice>) {
    const { data, error } = await invoiceRepository.updateInvoice(invoiceId, updates);
    if (error) throw error;

    // Log status change if status was updated
    if (updates.status) {
      await activityService.logActivity({
        companyId: data.company_id,
        entityType: 'invoice',
        entityId: invoiceId,
        activityType: `invoice.${updates.status}` as any, // e.g. 'invoice.paid'
        metadata: { updates }
      });
    }

    return data;
  },

  async deleteInvoice(invoiceId: string) {
    const { error } = await invoiceRepository.deleteInvoice(invoiceId);
    if (error) throw error;
    return true;
  },

  async getInvoiceItems(invoiceId: string) {
    const { data, error } = await invoiceRepository.getInvoiceItems(invoiceId);
    if (error) throw error;
    return data;
  },

  async createInvoiceItems(items: Partial<InvoiceItem>[]) {
    const { data, error } = await invoiceRepository.createInvoiceItems(items);
    if (error) throw error;
    return data;
  },

  async updateInvoiceItem(itemId: string, updates: Partial<InvoiceItem>) {
    const { data, error } = await invoiceRepository.updateInvoiceItem(itemId, updates);
    if (error) throw error;
    return data;
  },

  async deleteInvoiceItem(itemId: string) {
    const { error } = await invoiceRepository.deleteInvoiceItem(itemId);
    if (error) throw error;
    return true;
  },

  async markAsSent(invoiceId: string) {
    return await this.updateInvoice(invoiceId, { 
      status: 'sent', 
      sent_at: new Date().toISOString() 
    } as any);
  },

  async markAsViewed(invoiceId: string) {
    const invoice = await this.getInvoiceById(invoiceId);
    // Only set viewed_at if it's not already set
    if (!invoice.viewed_at) {
      return await this.updateInvoice(invoiceId, { 
        status: 'viewed', 
        viewed_at: new Date().toISOString() 
      } as any);
    }
    return invoice;
  }
};
