import request from 'supertest';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import authRoutes from '../../api/auth/auth.route.js';
import { errorHandler } from '../../middlewares/error-handler.js';
import { prisma } from '../setup.js';

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

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/register', () => {
    it('deve registrar novo usuário e retornar token', async () => {
      const userData = {
        name: 'Test User',
        email: `register-${Date.now()}@example.com`,
        password: 'password123',
      };

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('userId');

      const userInDb = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      expect(userInDb).not.toBeNull();
      expect(userInDb?.name).toBe(userData.name);
    });

    it('deve retornar 409 se email já existe', async () => {
      const userData = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
      };

      // Criar usuário existente
      await prisma.user.create({
        data: {
          ...userData,
          password: await bcrypt.hash(userData.password, 10),
        },
      });

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.statusCode).toEqual(409);
      expect(res.body.message).toContain('Este email já está em uso');
    });

    it('deve retornar 400 para dados inválidos', async () => {
      const invalidData = {
        name: 'T', // Muito curto
        email: 'invalid-email',
        password: '123', // Muito curto
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Dados de entrada inválidos');
    });

    it('deve validar campos obrigatórios', async () => {
      const incompleteData = {
        email: 'test@example.com',
        // name e password ausentes
      };

      const res = await request(app)
        .post('/api/auth/register')
        .send(incompleteData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Dados de entrada inválidos');
    });
  });

  describe('POST /api/auth/login', () => {
    let loginEmail: string;

    beforeEach(async () => {
      // Criar usuário para testes de login
      loginEmail = `login-${Date.now()}@example.com`;
      await prisma.user.create({
        data: {
          name: 'Login User',
          email: loginEmail,
          password: await bcrypt.hash('password123', 10),
        },
      });
    });

    it('deve fazer login com usuário existente e retornar token', async () => {
      const loginData = {
        email: loginEmail,
        password: 'password123',
      };

      const res = await request(app).post('/api/auth/login').send(loginData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('accessToken');
      expect(typeof res.body.accessToken).toBe('string');
    });

    it('deve retornar 401 para credenciais inválidas (senha errada)', async () => {
      const loginData = {
        email: loginEmail,
        password: 'wrongpassword',
      };

      const res = await request(app).post('/api/auth/login').send(loginData);

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('Credenciais inválidas');
    });

    it('deve retornar 401 para credenciais inválidas (usuário não encontrado)', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      const res = await request(app).post('/api/auth/login').send(loginData);

      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toContain('Credenciais inválidas');
    });

    it('deve retornar 400 para dados inválidos', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123',
      };

      const res = await request(app).post('/api/auth/login').send(invalidData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toContain('Dados de entrada inválidos');
    });
  });
});
