"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Mail, Phone } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  totalInvoices: number;
  totalSpent: number;
  status: "active" | "inactive";
}

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  const mockCustomers: Customer[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john@acmecorp.com",
      phone: "+1-555-0101",
      company: "Acme Corp",
      totalInvoices: 8,
      totalSpent: 12500.0,
      status: "active",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@techsolutions.com",
      phone: "+1-555-0102",
      company: "Tech Solutions",
      totalInvoices: 5,
      totalSpent: 8750.5,
      status: "active",
    },
    {
      id: "3",
      name: "Michael Chen",
      email: "michael@globalent.com",
      phone: "+1-555-0103",
      company: "Global Enterprises",
      totalInvoices: 12,
      totalSpent: 25400.0,
      status: "active",
    },
    {
      id: "4",
      name: "Emily Rodriguez",
      email: "emily@localstartup.com",
      phone: "+1-555-0104",
      company: "Local Startup",
      totalInvoices: 3,
      totalSpent: 4200.0,
      status: "inactive",
    },
    {
      id: "5",
      name: "David Park",
      email: "david@industryleaders.com",
      phone: "+1-555-0105",
      company: "Industry Leaders",
      totalInvoices: 15,
      totalSpent: 45600.0,
      status: "active",
    },
  ];

  const filteredCustomers = mockCustomers.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>;
      case "inactive":
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Inactive</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customers</h1>
          <p className="text-muted-foreground mt-2">Manage your customer relationships</p>
        </div>
        <Button onClick={() => setShowNewCustomerForm(!showNewCustomerForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Customer
        </Button>
      </div>

      {/* New Customer Form */}
      {showNewCustomerForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Add New Customer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Full Name" />
              <Input type="email" placeholder="Email Address" />
              <Input placeholder="Phone Number" />
              <Input placeholder="Company Name" />
              <Input placeholder="City" />
              <Input placeholder="Country" />
            </div>
            <div className="flex gap-2 mt-4">
              <Button>Save Customer</Button>
              <Button variant="outline" onClick={() => setShowNewCustomerForm(false)}>
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
            placeholder="Search by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{customer.name}</CardTitle>
                  <CardDescription>{customer.company}</CardDescription>
                </div>
                {getStatusBadge(customer.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${customer.email}`} className="text-blue-600 hover:underline">
                  {customer.email}
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${customer.phone}`} className="text-blue-600 hover:underline">
                  {customer.phone}
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-t border-b">
                <div>
                  <p className="text-xs text-muted-foreground">Total Invoices</p>
                  <p className="text-2xl font-bold">{customer.totalInvoices}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">${(customer.totalSpent / 1000).toFixed(1)}k</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="flex-1 gap-1">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
