# Complete SaaS Setup Guide - InvoiceHub

> Your application is now equipped with full CRUD operations, separate dashboards, and subscription management!

## ✅ What Has Been Implemented

### 1. **Subscription System**
- ✅ Subscription Plans table (Free, Pro, Enterprise)
- ✅ Subscriptions table for company tracking
- ✅ Usage tracking for rate limiting
- ✅ Trial period support
- ✅ Plan upgrade/downgrade functionality

### 2. **Authorization & Access Control**
- ✅ Role-based access control (owner, admin, staff, super_admin)
- ✅ Company-level data isolation
- ✅ Subscription-based feature access
- ✅ Usage limit enforcement
- ✅ Super admin dashboard access

### 3. **API Routes with Full CRUD**

#### Customers API
```
GET    /api/customers              # List all customers
POST   /api/customers              # Create new customer
GET    /api/customers/[id]         # Get specific customer
PUT    /api/customers/[id]         # Update customer
DELETE /api/customers/[id]         # Delete customer
```

#### Products API
```
GET    /api/products               # List all products
POST   /api/products               # Create new product
GET    /api/products/[id]          # Get specific product
PUT    /api/products/[id]          # Update product
DELETE /api/products/[id]          # Delete product
```

#### Invoices API
```
GET    /api/invoices               # List all invoices
POST   /api/invoices               # Create new invoice
GET    /api/invoices/[id]          # Get specific invoice
PUT    /api/invoices/[id]          # Update invoice
DELETE /api/invoices/[id]          # Delete invoice
```

#### Subscriptions API
```
GET    /api/subscriptions          # Get current subscription
PUT    /api/subscriptions/[id]     # Upgrade plan
DELETE /api/subscriptions/[id]     # Cancel subscription
```

### 4. **Client Dashboard**
- ✅ Real-time data from Supabase
- ✅ Revenue and invoice metrics
- ✅ Customer and product counts
- ✅ Low stock alerts
- ✅ 6-month revenue trend chart
- ✅ Subscription info card

### 5. **Admin Dashboard** (`/dashboard/admin`)
- ✅ System-wide overview
- ✅ Company management
- ✅ Revenue analytics
- ✅ Subscription distribution
- ✅ User usage metrics
- ✅ Plan upgrade tracking

### 6. **Subscription Management Page** (`/dashboard/subscription`)
- ✅ Current plan display
- ✅ Usage limits and metrics
- ✅ Usage percentage indicators
- ✅ All available plans with features
- ✅ Plan upgrade capability
- ✅ Trial information

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Run the subscription schema migration in your Supabase dashboard:

1. Go to Supabase Console > Your Project > SQL Editor
2. Create a new query and paste the contents of: `scripts/009_create_subscriptions.sql`
3. Run the query

This will:
- Create subscription_plans table
- Create subscriptions table
- Create subscription_usage table
- Insert default plans (Free, Pro, Enterprise)
- Set up RLS policies

### Step 2: Create Initial Subscription for Existing Users

Run this query to assign Free plan to existing companies:

```sql
INSERT INTO public.subscriptions (
  company_id,
  plan_id,
  subscription_type,
  current_period_start,
  current_period_end,
  status,
  is_trial_active,
  trial_start_date,
  trial_end_date
)
SELECT 
  c.id,
  p.id,
  'monthly',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  'trial',
  true,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '14 days'
FROM public.companies c
CROSS JOIN public.subscription_plans p
WHERE p.name = 'Free'
  AND c.id NOT IN (SELECT company_id FROM public.subscriptions)
ON CONFLICT (company_id) DO NOTHING;
```

### Step 3: Initialize Usage Tracking

Run this query to initialize usage metrics:

```sql
INSERT INTO public.subscription_usage (
  subscription_id,
  metric_name,
  current_usage,
  reset_date
)
SELECT 
  s.id,
  metric.name,
  0,
  CURRENT_DATE
FROM public.subscriptions s
CROSS JOIN (
  SELECT 'invoices' as name
  UNION ALL SELECT 'customers'
  UNION ALL SELECT 'products'
  UNION ALL SELECT 'users'
) metric
ON CONFLICT (subscription_id, metric_name) DO NOTHING;
```

### Step 4: Update Environment Variables

If needed, add super admin email to `.env.local`:

```env
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=your-admin@example.com
```

### Step 5: Deploy to Vercel

```bash
git add .
git commit -m "Add complete SaaS features: CRUD, dashboards, and subscriptions"
git push
```

---

## 📖 Usage Examples

### Create a Customer

```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "phone": "+1-555-0123",
    "address": "123 Business St, City, State"
  }'
```

### Create a Product

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Premium Widget",
    "sku": "PW-001",
    "description": "A premium quality widget",
    "unit_price": 99.99,
    "cost_price": 50.00,
    "quantity": 100,
    "min_stock_level": 10
  }'
```

### Create an Invoice

```bash
curl -X POST http://localhost:3000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": "uuid-here",
    "due_date": "2024-04-30",
    "subtotal": 1000,
    "tax_amount": 100,
    "discount_amount": 0,
    "total": 1100,
    "notes": "Payment due within 30 days"
  }'
```

### Upgrade Subscription

```bash
curl -X PUT http://localhost:3000/api/subscriptions/subscription-id \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": "pro-plan-uuid"
  }'
```

---

## 🔒 User Roles & Permissions

### Customer (Staff) User
- ✅ View their company data
- ✅ Create/read invoices
- ❌ Edit customers (unless promoted)
- ❌ Delete products (unless promoted)

### Company Admin
- ✅ Full access to all company features
- ✅ Manage customers, products, invoices
- ✅ Access company settings
- ✅ Manage team members

### Company Owner
- ✅ All admin permissions
- ✅ Manage subscription plan
- ✅ Billing management
- ✅ Company settings

### Super Admin
- ✅ View all companies
- ✅ Manage subscriptions
- ✅ System analytics
- ✅ Access admin dashboard

---

## 📊 Dashboard Navigation

### For Regular Users
```
Dashboard (client) → /dashboard
  ├── Revenue metrics
  ├── Customer count
  ├── Product inventory
  ├── Low stock alerts
  ├── Invoice trends
  └── Subscription info

Customers → /dashboard/customers
Inventory → /dashboard/inventory
Invoices → /dashboard/invoices
Settings → /dashboard/settings
Subscription → /dashboard/subscription
```

### For Super Admins
```
Dashboard (admin) → /dashboard/admin
  ├── System-wide metrics
  ├── Company list
  ├── Revenue analytics
  ├── Subscription distribution
  └── Top companies
```

---

## 🧪 Testing Checklist

### Authentication & Authorization
- [ ] User can login and see their dashboard
- [ ] Regular user cannot access `/dashboard/admin`
- [ ] Super admin can access `/dashboard/admin`
- [ ] User cannot view another company's data
- [ ] Free plan users get "limit reached" error when exceeding quota

### API Operations
- [ ] POST /api/customers creates a customer
- [ ] GET /api/customers returns user's customers
- [ ] PUT /api/customers/[id] updates customer
- [ ] DELETE /api/customers/[id] deletes customer
- [ ] Same for products and invoices

### Subscription Features
- [ ] Users can view subscription page
- [ ] Can see current plan and limits
- [ ] Usage metrics show correctly
- [ ] Can upgrade to Pro or Enterprise
- [ ] Can't exceed plan limits

### Dashboards
- [ ] Client dashboard shows real data
- [ ] Admin dashboard shows all companies
- [ ] Charts render correctly
- [ ] Low stock alerts appear
- [ ] Usage indicators work

---

## 🔧 Database Schema Reference

### subscription_plans
```sql
- id (UUID)
- name (TEXT) - Free, Pro, Enterprise
- monthly_price (NUMERIC)
- yearly_price (NUMERIC)
- max_invoices (INTEGER) - 0 = unlimited
- max_customers (INTEGER)
- max_products (INTEGER)
- max_users (INTEGER)
- features (JSONB)
- is_active (BOOLEAN)
```

### subscriptions
```sql
- id (UUID)
- company_id (UUID) - Foreign key to companies
- plan_id (UUID) - Foreign key to subscription_plans
- status (TEXT) - active, canceled, past_due, trial
- subscription_type (TEXT) - monthly, yearly
- current_period_start (DATE)
- current_period_end (DATE)
- is_trial_active (BOOLEAN)
- trial_start_date (DATE)
- trial_end_date (DATE)
```

### subscription_usage
```sql
- id (UUID)
- subscription_id (UUID) - Foreign key to subscriptions
- metric_name (TEXT) - invoices, customers, products, users
- current_usage (INTEGER)
- reset_date (DATE)
```

---

## 🐛 Troubleshooting

### "Unauthorized" errors
- ✅ Check if user is logged in
- ✅ Verify company_id in profiles table
- ✅ Check RLS policies are enabled

### "Limit reached" on free plan
- ✅ User needs to upgrade to Pro or Enterprise
- ✅ Admin can manually adjust limits in database

### Dashboard shows no data
- ✅ Check if user's profile has company_id
- ✅ Verify data exists in database
- ✅ Check browser console for errors
- ✅ Try refreshing the page

### Super admin access denied
- ✅ Set NEXT_PUBLIC_SUPER_ADMIN_EMAIL in env
- ✅ Make sure user email matches
- ✅ Check user metadata in Supabase

---

## 🎯 Next Steps

1. **Integrate Stripe/Paddle** for payments
2. **Add email notifications** for updates
3. **Implement PDF invoicing**
4. **Add advanced reporting** features
5. **Set up webhook handlers** for payment processing
6. **Add team management** module
7. **Implement audit logging**
8. **Add API key management** for integrations

---

## 📞 Support

For issues or questions:
1. Check `/dashboard/admin` for system status
2. Review database logs in Supabase
3. Check browser console for client-side errors
4. Review server logs in Vercel

Good luck with your SaaS! 🚀
