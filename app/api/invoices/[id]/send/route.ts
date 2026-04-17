import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enqueue } from '@/lib/jobs/queue';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // 1. Fetch metadata to verify existence and get company/user context
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('id, company_id, created_by')
      .eq('id', id)
      .single();

    if (invErr || !invoice) {
        return NextResponse.json({ error: "Manifest index not found." }, { status: 404 });
    }

    // 2. Queue for background processing
    await enqueue('INVOICE_PROCESS', {
      invoiceId: invoice.id,
      companyId: invoice.company_id,
      userId: invoice.created_by,
      shouldSendEmail: true
    });

    return NextResponse.json({ 
        success: true, 
        message: "Dispatch request accepted. Processing in background.",
    }, { status: 202 });

  } catch (error: any) {
    console.error("[DISPATCH QUEUE ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
