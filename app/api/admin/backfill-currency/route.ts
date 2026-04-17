import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fxService } from '@/lib/domain/finance/fx.service';

export async function GET() {
  const supabase = await createClient();
  
  try {
    // 1. Fetch invoices with NULL base_currency_total
    const { data: invoices } = await supabase
      .from('invoices')
      .select('*, companies(currency)')
      .is('base_currency_total', null);

    if (!invoices || invoices.length === 0) {
      return NextResponse.json({ message: 'No invoices to backfill.' });
    }

    let updatedCount = 0;
    for (const inv of invoices) {
      const baseCurrency = inv.companies?.currency || 'USD';
      const invoiceCurrency = inv.currency || baseCurrency;

      const { convertedAmount, rate } = await fxService.convert(
        inv.total,
        invoiceCurrency,
        baseCurrency,
        inv.company_id
      );

      await supabase
        .from('invoices')
        .update({
          exchange_rate: rate,
          base_currency_total: convertedAmount
        })
        .eq('id', inv.id);
      
      updatedCount++;
    }

    // 2. Fetch payments with NULL base_amount
    const { data: payments } = await supabase
      .from('payments')
      .select('*, invoices(exchange_rate)')
      .is('base_amount', null);
    
    if (payments) {
      for (const pay of payments) {
        const rate = pay.invoices?.exchange_rate || 1;
        await supabase
          .from('payments')
          .update({
            exchange_rate: rate,
            base_amount: Number((pay.amount * rate).toFixed(2))
          })
          .eq('id', pay.id);
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      message: 'Currency backfill completed.', 
      entriesUpdated: updatedCount 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
