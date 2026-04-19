'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Package,
  Search,
  MoreVertical,
  Activity,
  Database,
  ShieldCheck,
  Edit2,
  Trash2,
  Zap,
  Filter,
  AlertCircle,
  TrendingDown,
  Building2,
  Boxes,
  ShieldAlert,
  Plus
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

interface Product {
  id: string
  name: string
  sku: string | null
  buy_price: number
  unit_price: number
  quantity: number
  min_stock_level: number
  unit_type: string
  company_id: string
  companies: { name: string } | null
}

interface Company {
  id: string
  name: string
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
    fetchCompanies()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, companies(name)')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setProducts(data || [])
    } catch (err: any) {
      toast.error('Failed to access asset registry: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .order('name')
      if (error) throw error
      setCompanies(data || [])
    } catch (err: any) {
      toast.error('Failed to load company list: ' + err.message)
    }
  }

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const payload: any = {
      name: formData.get('name'),
      sku: formData.get('sku'),
      buy_price: parseFloat(formData.get('buy_price') as string) || 0,
      unit_price: parseFloat(formData.get('unit_price') as string) || 0,
      quantity: parseFloat(formData.get('quantity') as string) || 0,
      company_id: formData.get('company_id'),
    }

    try {
      if (selectedProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', selectedProduct.id)
        if (error) throw error
        toast.success('Asset parameters synchronized.')
      } else {
        const { error } = await supabase.from('products').insert([payload])
        if (error) throw error
        toast.success('New asset provisioned.')
      }
      setIsDialogOpen(false)
      setSelectedProduct(null)
      fetchProducts()
    } catch (err: any) {
      toast.error('Protocol override failed: ' + err.message)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!confirm(`AUTHORIZED ACTION: Decommission asset SKU "${product.sku || 'Unknown'}"? This action is authoritative.`)) return
    
    try {
      const { error } = await supabase.from('products').delete().eq('id', product.id)
      if (error) throw error
      toast.success('Asset record purged.')
      fetchProducts()
    } catch (err: any) {
      toast.error('Asset purge failed.')
    }
  }

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
              Inventory <span className="text-primary">Master Hub</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Global oversight of decentralized asset clusters and logistics.
          </p>
        </div>
        
        <Button 
          onClick={() => { setSelectedProduct(null); setIsDialogOpen(true); }}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4 mr-2" /> Provision New Asset
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Inventory', value: products.length, icon: Package, color: 'text-primary' },
          { label: 'Network Value', value: `$${products.reduce((acc: number, a: Product) => acc + (a.unit_price || 0), 0).toLocaleString()}`, icon: Database, color: 'text-emerald-500' },
          { label: 'Active Clusters', value: new Set(products.map((a: Product) => a.company_id)).size, icon: Building2, color: 'text-amber-500' },
          { label: 'System Health', value: 'Nominal', icon: Zap, color: 'text-primary' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-card group overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-500 shadow-xl shadow-black/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{kpi.label}</CardDescription>
                <kpi.icon className={cn("w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity", kpi.color)} />
              </div>
              <CardTitle className="text-3xl font-black tracking-tighter text-foreground">{kpi.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Asset Registry Table */}
      <Card className="glass-card border-border/40 overflow-hidden shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 p-8">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Scan global inventory..." 
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
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Asset Identity</th>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Cluster Node</th>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Stock Level</th>
                  <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Unit Price</th>
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
                ) : filteredProducts.map((product: Product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="py-6 px-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs uppercase tracking-tighter shadow-lg shadow-black/5 group-hover:scale-110 transition-transform">
                             {product.sku ? product.sku.substring(0,2) : 'AS'}
                          </div>
                          <div>
                            <div className="font-bold text-foreground tracking-tight">{product.name}</div>
                            <div className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mt-0.5">SKU: {product.sku || 'N/A'}</div>
                          </div>
                       </div>
                    </td>
                    <td className="py-6 px-8">
                       <div className="flex flex-col">
                          <span className="text-muted-foreground font-bold tracking-tight">{product.companies?.name || 'Internal Hub'}</span>
                          <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mt-1">Tenant ID</span>
                       </div>
                    </td>
                    <td className="py-6 px-8">
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            product.quantity <= 0 ? 'bg-destructive' :
                            product.quantity <= product.min_stock_level ? 'bg-amber-500' : 'bg-emerald-500'
                          )} />
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            product.quantity <= 0 ? 'text-destructive' :
                            product.quantity <= product.min_stock_level ? 'text-amber-500' : 'text-emerald-500'
                          )}>
                             {product.quantity} {product.unit_type || 'units'}
                          </span>
                       </div>
                    </td>
                    <td className="py-6 px-8 text-right font-mono text-xs font-bold text-muted-foreground">
                       ${product.unit_price?.toLocaleString()}
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
                                onClick={() => { setSelectedProduct(product); setIsDialogOpen(true); }}
                                className="flex items-center gap-3 p-3 rounded-xl focus:bg-primary/10 focus:text-primary cursor-pointer"
                             >
                                <Edit2 className="w-4 h-4" />
                                <span className="font-bold text-xs uppercase tracking-widest">Update Data</span>
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-border/40" />
                             <DropdownMenuItem 
                                onClick={() => handleDelete(product)}
                                className="flex items-center gap-3 p-3 rounded-xl focus:bg-destructive/10 focus:text-destructive text-destructive cursor-pointer"
                             >
                                <Trash2 className="w-4 h-4" />
                                <span className="font-bold text-xs uppercase tracking-widest">Wipe Asset</span>
                             </DropdownMenuItem>
                          </DropdownMenuContent>
                       </DropdownMenu>
                    </td>
                  </tr>
                ))}
                {!loading && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-24 text-center text-sm font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                      No assets found in registry.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Asset Override Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedProduct(null); }}
        title={selectedProduct ? "Asset Re-Optimization" : "Initialize Asset Load"}
        description="Modify network asset parameters and logistical signatures."
        onSubmit={handleCreateOrUpdate}
      >
        <div className="space-y-6 pt-5">
           <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Asset Identity</Label>
                <Input id="name" name="name" defaultValue={selectedProduct?.name ?? ''} placeholder="Asset-X1" className="h-12 bg-background border-border/40 focus:border-primary/50 rounded-2xl font-bold" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Serial Signature</Label>
                <Input id="sku" name="sku" defaultValue={selectedProduct?.sku ?? ''} placeholder="SKU-990-NET" className="h-12 bg-background border-border/40 focus:border-primary/50 rounded-2xl font-mono" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="buy_price" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Buy Price</Label>
                <Input id="buy_price" name="buy_price" type="number" step="0.01" defaultValue={selectedProduct?.buy_price ?? ''} placeholder="0.00" className="h-12 bg-background border-border/40 focus:border-primary/50 rounded-2xl font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_price" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Unit Price</Label>
                <Input id="unit_price" name="unit_price" type="number" step="0.01" defaultValue={selectedProduct?.unit_price ?? ''} placeholder="0.00" className="h-12 bg-background border-border/40 focus:border-primary/50 rounded-2xl font-mono" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Current Stock</Label>
                <Input id="quantity" name="quantity" type="number" defaultValue={selectedProduct?.quantity ?? ''} placeholder="0" className="h-12 bg-background border-border/40 focus:border-primary/50 rounded-2xl font-mono" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_id" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Cluster Assignment</Label>
                <select name="company_id" id="company_id" defaultValue={selectedProduct?.company_id ?? ''} className="w-full h-12 bg-background border border-border/40 focus:border-primary/50 rounded-2xl px-4 font-bold text-sm outline-none transition-all">
                  <option value="" disabled>Select cluster...</option>
                  {companies.map((c: Company) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
           </div>

           <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-start gap-4">
              <Zap className="w-5 h-5 text-primary mt-1 shrink-0 animate-pulse" />
              <div className="space-y-1">
                 <p className="text-[11px] font-black text-foreground uppercase tracking-wider">Asset Hash Validated</p>
                 <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Modification of global assets is logged and attributed to the current admin node.</p>
              </div>
           </div>
        </div>
      </FormDialog>
    </div>
  )
}
