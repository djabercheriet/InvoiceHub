import { NextRequest } from 'next/server'
import { adminRevokeActivation } from '@/lib/supabase/admin'
import { getUserContext } from '@/lib/auth/authorization'
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api/utils'

export async function POST(request: NextRequest) {
  try {
    const context = await getUserContext()
    if (!context?.isSuperAdmin) return forbiddenResponse()

    const body = await request.json()
    const { activationId } = body

    if (!activationId) {
      return errorResponse('activationId is required', 400)
    }

    const { success, error } = await adminRevokeActivation(activationId)
    
    if (!success || error) {
      return errorResponse(error || 'Failed to revoke activation', 500)
    }

    return successResponse(null, 'Activation revoked successfully')
  } catch (error: any) {
    return errorResponse(error.message, 500)
  }
}
