import { updateSession } from '@/lib/supabase/middleware'
import { type NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from '@/i18n/config'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed'
})

export async function proxy(request: NextRequest) {
  console.log('[Proxy] Started for:', request.nextUrl.pathname);
  // First, run the next-intl middleware to handle localization
  const intlResponse = intlMiddleware(request)

  console.log('[Proxy] intlMiddleware done');

  // Then, pass this response to the Supabase middleware to handle auth
  const res = await updateSession(request, intlResponse)
  console.log('[Proxy] updateSession done');
  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
