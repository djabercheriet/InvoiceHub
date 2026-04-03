import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  ArrowLeft,
  ShieldCheck,
  LogOut,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

async function handleSignOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Server-side Super Admin check
  const isSuperAdmin = user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col shadow-xl">
        <div className="p-6 border-b border-border bg-accent/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-black tracking-tighter">Admin Console</h1>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 uppercase font-black tracking-widest">Platform Core</p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-all duration-200"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-sm font-bold">System Stats</span>
          </Link>

          <Link
            href="/dashboard/admin/companies"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
          >
            <Building2 className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm font-medium">All Companies</span>
          </Link>

          <Link
            href="/dashboard/admin/plans"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
          >
            <CreditCard className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm font-medium">Plans & Pricing</span>
          </Link>

          <Link
            href="/dashboard/admin/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
          >
            <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm font-medium">Global Settings</span>
          </Link>

          <div className="pt-6 mt-6 border-t border-border">
            <p className="px-3 text-[10px] uppercase font-black text-muted-foreground mb-2">Navigation</p>
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 group border border-transparent hover:border-border"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Exit Admin Panel</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between px-3">
            <span className="text-[10px] text-muted-foreground uppercase font-black">Mode</span>
            <ThemeToggle />
          </div>
          
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-destructive/10 hover:text-destructive transition-all duration-200 text-muted-foreground group"
            >
              <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-auto page-fade-in bg-background">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
