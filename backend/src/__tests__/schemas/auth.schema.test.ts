import { registerSchema, loginSchema } from '../../schemas/authSchema.js';

describe('Auth Schemas', () => {
  describe('registerSchema', () => {
    it('deve validar dados corretos de usuário', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };
      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it('deve rejeitar email inválido', () => {
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('deve rejeitar nome muito curto', () => {
      const invalidData = {
        name: 'T',
        email: 'test@example.com',
        password: 'password123',
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('deve rejeitar senha muito curta', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'short',
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('deve rejeitar campos obrigatórios ausentes', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(() => registerSchema.parse(invalidData)).toThrow();
    });

    it('deve aceitar nomes com caracteres especiais', () => {
      const validData = {
        name: 'João da Silva-Santos',
        email: 'joao@example.com',
        password: 'password123',
      };
      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it('deve aceitar emails com subdomínios', () => {
      const validData = {
        name: 'Test User',
        email: 'test@subdomain.example.com',
        password: 'password123',
      };
      expect(() => registerSchema.parse(validData)).not.toThrow();
    });
  });

  describe('loginSchema', () => {
    it('deve validar dados corretos de login', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it('deve rejeitar formato de email inválido', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('deve rejeitar senha ausente', () => {
      const invalidData = {
        email: 'test@example.com',
      };
      expect(() => loginSchema.parse(invalidData)).toThrow();
    });

    it('deve aceitar senhas com caracteres especiais', () => {
      const validData = {
        email: 'test@example.com',
        password: 'P@ssw0rd!@#',
      };
      expect(() => loginSchema.parse(validData)).not.toThrow();
    });
  });
});
