import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isSuperAdmin = user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

    // ── 1. Get or create the user's primary company ──
    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    let companyId = profile?.company_id;
    let syncNeeded = !companyId;

    if (!companyId) {
      console.log('[Seed] No existing company found. Creating primary workspace...');
      const { data: newComp, error: compErr } = await supabase
        .from('companies')
        .insert([{
          user_id: user.id,
          name: 'Main Executive Hub',
          tax_id: 'TX-MAIN-77',
          currency: 'USD',
        }])
        .select('id')
        .single();

      if (compErr || !newComp) {
        throw new Error(`Failed to create company: ${compErr?.message ?? 'unknown error'}`);
      }
      companyId = newComp.id;
      syncNeeded = true;
    }

    // Force synchronization of profile to ensure visibility on Client Dashboard
    if (syncNeeded || true) { // Always sync to be safe
       const { error: profileErr } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          company_id: companyId,
          full_name: user.user_metadata?.full_name || 'System Admin'
        });
        
      if (profileErr) {
        console.error('[Seed] Profile sync failed:', profileErr.message);
      } else {
        console.log(`[Seed] Profile synchronized with Workspace ID: ${companyId}`);
      }
    }

    // ── 2. Global Sanitization: Reset environment ──
    console.log('[Seed] NUCLEAR RESET: Purging all platform archives...');
    
    // Purge dependent records first to avoid FK violations
    await supabase.from('invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    // Now purge other companies
    const { error: purgeErr } = await supabase
      .from('companies')
      .delete()
      .neq('id', companyId);

    if (purgeErr) {
      console.error('[Seed] Company purge failed (non-fatal):', purgeErr.message);
    } else {
      console.log('[Seed] Database sanitized to primary workspace.');
    }

    const companiesToSeed: string[] = [companyId];
    // Removed secondary "Shadow" company logic to maintain a clean environment.

    // ── 3. Seed each company ──
    for (const targetId of companiesToSeed) {
      // Use a short suffix unique to this run to avoid duplicate-key issues
      const suffix = Math.floor(1000 + Math.random() * 9000);

      // A. Seed Category (optional – only if table exists)
      let catId: string | null = null;
      {
        const { data: existingCat } = await supabase
          .from('categories')
          .select('id')
          .eq('company_id', targetId)
          .eq('name', 'Hardware')
          .maybeSingle();

        if (existingCat) {
          catId = existingCat.id;
        } else {
          const { data: newCat } = await supabase
            .from('categories')
            .insert([{ company_id: targetId, name: 'Hardware', description: 'Physical devices' }])
            .select('id')
            .single();
          catId = newCat?.id ?? null;
        }
      }

      // B. Seed Customers – use unique emails per run to avoid conflicts
      const { data: customers, error: custErr } = await supabase
        .from('customers')
        .insert([
          {
            company_id: targetId,
            name: 'Atherton Group',
            email: `finance.${suffix}@atherton.co`,
            phone: '+1-555-100-0001',
            address: 'Industrial Sector 7, New York',
          },
          {
            company_id: targetId,
            name: 'Cyberdyne Systems',
            email: `billing.${suffix}@cyberdyne.io`,
            phone: '+1-555-200-0002',
            address: 'Tech Plaza, Neo-Tokyo',
          },
          {
            company_id: targetId,
            name: 'Weyland-Yutani Corp',
            email: `accounts.${suffix}@weyland.corp`,
            phone: '+1-555-300-0003',
            address: 'Off-world Terminal 4',
          },
        ])
        .select('id, name');

      if (custErr) {
        console.error('[Seed] Customer insert failed:', custErr.message);
        // Don't crash — continue to products
      }

      // C. Seed Products (correct field: `quantity`, not `stock`)
      const { data: products, error: prodErr } = await supabase
        .from('products')
        .insert([
          {
            company_id: targetId,
            category_id: catId,
            name: 'Quantum Processor Unit',
            sku: `QPU-${suffix}`,
            buy_price: 1200,
            unit_price: 2500,
            quantity: 45,
            min_stock_level: 10,
          },
          {
            company_id: targetId,
            category_id: catId,
            name: 'Encrypted Storage Node',
            sku: `ESN-${suffix}`,
            buy_price: 450,
            unit_price: 980,
            quantity: 120,
            min_stock_level: 20,
          },
          {
            company_id: targetId,
            category_id: catId,
            name: 'Nu-Tech Interface',
            sku: `NTI-${suffix}`,
            buy_price: 80,
            unit_price: 240,
            quantity: 3,
            min_stock_level: 10, // intentionally low to trigger alert
          },
        ])
        .select('id, name');

      if (prodErr) {
        console.error('[Seed] Product insert failed:', prodErr.message);
      }

      // D. Seed Invoices – only if we have customers
      if (customers && customers.length > 0) {
        const invoiceRows = customers.map((c, i) => ({
          company_id: targetId,
          customer_id: c.id,
          invoice_number: `INV-${suffix}-${String(100 + i).padStart(3, '0')}`,
          total: 15000 + i * 25000,
          status: i === 0 ? 'paid' : i === 1 ? 'sent' : 'overdue',
          invoice_type: 'sale',
          issue_date: new Date().toISOString().split('T')[0],
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tax_rate: 15,
          discount_amount: 500,
          notes: 'Demo invoice — seeded automatically.',
        }));

        const { data: invs, error: invErr } = await supabase.from('invoices').insert(invoiceRows).select('id');
        if (invErr) {
          console.error('[Seed] Invoice insert error (non-fatal):', invErr.message);
        }

        // E. Seed Invoice Items for rich dashboard visibility
        if (invs && products && products.length > 0) {
          const itemRows = invs.flatMap((inv) => [
            {
              invoice_id: inv.id,
              company_id: targetId,
              product_id: products[0].id,
              designation: `Professional ${products[0].name}`,
              quantity: 2,
              unit_price: 2500,
              discount: 10,
              tax_rate: 15,
              total: 4500, // (2 * 2500) - 10% + 15% (simplified for seeding)
            },
            {
              invoice_id: inv.id,
              company_id: targetId,
              product_id: products[1].id,
              designation: `Service Fee - ${products[1].name}`,
              quantity: 1,
              unit_price: 980,
              discount: 0,
              tax_rate: 15,
              total: 1127,
            }
          ]);
          await supabase.from('invoice_items').insert(itemRows);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `✅ System seeded: ${companiesToSeed.length} workspace(s) × 3 customers, 3 products, 3 invoices.`,
    });
  } catch (err: any) {
    console.error('[Seed] Fatal error:', err);
    return NextResponse.json({ error: err.message ?? 'Unknown seed error' }, { status: 500 });
  }
}
