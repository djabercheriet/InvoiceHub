/**
 * Admin Companies API Routes for Super Admin
 * GET /api/admin/companies - List all companies
 * POST /api/admin/companies - Create a new company (for super admin)
 * GET /api/admin/companies/[id] - Get specific company details
 * PUT /api/admin/companies/[id] - Update company (for super admin)
 * DELETE /api/admin/companies/[id] - Delete company (for super admin)
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserContext } from '@/lib/auth/authorization'

export async function GET(request: NextRequest) {
  try {
    const context = await getUserContext()
    
    // Only super admin can access
    if (!context?.isSuperAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Forbidden: Super admin access required' 
        },
        { status: 403 }
      )
    }

    const supabase = await createClient()
    
    const { data: companies, error } = await supabase
      .from('companies')
      .select(`
        *,
        profiles:user_id (
          id,
          email,
          full_name,
          role
        ),
        subscriptions:companys_subscription_id_fkey (
          id,
          status,
          plan:plan_id (
            name,
            monthly_price,
            yearly_price
          )
        ),
        customers:customers!customers_company_id_fkey (
          count
        ),
        products:products!products_company_id_fkey (
          count
        ),
        invoices:invoices!invoices_company_id_fkey (
          count,
          total
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching companies:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch companies' },
        { status: 500 }
      )
    }

    // Format the data
    const formattedCompanies = companies?.map(company => ({
      id: company.id,
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      currency: company.currency,
      tax_rate: company.tax_rate,
      created_at: company.created_at,
      updated_at: company.updated_at,
      user: {
        id: company.profiles?.id,
        email: company.profiles?.email,
        full_name: company.profiles?.full_name,
        role: company.profiles?.role
      },
      subscription: company.subscriptions?.[0] ? {
        id: company.subscriptions[0].id,
        status: company.subscriptions[0].status,
        plan_name: company.subscriptions[0].plan?.name,
        monthly_price: company.subscriptions[0].plan?.monthly_price,
        yearly_price: company.subscriptions[0].plan?.yearly_price
      } : null,
      stats: {
        customers_count: company.customers?.[0]?.count || 0,
        products_count: company.products?.[0]?.count || 0,
        invoices_count: company.invoices?.[0]?.count || 0,
        total_revenue: company.invoices?.reduce((sum: number, inv: any) => sum + (inv.total || 0), 0) || 0
      }
    })) || []

    return NextResponse.json({ success: true, data: formattedCompanies })
  } catch (error) {
    console.error('Error in GET /api/admin/companies:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const context = await getUserContext()
    
    // Only super admin can create companies
    if (!context?.isSuperAdmin) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Forbidden: Super admin access required' 
        },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, email, phone, address, user_id, currency = 'USD', tax_rate = 0 } = body

    // Validate required fields
    if (!name || !user_id) {
      return NextResponse.json(
        { success: false, error: 'Name and user ID are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Create company
    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        name,
        email,
        phone,
        address,
        user_id,
        currency,
        tax_rate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating company:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create company' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        success: true, 
        data: company,
        message: 'Company created successfully' 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error in POST /api/admin/companies:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}