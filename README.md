<div align="center">

<img src="public/Icon.png" alt="Bntec Logo" width="80" height="80" />

# ⬡ Bntec

**Enterprise-Grade Financial Operations Platform**

*Next.js 16 · Supabase · Tailwind CSS 4 · TypeScript 5 · React 19*

---

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4.2-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)](LICENSE)

</div>

---

## What is Bntec?

Bntec is a production-ready, multi-tenant SaaS platform for businesses that demand precision in financial operations. From professional invoice creation to PDF dispatch, from real-time inventory intelligence to CRM analytics — everything lives in one unified, premium experience.

> Fully operational in **light and dark mode**, with RTL support (Arabic) and multi-language localization.

---

## ✦ Feature Matrix

### 🧾 Financial Operations
- **Invoice Builder** — Create sale invoices & purchase orders with line-item granularity
- **Quote Management** — Generate and convert quotes to invoices seamlessly
- **Multi-Status Tracking** — Draft → Sent → Paid → Overdue with visual indicators
- **Discount & Tax Engine** — Per-line and invoice-level financial metrics
- **PDF Generation** — Professional A4 documents via `@react-pdf/renderer` (zero CDN, Helvetica)
- **Email Dispatch** — Send invoices directly to customers with embedded PDF attachments via Resend or SMTP

### 📦 Inventory Intelligence
- **Real-Time Stock Tracking** — Live quantity monitoring with SKU management
- **Product Catalog** — Purchase price, retail price, unit type, and category management
- **Supplier Management** — Full supplier records with purchase order tracking
- **Purchase Orders** — Create and track POs linked to inventory movements
- **Stock Movement History** — Full audit trail of inventory changes
- **Low-Stock Alerts** — Automated threshold notifications

### 👥 Customer Relationship Management
- **Customer Database** — Name, email, phone, address, VAT registry
- **Spending Analytics** — Revenue attribution per customer
- **Invoice History** — Full transaction timeline per stakeholder
- **Customer Portal** — Self-service portal for customers to view their invoices

### 💰 Finance & Reporting
- **Expense Tracking** — Log and categorize operational expenses
- **Finance Dashboard** — Revenue vs. expenses, profit margins
- **Sales Reports** — Detailed revenue breakdowns by period and category
- **Inventory Reports** — Stock valuation and movement analytics

### 🏢 Multi-Tenant Architecture
- **Dashboard** — Personalized company revenue, invoice, and inventory overview
- **Admin Console** — Platform-wide control panel for super administrators
- **Company Management** — Multi-company support with per-company financial isolation via RLS
- **User Identity Management** — Role-based access: Member / Admin / Super Admin

### 🛡️ Security & Access Control
- **Row-Level Security (RLS)** — Supabase-enforced data isolation at the database layer
- **Server-Side Auth** — Secure session management via `@supabase/ssr`
- **Role-Based Access** — Granular permission hierarchy
- **License System** — Software activation and device revocation for POS integrations

### 🌐 Internationalization
- **Multi-Language** — Arabic (RTL), English, French, German via `next-intl`
- **RTL Layout** — Automatic direction switching for Arabic locale
- **Localized Routing** — SEO-friendly `/{locale}/` URL structure

### ⚙️ Automation & AI
- **Workflow Automations** — Rule-based triggers for recurring operations
- **AI-Assisted Features** — Google AI SDK integration for intelligent suggestions
- **Background Jobs** — Upstash QStash for reliable async task processing
- **Caching** — Upstash Redis for performance-critical paths

### 🎨 Premium UI/UX
- **Light & Dark Mode** — Full theme-aware design, no hardcoded dark colors
- **Command Palette** — Global ⌘K search across all documents and actions
- **Glassmorphism** — Premium `.glass-card` and `.glass-dashboard` utilities
- **Micro-animations** — Smooth transitions, floating badges, and hover effects
- **Responsive** — Mobile-first, fully adaptive layouts

---

## 🚀 Quick Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-org/invoiceshub-nexxt.git
cd invoiceshub-nexxt
pnpm install
```

### 2. Environment Configuration

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=admin@yourdomain.com

# Email (Resend recommended)
RESEND_API_KEY=re_...

# Optional: dev redirect after email confirmation
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
```

### 3. Database Initialization

Run in your **Supabase SQL Editor**:

```sql
-- Master schema with all tables, RLS, and default settings
scripts/enterprise_upgrade.sql

-- Additional feature migrations (run in order)
scripts/010_create_quotes.sql
scripts/011_enhance_invoice_lifecycle.sql
scripts/012_create_suppliers.sql
scripts/013_create_purchase_orders.sql
scripts/014_create_finance_expenses.sql
scripts/015_create_automations.sql
scripts/activities.sql
```

### 4. Local Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your super admin email.

### 5. Seed Demo Data

In the **Admin Console → Operations**, use the seed controls to populate the platform with realistic demo data.

---

## 🏗️ Architecture Overview

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2 (App Router, Webpack) |
| **Language** | TypeScript 5.7 + React 19.2 |
| **Styling** | Tailwind CSS 4.2 + shadcn/ui + Radix UI |
| **Database** | Supabase PostgreSQL + Row-Level Security |
| **Auth** | Supabase Auth + `@supabase/ssr` |
| **PDF Engine** | `@react-pdf/renderer` v4 (Helvetica, zero CDN) |
| **Email** | Resend / Nodemailer (configurable) |
| **Charts** | Recharts 2.15 |
| **i18n** | next-intl v4 (AR, EN, FR, DE) |
| **Theme** | next-themes (CSS variable tokens) |
| **Caching** | Upstash Redis |
| **Jobs** | Upstash QStash |
| **AI** | Google AI SDK + Vercel AI SDK |
| **Fonts** | Inter (300–800, local WOFF2) |

---

## 📂 Project Structure

```
InvoicesHub Nexxt/
├── app/
│   ├── globals.css               # Design tokens, theme vars, light-mode compat
│   └── [locale]/
│       ├── page.tsx              # Landing page
│       ├── auth/login/           # Login (theme-aware split-panel)
│       ├── auth/sign-up/         # Registration (theme-aware split-panel)
│       ├── dashboard/            # Main client dashboard
│       │   ├── invoices/         # Invoicing module
│       │   ├── customers/        # CRM module
│       │   ├── inventory/        # Inventory + products/suppliers/POs
│       │   ├── sales/            # Sales tracking
│       │   ├── finance/          # Expenses & finance
│       │   ├── reports/          # Analytics reports
│       │   ├── automation/       # Workflow rules
│       │   ├── settings/         # User/company settings
│       │   ├── subscription/     # Billing & plans
│       │   └── admin/            # Super admin console
│       └── portal/               # Customer self-service portal
├── components/
│   ├── dashboard-header.tsx      # Sticky header (search, Bell, avatar)
│   ├── dashboard-sidebar.tsx     # Client nav sidebar
│   ├── admin-sidebar.tsx         # Admin nav sidebar
│   ├── landing-navbar.tsx        # Landing navigation
│   ├── landing-footer.tsx        # Landing footer
│   ├── landing/                  # Landing page sections
│   └── ui/                       # shadcn/ui primitives
├── lib/
│   ├── supabase/                 # client, server, admin, database, middleware
│   ├── domain/                   # Business logic entities
│   ├── events/                   # Domain event system
│   └── jobs/                     # Background job definitions
├── hooks/                        # use-auth-user, use-subscription, use-export
├── scripts/                      # SQL migrations (000–015+)
├── i18n/ & messages/             # Localization config and translations
└── public/                       # Static assets, fonts
```

> See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete, detailed reference.

---

## 🎨 Design System

| Token | Value |
|---|---|
| **Primary (light)** | `#4f46e5` — Indigo 600 |
| **Primary (dark)** | `#6366f1` — Indigo 500 |
| **Background (light)** | `#fbfbfe` |
| **Background (dark)** | `#0b0e14` |
| **Typography** | Inter, geometric, no italic |
| **Heading weights** | `800` h1 · `700` h2/h3 · `600` h4 |
| **Border radius** | `0.75rem` base (`--radius`) |
| **Theme** | CSS variables via `@theme inline`, switched by `.dark` class |

**Key rules for contributors:**
- ✅ Use `text-foreground`, `bg-card`, `border-border`, `text-primary`
- ❌ Never use `text-white`, `bg-[#030303]`, `border-white/5` in shared components
- ✅ Interactive elements automatically receive `cursor-pointer` globally
- ✅ Auth pages use split-panel: left = theme-aware form, right = dark hero panel

---

## 📄 License

This project is licensed under the **MIT License** — see [LICENSE](./LICENSE) for details.

---

<div align="center">

Built with precision by **Bntec Engineering** · April 2026

</div>
