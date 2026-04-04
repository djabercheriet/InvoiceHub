import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/invoices/invoice-pdf';
import { sendInvoiceEmail } from '@/lib/email';
import React from 'react';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { id } = params;

    // 1. Fetch full invoice manifest
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('*, customers(*), companies(*)')
      .eq('id', id)
      .single();

    if (invErr || !invoice) {
        return NextResponse.json({ error: "Manifest index not found." }, { status: 404 });
    }

    const { data: items, error: itmErr } = await supabase
      .from('invoice_items')
      .select('*, products(name, sku)')
      .eq('invoice_id', id);

    if (itmErr) throw itmErr;

    // 2. Generate PDF Buffer
    // Note: React.createElement is used here because we are in a non-JSX environment during the renderToBuffer call if not careful.
    const pdfBuffer = await renderToBuffer(
        React.createElement(InvoicePDF, {
            invoice,
            customer: invoice.customers,
            items: items || [],
            company: invoice.companies
        })
    );

    // 3. Dispatch via protocol
    const result = await sendInvoiceEmail({
      to: invoice.customers?.email || 'customer@example.com',
      invoiceNumber: invoice.invoice_number,
      amount: invoice.total,
      customerName: invoice.customers?.name || 'Valued Customer',
      pdfBuffer: Buffer.from(pdfBuffer)
    });

    if (!result.success) {
        throw new Error(result.error || "Mail relay failure.");
    }

    return NextResponse.json({ 
        success: true, 
        message: "Financial dispatch successful.",
        previewUrl: result.previewUrl 
    });

  } catch (error: any) {
    console.error("[DISPATCH ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
