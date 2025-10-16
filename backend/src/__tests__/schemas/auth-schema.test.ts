import { z } from 'zod';
import { registerSchema, loginSchema } from '../../schemas/authSchema';

describe('Auth Schema Validation', () => {
  describe('registerSchema', () => {
    const validRegisterData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('validates correct registration data', () => {
      expect(() => registerSchema.parse(validRegisterData)).not.toThrow();
    });

    it('validates minimum name length', () => {
      const validData = { ...validRegisterData, name: 'Jon' };
      expect(() => registerSchema.parse(validData)).not.toThrow();

      const invalidData = { ...validRegisterData, name: 'J' };
      expect(() => registerSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('validates email format', () => {
      const validData = { ...validRegisterData, email: 'user@domain.com' };
      expect(() => registerSchema.parse(validData)).not.toThrow();

      const invalidData = { ...validRegisterData, email: 'invalid-email' };
      expect(() => registerSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('validates password minimum length', () => {
      const validData = { ...validRegisterData, password: '123456' };
      expect(() => registerSchema.parse(validData)).not.toThrow();

      const invalidData = { ...validRegisterData, password: '12345' };
      expect(() => registerSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('rejects missing required fields', () => {
      const missingName = {
        email: validRegisterData.email,
        password: validRegisterData.password,
      };
      expect(() => registerSchema.parse(missingName)).toThrow(z.ZodError);

      const missingEmail = {
        name: validRegisterData.name,
        password: validRegisterData.password,
      };
      expect(() => registerSchema.parse(missingEmail)).toThrow(z.ZodError);

      const missingPassword = {
        name: validRegisterData.name,
        email: validRegisterData.email,
      };
      expect(() => registerSchema.parse(missingPassword)).toThrow(z.ZodError);
    });

    it('rejects wrong data types', () => {
      const wrongTypes = {
        name: 123,
        email: 'john@example.com',
        password: 'password123',
      };
      expect(() => registerSchema.parse(wrongTypes)).toThrow(z.ZodError);
    });

    it('provides specific error messages', () => {
      try {
        registerSchema.parse({});
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.issues.map(issue => issue.message);
          expect(errorMessages).toContain('O nome é obrigatório.');
          expect(errorMessages).toContain('O email é obrigatório.');
          expect(errorMessages).toContain('A senha é obrigatória.');
        }
      }
    });
  });

  describe('loginSchema', () => {
    const validLoginData = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('validates correct login data', () => {
      expect(() => loginSchema.parse(validLoginData)).not.toThrow();
    });

    it('validates email format', () => {
      const validData = { ...validLoginData, email: 'user@domain.com' };
      expect(() => loginSchema.parse(validData)).not.toThrow();

      const invalidData = { ...validLoginData, email: 'invalid-email' };
      expect(() => loginSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('validates password minimum length', () => {
      const validData = { ...validLoginData, password: '123456' };
      expect(() => loginSchema.parse(validData)).not.toThrow();

      const invalidData = { ...validLoginData, password: '12345' };
      expect(() => loginSchema.parse(invalidData)).toThrow(z.ZodError);
    });

    it('rejects missing required fields', () => {
      const missingEmail = { password: validLoginData.password };
      expect(() => loginSchema.parse(missingEmail)).toThrow(z.ZodError);

      const missingPassword = { email: validLoginData.email };
      expect(() => loginSchema.parse(missingPassword)).toThrow(z.ZodError);
    });

    it('rejects wrong data types', () => {
      const wrongTypes = {
        email: 123,
        password: 'password123',
      };
      expect(() => loginSchema.parse(wrongTypes)).toThrow(z.ZodError);
    });

    it('provides specific error messages', () => {
      try {
        loginSchema.parse({});
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errorMessages = error.issues.map(issue => issue.message);
          expect(errorMessages).toContain('O email é obrigatório.');
          expect(errorMessages).toContain('A senha é obrigatória.');
        }
      }
    });
  });

  describe('Edge cases', () => {
    it('handles empty strings', () => {
      expect(() =>
        registerSchema.parse({ name: '', email: '', password: '' })
      ).toThrow(z.ZodError);
      expect(() => loginSchema.parse({ email: '', password: '' })).toThrow(
        z.ZodError
      );
    });

    it('handles null and undefined values', () => {
      expect(() =>
        registerSchema.parse({ name: null, email: null, password: null })
      ).toThrow(z.ZodError);
      expect(() =>
        loginSchema.parse({ email: undefined, password: undefined })
      ).toThrow(z.ZodError);
    });

    it('handles extra fields gracefully', () => {
      const dataWithExtra = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        extraField: 'should be ignored',
      };
      expect(() => registerSchema.parse(dataWithExtra)).not.toThrow();
    });
  });
});
