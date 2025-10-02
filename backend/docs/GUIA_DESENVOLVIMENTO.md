# 🚀 Guia de Desenvolvimento - SyncTask

## 📋 **Visão Geral**

Este guia estabelece padrões, práticas e processos para desenvolvimento eficiente e consistente no projeto SyncTask.

## 🎯 **Estrutura de Desenvolvimento**

### **1. Fluxo de Desenvolvimento**
```
1. 📝 Planejamento → 2. 🧪 Testes → 3. 💻 Implementação → 4. ✅ Validação → 5. 🚀 Deploy
```

### **2. Tipos de Testes Obrigatórios**
- **Unit Tests**: Validação de schemas e lógica isolada
- **Integration Tests**: APIs e interação com banco de dados
- **E2E Tests**: Fluxos completos do usuário

## 🧪 **Estratégia de Testes**

### **Testes Unitários (SEMPRE)**
```bash
# Execução rápida (sem Docker)
npm run test:unit
```

**O que testar:**
- ✅ Validação de schemas Zod
- ✅ Lógica de negócio isolada
- ✅ Utilitários e helpers
- ✅ Transformações de dados

**Padrão de arquivo:**
```
src/__tests__/schemas/[feature].schema.test.ts
src/__tests__/utils/[utility].test.ts
```

### **Testes de Integração (QUANDO NECESSÁRIO)**
```bash
# Execução com Docker
npm run test:integration
```

**O que testar:**
- ✅ APIs REST completas
- ✅ Interação com banco de dados
- ✅ Autenticação e autorização
- ✅ Middlewares

**Padrão de arquivo:**
```
src/__tests__/api/[feature].controller.test.ts
src/__tests__/[feature]/[feature].service.test.ts
```

### **Testes E2E (PARA FLUXOS CRÍTICOS)**
```bash
# Execução com Playwright
npm run test:e2e
```

**O que testar:**
- ✅ Fluxos completos de usuário
- ✅ Integração frontend-backend
- ✅ Cenários de erro críticos

## 🏗️ **Implementação de Features**

### **1. Planejamento da Feature**

#### **Checklist Obrigatório:**
- [ ] **Análise de Requisitos**: Entender completamente o que será implementado
- [ ] **Design da API**: Definir endpoints, schemas e validações
- [ ] **Modelagem de Dados**: Atualizar schema Prisma se necessário
- [ ] **Plano de Testes**: Definir quais testes serão necessários
- [ ] **Documentação**: Atualizar documentação da API

#### **Template de Planejamento:**
```markdown
## Feature: [Nome da Feature]

### Requisitos:
- [ ] Requisito 1
- [ ] Requisito 2

### API Design:
- `POST /api/[resource]` - Criar
- `GET /api/[resource]` - Listar
- `GET /api/[resource]/:id` - Buscar
- `PUT /api/[resource]/:id` - Atualizar
- `DELETE /api/[resource]/:id` - Deletar

### Schema Prisma:
```prisma
model [Resource] {
  id        String   @id @default(uuid())
  // campos...
}
```

### Testes Necessários:
- [ ] Schema validation
- [ ] API endpoints
- [ ] Business logic
- [ ] Error handling
```

### **2. Implementação Passo a Passo**

#### **Passo 1: Schema e Validação**
```bash
# 1. Criar schema Zod
touch src/schemas/[feature]Schema.ts

# 2. Criar testes de schema
touch src/__tests__/schemas/[feature].schema.test.ts

# 3. Executar testes
npm run test:unit
```

#### **Passo 2: Modelo de Dados**
```bash
# 1. Atualizar schema Prisma
# Editar: prisma/schema.prisma

# 2. Aplicar migração
npm run db:migrate

# 3. Regenerar cliente
npm run db:generate
```

#### **Passo 3: Lógica de Negócio**
```bash
# 1. Criar service
touch src/api/[feature]/[feature].service.ts

# 2. Criar testes de service
touch src/__tests__/[feature]/[feature].service.test.ts

# 3. Executar testes
npm run test:integration
```

#### **Passo 4: API Controller**
```bash
# 1. Criar controller
touch src/api/[feature]/[feature].controller.ts

# 2. Criar routes
touch src/api/[feature]/[feature].route.ts

# 3. Criar testes de API
touch src/__tests__/api/[feature].controller.test.ts

# 4. Executar testes
npm run test:integration
```

#### **Passo 5: Integração**
```bash
# 1. Registrar rotas no app principal
# Editar: src/app.ts

# 2. Testes E2E (se necessário)
touch tests/e2e/[feature].spec.ts

# 3. Executar todos os testes
npm run test
```

## 📁 **Estrutura de Arquivos Padrão**

### **Para uma Feature Completa:**
```
src/
├── api/
│   └── [feature]/
│       ├── [feature].controller.ts    # Lógica de controle
│       ├── [feature].service.ts       # Lógica de negócio
│       ├── [feature].route.ts         # Definição de rotas
│       └── index.ts                   # Exportações
├── schemas/
│   └── [feature]Schema.ts            # Validações Zod
└── __tests__/
    ├── schemas/
    │   └── [feature].schema.test.ts  # Testes de schema
    ├── api/
    │   └── [feature].controller.test.ts # Testes de API
    └── [feature]/
        └── [feature].service.test.ts # Testes de service
```

## 🔧 **Ferramentas de Desenvolvimento**

### **Comandos Essenciais:**
```bash
# Desenvolvimento
npm run dev                    # Servidor de desenvolvimento
npm run docker:dev            # Docker para desenvolvimento
npm run db:studio             # Interface visual do banco

# Testes
npm run test:unit             # Testes rápidos (sem Docker)
npm run test:integration      # Testes com banco
npm run test:e2e             # Testes end-to-end
npm run test:watch           # Testes em modo watch

# Qualidade de Código
npm run lint                  # Verificar código
npm run lint:fix             # Corrigir problemas
npm run format               # Formatar código
npm run format:check         # Verificar formatação

# Banco de Dados
npm run db:setup             # Configurar banco
npm run db:reset             # Resetar banco
npm run db:migrate           # Aplicar migrações
npm run db:seed              # Popular banco
```

### **Scripts de Produtividade:**
```bash
# Verificar ambiente
npm run test:check-env       # Verificar se Docker está rodando

# Build e Deploy
npm run build                # Build do projeto
npm run start                # Iniciar produção
```

## 📊 **Padrões de Código**

### **1. Schemas Zod**
```typescript
// src/schemas/[feature]Schema.ts
import { z } from 'zod';

export const createFeatureSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Formato de email inválido'),
});

export const updateFeatureSchema = createFeatureSchema.partial();

export type CreateFeatureData = z.infer<typeof createFeatureSchema>;
export type UpdateFeatureData = z.infer<typeof updateFeatureSchema>;
```

### **2. Services**
```typescript
// src/api/[feature]/[feature].service.ts
import { createFeatureSchema, CreateFeatureData } from '../../schemas/[feature]Schema.js';
import { createError } from '../../middlewares/error-handler.js';
import prisma from '../../config/prisma.js';

export const createFeature = async (data: CreateFeatureData) => {
  // Validação
  const validatedData = createFeatureSchema.parse(data);
  
  // Lógica de negócio
  const feature = await prisma.feature.create({
    data: validatedData,
  });
  
  return feature;
};
```

### **3. Controllers**
```typescript
// src/api/[feature]/[feature].controller.ts
import { Request, Response } from 'express';
import { createFeatureSchema } from '../../schemas/[feature]Schema.js';
import { createFeature } from './[feature].service.js';
import { createError } from '../../middlewares/error-handler.js';

export const createFeatureController = async (req: Request, res: Response) => {
  try {
    const validatedData = createFeatureSchema.parse(req.body);
    const feature = await createFeature(validatedData);
    
    res.status(201).json(feature);
  } catch (error) {
    next(error);
  }
};
```

### **4. Testes de Schema**
```typescript
// src/__tests__/schemas/[feature].schema.test.ts
import { createFeatureSchema } from '../../schemas/[feature]Schema.js';

describe('[Feature] Schemas', () => {
  describe('createFeatureSchema', () => {
    it('deve validar dados corretos', () => {
      const validData = {
        name: 'Test Feature',
        email: 'test@example.com',
      };
      
      expect(() => createFeatureSchema.parse(validData)).not.toThrow();
    });
    
    it('deve rejeitar dados inválidos', () => {
      const invalidData = {
        name: 'ab', // muito curto
        email: 'invalid-email',
      };
      
      expect(() => createFeatureSchema.parse(invalidData)).toThrow();
    });
  });
});
```

### **5. Testes de API**
```typescript
// src/__tests__/api/[feature].controller.test.ts
import request from 'supertest';
import express from 'express';
import { createFeatureController } from '../../api/[feature]/[feature].controller.js';
import { prisma } from '../setup.js';

describe('[Feature] Controller', () => {
  let app: express.Application;
  
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post('/api/[feature]', createFeatureController);
  });
  
  it('deve criar feature com dados válidos', async () => {
    const featureData = {
      name: 'Test Feature',
      email: 'test@example.com',
    };
    
    const res = await request(app)
      .post('/api/[feature]')
      .send(featureData);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(featureData.name);
  });
});
```

## 🚀 **Boas Práticas**

### **1. Desenvolvimento**
- ✅ **Sempre escreva testes primeiro** (TDD quando possível)
- ✅ **Use TypeScript strict mode**
- ✅ **Valide dados com Zod**
- ✅ **Trate erros adequadamente**
- ✅ **Use nomes descritivos**
- ✅ **Documente APIs complexas**

### **2. Testes**
- ✅ **Testes unitários para schemas** (sempre)
- ✅ **Testes de integração para APIs** (quando necessário)
- ✅ **Testes E2E para fluxos críticos** (seletivamente)
- ✅ **Use dados únicos** (timestamps, UUIDs)
- ✅ **Limpe dados entre testes**

### **3. Performance**
- ✅ **Use índices no banco de dados**
- ✅ **Implemente paginação**
- ✅ **Cache quando apropriado**
- ✅ **Otimize queries do Prisma**

### **4. Segurança**
- ✅ **Valide todos os inputs**
- ✅ **Use HTTPS em produção**
- ✅ **Implemente rate limiting**
- ✅ **Sanitize dados sensíveis**

## 📈 **Métricas de Qualidade**

### **Cobertura de Testes:**
- **Schemas**: 100% (obrigatório)
- **Services**: 90%+ (recomendado)
- **Controllers**: 80%+ (recomendado)
- **E2E**: Fluxos críticos (seletivo)

### **Performance:**
- **Testes unitários**: < 1s
- **Testes de integração**: < 10s
- **Testes E2E**: < 30s

## 🔄 **Processo de Code Review**

### **Checklist de Review:**
- [ ] **Testes**: Todos os testes passando?
- [ ] **Cobertura**: Cobertura adequada?
- [ ] **Performance**: Sem regressões?
- [ ] **Segurança**: Validações adequadas?
- [ ] **Documentação**: APIs documentadas?
- [ ] **Padrões**: Seguindo convenções?

## 🎯 **Templates e Snippets**

### **VS Code Snippets** (recomendado):
```json
{
  "Feature Schema": {
    "prefix": "feature-schema",
    "body": [
      "import { z } from 'zod';",
      "",
      "export const create${1:Feature}Schema = z.object({",
      "  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),",
      "});",
      "",
      "export const update${1:Feature}Schema = create${1:Feature}Schema.partial();",
      "",
      "export type Create${1:Feature}Data = z.infer<typeof create${1:Feature}Schema>;",
      "export type Update${1:Feature}Data = z.infer<typeof update${1:Feature}Schema>;"
    ]
  }
}
```

## 📚 **Recursos Adicionais**

### **Documentação:**
- [Prisma Docs](https://www.prisma.io/docs/)
- [Zod Docs](https://zod.dev/)
- [Jest Docs](https://jestjs.io/docs/)
- [Playwright Docs](https://playwright.dev/)

### **Ferramentas:**
- **Prisma Studio**: Interface visual do banco
- **Jest**: Framework de testes
- **Playwright**: Testes E2E
- **ESLint**: Linting
- **Prettier**: Formatação

---

**🎯 Objetivo**: Desenvolvimento rápido, confiável e escalável
**⚡ Foco**: Testes primeiro, qualidade sempre
**🚀 Resultado**: Features robustas e bem testadas
