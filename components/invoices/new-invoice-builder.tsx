"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Save, Send, FileText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  issueDate: z.string(),
  dueDate: z.string(),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce.number().min(1, "Minimum 1"),
    unitPrice: z.coerce.number().min(0),
    discount: z.coerce.number().min(0).max(100).default(0),
    taxRate: z.coerce.number().min(0).max(100).default(0),
  })).min(1, "Add at least one item")
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function NewInvoiceBuilder({ onSaveSuccess }: { onSaveSuccess: () => void }) {
  const supabase = createClient();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: "",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: [{ productId: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items"
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: companies } = await supabase.from('companies').select('id').eq('user_id', user.id).single();
      if (!companies) return;

      const [custRes, prodRes] = await Promise.all([
        supabase.from("customers").select("*").eq("company_id", companies.id),
        supabase.from("products").select("*").eq("company_id", companies.id)
      ]);

      if (custRes.data) setCustomers(custRes.data);
      if (prodRes.data) setProducts(prodRes.data);
      setLoading(false);
    }
    loadData();
  }, []);

  const watchItems = form.watch("items");

  const calculateSubtotal = () => {
    return watchItems.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = () => {
    return watchItems.reduce((acc, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const afterDiscount = lineTotal - (lineTotal * (item.discount / 100));
      const afterTax = afterDiscount + (afterDiscount * (item.taxRate / 100));
      return acc + afterTax;
    }, 0);
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.unitPrice`, product.unit_price);
    }
  };

  const onSubmit = async (values: InvoiceFormValues) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: companies } = await supabase.from('companies').select('id').eq('user_id', user?.id).single();

      // Ensure phase 2 tables exist
      const total = calculateTotal();
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Insert Invoice
      const { data: savedInvoice, error: invError } = await supabase.from("invoices").insert({
        company_id: companies?.id,
        customer_id: values.customerId,
        invoice_number: invoiceNumber,
        total: total,
        status: "draft",
        issue_date: values.issueDate,
        due_date: values.dueDate
      }).select("id").single();

      if (invError) throw new Error("Ensure Phase 2 Schema was run: " + invError.message);

      // 2. Insert Invoice Items
      const itemsPayload = values.items.map(item => {
        const lineTotal = item.quantity * item.unitPrice;
        const afterDis = lineTotal - (lineTotal * (item.discount / 100));
        const finalTotal = afterDis + (afterDis * (item.taxRate / 100));
        
        return {
          invoice_id: savedInvoice.id,
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          tax_rate: item.taxRate,
          discount: item.discount,
          total: finalTotal,
          company_id: companies?.id // for RLS ease
        };
      });

      const { error: itemsError } = await supabase.from("invoice_items").insert(itemsPayload);
      if (itemsError) throw itemsError;

      toast.success("Invoice created successfully!");
      onSaveSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader>
        <CardTitle>Create New Invoice</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-3 gap-6">
              <FormField control={form.control} name="customerId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="issueDate" render={({ field }) => (
                <FormItem><FormLabel>Issue Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="dueDate" render={({ field }) => (
                <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-background">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="w-[30%]">Product</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Disc %</TableHead>
                    <TableHead>Tax %</TableHead>
                    <TableHead className="text-right">Line Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const item = watchItems[index];
                    const rawLine = (item?.quantity || 0) * (item?.unitPrice || 0);
                    const lineAfterDis = rawLine - (rawLine * ((item?.discount || 0) / 100));
                    const finalLine = lineAfterDis + (lineAfterDis * ((item?.taxRate || 0) / 100));

                    return (
                      <TableRow key={field.id} className="group">
                        <TableCell>
                          <FormField control={form.control} name={`items.${index}.productId`} render={({ field }) => (
                            <Select onValueChange={(val) => { field.onChange(val); handleProductSelect(index, val); }} defaultValue={field.value}>
                              <SelectTrigger className="border-0 bg-transparent h-8 shadow-none"><SelectValue placeholder="Product" /></SelectTrigger>
                              <SelectContent>
                                {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => (
                            <Input type="number" className="h-8 border-0 shadow-none bg-transparent" {...field} />
                          )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`items.${index}.unitPrice`} render={({ field }) => (
                            <Input type="number" className="h-8 border-0 shadow-none bg-transparent" {...field} />
                          )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`items.${index}.discount`} render={({ field }) => (
                            <Input type="number" className="h-8 border-0 shadow-none bg-transparent" {...field} />
                          )} />
                        </TableCell>
                        <TableCell>
                          <FormField control={form.control} name={`items.${index}.taxRate`} render={({ field }) => (
                            <Input type="number" className="h-8 border-0 shadow-none bg-transparent" {...field} />
                          )} />
                        </TableCell>
                        <TableCell className="text-right font-medium">${finalLine.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => remove(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <div className="p-2 border-t border-border bg-muted/20">
                <Button type="button" variant="ghost" size="sm" onClick={() => append({ productId: "", quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 })} className="gap-2 text-primary">
                  <Plus className="w-4 h-4" /> Add Line Item
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <div className="w-[300px] space-y-3">
                <div className="flex justify-between text-muted-foreground text-sm">
                  <span>Subtotal</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-3 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">${calculateTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Save className="w-4 h-4" /> {isSubmitting ? "Saving..." : "Save Draft"}
              </Button>
              {/* PDF and Emit will be hooked up separately or upon save */}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
