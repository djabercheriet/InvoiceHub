import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Identify User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Check for Profile & Company
    let { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    let companyId = profile?.company_id;

    // --- SELF-HEALING: NO COMPANY DETECTED ---
    if (!companyId) {
      console.log(`[DEBUG] No company found for User ${user.id}. Creating new Enterprise Workspace...`);
      
      // A. Create Company (Ensuring NOT NULL constraints match schema)
      const { data: newCompany, error: compErr } = await supabase
        .from('companies')
        .insert([{ 
          user_id: user.id, // REQUIRED
          name: 'Enterprise Hub', 
          email: user.email,
          currency: 'USD'
        }])
        .select()
        .single();
      
      if (compErr) throw new Error(`Company Creation Failed: ${compErr.message}`);
      companyId = newCompany.id;

      // B. Link Profile
      const { error: linkErr } = await supabase
        .from('profiles')
        .update({ company_id: companyId })
        .eq('id', user.id);
      
      if (linkErr) throw new Error(`Profile Linking Failed: ${linkErr.message}`);

      // C. Optional: Initialize Subscription
      try {
        const { data: freePlan } = await supabase
          .from('subscription_plans')
          .select('id')
          .eq('name', 'Free')
          .single();
        
        if (freePlan) {
          await supabase.from('subscriptions').insert([{
             company_id: companyId,
             plan_id: freePlan.id,
             status: 'active',
             subscription_type: 'monthly',
             current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }]);
        }
      } catch (e) {
        console.warn('[DEBUG] Subscription table might be missing, skipping sub-init.');
      }
    }

    // --- PROCEED WITH SEEDING ---

    // 3. Categories
    const { data: existingCats } = await supabase
      .from('categories')
      .select('id, name')
      .eq('company_id', companyId);

    let catMap: Record<string, string> = {};
    if (existingCats && existingCats.length > 0) {
      existingCats.forEach(c => catMap[c.name] = c.id);
    } else {
        const { data: newCats } = await supabase
          .from('categories')
          .insert([
            { company_id: companyId, name: 'Hardware', description: 'Physical devices' },
            { company_id: companyId, name: 'Software', description: 'SaaS and licenses' }
          ])
          .select();
        newCats?.forEach(c => catMap[c.name] = c.id);
    }

    // 4. Products (Schema: cost_price, unit_price)
    await supabase
      .from('products')
      .insert([
        { 
          company_id: companyId, 
          category_id: catMap['Hardware'], 
          name: 'Enterprise Server Rack', 
          sku: `SRV-${Math.floor(Math.random()*1000)}`, 
          cost_price: 5000, 
          unit_price: 8500, 
          quantity: 12, 
          min_stock_level: 2,
          image_url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc48?w=400'
        }
      ]);

    // 5. Customers
    const { data: customers } = await supabase
      .from('customers')
      .insert([
        { company_id: companyId, name: 'Atherton Corp', email: `finance@atherton-${Math.floor(Math.random()*100)}.co`, address: 'London, UK' }
      ])
      .select();

    // 6. Invoices
    const custId = customers?.[0]?.id || (await supabase.from('customers').select('id').eq('company_id', companyId).limit(1).single()).data?.id;
    if (custId) {
        await supabase.from('invoices').insert([
            { 
              company_id: companyId, 
              customer_id: custId, 
              invoice_number: `INV-ENT-${Math.floor(Math.random() * 9000) + 1000}`, 
              total: 125000, 
              status: 'paid', 
              issue_date: new Date().toISOString(),
              due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
        ]);
    }

    return NextResponse.json({ success: true, message: 'Workspace fully initialized and seeded!' });
  } catch (err: any) {
    console.error('Final Seed API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
