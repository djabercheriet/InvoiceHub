import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { invoiceId, amount, currency } = await req.json();

    // In a real PayPal integration, you would call the PayPal API here 
    // to create an order and return the order ID to the client.
    // For now, we simulate success and return a mock order ID.

    return NextResponse.json({
      id: `ORDER-${Date.now()}`,
      status: "CREATED"
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
