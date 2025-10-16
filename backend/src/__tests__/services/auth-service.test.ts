import bcrypt from 'bcryptjs';
import { registerNewUser, loginUser } from '../../api/auth/auth.service';
import { prismaMock } from '../setup';
import { mockUser, mockRegisterData, mockLoginData } from '../mocks/test-data';

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock JWT utils
jest.mock('../../utils/jwt', () => ({
  generateTokenPair: jest.fn(() => ({
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresIn: '15m',
  })),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerNewUser', () => {
    it('registers new user successfully', async () => {
      // Mock: usuário não existe
      prismaMock.user.findUnique.mockResolvedValue(null);

      // Mock: hash da senha
      mockedBcrypt.hash.mockResolvedValue('hashed-password');

      // Mock: criação do usuário
      prismaMock.user.create.mockResolvedValue({
        ...mockUser,
        password: 'hashed-password',
        tokenVersion: 0,
      });

      const result = await registerNewUser(mockRegisterData);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockRegisterData.email },
      });

      expect(mockedBcrypt.hash).toHaveBeenCalledWith(
        mockRegisterData.password,
        10 // bcryptRounds from security config
      );

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          name: mockRegisterData.name,
          email: mockRegisterData.email,
          password: 'hashed-password',
          tokenVersion: 0,
        },
      });

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: mockUser.id,
        expiresIn: '15m',
      });
    });

    it('throws error when email already exists', async () => {
      // Mock: usuário já existe
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      await expect(registerNewUser(mockRegisterData)).rejects.toMatchObject({
        message: 'Este email já está em uso.',
        statusCode: 409,
      });

      expect(prismaMock.user.create).not.toHaveBeenCalled();
    });

    it('handles database errors during user creation', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed-password');
      prismaMock.user.create.mockRejectedValue(new Error('Database error'));

      await expect(registerNewUser(mockRegisterData)).rejects.toThrow(
        'Database error'
      );
    });

    it('handles bcrypt errors', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockRejectedValue(new Error('Bcrypt error'));

      await expect(registerNewUser(mockRegisterData)).rejects.toThrow(
        'Bcrypt error'
      );
    });
  });

  describe('loginUser', () => {
    it('logs in user successfully with correct credentials', async () => {
      // Mock: usuário encontrado
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      // Mock: senha válida
      mockedBcrypt.compare.mockResolvedValue(true);

      const result = await loginUser(mockLoginData);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: mockLoginData.email },
      });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockLoginData.password,
        mockUser.password
      );

      expect(result).toEqual({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        userId: mockUser.id,
        expiresIn: '15m',
      });
    });

    it('throws error when user not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(loginUser(mockLoginData)).rejects.toMatchObject({
        message: 'Credenciais inválidas.',
        statusCode: 401,
      });

      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('throws error when password is incorrect', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false);

      await expect(loginUser(mockLoginData)).rejects.toMatchObject({
        message: 'Credenciais inválidas.',
        statusCode: 401,
      });

      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        mockLoginData.password,
        mockUser.password
      );
    });

    it('handles database errors during login', async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error('Database error'));

      await expect(loginUser(mockLoginData)).rejects.toThrow('Database error');
    });

    it('handles bcrypt errors during password comparison', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockRejectedValue(new Error('Bcrypt error'));

      await expect(loginUser(mockLoginData)).rejects.toThrow('Bcrypt error');
    });
  });

  describe('Edge cases', () => {
    it('handles empty email in registration', async () => {
      const invalidData = { ...mockRegisterData, email: '' };

      // O schema validation deveria capturar isso antes de chegar ao service
      // Mas testamos se o service lida bem com dados inválidos
      await expect(registerNewUser(invalidData as any)).rejects.toThrow();
    });

    it('handles empty password in login', async () => {
      const invalidData = { ...mockLoginData, password: '' };

      await expect(loginUser(invalidData as any)).rejects.toThrow();
    });

    it('handles special characters in email', async () => {
      const specialEmailData = {
        ...mockRegisterData,
        email: 'test+tag@example.com',
      };

      prismaMock.user.findUnique.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed-password');
      prismaMock.user.create.mockResolvedValue(mockUser);

      const result = await registerNewUser(specialEmailData);

      expect(result).toBeDefined();
      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: specialEmailData.email },
      });
    });
  });
});
