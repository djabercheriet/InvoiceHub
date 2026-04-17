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
  ShieldAlert
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

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
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

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get('name'),
      sku: formData.get('sku'),
      buy_price: parseFloat(formData.get('buy_price') as string),
      unit_price: parseFloat(formData.get('unit_price') as string),
      quantity: parseFloat(formData.get('quantity') as string),
    }

    try {
      if (selectedProduct) {
        const { error } = await supabase.from('products').update(data).eq('id', selectedProduct.id)
        if (error) throw error
        toast.success('Asset parameters synchronized.')
      }
      setIsDialogOpen(false)
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

  const lowStockCount = products.filter(p => p.quantity <= (p.min_stock_level || 5)).length

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Boxes className="w-8 h-8 text-primary" />
            Global Inventory
          </h1>
          <p className="text-muted-foreground font-medium">
            Monitoring cross-tenant resource distribution and stock health.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
           {lowStockCount > 0 && (
             <div className="flex flex-col items-end mr-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500/60">Depletion Alert</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-sm font-bold text-red-400 uppercase tracking-tighter">{lowStockCount} Critical SKU</span>
                </div>
             </div>
           )}
           <Button disabled className="bg-white/5 border border-white/5 text-muted-foreground font-black uppercase tracking-widest text-[10px] h-14 px-8 rounded-2xl cursor-not-allowed border-dashed opacity-50">
             <Package className="w-4 h-4 mr-2" /> Global Provisioning
           </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Catalog SKU', value: products.length, icon: Database, color: 'text-indigo-400' },
          { label: 'Inventory Valuation', value: `$${products.reduce((acc: number, p) => acc + (p.quantity * p.unit_price), 0).toLocaleString()}`, icon: TrendingDown, color: 'text-emerald-400' },
          { label: 'Network Sourcing', value: 'Decentralized', icon: Building2, color: 'text-purple-400' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-dashboard group overflow-hidden border-white/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{kpi.label}</CardDescription>
                <kpi.icon className={cn("w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity", kpi.color)} />
              </div>
              <CardTitle className="text-4xl font-black tracking-tighter text-white">{kpi.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Asset Registry Table */}
      <Card className="glass-dashboard border-white/5 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-white/1 p-8">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
            <Input 
              placeholder="Query global assets..." 
              className="h-12 pl-12 bg-white/5 border-white/5 focus:border-indigo-500/50 rounded-2xl transition-all text-sm font-medium" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0c0c0e] border-b border-white/5">
                <tr>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/40 text-[9px]">Asset Signature</th>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/40 text-[9px]">Owner Cluster</th>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/40 text-[9px]">Resource Volume</th>
                  <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/40 text-[9px]">Platform Valuation</th>
                  <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/40 text-[9px]">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {loading ? (
                  [1,2,3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="py-8 px-8"><div className="h-8 bg-white/5 rounded-xl w-full" /></td>
                    </tr>
                  ))
                ) : filteredProducts.map((asset) => (
                  <tr key={asset.id} className="hover:bg-white/2 transition-colors group">
                    <td className="py-6 px-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-xs uppercase tracking-tighter group-hover:scale-110 transition-transform">
                             {asset.name.substring(0,2)}
                          </div>
                          <div>
                            <div className="font-bold text-white tracking-tight">{asset.name}</div>
                            <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest mt-0.5">SKU: {asset.sku || 'UNMAPPED'}</div>
                          </div>
                       </div>
                    </td>
                    <td className="py-6 px-8">
                       <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500/50" />
                          <span className="text-zinc-400 font-bold tracking-tight">{asset.companies?.name || 'Isolated Node'}</span>
                       </div>
                    </td>
                    <td className="py-6 px-8">
                       <div className="flex flex-col">
                          <span className={cn(
                            "text-sm font-bold tracking-tight",
                            asset.quantity <= (asset.min_stock_level || 5) ? "text-red-400" : "text-emerald-400"
                          )}>
                             {asset.quantity} <span className="text-[9px] opacity-40 lowercase">{asset.unit_type || 'unit'}</span>
                          </span>
                          {asset.quantity <= (asset.min_stock_level || 5) && (
                             <span className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-1 animate-pulse">Critical Depletion</span>
                          )}
                       </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                       <div className="flex flex-col items-end">
                          <span className="text-white font-bold tracking-tighter text-sm">${asset.unit_price.toLocaleString()}</span>
                          <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest mt-1">Sourcing Budget: ${asset.buy_price || 0}</span>
                       </div>
                    </td>
                    <td className="py-6 px-8 text-right">
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-10 w-10 border border-transparent hover:border-white/10 rounded-xl transition-all">
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                             </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 glass-dashboard border-white/10 p-2">
                             <DropdownMenuItem 
                                onClick={() => { setSelectedProduct(asset); setIsDialogOpen(true); }}
                                className="flex items-center gap-3 p-3 rounded-xl focus:bg-indigo-500/10 focus:text-indigo-400 cursor-pointer"
                             >
                                <Edit2 className="w-4 h-4" />
                                <span className="font-bold text-xs uppercase tracking-widest">Override Params</span>
                             </DropdownMenuItem>
                             <DropdownMenuSeparator className="bg-white/5" />
                             <DropdownMenuItem 
                                onClick={() => handleDelete(asset)}
                                className="flex items-center gap-3 p-3 rounded-xl focus:bg-red-500/10 focus:text-red-400 text-red-400 cursor-pointer"
                             >
                                <Trash2 className="w-4 h-4" />
                                <span className="font-bold text-xs uppercase tracking-widest">Purge Asset</span>
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

      {/* Asset Override Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Asset Protocol: Override"
        description="Authoritative modification of global resource parameters."
        onSubmit={handleUpdate}
      >
        <div className="space-y-6 pt-5">
           <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Asset Entity Name</Label>
                <Input id="name" name="name" defaultValue={selectedProduct?.name} placeholder="Quantum CPU" className="h-12 bg-white/5 border-white/5 focus:border-indigo-500/50 rounded-2xl font-bold" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Network SKU</Label>
                <Input id="sku" name="sku" defaultValue={selectedProduct?.sku || ''} placeholder="SKU-887" className="h-12 bg-white/5 border-white/5 focus:border-indigo-500/50 rounded-2xl font-mono" />
              </div>
           </div>

           <div className="grid grid-cols-3 gap-5">
              <div className="space-y-2">
                <Label htmlFor="buy_price" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Sourcing Level</Label>
                <Input id="buy_price" name="buy_price" type="number" step="0.01" defaultValue={selectedProduct?.buy_price || 0} className="h-12 bg-white/5 border-white/5 focus:border-indigo-500/50 rounded-2xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_price" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Retail Protocol</Label>
                <Input id="unit_price" name="unit_price" type="number" step="0.01" defaultValue={selectedProduct?.unit_price} className="h-12 bg-white/5 border-white/5 focus:border-indigo-500/50 rounded-2xl font-bold" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Current Volume</Label>
                <Input id="quantity" name="quantity" type="number" step="any" defaultValue={selectedProduct?.quantity} className="h-12 bg-white/5 border-white/5 focus:border-indigo-500/50 rounded-2xl font-bold" required />
              </div>
           </div>

           <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/10 flex items-start gap-4">
              <ShieldAlert className="w-5 h-5 text-red-500 mt-1 shrink-0 animate-pulse" />
              <div className="space-y-1">
                 <p className="text-[11px] font-black text-white uppercase tracking-wider">Authoritative Record Alert</p>
                 <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Changes to this asset will impact financial calculations and stock levels for the owner cluster immediately.</p>
              </div>
           </div>
           
           <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] text-muted-foreground">Abort Protocol</Button>
              <Button type="submit" className="h-12 px-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-600/20">Sync Registry</Button>
           </div>
        </div>
      </FormDialog>
    </div>
  )
}
