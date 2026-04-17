"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Send, Download, Trash2, ArrowLeft, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import NewInvoiceBuilder from "@/components/invoices/new-invoice-builder";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "new">("list");
  const supabase = createClient();

  useEffect(() => {
    if (viewMode === "list") {
      fetchInvoices();
    }
  }, [viewMode]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
        if (!profile?.company_id) return;

        const { data, error } = await supabase
          .from("invoices")
          .select("*, customers(name, email)")
          .eq("company_id", profile.company_id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setInvoices(data || []);
    } catch (err: any) {
        toast.error("Audit trail acquisition failed: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async (invoice: any) => {
    if (!confirm(`Permanently purge ${invoice.invoice_number}?`)) return;
    try {
        const { error } = await supabase.from("invoices").delete().eq("id", invoice.id);
        if (error) throw error;
        toast.success("Document purged from records.");
        fetchInvoices();
    } catch (err: any) {
        toast.error("Decommissioning failed.");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return { label: "Settled", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      case "sent":
        return { label: "Pending", class: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
      case "draft":
        return { label: "Internal", class: "bg-muted text-muted-foreground border-border/50" };
      case "overdue":
        return { label: "Conflict", class: "bg-destructive/10 text-destructive border-destructive/20" };
      default:
        return { label: status, class: "" };
    }
  };

  const columns = [
    { 
        header: "Document Reference", 
        accessorKey: "invoice_number",
        cell: (row: any) => (
            <div className="flex flex-col">
                <span className="font-bold tracking-tight text-sm">{row.invoice_number}</span>
                <span className="text-[10px] text-muted-foreground opacity-70">
                    ID: {row.id.substring(0, 8)}...
                </span>
            </div>
        )
    },
    { 
        header: "Stakeholder", 
        accessorKey: "customers.name",
        cell: (row: any) => (
            <div className="flex flex-col">
                <span className="font-bold text-sm">{row.customers?.name || "Anonymous Entity"}</span>
                <span className="text-[10px] text-muted-foreground">{row.customers?.email}</span>
            </div>
        )
    },
    { 
        header: "Valuation", 
        accessorKey: "total",
        cell: (row: any) => (
            <div className="font-bold tracking-tight text-sm text-primary">
                ${(row.total || 0).toLocaleString()}
            </div>
        )
    },
    { 
        header: "Issue Date", 
        accessorKey: "issue_date",
        cell: (row: any) => (
            <span className="text-[11px] font-mono font-medium opacity-60">{row.issue_date}</span>
        )
    },
    {
        header: "Status",
        accessorKey: "status",
        cell: (row: any) => {
            const config = getStatusConfig(row.status);
            return (
                <Badge variant="outline" className={cn("font-bold text-[9px] tracking-widest px-2 py-0.5", config.class)}>
                    {config.label}
                </Badge>
            )
        }
    }
  ];

  if (viewMode === "new") {
    return (
      <div className="space-y-6 page-fade-in px-4 lg:px-0">
        <Button variant="ghost" onClick={() => setViewMode("list")} className="gap-2 font-bold tracking-tight text-muted-foreground hover:text-foreground group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Records
        </Button>
        <NewInvoiceBuilder onSaveSuccess={() => setViewMode("list")} />
      </div>
    );
  }

  return (
    <div className="space-y-8 page-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Invoice Records
          </h1>
          <p className="text-muted-foreground font-medium">
            Enterprise document management and auditing protocols.
          </p>
        </div>

        <Button onClick={() => setViewMode("new")} size="lg" className="h-10 px-6 rounded-xl font-bold tracking-tight shadow-lg shadow-primary/10 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> Generate Document
        </Button>
      </div>
Line 156: 

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <Card className="glass-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">Total Manifests</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight">{invoices.length}</div>
            </CardContent>
         </Card>
         <Card className="glass-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold tracking-widest text-emerald-600">Paid Valuation</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight text-emerald-600">
                    ${(invoices as any[]).filter(i => i.status === 'paid').reduce((acc: number, i) => acc + (i.total || 0), 0).toLocaleString()}
                </div>
            </CardContent>
         </Card>
         <Card className="glass-card">
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold tracking-widest text-amber-600">Outstanding Funds</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight text-amber-600">
                    ${(invoices as any[]).filter(i => i.status !== 'paid').reduce((acc: number, i) => acc + (i.total || 0), 0).toLocaleString()}
                </div>
            </CardContent>
         </Card>
         <Card className="glass-card bg-indigo-500/5 border-indigo-500/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400">Pipeline Health</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">Stable</div>
            </CardContent>
         </Card>
      </div>

      <DataTable 
        data={invoices} 
        columns={columns} 
        loading={loading}
        onDelete={handleDelete}
        searchPlaceholder="Scan manifest registry..."
        actions={(row) => (
            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 hover:bg-primary/10 hover:text-primary rounded-xl"
                    onClick={() => window.location.href = `/dashboard/invoices/${row.id}`}
                >
                    <FileText className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:bg-red-500/10 rounded-xl" onClick={() => handleDelete(row)}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        )}
      />
    </div>
  );
}
