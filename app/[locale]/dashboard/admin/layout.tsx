import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

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
    <div className="relative flex-1 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Subtle Global Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
      {children}
    </div>
  );
}
