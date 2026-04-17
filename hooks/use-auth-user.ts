'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session, AuthChangeEvent } from '@supabase/supabase-js'

interface User {
  id: string
  email: string
  user_metadata?: Record<string, any>
}

/**
 * Hook to get the currently authenticated user
 * Use in client components to access auth state
 */
export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Use getSession() for initial state: reads from cookie/localStorage cache,
    // no network lock required — avoids the "lock not released" Strict Mode warning.
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setUser(session?.user as User || null)
      setLoading(false)
    })

    // Subscribe to auth changes (handles token refresh, sign-in, sign-out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user as User || null)
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return { user, loading, error }
}

/**
 * Hook to access company ID for the current user
 * Returns null if loading or user has no company
 */
export function useCompanyId() {
  const { user, loading } = useAuthUser()
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyLoading, setCompanyLoading] = useState(true)

  useEffect(() => {
    if (loading || !user) {
      setCompanyLoading(loading)
      return
    }

    const loadCompany = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('companies')
        .select('id')
        .eq('user_id', user.id)
        .single()

      setCompanyId(data?.id || null)
      setCompanyLoading(false)
    }

    loadCompany()
  }, [user, loading])

  return { companyId, loading: companyLoading }
}

/**
 * Hook to access user's profile
 */
export function useProfile() {
  const { user, loading } = useAuthUser()
  const [profile, setProfile] = useState<Record<string, any> | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (loading || !user) {
      setProfileLoading(loading)
      return
    }

    const loadProfile = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setProfileLoading(false)
    }

    loadProfile()
  }, [user, loading])

  return { profile, loading: profileLoading }
}
