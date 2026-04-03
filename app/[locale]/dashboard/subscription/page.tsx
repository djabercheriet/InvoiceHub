'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, AlertCircle, Zap, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthUser } from '@/hooks/use-auth-user'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('Subscription')
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
          setPlans(allPlans as Plan[])
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
      const response = await fetch(`/api/subscriptions/${subscription.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan_id: planId }),
      })

      if (!response.ok) throw new Error('Failed to upgrade plan')

      toast.success(t('success') || 'Plan upgraded successfully!')
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
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-10 w-48 bg-muted rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="h-96 bg-muted rounded-xl" />
           <div className="h-96 bg-muted rounded-xl" />
           <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  const currentPlan = subscription?.plan
  const usageMap = Object.fromEntries(usage.map((u) => [u.metric_name, u.current_usage]))

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 p-4 lg:p-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground mt-2 font-medium">{t('description')}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-500/20 uppercase tracking-widest shadow-lg shadow-emerald-500/5 pulse">
          <ShieldCheck className="w-4 h-4" />
          {t('secureBilling')}
        </div>
      </div>

      {/* Current Plan Status */}
      {subscription && (
        <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden relative group border-2">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-48 h-48 text-primary" />
          </div>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-6">
              <div>
                <CardTitle className="flex items-center gap-3 text-primary font-black text-3xl tracking-tighter">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Zap className="w-6 h-6 fill-primary" />
                  </div>
                  {currentPlan?.name} {t('activeTier')}
                </CardTitle>
                <CardDescription className="mt-3 font-medium italic text-sm">
                  {subscription.status === 'trial' && (
                    <span className="text-amber-600 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {t('trialEnds', { date: new Date(subscription.trial_end_date).toLocaleDateString() })}
                    </span>
                  )}
                  {subscription.status === 'active' && (
                    <span className="text-muted-foreground">
                      {t('nextBilling', { 
                        date: new Date(subscription.current_period_end).toLocaleDateString(),
                        type: subscription.subscription_type 
                      })}
                    </span>
                  )}
                </CardDescription>
              </div>
              <div className="text-left md:text-right">
                <p className="text-5xl font-black tracking-tighter">
                  {subscription.subscription_type === 'monthly'
                    ? `$${currentPlan?.monthly_price}`
                    : `$${currentPlan?.yearly_price}`}
                  <span className="text-xs text-muted-foreground font-bold lowercase tracking-widest block mt-1">
                    PER {subscription.subscription_type === 'monthly' ? 'MONTH' : 'YEAR'}
                  </span>
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Resource Allocation */}
      {currentPlan && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-1">
             <div className="w-1 h-6 bg-primary rounded-full" />
             <h2 className="text-xl font-black tracking-tight">{t('resources')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: 'Invoices', key: 'invoices', limit: currentPlan.max_invoices },
              { name: 'Customers', key: 'customers', limit: currentPlan.max_customers },
              { name: 'Products', key: 'products', limit: currentPlan.max_products },
              { name: 'Platform Users', key: 'users', limit: currentPlan.max_users },
            ].map((item) => {
              const current = usageMap[item.key] || 0
              const limit = item.limit || 0
              const unlimited = limit === 0
              const percentage = unlimited ? 0 : (current / limit) * 100

              return (
                <Card key={item.key} className="bg-muted/30 border-none shadow-none">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-end mb-3">
                      <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{item.name}</label>
                      <span className="text-xs font-black font-mono">
                        {current} <span className="text-muted-foreground font-medium">/ {unlimited ? '∞' : limit}</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${
                          percentage > 90 ? 'bg-destructive' : percentage > 70 ? 'bg-amber-500' : 'bg-primary'
                        }`}
                        style={{ width: `${unlimited ? 10 : Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Pricing Grids */}
      <div className="space-y-8 pt-4">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-4xl font-black tracking-tighter">{t('expandScalability')}</h2>
          <p className="text-muted-foreground font-medium">{t('professionalFeatures')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-8">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id
            const isPro = plan.name === 'Pro'

            return (
              <Card
                key={plan.id}
                className={`flex flex-col transition-all duration-500 relative ${
                  isCurrentPlan ? 'border-primary border-4 shadow-2xl scale-105' : 'border-border/50 hover:border-primary/30'
                } ${isPro && !isCurrentPlan ? 'border-2 border-indigo-500/20 bg-indigo-500/5' : 'bg-card'}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ring-4 ring-background">
                    {t('currentPlan')}
                  </div>
                )}
                {isPro && !isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ring-4 ring-background">
                    {t('recommended')}
                  </div>
                )}

                <CardHeader className="text-center pt-12">
                  <CardTitle className="text-3xl font-black tracking-tighter uppercase">{plan.name}</CardTitle>
                  <CardDescription className="text-xs font-semibold px-6 leading-relaxed italic">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-8 flex-1">
                  <div className="text-center py-4 bg-muted/20 rounded-2xl">
                    <div className="text-5xl font-black tracking-tighter">
                      ${plan.monthly_price}
                      <span className="text-[10px] font-black text-muted-foreground tracking-widest block mt-2 uppercase">WORKSPACE / MONTH</span>
                    </div>
                  </div>

                  <div className="space-y-4 py-8 border-y border-border/50">
                    <div className="space-y-4">
                      {[
                        { label: 'Invoices', value: plan.max_invoices },
                        { label: 'Customers', value: plan.max_customers },
                        { label: 'Products', value: plan.max_products },
                        { label: 'Users', value: plan.max_users },
                      ].map((limit) => (
                        <div key={limit.label} className="flex items-center gap-4">
                          <div className={`p-1.5 rounded-lg ${isCurrentPlan ? 'bg-primary/10' : 'bg-emerald-500/10'}`}>
                            <Check className={`w-3.5 h-3.5 ${isCurrentPlan ? 'text-primary' : 'text-emerald-600'}`} />
                          </div>
                          <p className="text-xs font-black uppercase tracking-tighter">
                            {limit.value === 0 ? 'Unlimited' : limit.value} <span className="text-muted-foreground font-medium lowercase tracking-normal ml-1">{limit.label}</span>
                          </p>
                        </div>
                      ))}
                    </div>

                    {Object.entries(plan.features || {}).length > 0 && (
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        {Object.entries(plan.features || {}).map(([feature, enabled]) => 
                          enabled && (
                            <div key={feature} className="flex items-center gap-4">
                              <div className="p-1.5 bg-blue-500/10 rounded-lg">
                                <Check className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              <p className="text-[10px] font-bold text-foreground italic capitalize tracking-tight">
                                {feature.replace(/_/g, ' ')}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-8 px-6">
                  {isCurrentPlan ? (
                    <Button className="w-full h-14 bg-muted text-muted-foreground font-black uppercase tracking-widest text-xs rounded-xl" disabled>
                      {t('currentPlan')}
                    </Button>
                  ) : (
                    <Button
                      className={`w-full h-14 font-black uppercase tracking-widest text-xs rounded-xl transition-all shadow-xl shadow-opacity-20 ${
                        isPro 
                          ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30' 
                          : 'bg-primary hover:bg-primary/90 shadow-primary/30'
                      }`}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading}
                    >
                      {upgrading ? 'SYNCING...' : t('upgradeTo', { plan: plan.name })}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

