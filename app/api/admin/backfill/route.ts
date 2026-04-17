import { NextResponse } from 'next/server';
import { analyticsService } from '@/lib/domain/analytics/analytics.service';
// import { createClient } from '@/lib/supabase/server'; // Will be used inside service

export async function GET() {
  try {
    console.log('[Admin] Triggering Analytics Backfill...');
    await analyticsService.backfillAllCompanies();
    return NextResponse.json({ success: true, message: 'Backfill completed' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
