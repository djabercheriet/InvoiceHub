import { NextRequest } from 'next/server'
import { adminFetchLicenses, adminCreateLicense, adminUpdateLicenseStatus, adminDeleteLicense } from '@/lib/supabase/admin'
import { getUserContext } from '@/lib/auth/authorization'
import { successResponse, errorResponse, forbiddenResponse } from '@/lib/api/utils'

export async function GET(request: NextRequest) {
  try {
    const context = await getUserContext()
    if (!context?.isSuperAdmin) return forbiddenResponse()

    const { data, error } = await adminFetchLicenses()
    if (error) return errorResponse(error, 500)

    return successResponse(data)
  } catch (error: any) {
    return errorResponse(error.message, 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getUserContext()
    if (!context?.isSuperAdmin) return forbiddenResponse()

    const body = await request.json()
    const { action, payload } = body

    if (action === 'create') {
      const { data, error } = await adminCreateLicense(payload)
      if (error) return errorResponse(error, 500)
      return successResponse(data, 'License created successfully')
    }

    if (action === 'update_status') {
      const { licenseId, status } = payload
      const { data, error } = await adminUpdateLicenseStatus(licenseId, status)
      if (error) return errorResponse(error, 500)
      return successResponse(data, 'License status updated')
    }

    return errorResponse('Invalid action', 400)
  } catch (error: any) {
    return errorResponse(error.message, 500)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const context = await getUserContext()
    if (!context?.isSuperAdmin) return forbiddenResponse()

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return errorResponse('License ID is required', 400)

    const { error } = await adminDeleteLicense(id)
    if (error) return errorResponse(error, 500)

    return successResponse(null, 'License deleted successfully')
  } catch (error: any) {
    return errorResponse(error.message, 500)
  }
}
