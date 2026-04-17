import { createClient } from '@/lib/supabase/server';
import { generateInvoicePDFBuffer } from '@/lib/pdf-server';
import { sendInvoiceEmail } from '@/lib/email';
import { invoiceService } from '@/lib/domain/invoices/invoice.service';
import { customerService } from '@/lib/domain/customers/customer.service';

export async function processInvoiceJob(payload: { 
  invoiceId: string; 
  companyId: string; 
  userId: string;
  shouldSendEmail?: boolean;
}) {
  const { invoiceId, companyId, shouldSendEmail = true } = payload;
  const supabase = await createClient();

  // 1. Fetch full data context
  console.log(`[Worker: Invoice] Fetching data for invoice ${invoiceId}`);
  const invoice = await invoiceService.getInvoiceById(invoiceId);
  const customer = await customerService.getCustomerById(invoice.customer_id);
  const items = await invoiceService.getInvoiceItems(invoiceId);
  
  // 2. Generate PDF
  console.log(`[Worker: Invoice] Generating PDF buffer...`);
  const buffer = await generateInvoicePDFBuffer({
    invoice,
    customer,
    items,
    products: [] // We could fetch products too, but items usually have the data
  });

  // 3. Save to Supabase Storage
  console.log(`[Worker: Invoice] Uploading PDF to storage...`);
  const fileName = `${companyId}/${invoice.invoice_number}-${invoiceId}.pdf`;
  const { data: uploadData, error: uploadError } = await supabase
    .storage
    .from('invoices')
    .upload(fileName, buffer, {
      contentType: 'application/pdf',
      upsert: true
    });

  if (uploadError) {
    console.error(`[Worker: Invoice] Storage upload failed:`, uploadError);
    // Continue even if upload fails, but log it
  } else {
    // 4. Update invoice with PDF URL if necessary
    const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(fileName);
    await invoiceService.updateInvoice(invoiceId, { 
      // Assuming we might want a pdf_url field in the future
      // pdf_url: publicUrl 
    } as any);
  }

  // 5. Send Email
  if (shouldSendEmail && customer.email) {
    console.log(`[Worker: Invoice] Dispatching email to ${customer.email}...`);
    await sendInvoiceEmail({
      to: customer.email,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.total,
      customerName: customer.name,
      pdfBuffer: buffer as Buffer
    });

    // Update status to 'sent'
    await invoiceService.updateInvoice(invoiceId, { status: 'sent' });
  }
}
