"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { 
  FileText, ArrowLeft, Printer, Download, Mail, CheckCircle, 
  Clock, AlertCircle, ShoppingBag, ShoppingCart, User, Building,
  Calendar, CreditCard, Info, Loader2, Activity as ActivityIcon,
  ClipboardList, ArrowRightLeft, Check
} from "lucide-react";
import { ActivityTimeline } from "@/components/activities/activity-timeline";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const [quote, setQuote] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchQuoteDetails();
  }, [params.id]);

  const fetchQuoteDetails = async () => {
    setLoading(true);
    try {
      const { data: q, error: qErr } = await supabase
        .from("quotes")
        .select("*, customers(*), companies(*)")
        .eq("id", params.id)
        .single();

      if (qErr) throw qErr;
      setQuote(q);
      setCustomer(q.customers);
      setCompany(q.companies);

      const { data: itm, error: itmErr } = await supabase
        .from("quote_items")
        .select("*, products(name, sku)")
        .eq("quote_id", params.id);

      if (itmErr) throw itmErr;
      setItems(itm || []);
    } catch (err: any) {
      toast.error("Quote retrieval failed: " + err.message);
      router.push("/dashboard/sales/quotes");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("quotes")
        .update({ status: newStatus })
        .eq("id", quote.id);

      if (error) throw error;
      toast.success(`Quote status updated to ${newStatus.toUpperCase()}.`);
      fetchQuoteDetails();
    } catch (err: any) {
      toast.error("Status update failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvertToInvoice = async () => {
    setActionLoading(true);
    try {
      // We'll call the service via an API route or server action in a real app
      // For now, we'll implement the logic here or call a placeholder
      // In this specific task, we'll use a fetch to a new API route we'll create
      const res = await fetch(`/api/quotes/${quote.id}/convert`, { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Conversion failed.");
      
      toast.success("Quote successfully converted to Invoice!", {
        description: `New Invoice: ${data.invoiceNumber}`
      });
      
      router.push(`/dashboard/sales/invoices/${data.invoiceId}`);
    } catch (err: any) {
      toast.error("Conversion failure: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground animate-pulse">Retrieving Proposal</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 lg:px-0">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard/sales/quotes")} className="gap-2 font-bold tracking-tight text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Proposals
        </Button>
        <div className="flex items-center gap-3">
          {quote.status !== 'converted' && quote.status !== 'rejected' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleUpdateStatus('accepted')}
                disabled={actionLoading || quote.status === 'accepted'}
                className="gap-2 font-bold tracking-tight border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/5"
              >
                <Check className="w-4 h-4" /> Accept
              </Button>
              <Button 
                size="sm" 
                onClick={handleConvertToInvoice} 
                disabled={actionLoading}
                className="gap-2 font-bold tracking-tight bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"
              >
                <ArrowRightLeft className="w-4 h-4" /> Convert to Invoice
              </Button>
            </>
          )}
          {quote.status === 'converted' && (
             <Button 
                variant="outline"
                size="sm" 
                onClick={() => router.push(`/dashboard/sales/invoices/${quote.metadata?.converted_to_invoice_id}`)}
                className="gap-2 font-bold tracking-tight border-indigo-500/20 text-indigo-600 hover:bg-indigo-500/5"
             >
               View Linked Invoice
             </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-2xl overflow-hidden glass-card">
          <CardHeader className="bg-indigo-500/5 border-b border-border/40 p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20">
                  <ClipboardList className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Sales Proposal</h1>
                  <p className="text-muted-foreground font-mono text-sm opacity-70">Reference: {quote.quote_number}</p>
                </div>
              </div>
              <div className="text-right space-y-2">
                <Badge className={cn(
                  "font-bold tracking-widest px-4 py-1 text-xs",
                  quote.status === 'accepted' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                  quote.status === 'converted' ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" :
                  quote.status === 'rejected' ? "bg-red-500/10 text-red-600 border-red-500/20" :
                  "bg-amber-500/10 text-amber-600 border-amber-500/20"
                )}>
                  {quote.status}
                </Badge>
                <div className="flex flex-col text-[10px] font-bold text-muted-foreground tracking-widest gap-1">
                  <div className="flex items-center justify-end gap-1"><Calendar className="w-3 h-3" /> Created: {quote.issue_date}</div>
                  <div className="flex items-center justify-end gap-1 text-amber-600"><Clock className="w-3 h-3" /> Valid Until: {quote.valid_until || 'No Expiry'}</div>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-12">
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-muted-foreground tracking-widest border-b border-border/20 pb-2">Issuing Authority</h3>
                <div className="space-y-1">
                  <p className="font-bold tracking-tight text-lg">{company?.name}</p>
                  <p className="text-xs text-muted-foreground font-medium">{company?.email}</p>
                  <p className="text-xs text-muted-foreground font-medium">{company?.address}</p>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-muted-foreground tracking-widest border-b border-border/20 pb-2">Target Account</h3>
                <div className="space-y-1">
                  <p className="font-bold tracking-tight text-lg">{customer?.name}</p>
                  <p className="text-xs text-muted-foreground font-medium">{customer?.email}</p>
                  <p className="text-xs text-muted-foreground font-medium">{customer?.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold text-muted-foreground tracking-widest border-b border-border/20 pb-2">Proposal Metrics</h3>
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
                          <span className="font-bold tracking-tight text-sm">{item.description}</span>
                          <span className="text-[10px] text-muted-foreground font-mono opacity-60">SKU: {item.products?.sku || 'MANUAL'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-bold text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-center font-bold text-xs">{quote.currency} {item.unit_price.toLocaleString()}</TableCell>
                      <TableCell className="text-right pr-0 font-bold tracking-tight text-indigo-600">
                        {quote.currency} {item.total.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end pt-8">
              <div className="w-full max-w-[280px] space-y-3">
                <div className="flex justify-between text-xs font-bold text-muted-foreground tracking-widest">
                  <span>Gross Valuation</span>
                  <span>${quote.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-emerald-600 tracking-widest">
                  <span>Tax Apportionment</span>
                  <span>+ ${quote.tax_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-red-500 tracking-widest">
                  <span>Aggregate Discounts</span>
                  <span>- ${quote.discount_amount.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-border/40 flex justify-between items-center bg-indigo-600/5 p-4 rounded-xl">
                  <span className="text-[10px] font-bold text-indigo-600">Total Projection</span>
                  <span className="text-2xl font-bold tracking-tight text-foreground">${quote.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {quote.notes && (
              <div className="mt-8 p-4 bg-muted/20 rounded-xl border border-border/40">
                <h4 className="text-[10px] font-bold text-muted-foreground tracking-widest mb-2 flex items-center gap-2"><Info className="w-3 h-3" /> Internal Context</h4>
                <p className="text-xs text-muted-foreground font-medium">{quote.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none shadow-xl glass-card bg-indigo-600/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold tracking-widest text-indigo-600">Proposal Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  quote.status === 'converted' ? "bg-indigo-500/20 text-indigo-600" : 
                  quote.status === 'accepted' ? "bg-emerald-500/20 text-emerald-600" : "bg-amber-500/20 text-amber-600"
                )}>
                  {quote.status === 'converted' ? <ArrowRightLeft className="w-5 h-5" /> : 
                   quote.status === 'accepted' ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-bold tracking-tight capitalize">{quote.status}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">Updated: {new Date(quote.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl glass-card">
            <CardHeader className="pb-2 border-b border-border/40 mb-4">
              <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground flex items-center gap-2">
                <ActivityIcon className="w-3 h-3" /> Event Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityTimeline entityId={quote.id} entityType="quote" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
