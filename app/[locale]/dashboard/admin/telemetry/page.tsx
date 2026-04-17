'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Activity, 
  ShieldCheck, 
  Loader2, 
  Server, 
  Database, 
  Store, 
  Clock, 
  HardDrive, 
  Cpu, 
  RefreshCw,
  Zap,
  Waves,
  Wifi,
  Radio,
  MonitorSmartphone,
  Gauge,
  Lock,
  type LucideIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Define types based on DB schema
type TelemetryData = {
  created_at: string
  id: string
  license_id: string
  device_id: string
  store_name: string | null
  sync_status: any
  business_info: any
  metrics: {
    cpuUsage: number
    memUsage: number
    totalMem: number
    uptime: number
    dbSize: string
  } | null
  updated_at: string
  licenses: {
    license_key: string
    company_id: string | null
  } | null
}

export default function AdminTelemetryPage() {
  const [telemetry, setTelemetry] = useState<TelemetryData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTelemetry()
  }, [])

  const fetchTelemetry = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/telemetry')
      const json = await res.json()
      if (json.success) {
        setTelemetry(json.data)
      } else {
        toast.error(json.error || 'Failed to fetch telemetry protocol')
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <Activity className="w-6 h-6 text-indigo-400" />
             </div>
             <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Telemetry <span className="text-indigo-500">Sentinel</span></h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Radio className="w-4 h-4 text-indigo-500" />
            Monitoring real-time hardware status and network-wide POS performance.
          </p>
        </div>

        <div className="flex items-center gap-4">
           <Button 
             variant="ghost" 
             onClick={fetchTelemetry} 
             disabled={loading}
             className="h-12 px-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] transition-all"
           >
             {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />}
             Rescan Network
           </Button>
           <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
             <ShieldCheck className="w-3 h-3" /> Secure Node
           </div>
        </div>
      </div>

      {/* Global Intelligence Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {(
          [
            { label: 'Active Nodes', value: telemetry.length, icon: Wifi, color: 'text-emerald-400' },
            { label: 'Avg Latency', value: '42ms', icon: Waves, color: 'text-indigo-400' },
            { label: 'Network Load', value: '18%', icon: Gauge, color: 'text-amber-400' },
            { label: 'Encryption', value: 'AES-256', icon: Lock, color: 'text-purple-400' }
          ] as { label: string; value: string | number; icon: LucideIcon; color: string }[]
        ).map((stat, i) => (
          <Card key={i} className="glass-dashboard border-white/5 overflow-hidden">
             <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                   <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{stat.label}</CardDescription>
                   <stat.icon className={cn("w-4 h-4", stat.color)} />
                </div>
                <CardTitle className="text-3xl font-black tracking-tighter text-white">{stat.value}</CardTitle>
             </CardHeader>
          </Card>
        ))}
      </div>

      {/* Node Matrix */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60">Lattice Registry</h3>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-64 bg-white/5 rounded-[32px] animate-pulse" />
                ))}
             </div>
        ) : telemetry.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/5 rounded-[32px] bg-white/1">
            <Activity className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No active telemetry stream detected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {telemetry.map(data => (
              <Card key={data.id} className="glass-dashboard border-white/5 flex flex-col group overflow-hidden transition-all duration-500 hover:border-indigo-500/30">
                <CardHeader className="p-8 pb-6 border-b border-white/5 bg-white/1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-[10px] uppercase tracking-tighter group-hover:scale-110 transition-transform">
                            NODE
                         </div>
                         <div>
                            <div className="font-mono text-sm tracking-widest font-black text-indigo-400 mb-0.5">
                               {data.licenses?.license_key || 'UNREGISTERED'}
                            </div>
                            <div className="flex items-center gap-2">
                               <Store className="w-3 h-3 text-muted-foreground" />
                               <span className="text-xs font-bold text-white tracking-tight">{data.store_name || 'Generic POS Node'}</span>
                            </div>
                         </div>
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end">
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5 justify-end">
                          <Clock className="w-3 h-3" /> Last Pulse
                       </span>
                       <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[9px] px-3 py-1 rounded-full uppercase">
                         {new Date(data.updated_at || data.created_at || '').toLocaleTimeString()}
                       </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8 pt-6 grow bg-black/20">
                  {data.metrics ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 opacity-60"><Cpu className="w-3 h-3" /> CPU</p>
                        <div className="space-y-1.5">
                           <div className="text-xl font-black text-white">{data.metrics.cpuUsage.toFixed(1)}%</div>
                           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" 
                                style={{ width: `${data.metrics.cpuUsage}%` }} 
                              />
                           </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 opacity-60"><Cpu className="w-3 h-3" /> RAM</p>
                        <div className="space-y-1.5">
                           <div className="text-xl font-black text-white">{Math.round(data.metrics.memUsage)}%</div>
                           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all duration-1000" 
                                style={{ width: `${data.metrics.memUsage}%` }} 
                              />
                           </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 opacity-60"><Clock className="w-3 h-3" /> UPTIME</p>
                        <div className="text-xl font-black text-white">{Math.round(data.metrics.uptime / 60 / 60)}h</div>
                        <p className="text-[9px] font-medium text-muted-foreground/40 uppercase">Stable Connect</p>
                      </div>

                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 opacity-60"><Database className="w-3 h-3" /> DISK</p>
                        <div className="text-xl font-black text-white">{data.metrics.dbSize}</div>
                        <p className="text-[9px] font-medium text-muted-foreground/40 uppercase">Local Storage</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-[24px] bg-black/10">
                      <Cpu className="w-6 h-6 text-muted-foreground/10 mb-2" />
                      <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest italic">No metrics payload received.</p>
                    </div>
                  )}

                  {data.business_info && (
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2"><MonitorSmartphone className="w-3.5 h-3.5" /> Identity Signature</p>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Hardware ID</span>
                            <p className="font-mono text-xs text-white truncate">{data.device_id}</p>
                         </div>
                         <div className="p-4 rounded-2xl bg-white/2 border border-white/5 space-y-1">
                            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Protocol Email</span>
                            <p className="text-xs text-white truncate">{data.business_info.email || 'UNSET'}</p>
                         </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="p-8 pt-6 border-t border-white/5 bg-white/1">
                   <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                         <Zap className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                         <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Stream Active: 1,024 pps</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300">
                         Audit Trace
                      </Button>
                   </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
