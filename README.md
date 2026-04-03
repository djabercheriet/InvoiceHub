# 📊 InvoiceHub

**Modern, Production-Ready SaaS for Invoice & Inventory Management**

InvoiceHub is a powerful, full-stack SaaS application built with **Next.js 16**, **Supabase**, and **Tailwind CSS 4**. It provides a unified platform for businesses to manage their invoices, monitor real-time inventory, and track customer relationships with built-in multi-tenancy and subscription management.

---

## ✨ Key Features

### 🏢 **Multi-Tenant Dashboards**
- **Client Dashboard**: Personalized overview of revenue, invoices, and low-stock alerts.
- **Admin Console**: System-wide view for platform owners to manage companies and subscriptions.

### 🧾 **Finance & Operations**
- **Invoices**: Create, track, and manage multi-status invoices (Draft, Paid, Overdue).
- **Inventory**: Real-time stock tracking with automated low-stock alerts.
- **Customers**: Comprehensive database with history and spending analytics.

### 🛡️ **Enterprise-Grade Security**
- **Row-Level Security (RLS)**: Hardened data isolation at the database layer.
- **Server-side Auth**: Secure session management via Next.js middleware.
- **Role-Based Access**: Specialized views for Owners, Admins, and Super Admins.

---

## 🚀 Quick Setup

### 1. Environment Configuration
Create a `.env.local` file with your Supabase credentials and a Super Admin email:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-anon-key"
NEXT_PUBLIC_SUPER_ADMIN_EMAIL="admin@example.com"
```

### 2. Database Initialization
Run the consolidated logic script in your **Supabase SQL Editor**:
- **Script**: `scripts/missing_logic.sql`
- This script sets up auth triggers, default subscription plans, and **demo seed data** for your first login.

### 3. Local Development
```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

---

## 🏗️ Architecture

- **Frontend**: Next.js 16 (App Router), React 19, Lucide Icons.
- **Styling**: Tailwind CSS 4, shadcn/ui.
- **Backend**: Supabase (Auth, PostgreSQL, RLS).
- **Visualization**: Recharts for business intelligence.

---

## 📂 Project Structure

```text
Chr0xD/
├── app/                 # Next.js App Router (Dashboards & Auth)
├── components/          # Reusable UI components (shadcn)
├── lib/                 # Core utilities (Supabase, Auth, Utils)
├── hooks/               # Custom React hooks
├── scripts/             # Database migrations & consolidated logic
└── public/              # Static assets & icons
```

---

## 📄 License
This project is licensed under the **MIT License**.
