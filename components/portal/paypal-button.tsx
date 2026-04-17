"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PayPalButtonProps {
  invoiceId: string;
  amount: number;
  currency: string;
  onSuccess: (details: any) => void;
}

export function PayPalButton({ invoiceId, amount, currency, onSuccess }: PayPalButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Note: For a real implementation, we would load the PayPal JS SDK here.
  // For this high-fidelity proto/first version, we'll simulate the checkout 
  // and trigger the backend capture logic.

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      // 1. In a real app, this would open the PayPal SDK modal
      // 2. We'll call our backend to 'create' the order locally

      // Simulate network lag
      await new Promise(r => setTimeout(r, 1500));

      // 3. Simulate capture
      const res = await fetch(`/api/payments/paypal/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, amount, currency })
      });

      if (!res.ok) throw new Error("Payment capture failed");

      toast.success("Payment Received!", {
        description: `Successfully paid ${amount} ${currency}. Your invoice is being updated.`
      });

      onSuccess({ id: "PAYPAL-MOCK-ID", status: "COMPLETED" });
    } catch (error) {
      console.error(error);
      toast.error("Payment Failed", { description: "There was an issue processing your PayPal request." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      className="w-full bg-[#ffc439] hover:bg-[#f4bb33] text-blue-900 font-extrabold h-12 shadow-sm gap-2"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          <span className="italic">PayPal</span>
          <span>Checkout</span>
        </>
      )}
    </Button>
  );
}
