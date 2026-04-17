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
    MonitorSmartphone,
    Terminal,
    Cpu,
    Database,
    Fingerprint
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
        { href: "/dashboard/admin/operations", icon: Terminal, label: "System Operations" },
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
                "relative h-screen bg-card border-r border-border/50 flex flex-col transition-all duration-500 z-50 overflow-hidden",
                isCollapsed ? "w-[80px]" : "w-64"
            )}
        >
            {/* Background Grain/Glow */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 -left-1/2 w-full h-full bg-indigo-500/10 blur-[120px] rounded-full" />
            </div>

            {/* Toggle Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-4 top-10 h-8 w-8 rounded-xl border border-border bg-background shadow-2xl z-50 text-muted-foreground hover:text-primary transition-all cursor-pointer"
            >
                <ChevronLeft className={cn("h-4 w-4 transition-transform duration-500", isCollapsed && "rotate-180")} />
            </Button>

            {/* Brand - System Authority */}
            <div className={cn("p-8 flex items-center gap-4 border-b border-border/50 relative z-10", isCollapsed ? "justify-center" : "justify-start")}>
                <div className="relative group shrink-0">
                    <div className="absolute -inset-2 bg-indigo-500/20 rounded-2xl blur-lg group-hover:bg-indigo-500/40 transition-all duration-500 opacity-0 group-hover:opacity-100" />
                    <img 
                        src="/Icon.png" 
                        alt="InvoicesHub" 
                        className="w-10 h-10 object-contain relative z-10 brightness-110 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                    />
                </div>
                {!isCollapsed && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <h1 className="text-xl font-black tracking-tighter text-foreground flex items-center gap-2">
                            CORE <span className="text-primary">OS</span>
                        </h1>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1 opacity-60">System Authority</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 py-8 overflow-y-auto scrollbar-hide relative z-10">
                {!isCollapsed && (
                    <p className="px-4 text-[10px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase mb-6">
                        Operational Nodes
                    </p>
                )}

                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-500 group relative overflow-hidden",
                                isActive
                                    ? "bg-primary/10 text-primary font-black border border-primary/20 shadow-[0_0_20px_rgba(79,70,229,0.1)]"
                                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5 shrink-0 transition-all duration-500", isActive ? "text-primary scale-110" : "group-hover:text-primary group-hover:scale-110")} />
                            {!isCollapsed && <span className="text-sm font-bold tracking-tight">{item.label}</span>}
                            
                            {isActive && (
                                <>
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary rounded-r-full shadow-[0_0_15px_rgba(79,70,229,0.8)]" />
                                    <div className="absolute inset-0 bg-linear-to-r from-primary/10 to-transparent pointer-events-none" />
                                </>
                            )}
                        </Link>
                    );
                })}

                {/* Platform Maintenance Action */}
                {!isCollapsed && (
                    <div className="px-2 pt-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                                const res = await fetch('/api/debug/seed', { method: 'POST' });
                                if (res.ok) toast.success("Archives successfully synchronized.");
                                else toast.error("Synchronization failed.");
                            }}
                            className="flex flex-col items-start gap-1 px-5 py-8 w-full rounded-[24px] border border-border/50 bg-secondary/30 hover:bg-secondary hover:border-primary/30 group transition-all duration-500 relative overflow-hidden text-left cursor-pointer"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.15] transition-opacity">
                                <Database className="w-12 h-12 text-indigo-500" />
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <Terminal className="w-4 h-4 text-primary group-hover:animate-pulse" />
                                <span className="text-[11px] font-black text-foreground tracking-widest uppercase">Seed Engine</span>
                            </div>
                            <span className="text-[10px] font-semibold text-muted-foreground/60 group-hover:text-muted-foreground relative z-10">Inject synthetic dataset</span>
                        </Button>
                    </div>
                )}

                <div className="pt-10 mt-10 border-t border-border/50 space-y-2">
                    {!isCollapsed && <p className="px-4 text-[10px] font-black tracking-[0.3em] text-muted-foreground/40 uppercase mb-4">Boundary Bridge</p>}
                    <Link
                        href="/dashboard"
                        className={cn(
                            "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-500 border border-transparent hover:border-border/50 group",
                            isCollapsed ? "justify-center" : "justify-start"
                        )}
                    >
                        <ArrowLeft className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                        {!isCollapsed && <span className="text-sm font-bold tracking-tight">Return to Tenant Portal</span>}
                    </Link>
                </div>
            </nav>

            {/* Admin Profile / Exit */}
            <div className="p-6 border-t border-border/50 bg-secondary/30 space-y-4 relative z-10">
                <div className={cn("flex flex-col gap-3", isCollapsed ? "items-center" : "items-stretch")}>
                    {!isCollapsed && (
                        <div className="flex items-center justify-between px-2 mb-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-primary/80 flex items-center justify-center text-[10px] font-black text-white shadow-lg">AD</div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-foreground tracking-tight">Superuser</span>
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Root Active</span>
                                </div>
                            </div>
                            <ThemeToggle />
                        </div>
                    )}

                    <form action={signOutAction} className="w-full">
                        <button
                            type="submit"
                            className={cn(
                                "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all duration-500 group border border-transparent hover:border-red-400/20 font-bold",
                                isCollapsed ? "justify-center" : "justify-start"
                            )}
                        >
                            <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                            {!isCollapsed && <span className="text-sm">Terminate Session</span>}
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}



