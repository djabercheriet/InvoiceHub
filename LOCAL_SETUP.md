# Local Setup Guide for InvoiceHub

## Issues Fixed

✅ **Schema Conflicts**: Consolidated all database migration scripts into single comprehensive migration file
✅ **Auth Redirect**: Fixed login/signup pages redirecting to non-existent `/protected` route → now redirects to `/dashboard`
✅ **Middleware Issue**: Updated middleware to check for `/dashboard` route instead of `/protected`
✅ **Component Error**: Fixed dashboard page causing "Super expression" error by making it client-side
✅ **Build Verification**: Project now builds successfully without errors

## Prerequisites

Before running the project locally, ensure you have:

- **Node.js** 18+ installed
- **pnpm** package manager installed (`npm install -g pnpm`)
- **Supabase Account** (create at https://supabase.com)

## Step 1: Set Up Supabase Database

### 1.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new account or login
3. Create a new project:
   - Choose a project name (e.g., "InvoiceHub")
   - Choose a region closest to you
   - Create a strong database password

### 1.2 Run the Database Migration

1. Once your project is created, go to the **SQL Editor** section
2. Create a new query and copy the entire contents of `scripts/000_complete_migration.sql`
3. Paste it into the SQL editor and run it
4. This will:
   - Create all necessary tables (companies, profiles, products, categories, customers, invoices, invoice_items)
   - Set up indexes for performance
   - Enable Row Level Security (RLS) on all tables
   - Configure RLS policies for multi-tenant security
   - Create triggers for automatic profile creation on signup

## Step 2: Configure Environment Variables

1. Copy your Supabase credentials:
   - Go to your Supabase project settings
   - Click "API" in the left sidebar
   - Copy the **Project URL** and **Anon Key**

2. The `.env.local` file should already have these values set:
   ```
   NEXT_PUBLIC_SUPABASE_URL="your-project-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   ```

3. Verify the values are correct in `.env.local` file

## Step 3: Install Dependencies

```bash
pnpm install
```

## Step 4: Run the Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Step 5: Test the Application

1. **Create an Account**:
   - Go to `http://localhost:3000/auth/sign-up`
   - Enter email and password
   - Submit the form
   - You'll be redirected to a success page

2. **Login**:
   - Go to `http://localhost:3000/auth/login`
   - Use the credentials from sign-up
   - You'll be redirected to `/dashboard`

3. **Access Dashboard**:
   - The dashboard is now available at `/dashboard`
   - All authenticated routes (customers, inventory, invoices, settings) are protected
   - Unauthenticated users are automatically redirected to login

## Project Structure

```
app/
├── auth/
│   ├── login/               # Login page
│   └── sign-up/             # Sign-up page
├── dashboard/
│   ├── page.tsx             # Dashboard home
│   ├── customers/           # Customers management
│   ├── inventory/           # Product inventory
│   ├── invoices/            # Invoice management
│   └── settings/            # User settings
├── api/
│   └── invoices/            # Invoice API routes
lib/
├── supabase/
│   ├── client.ts            # Client-side Supabase client
│   ├── server.ts            # Server-side Supabase client
│   └── middleware.ts        # Auth middleware for protected routes
```

## Database Schema

### Tables Created:

1. **companies** - Multi-tenant company data
2. **profiles** - User profiles (linked to auth.users)
3. **categories** - Product categories
4. **products** - Inventory/products management
5. **customers** - Customer information
6. **invoices** - Invoice documents
7. **invoice_items** - Line items for invoices

All tables have:
- Row Level Security (RLS) enabled
- Proper foreign key constraints
- Indexes for optimal performance
- Automatic timestamps (created_at, updated_at)

## Authentication Flow

1. **Sign Up**: User creates account → Trigger creates company & profile
2. **Login**: User authenticates → Redirected to dashboard
3. **Protected Routes**: Middleware checks authentication → Redirects to login if needed
4. **Sign Out**: User signs out from dashboard → Redirected to login

## Troubleshooting

### Issue: Can't connect to Supabase
- **Check**: Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- **Check**: Ensure Supabase project is running (not paused)
- **Try**: Restart the dev server after updating env variables

### Issue: Database tables don't exist
- **Solution**: Re-run the migration file `scripts/000_complete_migration.sql` in Supabase SQL Editor
- **Verify**: Go to Supabase → Database → Tables to confirm all tables are created

### Issue: Authentication not working
- **Check**: Verify you've completed the sign-up process
- **Check**: Check browser console for error messages
- **Check**: Ensure Supabase project has email authentication enabled

### Issue: Build errors
```bash
# Clear Next.js cache and rebuild
rm -r .next
pnpm build
```

## Building for Production

```bash
pnpm build
pnpm start
```

## Additional Configuration

### Email Verification (Optional)

To enable email verification on sign-up:
1. Go to Supabase Project Settings → Authentication → Email
2. Enable "Confirm email" in the authentication providers

### Email Templates

Go to Supabase Project Settings → Authentication → Email Templates to customize:
- Confirmation emails
- Password reset emails
- Welcome messages

## Next Steps

Once the project is running:
1. Complete the dashboard features by connecting Supabase queries
2. Implement API endpoints in `app/api/`
3. Add more advanced features (PDF exports, email notifications, etc.)
4. Deploy to Vercel or your preferred hosting

## Support

For issues:
1. Check Supabase logs: Go to project → Logs in the Supabase dashboard
2. Check browser console: F12 → Console tab
3. Check Next.js terminal output for errors

---

**All systems are now ready!** Your project should build and run successfully. 🚀
