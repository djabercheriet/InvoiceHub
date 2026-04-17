"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteSchema, type QuoteSchema as QuoteFormValues } from "@/lib/domain/quotes/quote.schema";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import {
  Plus, Trash2, Save, FileText, Calendar, User, Calculator,
  ShoppingCart, Scale
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const CURRENCIES = ["USD", "EUR", "GBP", "DZD", "MAD", "TND", "SAR", "AED", "CAD", "CHF"];
const UNIT_LABELS: Record<string, string> = {
  unit: "Unit",
  kg: "Kg",
  lb: "Lb",
  ln: "Ln (m)",
  m: "m",
  L: "Litre",
  ton: "Ton",
};

export default function NewQuoteBuilder({ onSaveSuccess }: { onSaveSuccess: () => void }) {
  const supabase = createClient();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [companyPrefs, setCompanyPrefs] = useState<any>({});

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      customerName: "",
      issueDate: new Date().toISOString().split("T")[0],
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      notes: "",
      currency: "USD",
      items: [{ productId: "", description: "", quantity: 1, unitPrice: 0, discountPercent: 0, taxRate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchItems = form.watch("items");
  const watchCurrency = form.watch("currency");

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
          supabase.from("companies").select("preferences, currency").eq("id", profile.company_id).single(),
        ]);

        if (custRes.data) setCustomers(custRes.data);
        if (prodRes.data) setProducts(prodRes.data);
        if (compRes.data) {
          setCompanyPrefs(compRes.data.preferences || {});
          const currency = compRes.data.preferences?.currency || compRes.data.currency || "USD";
          form.setValue("currency", currency);
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
  const subtotal = watchItems.reduce((s: number, i: any) => s + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0);
  const totalValue = watchItems.reduce((s: number, i: any) => s + calcLine(i), 0);

  const onSubmit = async (values: QuoteFormValues) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user?.id!).single();
      if (!profile?.company_id) throw new Error("No active workspace.");

      const prefix = companyPrefs.quote_prefix || "QTE";
      const quoteNumber = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      let finalCustomerId = null;
      if (values.customerName) {
        const existing = customers.find(c => c.name.toLowerCase() === values.customerName?.toLowerCase());
        if (existing) {
          finalCustomerId = existing.id;
        } else {
          const { data: newCust, error: custErr } = await supabase.from("customers").insert({
            company_id: profile.company_id,
            name: values.customerName
          }).select("id").single();
          if (custErr) throw custErr;
          finalCustomerId = newCust.id;
        }
      }

      const { data: qte, error: qteErr } = await supabase.from("quotes").insert({
        company_id: profile.company_id,
        customer_id: finalCustomerId,
        quote_number: quoteNumber,
        total: totalValue,
        status: "draft",
        issue_date: values.issueDate,
        valid_until: values.validUntil,
        notes: values.notes || null,
        currency: values.currency,
        created_by: user?.id
      }).select("id").single();
      if (qteErr) throw qteErr;

      const itemRows = values.items.map((item: any) => ({
        quote_id: qte!.id,
        product_id: item.productId || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        discount_percent: item.discountPercent,
        tax_rate: item.taxRate,
        total: calcLine(item),
      }));
      const { error: itemsErr } = await supabase.from("quote_items").insert(itemRows);
      if (itemsErr) throw itemsErr;

      toast.success(`Quote ${quoteNumber} created successfully!`);
      onSaveSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to save quote.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] font-bold tracking-widest text-muted-foreground animate-pulse">Loading Quote Builder</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center gap-4 border-l-4 border-primary pl-6 py-2">
        <div>
          <h2 className="text-3xl font-bold">New Sales Proposal</h2>
          <p className="text-muted-foreground font-medium">Create a technical and financial proposal for your client.</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 glass-card border-none shadow-2xl">
              <CardHeader className="border-b border-border/40">
                <CardTitle className="text-sm font-bold tracking-widest flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Context Protocol
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="customerName" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Client Name</FormLabel>
                      <FormControl>
                        <Input list="customers-list" {...field} placeholder="Target account…" className="glass-card font-bold" />
                      </FormControl>
                      <datalist id="customers-list">
                        {customers.map(c => <option key={c.id} value={c.name} />)}
                      </datalist>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="currency" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Pricing Currency</FormLabel>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField control={form.control} name="issueDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Proposal Date</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                          <Input type="date" {...field} className="pl-10 glass-card" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="validUntil" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Expiration Protocol</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                          <Input type="date" {...field} className="pl-10 glass-card" />
                        </div>
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Scope / Technical Memoranda</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Project scope, deliverables, special terms…" className="glass-card resize-none" rows={3} />
                    </FormControl>
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="glass-card border-none shadow-2xl bg-primary/5">
              <CardHeader className="border-b border-border/40">
                <CardTitle className="text-sm font-bold tracking-widest flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  Financial Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>Base Valuation</span>
                    <span>{watchCurrency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-muted-foreground">
                    <span>Applied Adjustments</span>
                    <span className={totalValue > subtotal ? "text-emerald-600" : "text-destructive"}>
                      {totalValue > subtotal ? "+" : ""}{watchCurrency} {(totalValue - subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="pt-6 border-t border-border/40 flex flex-col items-center gap-2">
                  <span className="text-[10px] font-bold text-primary">Proposal Total</span>
                  <div className="text-5xl font-bold text-foreground">
                    {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs">{watchCurrency}</Badge>
                </div>
                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-12 text-base font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {isSaving ? "Synchronizing…" : "Store Proposal"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-none shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Specification Matrix
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: "", description: "", quantity: 1, unitPrice: 0, discountPercent: 0, taxRate: 0 })}
                  className="h-8 gap-2 font-bold border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border/40">
                  <tr>
                    <th className="text-[10px] font-bold py-3 text-center w-[40px]">#</th>
                    <th className="text-[10px] font-bold py-3 text-left w-[240px]">Designation</th>
                    <th className="text-[10px] font-bold py-3 text-left w-[90px]">Volume</th>
                    <th className="text-[10px] font-bold py-3 text-left w-[100px]">Unit</th>
                    <th className="text-[10px] font-bold py-3 text-left w-[120px]">Price</th>
                    <th className="text-[10px] font-bold py-3 text-left w-[70px]">Disc%</th>
                    <th className="text-[10px] font-bold py-3 pr-4 text-right w-[120px]">Line Total</th>
                    <th className="w-[40px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/10">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="group hover:bg-muted/20 transition-colors">
                      <td className="py-2 text-center text-xs font-bold text-muted-foreground">{index + 1}</td>
                      <td className="py-2">
                        <FormField control={form.control} name={`items.${index}.description`} render={({ field: f }) => (
                          <Input list="products-list-quote" {...f} className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0 text-xs font-medium" placeholder="Search specification…" />
                        )} />
                      </td>
                      <td className="py-2">
                        <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: f }) => (
                          <Input type="number" {...f} className="h-9 border-0 shadow-none bg-transparent font-bold text-xs w-20" />
                        )} />
                      </td>
                      <td className="py-2">
                        {/* Unit type select removed for schema compatibility */}
                        <div className="h-9 flex items-center px-3 text-xs font-bold text-muted-foreground italic opacity-50">Unit</div>
                      </td>
                      <td className="py-2">
                        <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field: f }) => (
                          <Input type="number" {...f} className="h-9 border-0 shadow-none bg-transparent font-bold text-xs w-28" />
                        )} />
                      </td>
                      <td className="py-2">
                        <FormField control={form.control} name={`items.${index}.discountPercent`} render={({ field: f }) => (
                          <Input type="number" {...f} className="h-9 border-0 shadow-none bg-transparent text-muted-foreground text-xs w-16" />
                        )} />
                      </td>
                      <td className="pr-4 py-2 text-right font-bold text-sm text-primary">
                        {calcLine(watchItems[index]).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2">
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-all" onClick={() => remove(index)} disabled={fields.length === 1}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </form>
      </Form>
      <datalist id="products-list-quote">
        {products.map(p => <option key={p.id} value={p.name} />)}
      </datalist>
    </div>
  );
}
