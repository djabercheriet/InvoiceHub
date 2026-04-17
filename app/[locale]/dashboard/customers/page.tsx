"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { customerSchema } from "@/lib/domain/customers/customer.schema";
import { Plus, Users, Mail, Phone, MapPin, Trash2, Edit } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { FormDialog } from "@/components/ui/form-dialog";

// Types are now inferred from centralized schema
import { CustomerSchema as CustomerFormValues } from "@/lib/domain/customers/customer.types";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const supabase = createClient();
  const t = useTranslations('Common');

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", email: "", phone: "", address: "", tax_number: "" },
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single();
        
        if (!profile?.company_id) return;

        const { data, error } = await supabase
            .from("customers")
            .select("*")
            .eq("company_id", profile.company_id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        setCustomers(data || []);
    } catch (err: any) {
        toast.error("Failed to load stack: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const onSubmit = async (values: CustomerFormValues) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user?.id).single();
      
      if (!profile?.company_id) throw new Error("No active workspace detected.");

      const payload = {
        ...values,
        company_id: profile.company_id,
      };

      if (editingCustomer) {
        const { error } = await supabase.from("customers").update(payload).eq("id", editingCustomer.id);
        if (error) throw error;
        toast.success("Stakeholder profile updated.");
      } else {
        const { error } = await supabase.from("customers").insert([payload]);
        if (error) throw error;
        toast.success("New client synchronization complete.");
      }
      setIsDialogOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    form.reset({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || "",
      tax_number: customer.tax_number || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (customer: any) => {
    if (!confirm(`Permanently disconnect ${customer.name}? This action is irreversible.`)) return;
    
    setIsDeleting(true);
    try {
        const { error } = await supabase.from("customers").delete().eq("id", customer.id);
        if (error) throw error;
        toast.success("Stakeholder purged from system.");
        fetchCustomers();
    } catch (err: any) {
        toast.error("Purge failed: " + err.message);
    } finally {
        setIsDeleting(false);
    }
  };

  const columns = [
    { 
        header: "Stakeholder", 
        accessorKey: "name",
        cell: (row: any) => (
            <div className="flex flex-col">
                <span className="font-bold tracking-tight text-sm">{row.name}</span>
                <span className="text-[10px] text-muted-foreground opacity-70">{row.email}</span>
            </div>
        )
    },
    { 
        header: "Communication", 
        accessorKey: "phone",
        cell: (row: any) => (
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Phone className="w-3 h-3" /> {row.phone}
                </div>
                {row.address && (
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground opacity-60">
                        <MapPin className="w-3 h-3" /> {row.address}
                    </div>
                )}
            </div>
        )
    },
    {
        header: "Tax ID",
        accessorKey: "tax_number",
        cell: (row: any) => (
            <Badge variant="outline" className="font-mono text-[10px] bg-secondary/30 border-border/50">
                {row.tax_number || "NO_TAX_ID"}
            </Badge>
        )
    },
    {
        header: "Network Status",
        accessorKey: "status",
        cell: (row: any) => (
            <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400">Stable</span>
            </div>
        )
    }
  ];

  return (
    <div className="space-y-8 page-fade-in">
      {/* Header section with refined Vercel look */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Stakeholders
          </h1>
          <p className="text-muted-foreground font-medium">
            Management console for key accounts and billing relationships.
          </p>
        </div>

        <FormDialog
          title={editingCustomer ? "Edit Stakeholder" : "Sync New Stakeholder"}
          description="Update global identifiers and delivery protocols."
          triggerText="Add Stakeholder"
          isOpen={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) { setEditingCustomer(null); form.reset(); }
          }}
          onSubmit={form.handleSubmit(onSubmit)}
          loading={loading}
          size="md"
        >
          <Form {...form}>
            <div className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel className="text-xs font-bold text-muted-foreground">Full Name / Organization</FormLabel><FormControl><Input {...field} className="glass-card" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold text-muted-foreground">Email Protocol</FormLabel><FormControl><Input type="email" {...field} className="glass-card" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold text-muted-foreground">Direct Line</FormLabel><FormControl><Input {...field} className="glass-card" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem><FormLabel className="text-xs font-bold text-muted-foreground">Physical Coordinates</FormLabel><FormControl><Input {...field} className="glass-card" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="tax_number" render={({ field }) => (
                <FormItem><FormLabel className="text-xs font-bold text-muted-foreground">Tax / VAT Registry</FormLabel><FormControl><Input {...field} className="glass-card" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </Form>
        </FormDialog>
      </div>

      {/* KPI Overlays for premium feel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="glass-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">Total Stakeholders</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{customers.length}</div>
            </CardContent>
         </Card>
         <Card className="glass-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">Active Syncs</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{customers.length}</div>
            </CardContent>
         </Card>
         <Card className="glass-card bg-emerald-500/5 border-emerald-500/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold tracking-widest text-emerald-600 dark:text-emerald-400">System Health</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">Optimal</div>
            </CardContent>
         </Card>
      </div>

      {/* Main Data View */}
      <DataTable 
        data={customers} 
        columns={columns} 
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="Scan stakeholder registry..."
      />
    </div>
  );
}
