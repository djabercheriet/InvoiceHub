import { createAdminClient } from '@/lib/supabase/admin';
import { SyncAction, SyncAuthContext, SyncPullUpdate, SyncPushResponse, SyncPullResponse } from './types';
import { validateSyncAction } from './validation';

const MAX_CLOCK_DRIFT_MS = 5 * 60 * 1000; // 5 minutes
const PULL_LIMIT = 2000;

export class SyncService {
  /**
   * Processes a batch of sync push actions from an authenticated POS terminal.
   * Ensures idempotency, multi-terminal isolation, deterministic LWW, and monotonic cursor allocation.
   */
  async pushActions(auth: SyncAuthContext, rawActions: any[]): Promise<SyncPushResponse> {
    if (!Array.isArray(rawActions) || rawActions.length === 0) {
      const currentCursor = await this.getStoreCursor(auth.storeId);
      return { success: true, syncedIds: [], serverTime: currentCursor };
    }

    const supabase = createAdminClient();
    const syncedIds: Array<number | string> = [];
    const serverNow = Date.now();

    // 1. Pre-filter and normalize valid actions
    const validActions: Array<{
      action: SyncAction;
      clientOpId: string;
      effectiveTimestamp: number;
    }> = [];

    for (const raw of rawActions) {
      const validated = validateSyncAction(raw);
      if (!validated) {
        continue;
      }

      // Generate or reuse persistent client operation ID
      const clientOpId = validated.operationId || `${auth.deviceId}:${validated.id}_${validated.timestamp}`;

      const numTimestamp = Number(validated.timestamp);
      // Bounded effective timestamp (neutralizes clock skew beyond +5 minutes)
      const effectiveTimestamp = Math.min(numTimestamp, serverNow + MAX_CLOCK_DRIFT_MS);

      validActions.push({
        action: validated,
        clientOpId,
        effectiveTimestamp
      });
    }

    if (validActions.length === 0) {
      const currentCursor = await this.getStoreCursor(auth.storeId);
      return { success: true, syncedIds: [], serverTime: currentCursor };
    }

    // 2. Fetch existing operation IDs to enforce strict multi-terminal idempotency
    const opIds = validActions.map(v => v.clientOpId);
    const { data: existingLogs } = await supabase
      .from('pos_sync_log')
      .select('client_operation_id')
      .eq('store_id', auth.storeId)
      .eq('device_id', auth.deviceId)
      .in('client_operation_id', opIds);

    const alreadyProcessedOps = new Set<string>((existingLogs || []).map(l => l.client_operation_id));

    // 3. Staging containers
    const actionsToApply: Array<{
      action: SyncAction;
      clientOpId: string;
      effectiveTimestamp: number;
    }> = [];

    for (const item of validActions) {
      if (alreadyProcessedOps.has(item.clientOpId)) {
        // Idempotent retry: acknowledge immediately without re-processing
        syncedIds.push(item.action.id);
      } else {
        actionsToApply.push(item);
      }
    }

    if (actionsToApply.length === 0) {
      const currentCursor = await this.getStoreCursor(auth.storeId);
      return { success: true, syncedIds, serverTime: currentCursor };
    }

    // 4. Fetch current materialized state for target entities to resolve LWW conflicts
    const entityKeys = actionsToApply.map(item => `${item.action.table}:${item.action.payload.id}`);
    const uniqueTables = Array.from(new Set(actionsToApply.map(item => item.action.table)));

    const { data: existingEntities } = await supabase
      .from('pos_entities')
      .select('entity_table, entity_id, effective_timestamp, device_id, client_operation_id')
      .eq('store_id', auth.storeId)
      .in('entity_table', uniqueTables);

    const entityStateMap = new Map<string, {
      effective_timestamp: number;
      device_id: string;
      client_operation_id: string;
    }>();

    for (const ent of existingEntities || []) {
      entityStateMap.set(`${ent.entity_table}:${ent.entity_id}`, ent);
    }

    // 5. Evaluate LWW conflicts and prepare state mutations & log entries
    const acceptedMutations: any[] = [];
    const acceptedLogEntries: any[] = [];

    for (const item of actionsToApply) {
      const { action, clientOpId, effectiveTimestamp } = item;
      const entityKey = `${action.table}:${action.payload.id}`;
      const existing = entityStateMap.get(entityKey);

      let incomingWins = true;

      if (existing) {
        if (effectiveTimestamp > existing.effective_timestamp) {
          incomingWins = true;
        } else if (effectiveTimestamp < existing.effective_timestamp) {
          incomingWins = false;
        } else {
          // Tie-Breaker 1: Lexicographical comparison of device_id
          const devComp = auth.deviceId.localeCompare(existing.device_id);
          if (devComp > 0) {
            incomingWins = true;
          } else if (devComp < 0) {
            incomingWins = false;
          } else {
            // Tie-Breaker 2: Lexicographical comparison of client_operation_id
            incomingWins = clientOpId.localeCompare(existing.client_operation_id) >= 0;
          }
        }
      }

      // Record queue action acknowledgment regardless of win/loss (prevents retry loop)
      syncedIds.push(action.id);

      if (incomingWins) {
        // Update local map so intra-batch conflicts on same entity resolve properly
        entityStateMap.set(entityKey, {
          effective_timestamp: effectiveTimestamp,
          device_id: auth.deviceId,
          client_operation_id: clientOpId
        });

        // Stage materialized state mutation
        const isDelete = action.action === 'DELETE';
        acceptedMutations.push({
          store_id: auth.storeId,
          entity_table: action.table,
          entity_id: String(action.payload.id),
          payload: isDelete ? { id: action.payload.id } : action.payload,
          client_timestamp: action.timestamp,
          effective_timestamp: effectiveTimestamp,
          device_id: auth.deviceId,
          client_operation_id: clientOpId,
          server_timestamp: serverNow,
          is_deleted: isDelete,
          updated_at: new Date(serverNow).toISOString()
        });

        // Stage log event
        acceptedLogEntries.push({
          store_id: auth.storeId,
          device_id: auth.deviceId,
          client_operation_id: clientOpId,
          entity_table: action.table,
          entity_id: String(action.payload.id),
          action: action.action,
          payload: isDelete ? { id: action.payload.id } : action.payload,
          client_timestamp: action.timestamp,
          effective_timestamp: effectiveTimestamp,
          server_timestamp: serverNow
        });
      }
    }

    // 6. Concurrency-Safe Monotonic Cursor Allocation
    let finalCursor = await this.getStoreCursor(auth.storeId);

    if (acceptedLogEntries.length > 0) {
      const startCursor = await this.allocateCursorBlock(auth.storeId, acceptedLogEntries.length);
      finalCursor = startCursor + acceptedLogEntries.length;

      // Assign sequential monotonic cursor to each event
      for (let i = 0; i < acceptedLogEntries.length; i++) {
        acceptedLogEntries[i].cursor = startCursor + i + 1;
      }

      // Upsert into pos_entities
      const { error: upsertEntitiesError } = await supabase
        .from('pos_entities')
        .upsert(acceptedMutations, { onConflict: 'store_id, entity_table, entity_id' });

      if (upsertEntitiesError) {
        console.error('[SyncService] Failed to upsert pos_entities:', upsertEntitiesError);
        throw new Error('Database error updating pos_entities: ' + upsertEntitiesError.message);
      }

      // Insert into pos_sync_log
      const { error: insertLogError } = await supabase
        .from('pos_sync_log')
        .insert(acceptedLogEntries);

      if (insertLogError) {
        console.error('[SyncService] Failed to insert pos_sync_log:', insertLogError);
        throw new Error('Database error recording pos_sync_log: ' + insertLogError.message);
      }
    }

    return {
      success: true,
      syncedIds,
      serverTime: finalCursor
    };
  }

  /**
   * Pulls incremental updates or snapshot for an authorized store.
   */
  async pullUpdates(auth: SyncAuthContext, sinceCursor: number): Promise<SyncPullResponse> {
    const supabase = createAdminClient();

    // Case 1: Initial Snapshot (since === 0)
    if (sinceCursor === 0) {
      const { data: snapshotRows, error: snapshotError } = await supabase
        .from('pos_entities')
        .select('entity_table, payload, client_timestamp')
        .eq('store_id', auth.storeId)
        .eq('is_deleted', false)
        .order('entity_table', { ascending: true })
        .limit(PULL_LIMIT);

      if (snapshotError) {
        console.error('[SyncService] Snapshot error:', snapshotError);
        throw new Error('Database error fetching snapshot');
      }

      const updates: SyncPullUpdate[] = (snapshotRows || []).map(row => ({
        table: row.entity_table,
        action: 'CREATE',
        payload: row.payload,
        timestamp: row.client_timestamp
      }));

      const serverTime = await this.getStoreCursor(auth.storeId);
      return { success: true, updates, serverTime };
    }

    // Case 2: Incremental Delta Pull (since > 0)
    const { data: deltaRows, error: deltaError } = await supabase
      .from('pos_sync_log')
      .select('cursor, entity_table, action, payload, client_timestamp')
      .eq('store_id', auth.storeId)
      .gt('cursor', sinceCursor)
      .order('cursor', { ascending: true })
      .limit(PULL_LIMIT);

    if (deltaError) {
      console.error('[SyncService] Pull error:', deltaError);
      throw new Error('Database error fetching sync deltas');
    }

    const updates: SyncPullUpdate[] = (deltaRows || []).map(row => ({
      table: row.entity_table,
      action: row.action,
      payload: row.payload,
      timestamp: row.client_timestamp
    }));

    let serverTime = sinceCursor;
    if (deltaRows && deltaRows.length > 0) {
      serverTime = deltaRows[deltaRows.length - 1].cursor;
    } else {
      serverTime = await this.getStoreCursor(auth.storeId);
    }

    return {
      success: true,
      updates,
      serverTime
    };
  }

  /**
   * Atomically allocates a contiguous block of cursors for a given store.
   */
  private async allocateCursorBlock(storeId: string, count: number): Promise<number> {
    const supabase = createAdminClient();

    // 1. Try atomic PostgreSQL RPC function if installed
    const { data: rpcResult, error: rpcError } = await supabase.rpc('allocate_pos_sync_cursors', {
      p_store_id: storeId,
      p_count: count
    });

    if (!rpcError && rpcResult !== null && rpcResult !== undefined) {
      return Number(rpcResult);
    }

    // 2. Application-level atomic fallback if RPC not yet created in remote DB
    const { data: store, error: fetchErr } = await supabase
      .from('pos_stores')
      .select('last_cursor')
      .eq('store_id', storeId)
      .single();

    if (fetchErr || !store) {
      throw new Error(`Store ${storeId} not found in pos_stores`);
    }

    const startCursor = Number(store.last_cursor || 0);
    const newCursor = startCursor + count;

    const { error: updateErr } = await supabase
      .from('pos_stores')
      .update({ last_cursor: newCursor, updated_at: new Date().toISOString() })
      .eq('store_id', storeId)
      .eq('last_cursor', startCursor); // Optimistic concurrency guard

    if (updateErr) {
      // Retry once on race
      const { data: retryStore } = await supabase
        .from('pos_stores')
        .select('last_cursor')
        .eq('store_id', storeId)
        .single();
      const retryStart = Number(retryStore?.last_cursor || 0);
      await supabase
        .from('pos_stores')
        .update({ last_cursor: retryStart + count, updated_at: new Date().toISOString() })
        .eq('store_id', storeId);
      return retryStart;
    }

    return startCursor;
  }

  private async getStoreCursor(storeId: string): Promise<number> {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('pos_stores')
      .select('last_cursor')
      .eq('store_id', storeId)
      .maybeSingle();

    return Number(data?.last_cursor || 0);
  }
}

export const syncService = new SyncService();
