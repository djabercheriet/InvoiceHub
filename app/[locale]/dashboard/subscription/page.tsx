'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, AlertCircle, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthUser } from '@/hooks/use-auth-user'
import { createClient } from '@/lib/supabase/client'

interface Plan {
  id: string
  name: string
  description: string
  monthly_price: number
  yearly_price: number
  max_invoices: number
  max_customers: number
  max_products: number
  max_users: number
  features: Record<string, boolean>
}

interface Subscription {
  id: string
  status: string
  subscription_type: 'monthly' | 'yearly'
  current_period_end: string
  is_trial_active: boolean
  trial_end_date: string
  plan: Plan
}

interface Usage {
  metric_name: string
  current_usage: number
}

export default function SubscriptionPage() {
  const { user, loading: authLoading } = useAuthUser()
  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage[]>([])
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        const supabase = await createClient()

        // Get user's company
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single()

        if (!profile?.company_id) {
          setLoading(false)
          return
        }

        const companyId = profile.company_id

        // Get all plans
        const { data: allPlans, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('monthly_price', { ascending: true })

        if (!plansError && allPlans) {
          setPlans(allPlans)
        }

        // Get current subscription
        const { data: currentSub, error: subError } = await supabase
          .from('subscriptions')
          .select(
            `
            id,
            status,
            subscription_type,
            current_period_end,
            is_trial_active,
            trial_end_date,
            plan:plan_id (
              id,
              name,
              description,
              monthly_price,
              yearly_price,
              max_invoices,
              max_customers,
              max_products,
              max_users,
              features
            )
          `
          )
          .eq('company_id', companyId)
          .single()

        if (!subError && currentSub) {
          const sub = currentSub as any
          const planData = Array.isArray(sub.plan) ? sub.plan[0] : sub.plan
          setSubscription({
            ...sub,
            plan: planData,
          } as any)
        }

        // Get usage
        const { data: usageData } = await supabase
          .from('subscription_usage')
          .select('metric_name, current_usage')
          .eq(
            'subscription_id',
            currentSub?.id || ''
          )

        if (usageData) {
          setUsage(usageData)
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const handleUpgrade = async (planId: string) => {
    if (!subscription) return

    try {
      setUpgrading(true)

      // Call upgrade API
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_id: planId }),
      })

      if (!response.ok) {
        throw new Error('Failed to upgrade plan')
      }

      toast.success('Plan upgraded successfully!')
      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error('Error upgrading plan:', error)
      toast.error('Failed to upgrade plan')
    } finally {
      setUpgrading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="space-y-8">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  const currentPlan = subscription?.plan
  const usageMap = Object.fromEntries(
    usage.map((u) => [u.metric_name, u.current_usage])
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Subscription & Billing</h1>
          <p className="text-muted-foreground mt-1">
            Manage your subscription tier and track workspace usage.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest">
          Secure Billing
        </div>
      </div>

      {/* Current Plan Status */}
      {subscription && (
        <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-32 h-32 text-primary" />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <CardTitle className="flex items-center gap-2 text-primary font-black text-xl">
                  <Zap className="w-5 h-5 fill-primary" />
                  {currentPlan?.name} Tier
                </CardTitle>
                <CardDescription className="mt-1 font-medium italic">
                  {subscription.status === 'trial' && (
                    <span className="text-amber-600">
                      Trial period ends {new Date(subscription.trial_end_date).toLocaleDateString()}
                    </span>
                  )}
                  {subscription.status === 'active' && (
                    <span className="text-muted-foreground">
                      Next billing cycle: {new Date(subscription.current_period_end).toLocaleDateString()} ({subscription.subscription_type})
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black tracking-tighter">
                  {subscription.subscription_type === 'monthly'
                    ? `$${currentPlan?.monthly_price}`
                    : `$${currentPlan?.yearly_price}`}
                  <span className="text-xs text-muted-foreground font-medium lowercase tracking-normal">
                    /{subscription.subscription_type === 'monthly' ? 'mo' : 'yr'}
                  </span>
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Usage Section */}
      {currentPlan && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Workspace Resources</CardTitle>
            <CardDescription>Real-time consumption vs plan allocations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {[
                { name: 'Invoices', key: 'invoices', limit: currentPlan.max_invoices },
                { name: 'Customers', key: 'customers', limit: currentPlan.max_customers },
                { name: 'Products', key: 'products', limit: currentPlan.max_products },
                { name: 'Users', key: 'users', limit: currentPlan.max_users },
              ].map((item) => {
                const current = usageMap[item.key] || 0
                const limit = item.limit || 0
                const unlimited = limit === 0
                const percentage = unlimited ? 0 : (current / limit) * 100

                return (
                  <div key={item.key} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{item.name}</label>
                      <span className="text-xs font-bold font-mono">
                        {current} <span className="text-muted-foreground font-medium">/ {unlimited ? '∞' : limit}</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-accent rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${
                          percentage > 90 ? 'bg-destructive' : percentage > 70 ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${unlimited ? 0 : Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black tracking-tight">Expand Your Scalability</h2>
          <p className="text-muted-foreground">Professional features to accelerate your business operations.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id
            const isPro = plan.name === 'Pro'

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  isCurrentPlan ? 'border-primary ring-1 ring-primary shadow-lg' : 'border-border/50'
                } ${isPro && !isCurrentPlan ? 'scale-105 z-10 border-indigo-500/50 shadow-indigo-500/5' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Active Tier
                  </div>
                )}
                {isPro && !isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Recommended
                  </div>
                )}

                <CardHeader className="text-center pt-10">
                  <CardTitle className="text-2xl font-black tracking-tighter">{plan.name}</CardTitle>
                  <CardDescription className="text-xs font-medium px-4">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-8 flex-1">
                  <div className="text-center">
                    <div className="text-4xl font-black tracking-tighter">
                      ${plan.monthly_price}
                      <span className="text-xs font-medium text-muted-foreground tracking-normal block mt-1">per workspace / mo</span>
                    </div>
                  </div>

                  <div className="space-y-4 py-4 border-y border-border/50">
                    <div className="space-y-3">
                      {[
                        { label: 'Invoices', value: plan.max_invoices },
                        { label: 'Customers', value: plan.max_customers },
                        { label: 'Products', value: plan.max_products },
                        { label: 'Platform Users', value: plan.max_users },
                      ].map((limit) => (
                        <div key={limit.label} className="flex items-center gap-3">
                          <div className="p-1 bg-emerald-500/10 rounded-full">
                            <Check className="w-3 h-3 text-emerald-600" />
                          </div>
                          <p className="text-xs font-bold">
                            {limit.value === 0 ? 'Unlimited' : limit.value} <span className="text-muted-foreground font-medium">{limit.label}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3 pt-3 border-t border-border/50">
                      {Object.entries(plan.features || {}).map(
                        ([feature, enabled]) =>
                          enabled && (
                            <div key={feature} className="flex items-center gap-3">
                              <div className="p-1 bg-blue-500/10 rounded-full">
                                <Check className="w-3 h-3 text-blue-600" />
                              </div>
                              <p className="text-xs font-medium text-foreground italic capitalize">
                                {feature.replace(/_/g, ' ')}
                              </p>
                            </div>
                          )
                      )}
                    </div>
                  </div>

                  {isCurrentPlan ? (
                    <Button className="w-full h-12 bg-muted text-muted-foreground font-black uppercase tracking-widest" disabled>
                      Your Current Plan
                    </Button>
                  ) : (
                    <Button
                      className={`w-full h-12 font-black uppercase tracking-widest transition-all ${
                        isPro ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20 shadow-lg' : 'bg-primary hover:bg-primary/90'
                      }`}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading}
                    >
                      {upgrading ? 'Processing...' : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Need Help?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Have questions about our plans or need to manage your subscription?
          </p>
          <div className="flex gap-4">
            <Link href="/support" className="text-blue-600 hover:underline text-sm">
              Contact Support
            </Link>
            <Link href="/docs/pricing" className="text-blue-600 hover:underline text-sm">
              View Pricing Guide
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
