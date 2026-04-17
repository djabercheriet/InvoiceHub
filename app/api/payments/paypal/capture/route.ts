import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { paymentService } from "@/lib/domain/payments/payment.service";
import { getInvoiceById } from "@/lib/domain/invoices/invoice.repository";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, amount, currency } = body;

    if (!invoiceId || !amount || !currency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch invoice info to get company_id and customer_id
    const { data: invoice, error: invoiceError } = await getInvoiceById(invoiceId);
    if (invoiceError || !invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // 2. Record the payment using the service (enforces overpayment rules & status sync)
    const payment = await paymentService.recordPayment(invoice.company_id, {
      invoice_id: invoiceId,
      company_id: invoice.company_id,
      customer_id: invoice.customer_id,
      amount: parseFloat(amount),
      currency: currency,
      payment_method: "paypal",
      payment_date: new Date().toISOString(),
      reference: `PAYPAL-${Date.now()}`,
      status: "completed",
    });

    return NextResponse.json({ success: true, paymentId: payment.id });
  } catch (error: any) {
    console.error("[PAYPAL_CAPTURE_ERROR]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
