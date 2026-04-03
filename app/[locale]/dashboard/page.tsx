'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  DollarSign,
  TrendingUp,
  Package,
  Users,
  AlertCircle,
  Zap,
  ShieldCheck,
  FileText
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthUser } from '@/hooks/use-auth-user'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { toast } from 'sonner'

interface Stats {
  totalRevenue: number
  paidInvoices: number
  totalInvoices: number
  customerCount: number
  productCount: number
}

interface Invoice {
  month: string
  invoices: number
  revenue: number
}

interface LowStockProduct {
  id: string
  name: string
  quantity: number
  min_stock_level: number
}

interface ActivityEntry {
  id: string
  type: 'invoice' | 'customer' | 'product'
  title: string
  detail: string
  date: string
}

export default function DashboardPage() {
  const { user, loading } = useAuthUser()
  const [stats, setStats] = useState<Stats>({
    totalRevenue: 0,
    paidInvoices: 0,
    totalInvoices: 0,
    customerCount: 0,
    productCount: 0,
  })
  const [invoiceData, setInvoiceData] = useState<Invoice[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('Free Plan')
  const [recentActivities, setRecentActivities] = useState<ActivityEntry[]>([])
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const supabase = await createClient()

        // 1. Get company and subscription plan
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('company_id, company:companies(id, subscriptions(plan:subscription_plans(name)))')
          .eq('id', user.id)
          .single()

        if (profileErr || !profile?.company_id) {
          console.warn('[DEBUG] Dashboard Alert: Workspace ID not found yet. Showing initialization state.')
          setLoadingData(false)
          return
        }

        const companyId = profile.company_id
        console.log(`[DEBUG] Dashboard Fetching for Workspace ID: ${companyId}`)

        // 2. Safely get subscription
        // @ts-ignore - dynamic join structure
        const planName = profile.company?.subscriptions?.[0]?.plan?.name || 'Free'
        setSubscriptionPlan(`${planName} Tier`)

        // 3. Parallel fetching
        const [
          { data: invoices },
          { count: customerCount },
          { count: productCount },
          { data: recentCustomers },
          { data: lowStock }
        ] = await Promise.all([
          supabase.from('invoices').select('total, status, issue_date, invoice_number').eq('company_id', companyId).order('issue_date', { ascending: true }),
          supabase.from('customers').select('id', { count: 'exact', head: true }).eq('company_id', companyId),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('company_id', companyId).eq('is_active', true),
          supabase.from('customers').select('id, name, created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(3),
          supabase.from('products').select('id, name, quantity, min_stock_level').eq('company_id', companyId).eq('is_active', true).gt('min_stock_level', 0).order('quantity', { ascending: true }).limit(5)
        ])

        // 4. Calculate stats
        const totalRevenue = invoices?.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0) || 0
        const totalInvoicesCount = invoices?.length || 0

        setStats({
          totalRevenue,
          paidInvoices: 0,
          totalInvoices: totalInvoicesCount,
          customerCount: customerCount || 0,
          productCount: productCount || 0,
        })

        // 5. Processing low stock
        if (lowStock) {
          setLowStockProducts(lowStock.filter((p: any) => p.quantity <= p.min_stock_level) as LowStockProduct[])
        }

        // 6. Generate Activity Logs (Real Multi-table feed)
        const activities: ActivityEntry[] = []
        invoices?.slice(-3).reverse().forEach(inv => {
          activities.push({
            id: `inv-${inv.invoice_number}`,
            type: 'invoice',
            title: `Invoice Generated: ${inv.invoice_number}`,
            detail: `Total: $${inv.total.toLocaleString()}`,
            date: inv.issue_date
          })
        })
        recentCustomers?.forEach(cust => {
          activities.push({
            id: `cust-${cust.id}`,
            type: 'customer',
            title: `New Client Registered`,
            detail: cust.name,
            date: new Date(cust.created_at).toLocaleDateString()
          })
        })
        setRecentActivities(activities.sort((a,b) => b.id.localeCompare(a.id)).slice(0, 5))

        // 7. Graph data
        if (invoices) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const trendMap: Record<string, { invoices: number; revenue: number; expenses: number }> = {}
          
          for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const m = months[d.getMonth()]
            trendMap[m] = { invoices: 0, revenue: 0, expenses: 0 }
          }

          invoices.forEach((inv: any) => {
            const date = new Date(inv.issue_date)
            const m = months[date.getMonth()]
            if (trendMap[m]) {
              trendMap[m].invoices += 1
              trendMap[m].revenue += (inv.total || 0)
              trendMap[m].expenses = trendMap[m].revenue * (0.4 + Math.random() * 0.3)
            }
          })

          const trendData = Object.entries(trendMap).map(([month, data]) => ({ month, ...data }))
          setInvoiceData(trendData as any)
        }
      } catch (error) {
        console.error('CRITICAL: Dashboard Fetch Failure', error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user])

  const handleSeed = async () => {
    try {
      setLoadingData(true)
      const res = await fetch('/api/debug/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        toast.success(data.message)
        window.location.reload()
      } else {
        throw new Error(data.error)
      }
    } catch (err: any) {
      toast.error(`Seed failed: ${err.message}`)
    } finally {
      setLoadingData(false)
    }
  }

  if (loading || loadingData) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-10 w-48 bg-muted rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const isEmpty = stats.totalInvoices === 0 && stats.customerCount === 0

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">Workspace Intelligence</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            Real-time business performance & resource tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/5 pulse">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            MARKET LIVE
          </div>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">All time generated</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Invoices</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Issued across platform</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Low Stock Items</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-full">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-amber-600">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Items require restock</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Customers</CardTitle>
            <div className="p-2 bg-indigo-500/10 rounded-full">
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.customerCount}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Client relations</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty State / Seed Helper */}
      {isEmpty && (
        <Card className="border-primary/20 bg-primary/5 shadow-xl overflow-hidden border-2 animate-bounce-subtle mt-4">
          <CardHeader className="text-center pt-12 pb-6">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 border border-primary/20">
               <Zap className="w-8 h-8 text-primary fill-primary" />
            </div>
            <CardTitle className="text-4xl font-black tracking-tighter uppercase mb-2">Welcome to InvoiceHub</CardTitle>
            <CardDescription className="max-w-md mx-auto text-base font-medium">
              Start your journey by populating your workspace with enterprise demo data. One click, unlimited insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-12">
            <button
               onClick={handleSeed}
               className="group relative px-10 py-5 bg-primary text-primary-foreground font-black uppercase tracking-widest text-sm rounded-xl hover:scale-105 transition-all shadow-2xl shadow-primary/40 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              Populate Demo Data
            </button>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-border/50 shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Revenue Dynamics</CardTitle>
            <CardDescription>Monthly growth and collections trajectory</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={invoiceData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground))" opacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  name="Revenue ($)"
                  strokeWidth={4}
                  dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card className="border-border/50 shadow-sm overflow-hidden flex flex-col bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold">Audit Trail</CardTitle>
                <CardDescription>Real-time workspace activity monitor</CardDescription>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                    <div className={`mt-1 p-2 rounded-lg ${
                      activity.type === 'invoice' ? 'bg-blue-500/10' : 'bg-indigo-500/10'
                    }`}>
                      {activity.type === 'invoice' ? (
                        <FileText className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Users className="w-4 h-4 text-indigo-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.detail}</p>
                    </div>
                    <div className="text-[10px] font-medium text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">
                      {activity.date}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Package className="w-12 h-12 text-muted mb-4 opacity-20" />
                  <p className="text-sm font-medium text-muted-foreground">No recent activity pulse detected.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="border-amber-500/20 bg-amber-500/5 shadow-none overflow-hidden border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-black uppercase tracking-widest text-xs">
              <AlertCircle className="w-4 h-4" />
              Critical Inventory Conflict
            </CardTitle>
            <CardDescription className="text-amber-600/70 font-medium">System has detected items below safety thresholds.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-card border border-amber-500/10 rounded-xl group hover:border-amber-500/30 transition-all duration-300 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg group-hover:scale-110 transition-transform">
                      <Package className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                           <div className="h-full bg-amber-500" style={{ width: `${(product.quantity / product.min_stock_level) * 100}%` }} />
                        </div>
                        <p className="text-[10px] font-black text-amber-600 uppercase">
                          {product.quantity} / {product.min_stock_level} Unit
                        </p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/inventory?search=${product.name}`}
                    className="text-[10px] px-4 py-2 bg-amber-600 text-white font-black rounded uppercase hover:bg-amber-700 transition shadow-lg shadow-amber-600/20"
                  >
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Info */}
      <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden relative group border-2">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="w-32 h-32 text-primary" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <Zap className="w-4 h-4 fill-primary" />
            Workspace Capability
          </CardTitle>
          <CardDescription className="font-medium">Infrastructure status and enterprise scalability options.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20 shadow-inner">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Active Infrastructure</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-black tracking-tighter">{subscriptionPlan}</p>
                  <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-[9px] font-black rounded border border-emerald-500/20 uppercase tracking-widest">Verified</span>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/subscription"
              className="px-8 py-3 bg-primary text-primary-foreground text-xs font-black rounded-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 uppercase tracking-widest"
            >
              Management Console
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
