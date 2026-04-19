'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Activity,
  Globe,
  Database,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Edit2,
  Trash2,
  ExternalLink,
  Zap,
  Filter
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { FormDialog } from '@/components/ui/form-dialog'
import { Label } from '@/components/ui/label'

interface Company {
  id: string
  name: string
  domain: string | null
  tax_id: string | null
  website: string | null
  billing_email: string | null
  is_active: boolean
  created_at: string
}

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setCompanies(data || [])
    } catch (err: any) {
      toast.error('Failed to synchronize clusters: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      domain: formData.get('domain'),
      tax_id: formData.get('tax_id'),
      website: formData.get('website'),
      billing_email: formData.get('billing_email'),
    }

    try {
      if (selectedCompany) {
        const { error } = await supabase.from('companies').update(data).eq('id', selectedCompany.id)
        if (error) throw error
        toast.success('Cluster configuration updated.')
      } else {
        const { error } = await supabase.from('companies').insert(data)
        if (error) throw error
        toast.success('New cluster initialized.')
      }
      setIsDialogOpen(false)
      fetchCompanies()
    } catch (err: any) {
      toast.error('Protocol failure: ' + err.message)
    }
  }

  const handleDelete = async (company: Company) => {
    if (!confirm(`AUTHORIZED ACTION: Decommission cluster "${company.name}"? This will terminate all node processes.`)) return
    
    try {
      const { error } = await supabase.from('companies').delete().eq('id', company.id)
      if (error) throw error
      toast.success('Cluster purged from registry.')
      fetchCompanies()
    } catch (err: any) {
      toast.error('Decommissioning failed.')
    }
  }

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
              Workspace <span className="text-primary">Clusters</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Managing global tenant architecture and node identities.
          </p>
        </div>
        
        <Button 
          onClick={() => { setSelectedCompany(null); setIsDialogOpen(true); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4 mr-2" /> Initialize New Cluster
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Network Verticals', value: companies.length, icon: Database, color: 'text-primary' },
          { label: 'Active Domains', value: companies.filter(c => c.domain).length, icon: Globe, color: 'text-emerald-500' },
          { label: 'System Saturation', value: 'High', icon: Activity, color: 'text-amber-500' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-card group overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-500 shadow-xl shadow-black/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{kpi.label}</CardDescription>
                <kpi.icon className={cn("w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity", kpi.color)} />
              </div>
              <CardTitle className="text-4xl font-black tracking-tighter text-foreground">{kpi.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Main Registry */}
      <Card className="glass-card border-border/40 overflow-hidden shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 p-8">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Scan cluster registry..." 
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
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Cluster Identity</th>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Network Domain</th>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Fiscal Signature</th>
                  <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Status</th>
                  <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {loading ? (
                  [1,2,3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="py-8 px-8"><div className="h-10 bg-muted/40 rounded-xl w-full" /></td>
                    </tr>
                  ))
                ) : filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="py-6 px-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs uppercase tracking-tighter shadow-lg shadow-black/5 group-hover:scale-110 transition-transform">
                             {company.name.substring(0,2)}
                          </div>
                          <div>
                            <div className="font-bold text-foreground tracking-tight flex items-center gap-2">
                              {company.name}
                              {company.website && <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all cursor-pointer" />}
                            </div>
                            <div className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mt-0.5">ID: {company.id.substring(0,12)}</div>
                          </div>
                       </div>
                    </td>
                    <td className="py-6 px-8">
                       <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-primary/40" />
                          <span className="text-muted-foreground font-bold tracking-tight">{company.domain || 'Internal Node'}</span>
                       </div>
                    </td>
                    <td className="py-6 px-8">
                       <div className="flex flex-col">
                          <span className="text-muted-foreground font-mono text-[11px] uppercase tracking-wider">{company.tax_id || 'NOT_REGISTERED'}</span>
                          <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mt-1">Regulatory ID</span>
                       </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                       <div className="flex items-center justify-end gap-2 pr-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Global Active</span>
                       </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-10 w-10 border border-transparent hover:border-border/40 rounded-xl transition-all">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 glass-card border-border/50 p-2 shadow-2xl">
                             <DropdownMenuItem 
                                onClick={() => { setSelectedCompany(company); setIsDialogOpen(true); }}
                                className="flex items-center gap-3 p-3 rounded-xl focus:bg-primary/10 focus:text-primary cursor-pointer"
                             >
                                <Edit2 className="w-4 h-4" />
                                <span className="font-bold text-xs uppercase tracking-widest">Edit Payload</span>
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-border/40" />
                             <DropdownMenuItem 
                                onClick={() => handleDelete(company)}
                                className="flex items-center gap-3 p-3 rounded-xl focus:bg-destructive/10 focus:text-destructive text-destructive cursor-pointer"
                             >
                                <Trash2 className="w-4 h-4" />
                                <span className="font-bold text-xs uppercase tracking-widest">Terminate Node</span>
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cluster Configuration Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={selectedCompany ? "Cluster Configuration" : "Initialize Infrastructure"}
        description="Modify cluster parameters and deployment identities."
        onSubmit={handleCreateOrUpdate}
      >
        <div className="space-y-6 pt-5">
           <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Cluster Name</Label>
                <Input id="name" name="name" defaultValue={selectedCompany?.name ?? ''} placeholder="Acme Global" className="h-12 bg-background border-border/40 focus:border-primary/50 rounded-2xl font-bold" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Assigned Domain</Label>
                <Input id="domain" name="domain" defaultValue={selectedCompany?.domain ?? ''} placeholder="acme.com" className="h-12 bg-background border-border/40 focus:border-primary/50 rounded-2xl font-bold" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="tax_id" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Fiscal ID</Label>
                <Input id="tax_id" name="tax_id" defaultValue={selectedCompany?.tax_id ?? ''} placeholder="TX-123456" className="h-12 bg-background border-border/40 focus:border-primary/50 rounded-2xl font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing_email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Finance Node</Label>
                <Input id="billing_email" name="billing_email" type="email" defaultValue={selectedCompany?.billing_email ?? ''} placeholder="finance@acme.com" className="h-12 bg-background border-border/40 focus:border-primary/50 rounded-2xl font-bold" />
              </div>
           </div>

           <div className="space-y-2">
              <Label htmlFor="website" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Control Website</Label>
              <Input id="website" name="website" defaultValue={selectedCompany?.website ?? ''} placeholder="https://acme.com" className="h-12 bg-background border-border/40 focus:border-primary/50 rounded-2xl font-bold" />
           </div>

           <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4">
              <Zap className="w-5 h-5 text-primary mt-1 shrink-0 animate-pulse" />
              <div className="space-y-1">
                 <p className="text-[11px] font-black text-foreground uppercase tracking-wider">Protocol Integrity Verified</p>
                 <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">System state synchronization will propagate across all decentralized nodes instantly upon validation.</p>
              </div>
           </div>
           
           <div className="flex justify-end gap-3 pt-4 border-t border-border/20">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] text-muted-foreground">Abort</Button>
              <Button type="submit" className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Commit Changes</Button>
           </div>
        </div>
      </FormDialog>
    </div>
  )
}
