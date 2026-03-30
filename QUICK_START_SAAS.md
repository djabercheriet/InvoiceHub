# Quick Implementation Guide

⚡ **Get started with your new SaaS features in 30 minutes!**

---

## Step 1: Deploy Database Changes (5 min)

1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Create a new query
4. Copy and paste the entire content of `scripts/009_create_subscriptions.sql`
5. Click **Run**

✅ You now have subscription management in your database!

---

## Step 2: Add Client Hooks Usage (Optional pero recommended)

If you want to use subscription checks in your components:

```tsx
'use client'

import { useSubscription, useCanCreateResource } from '@/hooks/use-subscription'

export function MyComponent() {
  // Check user's subscription
  const { subscription, usage } = useSubscription()
  
  // Check if user can create more customers
  const { allowed, current, limit } = useCanCreateResource('customers')
  
  return (
    <div>
      <p>Current Plan: {subscription?.plan.name}</p>
      <p>Customers: {current} / {limit === 0 ? '∞' : limit}</p>
      {!allowed && <p>⚠️ Upgrade to create more customers!</p>}
    </div>
  )
}
```

---

## Step 3: Use the API Routes

Your app now has full CRUD APIs. Here's how to use them:

### Create a Customer (TypeScript)

```typescript
// In a server action or API route
async function createCustomer(data: {
  name: string
  email?: string
  phone?: string
  address?: string
}) {
  const response = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  return response.json()
}
```

### List All Products (Client-side)

```typescript
// In a use-effect
useEffect(() => {
  fetch('/api/products')
    .then(r => r.json())
    .then(data => setProducts(data.data))
}, [])
```

### Update an Invoice

```typescript
async function updateInvoiceStatus(invoiceId: string, status: string) {
  const response = await fetch(`/api/invoices/${invoiceId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  })
  
  return response.json()
}
```

### Delete a Product

```typescript
async function deleteProduct(productId: string) {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE'
  })
  
  return response.json()
}
```

---

## Step 4: Access the New Dashboards

### Client Dashboard (Regular Users)
Navigate to: `https://your-app.vercel.app/dashboard`

✅ Shows:
- Real revenue data
- Customer metrics
- Product inventory
- Low stock alerts
- 6-month trends

### Admin Dashboard (Super Admins)
Navigate to: `https://your-app.vercel.app/dashboard/admin`

✅ Shows:
- All companies
- System revenue
- Subscription distribution
- Top performing customers
- Usage analytics

### Subscription Management (All Users)
Navigate to: `https://your-app.vercel.app/dashboard/subscription`

✅ Shows:
- Current plan
- Usage limits
- Available plans
- Upgrade options

---

## Step 5: Key Features to Know

### Automatic Limit Enforcement
Users trying to exceed their plan limits get a **402 Payment Required** error:

```json
{
  "success": false,
  "error": "Customer limit reached (5/5). Please upgrade your plan."
}
```

### Role-Based Access
```typescript
// In API routes, contexts automatically include:
context.role          // 'owner' | 'admin' | 'staff' | 'super_admin'
context.companyId     // User's company
context.isSuperAdmin  // Boolean
context.userId        // User's ID
```

### Authorization Helpers Already Used
```typescript
// In your API routes:
const context = await validateAuth(request)        // Any logged-in user
const context = await validateOwnerOrAdmin(request) // Only managers
const context = await validateCompanyAccess(request, companyId) // Company members
```

---

## 🚨 Common Errors & Solutions

### Error: "Cannot GET /api/customers"
**Problem:** User is not authenticated  
**Solution:** Make sure user is logged in before making API calls

### Error: "Forbidden"
**Problem:** User trying to access another company's data  
**Solution:** API automatically isolates by company_id from auth context

### Error: "Limit reached"
**Problem:** User exceeded their plan limits  
**Solution:** 
- Free plan: Max 10 invoices, 5 customers, 20 products, 1 user
- Pro plan: Max 500 invoices, 500 customers, 1000 products, 5 users
- Enterprise: Unlimited

Upgrade user to higher tier or delete data to stay under limit.

---

## 📝 Adding Features to Components

### Example: Add "Create Customer" Modal to Your Dashboard

```tsx
'use client'

import { useState } from 'react'
import { useCanCreateResource } from '@/hooks/use-subscription'
import { toast } from 'sonner'

export function CustomersPage() {
  const { allowed, current, limit } = useCanCreateResource('customers')
  const [name, setName] = useState('')

  async function handleCreate() {
    if (!allowed) {
      toast.error('Customer limit reached')
      return
    }

    const res = await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    })

    if (res.ok) {
      toast.success('Customer created!')
      setName('')
      // Refresh page or re-fetch data
    } else {
      toast.error('Failed to create customer')
    }
  }

  return (
    <div>
      <p>Customers: {current}/{limit === 0 ? '∞' : limit}</p>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={handleCreate}>Create Customer</button>
    </div>
  )
}
```

---

## 🔑 Environment Variables (Optional)

Only needed if you want super admin functionality:

```env
# .env.local
NEXT_PUBLIC_SUPER_ADMIN_EMAIL=your-email@example.com
```

---

## ✅ Verification Checklist

After deployment:

```
[ ] Can login with your account
[ ] Dashboard shows real data (not mocks)
[ ] Can create a customer via API
[ ] Customer appears in /dashboard/customers
[ ] Can update/delete customer
[ ] Same for products and invoices
[ ] Can see subscription info
[ ] Can view /dashboard/admin (if super admin)
[ ] Try creating beyond limit - gets error
[ ] Free plan shows correct limits
```

---

## 🚀 Next Steps

1. **Test everything locally** with `pnpm dev`
2. **Deploy to Vercel** with `git push`
3. **Verify in production**
4. **Add Stripe integration** (optional) for payment processing
5. **Create team management** module
6. **Add PDF invoice generation**
7. **Set up email notifications**

---

## 📞 Need Help?

- Check `SAAS_SETUP_GUIDE.md` for detailed setup
- Review database schema in `scripts/009_create_subscriptions.sql`
- Check [Supabase docs](https://supabase.com/docs) for database issues
- Check [Next.js docs](https://nextjs.org/docs) for API route questions

Congratulations! You now have a production-ready SaaS application! 🎉
