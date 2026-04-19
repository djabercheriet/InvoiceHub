import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// This route handles the OAuth callback from Google (and other providers)
// Supabase redirects here after the user authorizes, then we exchange the code for a session
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redirect to the dashboard (or wherever `next` points)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If something went wrong, redirect to login with an error
  return NextResponse.redirect(`${origin}/auth/login?error=oauth_error`)
}
