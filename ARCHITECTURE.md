# ⬡ Bntec Dynamics — Architecture & Engineering Reference

> **Version:** 2.0 · **Last Updated:** April 2026  
> This document provides a comprehensive, up-to-date overview of the Bntec Dynamics (InvoicesHub) platform architecture, tech stack, design system, and development patterns. It is the authoritative reference for AI agents and developers contributing to the codebase.

---

## 1. Project Vision

Bntec is an enterprise-grade, multi-tenant SaaS platform for high-precision financial operations, inventory intelligence, and CRM. It is designed for businesses that demand professional invoicing, real-time inventory control, and robust analytics — all in a single unified platform with a premium, theme-aware UI.

---

## 2. Technology Stack

### Core Framework
| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.0 | App Router, SSR, API Routes, Turbopack |
| **React** | 19.2.4 | UI library with concurrent mode |
| **TypeScript** | 5.7.3 | Type safety across the entire codebase |

### Backend & Infrastructure
| Technology | Purpose |
|---|---|
| **Supabase PostgreSQL** | Primary database with Row-Level Security (RLS) |
| **Supabase Auth + SSR** | Session management via `@supabase/ssr` |
| **Supabase Storage** | Product images and file assets |
| **Supabase Edge Functions** | (Planned) Background tasks and webhooks |
| **Upstash Redis** | Caching layer (`@upstash/redis`) |
| **Upstash QStash** | Background job queuing (`@upstash/qstash`) |

### UI & Styling
| Technology | Purpose |
|---|---|
| **Tailwind CSS 4** | Utility-first CSS with `@theme inline` token system |
| **shadcn/ui** | Radix-based accessible component primitives |
| **Lucide React** | Icon library (v0.564) |
| **next-themes** | Light/dark mode management via `.dark` class on `<html>` |
| **Inter** | Primary typeface (300–800 weights, local fonts) |

### Utilities & Libraries
| Package | Purpose |
|---|---|
| `react-hook-form` + `zod` | Form state management and validation |
| `next-intl` | Internationalization with localized routing |
| `@react-pdf/renderer` | Server/client PDF generation (zero CDN, Helvetica) |
| `recharts` | Dashboard analytics charts |
| `nodemailer` / `resend` | Transactional email sending |
| `date-fns` | Date formatting and arithmetic |
| `cmdk` | Command palette (⌘K) |
| `sonner` | Toast notifications |
| `@ai-sdk/google` + `ai` | AI-assisted features |

---

## 3. Directory Structure

```
InvoicesHub Nexxt/
├── app/
│   ├── globals.css                   # Global styles, design tokens, light-mode compat layer
│   └── [locale]/
│       ├── layout.tsx                 # Root layout: ThemeProvider, i18n, fonts
│       ├── page.tsx                   # Landing page (Hero, Features, Pricing, CTA, Footer)
│       ├── auth/
│       │   ├── login/page.tsx         # Login (split-panel, theme-aware form)
│       │   └── sign-up/page.tsx       # Registration (split-panel, theme-aware form)
│       ├── dashboard/
│       │   ├── layout.tsx             # Dashboard shell: sidebar + header
│       │   ├── page.tsx               # Main dashboard: KPIs, charts, activity
│       │   ├── invoices/              # Invoice list, builder, detail
│       │   ├── customers/             # Customer CRM
│       │   ├── inventory/             # Inventory overview + sub-routes:
│       │   │   ├── products/          #   Product catalog
│       │   │   ├── categories/        #   Category management
│       │   │   ├── suppliers/         #   Supplier records
│       │   │   ├── purchase-orders/   #   Purchase order management
│       │   │   └── movements/         #   Stock movement history
│       │   ├── sales/                 # Sales module
│       │   ├── finance/               # Finance & expenses
│       │   ├── reports/               # Analytics reports
│       │   │   ├── sales/             #   Sales reports
│       │   │   └── inventory/         #   Inventory reports
│       │   ├── automation/            # Workflow automations
│       │   ├── settings/              # User/company settings
│       │   ├── subscription/          # Subscription & billing
│       │   └── admin/                 # Super-admin console
│       │       ├── page.tsx           #   Admin overview
│       │       ├── users/             #   Identity management
│       │       ├── companies/         #   Company registry
│       │       ├── plans/             #   Subscription plan management
│       │       ├── licenses/          #   License key management
│       │       ├── settings/          #   Platform settings
│       │       ├── telemetry/         #   System telemetry & logs
│       │       └── operations/        #   Operational controls
│       ├── portal/                    # Client-facing customer portal
│       ├── contact/                   # Contact page
│       ├── privacy/                   # Privacy policy
│       └── terms/                     # Terms of service
├── app/api/
│   ├── invoices/[id]/send/            # Email + PDF dispatch endpoint
│   ├── quotes/                        # Quote generation
│   ├── inventory/                     # Inventory API
│   ├── purchase-orders/               # PO API
│   ├── payments/                      # Payment processing
│   ├── analytics/                     # Analytics data
│   ├── ai/                            # AI-assisted features
│   ├── webhooks/                      # Third-party webhooks
│   ├── health/                        # Platform health check
│   └── admin/                         # Admin server actions
│
├── components/
│   ├── dashboard-header.tsx           # Sticky header: search, notifications, user menu
│   ├── dashboard-sidebar.tsx          # Client dashboard sidebar with nav groups
│   ├── admin-sidebar.tsx              # Admin console sidebar
│   ├── dashboard-shell.tsx            # Layout wrapper component
│   ├── landing-navbar.tsx             # Landing page top navigation
│   ├── landing-footer.tsx             # Landing page footer
│   ├── theme-toggle.tsx               # Light/dark mode toggle button
│   ├── theme-provider.tsx             # next-themes provider wrapper
│   ├── scroll-to-top.tsx              # Scroll restoration component
│   ├── language-switcher.tsx          # Locale switcher
│   ├── landing/                       # Landing page sections
│   │   └── dashboard-preview.tsx      # Animated dashboard mockup
│   ├── invoices/                      # Invoice components
│   ├── inventory/                     # Inventory components
│   ├── sales/                         # Sales components
│   ├── quotes/                        # Quote components
│   ├── payments/                      # Payment components
│   ├── activities/                    # Activity feed components
│   ├── dashboard/                     # Dashboard widget components
│   ├── portal/                        # Customer portal components
│   └── ui/                            # shadcn/ui primitives
│       ├── command-palette.tsx        # ⌘K command palette
│       ├── empty-state.tsx            # Reusable empty state
│       └── ...                        # All shadcn base components
│
├── lib/
│   ├── utils.ts                       # cn() and shared utilities
│   ├── email.ts                       # Email service (Resend/Nodemailer)
│   ├── cache.ts                       # Upstash Redis cache helpers
│   ├── supabase/
│   │   ├── client.ts                  # Browser Supabase client
│   │   ├── server.ts                  # Server-side Supabase client
│   │   ├── middleware.ts              # Auth middleware helpers
│   │   ├── database.ts                # Centralized DB service layer
│   │   └── admin.ts                   # Elevated Supabase admin client
│   ├── domain/                        # Domain logic (entities, validators)
│   ├── events/                        # Domain events system
│   ├── jobs/                          # Background job definitions
│   └── platform/                      # Platform-level utilities
│
├── hooks/
│   ├── use-auth-user.ts               # Current authenticated user hook
│   ├── use-subscription.ts            # Subscription state hook
│   └── use-export.ts                  # Data export hook
│
├── i18n/                              # next-intl configuration
├── messages/                          # Translation JSON (ar, en, fr, de)
├── scripts/                           # SQL migration scripts (000–015+)
├── public/                            # Static assets (Icon.png, fonts/)
├── proxy.ts                           # Vercel rewrite proxy config
└── next.config.mjs                    # Next.js configuration
```

---

## 4. Theme System

### Design Philosophy
The application uses a **dual-mode theme system** (light + dark) powered by `next-themes`. The `.dark` class is applied to `<html>` for dark mode.

### CSS Variables (`app/globals.css`)
All colors are defined as CSS custom properties via `@theme inline`:

| Variable | Light | Dark |
|---|---|---|
| `--primary` | `#4f46e5` (Indigo 600) | `#6366f1` (Indigo 500) |
| `--background` | `#fbfbfe` | `#0b0e14` |
| `--card` | `#ffffff` | `#11141b` |
| `--foreground` | `#0f172a` | `#f8fafc` |
| `--secondary` | `#f1f5f9` | `#1e293b` |
| `--border` | `#e2e8f0` | `#1e293b` |
| `--muted-foreground` | `#64748b` | `#94a3b8` |

### Light-Mode Compatibility Layer
A special CSS block in `globals.css` uses `html:not(.dark)` to retroactively correct any legacy dark-only Tailwind classes (`bg-white/5`, `border-white/5`, `text-white`) that appear in older admin pages, mapping them to theme-appropriate values using `color-mix()`.

### Utility Classes
| Class | Purpose |
|---|---|
| `.glass-card` | Card with `bg-card/85 backdrop-blur-lg border-border` |
| `.glass-dashboard` | Floating panel: `bg-background/60 backdrop-blur-3xl` |
| `.neon-glow-primary` | Subtle primary glow shadow |
| `.animate-float` | Smooth 6s floating animation |

---

## 5. Architectural Patterns

### Localized Routing
All routes are wrapped in a `[locale]` App Router segment powered by `next-intl`. Supported locales: `en`, `ar` (RTL), `fr`, `de`.

### Supabase Integration (SSR)
- **Server Components / Actions** → `createClient` from `@/lib/supabase/server`
- **Client Components** → `createClient` from `@/lib/supabase/client`
- **Service Layer** → All DB operations are centralized in `@/lib/supabase/database.ts`
- **Admin** → Elevated operations use `@/lib/supabase/admin` (service role key)

### Multi-Tenant Data Isolation
All database tables use **Row-Level Security (RLS)** policies keyed on `company_id`. Users can only see and modify data belonging to their own company context.

### Authentication Flow
1. User submits credentials on `/auth/login`
2. Supabase Auth handles the session via `@supabase/ssr` cookie management
3. The root layout reads the session server-side and passes `userEmail` to the header
4. Protected routes check session in their respective `layout.tsx` files

### PDF Generation
Invoice PDFs are generated server-side via `@react-pdf/renderer`. The PDF is streamed as a response from `/api/invoices/[id]/send` and can be attached to emails via Resend/Nodemailer.

### Form Handling Pattern
1. **Schema** — Defined with `zod`
2. **Hook** — Managed with `useForm` from `react-hook-form`
3. **Validation** — Integrated via `@hookform/resolvers/zod`
4. **Value safety** — Use `field.value ?? ""` to avoid null-controlled-to-uncontrolled warnings

### Command Palette (⌘K)
A global command palette powered by `cmdk` is mounted in the dashboard layout. The search bar in `DashboardHeader` dispatches a synthetic `keydown` event to open it.

---

## 6. Environment Variables

```env
# Required — Supabase connection
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key

# Required — Admin features
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=admin@yourdomain.com

# Server-only (never expose client-side)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email services (choose one or both)
RESEND_API_KEY=re_...
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@yourdomain.io
SMTP_PASS=your-smtp-password

# Optional — redirect after email confirmation
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

---

## 7. SQL Migration Scripts

Scripts are numbered sequentially in `scripts/`:

| Script | Purpose |
|---|---|
| `enterprise_upgrade.sql` | Master schema — run this first for full setup |
| `010_create_quotes.sql` | Quote management tables |
| `011_enhance_invoice_lifecycle.sql` | Invoice status timeline & lifecycle events |
| `012_create_suppliers.sql` | Supplier entity and RLS |
| `012.1_patch_suppliers.sql` | Supplier schema patch |
| `012.2_fix_rls_recursion.sql` | RLS policy recursion fix |
| `013_create_purchase_orders.sql` | Purchase order tables |
| `014_create_finance_expenses.sql` | Finance/expense tracking |
| `015_create_automations.sql` | Workflow automation tables |
| `activities.sql` | Activity feed events |

---

## 8. Design Standards

- **No hardcoded dark colors** in new components — always use `bg-card`, `bg-secondary`, `text-foreground`, `border-border`
- **No `text-white`** in shared components — use `text-foreground` or `text-primary-foreground`
- **Brand color** — `text-primary` / `bg-primary` (maps to Indigo, adapts to light/dark)
- **Cursors** — All interactive elements globally set to `cursor-pointer` via `globals.css`
- **No italic** — `font-style: normal !important` applied globally
- **Spacing** — Dashboard pages use `p-6 md:p-8 space-y-6 md:space-y-8` as the standard layout
- **Auth pages** — Split-panel design: left = theme-aware form, right = intentional dark hero panel

---

*This document is maintained by the Bntec engineering team and AI agents. — April 2026*
