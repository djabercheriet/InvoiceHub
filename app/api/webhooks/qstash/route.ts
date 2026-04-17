export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifySignatureAppRouter } from '@upstash/qstash/dist/nextjs';
import { processJob } from '@/lib/jobs/worker';

async function handler(req: NextRequest) {
  try {
    const jobPayload = await req.json();
    await processJob(jobPayload);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[QStash Webhook] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
