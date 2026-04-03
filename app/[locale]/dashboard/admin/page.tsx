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
} from 'recharts'
import { TrendingUp, Users, Package, DollarSign, AlertCircle, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useAuthUser } from '@/hooks/use-auth-user'

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

  // Access control is handled server-side in the admin/layout.tsx

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = await createClient()

        // Get all companies
        const { data: allCompanies } = await supabase
          .from('companies')
          .select('id, name')

        if (!allCompanies) {
          setLoading(false)
          return
        }

        // Fetch stats for each company
        const companiesStats: CompanyStats[] = []
        const planCounts: Record<string, number> = {}

        for (const company of allCompanies) {
          const { count: customersCount } = await supabase
            .from('customers')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id)

          const { data: invoices } = await supabase
            .from('invoices')
            .select('total, status')
            .eq('company_id', company.id)

          const { count: productsCount } = await supabase
            .from('products')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', company.id)
            .eq('is_active', true)

          const { data: subscriptionData } = await supabase
            .from('subscriptions')
            .select('plan:subscription_plans(name)')
            .eq('company_id', company.id)
            .maybeSingle()

          const planName = (subscriptionData?.plan as any)?.name || 'Free'
          planCounts[planName] = (planCounts[planName] || 0) + 1

          const revenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

          companiesStats.push({
            id: company.id,
            name: company.name,
            customers: customersCount || 0,
            invoices: invoices?.length || 0,
            revenue,
            products: productsCount || 0,
            plan: planName,
          })
        }

        setCompanies(companiesStats)

        // Calculate total stats
        setTotalStats({
          totalCompanies: companiesStats.length,
          totalRevenue: companiesStats.reduce(
            (sum, company) => sum + company.revenue,
            0
          ),
          activeSubscriptions: companiesStats.filter((c) => c.plan !== 'Free').length,
          trialUsers: companiesStats.filter((c) => c.plan === 'Free').length,
        })
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
      <div className="space-y-8">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground mt-1">
            Global system insights and organization management.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20">
          <ShieldCheck className="w-3 h-3 inline mr-1" /> System Administrator
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Companies</CardTitle>
            <div className="p-2 bg-slate-500/10 rounded-full">
              <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{totalStats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Registered organizations</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Global Revenue</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              ${totalStats.totalRevenue.toLocaleString('en-US', {
                minimumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Total processed funds</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Upgraded Tiers</CardTitle>
            <div className="p-2 bg-purple-500/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{totalStats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Premium subscriptions</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Infrastructure</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">Healthy</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">System services online</p>
          </CardContent>
        </Card>
      </div>

      {/* Company List */}
      <Card>
        <CardHeader>
          <CardTitle>Companies Overview</CardTitle>
          <CardDescription>Active companies and their usage metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 backdrop-blur-sm">
                <tr className="border-b border-border/50">
                  <th className="text-left py-4 px-6 font-bold uppercase tracking-tighter text-muted-foreground italic">Company Name</th>
                  <th className="text-left py-4 px-6 font-bold uppercase tracking-tighter text-muted-foreground italic">Plan</th>
                  <th className="text-right py-4 px-6 font-bold uppercase tracking-tighter text-muted-foreground italic">Customers</th>
                  <th className="text-right py-4 px-6 font-bold uppercase tracking-tighter text-muted-foreground italic">Invoices</th>
                  <th className="text-right py-4 px-6 font-bold uppercase tracking-tighter text-muted-foreground italic">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b border-border/50 hover:bg-accent/40 transition-colors group">
                    <td className="py-4 px-6 font-bold tracking-tight">{company.name}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          company.plan === 'Free'
                            ? 'bg-muted text-muted-foreground border-border/50'
                            : company.plan === 'Pro'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                        }`}
                      >
                        {company.plan}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right font-medium opacity-80 group-hover:opacity-100">{company.customers}</td>
                    <td className="py-4 px-6 text-right font-medium opacity-80 group-hover:opacity-100">{company.invoices}</td>
                    <td className="py-4 px-6 text-right font-black tracking-tight self-center">
                      ${company.revenue.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan Distribution */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold">Subscription Plan Distribution</CardTitle>
            <CardDescription>Company footprint across available tiers</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
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
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={1500}
                >
                  <Cell fill="hsl(var(--muted))" /> {/* Free */}
                  <Cell fill="#3b82f6" /> {/* Pro */}
                  <Cell fill="#a855f7" /> {/* Enterprise */}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Company */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold">Top Companies by Revenue</CardTitle>
            <CardDescription>Highest processing organizations</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={companies
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 10)}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--foreground))', fontWeight: 'bold' }} 
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '10px' }}
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#adminRevGradient)" 
                  radius={[0, 4, 4, 0]}
                  barSize={12}
                  animationDuration={1500}
                >
                  <defs>
                    <linearGradient id="adminRevGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
