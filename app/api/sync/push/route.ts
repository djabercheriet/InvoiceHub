import { NextRequest, NextResponse } from 'next/server';
import { authenticateSyncRequest, SyncAuthError } from '@/lib/sync/auth';
import { syncService } from '@/lib/sync/sync.service';
import { handleSyncOptions, withSyncCors } from '@/lib/sync/cors';

export async function OPTIONS(request: NextRequest) {
  return handleSyncOptions(request);
}

async function handlePost(request: NextRequest) {
  try {
    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request body' }, { status: 400 });
    }

    const { storeId, actions } = body || {};

    if (!storeId || typeof storeId !== 'string') {
      return NextResponse.json({ success: false, error: 'storeId is required' }, { status: 400 });
    }

    if (!Array.isArray(actions)) {
      return NextResponse.json({ success: false, error: 'actions array is required' }, { status: 400 });
    }

    // 1. Authenticate device and authorize store access
    const authContext = await authenticateSyncRequest(request, storeId.trim());

    // 2. Process push batch through SyncService
    const result = await syncService.pushActions(authContext, actions);

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof SyncAuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    console.error('Error in POST /api/sync/push:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const response = await handlePost(request);
  return withSyncCors(response, request);
}

