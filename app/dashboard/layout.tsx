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
} from "lucide-react";

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

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white border-r border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold">InvoiceHub</h1>
          <p className="text-sm text-slate-400 mt-1">Invoice & Inventory</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <BarChart3 className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/dashboard/inventory"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Package className="w-5 h-5" />
            <span>Inventory</span>
          </Link>

          <Link
            href="/dashboard/invoices"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <FileText className="w-5 h-5" />
            <span>Invoices</span>
          </Link>

          <Link
            href="/dashboard/customers"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Users className="w-5 h-5" />
            <span>Customers</span>
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 w-64">
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-slate-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
