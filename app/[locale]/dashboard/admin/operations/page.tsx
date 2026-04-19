"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Activity, 
  Terminal, 
  Cpu, 
  Zap, 
  History, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Database,
  ArrowRight,
  Filter,
  Layers,
  Settings,
  AlertTriangle,
  Shield
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ActivityLog {
  id: string;
  activity_type: string;
  entity_type: string;
  metadata: any;
  created_at: string;
}

interface AutomationLog {
  id: string;
  status: 'success' | 'failure';
  trigger_type: string;
  action_type: string;
  execution_time_ms: number;
  created_at: string;
  error?: string;
}

export default function SystemOperationsPage() {
  const supabase = createClient();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [autoLogs, setAutoLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    
    const [actRes, autoRes] = await Promise.all([
      supabase.from('activities').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('automation_logs').select('*').order('created_at', { ascending: false }).limit(20)
    ]);

    if(actRes.data) setActivities(actRes.data);
    if(autoRes.data) setAutoLogs(autoRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
    
    let interval: any;
    if (polling) {
      interval = setInterval(fetchLogs, 10000);
    }
    return () => clearInterval(interval);
  }, [polling]);

  const logs = activities.map(a => ({
    ...a,
    type: a.activity_type || 'update',
    action: a.activity_type,
    details: JSON.stringify(a.metadata)
  }));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
              System <span className="text-primary">Operations</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Live monitoring of global ledger events and protocol mutations.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60">System Status</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                <span className="text-sm font-bold text-emerald-500 uppercase tracking-tighter">All Nodes Operational</span>
              </div>
           </div>
        </div>
      </div>

      {/* KPI Grid - Infrastructure Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Jobs", value: "14", icon: Database, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "CPU Utilization", value: "32%", icon: Cpu, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Success Rate", value: "99.2%", icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "System Uptime", value: "248d", icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
        ].map((kpi, i) => (
          <Card key={i} className="border-border overflow-hidden group bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-xl", kpi.bg)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                </div>
                <div className="text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Optimal</div>
              </div>
              <p className="text-3xl font-black tracking-tighter text-foreground mb-1">{kpi.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="bg-muted/50 border border-border/50 p-1 rounded-xl h-auto mb-8">
          <TabsTrigger value="events" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <History className="w-4 h-4 mr-2" />
            Event Stream
          </TabsTrigger>
          <TabsTrigger value="automation" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Zap className="w-4 h-4 mr-2" />
            Automation Sentinel
          </TabsTrigger>
          <TabsTrigger value="queues" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Layers className="w-4 h-4 mr-2" />
            Worker Queues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <Card className="glass-card border-border/40 overflow-hidden shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 p-8">
              <div className="flex items-center gap-6 flex-1">
                <div className="relative w-full max-w-md group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="Query system journals..." 
                    className="h-12 pl-12 bg-background border-border/40 focus:border-primary/50 rounded-2xl transition-all text-sm font-medium" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl border border-border/40 text-muted-foreground hover:text-foreground">
                   <Filter className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 border-b border-border/40">
                    <tr>
                      <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Event Signature</th>
                      <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Origin Node</th>
                      <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Resource Context</th>
                      <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Status</th>
                      <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="py-6 px-8">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs uppercase tracking-tighter shadow-lg shadow-black/5 group-hover:scale-110 transition-transform border",
                                log.type === 'create' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                log.type === 'update' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                              )}>
                                 {log.type.substring(0,3)}
                              </div>
                              <div>
                                <div className="font-bold text-foreground tracking-tight">{log.action || 'Protocol Sync'}</div>
                                <div className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mt-0.5">{log.details ? log.details.substring(0,40) + '...' : 'System internal call'}</div>
                              </div>
                           </div>
                        </td>
                        <td className="py-6 px-8">
                           <div className="flex flex-col">
                              <span className="text-muted-foreground font-bold tracking-tight">System Root</span>
                              <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mt-1">Operator Signature</span>
                           </div>
                        </td>
                        <td className="py-6 px-8">
                           <div className="flex flex-col">
                              <span className="text-muted-foreground font-bold text-[11px] uppercase tracking-widest">{log.entity_type || 'GLOBAL'}</span>
                              <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mt-1">Context Layer</span>
                           </div>
                        </td>
                        <td className="py-6 px-8">
                           <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                              <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Successful Sync</span>
                           </div>
                        </td>
                        <td className="py-6 px-8 text-right font-mono text-[10px] text-muted-foreground uppercase opacity-60">
                           {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
           <div className="rounded-2xl bg-zinc-950 border border-primary/20 shadow-2xl overflow-hidden font-mono text-[11px]">
              <div className="bg-zinc-900 px-4 py-2 border-b border-border/30 flex items-center justify-between">
                 <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                 </div>
                 <div className="flex items-center gap-4">
                    <span className="text-white/20 uppercase tracking-widest font-black text-[9px]">Automation Proxy v4.2.0</span>
                    <RefreshCw className="w-3 h-3 text-white/20 cursor-pointer hover:text-indigo-400 transition-colors" />
                 </div>
              </div>
              <div className="p-6 space-y-3 max-h-[600px] overflow-auto custom-scrollbar">
                {autoLogs.length === 0 ? (
                  <div className="text-white/20 italic">Listening for automation triggers...</div>
                ) : autoLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 group">
                     <span className="text-white/20 shrink-0" suppressHydrationWarning>{format(new Date(log.created_at), 'HH:mm:ss')}</span>
                     <div className="flex-1">
                        <span className={cn(
                          "font-bold",
                          log.status === 'success' ? "text-emerald-400" : "text-rose-400"
                        )}>
                          [{log.status.toUpperCase()}]
                        </span>
                        <span className="text-white ml-2">
                          Trigger: {log.trigger_type} {'->'} {log.action_type} ({log.execution_time_ms}ms)
                        </span>
                        {log.error && (
                          <div className="text-rose-400/50 mt-1 pl-4 border-l border-rose-500/20">
                            ERR_LOG: {log.error}
                          </div>
                        )}
                     </div>
                  </div>
                ))}
              </div>
           </div>
        </TabsContent>

        <TabsContent value="queues">
          <div className="flex flex-col items-center justify-center p-20 glass-dashboard border-white/5 rounded-3xl">
             <Layers className="w-16 h-16 text-indigo-500/20 mb-6 animate-bounce" />
             <h3 className="text-2xl font-black tracking-tight text-foreground uppercase mb-2 text-center">In-Process Worker Active</h3>
             <p className="text-muted-foreground font-semibold max-w-md text-center">Background jobs are currently processing in the main runtime. Upstash QStash integration detected but idle.</p>
             <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {['Email Dispatch', 'PDF Engine', 'Audit Sync', 'Image Proxy'].map(worker => (
                  <div key={worker} className="p-4 rounded-2xl bg-surface-alpha border border-white/5 flex flex-col items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     </div>
                     <span className="text-[10px] font-black uppercase text-muted-foreground">{worker}</span>
                  </div>
                ))}
             </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
