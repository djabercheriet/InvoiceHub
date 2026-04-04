'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
 BarChart3, 
 Package, 
 FileText, 
 Users, 
 Settings, 
 LogOut, 
 ShieldCheck,
 ChevronLeft,
 Menu,
 LayoutDashboard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useTranslations } from 'next-intl'

interface SidebarProps {
 isSuperAdmin: boolean
 signOutAction: () => Promise<void>
}

export function DashboardSidebar({ isSuperAdmin, signOutAction }: SidebarProps) {
 const [isCollapsed, setIsCollapsed] = useState(false)
 const pathname = usePathname()
 const t = useTranslations('Navigation')

 const navItems = [
 { href: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
 { href: '/dashboard/inventory', icon: Package, label: t('inventory') },
 { href: '/dashboard/invoices', icon: FileText, label: t('invoices') },
 { href: '/dashboard/customers', icon: Users, label: t('customers') },
 { href: '/dashboard/reports', icon: BarChart3, label: 'Reports' },
 { href: '/dashboard/settings', icon: Settings, label: t('settings') },
 ]

 return (
 <aside 
 className={cn(
"relative h-screen bg-card border-r border-border flex flex-col sidebar-transition group/sidebar",
 isCollapsed ?"w-[80px]" :"w-64"
 )}
 >
 {/* Toggle Button */}
 <Button
 variant="ghost"
 size="icon"
 onClick={() => setIsCollapsed(!isCollapsed)}
 className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-sm z-50 opacity-0 group-hover/sidebar:opacity-100 transition-opacity"
 >
 <ChevronLeft className={cn("h-4 w-4 transition-transform", isCollapsed &&"rotate-180")} />
 </Button>

 {/* Brand */}
 <div className={cn("p-6 flex items-center gap-3", isCollapsed ?"justify-center" :"justify-start")}>
 <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
 <FileText className="w-5 h-5 text-primary-foreground" />
 </div>
 {!isCollapsed && (
 <div className="animate-in fade-in slide-in-from-left-2 duration-300">
 <h1 className="text-lg font-bold tracking-tight leading-none">InvoiceHub</h1>
 <p className="text-[10px] text-muted-foreground font-semibold tracking-wider mt-1">Enterprise</p>
 </div>
 )}
 </div>

 {/* Navigation */}
 <nav className="flex-1 px-3 space-y-1 py-4 overflow-y-auto overflow-x-hidden">
 {navItems.map((item) => {
 const isActive = pathname === item.href
 return (
 <Link
 key={item.href}
 href={item.href}
 className={cn(
"flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group/item relative",
 isActive 
 ?"bg-secondary text-foreground font-semibold shadow-sm" 
 :"text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
 )}
 >
 <item.icon className={cn("w-5 h-5 shrink-0", isActive ?"text-primary" :"group-hover/item:text-primary")} />
 {!isCollapsed && <span className="text-sm">{item.label}</span>}
 {isActive && (
 <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
 )}
 </Link>
 )
 })}

 {isSuperAdmin && (
 <div className="pt-6 mt-6 border-t border-border/50">
 {!isCollapsed && <p className="px-3 text-[10px] font-bold text-muted-foreground mb-4">System Admin</p>}
 <Link
 href="/dashboard/admin"
 className={cn(
"flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
 pathname.startsWith('/dashboard/admin') 
 ?"bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-500/20 shadow-lg shadow-indigo-500/5" 
 :"text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
 )}
 >
 <ShieldCheck className="w-5 h-5 shrink-0" />
 {!isCollapsed && <span className="text-sm">{t('admin')}</span>}
 </Link>
 </div>
 )}
 </nav>

 {/* Footer Settings */}
 <div className="p-3 border-t border-border bg-muted/20 space-y-2">
 <div className={cn("flex flex-col gap-2", isCollapsed ?"items-center" :"items-stretch")}>
 <div className={cn("flex items-center justify-between px-2", isCollapsed &&"hidden")}>
 <span className="text-[10px] text-muted-foreground font-semibold tracking-wider">Theme</span>
 <ThemeToggle />
 </div>
 
 {!isCollapsed && (
 <div className="flex items-center justify-between px-2">
 <span className="text-[10px] text-muted-foreground font-semibold tracking-wider">Language</span>
 <LanguageSwitcher />
 </div>
 )}

 <button
 onClick={() => signOutAction()}
 className={cn(
"w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group/logout",
 isCollapsed ?"justify-center" :"justify-start"
 )}
 >
 <LogOut className="w-5 h-5 group-hover/logout:rotate-12 transition-transform" />
 {!isCollapsed && <span className="text-sm font-semibold">{t('signOut')}</span>}
 </button>
 </div>
 </div>
 </aside>
 )
}


