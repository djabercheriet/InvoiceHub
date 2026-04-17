"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FileText, Save, ArrowLeft, Plus, Trash2, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { invoiceSchema } from "@/lib/domain/invoices/invoice.schema";
import { InvoiceSchema } from "@/lib/domain/invoices/invoice.types";

export default function EditInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const form = useForm<InvoiceSchema>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoiceType: "sale",
      customerName: "",
      supplierName: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      notes: "",
      currency: "USD",
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "items" });
  const watchItems = form.watch("items");
  const watchCurrency = form.watch("currency");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();
        if (!profile?.company_id) return;
        setCompanyId(profile.company_id);

        const [prodRes, invRes, itemRes] = await Promise.all([
          supabase.from("products").select("*").eq("company_id", profile.company_id).eq("is_active", true),
          supabase.from("invoices").select("*, customers(*)").eq("id", params.id).single(),
          supabase.from("invoice_items").select("*").eq("invoice_id", params.id)
        ]);

        if (invRes.error) throw invRes.error;
        if (itemRes.error) throw itemRes.error;
        if (invRes.data.status !== 'draft') {
            toast.error("Only internal drafts can be edited.");
            router.push(`/dashboard/sales/invoices/${params.id}`);
            return;
        }

        setProducts(prodRes.data || []);

        form.reset({
          invoiceType: invRes.data.invoice_type,
          customerName: invRes.data.customers?.id || "",
          issueDate: invRes.data.issue_date,
          dueDate: invRes.data.due_date,
          notes: invRes.data.notes || "",
          currency: invRes.data.currency || "USD",
          items: (itemRes.data || []).map((i: any) => ({
            productId: i.product_id || "",
            designation: i.description || "",
            quantity: i.quantity,
            unitType: i.unit_type || "unit",
            unitPrice: i.unit_price,
            discount: i.discount || 0,
            taxRate: i.tax_rate || 0,
          }))
        });

      } catch (err: any) {
        toast.error("Failed to load invoice: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  const handleProductSelect = (index: number, val: string) => {
    if (val === "custom") {
      form.setValue(`items.${index}.productId`, "");
      form.setValue(`items.${index}.designation`, "");
      return;
    }
    const product = products.find(p => p.id === val);
    if (!product) return;
    form.setValue(`items.${index}.productId`, product.id);
    form.setValue(`items.${index}.designation`, product.name);
    form.setValue(`items.${index}.unitPrice`, product.unit_price || 0);
  };

  const calculateTotals = () => {
    let sub = 0; let tax = 0;
    watchItems.forEach(it => {
      const lineTotal = (it.quantity || 0) * (it.unitPrice || 0);
      const afterDiscount = lineTotal - (lineTotal * (it.discount || 0)) / 100;
      sub += afterDiscount;
      tax += afterDiscount * (it.taxRate || 0) / 100;
    });
    return { subtotal: sub, tax, total: sub + tax };
  };

  const onSubmit = async (values: InvoiceSchema) => {
    if (!companyId) return;
    setSaving(true);
    try {
      const totals = calculateTotals();
      
      const { error: invError } = await supabase.from("invoices").update({
        issue_date: values.issueDate,
        due_date: values.dueDate,
        notes: values.notes,
        currency: values.currency,
        subtotal: totals.subtotal,
        tax_total: totals.tax,
        total: totals.total,
        updated_at: new Date().toISOString()
      }).eq("id", params.id);

      if (invError) throw invError;

      // Drop old items and insert new ones
      await supabase.from("invoice_items").delete().eq("invoice_id", params.id);
      
      const itemsToInsert = values.items.map(it => ({
        invoice_id: params.id,
        product_id: it.productId || null,
        description: it.designation,
        quantity: it.quantity,
        unit_type: it.unitType,
        unit_price: it.unitPrice,
        discount: it.discount,
        tax_rate: it.taxRate,
        total: ((it.quantity * it.unitPrice) * (1 - it.discount/100)) * (1 + it.taxRate/100)
      }));

      const { error: itemError } = await supabase.from("invoice_items").insert(itemsToInsert);
      if (itemError) throw itemError;

      toast.success("Manifest completely recompiled and saved.");
      router.push(`/dashboard/sales/invoices/${params.id}`);
    } catch (err: any) {
      toast.error("Recompilation failure: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 space-y-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground animate-pulse">Decrypting Manifest Data</p>
    </div>
  );

  const totals = calculateTotals();

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 xl:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <Button variant="ghost" onClick={() => router.back()} className="gap-2 font-bold tracking-tight text-muted-foreground hover:text-foreground group -ml-2 mb-2">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Manifest
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Edit Internal Draft
          </h1>
          <p className="text-muted-foreground font-medium text-sm md:text-base">Modify the architecture of this draft before final publication.</p>
        </div>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={saving} size="lg" className="w-full md:w-auto gap-2 font-bold tracking-tight shadow-xl">
          {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          Compile Changes
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-8">
          <Card className="glass-card shadow-xl border-border/50">
            <CardHeader className="border-b border-border/40 bg-muted/5">
              <CardTitle className="text-sm font-bold tracking-widest text-primary flex items-center gap-2 uppercase">
                 Manifest Core Params
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField control={form.control} name="issueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-bold tracking-widest">Issue Date</FormLabel>
                    <FormControl><Input type="date" className="h-11 bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-bold tracking-widest">Due Date</FormLabel>
                    <FormControl><Input type="date" className="h-11 bg-background" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-bold tracking-widest">Global Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-11 bg-background font-bold"><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["USD","EUR","GBP","DZD","MAD","TND","SAR","AED","CAD","CHF"].map(c => (
                          <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <div className="flex flex-col justify-end">
                    <p className="text-xs text-muted-foreground font-medium pr-2 text-right opacity-60">Customer assignment is locked in edit mode to preserve relational integrity.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-2xl border-none overflow-hidden">
            <CardHeader className="bg-primary/5 flex flex-col md:flex-row md:items-center justify-between border-b border-primary/10 gap-4">
              <CardTitle className="text-sm font-bold tracking-widest text-primary flex items-center gap-2 uppercase">
                Line Items
              </CardTitle>
              <Button type="button" onClick={() => append({ productId: "", designation: "", quantity: 1, unitType: "unit", unitPrice: 0, discount: 0, taxRate: 0 })} variant="outline" size="sm" className="gap-2 font-bold border-primary/20 text-primary w-full md:w-auto">
                <Plus className="w-4 h-4" /> Add Item
              </Button>
            </CardHeader>
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="w-[300px] text-[10px] font-bold tracking-widest uppercase">Asset</TableHead>
                    <TableHead className="w-[100px] text-[10px] font-bold tracking-widest uppercase">Qty</TableHead>
                    <TableHead className="w-[120px] text-[10px] font-bold tracking-widest uppercase">Unit</TableHead>
                    <TableHead className="w-[150px] text-[10px] font-bold tracking-widest uppercase relative"><div className="absolute right-4 top-3">Price</div></TableHead>
                    <TableHead className="w-[100px] text-[10px] font-bold tracking-widest uppercase relative"><div className="absolute right-4 top-3">Disc %</div></TableHead>
                    <TableHead className="w-[100px] text-[10px] font-bold tracking-widest uppercase relative"><div className="absolute right-4 top-3">Tax %</div></TableHead>
                    <TableHead className="w-[150px] text-right text-[10px] font-bold tracking-widest uppercase">Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((item, index) => {
                    const it = watchItems[index];
                    const lineTotal = (it.quantity || 0) * (it.unitPrice || 0);
                    const afterDiscount = lineTotal - (lineTotal * (it.discount || 0)) / 100;
                    const finalTotal = afterDiscount + (afterDiscount * (it.taxRate || 0) / 100);

                    return (
                      <TableRow key={item.id} className="border-border/40 group hover:bg-muted/10 transition-colors">
                        <TableCell className="p-2 align-top">
                          <Select value={it.productId || "custom"} onValueChange={(v) => handleProductSelect(index, v)}>
                            <SelectTrigger className="h-10 bg-background border-border/50 font-medium mb-2"><SelectValue placeholder="Select Asset" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="custom" className="font-bold text-primary">Custom Entry</SelectItem>
                              {products.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name} - ${p.unit_price}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input 
                            value={it.designation} 
                            onChange={(e) => form.setValue(`items.${index}.designation`, e.target.value)} 
                            placeholder="Detailed description..." 
                            className="h-10 bg-background border-border/50 text-xs" 
                          />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Input type="number" min="0.01" step="0.01" value={it.quantity} onChange={(e) => form.setValue(`items.${index}.quantity`, parseFloat(e.target.value))} className="h-10 bg-background text-center font-bold" />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Select value={it.unitType} onValueChange={(v: any) => form.setValue(`items.${index}.unitType`, v)}>
                            <SelectTrigger className="h-10 bg-background"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {Object.entries({ unit: "Unit", kg: "Kg", lb: "Lb", ln: "Ln (m)", m: "m", L: "Litre", ton: "Ton" }).map(([k, v]) => (
                                <SelectItem key={k} value={k}>{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Input type="number" min="0" step="0.01" value={it.unitPrice} onChange={(e) => form.setValue(`items.${index}.unitPrice`, parseFloat(e.target.value))} className="h-10 bg-background text-right font-medium" />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Input type="number" min="0" max="100" value={it.discount} onChange={(e) => form.setValue(`items.${index}.discount`, parseFloat(e.target.value))} className="h-10 bg-background text-right" />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <Input type="number" min="0" max="100" value={it.taxRate} onChange={(e) => form.setValue(`items.${index}.taxRate`, parseFloat(e.target.value))} className="h-10 bg-background text-right" />
                        </TableCell>
                        <TableCell className="p-2 align-top text-right pt-4">
                          <span className="font-bold tracking-tight text-primary">{finalTotal.toLocaleString()} {watchCurrency}</span>
                        </TableCell>
                        <TableCell className="p-2 align-top pt-3">
                          <Button disabled={fields.length === 1} type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card className="glass-card shadow-xl border-border/50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] uppercase font-bold tracking-widest">Footer Notes & Terms</FormLabel>
                    <FormControl><Textarea placeholder="Payment terms, bank details, or generic notes..." className="resize-none bg-background min-h-[140px]" {...field} /></FormControl>
                  </FormItem>
                )} />
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-border/40">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Subtotal</span>
                    <span className="font-bold tracking-tight">{totals.subtotal.toLocaleString()} {watchCurrency}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-border/40">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Tax</span>
                    <span className="font-bold tracking-tight text-muted-foreground">{totals.tax.toLocaleString()} {watchCurrency}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      <span className="text-sm font-bold uppercase tracking-widest">Gross Total</span>
                    </div>
                    <span className="text-4xl font-black tracking-tighter text-primary">{totals.total.toLocaleString()} {watchCurrency}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
