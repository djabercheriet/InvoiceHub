'use server'

import { createClient } from '@/lib/supabase/server'
import { enqueue } from '@/lib/jobs/queue'

/**
 * Handles branded client registration
 */
export async function signUpClientAction(formData: { email: string; name: string; password?: string }) {
  const supabase = await createClient()
  
  // 1. Trigger Supabase Sign-Up
  const { data, error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password || Math.random().toString(36).slice(-12), // Fallback to random if empty (for OTP flows)
    options: {
      data: {
        full_name: formData.name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/portal/login`,
    },
  })

  if (error) throw error

  // 2. Enqueue our beautiful Bntec Welcome Email
  // Note: This will be sent in addition to Supabase's confirmation email if confirmation is enabled.
  await enqueue('EMAIL_SEND', {
    template: 'welcome',
    to: formData.email,
    data: {
      userName: formData.name,
    },
  })

  return { success: true, user: data.user }
}

/**
 * Handles password reset requests
 */
export async function resetPasswordAction(email: string) {
  const supabase = await createClient()

  // We use Supabase's built-in recovery for security.
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/portal/update-password`,
  })

  if (error) throw error

  // Optional: Enqueue a notification job if you want to track reset attempts
  
  return { success: true }
}
