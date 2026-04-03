"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Download, Trash2, Loader2, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import NewInvoiceBuilder from "@/components/invoices/new-invoice-builder";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";
import { Badge } from "@/components/ui/badge";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "new">("list");
  const supabase = createClient();

  useEffect(() => {
    if (viewMode === "list") {
      fetchInvoices();
    }
  }, [viewMode]);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: companies } = await supabase.from('companies').select('id').eq('user_id', user.id).single();
    if (!companies) return;

    // Supabase foreign table lookup
    const { data, error } = await supabase
      .from("invoices")
      .select("*, customers(*)")
      .eq("company_id", companies.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch invoices");
    } else {
      setInvoices(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    const { error } = await supabase.from("invoices").delete().eq("id", id);
    if (error) {
      toast.error("Error deleting invoice");
    } else {
      toast.success("Invoice deleted");
      fetchInvoices();
    }
  };

  const handleSendEmail = async (id: string, email: string) => {
    const loadingToast = toast.loading("Sending invoice...");
    try {
      const res = await fetch("/api/invoices/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: id, email }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || "Email sent successfully!", { id: loadingToast });
        fetchInvoices();
      } else {
        throw new Error(data.error || "Failed to send email");
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>;
      case "sent":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Sent</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">Draft</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Overdue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // We should fetch items if they want to download, but for now we pass empty arrays
  // In a real app, downloading a specific invoice requires fetching its invoice_items first
  // Here we mock the trigger
  const handleDownloadDraft = () => {
    toast.info("A full PDF download requires pre-fetching items. This is a stub for the table action.");
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (viewMode === "new") {
    return (
      <div className="space-y-6 animate-in fade-in">
        <Button variant="ghost" onClick={() => setViewMode("list")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Button>
        <NewInvoiceBuilder onSaveSuccess={() => setViewMode("list")} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground mt-2">Create and manage your invoices.</p>
        </div>
        <Button onClick={() => setViewMode("new")} className="gap-2">
          <Plus className="w-4 h-4" /> New Invoice
        </Button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search invoice number or customer..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card className="shadow-lg border-border/50">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>{filteredInvoices.length} invoices found</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Invoice #</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Issue Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan={7} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : filteredInvoices.length === 0 ? (
                   <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">No invoices found.</td></tr>
                ) : filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-sm">{invoice.invoice_number}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{invoice.customers?.name || "Unknown"}</td>
                    <td className="py-3 px-4 font-semibold text-sm text-primary">${invoice.total.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm">{invoice.issue_date}</td>
                    <td className="py-3 px-4 text-sm">{invoice.due_date}</td>
                    <td className="py-3 px-4">{getStatusBadge(invoice.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleSendEmail(invoice.id, invoice.customers?.email)}
                          title="Send Email"
                        >
                          <Send className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDownloadDraft()}>
                          <Download className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(invoice.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
