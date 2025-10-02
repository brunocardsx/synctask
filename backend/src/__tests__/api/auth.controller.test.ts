import request from 'supertest';
import express from 'express';
import cors from 'cors';
import authRoutes from '../../api/auth/auth.route.ts';
import { errorHandler } from '../../middlewares/error-handler.ts';
import { prisma } from '../setup.ts';

const createTestApp = () => {
  const app = express();
  
  app.use(express.json());
  app.use(cors());
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);
  
  return app;
};

describe('Auth Controller', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/register', () => {
    it('registers user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('userId');

      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(user).toBeTruthy();
      expect(user?.name).toBe(userData.name);
    });

    it('returns validation error for invalid data', async () => {
      const invalidData = {
        name: 'Jo', // too short
        email: 'invalid-email',
        password: '123', // too short
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });

    it('returns error for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.message).toBe('Este email já está em uso');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J.8x5QK9m', // bcrypt hash of 'password123'
        },
      });
    });

    it('logs in successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(typeof response.body.token).toBe('string');
    });

    it('returns error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Credenciais inválidas');
    });

    it('returns error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Credenciais inválidas');
    });

    it('returns validation error for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '', // empty password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
    });
  });
});
