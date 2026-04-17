"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Download, Printer, Filter, TrendingUp, TrendingDown, FileText, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import { reportsService } from "@/lib/domain/reports/reports.service";
import { useExport } from "@/hooks/use-export";

export default function SalesReportPage() {
  const [data, setData] = useState<{ invoices: any[], totalRevenue: number, invoiceCount: number, paidCount: number }>({ invoices: [], totalRevenue: 0, invoiceCount: 0, paidCount: 0 });
  const [comparison, setComparison] = useState<{ currentRevenue: number, lastRevenue: number, growthPct: number }>({ currentRevenue: 0, lastRevenue: 0, growthPct: 0 });
  
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyId, setCompanyId] = useState<string | null>(null);

  const { exportToCsv, exportToPdf } = useExport();

  useEffect(() => {
    initReport();
  }, []);

  useEffect(() => {
    if (companyId) fetchFilteredData();
  }, [startDate, endDate]);

  const initReport = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;
      setCompanyId(profile.company_id);

      const [initData, compData] = await Promise.all([
        reportsService.getSalesData(profile.company_id),
        reportsService.getSalesComparison(profile.company_id)
      ]);

      setData(initData);
      setComparison(compData);
    } catch (err) {
      toast.error("Failed to compile sales report");
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredData = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const filtered = await reportsService.getSalesData(companyId, startDate || undefined, endDate || undefined);
      setData(filtered);
    } catch (err) {
      toast.error("Failed to filter report");
    } finally {
      setLoading(false);
    }
  };

  const currentDisplayData = data.invoices.filter(i => statusFilter === 'all' || i.status === statusFilter);

  const handleExportCsv = () => {
    const exportData = currentDisplayData.map(i => ({
      InvoiceNumber: i.invoice_number,
      Customer: i.customers?.name || 'Unknown',
      IssueDate: i.issue_date,
      Status: i.status,
      TotalAmount: i.total
    }));
    exportToCsv(exportData, 'Sales_Report');
  };

  const columns = [
    { header: "Invoice", accessorKey: "invoice_number", cell: (r: any) => <span className="font-bold">{r.invoice_number}</span> },
    { header: "Customer", accessorKey: "customers.name", cell: (r: any) => <span className="text-sm">{r.customers?.name || '-'}</span> },
    { header: "Date", accessorKey: "issue_date", cell: (r: any) => <span className="text-xs font-mono opacity-70">{r.issue_date}</span> },
    { 
      header: "Status", accessorKey: "status", 
      cell: (r: any) => <Badge variant="outline" className={cn("text-[9px] uppercase font-bold tracking-wider", r.status === 'paid' ? 'text-emerald-500' : '')}>{r.status}</Badge> 
    },
    { header: "Total", accessorKey: "total", cell: (r: any) => <span className="font-bold text-foreground text-right block">${(r.total || 0).toLocaleString()}</span> }
  ];

  return (
    <div className="space-y-8 page-fade-in px-4 lg:px-0 max-w-7xl mx-auto print-container">
      {/* Header aligned for web, simplified for print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 no-print">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            Sales Performance Report
          </h1>
          <p className="text-muted-foreground font-medium">Analyze revenue generation and invoice conversion across timeframes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCsv} className="gap-2 bg-background shadow-xs"><Download className="w-4 h-4"/> CSV Export</Button>
          <Button onClick={exportToPdf} className="gap-2 shadow-xl"><Printer className="w-4 h-4"/> Print to PDF</Button>
        </div>
      </div>
      
      {/* Print-only title */}
      <div className="hidden print:block mb-8">
        <h1 className="text-2xl font-black mb-2">Sales Performance Report</h1>
        <p className="text-sm">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-break">
        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Filtered Revenue</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-600">${data.totalRevenue.toLocaleString()}</div></CardContent>
        </Card>
        <Card className="glass-card border-none shadow-lg bg-emerald-500/5">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">Month-Over-Month</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2 text-emerald-600">
              {comparison.growthPct >= 0 ? <TrendingUp className="w-6 h-6"/> : <TrendingDown className="w-6 h-6 text-rose-500"/>}
              <span className={comparison.growthPct < 0 ? "text-rose-500" : ""}>{Math.abs(comparison.growthPct).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Invoices Processed</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{data.invoiceCount}</div></CardContent>
        </Card>
        <Card className="glass-card border-none shadow-lg">
          <CardHeader className="pb-2"><CardTitle className="text-[10px] uppercase font-bold tracking-widest text-indigo-500">Paid Conversion</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-indigo-500">{data.invoiceCount > 0 ? Math.round((data.paidCount / data.invoiceCount) * 100) : 0}%</div></CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="bg-muted/30 border-none no-print">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground w-full md:w-auto">
            <Filter className="w-4 h-4"/> Filter:
          </div>
          <div className="flex gap-2 items-center flex-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-32 h-9 text-xs" />
            <span className="text-muted-foreground text-xs">to</span>
            <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-32 h-9 text-xs" />
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-3 text-xs rounded-md border border-border bg-background shadow-xs font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid Only (Revenue)</option>
            <option value="sent">Sent (Pending)</option>
            <option value="draft">Drafts</option>
          </select>
        </CardContent>
      </Card>

      {/* Datatable */}
      <div className="print-table-container">
        <DataTable 
          data={currentDisplayData} 
          columns={columns} 
          loading={loading}
          searchPlaceholder="Search invoices..."
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
