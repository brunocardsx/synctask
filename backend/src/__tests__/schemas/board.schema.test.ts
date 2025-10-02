import {
  createBoardSchema,
  updateBoardSchema,
} from '../../schemas/boardSchema.js';

describe('Board Schemas', () => {
  describe('createBoardSchema', () => {
    it('deve validar dados corretos de board', () => {
      const validData = {
        name: 'Meu Board de Teste',
      };
      expect(() => createBoardSchema.parse(validData)).not.toThrow();
    });

    it('deve rejeitar nome muito curto', () => {
      const invalidData = {
        name: 'AB',
      };
      expect(() => createBoardSchema.parse(invalidData)).toThrow();
    });

    it('deve rejeitar nome ausente', () => {
      const invalidData = {};
      expect(() => createBoardSchema.parse(invalidData)).toThrow();
    });

    it('deve rejeitar nome não string', () => {
      const invalidData = {
        name: 123,
      };
      expect(() => createBoardSchema.parse(invalidData)).toThrow();
    });

    it('deve aceitar nomes com caracteres especiais', () => {
      const validData = {
        name: 'Board: Projeto Alpha v2.0',
      };
      expect(() => createBoardSchema.parse(validData)).not.toThrow();
    });

    it('deve aceitar nome com exatamente 3 caracteres', () => {
      const validData = {
        name: 'ABC',
      };
      expect(() => createBoardSchema.parse(validData)).not.toThrow();
    });
  });

  describe('updateBoardSchema', () => {
    it('deve validar dados corretos de atualização', () => {
      const validData = {
        name: 'Board Atualizado',
      };
      expect(() => updateBoardSchema.parse(validData)).not.toThrow();
    });

    it('deve rejeitar nome muito curto na atualização', () => {
      const invalidData = {
        name: 'XY',
      };
      expect(() => updateBoardSchema.parse(invalidData)).toThrow();
    });

    it('deve rejeitar nome ausente na atualização', () => {
      const invalidData = {};
      expect(() => updateBoardSchema.parse(invalidData)).toThrow();
    });
  });
});
