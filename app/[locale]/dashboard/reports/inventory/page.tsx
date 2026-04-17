"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Download, Printer, Filter, Package, AlertTriangle, XCircle, CheckCircle, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { reportsService } from "@/lib/domain/reports/reports.service";
import { useExport } from "@/hooks/use-export";

export default function InventoryReportPage() {
  const [data, setData] = useState<{ products: any[], totalValuation: number, totalItems: number, lowStockCount: number, outOfStockCount: number }>({ 
    products: [], totalValuation: 0, totalItems: 0, lowStockCount: 0, outOfStockCount: 0 
  });
  
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { exportToCsv, exportToPdf } = useExport();

  useEffect(() => {
    initReport();
  }, []);

  const initReport = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;

      const reportData = await reportsService.getInventoryValuation(profile.company_id);
      setData(reportData);
    } catch (err) {
      toast.error("Failed to compile inventory report");
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (p: any) => {
    if (p.quantity <= 0) return 'out';
    if (p.quantity <= p.min_stock_level) return 'low';
    return 'good';
  };

  const currentDisplayData = data.products.filter(p => {
    const statusMatch = statusFilter === 'all' || getStatus(p) === statusFilter;
    const catMatch = categoryFilter === 'all' || p.categories?.name === categoryFilter;
    return statusMatch && catMatch;
  });

  const categories = Array.from(new Set(data.products.map(p => p.categories?.name).filter(Boolean)));

  const handleExportCsv = () => {
    const exportData = currentDisplayData.map(p => ({
      SKU: p.sku || 'N/A',
      Product: p.name,
      Category: p.categories?.name || 'Uncategorized',
      Quantity: p.quantity,
      UnitValue: p.unit_price,
      TotalValuation: (p.quantity * (p.unit_price || 0))
    }));
    exportToCsv(exportData, 'Inventory_Valuation_Report');
  };

  const columns = [
    { 
      header: "Product", accessorKey: "name", 
      cell: (r: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight">{r.name}</span>
          <span className="text-[10px] text-muted-foreground font-mono bg-muted/50 w-fit px-1 rounded">{r.sku || 'N/A'}</span>
        </div>
      ) 
    },
    { 
      header: "Category", accessorKey: "categories.name", 
      cell: (r: any) => <span className="text-xs flex items-center gap-1 opacity-70"><Tag className="w-3 h-3"/> {r.categories?.name || '-'}</span> 
    },
    { 
      header: "Status", accessorKey: "quantity", 
      cell: (r: any) => {
        const s = getStatus(r);
        return (
          <Badge variant="outline" className={cn("text-[9px] uppercase font-bold tracking-wider", 
            s === 'good' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 
            s === 'low' ? 'text-amber-500 border-amber-500/20 bg-amber-500/5' : 
            'text-rose-500 border-rose-500/20 bg-rose-500/5'
          )}>
            {s === 'good' ? 'IN STOCK' : s === 'low' ? 'LOW STOCK' : 'DEPLETED'}
          </Badge>
        )
      } 
    },
    { 
      header: "Qty", accessorKey: "quantity", 
      cell: (r: any) => <span className={cn("font-bold", getStatus(r) === 'out' ? 'text-rose-500' : '')}>{r.quantity}</span> 
    },
    { 
      header: "Asset Valuation", accessorKey: "unit_price", 
      cell: (r: any) => <span className="font-bold text-foreground text-right block">${((r.quantity || 0) * (r.unit_price || 0)).toLocaleString()}</span> 
    }
  ];

  return (
    <div className="space-y-8 page-fade-in px-4 lg:px-0 max-w-7xl mx-auto print-container">
      {/* Header aligned for web, simplified for print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 no-print">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-500" />
            Inventory Valuation Report
          </h1>
          <p className="text-muted-foreground font-medium">Track asset value locked in physical inventory and stock health.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv} className="gap-2 bg-background shadow-xs"><Download className="w-4 h-4"/> CSV Export</Button>
          <Button onClick={exportToPdf} className="gap-2 shadow-xl bg-indigo-600 hover:bg-indigo-700 text-white"><Printer className="w-4 h-4"/> Print to PDF</Button>
        </div>
      </div>
      
      {/* Print-only title */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-black mb-2 flex items-center gap-2"><Package className="w-6 h-6"/> Inventory Valuation Report</h1>
        <p className="text-sm">Asset snapshot generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-break">
        <Card className="glass-card border-none shadow-lg bg-indigo-500/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold tracking-widest text-indigo-600">Total Asset Value</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-indigo-600">${data.totalValuation.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Healthy SKUs</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-600">{data.totalItems - data.lowStockCount - data.outOfStockCount}</div></CardContent>
        </Card>
        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold tracking-widest text-amber-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Low Stock</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-amber-500">{data.lowStockCount}</div></CardContent>
        </Card>
        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold tracking-widest text-rose-500 flex items-center gap-1"><XCircle className="w-3 h-3"/> Depleted</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-rose-500">{data.outOfStockCount}</div></CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="bg-muted/30 border-none no-print">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground w-full md:w-auto">
            <Filter className="w-4 h-4"/> Filter:
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs w-full sm:w-auto rounded-md border border-border bg-background shadow-xs font-medium"
          >
            <option value="all">All Stock Statuses</option>
            <option value="good">Healthy Stock</option>
            <option value="low">Low Stock Alerts</option>
            <option value="out">Out of Stock</option>
          </select>
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="h-9 px-3 text-xs w-full sm:w-auto rounded-md border border-border bg-background shadow-xs font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((c: any) => <option key={c} value={c}>{c}</option>)}
          </select>
        </CardContent>
      </Card>

      {/* Datatable */}
      <div className="print-table-container">
        <DataTable 
          data={currentDisplayData} 
          columns={columns} 
          loading={loading}
          searchPlaceholder="Search product name or SKU..."
        />
      </div>

      {/* Print Styles injection */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          .print-container, .print-container * { visibility: visible; }
          .no-print { display: none !important; }
          .print-container { position: absolute; left: 0; top: 0; width: 100%; border: none; padding: 0; margin: 0; }
          .glass-card { box-shadow: none !important; border: 1px solid #e2e8f0 !important; background: white !important; break-inside: avoid; }
          .no-break { page-break-inside: avoid; }
        }
      `}} />
    </div>
  );
}
