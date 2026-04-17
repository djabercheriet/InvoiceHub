import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    const advice = await aiService.getBusinessAdvice(profile.company_id);
    return NextResponse.json(advice);
  } catch (error: any) {
    console.error("[AI Advisor API Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
