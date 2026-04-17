"use client";

import { BarChart3, Package, FileText, Users, Activity, TrendingUp, Search, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export function DashboardPreview() {
  return (
    <div className="relative w-full max-w-7xl mx-auto mt-20 group">
      {/* Decorative Neon Blobs Behind */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-20 w-80 h-80 bg-primary/20 blur-[130px] rounded-full animate-float" />
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-emerald-600/10 blur-[130px] rounded-full animate-float [animation-delay:2s]" />
      </div>

      {/* The Dashboard Frame */}
      <div className="relative rounded-3xl border border-border/50 bg-card/80 backdrop-blur-3xl p-4 lg:p-6 shadow-2xl shadow-primary/10 transition-all duration-700 group-hover:shadow-primary/20 group-hover:border-border">
        
        {/* Fake Top Nav */}
        <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-6">
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 rounded-lg overflow-hidden border border-border/50">
               <img src="/Icon.png" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <div className="hidden sm:flex h-8 w-64 items-center gap-2 rounded-lg bg-secondary/50 border border-border/50 px-3 text-[10px] text-muted-foreground/50">
               <Search className="w-3 h-3" /> Search invoices...
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/50">
               <Bell className="w-4 h-4 text-muted-foreground/40" />
             </div>
             <div className="w-8 h-8 rounded-lg bg-primary border border-primary/20" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Main Content Area (3 cols) */}
          <div className="md:col-span-3 space-y-6">
            
            {/* KPI Grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Revenue', value: '$299.3k', trend: '+12.5%', color: 'text-indigo-600 dark:text-indigo-400' },
                { label: 'Pending', value: '$12.4k', trend: '-2.1%', color: 'text-rose-600 dark:text-rose-400' },
                { label: 'Inventory', value: '4.2k', trend: '+5.4%', color: 'text-emerald-600 dark:text-emerald-400' },
              ].map((kpi, i) => (
                <div key={i} className="p-4 rounded-2xl bg-secondary/30 border border-border/50">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">{kpi.label}</p>
                  <p className="text-xl lg:text-2xl font-black text-foreground">{kpi.value}</p>
                  <p className={cn("text-[10px] font-bold mt-1", kpi.color)}>{kpi.trend}</p>
                </div>
              ))}
            </div>

            {/* Visual Chart Placeholder (CSS based) */}
            <div className="relative aspect-video rounded-2xl bg-secondary/30 border border-border/50 overflow-hidden p-6">
               <div className="flex items-center justify-between mb-8">
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-widest">Revenue Growth</h4>
                  <div className="flex gap-2">
                     <div className="w-3 h-3 rounded-full bg-primary" />
                     <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
               </div>
               
               {/* Synthetic Area Chart with SVG */}
               <svg className="w-full h-full opacity-60" viewBox="0 0 100 40">
                 <defs>
                   <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                     <stop offset="0%" className="text-primary" style={{stopColor:'currentColor', stopOpacity:0.4}} />
                     <stop offset="100%" className="text-primary" style={{stopColor:'currentColor', stopOpacity:0}} />
                   </linearGradient>
                 </defs>
                 <path 
                   d="M 0 40 L 0 35 Q 10 32 20 36 T 40 28 T 60 33 T 80 20 T 100 25 L 100 40 Z" 
                   fill="url(#grad)" 
                   className="animate-pulse"
                 />
                 <path 
                   d="M 0 35 Q 10 32 20 36 T 40 28 T 60 33 T 80 20 T 100 25" 
                   fill="none" 
                   stroke="currentColor" 
                   className="text-primary"
                   strokeWidth="0.5" 
                 />
                 {/* Secondary Line */}
                 <path 
                   d="M 0 38 Q 15 30 30 35 T 60 25 T 100 30" 
                   fill="none" 
                   stroke="#10b981" 
                   strokeWidth="0.5" 
                   strokeDasharray="1 1"
                 />
               </svg>
            </div>
          </div>

          {/* Sidebar Area (1 col) */}
          <div className="space-y-4">
             <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-4">Recent Sales</h4>
                <div className="space-y-4">
                   {[1,2,3,4].map(i => (
                     <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-secondary" />
                        <div className="flex-1">
                           <div className="h-2 w-16 bg-foreground/20 rounded-full mb-1" />
                           <div className="h-1.5 w-10 bg-foreground/5 rounded-full" />
                        </div>
                        <div className="h-2 w-8 bg-primary/40 rounded-full" />
                     </div>
                   ))}
                </div>
             </div>

             <div className="p-4 rounded-2xl bg-secondary/30 border border-border/50 h-full">
                <h4 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-4">Audit Logs</h4>
                <div className="space-y-3">
                   {[1,2,3].map(i => (
                     <div key={i} className="flex gap-2">
                        <div className="w-1 h-3 bg-primary rounded-full mt-0.5" />
                        <div className="space-y-1">
                           <div className="h-1.5 w-24 bg-foreground/10 rounded-full" />
                           <div className="h-1 w-12 bg-foreground/5 rounded-full" />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Floating UI Badges */}
      <div className="absolute -top-10 -right-10 hidden lg:block p-4 rounded-2xl glass-dashboard animate-float shadow-primary/20 z-20">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
               <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Growth</p>
               <p className="text-lg font-black text-foreground">+142%</p>
            </div>
         </div>
      </div>

      <div className="absolute -bottom-6 -left-10 hidden lg:block p-4 rounded-2xl glass-dashboard animate-float shadow-primary/20 z-20 [animation-delay:1.5s]">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
               <Activity className="w-5 h-5 text-orange-400" />
            </div>
            <div>
               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Live Monitoring</p>
               <p className="text-lg font-black text-foreground">48ms Latency</p>
            </div>
         </div>
      </div>
    </div>
  );
}
