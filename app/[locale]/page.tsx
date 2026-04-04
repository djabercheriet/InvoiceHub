import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  Package,
  FileText,
  Users,
  ArrowRight,
  Check,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Star,
  ChevronRight,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "InvoiceHub — Invoice & Inventory Management Platform",
  description:
    "Streamline your business with InvoiceHub. Create professional invoices, manage inventory, and grow your operations — all in one place.",
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
    <div className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <FileText className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">InvoiceHub</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 font-medium"
              >
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button
                size="sm"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/40"
              >
                Get Started <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 text-center overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px]" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[300px] rounded-full bg-purple-600/8 blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] rounded-full bg-blue-600/8 blur-[100px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Trusted by 12,000+ businesses worldwide
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
            Invoice & Inventory
            <br />
            <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Built for Growth
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Stop juggling spreadsheets. InvoiceHub gives your business a unified
            platform to manage invoices, inventory, and clients — beautifully.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-12 px-8 shadow-xl shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 border-white/15 text-white/80 hover:bg-white/5 hover:text-white font-semibold transition-all"
              >
                Sign In to Dashboard
              </Button>
            </Link>
          </div>

          {/* Social proof strip */}
          <div className="mt-14 flex flex-wrap justify-center gap-8 md:gap-16">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold tracking-tight text-white">{s.value}</div>
                <div className="text-sm text-white/40 font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Tiles */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">
              <Zap className="w-3 h-3" />
              Features
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Everything you need to
              <br />
              <span className="text-white/40">run your business</span>
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto font-medium">
              A complete toolkit designed for modern businesses that want to move fast without breaking things.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all duration-300 cursor-default"
              >
                <div className={`w-10 h-10 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-4`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-base mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed font-medium">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section id="about" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/50 text-xs font-semibold uppercase tracking-widest mb-6">
                <TrendingUp className="w-3 h-3" />
                Why InvoiceHub
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
                Built for the way
                <br />
                <span className="text-indigo-400">modern teams work</span>
              </h2>
              <p className="text-white/40 text-lg leading-relaxed font-medium mb-8">
                We obsess over performance, simplicity, and reliability. InvoiceHub
                is designed to get out of your way and let you focus on what matters — growing your business.
              </p>
              <div className="space-y-3">
                {[
                  "Set up in under 5 minutes",
                  "Automatic invoice reminders & follow-ups",
                  "Comprehensive reports and analytics",
                  "Multi-currency and multi-language support",
                  "99.9% uptime SLA guarantee",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-white/70 text-sm font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl border border-white/10 bg-white/3 p-6 overflow-hidden">
                {/* Glow */}
                <div className="absolute -top-20 -right-20 w-60 h-60 bg-indigo-600/10 rounded-full blur-[60px]" />

                {/* Mock dashboard card */}
                <div className="space-y-4 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Revenue Overview</span>
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> +24.5%
                    </span>
                  </div>
                  <div className="text-4xl font-bold tracking-tight">$142,580</div>
                  <div className="text-sm text-white/30 font-medium">This month</div>

                  {/* Fake bar chart */}
                  <div className="flex items-end gap-2 h-20 mt-4">
                    {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `rgba(99,102,241,${0.2 + (h / 100) * 0.5})` }} />
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {[
                      { label: "Invoices", val: "248" },
                      { label: "Customers", val: "64" },
                      { label: "Products", val: "312" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-xl bg-white/5 border border-white/8 p-3 text-center">
                        <div className="text-lg font-bold">{s.val}</div>
                        <div className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mt-0.5">{s.label}</div>
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
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/50 text-xs font-semibold uppercase tracking-widest mb-4">
              <Star className="w-3 h-3" />
              Pricing
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-white/40 text-lg font-medium">
              No surprise fees. No hidden costs. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 border transition-all duration-300 ${
                  plan.highlighted
                    ? "border-indigo-500/40 bg-indigo-600/10 shadow-2xl shadow-indigo-600/10"
                    : "border-white/8 bg-white/3 hover:border-white/15"
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
                  <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold tracking-tight">
                      {plan.price === "Custom" ? plan.price : `$${plan.price}`}
                    </span>
                    {plan.period && <span className="text-white/30 text-sm font-medium">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-white/30 font-medium mt-1">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-7">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/60 font-medium">
                      <Check className={`w-4 h-4 shrink-0 ${plan.highlighted ? "text-indigo-400" : "text-white/30"}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <Link href={plan.price === "Custom" ? "/auth/login" : "/auth/sign-up"}>
                  <Button
                    className={`w-full font-semibold ${
                      plan.highlighted
                        ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20"
                        : "bg-white/8 hover:bg-white/15 text-white border border-white/10"
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
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto relative">
          <div className="absolute inset-0 bg-indigo-600/10 rounded-3xl blur-3xl" />
          <div className="relative rounded-3xl border border-indigo-500/20 bg-indigo-600/5 p-12 text-center overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-linear-to-r from-transparent via-indigo-500 to-transparent" />
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-7 h-7 text-indigo-400" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Ready to get started?
            </h2>
            <p className="text-lg text-white/40 font-medium mb-8 max-w-xl mx-auto">
              Join thousands of businesses already using InvoiceHub. Set up your account in minutes.
            </p>
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-500 h-13 px-10 text-white font-semibold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all"
              >
                Start for Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <p className="text-sm text-white/20 mt-4 font-medium">No credit card required · Free 14-day trial</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white/80">InvoiceHub</span>
          </div>
          <p className="text-sm text-white/20 font-medium">
            &copy; {new Date().getFullYear()} InvoiceHub. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/30 font-medium">
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
