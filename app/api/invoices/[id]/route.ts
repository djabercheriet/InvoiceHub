/**
 * Single Invoice API Routes
 * GET /api/invoices/[id] - Get a specific invoice
 * PUT /api/invoices/[id] - Update an invoice
 * DELETE /api/invoices/[id] - Delete an invoice
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
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
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

    // Get invoice
    const { data: invoice, error } = await getInvoiceById(id)

    if (error || !invoice) {
      return notFoundResponse()
    }

    // Verify ownership
    if (invoice.company_id !== context.companyId && !context.isSuperAdmin) {
      return forbiddenResponse()
    }

    return successResponse(invoice)
  } catch (error) {
    console.error('Error in GET /api/invoices/[id]:', error)
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

    // Get invoice first
    const { data: invoice, error: fetchError } = await getInvoiceById(id)

    if (fetchError || !invoice) {
      return notFoundResponse()
    }

    // Verify ownership
    if (invoice.company_id !== context.companyId && !context.isSuperAdmin) {
      return forbiddenResponse()
    }

    // Parse request body
    const body = await request.json()

    // Update invoice
    const { data: updated, error } = await updateInvoice(id, body)

    if (error) {
      console.error('Error updating invoice:', error)
      return errorResponse('Failed to update invoice', 500)
    }

    return successResponse(updated, 'Invoice updated successfully')
  } catch (error) {
    console.error('Error in PUT /api/invoices/[id]:', error)
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

    // Get invoice first
    const { data: invoice, error: fetchError } = await getInvoiceById(id)

    if (fetchError || !invoice) {
      return notFoundResponse()
    }

    // Verify ownership
    if (invoice.company_id !== context.companyId && !context.isSuperAdmin) {
      return forbiddenResponse()
    }

    // Delete invoice
    const { error } = await deleteInvoice(id)

    if (error) {
      console.error('Error deleting invoice:', error)
      return errorResponse('Failed to delete invoice', 500)
    }

    return successResponse({ id }, 'Invoice deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/invoices/[id]:', error)
    return errorResponse('Internal server error', 500)
  }
}
