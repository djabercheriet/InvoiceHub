'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Search,
  MoreVertical,
  ShieldCheck,
  Fingerprint,
  Mail,
  Building2,
  Edit2,
  Trash2,
  Zap,
  Activity,
  ShieldAlert,
  UserPlus
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

interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  role: string
  company_id: string | null
  companies: { name: string } | null
  created_at: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, companies(name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setUsers(data || [])
    } catch (err: any) {
      toast.error('Failed to access identity matrix: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      full_name: formData.get('full_name'),
      role: formData.get('role'),
    }

    try {
      if (selectedUser) {
        const { error } = await supabase.from('profiles').update(data).eq('id', selectedUser.id)
        if (error) throw error
        toast.success('Identity protocols updated.')
      }
      setIsDialogOpen(false)
      fetchUsers()
    } catch (err: any) {
      toast.error('Override failed: ' + err.message)
    }
  }

  const handleDelete = async (user: UserProfile) => {
    if (!confirm(`AUTHORIZED ACTION: Revoke all credentials for operator "${user.full_name || 'Unknown'}"? This action is irreversible.`)) return
    
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', user.id)
      if (error) throw error
      toast.success('Identity purged from registry.')
      fetchUsers()
    } catch (err: any) {
      toast.error('Identity purge failed.')
    }
  }

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              Operator <span className="text-indigo-500">Base</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Managing global decentralized identities and authorization vectors.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex flex-col items-end mr-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Active Sessions</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-sm font-bold text-foreground uppercase tracking-tighter">Live Monitor</span>
             </div>
          </div>
          <Button disabled className="bg-secondary/50 border border-border text-muted-foreground font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl cursor-not-allowed border-dashed opacity-50">
             <UserPlus className="w-4 h-4 mr-2" /> Sync Auth Protocol
           </Button>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Authorized Personel', value: users.length, icon: Fingerprint, color: 'text-indigo-400' },
          { label: 'High-Level Access', value: users.filter(u => u.role === 'admin').length, icon: ShieldAlert, color: 'text-amber-500' },
          { label: 'Identity Integrity', value: '100%', icon: ShieldCheck, color: 'text-emerald-400' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-card group overflow-hidden">
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

      {/* User Matrix Table */}
      <Card className="glass-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20 p-8">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Query identity matrix..." 
              className="h-12 pl-12 bg-secondary/50 border-border focus:border-primary/50 rounded-2xl transition-all text-sm font-medium" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border/50">
                <tr>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/40 text-[9px]">Identity Protocol</th>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/40 text-[9px]">Authorization Level</th>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/40 text-[9px]">Assigned Cluster</th>
                  <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/40 text-[9px]">Last Pulse</th>
                  <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/40 text-[9px]">Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  [1,2,3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="py-8 px-8"><div className="h-8 bg-muted rounded-xl w-full" /></td>
                    </tr>
                  ))
                ) : filteredUsers.map((profile) => (
                  <tr key={profile.id} className="hover:bg-muted/50 transition-colors group">
                    <td className="py-6 px-8">
                       <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase italic shadow-lg group-hover:scale-110 transition-transform ring-4 ring-background">
                              {profile.full_name?.substring(0,2).toUpperCase() || 'OP'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background" />
                          </div>
                          <div>
                            <div className="font-bold text-foreground tracking-tight">{profile.full_name || 'Unknown Operator'}</div>
                            <div className="flex items-center gap-2 mt-0.5">
                               <Fingerprint className="w-3 h-3 text-muted-foreground opacity-60" />
                               <span className="text-[10px] font-mono text-muted-foreground/40 tracking-widest">{profile.id.substring(0,16).toUpperCase()}</span>
                            </div>
                          </div>
                       </div>
                    </td>
                    <td className="py-6 px-8">
                       <Badge className={cn(
                         "font-black text-[9px] tracking-widest px-3 py-1.5 border uppercase",
                         profile.role === 'admin' 
                           ? "bg-primary/10 text-primary border-primary/20" 
                           : "bg-secondary text-muted-foreground border-border"
                       )}>
                         {profile.role}
                       </Badge>
                    </td>
                    <td className="py-6 px-8">
                       <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-secondary/50 rounded-lg border border-border group-hover:border-primary/30 transition-colors">
                             <Building2 className="w-3.5 h-3.5 text-muted-foreground/40" />
                          </div>
                          <span className="text-muted-foreground font-bold tracking-tight">{profile.companies?.name || 'Isolated Node'}</span>
                       </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                       <div className="flex flex-col items-end">
                          <span className="text-muted-foreground text-xs font-bold tracking-tight">Active Stream</span>
                          <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mt-1">Handshake Valid</span>
                       </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-10 w-10 border border-transparent hover:border-border rounded-xl transition-all">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 glass-card border-border/50 p-2">
                             <DropdownMenuItem 
                                onClick={() => { setSelectedUser(profile); setIsDialogOpen(true); }}
                                className="flex items-center gap-3 p-3 rounded-xl focus:bg-primary/10 focus:text-primary cursor-pointer"
                             >
                                <Edit2 className="w-4 h-4" />
                                <span className="font-bold text-xs uppercase tracking-widest">Override Levels</span>
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-border" />
                             <DropdownMenuItem 
                                onClick={() => handleDelete(profile)}
                                className="flex items-center gap-3 p-3 rounded-xl focus:bg-destructive/10 focus:text-destructive text-destructive cursor-pointer"
                             >
                                <Trash2 className="w-4 h-4" />
                                <span className="font-bold text-xs uppercase tracking-widest">Purge Identity</span>
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

      {/* User Configuration Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Identity Protocol: Override"
        description="Modify operator parameters and authorization vectors."
        onSubmit={handleUpdate}
      >
        <div className="space-y-6 pt-5">
           <div className="space-y-2">
              <Label htmlFor="full_name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Identity Signature</Label>
              <Input id="full_name" name="full_name" defaultValue={selectedUser?.full_name || ''} placeholder="Operator Name" className="h-12 bg-secondary/50 border-border focus:border-primary/50 rounded-2xl font-bold" required />
           </div>

           <div className="space-y-2">
              <Label htmlFor="role" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Authorization Vector (admin / member)</Label>
              <Input id="role" name="role" defaultValue={selectedUser?.role || ''} placeholder="admin" className="h-12 bg-secondary/50 border-border focus:border-primary/50 rounded-2xl font-mono tracking-widest" required />
           </div>

           <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
              <ShieldAlert className="w-5 h-5 text-amber-500 mt-1 shrink-0" />
              <div className="space-y-1">
                 <p className="text-[11px] font-black text-foreground uppercase tracking-wider">Auth Protocol Warning</p>
                 <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Modifying authorization levels may grant or restrict access to critical infrastructure nodes instantly.</p>
              </div>
           </div>
           
           <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] text-muted-foreground">Abort Protocol</Button>
               <Button type="submit" className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">Sync Identity</Button>
           </div>
        </div>
      </FormDialog>
    </div>
  )
}
