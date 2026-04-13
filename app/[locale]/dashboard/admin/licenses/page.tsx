'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Key, Trash2, PowerOff, ShieldCheck, Loader2, Plus, MonitorSmartphone, CalendarClock } from 'lucide-react'

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
    if (!confirm('Are you sure you want to unlink this device?')) return
    setActionLoading(`revoke-${activationId}`)
    try {
      const res = await fetch('/api/admin/licenses/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activationId })
      })
      const json = await res.json()
      if (json.success) {
        toast.success('Device revoked successfully')
        fetchLicenses() // refresh
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
        toast.success(`License marked as ${newStatus}`)
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
    if (!newKeyInput) return toast.error('Key cannot be empty')
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
        toast.success('License created!')
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">License Management</h1>
          <p className="text-muted-foreground mt-1">
            Super Admin center for controlling POS client activations and keys.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
          <ShieldCheck className="w-3 h-3 inline mr-1" /> Super Admin Only
        </div>
      </div>

      {/* Creation Tools */}
      <Card className="border-border/50 shadow-sm border-t-indigo-500 border-t-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Key className="w-5 h-5 text-indigo-500" /> Generate New License</CardTitle>
          <CardDescription>Manually issue a new POS license key. You can link it to a company later.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-1.5 flex-1 max-w-sm">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">License Key</label>
              <Input
                placeholder="e.g. BNT-1234-ABCD"
                value={newKeyInput}
                onChange={(e) => setNewKeyInput(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5 w-32">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Max Devices</label>
              <Input
                type="number"
                min={1}
                value={newKeyDevices}
                onChange={(e) => setNewKeyDevices(parseInt(e.target.value) || 1)}
              />
            </div>
            <Button onClick={handleCreateLicense} disabled={actionLoading === 'create'}>
              {actionLoading === 'create' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Issue Key
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* License List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold tracking-tight">Active Licenses</h3>

        {loading ? (
          <div className="flex items-center justify-center p-12 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : licenses.length === 0 ? (
          <div className="text-center p-12 border border-dashed rounded-lg bg-muted/20">
            <Key className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No licenses found in the system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {licenses.map(license => (
              <Card key={license.id} className="border-border/50 shadow-sm flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-border/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={license.status === 'active' ? 'default' : license.status === 'expired' ? 'destructive' : 'secondary'} className="uppercase">
                          {license.status}
                        </Badge>
                        <span className="font-mono text-sm tracking-wider font-bold bg-muted px-2 rounded">{license.license_key}</span>
                      </div>
                      {license.company ? (
                        <p className="text-sm font-medium text-muted-foreground mt-2 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {license.company.name}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-2 italic bg-yellow-500/10 dark:text-yellow-400 max-w-fit px-2 py-0.5 rounded">Unassigned / Global</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Slots Used</div>
                      <div className="text-xl font-black">
                        <span className={license.used_devices >= license.max_devices ? "text-red-500" : "text-emerald-500"}>{license.used_devices}</span>
                        <span className="text-muted-foreground/50">/{license.max_devices}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 py-2 grow">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5"><MonitorSmartphone className="w-3.5 h-3.5" /> Registered Devices</h4>
                  {license.activations && license.activations.length > 0 ? (
                    <ul className="space-y-2">
                      {license.activations.map((act) => (
                        <li key={act.id} className="flex items-center justify-between bg-muted/40 p-2 rounded-md border border-border/50 text-sm">
                          <div>
                            <p className="font-mono text-xs font-medium">{act.device_id}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5" title={new Date(act.activated_at).toLocaleString()}>A: {new Date(act.activated_at).toLocaleDateString()}</p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-7 w-7 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500"
                            onClick={() => handleRevokeDevice(act.id)}
                            disabled={actionLoading === `revoke-${act.id}`}
                          >
                            {actionLoading === `revoke-${act.id}` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                            <span className="sr-only">Revoke</span>
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-muted-foreground italic border border-dashed rounded p-2 text-center">No devices activated yet.</p>
                  )}
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/40 bg-muted/10 flex justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <CalendarClock className="w-3.5 h-3.5" />
                    {license.expiry_date ? `Expires: ${new Date(license.expiry_date).toLocaleDateString()}` : 'Lifetime License'}
                  </span>
                  <Button
                    variant={license.status === 'active' ? 'outline' : 'default'}
                    size="sm"
                    className="h-8 text-xs font-semibold"
                    onClick={() => handleUpdateStatus(license.id, license.status)}
                    disabled={actionLoading === `status-${license.id}`}
                  >
                    {actionLoading === `status-${license.id}` ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <PowerOff className="w-3.5 h-3.5 mr-1.5" />}
                    {license.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
