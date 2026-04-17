"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { ArrowDownRight, ArrowUpRight, FileText, Package, Receipt, ListFilter, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { financeService } from "@/lib/domain/finance/finance.service";
import type { TransactionRecord } from "@/lib/domain/finance/finance.types";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;

      const data = await financeService.getTransactions(profile.company_id);
      setTransactions(data);
    } catch (err: any) {
      toast.error("Failed to compile master ledger.");
    } finally {
      setLoading(false);
    }
  };

  const moneyIn = transactions.filter(t => t.type === 'IN').reduce((s, t) => s + t.amount, 0);
  const moneyOut = transactions.filter(t => t.type === 'OUT').reduce((s, t) => s + t.amount, 0);

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'invoice': return <FileText className="w-4 h-4 text-emerald-600" />;
      case 'expense': return <Receipt className="w-4 h-4 text-rose-600" />;
      case 'purchase_order': return <Package className="w-4 h-4 text-indigo-600" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const columns = [
    {
      header: "Type", accessorKey: "type",
      className: "w-16",
      cell: (row: TransactionRecord) => (
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          row.type === 'IN' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
        )}>
          {row.type === 'IN' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
        </div>
      )
    },
    {
      header: "Date", accessorKey: "date",
      cell: (row: TransactionRecord) => <span className="text-xs font-mono opacity-70 whitespace-nowrap">{new Date(row.date).toLocaleDateString()}</span>
    },
    {
      header: "Description / Source", accessorKey: "description",
      cell: (row: TransactionRecord) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-sm tracking-tight">{row.description}</span>
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
            {getSourceIcon(row.source)}
            {row.source.replace('_', ' ')}
          </div>
        </div>
      )
    },
    {
      header: "Category", accessorKey: "category",
      cell: (row: TransactionRecord) => (
        <Badge variant="outline" className="text-[9px] font-bold tracking-widest py-0">
          {row.category}
        </Badge>
      )
    },
    {
      header: "Amount", accessorKey: "amount",
      className: "text-right",
      cell: (row: TransactionRecord) => (
        <div className={cn(
          "font-bold text-sm text-right",
          row.type === 'IN' ? "text-emerald-500" : "text-foreground"
        )}>
          {row.type === 'IN' ? '+' : '-'}${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 page-fade-in px-4 lg:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ListFilter className="w-8 h-8 text-primary" />
            Master Ledger
          </h1>
          <p className="text-muted-foreground font-medium">Unified chronological view of all money in and money out.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">TOTAL VOLUME IN</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-emerald-600 flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5" />
              ${moneyIn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">TOTAL VOLUME OUT</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-rose-500" />
              ${moneyOut.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-xl border-none bg-primary/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-primary">TRANSACTION COUNT</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold tracking-tight text-primary">{transactions.length}</div></CardContent>
        </Card>
      </div>

      <Card className="glass-card shadow-2xl border-none overflow-hidden">
        <DataTable 
          data={transactions} 
          columns={columns} 
          loading={loading} 
          searchPlaceholder="Search description or category..." 
        />
      </Card>
    </div>
  );
}
