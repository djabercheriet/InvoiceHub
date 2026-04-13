"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Building2,
    Package,
    CreditCard,
    Settings,
    Activity,
    ArrowLeft,
    ShieldCheck,
    LogOut,
    Users,
    Globe,
    Settings2,
    LayoutDashboard,
    ChevronLeft,
    Key,
    MonitorSmartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
    signOutAction: () => Promise<void>;
}

export function AdminSidebar({ signOutAction }: AdminSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard/admin", icon: Activity, label: "System Vitality" },
        { href: "/dashboard/admin/companies", icon: Building2, label: "Workspaces" },
        { href: "/dashboard/admin/users", icon: Users, label: "Operator Base" },
        { href: "/dashboard/admin/customers", icon: ShieldCheck, label: "Stakeholders" },
        { href: "/dashboard/admin/inventory", icon: Package, label: "Global Catalog" },
        { href: "/dashboard/admin/licenses", icon: Key, label: "POS Licensing" },
        { href: "/dashboard/admin/telemetry", icon: MonitorSmartphone, label: "POS Telemetry" },
        { href: "/dashboard/admin/plans", icon: CreditCard, label: "Tiers & Growth" },
        { href: "/dashboard/admin/settings", icon: Globe, label: "Global Config" },
    ];

    return (
        <aside
            className={cn(
                "relative h-screen bg-card border-r border-border flex flex-col transition-all duration-300 z-50",
                isCollapsed ? "w-[80px]" : "w-80"
            )}
        >
            {/* Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-sm z-50"
            >
                <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
            </Button>

            {/* Brand - Match Client Sidebar but Indigo */}
            <div className={cn("p-6 flex items-center gap-3 border-b border-border/40", isCollapsed ? "justify-center" : "justify-start")}>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
                    <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                {!isCollapsed && (
                    <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                        <h1 className="text-lg font-bold tracking-tight leading-none text-indigo-600">Core Admin</h1>
                        <p className="text-[10px] text-muted-foreground font-semibold mt-1">System Control</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1 py-4 overflow-y-auto scrollbar-hide">
                {!isCollapsed && <p className="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground mb-3">Navigation</p>}

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group relative",
                                isActive
                                    ? "bg-indigo-500/10 text-indigo-600 font-semibold border border-indigo-500/20 shadow-sm"
                                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 shrink-0", isActive ? "text-indigo-500" : "group-hover:text-indigo-500")} />
                            {!isCollapsed && <span className="text-sm tracking-tight">{item.label}</span>}
                            {isActive && (
                                <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />
                            )}
                        </Link>
                    );
                })}

                {/* Diagnostic Action */}
                {!isCollapsed && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                            const res = await fetch('/api/debug/seed', { method: 'POST' });
                            if (res.ok) toast.success("Archives synchronized with demo data.");
                            else toast.error("Seeding aborted.");
                        }}
                        className="mt-6 flex items-center justify-start gap-3 px-3 py-6 w-full rounded-xl border border-dashed border-indigo-500/20 hover:bg-indigo-500/5 hover:border-indigo-500/40 group transition-all"
                    >
                        <Settings2 className="w-5 h-5 text-indigo-500/40 group-hover:text-indigo-500" />
                        <div className="flex flex-col items-start text-left">
                            <span className="text-[11px] font-bold text-indigo-500 group-hover:text-indigo-600">Seed Platform</span>
                            <span className="text-[9px] font-medium opacity-40">Populate Archives</span>
                        </div>
                    </Button>
                )}

                <div className="pt-8 mt-8 border-t border-border/40 space-y-1">
                    {!isCollapsed && <p className="px-3 text-[10px] font-semibold tracking-wider text-muted-foreground mb-2">Exit</p>}
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:bg-accent/40 hover:text-foreground transition-all duration-200",
                            isCollapsed ? "justify-center" : "justify-start"
                        )}
                    >
                        <ArrowLeft className="w-5 h-5 shrink-0" />
                        {!isCollapsed && <span className="text-sm font-semibold tracking-tight">Tenant Portal</span>}
                    </Link>
                </div>
            </nav>

            {/* Footer Settings */}
            <div className="p-4 border-t border-border bg-muted/10 space-y-3">
                <div className={cn("flex flex-col gap-2", isCollapsed ? "items-center" : "items-stretch")}>
                    <div className={cn("flex items-center justify-between px-2", isCollapsed && "hidden")}>
                        <span className="text-[10px] text-muted-foreground font-semibold tracking-wider">Appearance</span>
                        <ThemeToggle />
                    </div>

                    <form action={signOutAction} className="w-full">
                        <button
                            type="submit"
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group border border-transparent hover:border-destructive/20",
                                isCollapsed ? "justify-center" : "justify-start"
                            )}
                        >
                            <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            {!isCollapsed && <span className="text-sm font-semibold">Sign Out</span>}
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}


