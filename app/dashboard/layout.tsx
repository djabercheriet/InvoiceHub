import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Package,
  FileText,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";

async function handleSignOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}

export default async function DashboardLayout({
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

  const isSuperAdmin = user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">InvoiceHub</h1>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-widest font-semibold">SaaS Platform</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
          >
            <BarChart3 className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm font-medium">Dashboard</span>
          </Link>

          <Link
            href="/dashboard/inventory"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
          >
            <Package className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm font-medium">Inventory</span>
          </Link>

          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
          >
            <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm font-medium">Invoices</span>
          </Link>

          <Link
            href="/dashboard/customers"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
          >
            <Users className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm font-medium">Customers</span>
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-all duration-200 group"
          >
            <Settings className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
            <span className="text-sm font-medium">Settings</span>
          </Link>

          {isSuperAdmin && (
            <div className="pt-4">
              <p className="px-3 text-[10px] uppercase font-bold text-muted-foreground mb-1">Administration</p>
              <Link
                href="/dashboard/admin"
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-all duration-200"
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm font-semibold">Admin Console</span>
              </Link>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-border space-y-4">
          <div className="flex items-center justify-between px-3">
            <span className="text-xs text-muted-foreground uppercase font-bold">Theme</span>
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto page-fade-in">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
