/**
 * Basic API Verification Script for Ayush Creation Backend
 * Run with: node test/verifyApi.js (while server is running on port 5000)
 */
const http = require('http');

const BASE_URL = 'http://localhost:5000/api/v1';

async function request(method, path, body = null, token = null) {
  const url = new URL(BASE_URL + path);
  const options = {
    method,
    hostname: url.hostname,
    port: url.port,
    path: url.pathname + url.search,
    headers: { 'Content-Type': 'application/json' },
  };
  if (token) options.headers['Authorization'] = `Bearer ${token}`;

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running Ayush Creation API Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  const assert = (name, condition, detail = '') => {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name} ${detail}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    const health = await request('GET', '/health');
    assert('GET /health returns 200', health.status === 200 && health.body.success === true);

    // 2. Protected Admin Route without Auth
    const dashNoAuth = await request('GET', '/admin/dashboard');
    assert('GET /admin/dashboard without token returns 401', dashNoAuth.status === 401);

    // 3. Protected Enquiries Admin Route without Auth
    const adminEnqNoAuth = await request('GET', '/admin/enquiries');
    assert('GET /admin/enquiries without token returns 401', adminEnqNoAuth.status === 401);

    // 4. Invalid Login
    const badLogin = await request('POST', '/auth/login', {
      email: 'nonexistent@example.com',
      password: 'WrongPassword123',
    });
    assert('POST /auth/login with invalid creds returns 401 or 500 (if DB offline)', [401, 500].includes(badLogin.status));

    // 5. Validation Error on Empty Enquiry
    const badEnquiry = await request('POST', '/enquiries', { name: '' });
    assert('POST /enquiries with invalid payload returns 400', badEnquiry.status === 400);

    // 6. 404 Handler
    const notFound = await request('GET', '/nonexistent-route-12345');
    assert('GET /nonexistent-route returns 404', notFound.status === 404);

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed.`);
    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Error connecting to server:', err.message);
    process.exit(1);
  }
}

runTests();
