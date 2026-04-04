<div align="center">

# ⬡ InvoiceHub Protocol

**Enterprise-Grade SaaS for Financial Operations & Inventory Intelligence**

*Built on Next.js 16 · Supabase · Tailwind CSS 4 · React PDF*

---

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-6366f1?style=flat-square)](LICENSE)

</div>

---

## What is InvoiceHub?

InvoiceHub is a production-ready, multi-tenant SaaS platform for businesses that demand precision in financial operations. From invoice creation to PDF dispatch, from real-time inventory to customer analytics — everything lives in one unified protocol.

---

## ✦ Feature Matrix

### 🧾 Financial Operations
- **Invoice Builder** — Create sale invoices & purchase orders with line-item granularity
- **Multi-Status Tracking** — Draft → Sent → Paid → Overdue with visual indicators
- **Discount & Tax Engine** — Per-line and invoice-level financial metrics
- **PDF Generation** — Professional A4 manifests via `@react-pdf/renderer` (Helvetica, zero CDN dependency)
- **Email Dispatch** — Send invoices directly to customers with embedded PDF attachments
- **Print Protocol** — Clean print-only view, no UI chrome included

### 📦 Inventory Intelligence
- **Real-Time Stock Tracking** — Live quantity monitoring with SKU management
- **Low-Stock Alerts** — Automated threshold notifications on the client dashboard
- **Product Catalog** — Purchase price, retail price, and unit type management
- **Multi-Company Isolation** — Each tenant has fully isolated product data via RLS

### 👥 Customer Relationship Management
- **Customer Database** — Name, email, phone, address, and VAT registry
- **Spending Analytics** — Revenue attribution per customer
- **Invoice History** — Full transaction timeline per stakeholder

### 🏢 Multi-Tenant Architecture
- **Client Dashboard** — Personalized revenue, invoice, and inventory overview per company
- **Admin Console** — Platform-wide control panel for system administrators
- **Nuclear Reset** — Full data seed/wipe via Admin Console for demo environments
- **Company Management** — Multi-company support with per-company financial isolation

### 🛡️ Security & Access Control
- **Row-Level Security (RLS)** — Supabase enforced data isolation at the database layer
- **Server-Side Auth** — Secure session management via Next.js middleware
- **Role-Based Access** — Owner / Admin / Super Admin role hierarchy
- **Audit Integrity** — Financial schema designed for idempotent migrations

### 🌐 Internationalization
- **Multi-Language Support** — Arabic (RTL), English, French, German
- **Inter Typeface** — Full weight range (300–800) with Latin Extended support
- **RTL Layout** — Automatic direction switching for Arabic locale

### 📊 Business Intelligence
- **Revenue Dynamics** — Monthly growth and collections trajectory charts
- **Invoice Analytics** — Status distribution and financial aggregates
- **Inventory Dashboard** — Stock level monitoring and reorder indicators

---

## 🚀 Quick Setup

### 1. Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
NEXT_PUBLIC_SUPER_ADMIN_EMAIL="admin@yourdomain.com"
```

### 2. Database Initialization

Run in your **Supabase SQL Editor** in this order:

```
scripts/phase2_database_schema.sql   ← Core tables & RLS policies
scripts/v2_safe_migration.sql        ← Financial schema (discount, tax_rate)
scripts/missing_logic.sql            ← Auth triggers & subscription plans
```

### 3. Local Development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) and log in with your Super Admin email.

### 4. Seed the Platform

In the **Admin Console → System Controls**, click **"Seed Platform"** to populate the dashboard with realistic demo data including invoices, customers, inventory, and line items.

---

## 🏗️ Architecture

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Language** | TypeScript 5, React 19 |
| **Styling** | Tailwind CSS 4, shadcn/ui |
| **Database** | Supabase (PostgreSQL + RLS) |
| **Auth** | Supabase Auth + Next.js Middleware |
| **PDF Engine** | @react-pdf/renderer (Helvetica — zero CDN) |
| **Email** | Nodemailer / Resend (configurable) |
| **Charts** | Recharts |
| **Fonts** | Inter (300–800) via next/font/google |
| **i18n** | next-intl (AR, EN, FR, DE) |

---

## 📂 Project Structure

```
Chr0xD/
├── app/
│   ├── [locale]/
│   │   ├── dashboard/        # Client dashboard routes
│   │   ├── admin/            # Admin console routes
│   │   └── auth/             # Auth pages
│   └── api/
│       ├── invoices/         # Invoice CRUD & PDF dispatch
│       └── debug/seed/       # Platform seeding endpoint
├── components/
│   ├── invoices/             # InvoiceBuilder, InvoicePDF, InvoiceDetail
│   ├── admin/                # Admin console components
│   └── ui/                   # shadcn/ui primitives (zero italic)
├── lib/                      # Supabase client, email, utilities
├── scripts/                  # SQL migrations (idempotent)
│   ├── phase2_database_schema.sql
│   ├── v2_safe_migration.sql
│   └── missing_logic.sql
├── hooks/                    # Custom React hooks
└── public/                   # Icons & static assets
```

---

## 📐 Design Standards

- **Typography**: Inter — clean, geometric, no italic anywhere
- **Font Weights**: `700/800` headings · `600` subheadings · `400` body · `500` labels
- **Overlays**: Solid `bg-black/60`, zero backdrop blur — sharp, professional modals
- **Color System**: Indigo primary (`#4f46e5`) · Slate foreground · No pure red/green/blue

---

## 📄 License

This project is licensed under the **MIT License**.
