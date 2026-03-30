/**
 * Single Customer API Routes
 * GET /api/customers/[id] - Get a specific customer
 * PUT /api/customers/[id] - Update a customer
 * DELETE /api/customers/[id] - Delete a customer
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
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from '@/lib/supabase/database'

interface Params {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const context = await validateAuth(request)
    if (!context || !context.companyId) {
      return forbiddenResponse()
    }

    const { id } = await params

    // Get customer
    const { data: customer, error } = await getCustomerById(id)

    if (error || !customer) {
      return notFoundResponse()
    }

    // Verify ownership
    if (customer.company_id !== context.companyId && !context.isSuperAdmin) {
      return forbiddenResponse()
    }

    return successResponse(customer)
  } catch (error) {
    console.error('Error in GET /api/customers/[id]:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const context = await validateOwnerOrAdmin(request)
    if (!context || !context.companyId) {
      return forbiddenResponse()
    }

    const { id } = await params

    // Get customer first
    const { data: customer, error: fetchError } = await getCustomerById(id)

    if (fetchError || !customer) {
      return notFoundResponse()
    }

    // Verify ownership
    if (customer.company_id !== context.companyId && !context.isSuperAdmin) {
      return forbiddenResponse()
    }

    // Parse request body
    const body = await request.json()

    // Update customer
    const { data: updated, error } = await updateCustomer(id, body)

    if (error) {
      console.error('Error updating customer:', error)
      return errorResponse('Failed to update customer', 500)
    }

    return successResponse(updated, 'Customer updated successfully')
  } catch (error) {
    console.error('Error in PUT /api/customers/[id]:', error)
    return errorResponse('Internal server error', 500)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const context = await validateOwnerOrAdmin(request)
    if (!context || !context.companyId) {
      return forbiddenResponse()
    }

    const { id } = await params

    // Get customer first
    const { data: customer, error: fetchError } = await getCustomerById(id)

    if (fetchError || !customer) {
      return notFoundResponse()
    }

    // Verify ownership
    if (customer.company_id !== context.companyId && !context.isSuperAdmin) {
      return forbiddenResponse()
    }

    // Delete customer
    const { error } = await deleteCustomer(id)

    if (error) {
      console.error('Error deleting customer:', error)
      return errorResponse('Failed to delete customer', 500)
    }

    return successResponse({ id }, 'Customer deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/customers/[id]:', error)
    return errorResponse('Internal server error', 500)
  }
}
