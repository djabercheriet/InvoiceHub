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
  AlertTriangle
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Sentinel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Terminal className="w-8 h-8 text-primary" />
            System Operations
          </h1>
          <p className="text-muted-foreground font-medium">Real-time infrastructure telemetry & event auditing.</p>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl border-white/5 bg-white/5 font-bold gap-2"
            onClick={() => setPolling(!polling)}
          >
            <RefreshCw className={cn("w-4 h-4", polling && "animate-spin")} />
            {polling ? "Live Monitoring" : "Static View"}
          </Button>
          <Button size="sm" className="rounded-xl bg-indigo-600 font-bold gap-2 shadow-xl shadow-indigo-600/20">
            <Terminal className="w-4 h-4" />
            Root Shell
          </Button>
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
          <Card key={i} className="glass-dashboard border-white/5 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("p-2 rounded-xl", kpi.bg)}>
                  <kpi.icon className={cn("w-5 h-5", kpi.color)} />
                </div>
                <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Optimal</div>
              </div>
              <p className="text-3xl font-black tracking-tighter text-foreground mb-1">{kpi.value}</p>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{kpi.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl h-auto mb-8">
          <TabsTrigger value="events" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <History className="w-4 h-4 mr-2" />
            Event Stream
          </TabsTrigger>
          <TabsTrigger value="automation" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Zap className="w-4 h-4 mr-2" />
            Automation Sentinel
          </TabsTrigger>
          <TabsTrigger value="queues" className="rounded-lg px-6 py-2.5 font-bold data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
            <Layers className="w-4 h-4 mr-2" />
            Worker Queues
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search logs..." 
                    className="bg-transparent border-none pl-10 h-8 text-xs font-medium focus-visible:ring-0" 
                  />
                </div>
                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold gap-2">
                  <Filter className="w-3 h-3" />
                  Filter Tags
                </Button>
              </div>

              <div className="space-y-3">
                {loading ? (
                  [1,2,3,4,5].map(i => (
                    <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                  ))
                ) : activities.length === 0 ? (
                  <div className="p-12 text-center glass-dashboard border-white/5 rounded-2xl">
                    <History className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-sm font-bold text-muted-foreground">No events detected in stream.</p>
                  </div>
                ) : activities.map((log) => (
                  <div 
                    key={log.id} 
                    className="group relative flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/20 transition-all"
                  >
                    <div className="flex flex-col items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                      <div className="w-px flex-1 bg-white/10" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-[10px] font-black px-2 py-0 border-white/10 bg-white/5 text-indigo-400">
                          {log.activity_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground font-mono" suppressHydrationWarning>
                          {format(new Date(log.created_at), 'HH:mm:ss.ms')}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-foreground">
                        {log.entity_type} {log.activity_type} detected for entity {log.id.slice(0, 8)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                         {Object.entries(log.metadata || {}).slice(0, 3).map(([k, v]: any) => (
                           <span key={k} className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md border border-white/5 font-mono">
                             {k}: {v}
                           </span>
                         ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Alerts */}
            <div className="space-y-6">
               <Card className="glass-dashboard border-white/5 bg-indigo-600/5">
                 <CardHeader className="p-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Critical Alerts
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-4 pt-0 space-y-3">
                   <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <p className="text-xs font-bold text-amber-200 mb-1">Stripe Sync Latency</p>
                      <p className="text-[10px] text-amber-200/50 leading-relaxed font-semibold">Webhooks are experiencing 4.2s delay from US-EAST-1.</p>
                   </div>
                   <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                      <p className="text-xs font-bold text-rose-200 mb-1">Backup Protocol Failed</p>
                      <p className="text-[10px] text-rose-200/50 leading-relaxed font-semibold">Incremental backup failed for cluster HKG-01. Retrying in 4m.</p>
                   </div>
                 </CardContent>
               </Card>

               <Card className="glass-dashboard border-white/5">
                 <CardHeader className="p-4">
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                      <Settings className="w-4 h-4 text-indigo-500" />
                      Runtime Stats
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-4 pt-0 space-y-4">
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                        <span>Heap Efficiency</span>
                        <span className="text-emerald-500">82%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-emerald-500 w-[82%]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                        <span>API Throughput</span>
                        <span className="text-indigo-500">420 r/s</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-indigo-500 w-[65%]" />
                      </div>
                    </div>
                 </CardContent>
               </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
           {/* Automation Logs Terminal */}
           <div className="rounded-2xl bg-zinc-950 border border-indigo-500/20 shadow-2xl overflow-hidden font-mono text-[11px]">
              <div className="bg-zinc-900 px-4 py-2 border-b border-white/5 flex items-center justify-between">
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
                <div className="flex gap-4 animate-pulse">
                   <span className="text-white/20">--:--:--</span>
                   <span className="text-indigo-500 underline decoration-indigo-500/30">systemctl wait-for-event...</span>
                </div>
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
                  <div key={worker} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center gap-3">
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
