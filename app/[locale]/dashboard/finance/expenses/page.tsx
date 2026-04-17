"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Receipt, Plus, Trash2, Tag, Calendar, DollarSign, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { FormDialog } from "@/components/ui/form-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { expenseSchema, type ExpenseFormValues } from "@/lib/domain/finance/finance.types";
import { financeService } from "@/lib/domain/finance/finance.service";

const EXPENSE_CATEGORIES = [
  "Office Supplies", "Software Subscriptions", "Travel & Meals", 
  "Marketing", "Legal & Professional", "Rent & Utilities", "Other"
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const supabase = createClient();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "", amount: 0, category: "Office Supplies", date: new Date().toISOString().split('T')[0], notes: ""
    },
  });

  useEffect(() => { fetchExpenses(); }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;
      setCompanyId(profile.company_id);

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('date', { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    if (!companyId || !userId) return;
    try {
      await financeService.addExpense(companyId, userId, values);
      toast.success("Expense recorded successfully.");
      setIsDialogOpen(false);
      form.reset();
      fetchExpenses();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (row: any) => {
    if (!confirm(`Permanently delete expense: ${row.title}?`)) return;
    try {
      await financeService.deleteExpense(row.id);
      toast.success("Expense deleted.");
      fetchExpenses();
    } catch (err: any) {
      toast.error("Failed to delete expense.");
    }
  };

  const columns = [
    {
      header: "Expense Detail", accessorKey: "title",
      cell: (row: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight">{row.title}</span>
          <span className="text-[10px] text-muted-foreground opacity-70 flex items-center gap-1 mt-0.5">
            <Tag className="w-2.5 h-2.5" /> {row.category}
          </span>
        </div>
      )
    },
    {
      header: "Amount", accessorKey: "amount",
      cell: (row: any) => <span className="font-bold text-rose-500">${row.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
    },
    {
      header: "Date", accessorKey: "date",
      cell: (row: any) => (
        <span className="text-[11px] font-mono opacity-70 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {row.date}
        </span>
      )
    },
    {
      header: "Notes", accessorKey: "notes",
      cell: (row: any) => <span className="text-xs text-muted-foreground truncate max-w-[200px] block">{row.notes || '—'}</span>
    }
  ];

  const thisMonthTotal = expenses
    .filter(e => new Date(e.date).getMonth() === new Date().getMonth() && new Date(e.date).getFullYear() === new Date().getFullYear())
    .reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-8 page-fade-in px-4 lg:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Wallet className="w-8 h-8 text-rose-500" />
            Operational Expenses
          </h1>
          <p className="text-muted-foreground font-medium">Record and track day-to-day company expenditures.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} size="lg" className="gap-2 font-bold tracking-tight bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-500/20 text-white rounded-xl">
          <Plus className="w-5 h-5" /> Log Expense
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">TOTAL EXPENSES (ALL TIME)</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold tracking-tight">${expenses.reduce((s, e) => s + e.amount, 0).toLocaleString()}</div></CardContent>
        </Card>
        <Card className="glass-card shadow-xl border-none bg-rose-500/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-rose-600">THIS MONTH</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold tracking-tight text-rose-600">${thisMonthTotal.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="glass-card shadow-xl border-none">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground">RECORDED ITEMS</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold tracking-tight">{expenses.length}</div></CardContent>
        </Card>
      </div>

      <DataTable 
        data={expenses} 
        columns={columns} 
        loading={loading} 
        onDelete={handleDelete}
        searchPlaceholder="Filter expenses by title..." 
      />

      <FormDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} title="Log Operational Expense" onSubmit={form.handleSubmit(onSubmit)}>
        <Form {...form}>
          <div className="space-y-5 pt-4">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold tracking-widest text-muted-foreground">EXPENSE DESCRIPTION</FormLabel>
                <FormControl><Input placeholder="Office chair, Internet bill, etc." className="bg-background/50 h-11" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <div className="grid grid-cols-2 gap-5">
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold tracking-widest text-rose-500 flex items-center gap-1"><DollarSign className="w-3 h-3"/> AMOUNT</FormLabel>
                  <FormControl><Input type="number" step="0.01" className="bg-rose-500/5 border-rose-500/20 font-bold h-11 text-rose-600" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-bold tracking-widest text-muted-foreground">DATE INCURRED</FormLabel>
                  <FormControl><Input type="date" className="bg-background/50 h-11 font-mono" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold tracking-widest text-muted-foreground">CATEGORY</FormLabel>
                <FormControl>
                  <select {...field} className="w-full h-11 px-3 rounded-md border border-border bg-background/50 text-sm">
                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-bold tracking-widest text-muted-foreground">ADDITIONAL NOTES (OPTIONAL)</FormLabel>
                <FormControl><Input className="bg-background/50 h-11" {...field} /></FormControl>
              </FormItem>
            )} />
          </div>
        </Form>
      </FormDialog>
    </div>
  );
}
