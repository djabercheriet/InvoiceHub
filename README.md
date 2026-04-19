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
[![License](https://img.shields.io/badge/License-MIT-06B6D4?style=flat-square)](LICENSE)

</div>

---

## What is Bntec?

Bntec is a production-ready, multi-tenant SaaS platform for businesses that demand precision in financial operations. From professional invoice creation to real-time inventory intelligence and CRM analytics — everything lives in one unified, premium experience designed for **Operational Intelligence**.

> Fully operational in **light and dark mode**, with RTL support (Arabic) and multi-language localization.

---

## ✦ Feature Matrix

### 🧾 Financial Operations
- **Invoice Builder** — Create sale invoices & purchase orders with line-item granularity
- **Quote Management** — Generate and convert quotes to invoices seamlessly
- **Multi-Status Tracking** — Draft → Sent → Paid → Overdue with visual indicators
- **Discount & Tax Engine** — Per-line and invoice-level financial metrics
- **PDF Generation** — Professional A4 documents via `@react-pdf/renderer` (zero CDN, Helvetica)
- **Email Dispatch** — Send invoices directly to customers with embedded PDF attachments

### 📦 Inventory Intelligence
- **Real-Time Stock Tracking** — Live quantity monitoring with SKU management
- **Product Catalog** — Purchase price, retail price, unit type, and category management
- **Supplier Management** — Full supplier records with purchase order tracking
- **Purchase Orders** — Create and track POs linked to inventory movements
- **Stock Movement History** — Full audit trail of inventory changes

### 🛡️ Security & Access Control
- **Supabase Auth** — Secure session management via `@supabase/ssr`
- **Google OAuth Integration** — Standardized "Continue with Google" flow for rapid onboarding
- **Row-Level Security (RLS)** — Database-layer isolation ensuring peak data privacy
- **Role-Based Access** — Granular permission hierarchy (Member / Admin / Super Admin)

### 🏢 Super Admin & Billing
- **Tier Architecture Hub** — Authoritative control panel for platform-wide subscription protocols
- **Subscription Protocols** — Manage Free, Pro, and Enterprise tiers with granular feature toggles (JSONB)
- **Resource Allocation** — Configure limits for invoices, nodes, assets, and operators

### 🎨 Premium UI/UX (Standardized)
- **Cyan Branding** — Refreshed design system centered on high-contrast Cyan/Primary accents
- **Theme Awareness** — 100% light/dark mode compatibility with verified contrast ratios
- **Glassmorphism** — Premium `.glass-card` and `.glass-dashboard` utilities for a state-of-the-art look
- **Responsive Matrix** — Fully adaptive layouts from mobile to ultra-wide displays

---

## 🚀 Recent Achievements

As of April 2026, the platform has undergone a **Global UI Standardization**:
1.  **Refactor**: Transitioned from legacy Indigo to a modern **Cyan Design System**.
2.  **Auth Evolution**: Implemented **Google OAuth** on both Login and Sign-up paths.
3.  **Admin Empowerment**: Completed the **Tier Protocol Management** module for Super Admins.
4.  **Database Optimization**: Enhanced RLS policies and expanded JSONB feature sets for flexible tiering.

---

## 🏗️ Architecture Overview

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.2 (App Router) |
| **Language** | TypeScript 5.7 + React 19.2 |
| **Styling** | Tailwind CSS 4.2 + shadcn/ui |
| **Database** | Supabase PostgreSQL + RLS |
| **Auth** | Supabase Auth + Google OAuth |
| **PDF Engine** | `@react-pdf/renderer` v4 |
| **Charts** | Recharts 2.15 |
| **Theme** | next-themes (CSS Custom Properties) |

---

## 📂 Project Structure

```
InvoicesHub Nexxt/
├── app/
│   ├── globals.css               # Design tokens, Cyan primary system
│   ├── middleware.ts             # Auth & Locale orchestration
│   └── [locale]/
│       ├── auth/                 # Standardized Login & Sign-up (OAuth enabled)
│       ├── dashboard/            # Unified client interface
│       │   ├── inventory/        # Supply chain & stock logic
│       │   ├── invoices/         # Billing engine
│       │   ├── subscription/     # Plan dashboard
│       │   └── admin/            # Super Admin Master Hub
│       └── portal/               # Stakeholder portal
├── components/                   # Shared UI primitives and complex sections
├── lib/                          # Supabase, Domain Logic, and Background Jobs
├── hooks/                        # Feature-specific custom hooks
└── public/                       # Local assets and optimized fonts
```

---

## 🎨 Design System

| Token | Value |
|---|---|
| **Primary** | `#06b6d4` — Cyan 500 |
| **Background (light)** | `#fbfbfe` |
| **Background (dark)** | `#0b0e14` |
| **Typography** | Inter (Regular, Medium, Black) |
| **Radius** | `0.75rem` base |

---

## 📄 License

Licensed under the **MIT License**.

<div align="center">

Built with precision by **Bntec Engineering** · April 2026

</div>
