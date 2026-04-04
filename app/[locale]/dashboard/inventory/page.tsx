"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Plus, Package, Search, Edit, Trash2, Image as ImageIcon, 
  Loader2, AlertCircle, TrendingUp, TrendingDown, History,
  ArrowUpRight, ArrowDownRight, Info, Scale
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { FormDialog } from "@/components/ui/form-dialog";
import { cn } from "@/lib/utils";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(2, "SKU is required"),
  category: z.string().min(2, "Category is required"),
  buy_price: z.coerce.number().min(0, "Buy price must be >= 0"),
  unit_price: z.coerce.number().min(0, "Retail price must be >= 0"),
  quantity: z.coerce.number().min(0, "Quantity cannot be negative"),
  min_stock_level: z.coerce.number().min(0, "Min stock cannot be negative"),
  unit_type: z.string().default("unit"),
  image_url: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inventory" | "movements">("inventory");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const supabase = createClient();
  const t = useTranslations('Inventory');

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", sku: "", category: "", buy_price: 0, unit_price: 0, quantity: 0, min_stock_level: 0, unit_type: "unit", image_url: ""
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
        if (!profile?.company_id) return;

        const [prodRes, moveRes] = await Promise.all([
          supabase.from("products").select("*, categories:category_id(name)").eq("company_id", profile.company_id).order('created_at', { ascending: false }),
          supabase.from("stock_movements").select("*, products(name, sku)").eq("company_id", profile.company_id).order('created_at', { ascending: false }).limit(50)
        ]);

        if (prodRes.error) throw prodRes.error;
        setProducts(prodRes.data.map((p: any) => ({
          ...p,
          categoryName: p.categories?.name || "Uncategorized"
        })));
        if (moveRes.data) setMovements(moveRes.data);
    } catch (err: any) {
        toast.error("Data synchronization failed: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const onSubmit = async (values: ProductFormValues) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user?.id).single();
      if (!profile?.company_id) throw new Error("Workspace context required.");

      let catId = null;
      if (values.category) {
        const { data: catData } = await supabase.from("categories").select("id").eq("name", values.category).eq("company_id", profile.company_id).maybeSingle();
        if (!catData) {
          const { data: newCat } = await supabase.from("categories").insert({ name: values.category, company_id: profile.company_id }).select("id").single();
          catId = newCat?.id;
        } else {
          catId = catData.id;
        }
      }

      const payload = {
        name: values.name,
        sku: values.sku,
        buy_price: values.buy_price,
        unit_price: values.unit_price,
        quantity: values.quantity,
        min_stock_level: values.min_stock_level,
        unit_type: values.unit_type,
        company_id: profile.company_id,
        category_id: catId,
        image_url: values.image_url
      };

      if (editingProduct) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([payload]);
        if (error) throw error;
      }
      setIsDialogOpen(false);
      fetchData();
      toast.success("Inventory synchronized.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      sku: product.sku,
      category: product.categoryName,
      unit_price: product.unit_price,
      buy_price: product.buy_price || 0,
      quantity: product.quantity,
      min_stock_level: product.min_stock_level,
      unit_type: product.unit_type || "unit",
      image_url: product.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (product: any) => {
    if (!confirm(`Permanently decommission SKU: ${product.sku}?`)) return;
    try {
        const { error } = await supabase.from("products").delete().eq("id", product.id);
        if (error) throw error;
        toast.success("Entity removed from master index.");
        fetchData();
    } catch (err: any) {
        toast.error("Decommissioning failed: " + err.message);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        form.setValue("image_url", data.publicUrl);
        toast.success("Visual asset uploaded.");
    } catch (err: any) {
        toast.error("Asset upload failed: " + err.message);
    } finally {
        setUploadingImage(false);
    }
  };

  const columns = [
    {
        header: "Asset",
        accessorKey: "image_url",
        cell: (row: any) => (
            <div className="w-10 h-10 rounded-lg bg-secondary/30 border border-border/40 overflow-hidden flex items-center justify-center">
                {row.image_url ? <img src={row.image_url} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 text-muted-foreground/30" />}
            </div>
        )
    },
    { 
        header: "Product / SKU", 
        accessorKey: "name",
        cell: (row: any) => (
            <div className="flex flex-col">
                <span className="font-bold tracking-tight text-sm leading-none">{row.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono opacity-60">{row.sku}</span>
            </div>
        )
    },
    { 
        header: "Classification", 
        accessorKey: "categoryName",
        cell: (row: any) => (
            <Badge variant="outline" className="font-bold text-[9px] tracking-widest border-border/40 bg-muted/20">
                {row.categoryName}
            </Badge>
        )
    },
    { 
        header: "Inventory", 
        accessorKey: "quantity",
        cell: (row: any) => {
            const isLow = row.quantity <= row.min_stock_level;
            return (
                <div className="flex flex-col">
                    <div className={cn("text-base font-bold tracking-tight", isLow ? "text-amber-500" : "text-foreground")}>
                        {row.quantity} <span className="text-[10px] opacity-60">{row.unit_type || 'units'}</span>
                    </div>
                </div>
            )
        }
    },
    { 
        header: "Valuation", 
        accessorKey: "unit_price",
        cell: (row: any) => (
            <div className="flex flex-col text-right">
                <div className="text-sm font-bold tracking-tight text-primary">${row.unit_price}</div>
                <div className="text-[9px] text-muted-foreground font-bold opacity-60">Buy: ${row.buy_price}</div>
            </div>
        )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Package className="w-8 h-8 text-primary" />
            Inventory Hub
          </h1>
          <p className="text-muted-foreground font-medium">Manage physical assets, track stock levels, and monitor movements.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-muted p-1 rounded-xl flex gap-1">
            <button onClick={() => setActiveTab("inventory")} className={cn("px-4 py-2 rounded-lg text-[10px] font-bold tracking-tight transition-all", activeTab === "inventory" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}>Index</button>
            <button onClick={() => setActiveTab("movements")} className={cn("px-4 py-2 rounded-lg text-[10px] font-bold tracking-tight transition-all", activeTab === "movements" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}>Movements</button>
          </div>
          <Button onClick={() => { setEditingProduct(null); form.reset(); setIsDialogOpen(true); }} className="gap-2 font-bold tracking-tight shadow-lg shadow-primary/20"><Plus className="w-4 h-4" /> Register Asset</Button>
        </div>
      </div>

      {activeTab === "inventory" ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card border-none shadow-xl bg-primary/5">
              <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-primary">Total SKU</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold tracking-tight">{products.length}</div></CardContent>
            </Card>
            <Card className="glass-card border-none shadow-xl">
              <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">Stock Value</CardTitle></CardHeader>
              <CardContent><div className="text-3xl font-bold tracking-tight">${products.reduce((a,b)=>a+(b.quantity*b.unit_price),0).toLocaleString()}</div></CardContent>
            </Card>
            <Card className={cn("glass-card border-none shadow-xl", products.filter(p=>p.quantity <= p.min_stock_level).length > 0 ? "bg-amber-500/10 border-amber-500/20" : "")}>
              <CardHeader className="pb-2"><CardTitle className={cn("text-[10px] font-bold tracking-widest", products.filter(p=>p.quantity <= p.min_stock_level).length > 0 ? "text-amber-600" : "text-muted-foreground")}>Low Stock Alerts</CardTitle></CardHeader>
              <CardContent><div className={cn("text-3xl font-bold tracking-tight", products.filter(p=>p.quantity <= p.min_stock_level).length > 0 ? "text-amber-600" : "")}>{products.filter(p=>p.quantity <= p.min_stock_level).length}</div></CardContent>
            </Card>
          </div>
          <DataTable data={products} columns={columns} loading={loading} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Search asset index..." />
        </>
      ) : (
        <Card className="glass-card border-none shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-muted/50 border-b border-border/40">
                <tr>
                  <th className="p-4 text-[10px] font-bold tracking-widest">Timestamp</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest">Asset</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-center">Type</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest text-right">Quantity</th>
                  <th className="p-4 text-[10px] font-bold tracking-widest">Note</th>
                </tr>
              </thead>
              <tbody>
                {movements.map(m => (
                  <tr key={m.id} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-xs font-mono opacity-60">{new Date(m.created_at).toLocaleString()}</td>
                    <td className="p-4"><div className="flex flex-col"><span className="font-bold tracking-tight text-xs">{m.products?.name}</span><span className="text-[9px] font-mono opacity-50">{m.products?.sku}</span></div></td>
                    <td className="p-4 text-center">
                      <Badge className={cn("text-[9px] font-bold", m.movement_type === 'in' ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600")}>{m.movement_type}</Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className={cn("font-bold tracking-tight", m.movement_type === 'in' ? "text-emerald-500" : "text-blue-500")}>
                        {m.movement_type === 'in' ? '+' : '-'}{m.quantity}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{m.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {movements.length === 0 && <div className="p-20 text-center text-muted-foreground text-sm">No recorded stock movements in history.</div>}
          </div>
        </Card>
      )}

      {/* Register Modal */}
      <FormDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} title={editingProduct ? "Edit Asset" : "Initialize Asset"} onSubmit={form.handleSubmit(onSubmit)}>
        <Form {...form}>
          <div className="space-y-4 pt-4">
            <div className="flex justify-center mb-4">
              <div className="relative w-32 h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden group">
                {form.watch("image_url") ? <img src={form.watch("image_url")} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-muted-foreground/30" />}
                <label className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all">
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="sku" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">SKU</FormLabel><FormControl><Input {...field} className="font-mono" /></FormControl></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Category</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="unit_type" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Unit (kg, unit...)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border border-border/40">
              <FormField control={form.control} name="buy_price" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold text-primary tracking-widest">Buy Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="unit_price" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold text-primary tracking-widest">Sell Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Available Stock</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="min_stock_level" render={({ field }) => (
                <FormItem><FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Alert Threshold</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
              )} />
            </div>
          </div>
        </Form>
      </FormDialog>
    </div>
  );
}
