-- Final Enterprise Demo Seeding Script
-- Use this to populate your dashboard with realistic data.
-- Run this AFTER phase2_database_schema.sql.

DO $$
DECLARE
    target_company_id UUID;
    cat_hardware_id UUID;
    cat_software_id UUID;
    cat_consulting_id UUID;
    cust_apple_id UUID;
    cust_google_id UUID;
    cust_tesla_id UUID;
BEGIN
    -- 1. Find the primary company
    SELECT id INTO target_company_id FROM public.companies LIMIT 1;

    IF target_company_id IS NOT NULL THEN
        
        -- 2. Seed Categories (Safe insertion without ON CONFLICT constraints)
        IF NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = target_company_id AND name = 'Hardware') THEN
            INSERT INTO public.categories (company_id, name, description) 
            VALUES (target_company_id, 'Hardware', 'Physical devices and equipment');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = target_company_id AND name = 'Software Subscriptions') THEN
            INSERT INTO public.categories (company_id, name, description) 
            VALUES (target_company_id, 'Software Subscriptions', 'SaaS and digital services');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.categories WHERE company_id = target_company_id AND name = 'Consulting') THEN
            INSERT INTO public.categories (company_id, name, description) 
            VALUES (target_company_id, 'Consulting', 'Professional advisory services');
        END IF;

        SELECT id INTO cat_hardware_id FROM public.categories WHERE name = 'Hardware' AND company_id = target_company_id LIMIT 1;
        SELECT id INTO cat_software_id FROM public.categories WHERE name = 'Software Subscriptions' AND company_id = target_company_id LIMIT 1;
        SELECT id INTO cat_consulting_id FROM public.categories WHERE name = 'Consulting' AND company_id = target_company_id LIMIT 1;

        -- 3. Seed Products (Safe manual existence check)
        IF NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = target_company_id AND sku = 'SRV-ENT-001') THEN
            INSERT INTO public.products (company_id, category_id, name, sku, buy_price, unit_price, quantity, min_stock_level, image_url)
            VALUES (target_company_id, cat_hardware_id, 'Enterprise Server Rack', 'SRV-ENT-001', 5000.00, 8500.00, 12, 2, 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?w=400');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = target_company_id AND sku = 'WK-PRO-004') THEN
            INSERT INTO public.products (company_id, category_id, name, sku, buy_price, unit_price, quantity, min_stock_level, image_url)
            VALUES (target_company_id, cat_hardware_id, 'Workstation Pro v4', 'WK-PRO-004', 1200.00, 2499.00, 45, 5, 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=400');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = target_company_id AND sku = 'RT-X-100') THEN
            INSERT INTO public.products (company_id, category_id, name, sku, buy_price, unit_price, quantity, min_stock_level, image_url)
            VALUES (target_company_id, cat_hardware_id, 'Network Router X', 'RT-X-100', 150.00, 450.00, 1, 5, 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.products WHERE company_id = target_company_id AND sku = 'SVC-AUDIT') THEN
            INSERT INTO public.products (company_id, category_id, name, sku, buy_price, unit_price, quantity, min_stock_level, image_url)
            VALUES (target_company_id, cat_consulting_id, 'System Architecture Audit', 'SVC-AUDIT', 0, 15000.00, 999, 0, NULL);
        END IF;

        -- 4. Seed Customers (Safe manual existence check)
        IF NOT EXISTS (SELECT 1 FROM public.customers WHERE company_id = target_company_id AND email = 'finance@apple.com') THEN
            INSERT INTO public.customers (company_id, name, email, phone, address)
            VALUES (target_company_id, 'Apple Inc.', 'finance@apple.com', '+1-800-MY-APPLE', 'One Apple Park Way, Cupertino, CA');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.customers WHERE company_id = target_company_id AND email = 'billing@google.com') THEN
            INSERT INTO public.customers (company_id, name, email, phone, address)
            VALUES (target_company_id, 'Alphabet (Google)', 'billing@google.com', '+1-650-253-0000', '1600 Amphitheatre Parkway, Mountain View, CA');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.customers WHERE company_id = target_company_id AND email = 'accounts@tesla.com') THEN
            INSERT INTO public.customers (company_id, name, email, phone, address)
            VALUES (target_company_id, 'Tesla Motors', 'accounts@tesla.com', '+1-888-518-3752', '3500 Deer Creek Road, Palo Alto, CA');
        END IF;

        SELECT id INTO cust_apple_id FROM public.customers WHERE name = 'Apple Inc.' AND company_id = target_company_id LIMIT 1;
        SELECT id INTO cust_google_id FROM public.customers WHERE name = 'Alphabet (Google)' AND company_id = target_company_id LIMIT 1;
        SELECT id INTO cust_tesla_id FROM public.customers WHERE name = 'Tesla Motors' AND company_id = target_company_id LIMIT 1;

        -- 5. Seed Invoices (Safe manual existence check)
        IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE company_id = target_company_id AND invoice_number = 'INV-2025-012') THEN
            INSERT INTO public.invoices (company_id, customer_id, invoice_number, total, status, issue_date, due_date)
            VALUES (target_company_id, cust_apple_id, 'INV-2025-012', 125000.00, 'paid', '2025-12-15', '2026-01-15');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE company_id = target_company_id AND invoice_number = 'INV-2026-001') THEN
            INSERT INTO public.invoices (company_id, customer_id, invoice_number, total, status, issue_date, due_date)
            VALUES (target_company_id, cust_google_id, 'INV-2026-001', 45000.00, 'paid', '2026-01-05', '2026-02-05');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE company_id = target_company_id AND invoice_number = 'INV-2026-002') THEN
            INSERT INTO public.invoices (company_id, customer_id, invoice_number, total, status, issue_date, due_date)
            VALUES (target_company_id, cust_tesla_id, 'INV-2026-002', 8500.00, 'overdue', '2026-02-01', '2026-03-01');
        END IF;

        IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE company_id = target_company_id AND invoice_number = 'INV-2026-003') THEN
            INSERT INTO public.invoices (company_id, customer_id, invoice_number, total, status, issue_date, due_date)
            VALUES (target_company_id, cust_apple_id, 'INV-2026-003', 25000.00, 'draft', CURRENT_DATE - 2, CURRENT_DATE + 28);
        END IF;

    END IF;
END $$;
