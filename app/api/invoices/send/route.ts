import { createClient } from '@/lib/supabase/server';
import { sendInvoiceEmail } from '@/lib/email';
import { generateInvoicePDFBuffer } from '@/lib/pdf-server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { invoiceId, email } = await req.json();
    
    // 1. Fetch Invoice + Customer + Items + Products
    const supabase = await createClient();
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        customers(*),
        invoice_items(*, products(*))
      `)
      .eq('id', invoiceId)
      .single();

    if (error || !invoice) {
        return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // 2. Generate PDF Buffer on server
    let pdfBuffer: Buffer | undefined;
    try {
        pdfBuffer = await generateInvoicePDFBuffer({
            invoice: invoice,
            customer: invoice.customers,
            items: invoice.invoice_items,
            products: invoice.invoice_items.map((i: any) => i.products)
        });
    } catch (pdfErr) {
        console.error("PDF Gen Error:", pdfErr);
        // Continue without PDF if it fails, or return error?
        // For Enterprise, we better have the PDF.
    }

    // 3. Dispatch Email (Ethereal or Resend)
    const result = await sendInvoiceEmail({
      to: email || invoice.customers?.email,
      invoiceNumber: invoice.invoice_number,
      amount: invoice.total,
      customerName: invoice.customers?.name || "Customer",
      pdfBuffer: pdfBuffer
    });

    // 4. Mark invoice as sent in DB
    if (result.success && invoice.status === 'draft') {
       await supabase.from('invoices').update({ status: 'sent' }).eq('id', invoiceId);
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Route Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
