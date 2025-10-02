import { 
  addMemberSchema, 
  updateMemberRoleSchema, 
  memberParamsSchema, 
  boardMembersParamsSchema 
} from '../../schemas/memberSchema.js';

describe('Member Schemas', () => {
  describe('addMemberSchema', () => {
    describe('validates correct member data', () => {
      it('accepts valid email and MEMBER role', () => {
        const validData = {
          email: 'usuario@exemplo.com',
          role: 'MEMBER' as const,
        };
        
        expect(() => addMemberSchema.parse(validData)).not.toThrow();
      });

      it('accepts valid email and ADMIN role', () => {
        const validData = {
          email: 'admin@exemplo.com',
          role: 'ADMIN' as const,
        };
        
        expect(() => addMemberSchema.parse(validData)).not.toThrow();
      });

      it('accepts emails with subdomains', () => {
        const validData = {
          email: 'usuario@subdominio.exemplo.com',
          role: 'MEMBER' as const,
        };
        
        expect(() => addMemberSchema.parse(validData)).not.toThrow();
      });

      it('defaults to MEMBER role when not specified', () => {
        const data = {
          email: 'usuario@exemplo.com',
        };
        
        const result = addMemberSchema.parse(data);
        expect(result.role).toBe('MEMBER');
      });
    });

    describe('rejects invalid data', () => {
      it('rejects invalid email format', () => {
        const invalidData = {
          email: 'email-invalido',
          role: 'MEMBER' as const,
        };
        
        expect(() => addMemberSchema.parse(invalidData)).toThrow();
      });

      it('rejects invalid role', () => {
        const invalidData = {
          email: 'usuario@exemplo.com',
          role: 'INVALID_ROLE',
        };
        
        expect(() => addMemberSchema.parse(invalidData)).toThrow();
      });

      it('rejects missing email', () => {
        const invalidData = {
          role: 'MEMBER' as const,
        };
        
        expect(() => addMemberSchema.parse(invalidData)).toThrow();
      });
    });
  });

  describe('updateMemberRoleSchema', () => {
    describe('validates correct role updates', () => {
      it('accepts ADMIN role update', () => {
        const validData = {
          role: 'ADMIN' as const,
        };
        
        expect(() => updateMemberRoleSchema.parse(validData)).not.toThrow();
      });

      it('accepts MEMBER role update', () => {
        const validData = {
          role: 'MEMBER' as const,
        };
        
        expect(() => updateMemberRoleSchema.parse(validData)).not.toThrow();
      });
    });

    describe('rejects invalid role updates', () => {
      it('rejects missing role', () => {
        const invalidData = {};
        
        expect(() => updateMemberRoleSchema.parse(invalidData)).toThrow();
      });

      it('rejects invalid role value', () => {
        const invalidData = {
          role: 'INVALID_ROLE',
        };
        
        expect(() => updateMemberRoleSchema.parse(invalidData)).toThrow();
      });
    });
  });

  describe('memberParamsSchema', () => {
    describe('validates correct UUID parameters', () => {
      it('accepts valid boardId and userId', () => {
        const validData = {
          boardId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '123e4567-e89b-12d3-a456-426614174001',
        };
        
        expect(() => memberParamsSchema.parse(validData)).not.toThrow();
      });
    });

    describe('rejects invalid parameters', () => {
      it('rejects invalid boardId', () => {
        const invalidData = {
          boardId: 'id-invalido',
          userId: '123e4567-e89b-12d3-a456-426614174001',
        };
        
        expect(() => memberParamsSchema.parse(invalidData)).toThrow();
      });

      it('rejects invalid userId', () => {
        const invalidData = {
          boardId: '123e4567-e89b-12d3-a456-426614174000',
          userId: 'id-invalido',
        };
        
        expect(() => memberParamsSchema.parse(invalidData)).toThrow();
      });

      it('rejects missing parameters', () => {
        const invalidData = {
          boardId: '123e4567-e89b-12d3-a456-426614174000',
        };
        
        expect(() => memberParamsSchema.parse(invalidData)).toThrow();
      });
    });
  });

  describe('boardMembersParamsSchema', () => {
    describe('validates correct board parameters', () => {
      it('accepts valid boardId', () => {
        const validData = {
          boardId: '123e4567-e89b-12d3-a456-426614174000',
        };
        
        expect(() => boardMembersParamsSchema.parse(validData)).not.toThrow();
      });
    });

    describe('rejects invalid board parameters', () => {
      it('rejects invalid boardId format', () => {
        const invalidData = {
          boardId: 'id-invalido',
        };
        
        expect(() => boardMembersParamsSchema.parse(invalidData)).toThrow();
      });

      it('rejects missing boardId', () => {
        const invalidData = {};
        
        expect(() => boardMembersParamsSchema.parse(invalidData)).toThrow();
      });
    });
  });
});
