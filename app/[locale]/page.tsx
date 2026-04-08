import { Sparkles, BarChart3, Package, FileText, Users, ArrowRight, Check, Zap, Shield, Globe, TrendingUp, Star, ChevronRight } from 'lucide-react'
import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata = {
  title: "Bntec — The All-in-One Operating System for Modern Businesses",
  description:
    "Streamline your business with Bntec. Create professional invoices, manage inventory, and grow your operations — all in one place.",
};

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const features = [
    {
      icon: FileText,
      title: "Smart Invoicing",
      desc: "Create professional invoices in seconds. Automate reminders, track payments, and get paid faster.",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      icon: Package,
      title: "Inventory Control",
      desc: "Real-time stock tracking with low-inventory alerts. Never oversell or run out of stock again.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      icon: Users,
      title: "Customer CRM",
      desc: "Manage all your clients in one place. Track interactions, history, and outstanding balances.",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20",
    },
    {
      icon: BarChart3,
      title: "Live Analytics",
      desc: "Real-time dashboards with revenue, growth, and performance insights across your entire business.",
      color: "text-orange-500",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      desc: "Bank-grade encryption, role-based access control, and SOC 2 compliance out of the box.",
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
    },
    {
      icon: Globe,
      title: "Multi-Language",
      desc: "Full i18n support with multiple currencies. Serve a global clientele without friction.",
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "29",
      period: "/mo",
      description: "Perfect for freelancers and small teams",
      features: [
        "Up to 100 invoices/month",
        "500 inventory items",
        "5 customers",
        "Email support",
      ],
      cta: "Get Started",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "79",
      period: "/mo",
      description: "For growing businesses that mean business",
      features: [
        "Unlimited invoices",
        "Unlimited inventory",
        "Unlimited customers",
        "Custom reports & analytics",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "Full-scale control for large operations",
      features: [
        "Everything in Professional",
        "Multi-organization support",
        "Dedicated account manager",
        "SLA guarantee",
        "Custom integrations",
      ],
      cta: "Contact Sales",
      highlighted: false,
    },
  ];

  const stats = [
    { value: "12k+", label: "Businesses" },
    { value: "$2.4B", label: "Invoiced" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9★", label: "Rating" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-indigo-500/30">
      <LandingNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] rounded-full bg-purple-600/10 blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] rounded-full bg-blue-600/10 blur-[100px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Trusted by 12,000+ businesses worldwide
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Invoice & Inventory
            <br />
            <span className="bg-linear-to-r from-indigo-600 via-purple-600 to-blue-600 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
              Built for Growth
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Stop juggling spreadsheets. Bntec gives your business a unified
            platform to manage invoices, inventory, and clients — beautifully.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-12 px-8 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 font-semibold transition-all"
              >
                Sign In to Dashboard
              </Button>
            </Link>
          </div>

          {/* Social proof strip */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold tracking-tight text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Tiles */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-4">
              <Zap className="w-3 h-3" />
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to
              <br />
              <span className="text-muted-foreground">run your business</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">
              A complete toolkit designed for modern businesses that want to move fast without breaking things.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative p-6 rounded-2xl border border-border bg-card hover:border-indigo-500/50 transition-all duration-300 cursor-default shadow-sm"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-base mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section id="about" className="py-24 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-6">
                <TrendingUp className="w-3 h-3" />
                Why Bntec
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                Built for the way
                <br />
                <span className="text-indigo-600 dark:text-indigo-500 font-extrabold">modern teams work</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed font-medium mb-8">
                We obsess over performance, simplicity, and reliability. Bntec
                is designed to get out of your way and let you focus on what matters — growing your business.
              </p>
              <div className="space-y-4">
                {[
                  "Set up in under 5 minutes",
                  "Automatic invoice reminders & follow-ups",
                  "Comprehensive reports and analytics",
                  "Multi-currency and multi-language support",
                  "99.9% uptime SLA guarantee",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-600" />
                    </div>
                    <span className="text-muted-foreground text-sm font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl border border-border bg-card p-6 overflow-hidden">
                {/* Glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-600/10 rounded-full blur-[60px]" />

                {/* Mock dashboard card */}
                <div className="space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Revenue Overview</span>
                    <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +24.5%
                    </span>
                  </div>
                  <div className="text-4xl font-bold tracking-tight">$142,580</div>
                  <div className="text-sm text-muted-foreground font-medium">This month</div>

                  {/* Fake bar chart */}
                  <div className="flex items-end gap-2 h-20 mt-4">
                    {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm bg-indigo-500/20" style={{ height: `${h}%` }} />
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { label: "Invoices", val: "248" },
                      { label: "Customers", val: "64" },
                      { label: "Products", val: "312" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl bg-muted/50 border border-border p-3 text-center">
                        <div className="text-lg font-bold">{s.val}</div>
                        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-muted text-muted-foreground text-xs font-semibold uppercase tracking-widest mb-4">
              <Star className="w-3 h-3" />
              Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground text-lg font-medium">
              No surprise fees. No hidden costs. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                  plan.highlighted
                    ? "border-indigo-500/40 bg-indigo-500/5 shadow-2xl shadow-indigo-500/10"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      {plan.price === "Custom" ? plan.price : `$${plan.price}`}
                    </span>
                    {plan.period && <span className="text-muted-foreground text-sm font-medium">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium mt-1">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground font-medium">
                      <Check className={`w-4 h-4 shrink-0 ${plan.highlighted ? "text-indigo-600" : "text-muted-foreground"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={plan.price === "Custom" ? "/auth/login" : "/auth/sign-up"}>
                  <Button
                    className={`w-full font-semibold ${
                      plan.highlighted
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                        : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                    } transition-all`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6 border-t border-border/50">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-indigo-600/5 rounded-3xl blur-3xl opacity-50" />
          <div className="relative rounded-3xl border border-indigo-500/20 bg-indigo-600/5 p-12 text-center overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-linear-to-r from-transparent via-indigo-500 to-transparent" />
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-7 h-7 text-indigo-500" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-muted-foreground font-medium mb-8 max-w-xl mx-auto">
              Join thousands of businesses already using Bntec. Set up your account in minutes.
            </p>
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700 h-13 px-10 text-white font-semibold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all"
              >
                Start for Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground/30 mt-4 font-medium italic">No credit card required · Free 14-day trial</p>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
