import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // This will be expanded to fetch real invoice data from Supabase
    // For now, returns mock data structure
    const invoices = [
      {
        id: "1",
        invoice_number: "INV-2024-001",
        customer: "Acme Corp",
        total: 2500.0,
        status: "paid",
        created_at: "2024-01-15",
      },
    ];

    return NextResponse.json({ invoices, user: user.email });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // This will be expanded to create real invoices in Supabase
    // For now, validates the structure
    if (!body.invoice_number || !body.customer) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Invoice created successfully", invoice: body },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
