import { NextRequest, NextResponse } from "next/server";
import { purchaseOrderService } from "@/lib/domain/purchase-orders/purchase-order.service";
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

    const updatedPO = await purchaseOrderService.receiveOrder(id, user.id);

    return NextResponse.json({
      message: "Purchase Order received successfully. Stock updated.",
      poId: updatedPO.id,
      status: updatedPO.status
    });
  } catch (err: any) {
    console.error("[API] PO receive failed:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
