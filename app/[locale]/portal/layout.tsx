import { ReactNode } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <header className="h-16 border-b bg-white dark:bg-slate-900 flex items-center px-6 justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
          <span className="font-bold text-lg tracking-tight">Bntec <span className="text-indigo-600">Portal</span></span>
        </Link>
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <span>Client Support</span>
          <div className="h-4 w-px bg-border" />
          <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Secured</span>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="py-8 border-t bg-white dark:bg-slate-900 text-center text-sm text-muted-foreground px-6">
        <p>&copy; {new Date().getFullYear()} Bntec Dynamics. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-4">
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
