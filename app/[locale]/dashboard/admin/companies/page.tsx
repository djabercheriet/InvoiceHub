"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, Trash2, Edit2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { FormDialog } from "@/components/ui/form-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => { fetchCompanies(); }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("companies")
        .select("*, profiles(count)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setCompanies(data || []);
    } catch (err: any) {
      toast.error("Failed to load companies: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      domain: formData.get("domain"),
      tax_id: formData.get("tax_id"),
      website: formData.get("website"),
      billing_email: formData.get("billing_email"),
    };
    try {
      if (selectedCompany) {
        const { error } = await supabase.from("companies").update(data).eq("id", selectedCompany.id);
        if (error) throw error;
        toast.success("Company updated.");
      } else {
        const { error } = await supabase.from("companies").insert(data);
        if (error) throw error;
        toast.success("Company created.");
      }
      setIsDialogOpen(false);
      fetchCompanies();
    } catch (err: any) {
      toast.error("Operation failed: " + err.message);
    }
  };

  const handleDelete = async (company: any) => {
    if (!confirm(`Delete "${company.name}"? This will affect all associated users.`)) return;
    try {
      const { error } = await supabase.from("companies").delete().eq("id", company.id);
      if (error) throw error;
      toast.success("Company removed.");
      fetchCompanies();
    } catch (err: any) {
      toast.error("Delete failed.");
    }
  };

  const columns = [
    {
      header: "Company",
      accessorKey: "name",
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 font-bold text-indigo-600 uppercase text-sm shrink-0">
            {row.name?.substring(0, 1)}
          </div>
          <span className="font-semibold text-sm">{row.name}</span>
        </div>
      ),
    },
    {
      header: "Domain",
      accessorKey: "domain",
      cell: (row: any) => (
        <Badge variant="outline" className="font-medium text-xs bg-muted/30 border-border/40">
          {row.domain || "—"}
        </Badge>
      ),
    },
    {
      header: "Tax ID",
      accessorKey: "tax_id",
      cell: (row: any) => (
        <span className="text-xs font-mono text-muted-foreground">{row.tax_id || "—"}</span>
      ),
    },
    {
      header: "Status",
      accessorKey: "is_active",
      cell: () => (
        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-medium text-xs">
          Active
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-7">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-indigo-500" />
            Organizations
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage all registered workspace organizations on the platform.
          </p>
        </div>
        <Button
          onClick={() => { setSelectedCompany(null); setIsDialogOpen(true); }}
          size="sm"
          className="gap-2 font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Organization
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
              Total Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{companies.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs uppercase font-semibold tracking-wider text-indigo-500">
              Enterprise Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-indigo-600">3</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <DataTable
        data={companies}
        columns={columns}
        loading={loading}
        onDelete={handleDelete}
        onEdit={(row) => { setSelectedCompany(row); setIsDialogOpen(true); }}
        searchPlaceholder="Search organizations..."
        actions={(row) => (
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 hover:bg-indigo-500/10 hover:text-indigo-600"
              onClick={() => { setSelectedCompany(row); setIsDialogOpen(true); }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost" size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => handleDelete(row)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      />

      {/* Dialog */}
      <FormDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={selectedCompany ? "Edit Organization" : "New Organization"}
        description="Configure organization details and billing information."
        onSubmit={handleCreateOrUpdate}
      >
        <div className="space-y-5 pt-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Organization Name
              </Label>
              <Input id="name" name="name" defaultValue={selectedCompany?.name} placeholder="Acme Corp" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Domain
              </Label>
              <Input id="domain" name="domain" defaultValue={selectedCompany?.domain} placeholder="acme.io" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tax ID
            </Label>
            <Input id="tax_id" name="tax_id" defaultValue={selectedCompany?.tax_id} placeholder="TAX-009-887" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billing_email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Billing Email
            </Label>
            <Input id="billing_email" name="billing_email" defaultValue={selectedCompany?.billing_email} placeholder="billing@acme.io" type="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Website
            </Label>
            <Input id="website" name="website" defaultValue={selectedCompany?.website} placeholder="https://acme.io" />
          </div>
          <div className="flex items-center gap-2.5 p-3.5 bg-amber-500/5 rounded-lg border border-amber-500/20">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-600 font-medium">
              Modifying organization details may affect associated user access and billing cycles.
            </p>
          </div>
        </div>
      </FormDialog>
    </div>
  );
}
