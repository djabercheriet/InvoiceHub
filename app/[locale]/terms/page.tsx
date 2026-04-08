import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'

export const metadata = {
  title: "Terms of Service — Bntec Dynamics",
  description: "Read our terms of service to understand how Bntec works for your business.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      <LandingNavbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto prose dark:prose-invert prose-indigo prose-sm sm:prose-base lg:prose-lg xl:prose-xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">Terms of Service</h1>
          <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-12">
            Last updated: April 8, 2026. Please read these terms carefully before using our software.
          </p>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold tracking-tight">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using the Bntec platform (the "Service"), you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions, you may not access the Service.
            </p>

            <h2 className="text-2xl font-bold tracking-tight">2. Use of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Bntec grants you a non-exclusive, non-transferable, limited license to access and use the Service for your internal business operations. You are responsible for maintaining the confidentiality of your account credentials.
            </p>

            <h2 className="text-2xl font-bold tracking-tight">3. User Data & Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy. You retain all rights and ownership of the data you input into the Service. Bntec will never sell your business data to third parties.
            </p>

            <h2 className="text-2xl font-bold tracking-tight">4. Subscription & Payments</h2>
            <p className="text-muted-foreground leading-relaxed">
              Subscription fees are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law.
            </p>

            <h2 className="text-2xl font-bold tracking-tight">5. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, Bntec shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service.
            </p>

            <h2 className="text-2xl font-bold tracking-tight">6. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will notify you of any changes by posting the new terms on this page.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
