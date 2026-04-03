"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, "Name is required"),
  sku: z.string().min(2, "SKU is required"),
  category: z.string().min(2, "Category is required"),
  buy_price: z.coerce.number().min(0, "Buy price must be >= 0"),
  unit_price: z.coerce.number().min(0, "Sell price must be >= 0"),
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
  min_stock_level: z.coerce.number().int().min(0, "Min stock cannot be negative"),
  image_url: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const supabase = createClient();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "", sku: "", category: "", buy_price: 0, unit_price: 0, quantity: 0, min_stock_level: 0, image_url: ""
    },
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: companies } = await supabase.from('companies').select('id').eq('user_id', user.id).single();
    if (!companies) return;

    // Supabase returns related categories if we do a join, but for simplicity, we treat category as text for now
    // Wait, the schema uses category_id UUID. Let's simplify and assume the form accepts string/category_name.
    // Actually, `products` has `category_id`. We'll just fetch raw products for now.
    
    // To support the new `buy_price` and `image_url` fields, ensure Phase 2 SQL is run!
    const { data, error } = await supabase.from("products").select("*, categories:category_id(name)").eq("company_id", companies.id);

    if (error) {
       toast.error("Failed to load products");
    } else {
       // mapping category name directly for tabular display
       setProducts(data.map((p: any) => ({
         ...p,
         category: p.categories?.name || "Uncategorized"
       })));
    }
    setLoading(false);
  };

  const onSubmit = async (values: ProductFormValues) => {
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
        sku: values.sku,
        unit_price: values.unit_price,
        quantity: values.quantity,
        min_stock_level: values.min_stock_level,
        company_id: companies.id,
        // Optional Phase 2 columns (fail gracefully if SQL isn't run)
        ...(values.buy_price ? { buy_price: values.buy_price } : {}),
        ...(values.image_url ? { image_url: values.image_url } : {})
      };

      if (editingProduct) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        // Need a category_id, let's just grab the first category or create one
        let catId = null;
        if (values.category) {
           let { data: catData } = await supabase.from("categories").select("id").eq("name", values.category).eq("company_id", companies.id).single();
           if (!catData) {
              const { data: newCat } = await supabase.from("categories").insert({ name: values.category, company_id: companies.id }).select("id").single();
              if (newCat) catId = newCat.id;
           } else {
              catId = catData.id;
           }
        }
        
        const { error } = await supabase.from("products").insert({ ...payload, category_id: catId });
        if (error) throw error;
        toast.success("Product added successfully");
      }
      setIsDialogOpen(false);
      fetchProducts();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      unit_price: product.unit_price,
      buy_price: product.buy_price || 0,
      quantity: product.quantity,
      min_stock_level: product.min_stock_level,
      image_url: product.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Error deleting product");
    } else {
      toast.success("Product deleted");
      fetchProducts();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);

    if (uploadError) {
      toast.error("Image upload failed. Ensure Phase 2 SQL is run.");
    } else {
      const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
      form.setValue("image_url", data.publicUrl);
      toast.success("Image uploaded successfully");
    }
    setUploadingImage(false);
  };

  const filteredProducts = products.filter((p) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-2">Manage products, pricing, and stock limits.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) { setEditingProduct(null); form.reset(); }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "New Product"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                {/* Image Upload Area */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/50 overflow-hidden group">
                    {form.watch("image_url") ? (
                      <img src={form.watch("image_url")} alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
                    )}
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      {uploadingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <span className="text-xs font-semibold">Upload</span>}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="sku" render={({ field }) => (
                    <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="buy_price" render={({ field }) => (
                    <FormItem><FormLabel>Buy Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="unit_price" render={({ field }) => (
                    <FormItem><FormLabel>Sell Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="quantity" render={({ field }) => (
                    <FormItem><FormLabel>Stock Qty</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="min_stock_level" render={({ field }) => (
                    <FormItem><FormLabel>Min Stock Level</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingProduct ? "Update" : "Create"} Product</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search by name or SKU..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="max-w-sm" 
        />
      </div>

      <Card className="shadow-lg border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Buy Price</TableHead>
                <TableHead className="text-right">Sell Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No products found.</TableCell></TableRow>
              ) : filteredProducts.map((p) => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="w-10 h-10 rounded bg-muted overflow-hidden flex items-center justify-center">
                      {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.sku}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="text-right">${p.buy_price || 0}</TableCell>
                  <TableCell className="text-right font-semibold">${p.unit_price}</TableCell>
                  <TableCell className="text-right">{p.quantity}</TableCell>
                  <TableCell className="text-center">
                    {p.quantity <= 0 ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : p.quantity <= p.min_stock_level ? (
                      <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30">Low Stock</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-600 hover:bg-green-500/30">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
