"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CreditCard, Calendar, User, DollarSign, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  created_at: string;
  reference?: string;
}

export function PaymentHistory({ invoiceId }: { invoiceId: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchPayments();
  }, [invoiceId]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="animate-pulse space-y-3">
      {[1, 2].map(i => (
        <div key={i} className="h-12 bg-muted rounded-xl" />
      ))}
    </div>
  );

  if (payments.length === 0) return (
    <div className="flex flex-col items-center justify-center py-6 text-center border-2 border-dashed border-border/40 rounded-2xl bg-muted/5">
      <DollarSign className="w-6 h-6 text-muted-foreground/30 mb-2" />
      <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">No payment records found</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <div key={payment.id} className="p-4 rounded-xl border border-border/40 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-foreground">
                  ${payment.amount.toLocaleString()}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
                  {payment.payment_method || 'BANK TRANSFER'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-mono text-muted-foreground">
                {new Date(payment.created_at).toLocaleDateString()}
              </p>
              {payment.reference && (
                <p className="text-[9px] font-mono text-indigo-500 opacity-70">
                  Ref: {payment.reference}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
