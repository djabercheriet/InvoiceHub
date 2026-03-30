/**
 * API Route Utilities
 * Provides common response formatting and error handling for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getUserContext } from '@/lib/auth/authorization'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  )
}

/**
 * Error response
 */
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

/**
 * Unauthorized response
 */
export function unauthorizedResponse(): NextResponse<ApiResponse> {
  return errorResponse('Unauthorized', 401)
}

/**
 * Forbidden response
 */
export function forbiddenResponse(): NextResponse<ApiResponse> {
  return errorResponse('Forbidden', 403)
}

/**
 * Not found response
 */
export function notFoundResponse(): NextResponse<ApiResponse> {
  return errorResponse('Not found', 404)
}

/**
 * Validate authorization for route
 * Returns user context if authorized, null if not
 */
export async function validateAuth(request: NextRequest) {
  const context = await getUserContext()
  
  if (!context) {
    return null
  }

  return context
}

/**
 * Validate that user belongs to company
 */
export async function validateCompanyAccess(
  request: NextRequest,
  companyId: string
) {
  const context = await getUserContext()

  if (!context) {
    return null
  }

  if (!context.isSuperAdmin && context.companyId !== companyId) {
    return null
  }

  return context
}

/**
 * Validate that user is owner or admin
 */
export async function validateOwnerOrAdmin(request: NextRequest) {
  const context = await getUserContext()

  if (!context) {
    return null
  }

  if (context.role !== 'owner' && context.role !== 'admin' && !context.isSuperAdmin) {
    return null
  }

  return context
}
