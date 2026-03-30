"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, Download, Trash2 } from "lucide-react";

interface Invoice {
  id: string;
  number: string;
  customer: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  date: string;
  dueDate: string;
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewInvoiceForm, setShowNewInvoiceForm] = useState(false);

  const mockInvoices: Invoice[] = [
    {
      id: "1",
      number: "INV-2024-001",
      customer: "Acme Corp",
      amount: 2500.0,
      status: "paid",
      date: "2024-01-15",
      dueDate: "2024-02-15",
    },
    {
      id: "2",
      number: "INV-2024-002",
      customer: "Tech Solutions",
      amount: 1850.5,
      status: "sent",
      date: "2024-03-10",
      dueDate: "2024-04-10",
    },
    {
      id: "3",
      number: "INV-2024-003",
      customer: "Global Enterprises",
      amount: 5200.0,
      status: "draft",
      date: "2024-03-15",
      dueDate: "2024-04-15",
    },
    {
      id: "4",
      number: "INV-2024-004",
      customer: "Local Startup",
      amount: 3150.75,
      status: "overdue",
      date: "2024-01-20",
      dueDate: "2024-02-20",
    },
    {
      id: "5",
      number: "INV-2024-005",
      customer: "Industry Leaders",
      amount: 7500.0,
      status: "paid",
      date: "2024-02-01",
      dueDate: "2024-03-01",
    },
  ];

  const filteredInvoices = mockInvoices.filter((invoice) =>
    invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Paid</span>;
      case "sent":
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Sent</span>;
      case "draft":
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Draft</span>;
      case "overdue":
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Overdue</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground mt-2">Create and manage your invoices</p>
        </div>
        <Button onClick={() => setShowNewInvoiceForm(!showNewInvoiceForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      {/* New Invoice Form */}
      {showNewInvoiceForm && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Create New Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Customer Name" />
              <Input placeholder="Invoice Number" />
              <Input type="email" placeholder="Customer Email" />
              <Input type="date" placeholder="Invoice Date" />
              <Input type="date" placeholder="Due Date" />
              <Input type="number" placeholder="Amount" />
            </div>
            <div className="flex gap-2 mt-4">
              <Button>Create Invoice</Button>
              <Button variant="outline" onClick={() => setShowNewInvoiceForm(false)}>
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
            placeholder="Search by invoice number or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
          <CardDescription>{filteredInvoices.length} invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-sm">Invoice #</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Issue Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Due Date</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-sm">{invoice.number}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{invoice.customer}</td>
                    <td className="py-3 px-4 font-medium text-sm">${invoice.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-sm">{invoice.date}</td>
                    <td className="py-3 px-4 text-sm">{invoice.dueDate}</td>
                    <td className="py-3 px-4">{getStatusBadge(invoice.status)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        <button className="p-1 hover:bg-slate-200 rounded transition-colors">
                          <Download className="w-4 h-4 text-muted-foreground" />
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
