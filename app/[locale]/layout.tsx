import type { Metadata } from 'next'
import localFont from 'next/font/local'
import '../globals.css'
import { cn } from "@/lib/utils"
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales } from '@/i18n/config';
import { ScrollToTop } from '@/components/scroll-to-top'

const inter = localFont({
  src: [
    {
      path: "../../public/fonts/inter/Inter-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/Inter-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/Inter-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/Inter-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter/Inter-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: 'Bntec — The All-in-One Operating System for Modern Businesses',
  description: 'Streamline your operations with Bntec. Professional invoicing, real-time inventory management, and integrated customer CRM designed to scale your business globally.',
  generator: 'bntec.app',
  keywords: 'Bntec, SaaS, business management, online invoicing, inventory tracking, CRM software, multi-tenant billing, enterprise growth',
  icons: {
    icon: [
      {
        url: '/Icon.png',
      },
    ],
    apple: '/Icon.png',
  },
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {

  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
            <Toaster position="top-right" />
            <ScrollToTop />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
