'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuthUser } from './use-auth-user'

export interface Plan {
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

export interface Subscription {
  id: string
  status: string
  subscription_type: 'monthly' | 'yearly'
  current_period_start: string
  current_period_end: string
  is_trial_active: boolean
  trial_end_date: string
  plan: Plan
}

export interface Usage {
  invoices: number
  customers: number
  products: number
  users: number
}

export function useSubscription() {
  const { user } = useAuthUser()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [usage, setUsage] = useState<Usage>({
    invoices: 0,
    customers: 0,
    products: 0,
    users: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchSubscription = async () => {
      try {
        setLoading(true)
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

        // Get subscription
        const { data: sub, error: subError } = await supabase
          .from('subscriptions')
          .select(
            `
            id,
            status,
            subscription_type,
            current_period_start,
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
          .eq('company_id', profile.company_id)
          .single()

        if (subError) {
          setError(subError)
          setLoading(false)
          return
        }

        const subData = sub as any
        const planData = Array.isArray(subData.plan) ? subData.plan[0] : subData.plan
        setSubscription({
          ...subData,
          plan: planData,
        } as any)

        // Get usage
        const { data: usageData } = await supabase
          .from('subscription_usage')
          .select('metric_name, current_usage')
          .eq('subscription_id', sub.id)

        if (usageData) {
          const usageMap = Object.fromEntries(
            usageData.map((u) => [u.metric_name, u.current_usage])
          )
          setUsage({
            invoices: usageMap.invoices || 0,
            customers: usageMap.customers || 0,
            products: usageMap.products || 0,
            users: usageMap.users || 0,
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  return { subscription, usage, loading, error }
}

export function useCanCreateResource(resource: 'invoices' | 'customers' | 'products' | 'users'): {
  allowed: boolean
  current: number
  limit: number
} {
  const { subscription, usage } = useSubscription()

  if (!subscription) {
    return { allowed: false, current: 0, limit: 0 }
  }

  const limitKey = `max_${resource}` as keyof Plan
  const limit = subscription.plan[limitKey] as number
  const current = usage[resource as keyof Usage] as number

  // 0 means unlimited
  const allowed = limit === 0 || current < limit

  return { allowed, current, limit }
}
