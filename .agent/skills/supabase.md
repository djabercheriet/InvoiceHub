---
name: supabase
description: Knowledge about the Supabase database schema and RLS policies.
---

# Supabase Database Schema Context

This project uses Supabase. Here is the current database schema context to keep in mind for full CRUD operations and authorization logic:

## Authentication & Profiles
- Supabase Auth (`auth.users`) is used for login.
- `public.users` and `public.profiles` are linked to `auth.users(id)`. 
- Multi-tenancy: Users belong to a company (`company_id`). Roles include: 'owner', 'admin', 'staff'.

## Core SaaS Tables
- **companies**: Multi-tenant isolation.
- **subscription_plans**: Available tiers (Free, Pro, Enterprise).
- **subscriptions**: Links a company to a plan.
- **subscription_usage**: Tracks usage (invoices, customers, products) against plan limits.

## Business Entities (all linked to company_id)
- **customers**
- **clients**
- **suppliers**
- **categories**
- **products**
- **invoices** & **invoice_items**
- **payments**
- **stock_movements**: (type: 'in', 'out', 'adjustment')

## Security (Row Level Security - RLS)
- Almost all tables have RLS enabled.
- Data access typically follows this pattern:
  `EXISTS (SELECT 1 FROM public.companies WHERE companies.id = target_table.company_id AND companies.user_id = auth.uid())`
- Or via checking `profiles` table to ensure the user belongs to the company.

When creating API routes or data access functions, always use the Supabase client and respect company isolation!
