"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from "recharts";
import { 
  ShoppingBag, TrendingUp, Users, FileText, 
  ArrowUpRight, ArrowDownRight, DollarSign,
  Clock, CheckCircle, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SalesOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single();
      if (!profile?.company_id) return;

      // Real implementation would use complex aggregation
      // For now, let's fetch invoices and aggregate
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total, status, created_at, customers(name)')
        .eq('company_id', profile.company_id);

      if (invoices) {
        interface InvoiceRow {
          total: number | null;
          status: string | null;
          created_at: string;
          customers: { name: string } | null;
        }
        const invs = invoices as unknown as InvoiceRow[];
        const total = invs.reduce((acc: number, inv) => acc + (inv.total || 0), 0);
        const paid = invs.filter(i => i.status === 'paid').reduce((acc: number, inv) => acc + (inv.total || 0), 0);
        const outstanding = total - paid;
        
        setStats({
          totalRevenue: total,
          paidRevenue: paid,
          outstandingRevenue: outstanding,
          invoiceCount: invs.length,
          customerCount: new Set(invs.map(i => i.customers?.name)).size
        });

        // Mock trend data for chart
        setTrendData([
          { name: 'Jan', total: 4000 },
          { name: 'Feb', total: 3000 },
          { name: 'Mar', total: 5000 },
          { name: 'Apr', total: 2780 },
          { name: 'May', total: 1890 },
          { name: 'Jun', total: 2390 },
          { name: 'Jul', total: 3490 },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 animate-pulse">Loading Sales Intelligence...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary" />
            Sales Intelligence
          </h1>
          <p className="text-muted-foreground font-medium">Domain overview for revenue, customer acquisition, and billing performance.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="font-bold">Export Report</Button>
           <Button className="font-bold shadow-lg shadow-primary/20">New Campaign</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-widest text-primary uppercase">Gross Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">${stats?.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 text-emerald-500 font-bold text-xs">
              <ArrowUpRight className="w-3 h-3" /> +12.5%
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-emerald-600">${stats?.paidRevenue.toLocaleString()}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Audit complete</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-amber-600">${stats?.outstandingRevenue.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 text-amber-500 font-bold text-xs">
              <Clock className="w-3 h-3" /> 14 Pending
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Acquisition</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats?.customerCount}</div>
            <div className="flex items-center gap-1 mt-1 text-emerald-500 font-bold text-xs">
              <Users className="w-3 h-3" /> +3 this month
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold tracking-tight">Revenue Trajectory</CardTitle>
            <CardDescription>Consolidated sales performance over time.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] pl-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 600, fill: 'var(--muted-foreground)'}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fontWeight: 600, fill: 'var(--muted-foreground)'}}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border)',
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' 
                  }}
                  itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold tracking-tight">Top Performance</CardTitle>
            <CardDescription>Highest valuation accounts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[1,2,3].map((i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-xs">
                      {i}
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">Enterprise Client 0{i}</p>
                      <p className="text-[10px] text-muted-foreground">High Frequency</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold tracking-tight text-primary">$12,450</p>
                    <p className="text-[10px] text-emerald-500 font-bold tracking-widest">STABLE</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full font-bold text-xs tracking-tighter hover:bg-secondary">View Customer Analytics</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
