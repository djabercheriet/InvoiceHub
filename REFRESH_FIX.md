# Auto-Refresh Fix Guide

## Issue Summary
The app auto-refreshes due to multiple factors:

1. **Development Mode HMR** - Expected in dev, won't happen in production
2. **Supabase auth token refresh** - Can cause re-renders
3. **Manual window.location.reload()** - In subscription page
4. **Aggressive data fetching** - Refetches on every user change

## Solutions

### 1. Optimize Auth Hook (hooks/use-auth-user.ts)
```typescript
// Add memoization to prevent unnecessary re-renders
import { useMemo } from 'react'

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data, error }) => {
      if (error) {
        setError(error)
        setLoading(false)
        return
      }
      setUser(data.user as User || null)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only update if user actually changed
      setUser(prev => {
        const newUser = session?.user as User || null
        if (prev?.id === newUser?.id) return prev
        return newUser
      })
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Memoize to prevent reference changes
  return useMemo(() => ({ user, loading, error }), [user, loading, error])
}
```

### 2. Replace window.location.reload() with Router Refresh
```typescript
// In app/dashboard/subscription/page.tsx
import { useRouter } from 'next/navigation'

export default function SubscriptionPage() {
  const router = useRouter()
  
  const handleUpgrade = async () => {
    // ... upgrade logic
    // Instead of: window.location.reload()
    router.refresh() // Soft refresh - faster and smoother
  }
}
```

### 3. Optimize Dashboard Data Fetching
```typescript
// In app/dashboard/page.tsx
useEffect(() => {
  if (!user?.id) return // Check specific property instead of whole object
  
  const fetchData = async () => {
    // ... fetch logic
  }
  fetchData()
}, [user?.id]) // Only refetch when user ID changes, not whole user object
```

### 4. Add Stale-While-Revalidate Pattern
```typescript
// Use React Query or SWR for better caching
import useSWR from 'swr'

export default function DashboardPage() {
  const { user } = useAuthUser()
  
  const { data: stats, isLoading } = useSWR(
    user ? `/api/stats/${user.id}` : null,
    fetcher,
    {
      refreshInterval: 60000, // Only refresh every 60 seconds
      revalidateOnFocus: false, // Don't refetch on tab focus
    }
  )
}
```

## Testing in Production

Build and test production behavior:
```bash
pnpm build
pnpm start
```

Production build disables HMR and optimizes React renders.

## Quick Check

Is this only happening in development?
- If YES: This is normal HMR behavior
- If NO: Apply the fixes above

## Root Cause Priority
1. 🟢 **Development HMR** - Expected, ignore
2. 🟡 **Auth state changes** - Optimize with memoization  
3. 🔴 **window.location.reload()** - Replace with router.refresh()
4. 🟡 **Excessive re-renders** - Optimize dependencies
