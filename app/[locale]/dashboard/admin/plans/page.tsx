"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Sparkles, Zap, Trash2, Edit2, ShieldCheck, DollarSign, Crown, Activity } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("monthly_price", { ascending: true });
      if (error) throw error;
      setPlans(data || []);
    } catch (err: any) {
      toast.error("Failed to load plans: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      description: formData.get("description"),
      monthly_price: parseFloat(formData.get("monthly_price") as string),
      yearly_price: parseFloat(formData.get("yearly_price") as string),
      max_invoices: parseInt(formData.get("max_invoices") as string),
      max_customers: parseInt(formData.get("max_customers") as string),
      max_products: parseInt(formData.get("max_products") as string),
      max_users: parseInt(formData.get("max_users") as string),
    };
    try {
      if (selectedPlan) {
        const { error } = await supabase.from("subscription_plans").update(data).eq("id", selectedPlan.id);
        if (error) throw error;
        toast.success("Tier configuration updated.");
      } else {
        const { error } = await supabase.from("subscription_plans").insert(data);
        if (error) throw error;
        toast.success("New tier initialized.");
      }
      setIsDialogOpen(false);
      fetchPlans();
    } catch (err: any) {
      toast.error("Operation failed: " + err.message);
    }
  };

  const handleDelete = async (plan: any) => {
    if (!confirm(`AUTHORIZED ACTION: Permanently retire the "${plan.name}" plan? This impacts active billing cycles.`)) return;
    try {
      const { error } = await supabase.from("subscription_plans").delete().eq("id", plan.id);
      if (error) throw error;
      toast.success("Tier retired from global catalog.");
      fetchPlans();
    } catch (err: any) {
      toast.error("Retirement failed.");
    }
  };

  const columns = [
    {
      header: "Tier Authority",
      accessorKey: "name",
      cell: (row: any) => (
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 shadow-lg",
            row.name === "Free" ? "bg-muted/50 border-border/40" : row.name === "Pro" ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" : "bg-primary text-primary-foreground border-primary/20"
          )}>
            {row.name === "Free" ? <CreditCard className="w-5 h-5" /> : row.name === "Pro" ? <Zap className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm leading-none">{row.name} Tier</span>
            <span className="text-[10px] text-muted-foreground font-medium opacity-70 truncate max-w-[200px] mt-1">{row.description}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Monthly Valuation",
      accessorKey: "monthly_price",
      cell: (row: any) => (
        <div className="flex flex-col">
            <span className="font-bold tracking-tight text-base">${row.monthly_price}</span>
            <span className="text-[9px] font-bold text-muted-foreground tracking-widest">Base / Month</span>
        </div>
      ),
    },
    {
      header: "Resource Thresholds",
      accessorKey: "max_users",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="font-bold text-[9px] tracking-widest border-border/40 bg-muted/20">
                {row.max_users === 0 ? "Infinite" : row.max_users} Users
            </Badge>
            <Badge variant="outline" className="font-bold text-[9px] tracking-widest border-border/40 bg-muted/20">
                {row.max_invoices === 0 ? "Infinite" : row.max_invoices} Invoices
            </Badge>
        </div>
      ),
    },
    {
      header: "Protocol Status",
      accessorKey: "is_active",
      cell: () => (
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-600 tracking-widest">Live Tier</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-1000">
      {/* Super Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Crown className="w-8 h-8 text-indigo-600" />
            Tier Architecture
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Authoritative management of platform subscription protocols and resource limits.
          </p>
        </div>
        <Button
          onClick={() => { setSelectedPlan(null); setIsDialogOpen(true); }}
          className="gap-2 font-bold tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 py-6 px-8 rounded-2xl"
        >
          <Plus className="w-5 h-5" /> Initialize Tier
        </Button>
      </div>

      {/* Visual Tier Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <Card key={p.id} className="glass-card border-none shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all cursor-default">
            <div className={cn(
              "absolute -top-4 -right-4 p-8 opacity-10 group-hover:opacity-20 transition-opacity",
              p.name === "Free" ? "text-muted-foreground" : p.name === "Pro" ? "text-indigo-500" : "text-primary"
            )}>
              {p.name === "Free" ? <CreditCard className="w-40 h-40" /> : p.name === "Pro" ? <Zap className="w-40 h-40" /> : <Crown className="w-40 h-40" />}
            </div>
            <CardHeader className="pb-8">
              <CardTitle className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground border-b border-border/20 pb-4 mb-4">{p.name} Tier Protocol</CardTitle>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-bold tracking-tight text-foreground">${p.monthly_price}</span>
                <span className="text-xs font-bold text-muted-foreground mb-1 tracking-widest">/ Month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pb-8">
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center"><Activity className="w-3.5 h-3.5 text-emerald-600" /></div>
                {p.max_invoices === 0 ? "Unrestricted" : p.max_invoices} Global Invoices
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-indigo-600" /></div>
                {p.max_users === 0 ? "Infinite" : p.max_users} Multi-tenant Users
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Protocol Archive Table */}
      <DataTable
        data={plans}
        columns={columns}
        loading={loading}
        onDelete={handleDelete}
        onEdit={(row) => { setSelectedPlan(row); setIsDialogOpen(true); }}
        searchPlaceholder="Scan subscription protocol matrix..."
        actions={(row) => (
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-indigo-500/10 hover:text-indigo-600 rounded-xl" onClick={() => { setSelectedPlan(row); setIsDialogOpen(true); }}>
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-red-500 hover:bg-red-500/10 rounded-xl" onClick={() => handleDelete(row)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      {/* Configuration Override Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={selectedPlan ? "Tier Override" : "Initialize Tier Protocol"}
        description="Configure authoritative resource limits and valuation metrics."
        onSubmit={handleCreateOrUpdate}
        size="lg"
      >
        <div className="space-y-8 pt-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold text-muted-foreground tracking-[0.2em]">Protocol ID</Label>
              <Input id="name" name="name" defaultValue={selectedPlan?.name} className="h-12 glass-card font-bold tracking-tight" placeholder="e.g. ULTRA" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] font-bold text-muted-foreground tracking-[0.2em]">Operational Metadata</Label>
              <Input id="description" name="description" defaultValue={selectedPlan?.description} className="h-12 glass-card" placeholder="System capabilities..." />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10">
            <div className="space-y-2">
              <Label htmlFor="monthly_price" className="text-[10px] font-bold text-indigo-600 tracking-[0.2em]">Monthly Valuation ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <Input id="monthly_price" name="monthly_price" type="number" defaultValue={selectedPlan?.monthly_price} className="h-14 glass-card pl-10 font-bold text-xl" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearly_price" className="text-[10px] font-bold text-indigo-600 tracking-[0.2em]">Yearly Protocol ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <Input id="yearly_price" name="yearly_price" type="number" defaultValue={selectedPlan?.yearly_price} className="h-14 glass-card pl-10 font-bold text-xl" required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-2"><Label className="text-[10px] font-bold tracking-widest opacity-60">Invoices</Label><Input name="max_invoices" type="number" defaultValue={selectedPlan?.max_invoices} className="h-12 glass-card font-bold" /></div>
            <div className="space-y-2"><Label className="text-[10px] font-bold tracking-widest opacity-60">Customers</Label><Input name="max_customers" type="number" defaultValue={selectedPlan?.max_customers} className="h-12 glass-card font-bold" /></div>
            <div className="space-y-2"><Label className="text-[10px] font-bold tracking-widest opacity-60">Products</Label><Input name="max_products" type="number" defaultValue={selectedPlan?.max_products} className="h-12 glass-card font-bold" /></div>
            <div className="space-y-2"><Label className="text-[10px] font-bold tracking-widest opacity-60">Users</Label><Input name="max_users" type="number" defaultValue={selectedPlan?.max_users} className="h-12 glass-card font-bold" /></div>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
