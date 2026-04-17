"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Tags, Plus, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { FormDialog } from "@/components/ui/form-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const form = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;
      setCompanyId(profile.company_id);

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      toast.error("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: CategoryForm) => {
    if (!companyId) return;
    try {
      const supabase = createClient();
      if (editingId) {
        const { error } = await supabase.from('categories').update(values).eq('id', editingId);
        if (error) throw error;
        toast.success("Category updated.");
      } else {
        const { error } = await supabase.from('categories').insert({ company_id: companyId, ...values });
        if (error) throw error;
        toast.success("Category created.");
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingId(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(`Operation failed: ${err.message}`);
    }
  };

  const openEdit = (cat: any) => {
    form.reset({ name: cat.name, description: cat.description || "" });
    setEditingId(cat.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (row: any) => {
    if (!confirm(`Delete category? Products within it will lose their category association.`)) return;
    try {
      const supabase = createClient();
      const { error } = await supabase.from('categories').delete().eq('id', row.id);
      if (error) throw error;
      toast.success("Category deleted.");
      fetchCategories();
    } catch (err: any) {
      toast.error("Deletion failed.");
    }
  };

  const columns = [
    { 
      header: "Category Name", accessorKey: "name", 
      cell: (r: any) => <span className="font-bold tracking-tight text-sm text-foreground">{r.name}</span> 
    },
    { 
      header: "Description", accessorKey: "description", 
      cell: (r: any) => <span className="text-xs text-muted-foreground opacity-80 max-w-[200px] md:max-w-md line-clamp-1">{r.description || '-'}</span> 
    }
  ];

  return (
    <div className="space-y-8 page-fade-in px-4 lg:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Tags className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            Product Categories
          </h1>
          <p className="text-muted-foreground font-medium text-sm md:text-base">Organize your inventory taxonomy into discrete collections.</p>
        </div>
        <Button onClick={() => { setEditingId(null); form.reset({ name: "", description: "" }); setIsDialogOpen(true); }} size="lg" className="w-full md:w-auto gap-2 font-bold tracking-tight shadow-xl">
          <Plus className="w-5 h-5" /> New Category
        </Button>
      </div>

      <Card className="glass-card shadow-xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-[10px] font-bold tracking-widest text-primary uppercase">Total Collections</CardTitle>
        </CardHeader>
        <CardContent><div className="text-3xl font-bold tracking-tight text-foreground">{categories.length}</div></CardContent>
      </Card>

      <Card className="glass-card shadow-2xl border-none overflow-hidden">
        <DataTable 
          data={categories} 
          columns={columns} 
          loading={loading}
          searchPlaceholder="Search categories..."
          actions={(row) => (
            <div className="flex justify-end gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-xl" onClick={() => openEdit(row)}>
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10 text-destructive rounded-xl" onClick={() => handleDelete(row)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        />
      </Card>

      <FormDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        title={editingId ? "Edit Category" : "New Category"} 
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <CardDescription className="mb-4">Create a segment to track related items together.</CardDescription>
        <Form {...form}>
          <div className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold tracking-widest">Category Name</FormLabel>
                <FormControl><Input placeholder="e.g. Raw Materials" className="h-11 bg-background" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] uppercase font-bold tracking-widest">Description (Optional)</FormLabel>
                <FormControl><Textarea placeholder="Internal notes about this category..." className="resize-none bg-background min-h-[100px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        </Form>
      </FormDialog>
    </div>
  );
}
