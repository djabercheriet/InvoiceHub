import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const healthStatus: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      email: 'unknown',
      jobs: 'unknown',
    }
  };

  try {
    // 1. Check Database
    const supabase = await createClient();
    const { error: dbError } = await supabase.from('companies').select('count', { count: 'exact', head: true });
    
    if (dbError) {
      healthStatus.services.database = 'unhealthy';
      healthStatus.status = 'degraded';
      healthStatus.error = dbError.message;
    } else {
      healthStatus.services.database = 'healthy';
    }

    // 2. Check Email Configuration
    if (process.env.RESEND_API_KEY) {
      healthStatus.services.email = 'healthy (Resend)';
    } else {
      healthStatus.services.email = 'healthy (Development/Ethereal)';
    }

    // 3. Check Job Queue (Internal check)
    const driver = process.env.JOB_DRIVER || 'in-process';
    healthStatus.services.jobs = `healthy (${driver})`;

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    return NextResponse.json(healthStatus, { status: statusCode });

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
