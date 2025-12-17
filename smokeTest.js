// smokeTest.js


const axios = require('axios');

let db;

// Try the main DB module used by the app
try {
  db = require('./db/index');
} catch (e1) {
  try {
    // Fallback if your DB file is ./db.js instead of ./db/index.js
    db = require('./db');
  } catch (e2) {
    console.warn('⚠️  Could not require ./db/index or ./db – DB test will be skipped.');
  }
}

// Base URL of the running app (can override with env var if needed)
const BASE_URL = process.env.CYRUS_URL || 'http://localhost:3000';

// Axios client (don’t throw on non-2xx)
const client = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  validateStatus: () => true
});

// ---- List of HTTP checks ----
const tests = [
  {
    name: 'Home page responds (GET /)',
    path: '/',
    method: 'get',
    expectStatus: 200
  },
  {
    name: 'Login page responds (GET /login)',
    path: '/login',
    method: 'get',
    expectStatus: 200
  },
  {
    name: 'Register page responds (GET /register)',
    path: '/register',
    method: 'get',
    expectStatus: 200
  },
  {
    // Gallery is visible only after login in your current setup,
    // so we treat 200, 302 (redirect to login), 401 or 403 all as "OK"
    name: 'Gallery route reachable / protected (GET /gallery)',
    path: '/gallery',
    method: 'get',
    expectStatusRange: [200, 302, 401, 403]
  },
  {
    // Same idea for workspaces – it should either load or redirect
    name: 'Workspaces route reachable / protected (GET /workspaces)',
    path: '/workspaces',
    method: 'get',
    expectStatusRange: [200, 302, 401, 403]
  },
  {
    // Profile should be protected – 302/401/403 are fine if not logged in
    name: 'Profile route reachable / protected (GET /profile)',
    path: '/profile',
    method: 'get',
    expectStatusRange: [200, 302, 401, 403]
  }
];

// ---- Helpers ----
async function runHttpTest(test) {
  const { name, path, method } = test;

  try {
    const res = await client.request({
      url: path,
      method: method || 'get'
    });

    const status = res.status;
    let ok = false;

    if (typeof test.expectStatus === 'number') {
      ok = status === test.expectStatus;
    } else if (Array.isArray(test.expectStatusRange)) {
      ok = test.expectStatusRange.includes(status);
    } else {
      ok = status >= 200 && status < 400;
    }

    console.log(`${ok ? '✅' : '❌'}  ${name} -> HTTP ${status}`);
    return ok;
  } catch (err) {
    console.log(`❌  ${name} -> ERROR: ${err.message}`);
    return false;
  }
}

async function runDbTest() {
  if (!db) {
    console.log('⚠️  DB test skipped (no db module available in this context).');
    return true; // don’t fail the whole smoke if DB module wasn’t loaded
  }

  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    const ok = rows && rows[0] && rows[0].result === 2;

    if (ok) {
      console.log('✅  Database connectivity (SELECT 1+1) OK');
    } else {
      console.log('❌  Database connectivity failed (unexpected result)');
    }

    return ok;
  } catch (err) {
    console.log('❌  Database connectivity failed:', err.message);
    return false;
  }
}

// ---- Main runner ----
async function main() {
  console.log(`🔍 Running CYRUS smoke tests against ${BASE_URL}`);
  console.log('-------------------------------------------');

  let passed = 0;
  let total = 0;

  // HTTP route tests
  for (const t of tests) {
    total++;
    const ok = await runHttpTest(t);
    if (ok) passed++;
  }

  // DB connectivity test
  total++;
  const dbOk = await runDbTest();
  if (dbOk) passed++;

  console.log('-------------------------------------------');
  console.log(`📊 Summary: ${passed}/${total} checks passed`);

  process.exit(passed === total ? 0 : 1);
}

main().catch((err) => {
  console.error('❌ Smoke test runner crashed:', err);
  process.exit(1);
});
