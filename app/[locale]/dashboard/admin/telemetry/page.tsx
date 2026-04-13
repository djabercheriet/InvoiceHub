'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Activity, ShieldCheck, Loader2, Server, Database, Store, Clock, HardDrive, Cpu, RefreshCw } from 'lucide-react'

// Define types based on DB schema
type TelemetryData = {
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
  last_sync_at: string
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
        toast.error(json.error || 'Failed to fetch telemetry')
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Telemetry Monitor</h1>
          <p className="text-muted-foreground mt-1">
            Super Admin center for monitoring POS client health and metrics.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={fetchTelemetry} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Refresh
          </Button>
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
            <ShieldCheck className="w-3 h-3 inline mr-1" /> Super Admin Only
          </div>
        </div>
      </div>

      {/* Telemetry List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">Connected Devices</h3>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : telemetry.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-lg bg-muted/20">
            <Activity className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No telemetry data found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {telemetry.map(data => (
              <Card key={data.id} className="border-border/50 shadow-sm flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-emerald-500" />
                        <span className="font-mono text-sm tracking-wider font-bold bg-muted px-2 rounded">
                          {data.licenses?.license_key || 'Unknown License'}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-1.5">
                        <Store className="w-4 h-4" />
                        {data.store_name || 'Unknown Store'}
                      </p>
                      <p className="text-xs font-mono text-muted-foreground mt-1 flex items-center gap-1.5">
                        <HardDrive className="w-4 h-4" />
                        Device: {data.device_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Last Sync</div>
                      <Badge variant="outline" className="text-xs font-mono">
                        {new Date(data.last_sync_at).toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 py-2 grow">
                  {data.metrics ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Cpu className="w-3 h-3" /> CPU Usage</p>
                        <p className="text-sm font-mono font-medium">{data.metrics.cpuUsage.toFixed(1)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Server className="w-3 h-3" /> Mem Usage</p>
                        <p className="text-sm font-mono font-medium">{Math.round(data.metrics.memUsage)}% <span className="text-[10px] text-muted-foreground">({Math.round(data.metrics.totalMem / 1024 / 1024 / 1024)}GB)</span></p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3 h-3" /> Uptime</p>
                        <p className="text-sm font-mono font-medium">{Math.round(data.metrics.uptime / 60 / 60)}h</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5"><Database className="w-3 h-3" /> DB Size</p>
                        <p className="text-sm font-mono font-medium">{data.metrics.dbSize}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic border border-dashed rounded p-2 text-center">No metrics logged yet.</p>
                  )}
                  
                  {data.business_info && (
                    <div className="mt-4 pt-4 border-t border-border/40">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5"><Store className="w-3.5 h-3.5" /> Business Info</p>
                      <ul className="text-xs space-y-1">
                        <li><span className="font-semibold">Email:</span> {data.business_info.email || 'N/A'}</li>
                        <li><span className="font-semibold">Phone:</span> {data.business_info.phone || 'N/A'}</li>
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
