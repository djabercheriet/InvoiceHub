"use client";

import { useState, useEffect, useCallback } from"react";
import { useForm, useFieldArray } from"react-hook-form";
import { zodResolver } from"@hookform/resolvers/zod";
import * as z from"zod";
import { createClient } from"@/lib/supabase/client";
import { toast } from"sonner";
import {
 Plus, Trash2, Save, Send, FileText, Calendar, User, Calculator,
 ShoppingCart, ShoppingBag, Scale, Info
} from"lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Textarea } from"@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from"@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from"@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from"@/components/ui/table";
import { Badge } from"@/components/ui/badge";
import { cn } from"@/lib/utils";

// ── Unit conversion helpers ────────────────────────────────────────────────────
type UnitType ="unit" |"kg" |"lb" |"ln" |"m" |"L" |"ton";

const UNIT_LABELS: Record<UnitType, string> = {
 unit:"Unit",
 kg:"Kg",
 lb:"Lb",
 ln:"Ln (m)",
 m:"m",
 L:"Litre",
 ton:"Ton",
};

function convertUnit(value: number, from: UnitType, to: UnitType): number {
 // Convert to kg first then to target
 const toKg: Record<string, number> = {
 kg: 1,
 lb: 0.453592,
 ton: 1000,
 unit: 1,
 ln: 1,
 m: 1,
 L: 1,
 };
 if (from === to) return value;
 const inKg = value * (toKg[from] || 1);
 return inKg / (toKg[to] || 1);
}

// ── Zod Schema ─────────────────────────────────────────────────────────────────
const itemSchema = z.object({
 productId: z.string().optional(),
 designation: z.string().min(1,"Description required"),
 quantity: z.coerce.number().min(0.01,"Min 0.01"),
 unitType: z.enum(["unit","kg","lb","ln","m","L","ton"]).default("unit"),
 unitPrice: z.coerce.number().min(0,"Invalid price"),
 discount: z.coerce.number().min(0).max(100).default(0),
 taxRate: z.coerce.number().min(0).max(100).default(0),
});

const invoiceSchema = z.object({
 invoiceType: z.enum(["sale","purchase"]).default("sale"),
 customerName: z.string().optional(),
 supplierName: z.string().optional(),
 issueDate: z.string(),
 dueDate: z.string(),
 notes: z.string().optional(),
 currency: z.string().default("USD"),
 items: z.array(itemSchema).min(1,"At least one line item required"),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// ── Currencies ────────────────────────────────────────────────────────────────
const CURRENCIES = ["USD","EUR","GBP","DZD","MAD","TND","SAR","AED","CAD","CHF"];

// ── Component ─────────────────────────────────────────────────────────────────
export default function NewInvoiceBuilder({ onSaveSuccess }: { onSaveSuccess: () => void }) {
 const supabase = createClient();
 const [customers, setCustomers] = useState<any[]>([]);
 const [products, setProducts] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [isSaving, setIsSaving] = useState(false);
 const [companyPrefs, setCompanyPrefs] = useState<any>({});

 const form = useForm<InvoiceFormValues>({
 resolver: zodResolver(invoiceSchema),
 defaultValues: {
 invoiceType:"sale",
 customerName:"",
 supplierName:"",
 issueDate: new Date().toISOString().split("T")[0],
 dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
 notes:"",
 currency:"USD",
 items: [{ productId:"", designation:"", quantity: 1, unitType:"unit", unitPrice: 0, discount: 0, taxRate: 0 }],
 },
 });

 const { fields, append, remove } = useFieldArray({ control: form.control, name:"items" });
 const watchItems = form.watch("items");
 const watchType = form.watch("invoiceType");
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
 supabase.from("companies").select("preferences, currency").eq("id", profile.company_id).single(),
 ]);

 if (custRes.data) setCustomers(custRes.data);
 if (prodRes.data) setProducts(prodRes.data);
 if (compRes.data) {
 setCompanyPrefs(compRes.data.preferences || {});
 const currency = compRes.data.preferences?.currency || compRes.data.currency ||"USD";
 form.setValue("currency", currency);
 }
 } catch {
 toast.error("Failed to load invoice data.");
 } finally {
 setLoading(false);
 }
 }
 load();
 }, []);

 // Calculation helpers
 const calcLine = (item: any) => {
 const qty = Number(item.quantity || 0);
 const up = Number(item.unitPrice || 0);
 const dis = Number(item.discount || 0);
 const tax = Number(item.taxRate || 0);
 const raw = qty * up;
 const aft = raw - raw * (dis / 100);
 return aft + aft * (tax / 100);
 };
 const subtotal = watchItems.reduce((s, i) => s + Number(i.quantity || 0) * Number(i.unitPrice || 0), 0);
 const totalValue = watchItems.reduce((s, i) => s + calcLine(i), 0);
 const adjustment = subtotal - totalValue;

 // Submit
 const onSubmit = async (values: InvoiceFormValues) => {
 setIsSaving(true);
 try {
 const { data: { user } } = await supabase.auth.getUser();
 const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user?.id!).single();
 if (!profile?.company_id) throw new Error("No active workspace.");

 const prefix = companyPrefs.invoice_prefix ||"INV";
 const invoiceNumber = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

 // Resolve customer ID or insert a new one
 let finalCustomerId = null;
 if (values.invoiceType === "sale" && values.customerName) {
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

 // 1. Insert invoice
 const { data: inv, error: invErr } = await supabase.from("invoices").insert({
 company_id: profile.company_id,
 customer_id: finalCustomerId,
 supplier_name: values.invoiceType ==="purchase" ? values.supplierName : null,
 invoice_number: invoiceNumber,
 total: totalValue,
 status:"draft",
 invoice_type: values.invoiceType,
 issue_date: values.issueDate,
 due_date: values.dueDate,
 notes: values.notes || null,
 currency: values.currency,
 }).select("id").single();
 if (invErr) throw invErr;

 // 2. Insert items
 const itemRows = values.items.map(item => {
 const line = calcLine(item);
 const wKg = ["kg","lb","ton"].includes(item.unitType)
 ? convertUnit(Number(item.quantity), item.unitType as UnitType,"kg")
 : null;
 return {
 invoice_id: inv!.id,
 company_id: profile.company_id,
 product_id: item.productId || null,
 designation: item.designation,
 description: item.designation,
 quantity: item.quantity,
 unit_type: item.unitType,
 unit_price: item.unitPrice,
 discount: item.discount,
 tax_rate: item.taxRate,
 total: line,
 weight_kg: wKg,
 };
 });
 const { error: itemsErr } = await supabase.from("invoice_items").insert(itemRows);
 if (itemsErr) throw itemsErr;

 // 3. Deduct stock for sale invoices
 if (values.invoiceType ==="sale") {
 for (const item of values.items) {
 if (!item.productId) continue;
 const p = products.find(x => x.id === item.productId);
 if (!p) continue;
 const newQty = Math.max(0, (p.quantity || 0) - Number(item.quantity));
 await supabase.from("products").update({ quantity: newQty }).eq("id", item.productId);
 await supabase.from("stock_movements").insert({
 company_id: profile.company_id,
 product_id: item.productId,
 invoice_id: inv!.id,
 movement_type:"out",
 quantity: item.quantity,
 note: `Sale deduction — ${invoiceNumber}`,
 });
 }
 }

 // 4. Add stock for purchase invoices 
 if (values.invoiceType ==="purchase") {
 for (const item of values.items) {
 if (!item.productId) continue;
 const p = products.find(x => x.id === item.productId);
 if (!p) continue;
 const newQty = (p.quantity || 0) + Number(item.quantity);
 await supabase.from("products").update({ quantity: newQty }).eq("id", item.productId);
 await supabase.from("stock_movements").insert({
 company_id: profile.company_id,
 product_id: item.productId,
 invoice_id: inv!.id,
 movement_type:"in",
 quantity: item.quantity,
 note: `Purchase receipt — ${invoiceNumber}`,
 });
 }
 }

 toast.success(`Invoice ${invoiceNumber} created successfully!`);
 onSaveSuccess();
 } catch (err: any) {
 toast.error(err.message ||"Failed to save invoice.");
 } finally {
 setIsSaving(false);
 }
 };

 if (loading) return (
 <div className="flex flex-col items-center justify-center p-24 space-y-4">
 <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
 <p className="text-[10px] font-bold tracking-widest text-muted-foreground animate-pulse">Loading Invoice Builder</p>
 </div>
 );

 return (
 <div className="max-w-6xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-700">
 {/* Title */}
 <div className="flex items-center gap-4 border-l-4 border-primary pl-6 py-2">
 <div>
 <h2 className="text-3xl font-bold">
 {watchType ==="sale" ?"New Sales Invoice" :"New Purchase Invoice"}
 </h2>
 <p className="text-muted-foreground font-medium">
 {watchType ==="sale" ?"Create a client invoice for goods or services sold." :"Record a supplier purchase receipt."}
 </p>
 </div>
 </div>

 <Form {...form}>
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
 
 {/* Invoice Type Toggle */}
 <div className="flex gap-3">
 <button
 type="button"
 onClick={() => form.setValue("invoiceType","sale")}
 className={cn(
"flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2 font-bold text-sm tracking-widest transition-all",
 watchType ==="sale"
 ?"border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
 :"border-border/40 text-muted-foreground hover:border-border"
 )}
 >
 <ShoppingBag className="w-4 h-4" />
 Sale
 </button>
 <button
 type="button"
 onClick={() => form.setValue("invoiceType","purchase")}
 className={cn(
"flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2 font-bold text-sm tracking-widest transition-all",
 watchType ==="purchase"
 ?"border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400"
 :"border-border/40 text-muted-foreground hover:border-border"
 )}
 >
 <ShoppingCart className="w-4 h-4" />
 Purchase
 </button>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 {/* Left — Context Card */}
 <Card className="lg:col-span-2 glass-card border-none shadow-2xl">
 <CardHeader className="border-b border-border/40">
 <CardTitle className="text-sm font-bold tracking-widest flex items-center gap-2">
 <User className="w-4 h-4 text-primary" />
 {watchType ==="sale" ?"Client Details" :"Supplier Details"}
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-6 space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 {/* Client / Supplier */}
 {watchType ==="sale" ? (
 <FormField control={form.control} name="customerName" render={({ field }) => (
 <FormItem>
 <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Client Name / Account</FormLabel>
 <FormControl>
 <Input list="customers-list" {...field} placeholder="Select or type new client…" className="glass-card font-bold" />
 </FormControl>
 <datalist id="customers-list">
 {customers.map(c => <option key={c.id} value={c.name} />)}
 </datalist>
 <FormMessage />
 </FormItem>
 )} />
 ) : (
 <FormField control={form.control} name="supplierName" render={({ field }) => (
 <FormItem>
 <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Supplier Name</FormLabel>
 <FormControl>
 <Input {...field} placeholder="e.g. Global Supplies Inc." className="glass-card" />
 </FormControl>
 <FormMessage />
 </FormItem>
 )} />
 )}

 {/* Currency */}
 <FormField control={form.control} name="currency" render={({ field }) => (
 <FormItem>
 <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Currency</FormLabel>
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
 <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Issue Date</FormLabel>
 <FormControl>
 <div className="relative">
 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
 <Input type="date" {...field} className="pl-10 glass-card" />
 </div>
 </FormControl>
 </FormItem>
 )} />
 <FormField control={form.control} name="dueDate" render={({ field }) => (
 <FormItem>
 <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Due Date</FormLabel>
 <FormControl>
 <div className="relative">
 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
 <Input type="date" {...field} className="pl-10 glass-card" />
 </div>
 </FormControl>
 </FormItem>
 )} />
 </div>

 {/* Notes */}
 <FormField control={form.control} name="notes" render={({ field }) => (
 <FormItem>
 <FormLabel className="text-[10px] font-bold text-muted-foreground tracking-widest">Notes / Terms</FormLabel>
 <FormControl>
 <Textarea {...field} placeholder="Payment terms, delivery notes, special conditions…" className="glass-card resize-none" rows={3} />
 </FormControl>
 </FormItem>
 )} />
 </CardContent>
 </Card>

 {/* Right — Summary Card */}
 <Card className="glass-card border-none shadow-2xl bg-primary/5">
 <CardHeader className="border-b border-border/40">
 <CardTitle className="text-sm font-bold tracking-widest flex items-center gap-2">
 <Calculator className="w-4 h-4 text-primary" />
 Summary
 </CardTitle>
 </CardHeader>
 <CardContent className="pt-6 space-y-6">
 <div className="space-y-3">
 <div className="flex justify-between text-xs font-bold text-muted-foreground">
 <span>Subtotal</span>
 <span>{watchCurrency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
 </div>
 <div className="flex justify-between text-xs font-bold text-muted-foreground">
 <span>Discounts & Tax</span>
 <span className={adjustment > 0 ?"text-destructive" :"text-emerald-600"}>
 {adjustment > 0 ?"-" :"+"}{watchCurrency} {Math.abs(totalValue - subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
 </span>
 </div>
 {watchItems.some(i => ["kg","lb","ton"].includes(i.unitType)) && (
 <div className="flex justify-between text-xs font-bold text-indigo-600 pt-3 border-t border-indigo-500/10 mt-1">
 <span>Total Physical Mass</span>
 <span>
 {watchItems.reduce((acc, i) => acc + (["kg","lb","ton"].includes(i.unitType) ? convertUnit(Number(i.quantity), i.unitType as UnitType,"kg") : 0), 0).toFixed(2)} Kg
 </span>
 </div>
 )}
 </div>
 <div className="pt-6 border-t border-border/40 flex flex-col items-center gap-2">
 <span className="text-[10px] font-bold text-primary">Total</span>
 <div className="text-5xl font-bold text-foreground">
 {totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
 </div>
 <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-xs">{watchCurrency}</Badge>
 <Badge className={cn(
"font-bold text-xs mt-1",
 watchType ==="sale"
 ?"bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
 :"bg-blue-500/10 text-blue-700 border-blue-500/20"
 )}>
 {watchType ==="sale" ?"Sales Invoice" :"Purchase Invoice"}
 </Badge>
 </div>
 <div className="pt-4">
 <Button
 type="submit"
 disabled={isSaving}
 className="w-full h-12 text-base font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
 >
 {isSaving ? (
 <><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" /> Saving…</>
 ) : (
 <><Save className="w-4 h-4 mr-2" /> Save Draft</>
 )}
 </Button>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Line Items */}
 <Card className="glass-card border-none shadow-2xl overflow-hidden">
 <CardHeader className="border-b border-border/40 bg-muted/20">
 <div className="flex items-center justify-between">
 <CardTitle className="text-sm font-bold flex items-center gap-2">
 <FileText className="w-4 h-4 text-primary" />
 Line Items
 </CardTitle>
 <Button
 type="button"
 variant="outline"
 size="sm"
 onClick={() => append({ productId:"", designation:"", quantity: 1, unitType:"unit", unitPrice: 0, discount: 0, taxRate: 0 })}
 className="h-8 gap-2 font-bold border-primary/30 text-primary hover:bg-primary/10"
 >
 <Plus className="w-4 h-4" /> Add Line
 </Button>
 </div>
 </CardHeader>
 <CardContent className="p-0 overflow-x-auto">
 <table className="w-full text-sm">
 <thead className="bg-muted/50 border-b border-border/40">
 <tr>
 <th className="text-[10px] font-bold py-3 text-center w-[40px]">#</th>
 <th className="text-[10px] font-bold py-3 text-left w-[240px]">Description / Designation</th>
 <th className="text-[10px] font-bold py-3 text-left w-[90px]">Qty</th>
 <th className="text-[10px] font-bold py-3 text-left w-[100px]">Unit</th>
 <th className="text-[10px] font-bold py-3 text-left w-[120px]">Unit Price</th>
 <th className="text-[10px] font-bold py-3 text-left w-[70px]">Disc%</th>
 <th className="text-[10px] font-bold py-3 text-left w-[70px]">Tax%</th>
 <th className="text-[10px] font-bold py-3 pr-4 text-right w-[120px]">Line Total</th>
 <th className="w-[40px]"></th>
 </tr>
 </thead>
 <tbody>
 {fields.map((field, index) => {
 const item = watchItems[index];
 const lineTotal = calcLine(item);
 const ut = (item?.unitType ||"unit") as UnitType;
 const isWeight = ["kg","lb","ton"].includes(ut);
 const kgEquiv = isWeight ? convertUnit(Number(item?.quantity || 0), ut,"kg") : null;

 return (
 <tr key={field.id} className="group border-b border-border/10 hover:bg-muted/20 transition-colors">
 {/* Auto-Increment Index */}
 <td className="py-2 text-center text-xs font-bold text-muted-foreground">
 {index + 1}
 </td>

 {/* Designation */}
 <td className="py-2">
 <FormField control={form.control} name={`items.${index}.designation`} render={({ field: f }) => (
 <FormItem>
 <FormControl>
 <Input 
 list="products-list"
 {...f} 
 onChange={(e) => {
 f.onChange(e);
 const val = e.target.value;
 const p = products.find(prod => prod.name === val);
 if (p) {
 form.setValue(`items.${index}.productId`, p.id);
 form.setValue(`items.${index}.unitPrice`, watchType === "purchase" ? (p.buy_price || 0) : (p.unit_price || 0));
 form.setValue(`items.${index}.unitType`, p.unit_type || "unit");
 } else {
 form.setValue(`items.${index}.productId`, "");
 }
 }}
 placeholder="Search or free text…" 
 className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0 text-xs font-medium" 
 />
 </FormControl>
 <FormMessage className="text-[9px]" />
 </FormItem>
 )} />
 </td>

 {/* Quantity */}
 <td className="py-2">
 <FormField control={form.control} name={`items.${index}.quantity`} render={({ field: f }) => (
 <Input type="number" step="0.01" {...f} className="h-9 border-0 shadow-none bg-transparent font-bold text-xs w-20" />
 )} />
 </td>

 {/* Unit Type */}
 <td className="py-2">
 <FormField control={form.control} name={`items.${index}.unitType`} render={({ field: f }) => (
 <div className="flex flex-col gap-1">
 <Select onValueChange={f.onChange} value={f.value}>
 <SelectTrigger className="border-0 bg-transparent shadow-none h-9 font-bold focus:ring-0 text-xs w-24">
 <SelectValue />
 </SelectTrigger>
 <SelectContent>
 {Object.entries(UNIT_LABELS).map(([val, label]) => (
 <SelectItem key={val} value={val} className="text-xs font-semibold">
 <div className="flex items-center gap-1.5">
 {["kg","lb","ton"].includes(val) && <Scale className="w-3 h-3 opacity-50" />}
 {label}
 </div>
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 {isWeight && kgEquiv !== null && (
 <span className="text-[9px] text-muted-foreground font-mono px-1">
 ≈ {kgEquiv.toFixed(2)} kg
 </span>
 )}
 </div>
 )} />
 </td>

 {/* Unit Price */}
 <td className="py-2">
 <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field: f }) => (
 <div className="relative w-28">
 <span className="absolute left-1 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">{watchCurrency}</span>
 <Input type="number" step="0.01" {...f} className="h-9 border-0 shadow-none bg-transparent pl-8 font-bold text-xs" />
 </div>
 )} />
 </td>

 {/* Discount */}
 <td className="py-2">
 <FormField control={form.control} name={`items.${index}.discount`} render={({ field: f }) => (
 <Input type="number" step="0.1" {...f} className="h-9 border-0 shadow-none bg-transparent text-muted-foreground text-xs w-16" />
 )} />
 </td>

 {/* Tax */}
 <td className="py-2">
 <FormField control={form.control} name={`items.${index}.taxRate`} render={({ field: f }) => (
 <Input type="number" step="0.1" {...f} className="h-9 border-0 shadow-none bg-transparent text-muted-foreground text-xs w-16" />
 )} />
 </td>

 {/* Line Total */}
 <td className="pr-4 py-2 text-right font-bold text-sm text-primary">
 {lineTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
 </td>

 {/* Delete */}
 <td className="py-2">
 <Button
 type="button" variant="ghost" size="icon"
 className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10"
 onClick={() => remove(index)}
 disabled={fields.length === 1}
 >
 <Trash2 className="w-4 h-4" />
 </Button>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </CardContent>
 </Card>
 <datalist id="products-list">
 {products.map(p => <option key={p.id} value={p.name} />)}
 </datalist>
 </form>
 </Form>
 </div>
 );
}
