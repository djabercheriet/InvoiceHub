"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  History, TrendingUp, TrendingDown, Package,
  ArrowUpRight, ArrowDownRight, Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function InventoryMovementsPage() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchMovements();
  }, []);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;

      const { data, error } = await supabase
        .from("stock_movements")
        .select("*, products(name, sku)")
        .eq("company_id", profile.company_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setMovements(data || []);
    } catch (err: any) {
      toast.error("Audit feed failure: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse text-xs font-bold tracking-widest text-muted-foreground uppercase">Synchronizing Audit Feed...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <History className="w-8 h-8 text-primary" />
            Stock Ledger
          </h1>
          <p className="text-muted-foreground font-medium">Immutable audit trail of physical asset movements and stock adjustments.</p>
        </div>
        <div className="relative w-full md:w-64">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
           <Input placeholder="Scan ledger..." className="pl-9 glass-card" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card bg-emerald-500/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Input Volume</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-600">+{movements.filter(m => m.movement_type === 'in').reduce((a, b) => a + b.quantity, 0)}</div></CardContent>
        </Card>
        <Card className="glass-card bg-orange-500/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-orange-600 uppercase">Output Volume</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-orange-600">-{movements.filter(m => m.movement_type === 'out').reduce((a, b) => a + b.quantity, 0)}</div></CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Ledger Entries</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{movements.length}</div></CardContent>
        </Card>
      </div>

      <Card className="glass-card border-none shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border/40">
              <tr>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase">Protocol TS</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase">Asset Spec</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-center">Operation</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase text-right">Delta</th>
                <th className="p-4 text-[10px] font-bold tracking-widest uppercase">Log Note</th>
              </tr>
            </thead>
            <tbody>
              {movements.map(m => (
                <tr key={m.id} className="border-b border-border/10 hover:bg-muted/20 transition-colors group">
                  <td className="p-4 text-xs font-mono opacity-60">{new Date(m.created_at).toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold tracking-tight text-sm group-hover:text-primary transition-colors">{m.products?.name}</span>
                      <span className="text-[9px] font-mono opacity-50">SKU: {m.products?.sku}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <Badge className={cn(
                      "text-[9px] font-bold", 
                      m.movement_type === 'in' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-orange-500/10 text-orange-600 border-orange-500/20"
                    )}>
                      {m.movement_type.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <div className={cn("font-bold tracking-tight", m.movement_type === 'in' ? "text-emerald-500" : "text-orange-500")}>
                      {m.movement_type === 'in' ? '+' : '-'}{m.quantity}
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground font-medium italic">{m.note || 'NO_METADATA'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {movements.length === 0 && <div className="p-20 text-center text-muted-foreground text-sm font-bold tracking-tighter italic">Ledger is empty. Waiting for operational signals.</div>}
        </div>
      </Card>
    </div>
  );
}
