'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { 
  Key, 
  Trash2, 
  PowerOff, 
  ShieldCheck, 
  Loader2, 
  Plus, 
  MonitorSmartphone, 
  CalendarClock,
  Fingerprint,
  Zap,
  Globe,
  Database,
  Cpu,
  History,
  Activity,
  Terminal,
  Lock,
  Unlock
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Define types based on DB schema
type Activation = {
  id: string
  device_id: string
  activated_at: string
}

type License = {
  id: string
  license_key: string
  status: string
  company_id: string
  company: { name: string, email: string } | null
  max_devices: number
  used_devices: number
  expiry_date: string | null
  activations: Activation[]
}

export default function AdminLicensesPage() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [newKeyInput, setNewKeyInput] = useState('')
  const [newKeyDevices, setNewKeyDevices] = useState(1)

  useEffect(() => {
    fetchLicenses()
  }, [])

  const fetchLicenses = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/licenses')
      const json = await res.json()
      if (json.success) {
        setLicenses(json.data)
      } else {
        toast.error(json.error || 'Failed to fetch licenses')
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRevokeDevice = async (activationId: string) => {
    if (!confirm('AUTHORIZED ACTION: Deactivate this hardware signature from the network?')) return
    setActionLoading(`revoke-${activationId}`)
    try {
      const res = await fetch('/api/admin/licenses/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activationId })
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Hardware signature revoked.')
        fetchLicenses()
      } else {
        toast.error(json.error)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleUpdateStatus = async (licenseId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active'
    setActionLoading(`status-${licenseId}`)
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          payload: { licenseId, status: newStatus }
        })
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Access level set to: ${newStatus.toUpperCase()}`)
        fetchLicenses()
      } else {
        toast.error(json.error)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeleteLicense = async (licenseId: string) => {
    if (!confirm('PROTOCOL OVERRIDE: Permanently purge this authorization key and all linked telemetry records?')) return
    setActionLoading(`delete-${licenseId}`)
    try {
      const res = await fetch(`/api/admin/licenses?id=${licenseId}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Authorization key purged from registry.')
        fetchLicenses()
      } else {
        toast.error(json.error)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCreateLicense = async () => {
    if (!newKeyInput) return toast.error('Encryption key signature required.')
    setActionLoading('create')
    try {
      const res = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          payload: {
            license_key: newKeyInput,
            max_devices: newKeyDevices
          }
        })
      })
      const json = await res.json()
      if (json.success) {
        toast.success('New authorization key issued.')
        setNewKeyInput('')
        setNewKeyDevices(1)
        fetchLicenses()
      } else {
        toast.error(json.error)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <ShieldCheck className="w-6 h-6 text-indigo-400" />
             </div>
             <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Access <span className="text-indigo-500">Control</span></h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Key className="w-4 h-4 text-indigo-500" />
            Managing hardware authentication and platform licensing protocols.
          </p>
        </div>

        <div className="flex items-center gap-3 p-3 bg-surface-alpha border border-white/10 rounded-2xl">
           <Fingerprint className="w-5 h-5 text-indigo-400 animate-pulse" />
           <p className="text-[10px] font-black tracking-widest text-white/40 uppercase">Root Security Mode Active</p>
        </div>
      </div>

      {/* Issuance Deck */}
      <Card className="glass-dashboard border-white/5 bg-linear-to-br from-indigo-500/3 to-transparent overflow-hidden">
        <CardHeader className="p-8 pb-4">
           <div className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-indigo-500" />
              <CardTitle className="text-xl font-black tracking-tight text-white uppercase italic">Issue Authorization Key</CardTitle>
           </div>
           <CardDescription className="text-muted-foreground font-medium mt-1">Generate authoritative keys for network-wide device activation.</CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="space-y-2 flex-1 group">
               <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">Key Signature (Uppercase)</label>
               <Input
                 placeholder="BNT-PRTO-XXXX"
                 value={newKeyInput}
                 onChange={(e) => setNewKeyInput(e.target.value.toUpperCase())}
                 className="h-14 bg-surface-alpha border-white/5 focus:border-indigo-500/50 rounded-2xl font-mono text-lg font-bold tracking-widest transition-all"
               />
            </div>
            <div className="space-y-2 w-full md:w-32">
               <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Volume Cap</label>
               <Input
                 type="number"
                 min={1}
                 value={newKeyDevices}
                 onChange={(e) => setNewKeyDevices(parseInt(e.target.value) || 1)}
                 className="h-14 bg-surface-alpha border-white/5 focus:border-indigo-500/50 rounded-2xl font-black text-center text-lg"
               />
            </div>
            <Button 
              onClick={handleCreateLicense} 
              disabled={actionLoading === 'create'}
              className="h-14 px-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              {actionLoading === 'create' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Terminal className="w-4 h-4 mr-2" />}
              Deploy Protocol
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registry Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
               <History className="w-3.5 h-3.5" /> Registry Feed
            </h3>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Real-time sync</span>
            </div>
        </div>

        {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-64 bg-surface-alpha rounded-[32px] animate-pulse" />
                ))}
             </div>
        ) : licenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border border-dashed border-white/5 rounded-[32px] bg-white/1">
            <Key className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No authorization protocols found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {licenses.map(license => (
              <Card key={license.id} className="glass-dashboard border-white/5 flex flex-col group overflow-hidden transition-all duration-500 hover:border-indigo-500/30">
                <CardHeader className="p-8 pb-6 border-b border-white/5 bg-white/1">
                  <div className="flex justify-between items-start">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <Badge 
                           className={cn(
                             "font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-full",
                             license.status === 'active' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                           )}
                         >
                           {license.status}
                         </Badge>
                         <span className="font-mono text-sm tracking-[0.2em] font-black bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-xl">
                            {license.license_key}
                         </span>
                      </div>
                      
                      {license.company ? (
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs uppercase italic drop-shadow-[0_0_8px_rgba(99,102,241,0.3)]">
                               {license.company.name.substring(0,2)}
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-white tracking-tight">{license.company.name}</span>
                               <span className="text-[10px] font-medium text-muted-foreground/60">{license.company.email}</span>
                            </div>
                         </div>
                      ) : (
                         <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/5 border border-yellow-500/20 rounded-xl w-fit">
                            <Globe className="w-3 h-3 text-yellow-500" />
                            <span className="text-[10px] font-black text-yellow-500/80 uppercase tracking-widest">Universal Node Pool</span>
                         </div>
                      )}
                    </div>
                    
                    <div className="text-right flex flex-col items-end">
                       <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5 justify-end">
                          <Cpu className="w-3 h-3" /> Activation Lattice
                       </span>
                       <div className="text-4xl font-black tracking-tighter flex items-baseline gap-1">
                          <span className={cn(
                            license.used_devices >= license.max_devices ? "text-red-500" : "text-emerald-500"
                          )}>{license.used_devices}</span>
                          <span className="text-xl text-muted-foreground/30">/</span>
                          <span className="text-white/40">{license.max_devices}</span>
                       </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-8 pt-6 grow bg-black/20">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2 opacity-60">
                       <MonitorSmartphone className="w-3.5 h-3.5" /> Hardware Vector Register
                    </h4>
                    {license.activations && license.activations.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {license.activations.map((act) => (
                          <div key={act.id} className="flex items-center justify-between bg-white/3 p-4 rounded-2xl border border-white/5 hover:bg-surface-alpha hover:border-indigo-500/20 transition-all group/item">
                            <div className="flex items-center gap-4">
                               <div className="p-2 bg-indigo-500/5 rounded-xl border border-indigo-500/10 group-hover/item:border-indigo-500/30 transition-colors">
                                  <MonitorSmartphone className="w-4 h-4 text-indigo-400" />
                               </div>
                               <div className="flex flex-col">
                                  <span className="font-mono text-xs font-black text-white/80 group-hover/item:text-indigo-400 transition-colors">{act.device_id}</span>
                                  <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest mt-1">Identified: {new Date(act.activated_at).toLocaleDateString()}</span>
                               </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-red-500/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                              onClick={() => handleRevokeDevice(act.id)}
                              disabled={actionLoading === `revoke-${act.id}`}
                            >
                              {actionLoading === `revoke-${act.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <PowerOff className="w-4 h-4" />}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-[24px] bg-black/10">
                        <MonitorSmartphone className="w-6 h-6 text-muted-foreground/10 mb-2" />
                        <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest italic">No hardware instances active.</p>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="p-8 pt-6 border-t border-white/5 bg-white/1 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-3">
                     <div className="p-2 bg-indigo-500/5 rounded-xl">
                        <CalendarClock className="w-4 h-4 text-indigo-400" />
                     </div>
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                       Protocol Horizon: <span className="text-white ml-2">{license.expiry_date ? new Date(license.expiry_date).toLocaleDateString() : 'LIFETIME INFINTY'}</span>
                     </span>
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto">
                    <Button
                      variant="ghost"
                      onClick={() => handleUpdateStatus(license.id, license.status)}
                      disabled={actionLoading === `status-${license.id}`}
                      className={cn(
                        "h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] border transition-all flex-1 md:flex-none",
                        license.status === 'active' 
                          ? "border-red-500/20 text-red-400 hover:bg-red-500/10" 
                          : "border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      )}
                    >
                      {actionLoading === `status-${license.id}` ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : 
                        license.status === 'active' ? <Lock className="w-3.5 h-3.5 mr-2" /> : <Unlock className="w-3.5 h-3.5 mr-2" />}
                      {license.status === 'active' ? 'Suspend Access' : 'Restore Matrix'}
                    </Button>
                    
                    <Button
                      variant="ghost"
                      className="h-12 w-12 rounded-2xl text-red-500/40 hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-500/20 transition-all flex-none"
                      onClick={() => handleDeleteLicense(license.id)}
                      disabled={actionLoading === `delete-${license.id}`}
                    >
                      {actionLoading === `delete-${license.id}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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
