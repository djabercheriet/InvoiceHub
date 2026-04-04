"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Trash2, Edit2, ShieldAlert, MapPin, Building2, UserCircle2, Mail, Phone } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*, companies(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCustomers(data || []);
    } catch (err: any) {
      toast.error("Failed to load customers: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
    };
    try {
      if (selectedCustomer) {
        const { error } = await supabase.from("customers").update(data).eq("id", selectedCustomer.id);
        if (error) throw error;
        toast.success("Identity profile updated.");
      }
      setIsDialogOpen(false);
      fetchCustomers();
    } catch (err: any) {
      toast.error("Update failed: " + err.message);
    }
  };

  const handleDelete = async (customer: any) => {
    if (!confirm(`AUTHORIZED ACTION: Permanently expunge "${customer.name}"? This affects all linked organization reports.`)) return;
    try {
      const { error } = await supabase.from("customers").delete().eq("id", customer.id);
      if (error) throw error;
      toast.success("Entity purged from global registry.");
      fetchCustomers();
    } catch (err: any) {
      toast.error("Purging failed.");
    }
  };

  const columns = [
    {
      header: "Identity Signature",
      accessorKey: "name",
      cell: (row: any) => (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 font-bold text-blue-600 text-sm shrink-0">
            {row.name?.substring(0, 1) || "C"}
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm leading-none">{row.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono opacity-60">ID: {row.id?.substring(0, 8)}...</span>
          </div>
        </div>
      ),
    },
    {
      header: "Affiliated Workspace",
      accessorKey: "companies.name",
      cell: (row: any) => (
        <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-blue-500/60" />
            <Badge variant="outline" className="font-bold text-[9px] tracking-widest bg-blue-500/5 border-blue-500/20 text-blue-600">
                {row.companies?.name || "Independent"}
            </Badge>
        </div>
      ),
    },
    {
      header: "Protocol Contact",
      accessorKey: "email",
      cell: (row: any) => (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground tracking-widest leading-none">
                <Mail className="w-3 h-3" /> {row.email || "NO-SIGNAL"}
            </div>
            {row.phone && (
                <div className="flex items-center gap-2 text-[9px] font-mono text-muted-foreground/60 leading-none">
                    <Phone className="w-2.5 h-2.5" /> {row.phone}
                </div>
            )}
        </div>
      ),
    },
    {
      header: "Deployment Zone",
      accessorKey: "address",
      cell: (row: any) => (
        <div className="flex items-start gap-1.5 text-muted-foreground self-start py-2">
          <MapPin className="w-3.5 h-3.5 text-blue-500/40 shrink-0" />
          <span className="text-[10px] font-bold opacity-70 tracking-widest leading-relaxed max-w-[200px]">{row.address || "Unspecified Terminal"}</span>
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
            <Globe className="w-8 h-8 text-blue-600" />
            Global Customer Registry
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Platform-wide identity tracking and stakeholder synchronization across all tenants.
          </p>
        </div>
        <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
            <p className="text-[10px] font-bold tracking-widest text-red-600 max-w-[200px]">
                High-Level Protocol Active: Database parity enforced across organizations.
            </p>
        </div>
      </div>

      {/* Statistics Suite */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card bg-blue-600/5 border-blue-600/10 shadow-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-[0.2em] text-blue-600">Total Global Entities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-blue-700">{customers.length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground">New Records (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight">
                {customers.filter(c => new Date(c.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Protocol Matrix */}
      <DataTable
        data={customers}
        columns={columns}
        loading={loading}
        onDelete={handleDelete}
        onEdit={(row) => { setSelectedCustomer(row); setIsDialogOpen(true); }}
        searchPlaceholder="Scan platform entity matrix..."
        actions={(row) => (
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <Button variant="ghost" size="icon" className="h-9 w-9 hover:bg-blue-500/10 hover:text-blue-600 rounded-xl" onClick={() => { setSelectedCustomer(row); setIsDialogOpen(true); }}>
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
        title="Protocol Override: Identity"
        description="Authoritative profile modification for the selected stakeholder."
        onSubmit={handleUpdate}
        size="lg"
      >
        <div className="space-y-6 pt-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-bold text-muted-foreground tracking-widest">Entity Name Signature</Label>
              <Input id="name" name="name" defaultValue={selectedCustomer?.name} className="glass-card font-bold h-12" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold text-muted-foreground tracking-widest">Global Dispatch Address</Label>
              <Input id="email" name="email" type="email" defaultValue={selectedCustomer?.email} className="glass-card font-mono h-12" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-bold text-muted-foreground tracking-widest">Comm Signal Protocol</Label>
              <Input id="phone" name="phone" defaultValue={selectedCustomer?.phone} className="glass-card h-12" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-[10px] font-bold text-muted-foreground tracking-widest">Geographical Deployment Terminal</Label>
              <Input id="address" name="address" defaultValue={selectedCustomer?.address} className="glass-card h-12" />
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-red-500/5 rounded-2xl border border-red-500/20">
            <UserCircle2 className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-xs text-red-600 font-bold tracking-tight">
              AUTHORIZED ACTION: Profile modifications impact authority across tenant boundaries.
            </p>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
