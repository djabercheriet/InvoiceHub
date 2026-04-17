"use client";

import { usePathname } from "next/navigation";
import { DashboardSidebar } from "./dashboard-sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { DashboardHeader } from "./dashboard-header";
import { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
  isSuperAdmin: boolean;
  userEmail: string | undefined;
  signOutAction: () => Promise<void>;
}

export function DashboardShell({
  children,
  isSuperAdmin,
  userEmail,
  signOutAction,
}: DashboardShellProps) {
  const pathname = usePathname();
  const isAdminPath = pathname?.includes("/admin");

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {isAdminPath ? (
        <AdminSidebar signOutAction={signOutAction} />
      ) : (
        <DashboardSidebar
          isSuperAdmin={isSuperAdmin}
          signOutAction={signOutAction}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0">
        <DashboardHeader
          signOutAction={signOutAction}
          userEmail={userEmail}
        />
        <main className="flex-1 overflow-y-auto page-fade-in relative">
          <div className="mx-auto w-full max-w-[1920px] px-4 lg:px-8 py-8 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
