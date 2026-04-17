'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, Star, ShieldCheck, Zap, Lock, Mail, Fingerprint, ExternalLink } from 'lucide-react'
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
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
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
              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Password</Label>
                  <Link href="#" className="text-[10px] text-primary hover:text-primary/80 font-black uppercase tracking-widest cursor-pointer">Forgot?</Link>
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
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl">
                <p className="text-[11px] text-destructive font-bold text-center tracking-tight flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5" /> {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-[0.15em] text-[11px] rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 group relative overflow-hidden transition-all active:scale-[0.98] cursor-pointer"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isLoading ? (
                <span className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  Sign In <Fingerprint className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground font-bold tracking-tight">
            Don&apos;t have an account?{' '}
            <Link href="/auth/sign-up" className="text-primary hover:text-primary/80 font-black uppercase tracking-widest ml-2 group cursor-pointer">
              Sign Up <ExternalLink className="inline-block w-3 h-3 ml-1 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual Panel — intentionally dark, like a hero banner */}
      <div className="hidden lg:flex relative bg-[#06060a] overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[40px_40px]" />
        
        <div className="absolute top-1/4 -right-20 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-emerald-600/5 blur-[150px] rounded-full animate-pulse [animation-delay:3s]" />

        <div className="relative z-10 w-full max-w-lg space-y-16 animate-in fade-in zoom-in-95 duration-1000">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">
              <Zap className="w-3 h-3 fill-indigo-400" /> System Integrity Verified
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-white leading-[0.9] uppercase">
              Empower <br /><span className="text-indigo-400">Intelligence.</span>
            </h2>
            <p className="text-lg text-white/50 font-bold tracking-tight max-w-sm leading-relaxed">
              Experience the next generation of <span className="text-white/80">Operational Control</span> designed for high-performance enterprises.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              { icon: ShieldCheck, title: "Military-Grade Security", desc: "End-to-end encryption for total data sovereignty.", color: "text-indigo-400" },
              { icon: Zap, title: "Real-Time Sync", desc: "Live ledger updates across all global locations.", color: "text-emerald-400" }
            ].map((item, i) => (
              <div key={i} className={cn("flex items-start gap-6 p-6 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-3xl hover:border-white/10 transition-colors")}>
                <div className={cn("w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5", item.color)}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-black uppercase tracking-tighter text-base">{item.title}</h4>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-12 border-t border-white/5">
            <div className="flex items-center gap-1.5 mb-6">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-indigo-500 text-indigo-500" />)}
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
