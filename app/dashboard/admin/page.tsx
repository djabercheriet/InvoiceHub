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
import { TrendingUp, Users, Package, DollarSign, AlertCircle } from 'lucide-react'
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

  useEffect(() => {
    // Check if user is super admin
    const checkAccess = async () => {
      if (!user) return

      const supabase = await createClient()
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // If not super admin, redirect to regular dashboard
      if (profile?.role !== 'super_admin' && user.user_metadata?.role !== 'super_admin') {
        router.push('/dashboard')
      }
    }

    checkAccess()
  }, [user, router])

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

          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_id!inner(name)')
            .eq('company_id', company.id)
            .single()

          const planName =
            typeof subscription?.plan_id === 'object' && subscription.plan_id !== null
              ? (subscription.plan_id as { name?: string }).name
              : undefined

          const revenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

          companiesStats.push({
            id: company.id,
            name: company.name,
            customers: customersCount || 0,
            invoices: invoices?.length || 0,
            revenue,
            products: productsCount || 0,
            plan: planName || 'Free',
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          System overview and company management
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalCompanies}</div>
            <p className="text-xs text-muted-foreground mt-1">Active organizations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalStats.totalRevenue.toLocaleString('en-US', {
                minimumFractionDigits: 0,
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">All companies combined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">Upgraded plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Free Plans</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.trialUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Basic plan users</p>
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
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Company Name</th>
                  <th className="text-left py-3 px-4">Plan</th>
                  <th className="text-right py-3 px-4">Customers</th>
                  <th className="text-right py-3 px-4">Invoices</th>
                  <th className="text-right py-3 px-4">Revenue</th>
                  <th className="text-right py-3 px-4">Products</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{company.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          company.plan === 'Free'
                            ? 'bg-gray-100 text-gray-800'
                            : company.plan === 'Pro'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {company.plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{company.customers}</td>
                    <td className="py-3 px-4 text-right">{company.invoices}</td>
                    <td className="py-3 px-4 text-right">
                      ${company.revenue.toLocaleString('en-US', {
                        minimumFractionDigits: 0,
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">{company.products}</td>
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
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plan Distribution</CardTitle>
            <CardDescription>Companies by plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: 'Free',
                      value: totalStats.trialUsers,
                    },
                    {
                      name: 'Paid',
                      value: totalStats.activeSubscriptions,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#ef4444" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Company */}
        <Card>
          <CardHeader>
            <CardTitle>Top Companies by Revenue</CardTitle>
            <CardDescription>Best performing companies</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={companies
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 10)}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
