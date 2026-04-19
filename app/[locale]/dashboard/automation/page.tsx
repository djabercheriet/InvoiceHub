"use client";

import { useEffect, useState } from "react";
import { Zap, Play, CheckCircle2, AlertCircle, Clock, Search, Settings2, ShieldAlert, BarChart, Plus, ArrowUpRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { automationService } from "@/lib/domain/automation/automation.service";
import { useAuthUser } from "@/hooks/use-auth-user";

export default function AutomationHub() {
  const { user } = useAuthUser();
  const [logs, setLogs] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
       fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const supabase = (await import("@/lib/supabase/client")).createClient();
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user?.id).single();
      
      if (profile?.company_id) {
        const [loadedRules, loadedLogs] = await Promise.all([
          automationService.getRules(profile.company_id),
          automationService.getLogs(profile.company_id)
        ]);
        setRules(loadedRules);
        setLogs(loadedLogs);
      }
    } catch (e) {
       console.error("Failed to load automation data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (ruleId: string, active: boolean) => {
    try {
      await automationService.toggleRuleActive(ruleId, active);
      setRules(rules.map(r => r.id === ruleId ? { ...r, is_active: active } : r));
      toast.success(`Workflow ${active ? 'activated' : 'paused'}`);
    } catch (e) {
      toast.error("Failed to update workflow state");
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Zap className="w-8 h-8 text-primary" />
            Automation Hub
          </h1>
          <p className="text-muted-foreground font-medium">
            Configure intelligent workflows and real-time autonomous system triggers.
          </p>
        </div>
        <Button size="lg" className="bg-primary hover:bg-primary/90 font-bold tracking-tight h-12 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all">
          <Plus className="w-4 h-4 mr-2" /> New Workflow
        </Button>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Active Rules', value: rules.filter(r => r.is_active).length, icon: Play, color: 'text-primary', bg: 'bg-primary/5', border: 'border-primary/20' },
          { label: 'Executions (24H)', value: logs.length, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
          { label: 'Success Rate', value: '100%', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
        ].map((m, i) => (
          <Card key={i} className={cn("glass-dashboard relative overflow-hidden group border-2", m.border)}>
             <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <m.icon className={cn("w-32 h-32", m.color)} />
             </div>
             <CardContent className="p-8 relative z-10">
                <p className="text-[10px] font-black text-muted-foreground tracking-[0.2em] uppercase mb-3">{m.label}</p>
                <h2 className="text-5xl font-black text-foreground">{m.value}</h2>
             </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Playbooks / Workflows */}
        <div className="xl:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <Settings2 className="w-6 h-6 text-muted-foreground"/> 
                Deployed Playbooks
              </h3>
              <div className="relative w-72 group">
                 <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                 <Input placeholder="Search workflows..." className="pl-11 h-12 bg-surface-alpha border-white/5 focus:border-primary/50 rounded-2xl transition-all" />
              </div>
           </div>

           <div className="space-y-4">
              {rules.length > 0 ? rules.map(rule => (
                 <Card key={rule.id} className={cn("transition-all duration-500 border-2", rule.is_active ? "border-white/10 glass-dashboard shadow-xl hover:border-primary/40" : "border-white/5 opacity-40 grayscale")}>
                    <CardContent className="p-6 flex items-start gap-8">
                       <div className={cn("p-5 rounded-3xl bg-surface-alpha border border-white/10 group-hover:scale-110 transition-transform")}>
                          <Zap className={cn("w-8 h-8", rule.is_active ? "text-amber-500 fill-amber-500/10" : "text-muted-foreground")} />
                       </div>
                       <div className="flex-1 space-y-2 mt-1">
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <h4 className="font-black text-xl tracking-tight">{rule.name}</h4>
                                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest bg-surface-alpha border-white/10">{rule.trigger_event}</Badge>
                             </div>
                             <Switch checked={rule.is_active} onCheckedChange={(val) => handleToggle(rule.id, val)} className="data-[state=checked]:bg-primary" />
                          </div>
                          <p className="text-muted-foreground font-semibold leading-relaxed max-w-2xl">{rule.description || "Automatic system response triggered by event."}</p>
                          <div className="flex items-center gap-6 pt-5">
                             <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black text-muted-foreground tracking-widest uppercase">Evaluated Instantly</span>
                             </div>
                             <div className="flex items-center gap-2">
                                <ArrowUpRight className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[10px] font-black text-primary tracking-widest uppercase">Action: {rule.action_type}</span>
                             </div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
              )) : (
                <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
                   <div className="w-20 h-20 bg-surface-alpha rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Zap className="w-10 h-10 text-muted-foreground/30" />
                   </div>
                   <h3 className="text-xl font-black mb-2 opacity-40">No Workflows Configured</h3>
                   <p className="text-muted-foreground font-semibold max-w-xs mx-auto">Create your first autonomous playbook to begin monitoring system events.</p>
                </div>
              )}
           </div>
        </div>

        {/* Execution Log stream */}
        <div className="space-y-8">
           <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
             <Activity className="w-6 h-6 text-muted-foreground"/> 
             System Stream
           </h3>
           <Card className="glass-dashboard shadow-2xl border-white/10 h-[700px] flex flex-col rounded-3xl overflow-hidden">
              <CardHeader className="border-b border-white/5 pb-5 bg-white/3">
                 <div className="flex items-center justify-between">
                    <CardTitle className="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Execution Ledger</CardTitle>
                    <div className="flex gap-1">
                       <div className="w-1 h-1 rounded-full bg-primary animate-ping" />
                       <span className="text-[10px] font-black text-primary uppercase tracking-widest">Live</span>
                    </div>
                 </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-0 scrollbar-hide">
                 {logs.length > 0 ? (
                    <div className="divide-y divide-white/5">
                       {logs.map((log: any, i) => (
                          <div key={i} className="p-6 hover:bg-white/4 transition-all group">
                             <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-[9px] uppercase font-black tracking-widest border-primary/30 text-primary bg-primary/5">{log.automation_rules?.action_type || 'SYSTEM'}</Badge>
                                <span className="text-[10px] text-muted-foreground font-black tracking-widest uppercase">{new Date(log.executed_at).toLocaleTimeString()}</span>
                             </div>
                             <p className="text-sm text-foreground font-bold tracking-tight leading-snug">{log.message}</p>
                             <div className="flex items-center gap-2 mt-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Handled by {log.automation_rules?.name || 'Engine'}</span>
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground space-y-5">
                       <div className="p-6 rounded-3xl bg-white/2 border border-white/5">
                          <Zap className="w-12 h-12 opacity-10" />
                       </div>
                       <div className="space-y-1">
                          <p className="text-sm font-black uppercase tracking-widest opacity-40">Awaiting Triggers</p>
                          <p className="text-xs font-semibold opacity-30">Stream is listening for system events...</p>
                       </div>
                    </div>
                 )}
              </CardContent>
           </Card>
        </div>

      </div>
    </div>
  );
}
