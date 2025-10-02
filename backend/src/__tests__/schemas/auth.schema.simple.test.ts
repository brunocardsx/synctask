import { registerSchema, loginSchema } from '../../schemas/authSchema.ts';

describe('Auth Schemas - Simple Tests', () => {
  describe('registerSchema', () => {
    it('validates correct user data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.name).toBe('John Doe');
        expect(result.data.email).toBe('john@example.com');
        expect(result.data.password).toBe('password123');
      }
    });

    it('rejects invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const emailError = result.error.issues.find(issue => 
          issue.path.includes('email')
        );
        expect(emailError).toBeDefined();
      }
    });

    it('rejects short name', () => {
      const invalidData = {
        name: 'Jo',
        email: 'john@example.com',
        password: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const nameError = result.error.issues.find(issue => 
          issue.path.includes('name')
        );
        expect(nameError).toBeDefined();
      }
    });

    it('rejects short password', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: '123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const passwordError = result.error.issues.find(issue => 
          issue.path.includes('password')
        );
        expect(passwordError).toBeDefined();
      }
    });

    it('rejects missing required fields', () => {
      const invalidData = {
        name: 'John Doe',
        // missing email and password
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });
  });

  describe('loginSchema', () => {
    it('validates correct login data', () => {
      const validData = {
        email: 'john@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(result.data.email).toBe('john@example.com');
        expect(result.data.password).toBe('password123');
      }
    });

    it('rejects invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const emailError = result.error.issues.find(issue => 
          issue.path.includes('email')
        );
        expect(emailError).toBeDefined();
      }
    });

    it('rejects missing password', () => {
      const invalidData = {
        email: 'john@example.com',
        // missing password
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      
      if (!result.success) {
        const passwordError = result.error.issues.find(issue => 
          issue.path.includes('password')
        );
        expect(passwordError).toBeDefined();
      }
    });
  });
});
