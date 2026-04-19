'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  AlertCircle, 
  ShieldCheck, 
  Activity, 
  Globe, 
  Cpu, 
  Zap,
  Building2,
  Lock,
  ArrowUpRight,
  Database,
  Terminal,
  Server
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuthUser } from '@/hooks/use-auth-user'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CompanyStats {
  id: string
  name: string
  customers: number
  invoices: number
  revenue: number
  products: number
  plan: string
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user } = useAuthUser()
  const [companies, setCompanies] = useState<CompanyStats[]>([])
  const [loading, setLoading] = useState(true)
  const [totalStats, setTotalStats] = useState({
    totalCompanies: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    trialUsers: 0,
  })
  const [platformCurrency, setPlatformCurrency] = useState<string>('USD')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = await createClient()

        // Get platform settings for currency
        const { data: settings } = await supabase.from('platform_settings').select('global_currency').single()
        if (settings?.global_currency) setPlatformCurrency(settings.global_currency)

        // Get all companies
        const { data: allCompanies } = await supabase
          .from('companies')
          .select('id, name')

        if (!allCompanies) {
          setLoading(false)
          return
        }

        // Fetch stats for all companies in parallel
        const companiesStats = await Promise.all(allCompanies.map(async (company: { id: any; name: any }) => {
          const [customersRes, invoicesRes, productsRes, subscriptionRes] = await Promise.all([
            supabase.from('customers').select('id', { count: 'exact', head: true }).eq('company_id', company.id),
            supabase.from('invoices').select('total, status').eq('company_id', company.id),
            supabase.from('products').select('id', { count: 'exact', head: true }).eq('company_id', company.id).eq('is_active', true),
            supabase.from('subscriptions').select('plan:subscription_plans(name)').eq('company_id', company.id).maybeSingle()
          ]);

          const planName = (subscriptionRes.data?.plan as any)?.name || 'Free';
          const revenue = invoicesRes.data?.reduce((sum: number, inv: { total: number | null }) => sum + (inv.total || 0), 0) || 0;

          return {
            id: company.id,
            name: company.name,
            customers: customersRes.count || 0,
            invoices: invoicesRes.data?.length || 0,
            revenue,
            products: productsRes.count || 0,
            plan: planName,
          };
        }));

        setCompanies(companiesStats);

        setTotalStats({
          totalCompanies: companiesStats.length,
          totalRevenue: companiesStats.reduce((sum, company) => sum + company.revenue, 0),
          activeSubscriptions: companiesStats.filter((c) => c.plan !== 'Free').length,
          trialUsers: companiesStats.filter((c) => c.plan === 'Free').length,
        });
      } catch (error) {
        console.error('Error fetching admin dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-surface-alpha rounded-2xl" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-surface-alpha rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Dynamic Command Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              Operational <span className="text-primary">Intelligence</span>
            </h1>
          </div>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Real-time multi-tenant infrastructure monitoring active.
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Network Status</span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981] animate-pulse" />
              <span className="text-sm font-black text-foreground uppercase tracking-tighter">Optimal Performance</span>
            </div>
          </div>
          <div className="h-10 w-px bg-border/40" />
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">Active Nodes</span>
            <span className="text-2xl font-black text-primary tracking-tighter leading-none mt-1">{totalStats.totalCompanies}</span>
          </div>
        </div>
      </div>

      {/* High-Performance KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Managed Entities', value: totalStats.totalCompanies, icon: Building2, trend: 'System Stable', color: 'text-primary' },
          { 
            label: 'Global Index Value', 
            value: totalStats.totalRevenue.toLocaleString('en-US', { style: 'currency', currency: platformCurrency, minimumFractionDigits: 0 }), 
            icon: DollarSign, 
            trend: 'Aggregated Growth', 
            color: 'text-emerald-500' 
          },
          { label: 'Premium Saturation', value: totalStats.activeSubscriptions, icon: Lock, trend: 'Tier Upgrades', color: 'text-primary' },
          { label: 'Node Integrity', value: '100%', icon: ShieldCheck, trend: 'Encrypted Logs', color: 'text-primary' },
        ].map((kpi, i) => (
          <Card key={i} className="glass-card group overflow-hidden border-border/40 hover:border-primary/30 transition-all duration-500 shadow-xl shadow-black/5">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{kpi.label}</CardDescription>
                <kpi.icon className={cn("w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity", kpi.color)} />
              </div>
              <CardTitle className="text-3xl font-black tracking-tighter text-foreground">{kpi.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={cn("flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-muted/30 px-2 py-1 rounded-lg w-fit", kpi.color)}>
                <Zap className="w-3 h-3 animate-pulse" /> {kpi.trend}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Intelligence Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tier Distribution Pie */}
        <Card className="border-border lg:col-span-1 bg-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <PieChart className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-black tracking-tight uppercase">Subscription Ecosystem</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(
                      companies.reduce((acc: Record<string, number>, c) => {
                        acc[c.plan] = (acc[c.plan] || 0) + 1
                        return acc
                      }, {})
                    ).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="var(--primary)" />
                    <Cell fill="rgba(16, 185, 129, 0.6)" />
                    <Cell fill="rgba(245, 158, 11, 0.6)" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#09090b', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: '900' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {['Free', 'Pro', 'Enterprise'].map((tier, i) => (
                <div key={tier} className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", i === 0 ? "bg-indigo-500" : i === 1 ? "bg-purple-500" : "bg-rose-500")} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{tier}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Growth Vectors */}
        <Card className="border-border lg:col-span-2 bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-lg font-black tracking-tight uppercase">Tenant Performance Index</CardTitle>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
               System Telemetry <Activity className="w-3 h-3 animate-pulse text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={companies
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 8)
                    .map(c => ({
                      name: c.name,
                      revenue: c.revenue,
                      activity: (c.customers + c.invoices) * 10
                    }))}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
                >
                  <defs>
                    <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#09090b', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff', fontSize: '11px', fontWeight: '900' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--primary)" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#areaColor)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Global Node Registry (Company List) */}
      <Card className="glass-card border-border/40 overflow-hidden shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-muted/20 p-8">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl border border-primary/20">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <CardTitle className="text-xl font-black tracking-tighter uppercase italic">Infrastructure <span className="text-primary">Registry</span></CardTitle>
            </div>
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 ml-1">Verified tenant clusters and nodes</CardDescription>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="sm" className="h-12 px-6 rounded-2xl border border-border/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all">
                Export Ledger
             </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border/40">
                <tr>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Identity</th>
                  <th className="text-left py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Tier Level</th>
                  <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Load Factors</th>
                  <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Aggregated Value</th>
                  <th className="text-right py-6 px-8 font-black uppercase tracking-[0.25em] text-muted-foreground/50 text-[9px]">Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-6 px-8">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-xs uppercase tracking-tighter">
                             {company.name.substring(0,2)}
                          </div>
                          <div>
                            <div className="font-bold text-foreground tracking-tight">{company.name}</div>
                            <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">ID: {company.id.substring(0,8)}</div>
                          </div>
                       </div>
                    </td>
                    <td className="py-6 px-8">
                      <span
                        className={cn(
                          "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                          company.plan === 'Free'
                            ? 'bg-muted/50 text-muted-foreground border-border/50'
                            : company.plan === 'Pro'
                            ? 'bg-primary/10 text-primary border-primary/20 shadow-primary/10'
                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-purple-500/10'
                        )}
                      >
                        {company.plan}
                      </span>
                    </td>
                    <td className="py-6 px-8 text-right">
                       <div className="flex flex-col items-end">
                          <span className="text-foreground font-black">{company.customers + company.invoices}</span>
                          <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Documents Processed</span>
                       </div>
                    </td>
                    <td className="py-6 px-8 text-right font-black text-foreground tracking-tighter">
                      {company.revenue.toLocaleString('en-US', {
                        style: 'currency',
                        currency: platformCurrency,
                        minimumFractionDigits: 0,
                      })}
                    </td>
                    <td className="py-6 px-8 text-right">
                       <div className="flex items-center justify-end gap-2 group-hover:gap-3 transition-all">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">ACTIVE</span>
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
  )
}
