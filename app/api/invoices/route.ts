/**
 * Invoices API Routes
 * GET /api/invoices - List all invoices for the user's company
 * POST /api/invoices - Create a new invoice
 */

import { NextRequest } from 'next/server'
import {
  validateAuth,
  validateOwnerOrAdmin,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
} from '@/lib/api/utils'
import {
  getInvoices,
  createInvoice,
} from '@/lib/supabase/database'
import { checkLimit, incrementUsage } from '@/lib/auth/authorization'

export async function GET(request: NextRequest) {
  try {
    // Validate auth
    const context = await validateAuth(request)
    if (!context || !context.companyId) {
      return unauthorizedResponse()
    }

    // Get invoices
    const { data: invoices, error } = await getInvoices(context.companyId)

    if (error) {
      return errorResponse('Failed to fetch invoices', 500)
    }

    return successResponse(invoices || [])
  } catch (error) {
    console.error('Error in GET /api/invoices:', error)
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
    const { allowed, current, limit } = await checkLimit('invoices')
    if (!allowed) {
      return errorResponse(
        `Invoice limit reached (${current}/${limit}). Please upgrade your plan.`,
        402
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      customer_id,
      issue_date,
      due_date,
      subtotal,
      tax_amount,
      discount_amount,
      total,
      notes,
      status,
    } = body

    // Generate invoice number
    const timestamp = Date.now()
    const invoiceNumber = `INV-${context.companyId.substring(0, 8)}-${timestamp}`

    // Create invoice
    const { data: invoice, error } = await createInvoice(
      context.companyId,
      context.userId,
      {
        customer_id,
        invoice_number: invoiceNumber,
        issue_date: issue_date || new Date().toISOString().split('T')[0],
        due_date,
        subtotal,
        tax_amount,
        discount_amount,
        total,
        notes,
        status: status || 'draft',
      }
    )

    if (error) {
      console.error('Error creating invoice:', error)
      return errorResponse('Failed to create invoice', 500)
    }

    // Increment usage
    await incrementUsage('invoices', 1)

    return successResponse(invoice, 'Invoice created successfully', 201)
  } catch (error) {
    console.error('Error in POST /api/invoices:', error)
    return errorResponse('Internal server error', 500)
  }
}
