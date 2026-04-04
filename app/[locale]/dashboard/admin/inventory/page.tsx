"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Trash2, Edit2, ShieldAlert, Building2, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*, companies(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (err: any) {
      toast.error("Failed to load inventory: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      sku: formData.get("sku"),
      buy_price: parseFloat(formData.get("buy_price") as string),
      unit_price: parseFloat(formData.get("unit_price") as string),
      quantity: parseFloat(formData.get("quantity") as string),
    };
    try {
      if (selectedProduct) {
        const { error } = await supabase.from("products").update(data).eq("id", selectedProduct.id);
        if (error) throw error;
        toast.success("Product updated.");
      }
      setIsDialogOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    }
  };

  const handleDelete = async (product: any) => {
    if (!confirm(`Permanently remove SKU "${product.sku}" from the platform? This is a destructive action.`)) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id);
      if (error) throw error;
      toast.success("Global record purged.");
      fetchProducts();
    } catch (err: any) {
      toast.error("Deletion failed.");
    }
  };

  const columns = [
    {
      header: "Corporate Asset",
      accessorKey: "name",
      cell: (row: any) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 font-bold text-indigo-600 text-sm shrink-0">
            {row.name?.substring(0, 1) || "A"}
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm leading-none">{row.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono opacity-60">SKU: {row.sku || "UNSPECIFIED"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Owner Organization",
      accessorKey: "companies.name",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-500/60" />
            <Badge variant="outline" className="font-bold text-[9px] tracking-widest bg-indigo-500/5 border-indigo-500/20 text-indigo-600">
                {row.companies?.name || "Independent"}
            </Badge>
        </div>
      ),
    },
    {
      header: "Volume / Units",
      accessorKey: "quantity",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold tracking-tight text-sm",
            row.quantity <= (row.min_stock_level || 5) ? "text-red-600" : "text-emerald-600"
          )}>
            {row.quantity} <span className="text-[9px] opacity-60">{row.unit_type || 'unit'}</span>
          </span>
          {row.quantity <= (row.min_stock_level || 5) && (
              <span className="text-[8px] font-bold text-red-500/80 tracking-widest flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-2.5 h-2.5" /> Depletion Alert
              </span>
          )}
        </div>
      ),
    },
    {
      header: "Platform Valuation",
      accessorKey: "unit_price",
      cell: (row: any) => (
        <div className="flex flex-col text-right">
            <span className="font-bold tracking-tight text-sm text-foreground flex items-center justify-end gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-500" /> ${row.unit_price?.toLocaleString()}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground opacity-60 tracking-widest">
                Buy: ${row.buy_price || 0}
            </span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Super Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600" />
            Global Asset Registry
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Platform-wide inventory analysis and multi-tenant resource management.
          </p>
        </div>
        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
            <p className="text-[10px] font-bold tracking-widest text-red-600 max-w-[200px]">
                High-Level Protocol Active: All changes impact organization live data.
            </p>
        </div>
      </div>

      {/* Analytics Suite */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card bg-indigo-600/5 border-indigo-600/10 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-[0.2em] text-indigo-600">Total Global SKU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-indigo-700">{products.length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">Platform Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight">
                ${products.reduce((acc, p) => acc + (p.quantity * p.unit_price), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protocol Matrix */}
      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        onDelete={handleDelete}
        onEdit={(row) => { setSelectedProduct(row); setIsDialogOpen(true); }}
        searchPlaceholder="Scan platform asset matrix..."
        actions={(row) => (
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-indigo-500/10 hover:text-indigo-600 rounded-xl" onClick={() => { setSelectedProduct(row); setIsDialogOpen(true); }}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-500/10 rounded-xl" onClick={() => handleDelete(row)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      {/* Override Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Protocol Override: Asset"
        description="Modify underlying entity data. These changes are authoritative."
        onSubmit={handleUpdate}
        size="lg"
      >
        <div className="space-y-6 pt-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold text-muted-foreground tracking-widest">Entity Signature</Label>
              <Input id="name" name="name" defaultValue={selectedProduct?.name} className="glass-card font-bold h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-[10px] font-bold text-muted-foreground tracking-widest">Global SKU</Label>
              <Input id="sku" name="sku" defaultValue={selectedProduct?.sku} className="glass-card font-mono h-12" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label htmlFor="buy_price" className="text-[10px] font-bold text-indigo-600 tracking-widest">Purchase Protocol</Label>
              <Input id="buy_price" name="buy_price" type="number" step="0.01" defaultValue={selectedProduct?.buy_price || 0} className="glass-card h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price" className="text-[10px] font-bold text-indigo-600 tracking-widest">Retail Protocol</Label>
              <Input id="unit_price" name="unit_price" type="number" step="0.01" defaultValue={selectedProduct?.unit_price} className="glass-card h-12 font-bold" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-[10px] font-bold text-muted-foreground tracking-widest">Available Volume</Label>
              <Input id="quantity" name="quantity" type="number" step="any" defaultValue={selectedProduct?.quantity} className="glass-card h-12 font-bold" required />
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-red-500/5 rounded-2xl border border-red-500/20">
            <Building2 className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-xs text-red-600 font-bold">
              AUTHORIZED ACTION: You are modifying live resource data for "{selectedProduct?.companies?.name}".
            </p>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
