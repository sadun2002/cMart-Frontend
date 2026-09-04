const jwt = require('jsonwebtoken');
const axios = require('axios');

async function test() {
  const token = jwt.sign(
    { sub: 1, email: 'test@cmart.lk', type: 'USER', role: 'OWNER', tenantId: 1 },
    'cMart-super-secret-key-12345',
    { expiresIn: '15m' }
  );

  try {
    const res = await axios.get('http://localhost:3001/api/v1/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Success! Data length:", res.data.length);
  } catch (error) {
    if (error.response) {
      console.error(`Error ${error.response.status}:`, error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

test();
