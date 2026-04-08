-- Sanitization: Purge secondary demo data
-- This script removes all companies NOT associated with the primary Super Admin email.
-- Replace '[ADMIN_USER_ID]' with the actual user ID.

DO $$
DECLARE
    admin_id UUID := (SELECT id FROM auth.users WHERE email = 'djabercheriet@gmail.com'); -- Replace with your super admin email
BEGIN
    -- 1. Delete all companies NOT owned by the admin
    DELETE FROM public.companies 
    WHERE user_id IS DISTINCT FROM admin_id;

    -- Note: ON DELETE CASCADE should handle invoices, customers, and products if configured.
    -- If not, manual cleanup follows:
    
    DELETE FROM public.customers WHERE company_id NOT IN (SELECT id FROM public.companies);
    DELETE FROM public.invoices WHERE company_id NOT IN (SELECT id FROM public.companies);
    DELETE FROM public.products WHERE company_id NOT IN (SELECT id FROM public.companies);
    DELETE FROM public.inventory_modifications WHERE product_id NOT IN (SELECT id FROM public.products);
END $$;
