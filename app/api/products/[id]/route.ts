/**
 * Single Product API Routes
 * GET /api/products/[id] - Get a specific product
 * PUT /api/products/[id] - Update a product
 * DELETE /api/products/[id] - Delete a product
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
  getProductById,
  updateProduct,
  deleteProduct,
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

    // Get product
    const { data: product, error } = await getProductById(id)

    if (error || !product) {
      return notFoundResponse()
    }

    // Verify ownership
    if (product.company_id !== context.companyId && !context.isSuperAdmin) {
      return forbiddenResponse()
    }

    return successResponse(product)
  } catch (error) {
    console.error('Error in GET /api/products/[id]:', error)
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

    // Get product first
    const { data: product, error: fetchError } = await getProductById(id)

    if (fetchError || !product) {
      return notFoundResponse()
    }

    // Verify ownership
    if (product.company_id !== context.companyId && !context.isSuperAdmin) {
      return forbiddenResponse()
    }

    // Parse request body
    const body = await request.json()

    // Update product
    const { data: updated, error } = await updateProduct(id, body)

    if (error) {
      console.error('Error updating product:', error)
      return errorResponse('Failed to update product', 500)
    }

    return successResponse(updated, 'Product updated successfully')
  } catch (error) {
    console.error('Error in PUT /api/products/[id]:', error)
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

    // Get product first
    const { data: product, error: fetchError } = await getProductById(id)

    if (fetchError || !product) {
      return notFoundResponse()
    }

    // Verify ownership
    if (product.company_id !== context.companyId && !context.isSuperAdmin) {
      return forbiddenResponse()
    }

    // Delete product
    const { error } = await deleteProduct(id)

    if (error) {
      console.error('Error deleting product:', error)
      return errorResponse('Failed to delete product', 500)
    }

    return successResponse({ id }, 'Product deleted successfully')
  } catch (error) {
    console.error('Error in DELETE /api/products/[id]:', error)
    return errorResponse('Internal server error', 500)
  }
}
