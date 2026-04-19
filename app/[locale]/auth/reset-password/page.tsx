'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Lock, ShieldCheck, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const router = useRouter()

  // Supabase sends the user to this page with a token in the URL fragment (#access_token=...)
  // The Supabase client automatically detects this and establishes a session.
  useEffect(() => {
    const supabase = createClient()
    // Check if we have a valid recovery session
    supabase.auth.onAuthStateChange((event: import('@supabase/supabase-js').AuthChangeEvent) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReady(true)
      }
    })
    // Also check if the session is already established (for magic link flows)
    supabase.auth.getSession().then(({ data }: { data: { session: import('@supabase/supabase-js').Session | null } }) => {
      if (data.session) setIsReady(true)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  // Password strength indicator
  const getStrength = (pw: string) => {
    if (pw.length === 0) return { level: 0, label: '', color: '' }
    if (pw.length < 6) return { level: 1, label: 'Weak', color: 'bg-red-500' }
    if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { level: 2, label: 'Fair', color: 'bg-amber-500' }
    return { level: 3, label: 'Strong', color: 'bg-emerald-500' }
  }
  const strength = getStrength(password)

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-lg shadow-primary/10 border border-border p-1 bg-primary/5">
            <img src="/Icon.png" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
          </div>
        </div>

        {success ? (
          /* Success State */
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">
                Password <span className="text-primary">Updated</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium">
                Your password has been changed successfully.
                Redirecting you to the dashboard...
              </p>
            </div>
            <div className="flex justify-center">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          </div>
        ) : (
          /* Form State */
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">
                Set New <span className="text-primary">Password</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium tracking-tight">
                Choose a strong password for your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  New Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    className="h-14 pl-12 pr-12 bg-background border-border hover:border-primary/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all rounded-2xl font-medium shadow-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : 'bg-border'}`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: strength.level === 1 ? '#ef4444' : strength.level === 2 ? '#f59e0b' : '#10b981' }}>
                      {strength.label} password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2.5">
                <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                  Confirm Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className={`h-14 pl-12 bg-background border-border hover:border-primary/30 focus:ring-4 transition-all rounded-2xl font-medium shadow-sm ${
                      confirmPassword && password !== confirmPassword
                        ? 'border-destructive focus:border-destructive focus:ring-destructive/5'
                        : 'focus:border-primary/50 focus:ring-primary/5'
                    }`}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl">
                  <p className="text-[11px] text-destructive font-bold text-center tracking-tight flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5" /> {error}
                  </p>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !isReady}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.15em] text-[11px] rounded-2xl shadow-lg shadow-primary/20 group relative overflow-hidden transition-all active:scale-[0.98] cursor-pointer"
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  <span className="relative z-10">Update Password</span>
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
