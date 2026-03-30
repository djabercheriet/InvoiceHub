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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Subscription & Billing</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription plan and view your usage limits
        </p>
      </div>

      {/* Current Plan Status */}
      {subscription && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  Current Plan: {currentPlan?.name}
                </CardTitle>
                <CardDescription className="mt-2">
                  {subscription.status === 'trial' && (
                    <>
                      Your trial expires on{' '}
                      {new Date(
                        subscription.trial_end_date
                      ).toLocaleDateString()}
                    </>
                  )}
                  {subscription.status === 'active' && (
                    <>
                      Renews on{' '}
                      {new Date(
                        subscription.current_period_end
                      ).toLocaleDateString()}{' '}
                      ({subscription.subscription_type})
                    </>
                  )}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">
                  {subscription.subscription_type === 'monthly'
                    ? `$${currentPlan?.monthly_price}`
                    : `$${currentPlan?.yearly_price}`}
                  <span className="text-sm text-muted-foreground">
                    /{subscription.subscription_type === 'monthly' ? 'month' : 'year'}
                  </span>
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Usage Section */}
      {currentPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Usage & Limits</CardTitle>
            <CardDescription>Your current usage against plan limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  name: 'Invoices',
                  key: 'invoices',
                  limit: currentPlan.max_invoices,
                },
                {
                  name: 'Customers',
                  key: 'customers',
                  limit: currentPlan.max_customers,
                },
                {
                  name: 'Products',
                  key: 'products',
                  limit: currentPlan.max_products,
                },
                { name: 'Users', key: 'users', limit: currentPlan.max_users },
              ].map((item) => {
                const current = usageMap[item.key] || 0
                const limit = item.limit || 0
                const unlimited = limit === 0
                const percentage = unlimited ? 100 : (current / limit) * 100

                return (
                  <div key={item.key}>
                    <div className="flex justify-between items-center mb-2">
                      <label className="font-medium">{item.name}</label>
                      <span className="text-sm text-muted-foreground">
                        {current} {unlimited ? '/ Unlimited' : `/ ${limit}`}
                      </span>
                    </div>
                    {!unlimited && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            percentage > 90
                              ? 'bg-red-500'
                              : percentage > 70
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  isCurrentPlan ? 'ring-2 ring-blue-500 border-blue-500' : ''
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                    Current Plan
                  </div>
                )}

                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div>
                    <div className="text-3xl font-bold">
                      ${plan.monthly_price}
                      <span className="text-sm text-muted-foreground">/month</span>
                    </div>
                    {plan.yearly_price && (
                      <p className="text-sm text-muted-foreground mt-1">
                        or ${plan.yearly_price}/year
                      </p>
                    )}
                  </div>

                  {/* Limits */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        {plan.max_invoices === 0
                          ? 'Unlimited'
                          : plan.max_invoices}{' '}
                        invoices
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        {plan.max_customers === 0
                          ? 'Unlimited'
                          : plan.max_customers}{' '}
                        customers
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        {plan.max_products === 0
                          ? 'Unlimited'
                          : plan.max_products}{' '}
                        products
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm">
                        Up to {plan.max_users} users
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    {Object.entries(plan.features || {}).map(
                      ([feature, enabled]) =>
                        enabled && (
                          <div key={feature} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="capitalize">
                              {feature
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (l) =>
                                  l.toUpperCase()
                                )}
                            </span>
                          </div>
                        )
                    )}
                  </div>

                  {/* Button */}
                  {isCurrentPlan ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading}
                      variant={
                        plan.monthly_price > 0 ? 'default' : 'outline'
                      }
                    >
                      {upgrading ? 'Upgrading...' : 'Choose Plan'}
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
