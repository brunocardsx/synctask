import { test, expect } from '@playwright/test';

test.describe('API Health Check', () => {
  test('should return health status', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
  });
});

test.describe('Authentication Flow', () => {
  test('should register a new user', async ({ request }) => {
    const userData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User'
    };

    const response = await request.post('/api/auth/register', {
      data: userData
    });

    expect(response.status()).toBe(201);
    
    const data = await response.json();
    expect(data).toHaveProperty('user');
    expect(data.user.email).toBe(userData.email);
  });

  test('should login with valid credentials', async ({ request }) => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const response = await request.post('/api/auth/login', {
      data: loginData
    });

    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('token');
    expect(data).toHaveProperty('user');
  });
});
