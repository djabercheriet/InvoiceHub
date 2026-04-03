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
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuthUser } from '@/hooks/use-auth-user'
import { createClient } from '@/lib/supabase/client'

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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s your business overview.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalRevenue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From {stats.totalInvoices} invoices
            </p>
          </CardContent>
        </Card>

        {/* Paid Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidInvoices}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {stats.totalInvoices} total
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.productCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {lowStockProducts.length} low stock
            </p>
          </CardContent>
        </Card>

        {/* Active Customers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.customerCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={invoiceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  name="Revenue ($)"
                  strokeWidth={2}
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            Your Subscription
          </CardTitle>
          <CardDescription>Manage your plan and billing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-lg font-semibold">{subscriptionPlan}</p>
            </div>
            <a
              href="/dashboard/subscription"
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Upgrade Plan
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
