import { LandingNavbar } from '@/components/landing-navbar'
import { LandingFooter } from '@/components/landing-footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, MessageSquare, Phone, MapPin } from 'lucide-react'

export const metadata = {
  title: "Contact Us — Bntec Dynamics",
  description: "Get in touch with the Bntec team. We're here to help you grow your business.",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-indigo-500/30">
      <LandingNavbar />

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Get in Touch</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
              Have questions? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Contact Info */}
            <div className="space-y-12">
              <div className="grid sm:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-bold">Email Us</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Our team is here to help with your technical and billing questions.
                  </p>
                  <a href="mailto:support@bntec.app" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                    support@bntec.app
                  </a>
                </div>

                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-bold">Live Chat</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Available Mon-Fri, 9am-6pm. Average response time: 5 minutes.
                  </p>
                  <button className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">
                    Start a conversation
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-bold">Call Us</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Speak directly with an account executive for enterprise solutions.
                  </p>
                  <a href="tel:+1-555-000-000" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    +1 (555) 000-000
                  </a>
                </div>

                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-bold">Office</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Visit us at our headquarters in Algiers, Algeria.
                  </p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Sidi Yahia, Hydra, Algiers
                  </p>
                </div>
              </div>

              {/* Map/Image Placeholder */}
              <div className="aspect-video rounded-2xl bg-muted border border-border overflow-hidden relative group">
                <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/10 to-transparent pointer-events-none" />
                <div className="flex items-center justify-center h-full text-muted-foreground font-medium">
                  [ Interactive Map View ]
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-3xl border border-border bg-card p-8 md:p-12 shadow-2xl relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
              
              <form className="space-y-6 relative">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70">First Name</label>
                    <Input placeholder="John" className="bg-background/50 border-border" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70">Last Name</label>
                    <Input placeholder="Doe" className="bg-background/50 border-border" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-70">Email Address</label>
                  <Input type="email" placeholder="john@example.com" className="bg-background/50 border-border" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-70">Subject</label>
                  <Input placeholder="Inquiry about Enterprise plan" className="bg-background/50 border-border" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold opacity-70">Message</label>
                  <Textarea 
                    placeholder="How can we help you?" 
                    className="min-h-[150px] bg-background/50 border-border"
                  />
                </div>

                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 shadow-lg shadow-indigo-600/20">
                  Send Message
                </Button>
                
                <p className="text-[10px] text-center text-muted-foreground italic">
                  By submitting this form, you agree to our privacy policy and terms of service.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
