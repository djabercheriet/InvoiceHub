/**
 * Products API Routes
 * GET /api/products - List all products for the user's company
 * POST /api/products - Create a new product
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
  getProducts,
  createProduct,
} from '@/lib/supabase/database'
import { checkLimit, incrementUsage } from '@/lib/auth/authorization'

export async function GET(request: NextRequest) {
  try {
    // Validate auth
    const context = await validateAuth(request)
    if (!context || !context.companyId) {
      return unauthorizedResponse()
    }

    // Get products
    const { data: products, error } = await getProducts(context.companyId)

    if (error) {
      return errorResponse('Failed to fetch products', 500)
    }

    return successResponse(products || [])
  } catch (error) {
    console.error('Error in GET /api/products:', error)
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
    const { allowed, current, limit } = await checkLimit('products')
    if (!allowed) {
      return errorResponse(
        `Product limit reached (${current}/${limit}). Please upgrade your plan.`,
        402
      )
    }

    // Parse request body
    const body = await request.json()
    const {
      name,
      sku,
      description,
      category_id,
      unit_price,
      cost_price,
      quantity,
      min_stock_level,
      image_url,
    } = body

    // Validate required fields
    if (!name || unit_price === undefined) {
      return errorResponse('Product name and price are required', 400)
    }

    // Create product
    const { data: product, error } = await createProduct(context.companyId, {
      name,
      sku,
      description,
      category_id,
      unit_price,
      cost_price,
      quantity,
      min_stock_level,
      image_url,
      is_active: true,
    })

    if (error) {
      console.error('Error creating product:', error)
      return errorResponse('Failed to create product', 500)
    }

    // Increment usage
    await incrementUsage('products', 1)

    return successResponse(product, 'Product created successfully', 201)
  } catch (error) {
    console.error('Error in POST /api/products:', error)
    return errorResponse('Internal server error', 500)
  }
}
