import { NextRequest, NextResponse } from "next/server";
import { quoteService } from "@/lib/domain/quotes/quote.service";
import { createClient } from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoice = await quoteService.convertToInvoice(id, user.id);

    return NextResponse.json({
      message: "Quote successfully converted to invoice",
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoice_number
    });
  } catch (err: any) {
    console.error("[API] Quote conversion failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
