/**
 * Authorization Utilities
 * Provides role-based and subscription-based access control
 */

import { createClient } from '@/lib/supabase/server'

export type UserRole = 'owner' | 'admin' | 'staff' | 'super_admin'

export interface UserContext {
  userId: string
  email: string
  role: UserRole
  companyId: string | null
  isSuperAdmin: boolean
}

/**
 * Get the current user's context including role and company
 */
export async function getUserContext(): Promise<UserContext | null> {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    // Check if super admin (check custom claims or metadata)
    const isSuperAdmin =
      user.user_metadata?.role === 'super_admin' ||
      user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL

    // Get user profile with role and company
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // Super admin might not have a profile
      if (isSuperAdmin) {
        return {
          userId: user.id,
          email: user.email || '',
          role: 'super_admin',
          companyId: null,
          isSuperAdmin: true,
        }
      }
      return null
    }

    return {
      userId: user.id,
      email: user.email || '',
      role: (profile.role || 'staff') as UserRole,
      companyId: profile.company_id,
      isSuperAdmin,
    }
  } catch (error) {
    console.error('Error getting user context:', error)
    return null
  }
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const context = await getUserContext()
  return context?.isSuperAdmin ?? false
}

/**
 * Check if user is owner or admin of their company
 */
export async function isOwnerOrAdmin(): Promise<boolean> {
  const context = await getUserContext()
  if (!context) {
    return false
  }
  return (
    context.role === 'owner' ||
    context.role === 'admin' ||
    context.isSuperAdmin
  )
}

/**
 * Check if user belongs to a specific company
 */
export async function belongsToCompany(companyId: string): Promise<boolean> {
  const context = await getUserContext()
  if (!context) {
    return false
  }
  return (context.companyId === companyId || context.isSuperAdmin) ?? false
}

/**
 * Get company ID for current user
 */
export async function getCurrentCompanyId(): Promise<string | null> {
  const context = await getUserContext()
  return context?.companyId ?? null
}

/**
 * Get current user's subscription plan
 */
export async function getUserSubscription() {
  try {
    const supabase = await createClient()
    const context = await getUserContext()

    if (!context?.companyId) {
      return null
    }

    const { data, error } = await supabase
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
      .eq('company_id', context.companyId)
      .single()

    if (error) {
      console.error('Error fetching subscription:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in getUserSubscription:', error)
    return null
  }
}

/**
 * Check if feature is available in user's subscription
 */
export async function hasFeature(featureName: string): Promise<boolean> {
  const subscription = await getUserSubscription()

  if (!subscription) {
    return false
  }

  // Check if feature is in the plan's features
  const features = (subscription.plan as any)?.features || {}
  return features[featureName] === true
}

/**
 * Check if user has reached a limit
 */
export async function checkLimit(
  metric: 'invoices' | 'customers' | 'products' | 'users'
): Promise<{
  allowed: boolean
  current: number
  limit: number
}> {
  try {
    const supabase = await createClient()
    const context = await getUserContext()

    if (!context?.companyId) {
      return { allowed: false, current: 0, limit: 0 }
    }

    // Get subscription with usage
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select(
        `
        id,
        plan:plan_id (
          max_invoices,
          max_customers,
          max_products,
          max_users
        )
      `
      )
      .eq('company_id', context.companyId)
      .single()

    if (subError || !subscription) {
      return { allowed: false, current: 0, limit: 0 }
    }

    // Get usage for this metric
    const { data: usage, error: usageError } = await supabase
      .from('subscription_usage')
      .select('current_usage')
      .eq('subscription_id', subscription.id)
      .eq('metric_name', metric)
      .single()

    const plan = subscription.plan as any
    const limitKey = `max_${metric}` as string
    const planLimit = (plan?.[limitKey] as number) || 0
    const currentUsage = usage?.current_usage || 0

    // 0 means unlimited
    const allowed = planLimit === 0 || currentUsage < planLimit

    return {
      allowed,
      current: currentUsage,
      limit: planLimit,
    }
  } catch (error) {
    console.error('Error checking limit:', error)
    return { allowed: false, current: 0, limit: 0 }
  }
}

/**
 * Increment usage counter
 */
export async function incrementUsage(
  metric: 'invoices' | 'customers' | 'products' | 'users',
  amount: number = 1
): Promise<boolean> {
  try {
    const supabase = await createClient()
    const context = await getUserContext()

    if (!context?.companyId) {
      return false
    }

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('company_id', context.companyId)
      .single()

    if (!subscription) {
      return false
    }

    // Increment usage
    await supabase.rpc('increment_usage', {
      p_subscription_id: subscription.id,
      p_metric_name: metric,
      p_amount: amount,
    })

    return true
  } catch (error) {
    console.error('Error incrementing usage:', error)
    return false
  }
}
