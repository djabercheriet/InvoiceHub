'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-8">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Back */}
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all group cursor-pointer">
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Login
        </Link>

        {/* Logo + Title */}
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-lg shadow-primary/10 border border-border p-1 bg-primary/5">
              <img src="/Icon.png" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
            </div>
          </div>
          {sent ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                </div>
              </div>
              <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">
                Check Your <span className="text-primary">Email</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                We sent a password reset link to{' '}
                <span className="text-foreground font-bold">{email}</span>.
                Check your inbox (and spam folder).
              </p>
              <p className="text-xs text-muted-foreground/70 font-medium">
                The link expires in <span className="font-bold text-muted-foreground">1 hour</span>.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <h1 className="text-3xl font-black tracking-tighter text-foreground uppercase">
                Reset Your <span className="text-primary">Password</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium tracking-tight">
                Enter your email and we&apos;ll send you a secure reset link.
              </p>
            </div>
          )}
        </div>

        {!sent && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                Email Address
              </Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  autoFocus
                  className="h-14 pl-12 bg-background border-border hover:border-primary/30 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all rounded-2xl font-medium shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
              disabled={isLoading}
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.15em] text-[11px] rounded-2xl shadow-lg shadow-primary/20 group relative overflow-hidden transition-all active:scale-[0.98] cursor-pointer"
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="relative z-10">Send Reset Link</span>
              )}
            </Button>
          </form>
        )}

        {sent && (
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setSent(false); setEmail('') }}
              className="w-full h-12 rounded-2xl border-border font-bold cursor-pointer"
            >
              Try a different email
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Remembered your password?{' '}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-black cursor-pointer">Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
