export type SyncActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export interface SyncAction {
  id: number | string;
  operationId?: string;
  clientOpId?: string;
  table: string;
  action: SyncActionType;
  payload: Record<string, any>;
  timestamp: number | string;
}

export interface SyncPushRequest {
  storeId: string;
  actions: SyncAction[];
}

export interface SyncPushResponse {
  success: boolean;
  syncedIds: Array<number | string>;
  serverTime: number;
}

export interface SyncPullUpdate {
  table: string;
  action: SyncActionType;
  payload: Record<string, any>;
  timestamp: number;
}

export interface SyncPullResponse {
  success: boolean;
  updates: SyncPullUpdate[];
  serverTime: number;
}

export interface SyncAuthContext {
  licenseId: string;
  licenseKey: string;
  companyId: string | null;
  deviceId: string;
  storeId: string;
}

export interface PosStoreRecord {
  store_id: string;
  company_id: string | null;
  license_id: string;
  created_by_device: string;
  store_name: string | null;
  last_cursor: number;
  created_at?: string;
  updated_at?: string;
}

export interface PosEntityRecord {
  store_id: string;
  entity_table: string;
  entity_id: string;
  payload: Record<string, any>;
  client_timestamp: number;
  effective_timestamp: number;
  device_id: string;
  client_operation_id: string;
  server_timestamp: number;
  is_deleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PosSyncLogRecord {
  seq?: number;
  cursor: number;
  store_id: string;
  device_id: string;
  client_operation_id: string;
  entity_table: string;
  entity_id: string;
  action: SyncActionType;
  payload: Record<string, any>;
  client_timestamp: number;
  effective_timestamp: number;
  server_timestamp: number;
  created_at?: string;
}
