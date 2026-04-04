"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { 
  FileText, ArrowLeft, Printer, Download, Mail, CheckCircle, 
  Clock, AlertCircle, ShoppingBag, ShoppingCart, User, Building,
  Calendar, CreditCard, Info, Loader2
} from "lucide-react";
import dynamic from "next/dynamic";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoicePDF } from "@/components/invoices/invoice-pdf";

// ... (rest of imports)

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [invoice, setInvoice] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    fetchInvoiceDetails();
    setIsClient(true);
  }, [params.id]);

  const handleShipment = async () => {
    setShippingLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/send`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Communication failure.");
      
      toast.success(data.message, {
        description: data.previewUrl ? `View mock email: ${data.previewUrl}` : "Manifest delivered via Resend.",
        duration: 8000
      });
    } catch (err: any) {
      toast.error("Dispatch failure: " + err.message);
    } finally {
      setShippingLoading(false);
    }
  };

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    try {
      const { data: inv, error: invErr } = await supabase
        .from("invoices")
        .select("*, customers(*), companies(*)")
        .eq("id", params.id)
        .single();

      if (invErr) throw invErr;
      setInvoice(inv);
      setCustomer(inv.customers);
      setCompany(inv.companies);

      const { data: itm, error: itmErr } = await supabase
        .from("invoice_items")
        .select("*, products(name, sku)")
        .eq("invoice_id", params.id);

      if (itmErr) throw itmErr;
      setItems(itm || []);
    } catch (err: any) {
      toast.error("Manifest retrieval failed: " + err.message);
      router.push("/dashboard/invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === 'paid') updateData.paid_at = new Date().toISOString();

      const { error } = await supabase
        .from("invoices")
        .update(updateData)
        .eq("id", invoice.id);

      if (error) throw error;
      toast.success(`Manifest status updated to ${newStatus.toUpperCase()}.`);
      fetchInvoiceDetails();
    } catch (err: any) {
      toast.error("Status update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground animate-pulse">Synchronizing Data</p>
    </div>
  );

  const isSale = invoice.invoice_type === 'sale';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 lg:px-0">
      <style jsx global>{`
        @media print {
          nav, aside, button, .top-header-actions, .system-log-card, .manifest-status-card {
            display: none !important;
          }
          .glass-card {
            background: white !important;
            backdrop-filter: none !important;
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .invoice-card-container {
            width: 100% !important;
            max-width: 100% !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
          }
          body {
            background: white !important;
          }
          @page {
            size: auto;
            margin: 20mm;
          }
        }
      `}</style>
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-6 top-header-actions">
        <Button variant="ghost" onClick={() => router.push("/dashboard/invoices")} className="gap-2 font-bold tracking-tight text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Registry
        </Button>
        <div className="flex items-center gap-3">
          <Button onClick={() => window.print()} variant="outline" size="sm" className="gap-2 font-bold tracking-tight border-primary/20 text-primary hover:bg-primary/5">
            <Printer className="w-4 h-4" /> Print
          </Button>
          
          {isClient && invoice && (
            <PDFDownloadLink
              document={<InvoicePDF invoice={invoice} customer={customer} items={items} company={company} />}
              fileName={`invoice-${invoice.invoice_number}.pdf`}
            >
              {({ loading: pdfLoading }) => (
                <Button variant="outline" size="sm" disabled={pdfLoading} className="gap-2 font-bold tracking-tight border-primary/20 text-primary hover:bg-primary/5">
                  {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  PDF
                </Button>
              )}
            </PDFDownloadLink>
          )}

          <Button variant="outline" size="sm" className="gap-2 font-bold tracking-tight border-primary/20 text-primary hover:bg-primary/5">
            <Mail className="w-4 h-4" /> Dispatch
          </Button>
          {invoice.status !== 'paid' && (
            <Button size="sm" onClick={() => handleUpdateStatus('paid')} disabled={actionLoading} className="gap-2 font-bold tracking-tight bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20">
              <CheckCircle className="w-4 h-4" /> Finalize Payment
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Invoice Section */}
        <Card className="lg:col-span-2 border-none shadow-2xl overflow-hidden glass-card invoice-card-container">
          <CardHeader className="bg-muted/30 border-b border-border/40 p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
                  <FileText className="w-8 h-8 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{isSale ? 'Sales Invoice' : 'Purchase Receipt'}</h1>
                  <p className="text-muted-foreground font-mono text-sm opacity-70">Manifest ID: {invoice.invoice_number}</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <Badge className={cn(
                  "font-bold tracking-widest px-4 py-1 text-xs",
                  invoice.status === 'paid' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                  invoice.status === 'overdue' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                  "bg-amber-500/10 text-amber-600 border-amber-500/20"
                )}>
                  {invoice.status}
                </Badge>
                <div className="flex flex-col text-[10px] font-bold text-muted-foreground tracking-widest gap-1">
                  <div className="flex items-center justify-end gap-1"><Calendar className="w-3 h-3" /> Issued: {invoice.issue_date}</div>
                  <div className="flex items-center justify-end gap-1 text-red-500/80"><Clock className="w-3 h-3" /> Maturity: {invoice.due_date}</div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-12">
            {/* Stakeholder Info */}
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-muted-foreground tracking-widest border-b border-border/20 pb-2">Issuing Authority</h3>
                <div className="space-y-1">
                  <p className="font-bold tracking-tight text-lg">{company?.name}</p>
                  <p className="text-xs text-muted-foreground font-medium">{company?.email}</p>
                  <p className="text-xs text-muted-foreground font-medium">{company?.address || 'Operational Zone 9'}</p>
                  <p className="text-[10px] font-mono text-indigo-500 mt-2">TAX: {company?.tax_id || 'REGISTERED'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-muted-foreground tracking-widest border-b border-border/20 pb-2">
                  {isSale ? 'Target Account' : 'Supply Source'}
                </h3>
                <div className="space-y-1">
                  {isSale ? (
                    <>
                      <p className="font-bold tracking-tight text-lg">{customer?.name}</p>
                      <p className="text-xs text-muted-foreground font-medium">{customer?.email}</p>
                      <p className="text-xs text-muted-foreground font-medium">{customer?.address}</p>
                    </>
                  ) : (
                    <p className="font-bold tracking-tight text-lg">{invoice.supplier_name || 'EXTERNAL SUPPLIER'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-muted-foreground tracking-widest border-b border-border/20 pb-2">Line Protocol Matrix</h3>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/40">
                    <TableHead className="text-[10px] font-bold tracking-widest px-0">Specification</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-widest text-center">Volume</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-widest text-center">Unit Price</TableHead>
                    <TableHead className="text-[10px] font-bold tracking-widest text-right pr-0">Valuation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, idx) => (
                    <TableRow key={idx} className="border-border/10">
                      <TableCell className="px-0 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold tracking-tight text-sm">{item.designation || item.products?.name}</span>
                          <span className="text-[10px] text-muted-foreground font-mono opacity-60">SKU: {item.products?.sku || 'MANUAL-INDEX'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-bold tracking-tight text-sm">{item.quantity}</span>
                          <span className="text-[9px] font-bold text-muted-foreground opacity-60">{item.unit_type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-xs">
                        ${item.unit_price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right pr-0 font-bold tracking-tight text-primary">
                        ${item.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total Section */}
            <div className="flex justify-end pt-8">
              <div className="w-full max-w-[280px] space-y-3">
                <div className="flex justify-between text-xs font-bold text-muted-foreground tracking-widest">
                  <span>Sub-Index Valuation</span>
                  <span>${invoice.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground tracking-widest">
                  <span>Applied Adjustments</span>
                  <span>$0.00</span>
                </div>
                <div className="pt-4 border-t border-border/40 flex justify-between items-center bg-primary/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-primary">Total Payable</span>
                  <span className="text-2xl font-bold tracking-tight text-foreground">${invoice.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {invoice.notes && (
              <div className="mt-8 p-4 bg-muted/20 rounded-xl border border-border/40">
                <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-2"><Info className="w-3 h-3" /> Technical Memoranda</h4>
                <p className="text-xs text-muted-foreground font-medium">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-xl glass-card bg-primary/5 manifest-status-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold tracking-widest text-primary">Manifest Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  invoice.status === 'paid' ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-600"
                )}>
                  {invoice.status === 'paid' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight">{invoice.status}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Since: {new Date(invoice.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
              {invoice.paid_at && (
                <div className="pt-4 border-t border-border/40">
                   <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 tracking-widest">
                      <CreditCard className="w-3 h-3" /> Payment Finalized: {new Date(invoice.paid_at).toLocaleDateString()}
                   </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass-card system-log-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">System Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-1 h-8 bg-indigo-500 rounded-full" />
                  <div>
                    <p className="text-[10px] font-bold tracking-wider">Manifest Generated</p>
                    <p className="text-[9px] text-muted-foreground font-mono">{new Date(invoice.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-1 h-8 bg-muted rounded-full" />
                  <div>
                    <p className="text-[10px] font-bold tracking-wider text-muted-foreground">Notification Dispatched</p>
                    <p className="text-[9px] text-muted-foreground font-mono">Waiting for protocol…</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
