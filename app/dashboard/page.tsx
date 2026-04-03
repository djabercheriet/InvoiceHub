'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthUser } from '@/hooks/use-auth-user'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

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
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const supabase = await createClient()

        // Get company and subscription plan
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id, company:companies(id, subscriptions(plan:subscription_plans(name)))')
          .eq('id', user.id)
          .single()

        if (!profile?.company_id) {
          setLoadingData(false)
          return
        }

        const companyId = profile.company_id
        
        // Extract plan name safely from the deep join
        // @ts-ignore - dynamic join structure
        const planName = profile.company?.subscriptions?.[0]?.plan?.name || 'Free'
        setSubscriptionPlan(`${planName} Plan`)

        // Fetch stats
        const { data: invoices } = await supabase
          .from('invoices')
          .select('total, status, issue_date')
          .eq('company_id', companyId)
          .order('issue_date', { ascending: true })

        const { count: customerCount } = await supabase
          .from('customers')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)

        const { count: productCount } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('company_id', companyId)
          .eq('is_active', true)

        // Calculate stats
        const totalRevenue =
          invoices?.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0) || 0
        const paidInvoices = invoices?.filter((inv: any) => inv.status === 'paid').length || 0
        const totalInvoicesCount = invoices?.length || 0

        setStats({
          totalRevenue,
          paidInvoices,
          totalInvoices: totalInvoicesCount,
          customerCount: customerCount || 0,
          productCount: productCount || 0,
        })

        // Fetch low stock products
        const { data: lowStock } = await supabase
          .from('products')
          .select('id, name, quantity, min_stock_level')
          .eq('company_id', companyId)
          .eq('is_active', true)
          .gt('min_stock_level', 0)
          .order('quantity', { ascending: true })
          .limit(5)

        if (lowStock) {
          const filtered = lowStock.filter(
            (p: any) => p.quantity <= p.min_stock_level
          ) as LowStockProduct[]
          setLowStockProducts(filtered)
        }

        // Generate REAL invoice trend data (last 6 months)
        if (invoices) {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
          const trendMap: Record<string, { invoices: number; revenue: number }> = {}
          
          // Seed last 6 months
          for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const m = months[d.getMonth()]
            trendMap[m] = { invoices: 0, revenue: 0 }
          }

          invoices.forEach((inv: any) => {
            const date = new Date(inv.issue_date)
            const m = months[date.getMonth()]
            if (trendMap[m]) {
              trendMap[m].invoices += 1
              trendMap[m].revenue += (inv.total || 0)
            }
          })

          const trendData = Object.entries(trendMap).map(([month, data]) => ({
            month,
            ...data
          }))
          setInvoiceData(trendData)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user])

  if (loading || loadingData) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Real-time overview of your business performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20 animate-pulse">
            LIVE
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Revenue</CardTitle>
            <div className="p-2 bg-emerald-500/10 rounded-full">
              <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              ${stats.totalRevenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              Across <span className="text-foreground">{stats.totalInvoices}</span> issued invoices
            </p>
          </CardContent>
        </Card>

        {/* Paid Invoices */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Paid Ratio</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-full">
              <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">
              {stats.totalInvoices > 0 ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              <span className="text-blue-600 dark:text-blue-400 font-bold">{stats.paidInvoices}</span> collections completed
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Inventory</CardTitle>
            <div className="p-2 bg-amber-500/10 rounded-full">
              <Package className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.productCount}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">
              {lowStockProducts.length > 0 ? (
                <span className="text-orange-600 font-bold">{lowStockProducts.length} items low stock</span>
              ) : (
                "Stock levels healthy"
              )}
            </p>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Customers</CardTitle>
            <div className="p-2 bg-indigo-500/10 rounded-full">
              <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight">{stats.customerCount}</div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">Active business relations</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-bold">Revenue Trend</CardTitle>
            <CardDescription>Monthly growth and collections analysis</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={invoiceData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                  stroke="#3b82f6"
                  name="Revenue ($)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: 'hsl(var(--card))' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoices Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Invoices Trend</CardTitle>
            <CardDescription>Invoice volume over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={invoiceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="invoices" fill="#10b981" name="Invoices" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Low Stock Alerts
            </CardTitle>
            <CardDescription>Products that need restocking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.quantity} / {product.min_stock_level} units
                      </p>
                    </div>
                  </div>
                  <button className="text-xs px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 transition">
                    Update
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Info */}
      <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          <Zap className="w-32 h-32 text-primary" />
        </div>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary font-bold">
            <Zap className="w-5 h-5 fill-primary" />
            Infrastructure Plan
          </CardTitle>
          <CardDescription>Scale your business with advanced enterprise features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-tighter">Your active tier</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-black tracking-tight">{subscriptionPlan}</p>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded border border-emerald-500/20 uppercase">Active</span>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard/subscription"
              className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
            >
              Upgrade & Scale
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
