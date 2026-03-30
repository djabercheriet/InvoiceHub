"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  category: string;
  status: "in-stock" | "low-stock" | "out-of-stock";
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewProductForm, setShowNewProductForm] = useState(false);

  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Laptop",
      sku: "TECH-001",
      quantity: 15,
      unitPrice: 999.99,
      category: "Electronics",
      status: "in-stock",
    },
    {
      id: "2",
      name: "Office Chair",
      sku: "FURN-001",
      quantity: 3,
      unitPrice: 249.99,
      category: "Furniture",
      status: "low-stock",
    },
    {
      id: "3",
      name: "USB Cable",
      sku: "TECH-002",
      quantity: 0,
      unitPrice: 9.99,
      category: "Accessories",
      status: "out-of-stock",
    },
    {
      id: "4",
      name: "Monitor 27\"",
      sku: "TECH-003",
      quantity: 8,
      unitPrice: 349.99,
      category: "Electronics",
      status: "in-stock",
    },
    {
      id: "5",
      name: "Desk",
      sku: "FURN-002",
      quantity: 25,
      unitPrice: 399.99,
      category: "Furniture",
      status: "in-stock",
    },
  ];

  const filteredProducts = mockProducts.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in-stock":
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">In Stock</span>;
      case "low-stock":
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Low Stock</span>;
      case "out-of-stock":
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Out of Stock</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-2">Manage your products and stock levels</p>
        </div>
        <Button onClick={() => setShowNewProductForm(!showNewProductForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Product
        </Button>
      </div>

      {/* New Product Form */}
      {showNewProductForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Product Name" />
              <Input placeholder="SKU" />
              <Input type="number" placeholder="Unit Price" />
              <Input type="number" placeholder="Initial Quantity" />
              <Input placeholder="Category" />
              <Input type="number" placeholder="Min Stock Level" />
            </div>
            <div className="flex gap-2 mt-4">
              <Button>Save Product</Button>
              <Button variant="outline" onClick={() => setShowNewProductForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>{filteredProducts.length} products in inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Product Name</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">SKU</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Unit Price</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-sm">{product.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{product.sku}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{product.category}</td>
                    <td className="py-3 px-4 text-sm font-medium">{product.quantity}</td>
                    <td className="py-3 px-4 text-sm font-medium">${product.unitPrice.toFixed(2)}</td>
                    <td className="py-3 px-4">{getStatusBadge(product.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                          <Edit className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1 hover:bg-red-100 rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
