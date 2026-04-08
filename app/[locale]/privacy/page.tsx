import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'

export const metadata = {
  title: "Privacy Policy — Bntec Dynamics",
  description: "Learn how Bntec protects your data and privacy.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      <LandingNavbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto prose dark:prose-invert prose-indigo prose-sm sm:prose-base lg:prose-lg xl:prose-xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-12">
            Last updated: April 8, 2026. Your privacy is our priority.
          </p>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">1. Data We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information that you directly provide to us, such as your name, email address, and business information when you register for an account. We also collect usage data to help us improve the Service.
            </p>

            <h2 className="text-2xl font-bold tracking-tight">2. How We Use Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the data we collect to provide, maintain, and improve our services, monitor and protect the security of our Service, and communicate with you about your account.
            </p>

            <h2 className="text-2xl font-bold tracking-tight">3. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use industry-standard security measures to protect your information from unauthorized access, loss, or disclosure. All data is encrypted both in transit and at rest.
            </p>

            <h2 className="text-2xl font-bold tracking-tight">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may use third-party service providers, such as payment processors (Stripe) and infrastructure providers (Supabase), which have their own privacy policies. We do not sell your personal or business data to third parties.
            </p>

            <h2 className="text-2xl font-bold tracking-tight">5. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to track activity on our Service and hold certain information to improve your user experience.
            </p>

            <h2 className="text-2xl font-bold tracking-tight">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, correct, or delete your personal data at any time. You can do this through your account settings or by contacting our support team.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
