# InvoiceHub - Invoice & Inventory SaaS

A modern, full-featured Invoice and Inventory Management SaaS application built with Next.js, Supabase, and TypeScript.

## Features

- **Dashboard**: Real-time KPIs with revenue trends, invoice tracking, and business insights
- **Invoice Management**: Create, send, and track invoices with status management
- **Inventory Management**: Track products, stock levels, and low-stock alerts
- **Customer Management**: Manage customer relationships and view transaction history
- **Settings**: Configure company information, notifications, and security preferences
- **Authentication**: Secure Supabase authentication with email/password
- **Bilingual Ready**: Architecture supports English/Arabic (RTL) switching

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui with Tailwind CSS
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone and install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up Supabase environment variables**:
   
   Add these variables to your `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Find these values in your Supabase dashboard:
   - Project Settings → API → Project URL
   - Project Settings → API → Anon Public Key

3. **Set up database schema**:
   
   The SQL migration scripts are located in `/scripts/`:
   - `001_create_profiles.sql` - User profiles table
   - `002_create_companies.sql` - Company/organization data
   - `003_create_customers.sql` - Customer records
   - `004_create_categories.sql` - Product categories
   - `005_create_products.sql` - Inventory products
   - `006_create_invoices.sql` - Invoice records
   - `007_create_invoice_items.sql` - Invoice line items
   - `008_profile_trigger.sql` - Auto-create profiles on signup

   Execute these scripts in Supabase SQL Editor in the order listed.

4. **Run the development server**:
   ```bash
   pnpm dev
   ```

5. **Open the app**:
   Navigate to `http://localhost:3000`

## Project Structure

```
/app
  /dashboard           # Protected dashboard routes
    /layout.tsx       # Dashboard layout with sidebar
    /page.tsx         # Main dashboard/KPI page
    /inventory        # Inventory management
    /invoices         # Invoice management
    /customers        # Customer management
    /settings         # Settings page
  /auth               # Authentication routes
    /login            # Login page
    /sign-up          # Sign up page
  /layout.tsx         # Root layout
  /page.tsx           # Landing page

/lib
  /supabase          # Supabase client setup
    /client.ts       # Browser client
    /server.ts       # Server client
    /middleware.ts   # Auth middleware

/components
  /ui                # shadcn/ui components

/scripts            # Database migration scripts
```

## Key Pages

### Landing Page (`/`)
- Unauthenticated users see marketing landing page
- Authenticated users are redirected to dashboard

### Dashboard (`/dashboard`)
- KPI cards showing total revenue, invoices, products, customers
- Revenue trend chart (6-month data)
- Top products by sales
- Low stock alerts

### Inventory (`/dashboard/inventory`)
- Product listing with search
- Add new products
- View stock levels and status
- Edit/delete products

### Invoices (`/dashboard/invoices`)
- Create new invoices
- View all invoices with status tracking
- Search by invoice number or customer
- Download/send capabilities (UI ready)

### Customers (`/dashboard/customers`)
- Customer cards with contact info
- View total invoices and spending
- Add new customers
- Edit/delete customer records

### Settings (`/dashboard/settings`)
- Update company information
- Configure currencies and tax rates
- Notification preferences
- Security settings (password, 2FA)

## Authentication Flow

1. Unauthenticated users see landing page with sign-up/login CTAs
2. Users can sign up with email and password
3. Email confirmation required (configured in Supabase)
4. After confirmation, users are redirected to dashboard
5. Session managed via Supabase auth middleware
6. Protected routes redirect to login if not authenticated

## Database Schema Overview

- **profiles** - User profiles linked to auth.users
- **companies** - Organization/company data
- **customers** - Client/customer information
- **categories** - Product categories
- **products** - Inventory items with SKU, pricing, quantities
- **invoices** - Invoice headers with status tracking
- **invoice_items** - Individual line items for invoices

All tables include Row Level Security (RLS) policies for data protection.

## Next Steps

### To Add Real Data Persistence:

1. **Connect Dashboard to Supabase**:
   - Replace mock data in pages with Supabase queries
   - Use SWR or React Query for data fetching
   - Implement optimistic updates for better UX

2. **Add Data Management Functions**:
   - Create, read, update, delete operations for each entity
   - Implement proper error handling
   - Add loading and success states

3. **Implement PDF Generation**:
   - Add invoice PDF export capability
   - Generate PDFs for email sending

4. **Add Email Notifications**:
   - Invoice sent confirmations
   - Payment reminders
   - Low stock alerts

## Deployment

Deploy to Vercel with one click:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add Supabase environment variables in Vercel project settings
4. Deploy

## Support

For issues or questions, check:
- Supabase documentation: https://supabase.com/docs
- Next.js documentation: https://nextjs.org/docs
- shadcn/ui components: https://ui.shadcn.com

## License

MIT
