import { NextRequest } from 'next/server';
import { OPTIONS as optionsPull, GET as getPull } from '../app/api/sync/pull/route';
import { OPTIONS as optionsPush, POST as postPush } from '../app/api/sync/push/route';

async function run() {
  let passed = 0;
  let failed = 0;

  function check(cond: boolean, desc: string) {
    if (cond) {
      console.log(`  [PASS] ${desc}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${desc}`);
      failed++;
    }
  }

  console.log('================================================================');
  console.log(' MIZANE SYNC CORS SUITE');
  console.log('================================================================\n');

  // 1. OPTIONS /api/sync/pull with http://localhost:3000
  {
    const req = new NextRequest('http://localhost:3000/api/sync/pull', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'content-type,x-device-id,x-license-key',
      },
    });
    const res = await optionsPull(req);
    check(res.status === 204, 'OPTIONS /api/sync/pull responds 204');
    check(res.headers.get('Access-Control-Allow-Origin') === 'http://localhost:3000', 'OPTIONS /api/sync/pull allows http://localhost:3000');
    check(res.headers.get('Access-Control-Allow-Methods') === 'GET, POST, OPTIONS', 'OPTIONS /api/sync/pull allows methods');
    check(res.headers.get('Access-Control-Allow-Headers') === 'Content-Type, X-License-Key, X-Device-Id', 'OPTIONS /api/sync/pull allows headers');
    check(res.headers.get('Access-Control-Max-Age') === '86400', 'OPTIONS /api/sync/pull max age present');
    check(res.headers.get('Vary') === 'Origin', 'OPTIONS /api/sync/pull Vary Origin present');
  }

  // 2. OPTIONS /api/sync/push with http://localhost:3000
  {
    const req = new NextRequest('http://localhost:3000/api/sync/push', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-device-id,x-license-key',
      },
    });
    const res = await optionsPush(req);
    check(res.status === 204, 'OPTIONS /api/sync/push responds 204');
    check(res.headers.get('Access-Control-Allow-Origin') === 'http://localhost:3000', 'OPTIONS /api/sync/push allows http://localhost:3000');
    check(res.headers.get('Access-Control-Allow-Methods') === 'GET, POST, OPTIONS', 'OPTIONS /api/sync/push allows methods');
    check(res.headers.get('Access-Control-Allow-Headers') === 'Content-Type, X-License-Key, X-Device-Id', 'OPTIONS /api/sync/push allows headers');
  }

  // 3. OPTIONS /api/sync/pull with app://local
  {
    const req = new NextRequest('http://localhost:3000/api/sync/pull', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'app://local',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'content-type,x-device-id,x-license-key',
      },
    });
    const res = await optionsPull(req);
    check(res.status === 204, 'OPTIONS /api/sync/pull responds 204 for app://local');
    check(res.headers.get('Access-Control-Allow-Origin') === 'app://local', 'OPTIONS /api/sync/pull allows app://local');
  }

  // 4. OPTIONS /api/sync/push with app://local
  {
    const req = new NextRequest('http://localhost:3000/api/sync/push', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'app://local',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-device-id,x-license-key',
      },
    });
    const res = await optionsPush(req);
    check(res.status === 204, 'OPTIONS /api/sync/push responds 204 for app://local');
    check(res.headers.get('Access-Control-Allow-Origin') === 'app://local', 'OPTIONS /api/sync/push allows app://local');
  }

  // 5. Unauthenticated GET /api/sync/pull (without storeId)
  {
    const req = new NextRequest('http://localhost:3000/api/sync/pull', {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
      },
    });
    const res = await getPull(req);
    check(res.status === 400, 'GET /api/sync/pull without storeId returns 400');
    check(res.headers.get('Access-Control-Allow-Origin') === 'http://localhost:3000', 'GET 400 includes Access-Control-Allow-Origin');
    check(res.headers.get('Vary') === 'Origin', 'GET 400 includes Vary: Origin');
  }

  // 6. Unauthenticated GET /api/sync/pull (with storeId & since, missing license headers)
  {
    const req = new NextRequest('http://localhost:3000/api/sync/pull?storeId=test_store&since=0', {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:3000',
        'Content-Type': 'application/json',
      },
    });
    const res = await getPull(req);
    check(res.status === 401, 'GET /api/sync/pull unauthenticated returns 401');
    check(res.headers.get('Access-Control-Allow-Origin') === 'http://localhost:3000', 'GET 401 includes Access-Control-Allow-Origin');
    const body = await res.json();
    check(body.success === false && body.error.includes('Authentication required'), 'GET 401 returns auth error body');
  }

  // 7. Unauthenticated POST /api/sync/push (missing license headers)
  {
    const req = new NextRequest('http://localhost:3000/api/sync/push', {
      method: 'POST',
      headers: {
        'Origin': 'app://local',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        storeId: 'test_store',
        actions: [],
      }),
    });
    const res = await postPush(req);
    check(res.status === 401, 'POST /api/sync/push unauthenticated returns 401');
    check(res.headers.get('Access-Control-Allow-Origin') === 'app://local', 'POST 401 includes Access-Control-Allow-Origin: app://local');
    const body = await res.json();
    check(body.success === false && body.error.includes('Authentication required'), 'POST 401 returns auth error body');
  }

  // 8. Disallowed origin
  {
    const req = new NextRequest('http://localhost:3000/api/sync/pull', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://malicious-site.com',
        'Access-Control-Request-Method': 'GET',
      },
    });
    const res = await optionsPull(req);
    check(res.headers.get('Access-Control-Allow-Origin') === null, 'OPTIONS rejects unauthorized origin');
  }

  console.log('\n================================================================');
  console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
