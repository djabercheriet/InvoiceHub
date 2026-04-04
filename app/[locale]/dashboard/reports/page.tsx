"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Package, Users, FileText,
  BarChart3, ArrowUpRight, ArrowDownRight, Loader2, RefreshCw,
  ShoppingBag, ShoppingCart, Star, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS  = ["#6366f1","#10b981","#f59e0b","#ef4444","#3b82f6","#a855f7"];

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KPI({ label, value, sub, icon: Icon, color, trend, trendLabel }: any) {
  return (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold tracking-wider text-muted-foreground">{label}</CardTitle>
        <div className={cn("p-2 rounded-full", `bg-${color}-500/10`)}>
          <Icon className={cn("h-4 w-4", `text-${color}-600 dark:text-${color}-400`)} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="flex items-center gap-1.5 mt-1">
          <p className="text-xs text-muted-foreground font-medium">{sub}</p>
          {trend !== undefined && (
            <Badge variant="outline" className={cn(
              "text-[9px] font-bold px-1.5 py-0",
              trend >= 0 ? "text-emerald-600 border-emerald-500/30 bg-emerald-500/5" : "text-red-500 border-red-500/30 bg-red-500/5"
            )}>
              {trend >= 0 ? <ArrowUpRight className="w-2.5 h-2.5 inline" /> : <ArrowDownRight className="w-2.5 h-2.5 inline" />}
              {Math.abs(trend)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState<"daily" | "monthly" | "annual">("monthly");
  const [currency, setCurrency] = useState("USD");

  // Data states
  const [monthlySales,   setMonthlySales]   = useState<any[]>([]);
  const [topProducts,    setTopProducts]    = useState<any[]>([]);
  const [leastProducts,  setLeastProducts]  = useState<any[]>([]);
  const [invoiceStats,   setInvoiceStats]   = useState<any>({});
  const [profitData,     setProfitData]     = useState<any[]>([]);
  const [paymentDist,    setPaymentDist]    = useState<any[]>([]);

  useEffect(() => { fetchAll(); }, [period]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", user.id).single();
      if (!profile?.company_id) return;
      const cId = profile.company_id;

      // Load company prefs for currency
      const { data: co } = await supabase.from("companies").select("preferences, currency").eq("id", cId).single();
      setCurrency(co?.preferences?.currency || co?.currency || "USD");

      // All invoices
      const { data: invoices } = await supabase
        .from("invoices")
        .select("total, status, invoice_type, issue_date, created_at")
        .eq("company_id", cId);

      // All invoice items with product info
      const { data: items } = await supabase
        .from("invoice_items")
        .select("quantity, total, product_id, products(name, buy_price, unit_price)")
        .eq("company_id", cId);

      // All products
      const { data: products } = await supabase
        .from("products")
        .select("id, name, quantity, min_stock_level, unit_price, buy_price")
        .eq("company_id", cId)
        .eq("is_active", true);

      // ── Invoice Stats ─────────────────────────────────────
      const totalRevenue    = invoices?.filter(i => i.invoice_type !== "purchase").reduce((s, i) => s + (i.total || 0), 0) || 0;
      const totalExpenses   = invoices?.filter(i => i.invoice_type === "purchase").reduce((s, i) => s + (i.total || 0), 0) || 0;
      const totalPaid       = invoices?.filter(i => i.status === "paid").reduce((s, i) => s + (i.total || 0), 0) || 0;
      const totalOutstanding = invoices?.filter(i => i.status !== "paid" && i.status !== "draft").reduce((s, i) => s + (i.total || 0), 0) || 0;
      const profit          = totalRevenue - totalExpenses;

      setInvoiceStats({
        totalRevenue,
        totalExpenses,
        totalPaid,
        totalOutstanding,
        profit,
        totalCount: invoices?.length || 0,
        paidCount:  invoices?.filter(i => i.status === "paid").length || 0,
        overdueCount: invoices?.filter(i => i.status === "overdue").length || 0,
      });

      // ── Monthly trend ─────────────────────────────────────
      const trendMap: Record<string, { month: string; revenue: number; expenses: number; count: number }> = {};
      const now = new Date();

      if (period === "monthly") {
        for (let i = 11; i >= 0; i--) {
          const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}`;
          trendMap[key] = { month: MONTHS[d.getMonth()], revenue: 0, expenses: 0, count: 0 };
        }
        invoices?.forEach(inv => {
          const d   = new Date(inv.issue_date || inv.created_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2,"0")}`;
          if (trendMap[key]) {
            if (inv.invoice_type === "purchase") trendMap[key].expenses += inv.total || 0;
            else { trendMap[key].revenue += inv.total || 0; trendMap[key].count += 1; }
          }
        });
        setMonthlySales(Object.values(trendMap).map(r => ({ ...r, profit: r.revenue - r.expenses })));
      }

      if (period === "annual") {
        const yearMap: Record<string, any> = {};
        invoices?.forEach(inv => {
          const y = String(new Date(inv.issue_date || inv.created_at).getFullYear());
          if (!yearMap[y]) yearMap[y] = { month: y, revenue: 0, expenses: 0, count: 0 };
          if (inv.invoice_type === "purchase") yearMap[y].expenses += inv.total || 0;
          else { yearMap[y].revenue += inv.total || 0; yearMap[y].count += 1; }
        });
        setMonthlySales(Object.values(yearMap).map(r => ({ ...r, profit: r.revenue - r.expenses })));
      }

      if (period === "daily") {
        const dayMap: Record<string, any> = {};
        const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        invoices?.filter(inv => new Date(inv.issue_date || inv.created_at) >= last30).forEach(inv => {
          const d   = new Date(inv.issue_date || inv.created_at);
          const key = `${d.getMonth() + 1}/${d.getDate()}`;
          if (!dayMap[key]) dayMap[key] = { month: key, revenue: 0, expenses: 0, count: 0 };
          if (inv.invoice_type === "purchase") dayMap[key].expenses += inv.total || 0;
          else { dayMap[key].revenue += inv.total || 0; dayMap[key].count += 1; }
        });
        setMonthlySales(Object.values(dayMap).map(r => ({ ...r, profit: r.revenue - r.expenses })));
      }

      // ── Product analytics ─────────────────────────────────
      const productRevMap: Record<string, { name: string; revenue: number; qty: number; cost: number }> = {};
      items?.forEach(item => {
        const pid = item.product_id;
        if (!pid) return;
        const name = (item.products as any)?.name || "Unknown";
        const cost = ((item.products as any)?.buy_price || 0) * Number(item.quantity || 0);
        if (!productRevMap[pid]) productRevMap[pid] = { name, revenue: 0, qty: 0, cost: 0 };
        productRevMap[pid].revenue += Number(item.total || 0);
        productRevMap[pid].qty     += Number(item.quantity || 0);
        productRevMap[pid].cost    += cost;
      });

      const productArr = Object.entries(productRevMap).map(([id, v]) => ({
        id, ...v, profit: v.revenue - v.cost,
      })).sort((a, b) => b.revenue - a.revenue);

      setTopProducts(productArr.slice(0, 8));
      setLeastProducts([...productArr].sort((a, b) => a.revenue - b.revenue).slice(0, 5));

      // ── Profit per month ──────────────────────────────────
      setProfitData(
        (Object.values(trendMap) as any[]).map(r => ({
          month: r.month,
          profit: r.revenue - r.expenses,
          revenue: r.revenue,
        }))
      );

      // ── Payment distribution ──────────────────────────────
      const statusGroups: Record<string, number> = {};
      invoices?.forEach(inv => {
        const s = inv.status || "unknown";
        statusGroups[s] = (statusGroups[s] || 0) + 1;
      });
      setPaymentDist(Object.entries(statusGroups).map(([name, value]) => ({ name, value })));

    } catch (err: any) {
      toast.error("Failed to load reports: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => `${currency} ${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-24 gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-xs font-bold tracking-widest text-muted-foreground animate-pulse">Building Analytics Engine</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-7">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground font-medium">
            Financial intelligence, inventory insights, and KPI tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Toggle */}
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["daily","monthly","annual"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-bold tracking-wider transition-all",
                  period === p ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={fetchAll} className="h-9 w-9">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Revenue"  value={fmt(invoiceStats.totalRevenue || 0)}  sub="All sales invoices"   icon={DollarSign}   color="emerald" />
        <KPI label="Total Expenses" value={fmt(invoiceStats.totalExpenses || 0)} sub="All purchase invoices" icon={ShoppingCart} color="blue" />
        <KPI label="Net Profit"
          value={fmt(invoiceStats.profit || 0)}
          sub="Revenue − Expenses"
          icon={TrendingUp}
          color={invoiceStats.profit >= 0 ? "emerald" : "red"}
        />
        <KPI label="Outstanding"    value={fmt(invoiceStats.totalOutstanding || 0)} sub="Unpaid sent invoices" icon={AlertCircle} color="amber" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI label="Total Invoices"  value={invoiceStats.totalCount || 0}   sub="Across all types"     icon={FileText}  color="indigo" />
        <KPI label="Paid Invoices"   value={invoiceStats.paidCount || 0}    sub="Completed payments"   icon={ShoppingBag} color="emerald" />
        <KPI label="Overdue"         value={invoiceStats.overdueCount || 0} sub="Require attention"   icon={AlertCircle} color="red" />
        <KPI label="Cash Collected"  value={fmt(invoiceStats.totalPaid || 0)} sub="Payments received"  icon={DollarSign} color="emerald" />
      </div>

      {/* ── Revenue vs Expenses Chart ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold">Revenue vs Expenses</CardTitle>
            <CardDescription>{period === "daily" ? "Last 30 days" : period === "monthly" ? "Last 12 months" : "Annual comparison"}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={monthlySales}>
                <defs>
                  <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#10b981" strokeWidth={2} fill="url(#gRev)" dot={false} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#3b82f6" strokeWidth={2} fill="url(#gExp)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Profit & Loss */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold">Profit & Loss</CardTitle>
            <CardDescription>Net profit per period — positive is green</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
                <Bar dataKey="profit" name="Net Profit" radius={[4,4,0,0]} barSize={20}>
                  {monthlySales.map((entry, idx) => (
                    <Cell key={idx} fill={entry.profit >= 0 ? "#10b981" : "#ef4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Product Analytics ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" /> Best Selling Products
            </CardTitle>
            <CardDescription>Ranked by total revenue generated</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {topProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">No product data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={topProducts.slice(0, 6)} layout="vertical" margin={{ left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "hsl(var(--foreground))", fontWeight: "bold" }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "10px" }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[0,4,4,0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Invoice Status Distribution */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold">Invoice Status Distribution</CardTitle>
            <CardDescription>Overview of invoice pipeline health</CardDescription>
          </CardHeader>
          <CardContent className="pt-0 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={paymentDist}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={90}
                  paddingAngle={4} dataKey="value"
                  animationDuration={1200}
                >
                  {paymentDist.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {paymentDist.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs font-semibold capitalize text-muted-foreground">{item.name}: <span className="text-foreground">{item.value}</span></span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Least Sold Items ────────────────────────────────────────────── */}
      {leastProducts.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5 border">
          <CardHeader>
            <CardTitle className="text-sm font-bold tracking-widest text-amber-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Least-Turned Inventory
            </CardTitle>
            <CardDescription className="text-amber-600/70">Products with lowest sales — consider promotions or clearance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {leastProducts.map((p, idx) => (
                <div key={p.id} className="flex items-center gap-4 p-3 bg-card rounded-xl border border-border/40">
                  <span className="text-xs font-bold text-muted-foreground w-5">#{idx + 1}</span>
                  <div className="flex-1">
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.qty} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm text-amber-600">{fmt(p.revenue)}</p>
                    <p className="text-[10px] text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
