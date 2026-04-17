"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Building2, Plus, Mail, Phone, MapPin, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormDialog } from "@/components/ui/form-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const supplierSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  contact_name: z.string().optional(),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional()
});

type SupplierForm = z.infer<typeof supplierSchema>;

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const supabase = createClient();

  const form = useForm<SupplierForm>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: '', contact_name: '', email: '', phone: '', address: '', notes: '' },
  });

  useEffect(() => { fetchSuppliers(); }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;
      setCompanyId(profile.company_id);

      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('company_id', profile.company_id)
        .eq('is_active', true)
        .order('name');
        
      if (error) throw error;
      setSuppliers(data || []);
    } catch (err: any) {
      toast.error("Failed to load suppliers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: SupplierForm) => {
    if (!companyId) return;
    try {
      if (editingId) {
        const { error } = await supabase.from('suppliers').update(values).eq('id', editingId);
        if (error) throw error;
        toast.success(`Supplier "${values.name}" updated.`);
      } else {
        const { error } = await supabase.from('suppliers').insert({
          ...values,
          company_id: companyId,
          is_active: true,
        });
        if (error) throw error;
        toast.success(`Supplier "${values.name}" added.`);
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingId(null);
      fetchSuppliers();
    } catch (err: any) {
      toast.error("Failed to save supplier: " + err.message);
    }
  };

  const openEdit = (supplier: any) => {
    form.reset({
      name: supplier.name,
      contact_name: supplier.contact_name || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      notes: supplier.notes || ""
    });
    setEditingId(supplier.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (supplier: any) => {
    if (!confirm(`Deactivate supplier "${supplier.name}"?`)) return;
    const { error } = await supabase.from('suppliers').update({ is_active: false }).eq('id', supplier.id);
    if (error) { toast.error("Failed to deactivate supplier."); return; }
    toast.success("Supplier deactivated.");
    fetchSuppliers();
  };

  return (
    <div className="space-y-8 page-fade-in px-4 lg:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Building2 className="w-6 h-6 md:w-8 md:h-8 text-violet-500" />
            Suppliers
          </h1>
          <p className="text-muted-foreground font-medium text-sm md:text-base">Manage your vendor and procurement network.</p>
        </div>
        <Button
          onClick={() => { setEditingId(null); form.reset({ name: '', contact_name: '', email: '', phone: '', address: '', notes: '' }); setIsDialogOpen(true); }}
          size="lg"
          className="w-full md:w-auto gap-2 font-bold bg-violet-600 hover:bg-violet-700 shadow-xl shadow-violet-500/20"
        >
          <Plus className="w-5 h-5" /> Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Active Vendors</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold tracking-tight">{suppliers.length}</div></CardContent>
        </Card>
        <Card className="glass-card bg-violet-500/5 border-violet-500/20">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-violet-600 uppercase">With Email</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-violet-600">{suppliers.filter(s => s.email).length}</div></CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">With Phone</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{suppliers.filter(s => s.phone).length}</div></CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-3xl bg-muted/30 animate-pulse" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 md:p-20 border border-dashed rounded-3xl text-center space-y-4">
          <Building2 className="w-12 h-12 text-muted-foreground opacity-20" />
          <div>
            <h3 className="font-bold text-lg tracking-tight">No suppliers yet</h3>
            <p className="text-muted-foreground text-sm">Add your first vendor to start creating purchase orders.</p>
          </div>
          <Button onClick={() => { setEditingId(null); setIsDialogOpen(true); }} variant="outline" className="gap-2 font-bold border-violet-500/30 text-violet-600 hover:bg-violet-500/5">
            <Plus className="w-4 h-4" /> Add First Supplier
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map(supplier => (
            <Card key={supplier.id} className="glass-card hover:shadow-2xl hover:border-violet-500/30 transition-all duration-300 group flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 font-bold text-lg">
                    {supplier.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-violet-600 hover:bg-violet-500/10 rounded-xl" onClick={() => openEdit(supplier)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => handleDelete(supplier)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-bold tracking-tight line-clamp-1">{supplier.name}</h3>
                  {supplier.contact_name && <p className="text-xs text-muted-foreground font-medium line-clamp-1">{supplier.contact_name}</p>}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 grow">
                {supplier.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="w-3 h-3 text-violet-500 shrink-0" />
                    <span className="truncate">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3 text-violet-500 shrink-0" />
                    <span className="truncate">{supplier.phone}</span>
                  </div>
                )}
                {supplier.address && (
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3 text-violet-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>
                )}
              </CardContent>
              <div className="p-4 pt-0 mt-auto">
                <Button
                  variant="outline"
                  className="w-full font-bold text-xs border-violet-500/20 text-violet-600 hover:bg-violet-500/5 h-9"
                  onClick={() => window.location.href = `/dashboard/inventory/purchase-orders?supplier=${supplier.id}`}
                >
                  View Purchase Orders
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <FormDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        title={editingId ? "Edit Supplier" : "New Supplier"} 
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <CardDescription className="mb-4">Enter vendor details to link them to purchase orders.</CardDescription>
        <Form {...form}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest">Company Name *</FormLabel>
                  <FormControl><Input placeholder="Acme Supplies Inc." className="h-11 bg-background" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contact_name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest">Contact Person</FormLabel>
                  <FormControl><Input placeholder="John Doe" className="h-11 bg-background" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest">Email Address</FormLabel>
                  <FormControl><Input placeholder="contact@supplier.com" type="email" className="h-11 bg-background" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] uppercase font-bold tracking-widest">Phone Number</FormLabel>
                  <FormControl><Input placeholder="+1 555 0123" className="h-11 bg-background" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold tracking-widest">Physical Address</FormLabel>
                <FormControl><Textarea placeholder="123 Industrial Park..." className="resize-none bg-background min-h-[80px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </Form>
      </FormDialog>
    </div>
  );
}
