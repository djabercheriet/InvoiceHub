/**
 * Customers API Routes
 * GET /api/customers - List all customers for the user's company
 * POST /api/customers - Create a new customer
 */

import { NextRequest } from 'next/server'
import {
  validateAuth,
  validateCompanyAccess,
  validateOwnerOrAdmin,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api/utils'
import {
  getCustomers,
  createCustomer,
} from '@/lib/supabase/database'
import { checkLimit, incrementUsage } from '@/lib/auth/authorization'

export async function GET(request: NextRequest) {
  try {
    // Validate auth
    const context = await validateAuth(request)
    if (!context || !context.companyId) {
      return unauthorizedResponse()
    }

    // Get customers
    const { data: customers, error } = await getCustomers(context.companyId)

    if (error) {
      return errorResponse('Failed to fetch customers', 500)
    }

    return successResponse(customers || [])
  } catch (error) {
    console.error('Error in GET /api/customers:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate auth and ownership
    const context = await validateOwnerOrAdmin(request)
    if (!context || !context.companyId) {
      return forbiddenResponse()
    }

    // Check limit
    const { allowed, current, limit } = await checkLimit('customers')
    if (!allowed) {
      return errorResponse(
        `Customer limit reached (${current}/${limit}). Please upgrade your plan.`,
        402
      )
    }

    // Parse request body
    const body = await request.json()
    const { name, email, phone, address, tax_number, notes } = body

    // Validate required fields
    if (!name) {
      return errorResponse('Customer name is required', 400)
    }

    // Create customer
    const { data: customer, error } = await createCustomer(context.companyId, {
      name,
      email,
      phone,
      address,
      tax_number,
      notes,
    })

    if (error) {
      console.error('Error creating customer:', error)
      return errorResponse('Failed to create customer', 500)
    }

    // Increment usage
    await incrementUsage('customers', 1)

    return successResponse(customer, 'Customer created successfully', 201)
  } catch (error) {
    console.error('Error in POST /api/customers:', error)
    return errorResponse('Internal server error', 500)
  }
}
