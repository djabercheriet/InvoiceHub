'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, ChevronRight, Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 transition-all duration-300">
      <div 
        className={cn(
          "w-full max-w-7xl px-4 md:px-8 py-3 flex items-center transition-all duration-500 relative",
          scrolled 
            ? "bg-background/80 backdrop-blur-xl border border-border/50 shadow-2xl rounded-full max-w-4xl mt-3 mx-4" 
            : "bg-transparent border-b border-foreground/5"
        )}
      >
        {/* Left: Logo */}
        <div className="flex-1 flex items-center">
          <Link href="/" className="flex items-center gap-2.5 group transition-transform hover:scale-105 active:scale-95">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-600/30 shrink-0">
              <img src="/Icon.png" alt="Bntec Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              Bntec
            </span>
          </Link>
        </div>

        {/* Center: Desktop Links - Force absolute centering inside the pill */}
        <div className={cn(
          "hidden md:flex items-center justify-center gap-10 text-sm font-bold transition-all absolute left-1/2 -translate-x-1/2",
          scrolled ? "text-foreground/80" : "text-foreground/90"
        )}>
          <a href="#features" className="hover:text-primary transition-colors cursor-pointer">Features</a>
          <a href="#pricing" className="hover:text-primary transition-colors cursor-pointer">Pricing</a>
          <a href="#about" className="hover:text-primary transition-colors cursor-pointer">About</a>
        </div>

        {/* Right: Actions */}
        <div className="flex-1 flex items-center justify-end gap-3">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <Link href="/auth/login" className="hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "font-bold",
                scrolled ? "text-foreground/80 hover:bg-accent" : "text-foreground/80 hover:text-foreground hover:bg-accent/50"
              )}
            >
              Sign In
            </Button>
          </Link>
          <Link href="/auth/sign-up">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 px-5 cursor-pointer"
            >
              Get Started <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-4 right-4 bg-background border border-border p-6 rounded-2xl shadow-2xl md:hidden flex flex-col gap-4 animate-in slide-in-from-top-5 duration-300">
          <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Features</a>
          <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">Pricing</a>
          <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium">About</a>
          <hr className="border-border" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      )}
    </nav>
  )
}
