import { registerNewUser, loginUser } from '../../api/auth/auth.service.js';
import { prisma } from '../setup.js';
import bcrypt from 'bcryptjs';

describe('Auth Service', () => {
  describe('registerNewUser', () => {
    it('deve criar usuário com dados válidos', async () => {
      const userData = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'password123',
      };

      const result = await registerNewUser(userData);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('userId');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.userId).toBe('string');

      // Verificar se o usuário foi criado no banco
      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(user).not.toBeNull();
      expect(user?.name).toBe(userData.name);
      expect(user?.email).toBe(userData.email);
      expect(user?.password).not.toBe(userData.password); // Deve estar hasheado
    });

    it('deve rejeitar email já existente', async () => {
      const userData = {
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      };

      // Criar primeiro usuário
      await prisma.user.create({
        data: {
          ...userData,
          password: await bcrypt.hash(userData.password, 10),
        },
      });

      // Tentar criar segundo usuário com mesmo email
      await expect(registerNewUser(userData)).rejects.toThrow(
        'Este email já está em uso'
      );
    });

    it('deve hash da senha corretamente', async () => {
      const userData = {
        name: 'Test User',
        email: `hashtest-${Date.now()}@example.com`,
        password: 'password123',
      };

      await registerNewUser(userData);

      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(user?.password).not.toBe(userData.password);
      const isPasswordValid = await bcrypt.compare(
        userData.password,
        user?.password || ''
      );
      expect(isPasswordValid).toBe(true);
    });
  });

  describe('loginUser', () => {
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

    it('deve fazer login com credenciais válidas', async () => {
      const loginData = {
        email: loginEmail,
        password: 'password123',
      };

      const result = await loginUser(loginData);

      expect(result).toHaveProperty('accessToken');
      expect(typeof result.accessToken).toBe('string');
      expect(result.accessToken.length).toBeGreaterThan(0);
    });

    it('deve rejeitar senha incorreta', async () => {
      const loginData = {
        email: loginEmail,
        password: 'wrongpassword',
      };

      await expect(loginUser(loginData)).rejects.toThrow(
        'Credenciais inválidas'
      );
    });

    it('deve rejeitar usuário inexistente', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      await expect(loginUser(loginData)).rejects.toThrow(
        'Credenciais inválidas'
      );
    });
  });
});
