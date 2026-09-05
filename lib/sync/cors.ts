import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'app://local',
];

export function getAllowedOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin');
  if (!origin) return null;

  const trimmed = origin.trim();
  const normalized = trimmed.replace(/\/$/, '').toLowerCase();

  const envOrigins = process.env.SYNC_ALLOWED_ORIGINS
    ? process.env.SYNC_ALLOWED_ORIGINS.split(',').map((s) => s.trim().replace(/\/$/, '').toLowerCase())
    : [];

  const allowed = new Set([...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]);
  if (allowed.has(normalized)) {
    return trimmed;
  }

  return null;
}

export function getSyncCorsHeaders(request: NextRequest): Record<string, string> {
  const allowedOrigin = getAllowedOrigin(request);
  if (!allowedOrigin) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-License-Key, X-Device-Id',
    'Vary': 'Origin',
  };
}

export function handleSyncOptions(request: NextRequest): NextResponse {
  const headers = getSyncCorsHeaders(request);
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...headers,
      'Access-Control-Max-Age': '86400',
    },
  });
}

export function withSyncCors(response: NextResponse, request: NextRequest): NextResponse {
  const headers = getSyncCorsHeaders(request);
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}
