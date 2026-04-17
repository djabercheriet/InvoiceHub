'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Globe, Rocket, Users, ShieldCheck, Mail, Lock, User, Building, Heart, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Page() {
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, company_name: companyName },
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
        },
      })
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
      <div className="flex flex-col items-center justify-center p-8 lg:p-12 relative z-10 overflow-y-auto border-r border-border/50">
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
            <Link href="/pricing" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-all cursor-pointer">Pricing</Link>
            <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(99,102,241,0.6)]" />
          </div>
        </div>

        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 py-20">
          {/* Logo + Title */}
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-3xl overflow-hidden shadow-lg shadow-primary/10 border border-border p-1 bg-primary/5">
                <img src="/Icon.png" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase">
                Create Your <span className="text-primary">Account</span>
              </h1>
              <p className="text-muted-foreground text-sm font-medium tracking-tight">
                Join our global business platform and scale your operations.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="grid gap-5">
              {/* Name + Company */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="fullName"
                      placeholder="John Smith"
                      required
                      className="h-14 pl-12 bg-secondary/30 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl font-medium"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Company Name</Label>
                  <div className="relative group">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="companyName"
                      placeholder="Acme Global"
                      className="h-14 pl-12 bg-secondary/30 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl font-medium"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    required
                    className="h-14 pl-12 bg-secondary/30 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Password</Label>
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
                <div className="space-y-2">
                  <Label htmlFor="repeat-password" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Confirm Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      className="h-14 pl-12 bg-secondary/30 border-border focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all rounded-2xl font-medium"
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl">
                <p className="text-[11px] text-destructive font-bold text-center tracking-tight">{error}</p>
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
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  Create Account <Rocket className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground font-bold tracking-tight">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:text-primary/80 font-black uppercase tracking-widest ml-2 group cursor-pointer">
              Sign In <ExternalLink className="inline-block w-3 h-3 ml-1 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </p>
        </div>
      </div>

      {/* Right Column: Visual Panel — intentionally dark hero panel */}
      <div className="hidden lg:flex relative bg-[#06060a] overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff06_1px,transparent_1px)] bg-size-[20px_20px]" />

        <div className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full animate-pulse [animation-delay:3s]" />

        <div className="relative z-10 w-full max-w-lg space-y-16 animate-in fade-in zoom-in-95 duration-1000">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              Global Network Active
            </div>
            <h2 className="text-6xl font-black tracking-tighter text-white leading-[0.9] uppercase">
              Scale Your <br /><span className="text-indigo-400">Operation.</span>
            </h2>
            <p className="text-lg text-white/50 font-bold tracking-tight max-w-sm leading-relaxed">
              Everything you need to dominate your vertical, unified into a single <span className="text-white/80">platform</span>.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Globe, title: "Universal Ledger", desc: "Native multi-currency support with real-time exchange validation.", color: "text-indigo-400" },
              { icon: Users, title: "Advanced Permissions", desc: "Granular access controls for complex organizational hierarchies.", color: "text-purple-400" },
              { icon: ShieldCheck, title: "Sovereign Compliance", desc: "Automated local and international tax logic built into the core.", color: "text-emerald-400" }
            ].map((item, i) => (
              <div key={i} className={cn("flex items-start gap-6 p-6 rounded-3xl bg-white/2 border border-white/5 backdrop-blur-3xl hover:border-white/10 transition-all duration-500")}>
                <div className={cn("w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5", item.color)}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-white font-black uppercase tracking-tighter text-base">{item.title}</h4>
                  <p className="text-white/40 text-[13px] font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 rounded-3xl bg-indigo-600/5 border border-indigo-500/10 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
              <Heart className="w-20 h-20 text-indigo-500" />
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#06060a] bg-linear-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-[11px] font-black text-white uppercase">
                    A{i}
                  </div>
                ))}
              </div>
              <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest pl-2 border-l border-white/10 ml-2">Verified Founders</span>
            </div>
            <p className="text-white/50 font-medium text-sm leading-relaxed relative z-10">
              &ldquo;Deploying InvoicesHub allowed us to centralize 14 disparate global nodes into a single source of truth. The speed alone saved our team hours weekly.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
