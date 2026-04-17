import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyticsService } from '@/lib/domain/analytics/analytics.service';
import { aiService } from '@/lib/domain/ai/ai.service';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', user.id)
      .single();

    if (!profile?.company_id) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // 1. Fetch Historical Trend
    const trendData = await analyticsService.getRevenueTrend(profile.company_id);
    
    // 2. Predict Future Data
    let forecast: any[] = [];
    if (trendData && trendData.length >= 2) {
      forecast = await aiService.getForecast(trendData);
    }
    
    return NextResponse.json(forecast || []);
  } catch (error: any) {
    console.error("[AI Forecast API Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
