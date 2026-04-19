"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  CreditCard, 
  Sparkles, 
  Zap, 
  Trash2, 
  Edit2, 
  ShieldCheck,
  Layers,
  Globe,
  Fingerprint,
  Crown,
  Settings2,
  Terminal,
  Cpu,
  Database,
  Timer,
  DollarSign
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { FormDialog } from "@/components/ui/form-dialog";
import { DataTable } from "@/components/ui/data-table";
import { toast } from "sonner";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [newPlan, setNewPlan] = useState<any>({ name: "", description: "", monthly_price: 0, yearly_price: 0, max_invoices: 0, max_customers: 0, max_products: 0, max_users: 0, is_active: true, features: {} });
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
    const planData = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      monthly_price: Number(formData.get("monthly_price")),
      yearly_price: Number(formData.get("yearly_price")),
      max_invoices: Number(formData.get("max_invoices")),
      max_customers: Number(formData.get("max_customers")),
      max_products: Number(formData.get("max_products")),
      max_users: Number(formData.get("max_users")),
      is_active: formData.get("is_active") === "on",
      features: selectedPlan?.features || {}
    };

    try {
      if (selectedPlan) {
        const { error } = await supabase.from("subscription_plans").update(planData).eq("id", selectedPlan.id);
        if (error) throw error;
        toast.success("Tier configuration updated.");
      } else {
        const { error } = await supabase.from("subscription_plans").insert(planData);
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
    if (!confirm(`AUTHORIZED ACTION: Permanently retire the ${plan.name} protocol?`)) return;
    try {
      const { error } = await supabase.from("subscription_plans").delete().eq("id", plan.id);
      if (error) throw error;
      toast.success("Tier retired.");
      fetchPlans();
    } catch (err: any) {
      toast.error("Retirement failed.");
    }
  };

  const columns = [
    { header: "Protocol", accessorKey: "name" },
    { header: "Monthly", accessorKey: "monthly_price", cell: (row: any) => `$${row.monthly_price}` },
    { header: "Invoices", accessorKey: "max_invoices", cell: (row: any) => row.max_invoices === 0 ? "∞" : row.max_invoices },
    { header: "Status", accessorKey: "is_active", cell: (row: any) => (
      <Badge className={cn(
        "font-black uppercase tracking-widest text-[9px] px-2 py-0.5 rounded-full",
        row.is_active ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-destructive/10 text-destructive border border-destructive/20"
      )}>
        {row.is_active ? "ACTIVE" : "OFFLINE"}
      </Badge>
    )},
  ];

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-primary/10 rounded-2xl border border-primary/20">
                <Layers className="w-6 h-6 text-primary" />
             </div>
             <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Tier <span className="text-primary">Architecture</span></h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            Global subscription protocols and platform resource allocation.
          </p>
        </div>

        <div className="flex items-center gap-4">
           <Button 
             onClick={() => { setSelectedPlan(null); setNewPlan({ name: "", description: "", monthly_price: 0, yearly_price: 0, max_invoices: 0, max_customers: 0, max_products: 0, max_users: 0, is_active: true, features: {} }); setIsDialogOpen(true); }}
             className="h-14 px-8 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 active:scale-95 transition-all"
           >
             <Plus className="w-4 h-4 mr-2" /> Initialize Tier
           </Button>
           <div className="flex items-center gap-3 p-3 bg-muted/30 border border-border/40 rounded-2xl">
              <Fingerprint className="w-5 h-5 text-primary animate-pulse" />
              <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">Root Authority</p>
           </div>
        </div>
      </div>

      {/* Visual Tier Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((p) => (
          <Card key={p.id} className="glass-dashboard border-white/5 relative overflow-hidden group hover:border-indigo-500/30 transition-all cursor-default flex flex-col">
            <div className={cn(
              "absolute -top-10 -right-10 p-20 opacity-5 group-hover:opacity-10 transition-all group-hover:scale-110",
              p.name === "Free" ? "text-white" : p.name === "Pro" ? "text-indigo-500" : "text-primary"
            )}>
              {p.name === "Free" ? <CreditCard className="w-48 h-48" /> : p.name === "Pro" ? <Zap className="w-48 h-48" /> : <Crown className="w-48 h-48" />}
            </div>
            
            <CardHeader className="p-8 pb-4 relative z-10">
              <div className="flex items-center justify-between mb-8">
                 <Badge className={cn(
                   "font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-full",
                   p.name === "Free" ? "bg-surface-alpha text-white/40 border border-white/10" : p.name === "Pro" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-primary/10 text-primary border-primary/20"
                 )}>
                   {p.name} Protocol
                 </Badge>
                 <Settings2 className="w-4 h-4 text-white/20 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black tracking-tighter text-white">${p.monthly_price}</span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">/ MO</span>
              </div>
            </CardHeader>
            
            <CardContent className="p-8 pt-4 space-y-6 grow bg-black/20 relative z-10">
              <div className="flex flex-col gap-4">
                {[
                  { label: p.max_invoices === 0 ? "UNRESTRICTED" : p.max_invoices, sub: "NETWORK INVOICES", icon: Terminal },
                  { label: p.max_users === 0 ? "INFINITE" : p.max_users, sub: "MATRIX USERS", icon: Cpu },
                  { label: p.max_customers === 0 ? "UNLIMITED" : p.max_customers, sub: "NODE CUSTOMERS", icon: Database }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white/2 p-4 rounded-2xl border border-white/5 hover:border-indigo-500/20 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10 text-indigo-400">
                       <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                       <div className="text-sm font-black text-white italic">{item.label}</div>
                       <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-40">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>

            <CardFooter className="p-8 pt-6 border-t border-white/5 bg-white/1">
               <div className="w-full h-1 bg-surface-alpha rounded-full overflow-hidden">
                  <div className={cn(
                    "h-full transition-all duration-1000",
                    p.name === "Free" ? "w-1/3 bg-white/20" : p.name === "Pro" ? "w-2/3 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "w-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                  )} />
               </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Protocol Archive Table */}
      <div className="space-y-6 mt-20">
        <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground/60 flex items-center gap-2">
               <Timer className="w-3.5 h-3.5" /> Registry Feed
            </h3>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
               <span className="text-[10px] font-black text-primary uppercase tracking-widest">Protocol Matrix Sync</span>
            </div>
        </div>

        <DataTable
          data={plans}
          columns={columns}
          loading={loading}
          onDelete={handleDelete}
          onEdit={(row) => { setSelectedPlan(row); setIsDialogOpen(true); }}
          searchPlaceholder="Scan subscription protocol matrix..."
          actions={(row) => (
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl border border-transparent hover:border-indigo-500/20" 
                onClick={() => { setSelectedPlan(row); setIsDialogOpen(true); }}
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 text-red-500/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20" 
                onClick={() => handleDelete(row)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        />
      </div>

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
            <div className="space-y-2 group">
              <Label htmlFor="name" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1 group-focus-within:text-indigo-400 transition-colors">Protocol ID</Label>
              <Input id="name" name="name" defaultValue={selectedPlan?.name} className="h-14 bg-surface-alpha border-white/5 focus:border-indigo-500/50 rounded-2xl font-black italic tracking-tight" placeholder="e.g. ULTRA" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Operational Metadata</Label>
              <Input id="description" name="description" defaultValue={selectedPlan?.description} className="h-14 bg-surface-alpha border-white/5 focus:border-indigo-500/50 rounded-2xl" placeholder="System capabilities..." />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6 bg-indigo-500/5 p-8 rounded-[32px] border border-indigo-500/10">
            <div className="space-y-2">
              <Label htmlFor="monthly_price" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Monthly Valuation ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                <Input id="monthly_price" name="monthly_price" type="number" defaultValue={selectedPlan?.monthly_price} className="h-16 bg-black/40 border-white/5 focus:border-indigo-500/50 rounded-2xl pl-12 font-black text-white text-2xl tracking-tighter" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearly_price" className="text-[10px] font-black text-indigo-400 uppercase tracking-widest ml-1">Annual Protocol ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                <Input id="yearly_price" name="yearly_price" type="number" defaultValue={selectedPlan?.yearly_price} className="h-16 bg-black/40 border-white/5 focus:border-indigo-500/50 rounded-2xl pl-12 font-black text-white text-2xl tracking-tighter" required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { id: "max_invoices", label: "Invoices" },
              { id: "max_customers", label: "Nodes" },
              { id: "max_products", label: "Assets" },
              { id: "max_users", label: "Operators" }
            ].map(f => (
              <div key={f.id} className="space-y-2">
                <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-1">{f.label}</Label>
                <Input name={f.id} type="number" defaultValue={selectedPlan?.[f.id]} className="h-14 bg-surface-alpha border-white/5 focus:border-indigo-500/50 rounded-2xl font-black text-center text-lg" placeholder="0 = ∞" />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between p-6 bg-white/2 rounded-2xl border border-white/5">
            <div className="space-y-1">
              <Label className="text-[10px] font-black text-white uppercase tracking-widest">Active Status</Label>
              <p className="text-[9px] text-muted-foreground font-medium uppercase">Toggle public availability of this protocol</p>
            </div>
            <Switch name="is_active" defaultChecked={selectedPlan?.is_active ?? true} />
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
