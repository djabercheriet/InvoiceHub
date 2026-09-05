import { SyncAction, SyncActionType } from './types';

export const SYNC_TABLE_ALLOWLIST = new Set<string>([
  'products',
  'batches',
  'categories',
  'customers',
  'suppliers',
  'locations',
  'sales',
  'settings',
  'users'
]);

export const USERS_FIELD_WHITELIST = Object.freeze([
  'id',
  'username',
  'name',
  'role',
  'avatar',
  'email',
  'phone',
  'createdAt',
  'updatedAt'
] as const);

export const SETTINGS_FIELD_WHITELIST = Object.freeze([
  'storeId',
  'storeName',
  'storeLogo',
  'currency',
  'taxRate',
  'address',
  'phone',
  'website',
  'footerMessage',
  'language',
  'theme',
  'dataTracking'
] as const);

export const FORBIDDEN_FIELD_PATTERNS = [
  /password/i,
  /hash/i,
  /salt/i,
  /token/i,
  /secret/i,
  /pin/i,
  /session/i
];

export function isValidStoreId(storeId: unknown): storeId is string {
  if (typeof storeId !== 'string') return false;
  const trimmed = storeId.trim();
  if (trimmed.length === 0 || trimmed.length > 128) return false;
  return /^[a-zA-Z0-9_\-\.]{1,128}$/.test(trimmed);
}

export function isValidActionType(action: unknown): action is SyncActionType {
  return action === 'CREATE' || action === 'UPDATE' || action === 'DELETE';
}

export function isValidTable(table: unknown): boolean {
  if (typeof table !== 'string') return false;
  return SYNC_TABLE_ALLOWLIST.has(table.trim());
}

/**
 * Strips any sensitive or forbidden fields from an object payload.
 */
export function sanitizePayload(table: string, rawPayload: any, action: SyncActionType): Record<string, any> | null {
  if (!rawPayload || typeof rawPayload !== 'object' || Array.isArray(rawPayload)) {
    return null;
  }

  const payloadId = rawPayload.id;
  if (payloadId === undefined || payloadId === null) {
    // Every syncable item in MIZANE has an identifier
    return null;
  }

  // Handle DELETE: carrying only id is sufficient and safest
  if (action === 'DELETE') {
    return { id: payloadId };
  }

  // Table-specific whitelisting:
  if (table === 'users') {
    const sanitizedUser: Record<string, any> = {};
    for (const key of USERS_FIELD_WHITELIST) {
      if (key in rawPayload && rawPayload[key] !== undefined) {
        sanitizedUser[key] = rawPayload[key];
      }
    }
    // Normalize role
    if (sanitizedUser.role && !['Admin', 'Manager', 'Cashier'].includes(String(sanitizedUser.role))) {
      sanitizedUser.role = 'Cashier';
    }
    return sanitizedUser;
  }

  if (table === 'settings') {
    const sanitizedSettings: Record<string, any> = { id: payloadId };
    for (const key of SETTINGS_FIELD_WHITELIST) {
      if (key in rawPayload && rawPayload[key] !== undefined) {
        sanitizedSettings[key] = rawPayload[key];
      }
    }
    return sanitizedSettings;
  }

  // General tables: recursively remove any forbidden security fields
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(rawPayload)) {
    const isForbidden = FORBIDDEN_FIELD_PATTERNS.some(pat => pat.test(key));
    if (isForbidden) {
      continue;
    }
    if (value !== undefined) {
      clean[key] = value;
    }
  }

  return clean;
}

/**
 * Validates and normalizes an incoming sync action.
 * Returns the normalized action or null if invalid.
 */
export function validateSyncAction(rawAction: any): SyncAction | null {
  if (!rawAction || typeof rawAction !== 'object') return null;

  const { id, table, action, payload, timestamp, operationId, clientOpId } = rawAction;

  if (id === undefined || id === null) return null;
  if (!isValidTable(table)) return null;
  if (!isValidActionType(action)) return null;

  const parsedTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : Number(timestamp);
  if (isNaN(parsedTimestamp) || parsedTimestamp <= 0) return null;

  const sanitized = sanitizePayload(table, payload, action);
  if (!sanitized) return null;

  const normalizedOperationId = (operationId || clientOpId) ? String(operationId || clientOpId).trim() : undefined;

  return {
    id,
    operationId: normalizedOperationId,
    clientOpId: normalizedOperationId,
    table,
    action,
    payload: sanitized,
    timestamp: parsedTimestamp
  };
}
