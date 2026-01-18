
async function testApi() {
  const API_URL = 'http://localhost:3001';
  console.log('Testing Dashboard API...');

  try {
    // 1. Login
    console.log('Logging in as admin@example.com...');
    const loginRes = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'password' })
    });
    
    if (!loginRes.ok) {
        throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.data.token;
    console.log('Login successful. Token obtained.');

    // 2. Get Stats
    console.log('Fetching /api/v1/dashboard/stats...');
    const statsRes = await fetch(`${API_URL}/api/v1/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!statsRes.ok) {
         throw new Error(`Stats failed: ${statsRes.status} ${await statsRes.text()}`);
    }

    const statsData = await statsRes.json();
    console.log('--- STATS RESPONSE ---');
    console.log(JSON.stringify(statsData, null, 2));

  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

testApi();
