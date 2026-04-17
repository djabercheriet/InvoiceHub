import { createClient } from '@/lib/supabase/server';
import { getCustomerByAuthId } from '@/lib/domain/customers/customer.repository';
import { getInvoicesByCustomerId } from '@/lib/domain/invoices/invoice.repository';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  DollarSign,
  User
} from "lucide-react";
import { redirect } from 'next/navigation';

export default async function PortalDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/portal/login');
  }

  // 1. Fetch the customer record associated with this auth user
  let { data: customer, error: customerError } = await getCustomerByAuthId(user.id);

  // 2. If not found, try to auto-link by email
  if (!customer && user.email) {
    const { data: customerByEmail } = await supabase
      .from('customers')
      .select('*')
      .eq('email', user.email)
      .single();

    if (customerByEmail) {
      // Auto-link: update the customer record with the current auth ID
      await supabase
        .from('customers')
        .update({ auth_user_id: user.id })
        .eq('id', customerByEmail.id);
      
      customer = customerByEmail;
    }
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold">Profile Pending Link</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Your account is created, but we couldn't automatically link it to your customer file.
          Please contact support to verify your email association.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="mailto:support@bntec.com">Contact Support</Link>
        </Button>
      </div>
    );
  }

  // Fetch all invoices for this customer
  const { data: invoices } = await getInvoicesByCustomerId(customer.id);

  // Calculate totals
  const unpaidInvoices = invoices?.filter(inv => inv.status !== 'paid' && inv.status !== 'canceled') || [];
  const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {customer.name}</h1>
          <p className="text-muted-foreground">Manage your billing and view your invoice history.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground italic">Client Member</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border">
            <User className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-indigo-600 dark:text-indigo-400 font-semibold uppercase text-xs tracking-wider">
              Outstanding Balance
            </CardDescription>
            <CardTitle className="text-3xl font-extrabold flex items-baseline gap-1">
              <span className="text-xl font-medium opacity-70">$</span>
              {totalOutstanding.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Across {unpaidInvoices.length} pending invoices</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-xs font-semibold tracking-wider">Total Invoices</CardDescription>
            <CardTitle className="text-3xl font-extrabold">{invoices?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">All time records</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/50">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-xs font-semibold tracking-wider">Recent Activity</CardDescription>
            <CardTitle className="text-3xl font-extrabold text-green-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Last updated {new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card className="border-border/50 shadow-md">
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Your Invoices</CardTitle>
              <CardDescription>View, print and pay your statements</CardDescription>
            </div>
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-widest text-left">
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4">Due Date</th>
                  <th className="px-6 py-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices?.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                      No invoices found for your account.
                    </td>
                  </tr>
                ) : (
                  invoices?.map((invoice) => (
                    <tr key={invoice.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 font-semibold">
                        {invoice.invoice_number}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant={invoice.status === 'paid' ? 'success' : invoice.status === 'overdue' ? 'destructive' : 'secondary'}
                          className="capitalize px-2 py-0"
                        >
                          {invoice.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold">
                        {invoice.total.toLocaleString()} {invoice.currency}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button asChild size="sm" variant="outline" className="group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all gap-1 h-8">
                          <Link href={`/portal/invoice/view/${invoice.public_token}`}>
                            View Details <ArrowUpRight className="w-3 h-3" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
