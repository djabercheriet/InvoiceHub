"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { TerminalSquare, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { automationService } from "@/lib/domain/automation/automation.service";
import { cn } from "@/lib/utils";

export default function ExecutionLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;
      setCompanyId(profile.company_id);

      const data = await automationService.getLogs(profile.company_id);
      setLogs(data);
    } catch (err: any) {
      toast.error("Failed to fetch execution logs");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      header: "Status", accessorKey: "status", className: "w-16",
      cell: (r: any) => (
        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", r.status === 'success' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
          {r.status === 'success' ? <CheckCircle className="w-4 h-4"/> : <XCircle className="w-4 h-4" />}
        </div>
      ) 
    },
    { 
      header: "Execution Details", accessorKey: "message", 
      cell: (r: any) => (
        <div className="flex flex-col gap-1">
          <span className="font-bold text-sm tracking-tight">{r.message}</span>
          <div className="flex gap-2">
            <span className="text-[10px] text-muted-foreground font-mono bg-muted px-1.5 rounded uppercase tracking-wider">{r.automation_rules?.name || 'Unknown Rule'}</span>
            <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 px-1.5 rounded">{new Date(r.executed_at).toLocaleString()}</span>
          </div>
        </div>
      ) 
    }
  ];

  const successRate = logs.length > 0 
    ? Math.round((logs.filter(l => l.status === 'success').length / logs.length) * 100) 
    : 100;

  return (
    <div className="space-y-8 page-fade-in px-4 lg:px-0 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <TerminalSquare className="w-8 h-8 text-slate-500" />
            Execution Logs
          </h1>
          <p className="text-muted-foreground font-medium">Diagnostic history of all automated actions triggered by the system.</p>
        </div>
        <Button onClick={fetchLogs} variant="outline" size="lg" className="gap-2 font-bold tracking-tight">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">TOTAL EXECUTIONS</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold tracking-tight">{logs.length}</div></CardContent>
        </Card>
        <Card className="glass-card shadow-xl border-none bg-emerald-500/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-emerald-600">SUCCESS RATE</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold tracking-tight text-emerald-600">{successRate}%</div></CardContent>
        </Card>
        <Card className="glass-card shadow-xl border-none bg-rose-500/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-rose-600">FAILURES</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold tracking-tight text-rose-600">{logs.filter(l => l.status !== 'success').length}</div></CardContent>
        </Card>
      </div>

      <Card className="glass-card shadow-2xl border-none overflow-hidden">
        <DataTable 
          data={logs} 
          columns={columns} 
          loading={loading}
          searchPlaceholder="Search diagnostic messages..."
        />
      </Card>
    </div>
  );
}
