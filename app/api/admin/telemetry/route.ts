import { NextRequest } from 'next/server'
import { adminFetchTelemetry } from '@/lib/supabase/admin'
import { getUserContext } from '@/lib/auth/authorization'
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api/utils'

export async function GET(request: NextRequest) {
  try {
    const context = await getUserContext()
    if (!context?.isSuperAdmin) return forbiddenResponse()

    const { data, error } = await adminFetchTelemetry()
    if (error) return errorResponse(error, 500)

    return successResponse(data)
  } catch (error: any) {
    return errorResponse(error.message, 500)
  }
}
