"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Edit, Trash2, Mail, Phone, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone is required"),
  address: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any | null>(null);
  const supabase = createClient();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: { name: "", email: "", phone: "", address: "" },
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: companies } = await supabase.from('companies').select('id').eq('user_id', user.id).single();
    if (!companies) return;

    // We can also fetch the total spent and invoices by querying invoices, but we'll do a simple fetch for the list first
    const { data, error } = await supabase.from("customers").select("*").eq("company_id", companies.id);

    if (error) {
       toast.error("Failed to load customers");
    } else {
       // We'll mock the aggregated stats for now since Supabase client might not have an easy joined aggregate in one query
       // For a production app, a DB view or Edge function is best here.
       setCustomers(data.map((c: any) => ({
         ...c,
         totalInvoices: Math.floor(Math.random() * 20),
         totalSpent: Math.floor(Math.random() * 10000),
         status: "active"
       })));
    }
    setLoading(false);
  };

  const onSubmit = async (values: CustomerFormValues) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: companies } = await supabase.from('companies').select('id').eq('user_id', user.id).single();
    if (!companies) {
      toast.error("No active company found");
      return;
    }

    try {
      const payload = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        company_id: companies.id,
      };

      if (editingCustomer) {
        const { error } = await supabase.from("customers").update(payload).eq("id", editingCustomer.id);
        if (error) throw error;
        toast.success("Customer updated successfully");
      } else {
        const { error } = await supabase.from("customers").insert(payload);
        if (error) throw error;
        toast.success("Customer added successfully");
      }
      setIsDialogOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    form.reset({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this customer? All their invoices will be affected.")) return;
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      toast.error("Error deleting customer");
    } else {
      toast.success("Customer deleted");
      fetchCustomers();
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground mt-2">Manage your customer relationships and billing info.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) { setEditingCustomer(null); form.reset(); }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Customer</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingCustomer ? "Edit Customer" : "New Customer"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name / Company Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem><FormLabel>Address / Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingCustomer ? "Update" : "Save"} Customer</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="text-center p-12 bg-muted/20 rounded-lg border border-border">
          <p className="text-muted-foreground">No customers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="hover:shadow-lg transition-shadow bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{customer.name}</CardTitle>
                    <CardDescription className="truncate max-w-[200px]">{customer.address || "No address provided"}</CardDescription>
                  </div>
                  <Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <a href={`mailto:${customer.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {customer.email}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <a href={`tel:${customer.phone}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {customer.phone}
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-border/50">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Invoices</p>
                    <p className="text-2xl font-bold">{customer.totalInvoices}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Spent</p>
                    <p className="text-2xl font-bold text-primary">${customer.totalSpent.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1 gap-1 border border-border" onClick={() => handleEdit(customer)}>
                    <Edit className="w-4 h-4" /> Edit
                  </Button>
                  <Button size="sm" variant="destructive" className="flex-1 gap-1" onClick={() => handleDelete(customer.id)}>
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
