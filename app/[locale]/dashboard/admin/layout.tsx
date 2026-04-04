import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";

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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Server-side Super Admin check
  const isSuperAdmin = user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
  if (!isSuperAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Refined Client-Side Admin Sidebar */}
      <AdminSidebar signOutAction={handleSignOut} />

      {/* Main Admin Content */}
      <main className="flex-1 overflow-auto bg-background selection:bg-indigo-100 selection:text-indigo-900">
        <div className="p-6 lg:p-14 w-full animate-in fade-in slide-in-from-right-4 duration-700">
            {children}
        </div>
      </main>
    </div>
  );
}
