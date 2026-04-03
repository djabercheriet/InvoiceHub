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
    <div className="flex h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-indigo-950 text-indigo-50 border-r border-indigo-900 shadow-xl">
        <div className="p-6 border-b border-indigo-900/50 bg-indigo-950/50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight">Admin Console</h1>
          </div>
          <p className="text-xs text-indigo-400 mt-1 uppercase font-semibold tracking-wider">System Management</p>
        </div>

        <nav className="p-4 space-y-1">
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-900/50 transition-all hover:translate-x-1"
          >
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <span className="font-medium">System Stats</span>
          </Link>

          <Link
            href="/dashboard/admin/companies"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-900/50 transition-all hover:translate-x-1 text-indigo-300"
          >
            <Building2 className="w-5 h-5" />
            <span className="font-medium">All Companies</span>
          </Link>

          <Link
            href="/dashboard/admin/plans"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-900/50 transition-all hover:translate-x-1 text-indigo-300"
          >
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Plans & Pricing</span>
          </Link>

          <Link
            href="/dashboard/admin/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-900/50 transition-all hover:translate-x-1 text-indigo-300"
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Global Settings</span>
          </Link>

          <div className="pt-4 mt-4 border-t border-indigo-900/50">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-indigo-900/30 text-indigo-200 hover:bg-indigo-900/50 transition-colors border border-indigo-800/30"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Exit Admin Panel</span>
            </Link>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-900/50 w-64 bg-indigo-950">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-950/30 transition-colors text-indigo-400 hover:text-red-400"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-auto bg-white">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
