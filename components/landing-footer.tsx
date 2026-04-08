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
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                <FileText className="w-[18px] h-[18px] text-white" />
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
              <Link href="#features" className="text-sm text-muted-foreground hover:text-indigo-500 hover:translate-x-1 transition-all">Features</Link>
              <Link href="#pricing" className="text-sm text-muted-foreground hover:text-indigo-500 hover:translate-x-1 transition-all">Pricing</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-indigo-500 hover:translate-x-1 transition-all">Changelog</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-indigo-500 hover:translate-x-1 transition-all">Documentation</Link>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Company</h4>
            <div className="flex flex-col gap-3">
              <Link href="#about" className="text-sm text-muted-foreground hover:text-indigo-500 hover:translate-x-1 transition-all">About</Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-indigo-500 hover:translate-x-1 transition-all">Contact</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-indigo-500 hover:translate-x-1 transition-all">Careers</Link>
              <div className="flex items-center gap-4 mt-2">
                <Link href="#" className="text-muted-foreground hover:text-indigo-500 transition-colors"><Twitter className="w-4 h-4" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-indigo-500 transition-colors"><Linkedin className="w-4 h-4" /></Link>
                <Link href="#" className="text-muted-foreground hover:text-indigo-500 transition-colors"><Github className="w-4 h-4" /></Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-indigo-500 hover:translate-x-1 transition-all">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-indigo-500 hover:translate-x-1 transition-all">Terms of Service</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-indigo-500 hover:translate-x-1 transition-all">Cookie Policy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-indigo-500 hover:translate-x-1 transition-all">SLA</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {currentYear} Bntec Dynamics. Built for power and precision.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-indigo-400 transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-indigo-400 transition-colors">Terms</Link>
            <Link href="/contact" className="text-xs text-muted-foreground hover:text-indigo-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
