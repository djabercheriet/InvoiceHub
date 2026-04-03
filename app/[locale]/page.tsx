import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3, Package, FileText, Users, ArrowRight, Check } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold">InvoiceHub</div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
          Invoice & Inventory Management Made Simple
        </h1>
        <p className="text-xl text-slate-300 mb-8 text-balance max-w-2xl mx-auto">
          Streamline your business operations with our all-in-one platform. Manage invoices,
          track inventory, and grow your business effortlessly.
        </p>
        <div className="flex gap-4 justify-center mb-16">
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 gap-2">
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="border-slate-600 text-slate-200 hover:bg-slate-800">
            Watch Demo
          </Button>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {[
            { icon: BarChart3, title: "Dashboard", desc: "Real-time business insights" },
            { icon: FileText, title: "Invoices", desc: "Create & manage invoices" },
            { icon: Package, title: "Inventory", desc: "Track stock levels" },
            { icon: Users, title: "Customers", desc: "Manage client relationships" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <Icon className="w-8 h-8 mb-3 text-blue-400" />
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-slate-800/50 border-t border-slate-700 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Choose InvoiceHub?</h2>
          <div className="grid md:grid-cols-2 gap-12">
            {[
              "Create professional invoices in seconds",
              "Real-time inventory tracking and alerts",
              "Automated invoice reminders and follow-ups",
              "Comprehensive reporting and analytics",
              "Secure data with enterprise-grade encryption",
              "Support for multiple currencies and languages",
            ].map((feature, i) => (
              <div key={i} className="flex gap-4">
                <Check className="w-6 h-6 text-green-400 shrink-0" />
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold mb-12 text-center">Simple, Transparent Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { plan: "Starter", price: "29", features: ["Up to 100 invoices", "Basic inventory", "5 customers"] },
            { plan: "Professional", price: "79", features: ["Unlimited invoices", "Advanced inventory", "Unlimited customers", "Custom reports"] },
            { plan: "Enterprise", price: "Custom", features: ["Everything in Professional", "Priority support", "Custom integrations"] },
          ].map(({ plan, price, features }) => (
            <div key={plan} className={`border rounded-lg p-8 ${plan === "Professional" ? "bg-blue-600/20 border-blue-500" : "border-slate-700"}`}>
              <h3 className="text-2xl font-bold mb-2">{plan}</h3>
              <p className="text-3xl font-bold mb-6">${price}<span className="text-lg text-slate-400">/mo</span></p>
              <ul className="space-y-3 mb-8">
                {features.map((f, i) => (
                  <li key={i} className="flex gap-2 text-slate-300">
                    <Check className="w-5 h-5 text-green-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full" variant={plan === "Professional" ? "default" : "outline"}>
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 border-t border-slate-700 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Start your free trial today and experience the difference.
          </p>
          <Link href="/auth/sign-up">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>&copy; 2024 InvoiceHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
