'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, AlertCircle, Zap, ShieldCheck, CreditCard, Activity, ArrowUpRight, Lock, Crown, Info, Users, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthUser } from '@/hooks/use-auth-user'
import { createClient } from '@/lib/supabase/client'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

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
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-white/5 rounded-xl mb-8" />
        <div className="h-64 bg-white/5 rounded-4xl" />
        <div className="grid grid-cols-3 gap-8">
           <div className="h-96 bg-white/5 rounded-[2.5rem]" />
           <div className="h-96 bg-white/5 rounded-[2.5rem]" />
           <div className="h-96 bg-white/5 rounded-[2.5rem]" />
        </div>
      </div>
    )
  }

  const currentPlan = subscription?.plan
  const usageMap = Object.fromEntries(usage.map((u) => [u.metric_name, u.current_usage]))

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/60 pb-8">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-primary" />
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground font-medium">
            Manage your subscription ecosystem and resource allocation.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            Protocol Encrypted
          </div>
        </div>
      </div>

      {/* Hero Status Card */}
      {subscription && (
        <Card className="glass-dashboard border-2 border-indigo-500/20 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 pointer-events-none">
            <Crown className="w-64 h-64 text-indigo-500" />
          </div>
          <CardHeader className="p-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-lg border border-indigo-500/30">
                  Current Deployment
                </div>
                <div className="space-y-2">
                  <h2 className="text-6xl font-black tracking-tighter text-white uppercase italic">
                    {currentPlan?.name} <span className="text-indigo-500">Tier</span>
                  </h2>
                  <div className="flex items-center gap-4 text-muted-foreground font-bold">
                    {subscription.status === 'trial' ? (
                       <span className="text-amber-500 flex items-center gap-2 bg-amber-500/5 px-2 py-1 rounded-lg border border-amber-500/10 text-xs" suppressHydrationWarning>
                         <AlertCircle className="w-4 h-4" />
                         Trial period active until {new Date(subscription.trial_end_date).toLocaleDateString()}
                       </span>
                    ) : (
                      <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/5 text-xs" suppressHydrationWarning>
                        <Activity className="w-4 h-4 text-emerald-500" />
                        Next cycle synchronizes on {new Date(subscription.current_period_end).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-auto p-8 rounded-4xl bg-white/2 border border-white/5 backdrop-blur-md relative overflow-hidden group/price">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent opacity-0 group-hover/price:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10 text-center lg:text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-2">Cycle Contribution</p>
                  <div className="text-6xl font-black text-white tracking-tighter">
                    ${subscription.subscription_type === 'monthly' ? currentPlan?.monthly_price : currentPlan?.yearly_price}
                    <span className="text-lg text-muted-foreground/40 ml-2">/ {subscription.subscription_type === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-2">{subscription.subscription_type?.toUpperCase()} PROTOCOL</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Allocation Monitoring */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-8 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
             <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">Resource Telemetry</h2>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            <Info className="w-3.5 h-3.5" /> Quotas reset monthly
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Invoices', key: 'invoices', limit: currentPlan?.max_invoices, icon: CreditCard },
            { name: 'Customers', key: 'customers', limit: currentPlan?.max_customers, icon: Users },
            { name: 'Global Catalog', key: 'products', limit: currentPlan?.max_products, icon: Package },
            { name: 'Operator Base', key: 'users', limit: currentPlan?.max_users, icon: ShieldCheck },
          ].map((item) => {
            const current = usageMap[item.key] || 0
            const limit = item.limit || 0
            const unlimited = limit === 0
            const percentage = unlimited ? 0 : (current / limit) * 100

            return (
              <Card key={item.key} className="glass-dashboard border-white/5 hover:border-indigo-500/20 transition-all duration-500 overflow-hidden">
                <CardContent className="p-6 pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10 text-muted-foreground">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">Usage</span>
                      <span className="text-xl font-black text-white tracking-tighter">
                        {current} <span className="text-xs text-muted-foreground/30">/ {unlimited ? '∞' : limit}</span>
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em]">
                       <span className="text-muted-foreground/60">{item.name} Load</span>
                       <span className={cn(percentage > 85 ? "text-rose-400" : "text-indigo-400")}>{Math.round(percentage)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/3 rounded-full overflow-hidden border border-white/5">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000 ease-out shadow-[0_0_10px]",
                          percentage > 90 ? 'bg-rose-500 shadow-rose-500/20' : percentage > 70 ? 'bg-amber-500 shadow-amber-500/20' : 'bg-indigo-500 shadow-indigo-500/20'
                        )}
                        style={{ width: `${unlimited ? 10 : Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Pricing Grid - High End */}
      <div className="space-y-12 pt-10">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] rounded-full border border-indigo-500/20 mb-4">
             Scale your intelligence
          </div>
          <h2 className="text-6xl font-black tracking-tighter text-white uppercase italic">Available <span className="text-indigo-500">Service Tiers</span></h2>
          <p className="text-lg text-muted-foreground font-bold tracking-tight px-10">Select the cognitive load and resource density required for your organization's objectives.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch max-w-7xl mx-auto px-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.id === plan.id
            const isPro = plan.name === 'Pro'

            return (
              <Card
                key={plan.id}
                className={cn(
                  "flex flex-col transition-all duration-700 relative overflow-hidden group/plan border-2",
                  isCurrentPlan 
                    ? 'bg-indigo-500/5 border-indigo-500/40 shadow-[0_0_50px_rgba(99,102,241,0.15)] scale-105 z-10' 
                    : 'glass-dashboard border-white/5 hover:border-white/20 hover:-translate-y-2'
                )}
              >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover/plan:opacity-[0.1] transition-opacity duration-700">
                    <Zap className={cn("w-32 h-32", isCurrentPlan ? "text-indigo-400" : "text-white")} />
                </div>

                {isCurrentPlan && (
                  <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-xl animate-pulse">
                    <Check className="w-3 h-3" /> Active Infrastructure
                  </div>
                )}

                <CardHeader className="pt-16 pb-10 text-center relative z-10">
                  <CardTitle className="text-4xl font-black tracking-tighter text-white uppercase italic">{plan.name}</CardTitle>
                  <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-10 flex-1 relative z-10">
                  <div className="text-center">
                    <div className="text-6xl font-black text-white tracking-tighter inline-flex items-baseline">
                      ${plan.monthly_price}
                      <span className="text-sm text-muted-foreground/40 font-black uppercase tracking-widest ml-3">/mo</span>
                    </div>
                  </div>

                  <div className="space-y-6 pt-10 border-t border-white/5">
                    <div className="grid gap-4">
                      {[
                        { label: 'Invoices', value: plan.max_invoices, icon: CreditCard },
                        { label: 'Customers', value: plan.max_customers, icon: Users },
                        { label: 'Global Catalog', value: plan.max_products, icon: Package },
                        { label: 'Operator Base', value: plan.max_users, icon: ShieldCheck },
                      ].map((limit) => (
                        <div key={limit.label} className="flex items-center gap-4 group/item">
                          <div className={cn("p-2 rounded-xl border border-white/5 flex items-center justify-center transition-all", isCurrentPlan ? "bg-indigo-500/10 border-indigo-500/20" : "bg-white/5")}>
                            <Check className={cn("w-3 h-3", isCurrentPlan ? "text-indigo-400" : "text-muted-foreground")} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-white uppercase tracking-tight">{limit.value === 0 ? 'Unlimited Capacity' : `${limit.value} Unit Load`}</span>
                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">{limit.label} Allocation</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {Object.entries(plan.features || {}).length > 0 && (
                      <div className="space-y-4 pt-6 border-t border-white/5">
                        <p className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-[0.3em]">Operational Modules</p>
                        <div className="grid gap-3">
                          {Object.entries(plan.features || {}).map(([feature, enabled]) => 
                            enabled && (
                              <div key={feature} className="flex items-center gap-3">
                                <div className="w-1 h-1 rounded-full bg-indigo-500/40" />
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter">{feature.replace(/_/g, ' ')}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-6 pb-12 px-8 relative z-10">
                  {isCurrentPlan ? (
                    <Button className="w-full h-16 bg-white/5 text-muted-foreground font-black tracking-[0.2em] text-[10px] rounded-2xl border border-white/5 opacity-50 cursor-not-allowed" disabled>
                      ESTABLISHED CONNECTION
                    </Button>
                  ) : (
                    <Button
                      className={cn(
                        "w-full h-16 font-black tracking-[0.2em] text-[10px] rounded-2xl transition-all duration-500 group relative overflow-hidden uppercase",
                        plan.name === 'Enterprise' 
                          ? 'bg-white text-black hover:bg-white/90 shadow-[0_0_30px_rgba(255,255,255,0.1)]' 
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                      )}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={upgrading}
                    >
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                         {upgrading ? 'SYNCHRONIZING...' : `UPGRADE TO ${plan.name} OS`}
                         <ArrowUpRight className="w-4 h-4" />
                      </span>
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

