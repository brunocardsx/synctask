import { registerNewUser, loginUser } from '../../api/auth/auth.service.ts';
import { prisma } from '../setup.ts';
import bcrypt from 'bcryptjs';

describe('Auth Service', () => {
  describe('registerNewUser', () => {
    it('creates user with valid data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await registerNewUser(userData);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('userId');

      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(user).toBeTruthy();
      expect(user?.name).toBe(userData.name);
      expect(user?.email).toBe(userData.email);
      expect(user?.password).not.toBe(userData.password); // Should be hashed
    });

    it('throws error when email already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      // Create first user
      await registerNewUser(userData);

      // Try to create second user with same email
      await expect(registerNewUser(userData)).rejects.toThrow('Este email já está em uso');
    });

    it('hashes password correctly', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      await registerNewUser(userData);

      const user = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      expect(user?.password).not.toBe(userData.password);
      const isPasswordValid = await bcrypt.compare(userData.password, user?.password || '');
      expect(isPasswordValid).toBe(true);
    });
  });

  describe('loginUser', () => {
    beforeEach(async () => {
      // Create a test user
      await prisma.user.create({
        data: {
          name: 'Test User',
          email: 'test@example.com',
          password: await bcrypt.hash('password123', 12),
        },
      });
    });

    it('returns token for valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const token = await loginUser(loginData);

      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('throws error for invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'password123',
      };

      await expect(loginUser(loginData)).rejects.toThrow('Credenciais inválidas');
    });

    it('throws error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(loginUser(loginData)).rejects.toThrow('Credenciais inválidas');
    });
  });
});
