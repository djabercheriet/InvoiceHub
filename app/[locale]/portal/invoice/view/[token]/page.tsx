import { getInvoiceByToken } from '@/lib/domain/invoices/invoice.repository';
import { invoiceService } from '@/lib/domain/invoices/invoice.service';
import { activityService } from '@/lib/domain/activities/activity.service';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PayPalButton } from "@/components/portal/paypal-button";
import { 
  FileText, 
  Calendar, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Download,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default async function PortalInvoiceViewPage({ params }: { params: { token: string } }) {
  const { token } = params;
  const { data: invoice, error } = await getInvoiceByToken(token);

  if (error || !invoice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Invoice Not Found</h2>
        <p className="text-muted-foreground mt-2">The link you followed may be invalid or expired.</p>
      </div>
    );
  }

  // Track 'viewed' status if it's currently draft or sent
  if (['draft', 'sent'].includes(invoice.status)) {
    try {
      await invoiceService.updateInvoice(invoice.id, { status: 'viewed' });
      // activityService logging is already handled inside invoiceService.updateInvoice
    } catch (err) {
      console.error('Failed to update views:', err);
    }
  } else {
    // Still log the view activity even if status doesn't change
    await activityService.logActivity({
      companyId: invoice.company_id,
      entityType: 'invoice',
      entityId: invoice.id,
      activityType: 'invoice.viewed',
      metadata: { ip: 'portal-access' }
    });
  }

  const isPaid = invoice.status === 'paid';

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border shadow-sm sticky top-20 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
           <Badge variant={isPaid ? "success" : "warning"} className="px-3 py-1 text-sm capitalize">
             {invoice.status}
           </Badge>
           <span className="text-sm text-muted-foreground font-medium">Invoice #{invoice.invoice_number}</span>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="gap-2">
             <Download className="w-4 h-4" /> PDF
           </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
        <CardHeader className="bg-slate-50 dark:bg-slate-900 border-b p-8 md:p-12">
           <div className="flex flex-col md:flex-row justify-between gap-8">
              <div className="space-y-4">
                 <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl">B</div>
                 <h1 className="text-4xl font-black tracking-tight uppercase">Invoice</h1>
              </div>
              <div className="text-right space-y-1">
                 <p className="font-bold text-lg">{invoice.invoice_number}</p>
                 <div className="flex items-center justify-end gap-2 text-muted-foreground text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    Issued: {new Date(invoice.issue_date).toLocaleDateString()}
                 </div>
                 <div className="flex items-center justify-end gap-2 text-destructive text-sm font-bold">
                    <Calendar className="w-4 h-4" />
                    Due: {new Date(invoice.due_date).toLocaleDateString()}
                 </div>
              </div>
           </div>
        </CardHeader>

        <CardContent className="p-8 md:p-12 space-y-12">
           {/* Parties */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-4">
                 <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">From</p>
                 <div className="space-y-1">
                    <p className="font-bold text-xl text-slate-900 dark:text-slate-100">Bntec Dynamics HQ</p>
                    <div className="text-muted-foreground text-sm space-y-0.5">
                       <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> 123 Tech Avenue, Silicon Valley, CA</p>
                       <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> +1 (555) 012-3456</p>
                       <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> billing@bntec.com</p>
                    </div>
                 </div>
              </div>
              <div className="space-y-4 md:text-right">
                 <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Bill To</p>
                 <div className="space-y-1">
                    <p className="font-bold text-xl text-slate-900 dark:text-slate-100">{invoice.customers.name}</p>
                    <div className="text-muted-foreground text-sm space-y-0.5 md:flex md:flex-col md:items-end">
                       <p className="flex items-center gap-2">{invoice.customers.address || "No address provided"}</p>
                       <p className="flex items-center gap-2">{invoice.customers.email}</p>
                       <p className="flex items-center gap-2">{invoice.customers.phone}</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Table */}
           <div className="space-y-4">
               <div className="overflow-hidden border rounded-xl bg-white dark:bg-slate-950">
                  <table className="w-full text-sm">
                     <thead className="bg-slate-50 dark:bg-slate-900 border-b">
                        <tr className="text-left font-bold text-muted-foreground uppercase text-[10px] tracking-widest">
                           <th className="px-6 py-4">Item Description</th>
                           <th className="px-6 py-4 text-center">Qty</th>
                           <th className="px-6 py-4 text-right">Unit Price</th>
                           <th className="px-6 py-4 text-right">Total</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y">
                        {invoice.invoice_items.map((item: any) => (
                           <tr key={item.id}>
                              <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                                 {item.designation}
                              </td>
                              <td className="px-6 py-4 text-center">
                                 {item.quantity}
                              </td>
                              <td className="px-6 py-4 text-right">
                                 {item.unit_price.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-slate-100">
                                 {item.total.toLocaleString()} {invoice.currency}
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
           </div>

           {/* Summary */}
           <div className="flex flex-col md:flex-row justify-between gap-12 pt-8 border-t">
              <div className="md:max-w-xs space-y-2">
                 <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes</p>
                 <p className="text-sm text-muted-foreground leading-relaxed italic">
                    {invoice.notes || "No special instructions. Thank you for your business."}
                 </p>
              </div>
              <div className="w-full md:w-80 space-y-3">
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{invoice.total.toLocaleString()} {invoice.currency}</span>
                 </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium">$0.00</span>
                 </div>
                 <div className="flex justify-between pt-3 border-t-2 border-slate-900 dark:border-white">
                    <span className="text-lg font-black uppercase italic">Amount Due</span>
                    <span className="text-2xl font-black text-indigo-600 uppercase">
                       {invoice.total.toLocaleString()} {invoice.currency}
                    </span>
                 </div>
              </div>
           </div>
        </CardContent>

        <CardFooter className="bg-slate-50 dark:bg-slate-900 border-t p-8 flex flex-col items-center gap-6">
           {!isPaid ? (
             <div className="w-full max-w-sm space-y-4">
                <div className="text-center space-y-1">
                   <p className="font-bold text-slate-900 dark:text-slate-100">Ready to complete your payment?</p>
                   <p className="text-xs text-muted-foreground">Safe, secure and encrypted transactions.</p>
                </div>
                <PayPalButton 
                   invoiceId={invoice.id} 
                   amount={invoice.total} 
                   currency={invoice.currency} 
                   onSuccess={() => {}} 
                />
             </div>
           ) : (
             <div className="flex flex-col items-center gap-3 py-4">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center">
                   <FileText className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-center">
                   <p className="text-xl font-bold text-green-600">This invoice is already paid.</p>
                   <p className="text-sm text-muted-foreground">A receipt has been sent to your registered email.</p>
                </div>
             </div>
           )}
        </CardFooter>
      </Card>
    </div>
  );
}
