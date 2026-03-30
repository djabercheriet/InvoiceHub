# Quick Start Guide - InvoiceHub

## 🚀 Getting Started in 5 Minutes

### Step 1: Configure Supabase Integration
1. Open **Settings** (top right) → **Vars**
2. Add these environment variables from your Supabase dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
3. Save and the app will automatically detect the integration

### Step 2: Initialize Database Schema
1. Go to your Supabase dashboard
2. Open **SQL Editor**
3. Execute the migration scripts in `/scripts/` in this order:
   - `001_create_profiles.sql`
   - `002_create_companies.sql`
   - `003_create_customers.sql`
   - `004_create_categories.sql`
   - `005_create_products.sql`
   - `006_create_invoices.sql`
   - `007_create_invoice_items.sql`
   - `008_profile_trigger.sql`

### Step 3: Create Your First Account
1. Click **Get Started** on the landing page
2. Sign up with email and password
3. Verify your email (check spam folder)
4. Log in and you're ready to go!

## 📋 App Overview

### Main Sections

**Dashboard** 
- View all your KPIs at a glance
- Revenue trends and top products
- Low stock alerts

**Inventory**
- Manage your product catalog
- Track stock levels
- Set reorder alerts

**Invoices**
- Create and send invoices
- Track payment status
- Generate PDFs

**Customers**
- Manage customer contacts
- View transaction history
- Track customer value

**Settings**
- Update company information
- Configure currencies and taxes
- Set notification preferences

## 🔧 Development

### Run the app locally:
```bash
pnpm dev
```
Open http://localhost:3000

### Project structure:
- `/app` - Next.js pages and routes
- `/lib/supabase` - Supabase client configuration
- `/components/ui` - shadcn/ui components
- `/scripts` - Database migration files

## 📊 Current Data

The app is currently using **mock data** for display. Here's what needs to be connected:

### To Add Real Data:
1. Replace mock data in dashboard with Supabase queries
2. Implement create/update/delete functions for each module
3. Add form submissions to save data to database
4. Implement real-time data fetching with SWR or React Query

### Example - Current Flow:
```typescript
// Currently: Mock data
const mockKPIs = { ... }

// To Connect: Query Supabase
const { data: invoices } = await supabase
  .from('invoices')
  .select('*')
```

## 🔐 Authentication

- Email/password authentication via Supabase Auth
- Automatic email verification
- Session management handled by middleware
- Protected routes redirect to login

## 📱 Features (Ready to Use)

✅ Professional UI with sidebar navigation
✅ Responsive design for mobile/tablet
✅ Dark theme with proper contrast
✅ Supabase authentication setup
✅ Database schema created
✅ All main pages built
✅ Search and filtering UI
✅ Data visualization with Recharts
✅ Status tracking and badges

## ⚡ Next Steps (Optional Enhancements)

1. **Connect to Real Data**
   - Replace mock data with Supabase queries
   - Add data persistence for forms

2. **Add PDF Export**
   - Generate invoice PDFs
   - Email invoices to customers

3. **Implement Notifications**
   - Email reminders for unpaid invoices
   - Low stock alerts

4. **Add Team Management**
   - Multi-user support
   - Role-based permissions

5. **Payment Integration**
   - Accept payments directly
   - Stripe/Razorpay integration

## 📞 Troubleshooting

### Can't sign up?
- Check email confirmation in your inbox/spam
- Verify Supabase environment variables are set
- Check Supabase Auth settings allow password signup

### Dashboard not loading?
- Verify Supabase connection in Settings → Vars
- Check browser console for errors
- Ensure you're logged in

### Forms not submitting?
- These are UI-only currently - database integration needed
- Check the README for how to add backend connections

## 🎯 Success Criteria

You'll know it's working when:
- ✅ Can sign up with email/password
- ✅ Can log in and access dashboard
- ✅ Can view all menu items and pages
- ✅ Can see KPI cards and charts on dashboard
- ✅ Search and filter work on inventory/invoices/customers
- ✅ Can add new items (forms ready for backend)
- ✅ Settings page loads with form fields

## 📖 Learn More

- [Supabase Docs](https://supabase.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Happy invoicing! 🎉**
