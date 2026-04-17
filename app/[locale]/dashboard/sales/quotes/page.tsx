"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Trash2, ArrowLeft, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import QuoteBuilder from "@/components/sales/quotes/quote-builder";

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "new">("list");
  const supabase = createClient();

  useEffect(() => {
    if (viewMode === "list") {
      fetchQuotes();
    }
  }, [viewMode]);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;

      const { data, error } = await supabase
        .from("quotes")
        .select("*, customers(name, email)")
        .eq("company_id", profile.company_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (err: any) {
      toast.error("Failed to load quotes: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quote: any) => {
    if (!confirm(`Permanently delete quote ${quote.quote_number}?`)) return;
    try {
      const { error } = await supabase.from("quotes").delete().eq("id", quote.id);
      if (error) throw error;
      toast.success("Quote deleted.");
      fetchQuotes();
    } catch (err: any) {
      toast.error("Failed to delete quote.");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "accepted":
        return { label: "Accepted", class: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" };
      case "converted":
        return { label: "Converted", class: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" };
      case "sent":
        return { label: "Sent", class: "bg-blue-500/10 text-blue-600 border-blue-500/20" };
      case "draft":
        return { label: "Draft", class: "bg-muted text-muted-foreground border-border/50" };
      case "rejected":
        return { label: "Rejected", class: "bg-destructive/10 text-destructive border-destructive/20" };
      case "expired":
        return { label: "Expired", class: "bg-amber-500/10 text-amber-600 border-amber-500/20" };
      default:
        return { label: status, class: "" };
    }
  };

  const columns = [
    {
      header: "Quote Number",
      accessorKey: "quote_number",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-sm">{row.quote_number}</span>
          <span className="text-[10px] text-muted-foreground opacity-70">
            ID: {row.id.substring(0, 8)}...
          </span>
        </div>
      )
    },
    {
      header: "Customer",
      accessorKey: "customers.name",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm">{row.customers?.name || "Anonymous"}</span>
          <span className="text-[10px] text-muted-foreground">{row.customers?.email}</span>
        </div>
      )
    },
    {
      header: "Total",
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
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Quotes
        </Button>
        <QuoteBuilder onSaveSuccess={() => setViewMode("list")} />
      </div>
    );
  }

  return (
    <div className="space-y-8 page-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-primary" />
            Quotes & Proposals
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage sales proposals and conversion metrics.
          </p>
        </div>

        <Button onClick={() => setViewMode("new")} size="lg" className="h-10 px-6 rounded-xl font-bold tracking-tight shadow-lg shadow-primary/10 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" /> New Quote
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">Active Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{quotes.filter(q => q.status !== 'converted' && q.status !== 'rejected').length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-widest text-emerald-600">Potential Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-emerald-600">
              ${(quotes as any[]).filter(q => q.status === 'sent' || q.status === 'accepted').reduce((acc: number, q) => acc + (q.total || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-widest text-indigo-600">Converted Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-indigo-600">
              ${(quotes as any[]).filter(q => q.status === 'converted').reduce((acc: number, q) => acc + (q.total || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card bg-indigo-500/5 border-indigo-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-widest text-indigo-600 dark:text-indigo-400">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              {quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'converted').length / quotes.length) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={quotes}
        columns={columns}
        loading={loading}
        onDelete={handleDelete}
        searchPlaceholder="Filter quotes..."
        actions={(row) => (
          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:bg-indigo-500/10 hover:text-indigo-600 rounded-xl"
              onClick={() => window.location.href = `/dashboard/sales/quotes/${row.id}`}
            >
              <ClipboardList className="w-4 h-4" />
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
