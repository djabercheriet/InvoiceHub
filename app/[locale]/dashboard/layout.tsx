import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

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
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* New Collapsible Sidebar */}
      <DashboardSidebar 
        isSuperAdmin={isSuperAdmin} 
        signOutAction={handleSignOut} 
      />

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto page-fade-in relative">
        <div className="p-4 lg:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
