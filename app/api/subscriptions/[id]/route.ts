/**
 * Subscriptions API Routes
 * GET /api/subscriptions - Get current subscription
 * PUT /api/subscriptions/[id] - Update subscription (upgrade plan)
 * DELETE /api/subscriptions/[id] - Cancel subscription
 */

import { NextRequest } from 'next/server'
import {
  validateAuth,
  validateOwnerOrAdmin,
  successResponse,
  errorResponse,
  forbiddenResponse,
  notFoundResponse,
} from '@/lib/api/utils'
import { upgradeSubscription, cancelSubscription, getCompanySubscription } from '@/lib/supabase/database'
import { createClient } from '@/lib/supabase/server'

interface Params {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/subscriptions
 * Get current user's subscription
 */
export async function GET(request: NextRequest) {
  try {
    const context = await validateAuth(request)
    if (!context || !context.companyId) {
      return forbiddenResponse()
    }

    // Get subscription
    const { data: subscription, error } = await getCompanySubscription(
      context.companyId
    )

    if (error) {
      return errorResponse('Failed to fetch subscription', 500)
    }

    if (!subscription) {
      return notFoundResponse()
    }

    return successResponse(subscription)
  } catch (error) {
    console.error('Error in GET /api/subscriptions:', error)
    return errorResponse('Internal server error', 500)
  }
}

/**
 * PUT /api/subscriptions/[id]
 * Upgrade subscription to a different plan
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const context = await validateOwnerOrAdmin(request)
    if (!context || !context.companyId) {
      return forbiddenResponse()
    }

    const { id } = await params

    // Get subscription first
    const supabase = await createClient()
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('company_id')
      .eq('id', id)
      .single()

    if (fetchError || !subscription) {
      return notFoundResponse()
    }

    // Verify ownership
    if (subscription.company_id !== context.companyId && !context.isSuperAdmin) {
      return forbiddenResponse()
    }

    // Parse request body
    const body = await request.json()
    const { plan_id } = body

    if (!plan_id) {
      return errorResponse('Plan ID is required', 400)
    }

    // Upgrade subscription
    const { data: updated, error } = await upgradeSubscription(id, plan_id)

    if (error) {
      console.error('Error upgrading subscription:', error)
      return errorResponse('Failed to upgrade subscription', 500)
    }

    return successResponse(updated, 'Subscription upgraded successfully')
  } catch (error) {
    console.error('Error in PUT /api/subscriptions/[id]:', error)
    return errorResponse('Internal server error', 500)
  }
}

/**
 * DELETE /api/subscriptions/[id]
 * Cancel subscription
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const context = await validateOwnerOrAdmin(request)
    if (!context || !context.companyId) {
      return forbiddenResponse()
    }

    const { id } = await params

    // Get subscription first
    const supabase = await createClient()
    const { data: subscription, error: fetchError } = await supabase
      .from('subscriptions')
      .select('company_id')
      .eq('id', id)
      .single()

    if (fetchError || !subscription) {
      return notFoundResponse()
    }

    // Verify ownership
    if (subscription.company_id !== context.companyId && !context.isSuperAdmin) {
      return forbiddenResponse()
    }

    // Cancel subscription
    const { data: updated, error } = await cancelSubscription(id)

    if (error) {
      console.error('Error canceling subscription:', error)
      return errorResponse('Failed to cancel subscription', 500)
    }

    return successResponse(updated, 'Subscription canceled successfully')
  } catch (error) {
    console.error('Error in DELETE /api/subscriptions/[id]:', error)
    return errorResponse('Internal server error', 500)
  }
}
