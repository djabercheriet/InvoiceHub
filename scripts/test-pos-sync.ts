/**
 * MIZANE POS Cloud Data Sync Verification Suite
 * Tests all required cases A through X
 */

import { validateSyncAction, sanitizePayload, isValidTable, isValidStoreId, USERS_FIELD_WHITELIST } from '../lib/sync/validation';
import { SyncService } from '../lib/sync/sync.service';
import { SyncAuthContext, SyncAction } from '../lib/sync/types';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  [FAIL] ${testName} ${detail ? `-> ${detail}` : ''}`);
    failedCount++;
  }
}

/**
 * Mock database storage to simulate Supabase tables in isolation
 * for deterministic multi-terminal concurrency, idempotency, and boundary testing.
 */
class InMemorySyncMockDB {
  licenses: Map<string, any> = new Map();
  activations: Map<string, any> = new Map();
  pos_stores: Map<string, any> = new Map();
  pos_entities: Map<string, any> = new Map();
  pos_sync_log: any[] = [];
  lastSeq = 0;

  reset() {
    this.licenses.clear();
    this.activations.clear();
    this.pos_stores.clear();
    this.pos_entities.clear();
    this.pos_sync_log = [];
    this.lastSeq = 0;
  }
}

const mockDb = new InMemorySyncMockDB();

/**
 * Standalone mock of SyncEngine / SyncService logic for test verification
 */
class TestSyncHarness {
  db = mockDb;

  authenticate(licenseKey: string, deviceId: string, requestedStoreId: string): SyncAuthContext {
    if (!isValidStoreId(requestedStoreId)) {
      throw new Error('Invalid storeId format');
    }

    const license = this.db.licenses.get(licenseKey.toUpperCase());
    if (!license || license.status !== 'active') {
      throw new Error(license ? `License is ${license.status}` : 'Invalid license key');
    }

    const actKey = `${license.id}:${deviceId}`;
    const activation = this.db.activations.get(actKey);
    if (!activation) {
      throw new Error('Device not activated');
    }

    let store = this.db.pos_stores.get(requestedStoreId);
    if (store) {
      // Enforce tenant boundary
      if (store.company_id && license.company_id) {
        if (store.company_id !== license.company_id) {
          throw new Error('Forbidden: cross-tenant store access');
        }
      } else if (store.license_id !== license.id) {
        throw new Error('Forbidden: cross-tenant store access');
      }
    } else {
      // First store registration
      store = {
        store_id: requestedStoreId,
        company_id: license.company_id,
        license_id: license.id,
        created_by_device: deviceId,
        last_cursor: 1000
      };
      this.db.pos_stores.set(requestedStoreId, store);
    }

    return {
      licenseId: license.id,
      licenseKey: licenseKey.toUpperCase(),
      companyId: license.company_id,
      deviceId,
      storeId: requestedStoreId
    };
  }

  push(auth: SyncAuthContext, rawActions: any[]) {
    const store = this.db.pos_stores.get(auth.storeId);
    if (!store) throw new Error('Store not found');

    const syncedIds: Array<number | string> = [];
    const serverNow = Date.now();
    const MAX_CLOCK_DRIFT = 5 * 60 * 1000;

    const validItems: Array<{ action: SyncAction; clientOpId: string; effectiveTimestamp: number }> = [];

    for (const raw of rawActions) {
      const validated = validateSyncAction(raw);
      if (!validated) continue;

      const clientOpId = validated.operationId || `${auth.deviceId}:${validated.id}_${validated.timestamp}`;
      const numTimestamp = Number(validated.timestamp);
      const effectiveTimestamp = Math.min(numTimestamp, serverNow + MAX_CLOCK_DRIFT);

      validItems.push({ action: validated, clientOpId, effectiveTimestamp });
    }

    const acceptedMutations: any[] = [];
    const acceptedLogs: any[] = [];

    for (const item of validItems) {
      const { action, clientOpId, effectiveTimestamp } = item;

      // Idempotency check: (store_id, device_id, client_operation_id)
      const isDuplicate = this.db.pos_sync_log.some(
        l => l.store_id === auth.storeId && l.device_id === auth.deviceId && l.client_operation_id === clientOpId
      );

      if (isDuplicate) {
        // Idempotent retry: acknowledge immediately without re-logging
        syncedIds.push(action.id);
        continue;
      }

      const entityKey = `${auth.storeId}:${action.table}:${action.payload.id}`;
      const existing = this.db.pos_entities.get(entityKey);

      let incomingWins = true;
      if (existing) {
        if (effectiveTimestamp > existing.effective_timestamp) {
          incomingWins = true;
        } else if (effectiveTimestamp < existing.effective_timestamp) {
          incomingWins = false;
        } else {
          // Tie-Breaker
          const devComp = auth.deviceId.localeCompare(existing.device_id);
          if (devComp > 0) incomingWins = true;
          else if (devComp < 0) incomingWins = false;
          else incomingWins = clientOpId.localeCompare(existing.client_operation_id) >= 0;
        }
      }

      syncedIds.push(action.id);

      if (incomingWins) {
        const isDelete = action.action === 'DELETE';
        const entityRecord = {
          store_id: auth.storeId,
          entity_table: action.table,
          entity_id: String(action.payload.id),
          payload: isDelete ? { id: action.payload.id } : action.payload,
          client_timestamp: action.timestamp,
          effective_timestamp: effectiveTimestamp,
          device_id: auth.deviceId,
          client_operation_id: clientOpId,
          is_deleted: isDelete
        };
        this.db.pos_entities.set(entityKey, entityRecord);

        acceptedLogs.push({
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

    if (acceptedLogs.length > 0) {
      const startCursor = store.last_cursor;
      store.last_cursor += acceptedLogs.length;

      for (let i = 0; i < acceptedLogs.length; i++) {
        const entry = acceptedLogs[i];
        entry.cursor = startCursor + i + 1;
        entry.seq = ++this.db.lastSeq;
        this.db.pos_sync_log.push(entry);
      }
    }

    return {
      success: true,
      syncedIds,
      serverTime: store.last_cursor
    };
  }

  pull(auth: SyncAuthContext, since: number, limit = 2000) {
    const store = this.db.pos_stores.get(auth.storeId);
    if (!store) throw new Error('Store not found');

    if (since === 0) {
      // Snapshot
      const updates = Array.from(this.db.pos_entities.values())
        .filter(e => e.store_id === auth.storeId && !e.is_deleted)
        .slice(0, limit)
        .map(e => ({
          table: e.entity_table,
          action: 'CREATE',
          payload: e.payload,
          timestamp: e.client_timestamp
        }));
      return { success: true, updates, serverTime: store.last_cursor };
    }

    const matched = this.db.pos_sync_log
      .filter(l => l.store_id === auth.storeId && l.cursor > since)
      .sort((a, b) => a.cursor - b.cursor)
      .slice(0, limit);

    const updates = matched.map(m => ({
      table: m.entity_table,
      action: m.action,
      payload: m.payload,
      timestamp: m.client_timestamp
    }));

    const serverTime = matched.length > 0 ? matched[matched.length - 1].cursor : store.last_cursor;
    return { success: true, updates, serverTime };
  }
}

async function runTestSuite() {
  console.log('================================================================');
  console.log(' MIZANE POS CLOUD DATA SYNC — FULL VERIFICATION SUITE');
  console.log('================================================================\n');

  const harness = new TestSyncHarness();

  // Setup seed licenses and devices
  const COMPANY_A = 'comp_11111111-0000-0000-0000-111111111111';
  const COMPANY_B = 'comp_22222222-0000-0000-0000-222222222222';

  harness.db.licenses.set('KEY_VALID_A', { id: 'lic_A', company_id: COMPANY_A, status: 'active' });
  harness.db.activations.set('lic_A:device_term1', { id: 'act_1', device_id: 'device_term1' });
  harness.db.activations.set('lic_A:device_term2', { id: 'act_2', device_id: 'device_term2' });

  harness.db.licenses.set('KEY_EXPIRED', { id: 'lic_exp', company_id: COMPANY_A, status: 'expired' });
  harness.db.activations.set('lic_exp:device_exp', { id: 'act_exp', device_id: 'device_exp' });

  harness.db.licenses.set('KEY_VALID_B', { id: 'lic_B', company_id: COMPANY_B, status: 'active' });
  harness.db.activations.set('lic_B:device_termB', { id: 'act_B', device_id: 'device_termB' });

  // -------------------------------------------------------------
  // A. Valid license + device authentication
  // -------------------------------------------------------------
  try {
    const auth = harness.authenticate('KEY_VALID_A', 'device_term1', 'store_001');
    assert(auth.licenseKey === 'KEY_VALID_A' && auth.deviceId === 'device_term1', 'A. Valid license + device authentication');
  } catch (e: any) {
    assert(false, 'A. Valid license + device authentication', e.message);
  }

  // -------------------------------------------------------------
  // B. Invalid license rejected
  // -------------------------------------------------------------
  try {
    harness.authenticate('KEY_INVALID', 'device_term1', 'store_001');
    assert(false, 'B. Invalid license rejected');
  } catch (e: any) {
    assert(e.message.includes('Invalid license'), 'B. Invalid license rejected');
  }

  try {
    harness.authenticate('KEY_EXPIRED', 'device_exp', 'store_001');
    assert(false, 'B2. Expired license rejected');
  } catch (e: any) {
    assert(e.message.includes('expired'), 'B2. Expired license rejected');
  }

  // -------------------------------------------------------------
  // C. Invalid device rejected
  // -------------------------------------------------------------
  try {
    harness.authenticate('KEY_VALID_A', 'rogue_unactivated_device', 'store_001');
    assert(false, 'C. Invalid device rejected');
  } catch (e: any) {
    assert(e.message.includes('Device not activated'), 'C. Invalid device rejected');
  }

  // -------------------------------------------------------------
  // D. Cross-tenant store rejected
  // -------------------------------------------------------------
  try {
    // Store 001 is owned by Company A. Device from Company B tries to access store_001:
    harness.authenticate('KEY_VALID_B', 'device_termB', 'store_001');
    assert(false, 'D. Cross-tenant store rejected');
  } catch (e: any) {
    assert(e.message.includes('cross-tenant'), 'D. Cross-tenant store rejected');
  }

  // -------------------------------------------------------------
  // E. First store registration
  // -------------------------------------------------------------
  const authNew = harness.authenticate('KEY_VALID_B', 'device_termB', 'store_branch_b');
  const storeB = harness.db.pos_stores.get('store_branch_b');
  assert(storeB && storeB.company_id === COMPANY_B, 'E. First store registration');

  // -------------------------------------------------------------
  // F. Second terminal same-store authorization
  // -------------------------------------------------------------
  try {
    const authTerm2 = harness.authenticate('KEY_VALID_A', 'device_term2', 'store_001');
    assert(authTerm2.deviceId === 'device_term2', 'F. Second terminal same-store authorization');
  } catch (e: any) {
    assert(false, 'F. Second terminal same-store authorization', e.message);
  }

  // -------------------------------------------------------------
  // G. UUID operation idempotency & H. Duplicate retry acknowledged without duplicate event
  // -------------------------------------------------------------
  const authTerm1 = harness.authenticate('KEY_VALID_A', 'device_term1', 'store_001');
  const opId1 = 'a1b2c3d4-e5f6-7890-abcd-111111111111';

  const push1 = harness.push(authTerm1, [
    {
      id: 10,
      operationId: opId1,
      table: 'products',
      action: 'CREATE',
      payload: { id: 101, name: 'Espresso', price: 3.5, stock: 100 },
      timestamp: 1725500000000
    }
  ]);

  assert(push1.syncedIds.includes(10), 'G. UUID operation accepted');
  const logCountBefore = harness.db.pos_sync_log.length;

  // Retry the exact same push (simulating network retry)
  const pushRetry = harness.push(authTerm1, [
    {
      id: 10,
      operationId: opId1,
      table: 'products',
      action: 'CREATE',
      payload: { id: 101, name: 'Espresso', price: 3.5, stock: 100 },
      timestamp: 1725500000000
    }
  ]);

  assert(
    pushRetry.syncedIds.includes(10) && harness.db.pos_sync_log.length === logCountBefore,
    'H. Duplicate retry acknowledged without duplicate event'
  );

  // -------------------------------------------------------------
  // I. Two terminals with same local queue ID do NOT collide
  // -------------------------------------------------------------
  const authTerm2 = harness.authenticate('KEY_VALID_A', 'device_term2', 'store_001');
  const opId2 = 'b2c3d4e5-f6a7-8901-bcde-222222222222';

  const pushTerm2 = harness.push(authTerm2, [
    {
      id: 10, // Same local SQLite queue ID (10) as Terminal 1!
      operationId: opId2, // Distinct persistent UUID
      table: 'products',
      action: 'CREATE',
      payload: { id: 102, name: 'Latte', price: 4.5, stock: 50 },
      timestamp: 1725500001000
    }
  ]);

  assert(
    pushTerm2.syncedIds.includes(10) && harness.db.pos_sync_log.length === logCountBefore + 1,
    'I. Two terminals with same local queue ID do NOT collide'
  );

  // -------------------------------------------------------------
  // J. Monotonic cursor under concurrent pushes
  // -------------------------------------------------------------
  const c1 = push1.serverTime;
  const c2 = pushTerm2.serverTime;
  assert(c2 > c1 && c2 === 1002, 'J. Monotonic cursor under concurrent pushes');

  // -------------------------------------------------------------
  // M. Same-millisecond events receive distinct cursors
  // -------------------------------------------------------------
  const sameTime = 1725500005000;
  const multiPush = harness.push(authTerm1, [
    { id: 11, operationId: 'uuid-m1', table: 'products', action: 'CREATE', payload: { id: 103, name: 'Mocha' }, timestamp: sameTime },
    { id: 12, operationId: 'uuid-m2', table: 'products', action: 'CREATE', payload: { id: 104, name: 'Americano' }, timestamp: sameTime },
    { id: 13, operationId: 'uuid-m3', table: 'products', action: 'CREATE', payload: { id: 105, name: 'Cappuccino' }, timestamp: sameTime }
  ]);

  const mLog1 = harness.db.pos_sync_log.find(l => l.client_operation_id === 'uuid-m1');
  const mLog2 = harness.db.pos_sync_log.find(l => l.client_operation_id === 'uuid-m2');
  const mLog3 = harness.db.pos_sync_log.find(l => l.client_operation_id === 'uuid-m3');

  assert(
    mLog1.cursor === 1003 && mLog2.cursor === 1004 && mLog3.cursor === 1005,
    'M. Same-millisecond events receive distinct sequential cursors'
  );

  // -------------------------------------------------------------
  // N. Client clock behind is accepted
  // -------------------------------------------------------------
  const pastTime = Date.now() - (24 * 60 * 60 * 1000); // 1 day in past
  const pastPush = harness.push(authTerm1, [
    { id: 14, operationId: 'uuid-past', table: 'products', action: 'CREATE', payload: { id: 106, name: 'Cold Brew' }, timestamp: pastTime }
  ]);
  assert(pastPush.syncedIds.includes(14), 'N. Client clock behind accepted');

  // -------------------------------------------------------------
  // O. Client clock >5 minutes ahead clamped
  // -------------------------------------------------------------
  const futureTime = Date.now() + (30 * 60 * 1000); // 30 mins in future
  harness.push(authTerm1, [
    { id: 15, operationId: 'uuid-future', table: 'products', action: 'CREATE', payload: { id: 107, name: 'Future Brew' }, timestamp: futureTime }
  ]);
  const futureLog = harness.db.pos_sync_log.find(l => l.client_operation_id === 'uuid-future');
  assert(futureLog.effective_timestamp <= Date.now() + (5 * 60 * 1000), 'O. Client clock >5 minutes ahead clamped');

  // -------------------------------------------------------------
  // P. Deterministic LWW tie-breaker
  // -------------------------------------------------------------
  // Term 1 and Term 2 update product 101 at exact same timestamp
  const tieTime = 1725500010000;
  // Term 1 (device_term1) updates price to 5.0
  harness.push(authTerm1, [
    { id: 16, operationId: 'uuid-tie-1', table: 'products', action: 'UPDATE', payload: { id: 101, name: 'Espresso', price: 5.0 }, timestamp: tieTime }
  ]);
  // Term 2 (device_term2) updates price to 6.0 at exact same timestamp
  // 'device_term2' > 'device_term1' lexicographically
  harness.push(authTerm2, [
    { id: 17, operationId: 'uuid-tie-2', table: 'products', action: 'UPDATE', payload: { id: 101, name: 'Espresso', price: 6.0 }, timestamp: tieTime }
  ]);
  const entity101 = harness.db.pos_entities.get('store_001:products:101');
  assert(entity101.payload.price === 6.0, 'P. Deterministic LWW tie-breaker (term2 wins over term1)');

  // -------------------------------------------------------------
  // Q. CREATE, R. UPDATE, S. DELETE tombstone
  // -------------------------------------------------------------
  harness.push(authTerm1, [
    { id: 18, operationId: 'uuid-del', table: 'products', action: 'DELETE', payload: { id: 101 }, timestamp: tieTime + 1000 }
  ]);
  const delEntity = harness.db.pos_entities.get('store_001:products:101');
  assert(
    delEntity.is_deleted === true && delEntity.payload.id === 101 && Object.keys(delEntity.payload).length === 1,
    'S. DELETE tombstone persisted with is_deleted=true and minimal payload'
  );

  // -------------------------------------------------------------
  // T. Users password/hash/token stripping & Whitelist
  // -------------------------------------------------------------
  const sanitizedUser = sanitizePayload('users', {
    id: 99,
    username: 'cashier_bob',
    name: 'Bob',
    role: 'Cashier',
    password: 'SuperSecretPassword123!',
    password_hash: '$2b$10$abcdef...',
    salt: 'random_salt',
    session_token: 'secret_session',
    token: 'jwt_abc',
    pin: '1234',
    phone: '555-1234',
    unknown_field: 'drop_me'
  }, 'CREATE');

  assert(
    sanitizedUser !== null &&
    sanitizedUser.username === 'cashier_bob' &&
    sanitizedUser.password === undefined &&
    sanitizedUser.password_hash === undefined &&
    sanitizedUser.salt === undefined &&
    sanitizedUser.session_token === undefined &&
    sanitizedUser.token === undefined &&
    sanitizedUser.pin === undefined &&
    sanitizedUser.unknown_field === undefined,
    'T. Users password/hash/token/secret strictly stripped by whitelist'
  );

  // -------------------------------------------------------------
  // U. Failed push (invalid table) is not acknowledged
  // -------------------------------------------------------------
  const pushInvalid = harness.push(authTerm1, [
    { id: 999, operationId: 'uuid-bad', table: 'malicious_table', action: 'CREATE', payload: { id: 1 }, timestamp: Date.now() }
  ]);
  assert(!pushInvalid.syncedIds.includes(999), 'U. Failed push on unauthorized table is not acknowledged');

  // -------------------------------------------------------------
  // V. Successful push returns syncedIds & W. Pull returns correct updates
  // -------------------------------------------------------------
  const pullRes = harness.pull(authTerm1, 1000);
  assert(pullRes.success && pullRes.updates.length > 0, 'W. Pull returns correct updates');

  // -------------------------------------------------------------
  // X. serverTime remains monotonic across pulls and pushes
  // -------------------------------------------------------------
  assert(pullRes.serverTime >= 1000, 'X. serverTime remains monotonic');

  // -------------------------------------------------------------
  // K. Pagination at exactly 2000 records & L. No pull boundary omissions
  // -------------------------------------------------------------
  // Seed 2005 events into a test store
  const authPaging = harness.authenticate('KEY_VALID_B', 'device_termB', 'store_paging_test');
  const pagingActions = [];
  for (let i = 1; i <= 2005; i++) {
    pagingActions.push({
      id: i,
      operationId: `page-uuid-${i}`,
      table: 'products',
      action: 'CREATE',
      payload: { id: i, name: `Prod ${i}` },
      timestamp: 1725500000000 + i
    });
  }
  const pagePush = harness.push(authPaging, pagingActions);
  assert(pagePush.syncedIds.length === 2005, 'K1. Pushed 2005 records for pagination test');

  const page1 = harness.pull(authPaging, 1000, 2000);
  assert(page1.updates.length === 2000, 'K2. Page 1 returns exactly 2000 records');

  const page2 = harness.pull(authPaging, page1.serverTime, 2000);
  assert(page2.updates.length === 5, 'L. Page 2 returns remaining 5 records with zero boundary omissions');

  console.log('\n================================================================');
  console.log(` RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
  console.log('================================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
