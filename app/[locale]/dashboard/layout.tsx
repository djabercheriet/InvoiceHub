import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { CommandPalette } from "@/components/ui/command-palette";
import { DashboardShell } from "@/components/dashboard-shell";

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
    <>
      <CommandPalette />
      <DashboardShell
        isSuperAdmin={isSuperAdmin}
        userEmail={user.email}
        signOutAction={handleSignOut}
      >
        {children}
      </DashboardShell>
    </>
  );
}
