"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteSchema, QuoteSchema } from "@/lib/domain/quotes/quote.schema";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Plus, Trash2, Save, FileText, Calendar, User, Calculator,
  Scale, ClipboardList
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CURRENCIES = ["USD", "EUR", "GBP", "DZD", "MAD", "TND", "SAR", "AED", "CAD", "CHF"];

export default function QuoteBuilder({ onSaveSuccess }: { onSaveSuccess: () => void }) {
  const supabase = createClient();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<QuoteSchema>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      quoteNumber: `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "",
      currency: "USD",
      items: [{ productId: "", description: "", quantity: 1, unitPrice: 0, discountPercent: 0, taxRate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchItems = form.watch("items");
  const watchCurrency = form.watch("currency");

  // Load data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();
        if (!profile?.company_id) return;

        const [custRes, prodRes, compRes] = await Promise.all([
          supabase.from("customers").select("*").eq("company_id", profile.company_id).order("name"),
          supabase.from("products").select("*").eq("company_id", profile.company_id).eq("is_active", true).order("name"),
          supabase.from("companies").select("currency").eq("id", profile.company_id).single(),
        ]);

        if (custRes.data) setCustomers(custRes.data);
        if (prodRes.data) setProducts(prodRes.data);
        if (compRes.data) {
          form.setValue("currency", compRes.data.currency || "USD");
        }
      } catch {
        toast.error("Failed to load quote data.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const calcLine = (item: any) => {
    const qty = Number(item.quantity || 0);
    const up = Number(item.unitPrice || 0);
    const dis = Number(item.discountPercent || 0);
    const tax = Number(item.taxRate || 0);
    const raw = qty * up;
    const aft = raw - raw * (dis / 100);
    return aft + aft * (tax / 100);
  };

  const subtotal = watchItems.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0);
  const totalValue = watchItems.reduce((s, i) => s + calcLine(i), 0);

  const onSubmit = async (values: QuoteSchema) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user?.id!).single();
      if (!profile?.company_id) throw new Error("No active workspace.");

      // Calculate totals
      const taxAmount = watchItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) * (Number(item.taxRate) / 100)), 0);
      const discountAmount = watchItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice) * (Number(item.discountPercent) / 100)), 0);

      // 1. Insert quote
      const { data: quote, error: quoteErr } = await supabase.from("quotes").insert({
        company_id: profile.company_id,
        customer_id: values.customerId || null,
        quote_number: values.quoteNumber,
        status: "draft",
        issue_date: values.issueDate,
        valid_until: values.validUntil,
        notes: values.notes,
        currency: values.currency,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total: totalValue,
        created_by: user?.id
      }).select("id").single();
      if (quoteErr) throw quoteErr;

      // 2. Insert items
      const itemRows = values.items.map(item => ({
        quote_id: quote!.id,
        product_id: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent,
        tax_rate: item.taxRate,
        total: calcLine(item)
      }));
      const { error: itemsErr } = await supabase.from("quote_items").insert(itemRows);
      if (itemsErr) throw itemsErr;

      toast.success(`Quote ${values.quoteNumber} created successfully!`);
      onSaveSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save quote.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground animate-pulse">Initializing Quote Engine</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 border-l-4 border-indigo-500 pl-6 py-2">
        <div>
          <h2 className="text-3xl font-bold">New Sales Proposal</h2>
          <p className="text-muted-foreground font-medium">Create and manage professional quotes for your clients.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 glass-card border-none shadow-2xl">
              <CardHeader className="border-b border-border/40">
                <CardTitle className="text-sm font-bold tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  Proposal Parameters
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="customerId" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Target Stakeholder</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="glass-card font-bold">
                            <SelectValue placeholder="Select a customer…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="quoteNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Quote Reference</FormLabel>
                      <FormControl>
                        <Input {...field} className="glass-card font-bold" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField control={form.control} name="issueDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Creation Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="glass-card" />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="validUntil" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Expiration Threshold</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="glass-card" />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="currency" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Currency Unit</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="glass-card font-bold">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CURRENCIES.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Terms & Observations</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Quote specific terms, validity conditions…" className="glass-card resize-none" rows={3} />
                    </FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-2xl bg-indigo-500/5">
              <CardHeader className="border-b border-border/40">
                <CardTitle className="text-sm font-bold tracking-widest flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-indigo-500" />
                  Valuation Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SUBTOTAL</span>
                    <span className="font-bold">{watchCurrency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-indigo-600">
                    <span>AGGR. ADJUSTMENTS</span>
                    <span className="font-bold">± {watchCurrency} {Math.abs(totalValue - subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-indigo-500/10 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-indigo-500 tracking-widest">FINAL VALUATION</span>
                  <div className="text-5xl font-bold text-foreground tracking-tighter">
                    {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <Badge variant="outline" className="font-mono bg-indigo-500/10 text-indigo-600 border-indigo-500/20">{watchCurrency}</Badge>
                </div>
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-12 text-sm font-bold tracking-widest bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 uppercase"
                  >
                    {isSaving ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> Saving…</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" /> Authorize Quote</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-none shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-indigo-500/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-indigo-500" />
                  Proposal Metrics
                </CardTitle>
                <Button
                  type="button" variant="outline" size="sm"
                  onClick={() => append({ productId: "", description: "", quantity: 1, unitPrice: 0, discountPercent: 0, taxRate: 0 })}
                  className="h-8 gap-2 font-bold border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[50px] text-[10px] font-bold text-center">ID</TableHead>
                    <TableHead className="w-[300px] text-[10px] font-bold">DESCRIPTION</TableHead>
                    <TableHead className="w-[100px] text-[10px] font-bold text-center">QTY</TableHead>
                    <TableHead className="w-[150px] text-[10px] font-bold">PRICE</TableHead>
                    <TableHead className="w-[100px] text-[10px] font-bold text-center">DISC%</TableHead>
                    <TableHead className="w-[100px] text-[10px] font-bold text-center">TAX%</TableHead>
                    <TableHead className="text-right text-[10px] font-bold pr-6">TOTAL</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const lineTotal = calcLine(watchItems[index]);
                    return (
                      <TableRow key={field.id} className="group border-border/10">
                        <TableCell className="text-center font-mono text-[10px] opacity-40">{index + 1}</TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`items.${index}.description`} render={({ field: f }) => (
                            <div className="flex flex-col gap-1">
                              <Input list="prod-list" {...f} onChange={(e) => {
                                f.onChange(e);
                                const p = products.find(x => x.name === e.target.value);
                                if (p) {
                                  form.setValue(`items.${index}.productId`, p.id);
                                  form.setValue(`items.${index}.unitPrice`, p.unit_price || 0);
                                }
                              }} className="h-8 border-none bg-transparent shadow-none font-medium placeholder:opacity-30" placeholder="Product designation…" />
                              <datalist id="prod-list">
                                {products.map(p => <option key={p.id} value={p.name} />)}
                              </datalist>
                            </div>
                          )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: f }) => (
                            <Input type="number" step="1" {...f} className="h-8 border-none bg-transparent shadow-none text-center font-bold" />
                          )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field: f }) => (
                            <div className="relative">
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[10px] opacity-40">{watchCurrency}</span>
                              <Input type="number" step="0.01" {...f} className="h-8 border-none bg-transparent shadow-none pl-8 font-bold" />
                            </div>
                          )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`items.${index}.discountPercent`} render={({ field: f }) => (
                            <Input type="number" step="0.1" {...f} className="h-8 border-none bg-transparent shadow-none text-center text-muted-foreground" />
                          )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`items.${index}.taxRate`} render={({ field: f }) => (
                            <Input type="number" step="0.1" {...f} className="h-8 border-none bg-transparent shadow-none text-center text-muted-foreground" />
                          )} />
                        </TableCell>
                        <TableCell className="text-right font-bold text-indigo-600 pr-6">
                          {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <Button 
                            type="button" variant="ghost" size="icon" 
                            className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => remove(index)}
                            disabled={fields.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
