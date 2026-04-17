"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ArrowDownRight, ArrowUpRight, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { financeService } from "@/lib/domain/finance/finance.service";

export default function FinanceOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;

      const pnl = await financeService.getProfitAndLoss(profile.company_id);
      setData(pnl);
    } catch (err: any) {
      toast.error("Failed to fetch financial data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground animate-pulse">Calculating financials</p>
      </div>
    );
  }

  const { revenue, expenses, cogs, netProfit, profitMargin } = data || { revenue: 0, expenses: 0, cogs: 0, netProfit: 0, profitMargin: 0 };
  const isProfitable = netProfit >= 0;

  return (
    <div className="space-y-8 page-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Financial Overview
          </h1>
          <p className="text-muted-foreground font-medium">Real-time Profit & Loss calculation based on invoices, POs, and expenses.</p>
        </div>
      </div>

      {/* Main KPI */}
      <Card className={cn(
        "border-none shadow-2xl glass-card relative overflow-hidden",
        isProfitable ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20"
      )}>
        <div className={cn(
          "absolute top-0 right-0 w-64 h-64 opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3",
          isProfitable ? "bg-emerald-500" : "bg-rose-500"
        )} />
        <CardContent className="p-10">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className={cn(
                "text-[10px] font-bold tracking-widest uppercase py-1 px-3 rounded-full",
                isProfitable ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
              )}>
                Net Profit
              </span>
              <div className={cn(
                "flex items-center gap-2 text-sm font-bold",
                isProfitable ? "text-emerald-500" : "text-rose-500"
              )}>
                {isProfitable ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {profitMargin.toFixed(1)}% MARGIN
              </div>
            </div>
            
            <div className={cn(
              "text-7xl font-black tracking-tighter",
              isProfitable ? "text-emerald-500" : "text-rose-500"
            )}>
              {isProfitable ? '+' : '-'}${Math.abs(netProfit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* P&L Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card shadow-xl border-none ring-1 ring-border/50 hover:ring-emerald-500/50 transition-all">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-xs font-bold tracking-widest text-emerald-600 flex items-center justify-between">
              REVENUE <ArrowDownRight className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold tracking-tight">${revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">From fully paid invoices</p>
          </CardContent>
        </Card>

        <Card className="glass-card shadow-xl border-none ring-1 ring-border/50 hover:ring-indigo-500/50 transition-all">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-xs font-bold tracking-widest text-indigo-600 flex items-center justify-between">
              COGS (Cost of Goods) <Package className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold tracking-tight">${cogs.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">From received purchase orders</p>
            {revenue > 0 && <Progress value={(cogs / revenue) * 100} className="h-1 mt-4 bg-indigo-500/10 [&>div]:bg-indigo-500" />}
          </CardContent>
        </Card>

        <Card className="glass-card shadow-xl border-none ring-1 ring-border/50 hover:ring-rose-500/50 transition-all">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-xs font-bold tracking-widest text-rose-600 flex items-center justify-between">
              OPEX (Operational) <ArrowUpRight className="w-4 h-4" />
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-4xl font-bold tracking-tight">${expenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-muted-foreground mt-2 font-medium">From logged operational expenses</p>
            {revenue > 0 && <Progress value={(expenses / revenue) * 100} className="h-1 mt-4 bg-rose-500/10 [&>div]:bg-rose-500" />}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
