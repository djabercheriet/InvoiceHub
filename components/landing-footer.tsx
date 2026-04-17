import Link from 'next/link'
import { FileText, Github, Twitter, Linkedin, Facebook } from 'lucide-react'

export function LandingFooter() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Changelog', href: '#' },
        { label: 'API Reference', href: '#' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Careers', href: '#' },
        { label: 'Security', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '#' },
        { label: 'SLA', href: '#' },
      ],
    },
    {
      title: 'Social',
      links: [
        { label: 'Twitter', icon: Twitter, href: '#' },
        { label: 'LinkedIn', icon: Linkedin, href: '#' },
        { label: 'GitHub', icon: Github, href: '#' },
      ],
    },
  ]

  return (
    <footer className="border-t border-border/50 bg-background pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-12 mb-20 animate-in fade-in duration-500">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-indigo-600/20 shrink-0">
              <img src="/Icon.png" alt="Bntec Logo" className="w-full h-full object-cover" />
            </div>
              <span className="text-lg font-bold tracking-tight text-foreground">Bntec</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium leading-relaxed">
              The next-generation operating system for modern businesses. Invoicing, inventory, and CRM unified for peak performance.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Product</h4>
            <div className="flex flex-col gap-3">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all cursor-pointer">Features</Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all cursor-pointer">Pricing</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all cursor-pointer">Changelog</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all cursor-pointer">Documentation</Link>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Company</h4>
            <div className="flex flex-col gap-3">
              <Link href="#about" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all cursor-pointer">About</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all cursor-pointer">Contact</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all cursor-pointer">Careers</Link>
              <div className="flex items-center gap-4 mt-2">
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"><Twitter className="w-4 h-4" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"><Linkedin className="w-4 h-4" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-primary transition-colors cursor-pointer"><Github className="w-4 h-4" /></Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all cursor-pointer">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all cursor-pointer">Terms of Service</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all cursor-pointer">Cookie Policy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 transition-all cursor-pointer">SLA</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {currentYear} Bntec Dynamics. Built for power and precision.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">Terms</Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
