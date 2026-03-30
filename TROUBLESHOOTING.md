# Troubleshooting & FAQ Guide

> Quick solutions to common problems you might encounter.

## Authentication Issues

### Problem: Can't login

**Symptoms:** Login button not working, stuck on login page, redirect loops

**Solutions:**
1. Check `.env.local` has correct Supabase credentials
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   ```

2. Make sure you've created an account first
   - Go to sign-up page
   - Create test account
   - Then try to login

3. Check Supabase project is running
   - Go to supabase.com
   - Open project
   - Verify it's not paused

4. Clear browser cache
   ```
   Ctrl+Shift+Delete (Windows)
   Cmd+Shift+Delete (Mac)
   ```

5. Check browser console for error
   - Press F12
   - Look for red error messages
   - Share error with developer

---

### Problem: Redirect loop on login

**Symptoms:** Can't access `/dashboard`, redirects continuously

**Solution:**
1. Check middleware is configured
   - In `lib/supabase/middleware.ts`
   - Should redirect unauthenticated users to `/auth/login`

2. Clear browser cookies
   ```
   Open DevTools → Application → Cookies
   Delete all cookies for localhost:3000
   ```

3. Sign out completely
   - Delete auth token from localStorage
   - Close and reopen browser
   - Try login again

4. Verify `.env.local` is loaded
   - Restart dev server: `pnpm dev`
   - Check terminal shows environment variables

---

## Database Connection Issues

### Problem: "Could not connect to database"

**Symptoms:** Pages show blank, data won't load, console errors

**Solutions:**

1. Verify Supabase credentials
   ```
   Check app/lib/supabase/client.ts
   Should use NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. Check Supabase is running
   - Go to supabase.com
   - Open your project
   - Check "Status" (should be "Active", not "Paused")

3. Verify internet connection
   ```bash
   ping supabase.com
   # Should return responses
   ```

4. Try from different browser
   - Firefox, Chrome, Safari, Edge
   - If one works, it's a cache issue

5. Check CORS settings in Supabase
   - Go to Project Settings → API
   - Verify no CORS restrictions blocking your domain

---

### Problem: Data loads but is empty

**Symptoms:** Tables show no rows, stats show 0

**Solutions:**

1. Check database has data
   - Go to Supabase → Tables
   - Select each table (companies, customers, products, etc.)
   - Verify rows exist

2. Check RLS policies allow reading
   - Go to Supabase → Authentication → Policies
   - Verify policies aren't blocking your user
   - Run migration: `scripts/000_complete_migration.sql`

3. Check you're querying correct company
   - Each row should have matching company_id
   - Verify in database directly

4. Check for SQL errors
   - Open browser console (F12)
   - Look for error messages
   - Check Supabase logs

---

### Problem: "RLS policy violated"

**Symptoms:** Can't read/write data, permission errors

**Solutions:**

1. Re-run migration script
   ```
   Go to Supabase → SQL Editor
   Copy scripts/000_complete_migration.sql
   Run it
   ```

2. Verify user is authenticated
   - Check useAuthUser() returns a user
   - Verify user exists in auth.users

3. Check user has matching profile
   - In Supabase → profiles table
   - User should have row with same id as auth.users.id

4. Verify company link
   - Profile should have company_id
   - Data should have matching company_id

---

## Build & Deployment Issues

### Problem: Build fails locally

**Symptoms:** `pnpm build` exits with error, shows error message

**Solutions:**

1. Ensure dependencies are installed
   ```bash
   pnpm install
   ```

2. Check for TypeScript errors
   ```bash
   pnpm run type-check
   ```

3. Delete cache and rebuild
   ```bash
   rm -r .next
   pnpm build
   ```

4. Check for missing files
   - Verify all imports point to existing files
   - Check file paths are correct

5. Review error message carefully
   - Usually shows exact file and line number
   - Fix that specific issue

---

### Problem: Works locally but fails on Vercel

**Symptoms:** Local `pnpm dev` works, but Vercel deployment fails

**Solutions:**

1. Verify environment variables
   - Go to Vercel → Project Settings → Environment Variables
   - Add both Supabase variables
   - Redeploy from Vercel dashboard

2. Check for server-side code issues
   - Some npm packages don't work in serverless
   - Review error logs in Vercel dashboard

3. Check Node.js version compatibility
   - Ensure local Node version matches Vercel
   - Use same Node version in `.node-version` file

4. Revert last change
   - If something broke it, rollback
   - Check git history

5. Check Supabase service is accessible
   - Verify from Vercel function logs
   - Might need to allow Vercel IPs in Supabase

---

### Problem: Vercel build takes too long

**Symptoms:** Build times > 5 minutes

**Solutions:**

1. Check bundle size
   ```bash
   pnpm build
   # Look for large files in .next/
   ```

2. Optimize images
   - Use Next.js Image component
   - Compress before uploading

3. Remove unnecessary dependencies
   ```bash
   pnpm list
   # Check for unused packages
   ```

4. Enable build caching in Vercel
   - Go to Vercel project settings
   - Enable "Build output caching"

---

## UI/UX Issues

### Problem: Sidebar/Layout broken on small screens

**Symptoms:** Sidebar overlaps content, buttons hidden on mobile

**Solutions:**

1. Use responsive Tailwind classes
   ```tsx
   <div className="hidden md:block">Desktop only</div>
   <div className="md:hidden">Mobile only</div>
   ```

2. Check responsive breakpoints
   - `sm`: 640px
   - `md`: 768px (tablets)
   - `lg`: 1024px (desktop)
   - `xl`: 1280px

3. Test different screen sizes
   - Open DevTools (F12)
   - Toggle devices (Ctrl+Shift+M)
   - Test iPhone, iPad, Desktop

4. Check viewport meta tag
   - Should be in `app/layout.tsx`
   - Should have `width=device-width, initial-scale=1`

---

### Problem: Elements cut off or misaligned

**Symptoms:** Text/buttons appear partially hidden, overlap others

**Solutions:**

1. Check CSS classes are correct
   - Verify Tailwind class names
   - Ensure no conflicting styles

2. Check overflow settings
   ```tsx
   <div className="overflow-auto max-h-screen">
     Scrollable content
   </div>
   ```

3. Use flexbox properly
   ```tsx
   <div className="flex items-center justify-between gap-4">
     Content
   </div>
   ```

4. Test in different browsers
   - Chrome, Firefox, Safari, Edge
   - Check if issue is browser-specific

---

### Problem: Animations not smooth

**Symptoms:** Jumpy animations, choppy transitions

**Solutions:**

1. Use CSS transforms
   ```css
   transform: translateX(0); /* Fast */
   left: 0; /* Slow */
   ```

2. Add transition property
   ```tsx
   <div className="transition duration-300 hover:scale-105">
     Animated content
   </div>
   ```

3. Check for performance issues
   - Open DevTools → Performance tab
   - Record interaction
   - Look for long tasks

4. Reduce animation complexity
   - Don't animate too many things
   - Use CSS not JavaScript for animations

---

## Performance Issues

### Problem: App loads slowly

**Symptoms:** Takes > 3 seconds to load, spinner shows for long

**Solutions:**

1. Check network tab
   - Open DevTools → Network
   - See which requests are slow
   - Check if Supabase is slow

2. Implement React Query caching
   ```bash
   pnpm add @tanstack/react-query
   ```

3. Optimize images
   - Use Next.js Image component
   - Compress files before upload
   - Use WebP format

4. Check database performance
   - Verify indexes are created
   - Check for slow queries
   - Limit results with `.limit(20)`

5. Enable Vercel Analytics
   - Monitor real-world performance
   - See which pages are slow

---

### Problem: Memory leak / app slows over time

**Symptoms:** App gets slower the longer you use it

**Solutions:**

1. Check for subscription leaks
   ```tsx
   useEffect(() => {
     const subscription = supabase.on(...).subscribe()
     
     return () => {
       subscription.unsubscribe()  // Important!
     }
   }, [])
   ```

2. Use React Query instead of manual state
   - Automatically handles cleanup
   - Better memory management

3. Check browser DevTools
   - Open Memory tab
   - Take heap snapshots
   - Look for growing objects

4. Clear localStorage if needed
   ```javascript
   localStorage.clear()
   localStorage.removeItem('specific_key')
   ```

---

## Data Issues

### Problem: Changes don't show up

**Symptoms:** Update data, page doesn't refresh, shows old values

**Solutions:**

1. Manually refetch data
   ```tsx
   const { refetch } = useQuery(...)
   refetch()  // Re-fetch from database
   ```

2. Implement real-time updates
   ```tsx
   useEffect(() => {
     const subscription = supabase
       .channel('products')
       .on('postgres_changes', ...)
       .subscribe()
     
     return () => subscription.unsubscribe()
   }, [])
   ```

3. Clear cache
   ```tsx
   queryClient.invalidateQueries({ queryKey: ['products'] })
   ```

4. Check database directly
   - Go to Supabase → Tables
   - Verify data was actually saved

5. Check for RLS policy blocking updates
   - View Supabase logs
   - Recreate migration if needed

---

### Problem: Duplicate data

**Symptoms:** See same customer/product twice, invoices duplicated

**Solutions:**

1. Check unique constraints
   - In Supabase, ensure unique columns have constraints
   - Example: invoice_number should be UNIQUE

2. Check for duplicate triggers
   - Review database functions
   - Verify inserts only happen once

3. Clear and refresh
   - Delete duplicates in Supabase (careful!)
   - Test again

4. Check for double submissions
   - Disable button after click
   - Prevent form resubmit

---

## Getting Help

### Before You Ask
1. Check the relevant guide (SUPABASE_INTEGRATION_GUIDE.md, etc.)
2. Search in browser console for error messages
3. Check Supabase logs for database errors
4. Try clearing cache and rebuilding

### When Asking for Help
Share:
1. Error message (full text from console)
2. What you were trying to do
3. Steps to reproduce
4. What changed recently
5. Browser and OS version

### Where to Get Help
1. **Browser Console** - Press F12, check "Console" tab
2. **Supabase Logs** - Go to supabase.com → Project Logs
3. **Vercel Logs** - Go to vercel.com → Project → Deployments
4. **GitHub Issues** - Check Next.js, Supabase issues
5. **Stack Overflow** - Search "next.js + supabase"

---

## Emergency Procedures

### If Database is Corrupted
1. Go to Supabase → Project settings → Backups
2. Restore from recent backup
3. Or wipe and re-run migration

### If You Can't Login
1. Go to Supabase → Authentication → Users
2. Delete and recreate test user
3. Sign up again in app

### If Vercel Deployment is Broken
1. Go to Vercel → Deployments
2. Find last working deployment
3. Click "Redeploy"
4. Or revert code in GitHub

### If Everything is Broken
```bash
# Start fresh
git status  # See what changed
git diff    # See the changes
git checkout -- .  # Revert all changes
# or
git reset --hard HEAD~1  # Go back one commit
pnpm install  # Fresh install
pnpm dev  # Should work now
```

---

## Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| "Can't find module" | `pnpm install` |
| "404 Not found" | Check file path, refresh page |
| "CORS error" | Add domain to Supabase CORS settings |
| "Out of memory" | Reduce database query size, use pagination |
| "Slow API calls" | Add `.select()` to limit columns, use indexes |
| "Can't see console logs" | Might be server logs, check Vercel/Supabase |

---

## Still Stuck?

### Debugging Checklist
- [ ] Restarted development server
- [ ] Cleared browser cache (Ctrl+Shift+Delete)
- [ ] Checked `.env.local` is correct
- [ ] Verified Supabase project is running
- [ ] Checked browser console (F12)
- [ ] Checked Supabase logs
- [ ] Checked Vercel logs
- [ ] Tried in incognito/private mode
- [ ] Tried in different browser
- [ ] Looked through relevant guide
- [ ] Searched error message on Google

If all above fail, you have solid information to get help!

---

**Remember:** Most issues have simple solutions. Take a deep breath, search the error message, and check the guides first! 💪
