'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Star, ShieldCheck, Zap, Lock, Mail, Fingerprint, ExternalLink, Rocket, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    const supabase = createClient()
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full lg:grid lg:grid-cols-2 overflow-hidden bg-background">
      {/* Left Column: Form Section */}
      <div className="flex flex-col items-center justify-center p-8 lg:p-12 relative z-10 border-r border-border/50">
        {/* Top Navigation */}
        <div className="absolute top-8 left-8 right-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/help" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all cursor-pointer">Support</Link>
            <Link href="/status" className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500/70 hover:text-emerald-500 transition-all flex items-center gap-1.5 cursor-pointer">
              <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </Link>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Logo + Title */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-4xl overflow-hidden shadow-lg shadow-primary/10 border border-border p-1 bg-primary/5 relative group">
                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-4xl" />
                <img src="/Icon.png" alt="Logo" className="w-full h-full object-cover rounded-[1.8rem] relative z-10" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
                Welcome <span className="text-primary">Back</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium tracking-tight">
                Sign in to access your <span className="text-foreground font-bold">InvoicesHub</span> workspace.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-5">
              {/* Email */}
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    autoFocus
                    className="h-14 pl-12 bg-secondary/30 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Security Protocol</Label>
                  <Link href="/auth/reset" className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors">Recover Keys?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    required
                    className="h-14 pl-12 bg-secondary/30 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl animate-in fade-in zoom-in-95">
                <p className="text-[11px] text-destructive font-bold text-center tracking-tight">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <Button
                type="submit"
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.15em] text-[11px] rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 group relative overflow-hidden transition-all active:scale-[0.98] cursor-pointer"
                disabled={isLoading}
              >
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isLoading ? (
                  <span className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    Authorize Access <Rocket className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50"></span>
                </div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em]">
                  <span className="bg-background px-4 text-muted-foreground/60 italic">Or External Gateway</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                className="w-full h-14 bg-secondary/30 border-border/50 hover:bg-secondary/50 text-foreground font-black uppercase tracking-[0.15em] text-[11px] rounded-2xl shadow-sm group transition-all active:scale-[0.98] cursor-pointer"
                disabled={isLoading}
              >
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                    />
                  </svg>
                  Continue with Google
                </span>
              </Button>
            </div>
          </form>

          <p className="text-center text-xs text-muted-foreground font-bold tracking-tight">
            New operative?{' '}
            <Link href="/auth/sign-up" className="text-primary hover:text-primary/80 font-black uppercase tracking-widest ml-2 group cursor-pointer">
              Create Account <ExternalLink className="inline-block w-3 h-3 ml-1 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual Panel */}
      <div className="hidden lg:flex relative bg-[#06060a] overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[40px_40px]" />
        
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-emerald-600/5 blur-[150px] rounded-full animate-pulse [animation-delay:3s]" />

        <div className="relative z-10 w-full max-w-lg space-y-16 animate-in fade-in zoom-in-95 duration-1000">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-surface-alpha border border-white/5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              Global Ledger Active
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-white leading-[0.9] uppercase">
              Secure Your <br /><span className="text-primary">Financials.</span>
            </h2>
            <p className="text-lg text-white/50 font-bold tracking-tight max-w-sm leading-relaxed">
              Precision metrics and automated reconciliation for the modern <span className="text-white/80">enterprise</span>.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Globe, title: "Universal Sync", desc: "Cross-border transaction mapping with real-time liquidity reporting.", color: "text-primary" },
              { icon: ShieldCheck, title: "Vault Security", desc: "Military-grade encryption for all sensitive organizational assets.", color: "text-emerald-400" },
              { icon: Zap, title: "Edge Performance", desc: "Optimized for sub-millisecond data retrieval across global nodes.", color: "text-amber-400" }
            ].map((item, i) => (
              <div key={i} className={cn("flex items-start gap-6 p-6 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-3xl hover:border-white/10 transition-all duration-500")}>
                <div className={cn("w-12 h-12 rounded-2xl bg-surface-alpha flex items-center justify-center shrink-0 border border-white/5", item.color)}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-black uppercase tracking-tighter text-base">{item.title}</h4>
                  <p className="text-white/40 text-[13px] font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-12 border-t border-white/5">
            <div className="flex items-center gap-1.5 mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />)}
            </div>
            <p className="text-white/50 font-medium text-sm leading-relaxed max-w-md">
              &ldquo;The migration to InvoicesHub reduced our operational overhead by 42% in the first quarter. Absolute game changer.&rdquo;
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/20" />
              <div>
                <p className="text-white font-black uppercase tracking-tighter text-xs">Director of Operations</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60">Nexus Logistics Group</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
