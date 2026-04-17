import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/** Race auth.getUser() against a timeout so a Supabase network hiccup
 *  never blocks the middleware (and therefore every page) for 30–60 s. */
async function getUserWithTimeout(
  supabase: ReturnType<typeof createServerClient>,
  timeoutMs = 5000
) {
  const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
    setTimeout(() => {
      console.warn(`[Middleware] auth.getUser() timed out after ${timeoutMs}ms — treating as unauthenticated`);
      resolve({ data: { user: null } });
    }, timeoutMs)
  );
  return Promise.race([supabase.auth.getUser(), timeoutPromise]);
}

export async function updateSession(request: NextRequest, response: NextResponse = NextResponse.next({ request })) {
  let supabaseResponse = response

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    },
  )

  console.log('[Middleware] Before auth.getUser()');
  const {
    data: { user },
  } = await getUserWithTimeout(supabase, 5000)
  console.log('[Middleware] After auth.getUser(), user:', !!user);

  const pathname = request.nextUrl.pathname
  const isDashboard = pathname.startsWith('/dashboard') || 
                      pathname.match(/^\/[a-zA-Z]{2}\/dashboard/)
  
  if (isDashboard && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
