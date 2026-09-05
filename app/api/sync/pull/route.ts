import { NextRequest, NextResponse } from 'next/server';
import { authenticateSyncRequest, SyncAuthError } from '@/lib/sync/auth';
import { syncService } from '@/lib/sync/sync.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId')?.trim();
    const rawSince = searchParams.get('since');

    if (!storeId) {
      return NextResponse.json({ success: false, error: 'storeId query parameter is required' }, { status: 400 });
    }

    const sinceCursor = rawSince ? parseInt(rawSince, 10) : 0;
    if (isNaN(sinceCursor) || sinceCursor < 0) {
      return NextResponse.json({ success: false, error: 'since parameter must be a valid non-negative integer' }, { status: 400 });
    }

    // 1. Authenticate device and authorize store access
    const authContext = await authenticateSyncRequest(request, storeId);

    // 2. Query deltas or initial snapshot
    const result = await syncService.pullUpdates(authContext, sinceCursor);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof SyncAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    console.error('Error in GET /api/sync/pull:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
