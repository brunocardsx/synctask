import {
  createCardSchema,
  updateCardSchema,
} from '../../schemas/cardSchema.js';

describe('Card Schemas - Simple Tests', () => {
  describe('createCardSchema', () => {
    it('deve validar dados corretos de card', () => {
      const validData = {
        title: 'Tarefa Importante',
        description: 'Descrição da tarefa',
      };
      expect(() => createCardSchema.parse(validData)).not.toThrow();
    });

    it('deve aceitar card apenas com título', () => {
      const validData = {
        title: 'Tarefa Simples',
      };
      expect(() => createCardSchema.parse(validData)).not.toThrow();
    });

    it('deve rejeitar título ausente', () => {
      const invalidData = {
        description: 'Descrição sem título',
      };
      expect(() => createCardSchema.parse(invalidData)).toThrow();
    });

    it('deve rejeitar título vazio', () => {
      const invalidData = {
        title: '',
        description: 'Descrição',
      };
      expect(() => createCardSchema.parse(invalidData)).toThrow();
    });

    it('deve rejeitar título muito longo', () => {
      const invalidData = {
        title: 'A'.repeat(101), // 101 caracteres
        description: 'Descrição',
      };
      expect(() => createCardSchema.parse(invalidData)).toThrow();
    });

    it('deve aceitar título com exatamente 100 caracteres', () => {
      const validData = {
        title: 'A'.repeat(100),
        description: 'Descrição',
      };
      expect(() => createCardSchema.parse(validData)).not.toThrow();
    });

    it('deve rejeitar descrição muito longa', () => {
      const invalidData = {
        title: 'Título',
        description: 'A'.repeat(501), // 501 caracteres
      };
      expect(() => createCardSchema.parse(invalidData)).toThrow();
    });

    it('deve aceitar descrição com exatamente 500 caracteres', () => {
      const validData = {
        title: 'Título',
        description: 'A'.repeat(500),
      };
      expect(() => createCardSchema.parse(validData)).not.toThrow();
    });

    it('deve aceitar caracteres especiais no título', () => {
      const validData = {
        title: 'Tarefa: Implementar feature v2.0 🚀',
        description: 'Descrição com emojis 😊',
      };
      expect(() => createCardSchema.parse(validData)).not.toThrow();
    });
  });

  describe('updateCardSchema', () => {
    it('deve validar dados corretos de atualização', () => {
      const validData = {
        title: 'Tarefa Atualizada',
        description: 'Nova descrição',
      };
      expect(() => updateCardSchema.parse(validData)).not.toThrow();
    });

    it('deve aceitar atualização apenas do título', () => {
      const validData = {
        title: 'Novo Título',
      };
      expect(() => updateCardSchema.parse(validData)).not.toThrow();
    });

    it('deve aceitar atualização apenas da descrição', () => {
      const validData = {
        title: 'Título mantido',
        description: 'Nova descrição',
      };
      expect(() => updateCardSchema.parse(validData)).not.toThrow();
    });

    it('deve rejeitar título vazio na atualização', () => {
      const invalidData = {
        title: '',
      };
      expect(() => updateCardSchema.parse(invalidData)).toThrow();
    });

    it('deve rejeitar título muito longo na atualização', () => {
      const invalidData = {
        title: 'A'.repeat(101),
      };
      expect(() => updateCardSchema.parse(invalidData)).toThrow();
    });
  });
});
