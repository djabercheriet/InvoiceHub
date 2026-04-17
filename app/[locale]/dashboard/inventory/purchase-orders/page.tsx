"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  ShoppingCart, Plus, ArrowLeft, Trash2, Package, Clock,
  CheckCircle2, XCircle, TruckIcon, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "new">("list");
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // New PO form state
  const [poForm, setPoForm] = useState({
    supplierId: '',
    expectedDate: '',
    notes: '',
    items: [{ productId: '', description: '', quantity: 1, unitPrice: 0 }]
  });

  const supabase = createClient();

  useEffect(() => {
    if (viewMode === "list") fetchAll();
  }, [viewMode]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;
      setCompanyId(profile.company_id);

      const [ordersRes, suppliersRes, productsRes] = await Promise.all([
        supabase.from('purchase_orders').select('*, suppliers(name)').eq('company_id', profile.company_id).order('created_at', { ascending: false }),
        supabase.from('suppliers').select('id, name').eq('company_id', profile.company_id).eq('is_active', true).order('name'),
        supabase.from('products').select('id, name, unit_price, buy_price').eq('company_id', profile.company_id).eq('is_active', true).order('name'),
      ]);

      setOrders(ordersRes.data || []);
      setSuppliers(suppliersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (err: any) {
      toast.error("Failed to load purchase orders.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePO = async () => {
    if (!poForm.items.some(i => i.description.trim())) {
      toast.error("Add at least one item.");
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const total = poForm.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
      const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const { data: po, error: poErr } = await supabase.from('purchase_orders').insert({
        company_id: companyId,
        supplier_id: poForm.supplierId || null,
        po_number: poNumber,
        status: 'draft',
        total,
        expected_date: poForm.expectedDate || null,
        notes: poForm.notes,
        created_by: user.id,
      }).select('id').single();
      if (poErr) throw poErr;

      const itemRows = poForm.items
        .filter(i => i.description.trim())
        .map(i => ({
          purchase_order_id: po.id,
          product_id: i.productId || null,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unitPrice,
          total: i.quantity * i.unitPrice,
        }));

      const { error: itemsErr } = await supabase.from('purchase_order_items').insert(itemRows);
      if (itemsErr) throw itemsErr;

      toast.success(`Purchase Order ${poNumber} created!`);
      setViewMode("list");
      setPoForm({ supplierId: '', expectedDate: '', notes: '', items: [{ productId: '', description: '', quantity: 1, unitPrice: 0 }] });
    } catch (err: any) {
      toast.error("Failed to create PO: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => setPoForm(prev => ({
    ...prev,
    items: [...prev.items, { productId: '', description: '', quantity: 1, unitPrice: 0 }]
  }));

  const removeItem = (i: number) => setPoForm(prev => ({
    ...prev,
    items: prev.items.filter((_, idx) => idx !== i)
  }));

  const updateItem = (i: number, field: string, value: any) => {
    setPoForm(prev => {
      const items = [...prev.items];
      items[i] = { ...items[i], [field]: value };
      // Auto-fill price when product selected
      if (field === 'productId') {
        const p = products.find(p => p.id === value);
        if (p) {
          items[i].description = p.name;
          items[i].unitPrice = p.buy_price || 0;
        }
      }
      return { ...prev, items };
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'received': return { label: 'Received', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: CheckCircle2 };
      case 'ordered': return { label: 'Ordered', class: 'bg-blue-500/10 text-blue-600 border-blue-500/20', icon: TruckIcon };
      case 'cancelled': return { label: 'Cancelled', class: 'bg-red-500/10 text-red-600 border-red-500/20', icon: XCircle };
      default: return { label: 'Draft', class: 'bg-muted text-muted-foreground border-border/50', icon: Clock };
    }
  };

  const columns = [
    {
      header: "PO Number", accessorKey: "po_number",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm">{row.po_number}</span>
          <span className="text-[10px] opacity-50 font-mono">{row.id.substring(0, 8)}…</span>
        </div>
      )
    },
    {
      header: "Supplier", accessorKey: "suppliers.name",
      cell: (row: any) => <span className="font-bold text-sm">{row.suppliers?.name || <span className="opacity-40 italic">No Supplier</span>}</span>
    },
    {
      header: "Total", accessorKey: "total",
      cell: (row: any) => <span className="font-bold text-primary">${(row.total || 0).toLocaleString()}</span>
    },
    {
      header: "Expected", accessorKey: "expected_date",
      cell: (row: any) => <span className="text-xs font-mono opacity-60">{row.expected_date || '—'}</span>
    },
    {
      header: "Status", accessorKey: "status",
      cell: (row: any) => {
        const config = getStatusConfig(row.status);
        return <Badge variant="outline" className={cn("font-bold text-[9px] tracking-widest", config.class)}>{config.label}</Badge>;
      }
    }
  ];

  // New PO Form
  if (viewMode === "new") {
    const poTotal = poForm.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    return (
      <div className="space-y-6 page-fade-in px-4 lg:px-0 max-w-5xl mx-auto">
        <Button variant="ghost" onClick={() => setViewMode("list")} className="gap-2 font-bold text-muted-foreground hover:text-foreground group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Orders
        </Button>

        <div className="flex items-center gap-4 border-l-4 border-violet-500 pl-6 py-2">
          <div>
            <h2 className="text-3xl font-bold">New Purchase Order</h2>
            <p className="text-muted-foreground font-medium">Draft a procurement request to a supplier.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card border-none shadow-2xl">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-bold tracking-widest">Order Parameters</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground">SUPPLIER</label>
                  <select
                    value={poForm.supplierId}
                    onChange={e => setPoForm(p => ({ ...p, supplierId: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-border/50 bg-background/50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  >
                    <option value="">No Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold tracking-widest text-muted-foreground">EXPECTED DELIVERY</label>
                  <Input type="date" value={poForm.expectedDate} onChange={e => setPoForm(p => ({ ...p, expectedDate: e.target.value }))} className="glass-card" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold tracking-widest text-muted-foreground">INTERNAL NOTES</label>
                <Input value={poForm.notes} onChange={e => setPoForm(p => ({ ...p, notes: e.target.value }))} placeholder="Delivery instructions, special terms…" className="glass-card" />
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-muted-foreground">PROCUREMENT ITEMS</span>
                  <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 gap-1 text-xs font-bold border-violet-500/30 text-violet-600 hover:bg-violet-500/5">
                    <Plus className="w-3 h-3" /> Add Item
                  </Button>
                </div>
                <div className="space-y-2">
                  {poForm.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center p-3 bg-muted/20 rounded-xl border border-border/30">
                      <div className="col-span-5">
                        <Input
                          list="products-list"
                          value={item.description}
                          onChange={e => {
                            const p = products.find(p => p.name === e.target.value);
                            if (p) { updateItem(idx, 'productId', p.id); }
                            else { updateItem(idx, 'description', e.target.value); }
                          }}
                          placeholder="Product or description…"
                          className="h-8 border-none bg-transparent shadow-none text-xs font-medium"
                        />
                        <datalist id="products-list">
                          {products.map(p => <option key={p.id} value={p.name} />)}
                        </datalist>
                      </div>
                      <div className="col-span-2">
                        <Input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} className="h-8 border-none bg-transparent shadow-none text-center text-xs font-bold" placeholder="Qty" />
                      </div>
                      <div className="col-span-3">
                        <Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', Number(e.target.value))} className="h-8 border-none bg-transparent shadow-none text-xs font-bold" placeholder="Unit price" />
                      </div>
                      <div className="col-span-1 text-right text-xs font-bold text-violet-600">
                        ${(item.quantity * item.unitPrice).toLocaleString()}
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeItem(idx)} disabled={poForm.items.length === 1}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none shadow-2xl bg-violet-500/5">
            <CardHeader className="border-b border-border/40">
              <CardTitle className="text-sm font-bold tracking-widest text-violet-600">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="flex flex-col items-center gap-2 py-6">
                <span className="text-[10px] font-bold tracking-widest text-violet-500">PROCUREMENT TOTAL</span>
                <div className="text-5xl font-bold tracking-tighter">{poTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <span className="text-xs font-mono text-muted-foreground">{poForm.items.length} line item{poForm.items.length !== 1 ? 's' : ''}</span>
              </div>
              <Button onClick={handleSavePO} disabled={saving} className="w-full h-12 font-bold tracking-widest bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-500/20">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : <ShoppingCart className="w-4 h-4 mr-2" />}
                Create Draft Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 page-fade-in px-4 lg:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-violet-500" />
            Purchase Orders
          </h1>
          <p className="text-muted-foreground font-medium">Track procurement from suppliers and receive stock automatically.</p>
        </div>
        <Button onClick={() => setViewMode("new")} size="lg" className="gap-2 font-bold bg-violet-600 hover:bg-violet-700 shadow-lg shadow-violet-500/20">
          <Plus className="w-5 h-5" /> New Purchase Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">TOTAL ORDERS</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{orders.length}</div></CardContent>
        </Card>
        <Card className="glass-card bg-blue-500/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-blue-600">IN TRANSIT</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-blue-600">{orders.filter(o => o.status === 'ordered').length}</div></CardContent>
        </Card>
        <Card className="glass-card bg-emerald-500/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-emerald-600">RECEIVED</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-600">{orders.filter(o => o.status === 'received').length}</div></CardContent>
        </Card>
        <Card className="glass-card bg-violet-500/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-violet-600">TOTAL SPEND</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-violet-600">${orders.filter(o => o.status === 'received').reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search orders…"
        actions={(row) => (
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-violet-500/10 hover:text-violet-600 rounded-xl"
              onClick={() => window.location.href = `/dashboard/inventory/purchase-orders/${row.id}`}>
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        )}
      />
    </div>
  );
}
