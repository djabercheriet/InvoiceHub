-- Patch to resolve Infinite Recursion issues
-- This script completely resets the RLS policies for companies, suppliers, and profiles to a flat structure.
-- It avoids any EXISTS (SELECT 1 FROM companies) loops by doing direct auth.uid() comparisons,
-- resolving "infinite recursion detected in policy for relation X" errors.

-- 1. COMPANIES
DROP POLICY IF EXISTS "Users can view their company" ON public.companies;
DROP POLICY IF EXISTS "Users can update their company" ON public.companies;
DROP POLICY IF EXISTS "Users can insert their company" ON public.companies;
DROP POLICY IF EXISTS "Users can delete their company" ON public.companies;

CREATE POLICY "Users can view their company" ON public.companies FOR SELECT USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can update their company" ON public.companies FOR UPDATE USING ((select auth.uid()) = user_id);
CREATE POLICY "Users can insert their company" ON public.companies FOR INSERT WITH CHECK ((select auth.uid()) = user_id);
CREATE POLICY "Users can delete their company" ON public.companies FOR DELETE USING ((select auth.uid()) = user_id);

-- 2. SUPPLIERS
DROP POLICY IF EXISTS "Users can view suppliers of their company" ON public.suppliers;
DROP POLICY IF EXISTS "Users can update suppliers of their company" ON public.suppliers;
DROP POLICY IF EXISTS "Users can insert suppliers to their company" ON public.suppliers;
DROP POLICY IF EXISTS "Users can delete suppliers of their company" ON public.suppliers;

CREATE POLICY "Users can view suppliers of their company" ON public.suppliers FOR SELECT
USING (company_id IN (SELECT id FROM public.companies WHERE user_id = (select auth.uid())));

CREATE POLICY "Users can update suppliers of their company" ON public.suppliers FOR UPDATE
USING (company_id IN (SELECT id FROM public.companies WHERE user_id = (select auth.uid())));

CREATE POLICY "Users can insert suppliers to their company" ON public.suppliers FOR INSERT
WITH CHECK (company_id IN (SELECT id FROM public.companies WHERE user_id = (select auth.uid())));

CREATE POLICY "Users can delete suppliers of their company" ON public.suppliers FOR DELETE
USING (company_id IN (SELECT id FROM public.companies WHERE user_id = (select auth.uid())));

-- 3. PROFILES
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING ((select auth.uid()) = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((select auth.uid()) = id);
CREATE POLICY "Users can insert their profile" ON public.profiles FOR INSERT WITH CHECK ((select auth.uid()) = id);
