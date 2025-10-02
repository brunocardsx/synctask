# 🧪 Guia de Testes - SyncTask

## 📋 Tipos de Testes Disponíveis

### ✅ **Testes Unitários (Schemas) - SEM BANCO DE DADOS**
```bash
npm run test:unit
```
- **68 testes passando** ✅
- Testa apenas validação de schemas Zod
- **Não precisa de Docker ou banco de dados**
- Execução rápida (~5 segundos)

### 🔄 **Testes de Integração - COM BANCO DE DADOS**
```bash
npm run test:integration
```
- Testa controllers e serviços
- **Precisa do Docker rodando**
- Executa operações reais no banco

### 🎭 **Testes E2E - COM BANCO DE DADOS**
```bash
npm run test:e2e
```
- Testa fluxos completos da aplicação
- **Precisa do Docker rodando**
- Usa Playwright com múltiplos navegadores

## 🚀 Como Executar os Testes

### **Opção 1: Testes Rápidos (Recomendado para desenvolvimento)**
```bash
# Apenas validação de schemas - funciona sempre
npm run test:unit
```

### **Opção 2: Ambiente Completo**
```bash
# 1. Verificar se Docker está rodando
npm run test:check-env

# 2. Se Docker estiver rodando, executar todos os testes
npm run test

# 3. Se Docker não estiver rodando, apenas testes unitários
npm run test:unit
```

### **Opção 3: Testes Específicos**
```bash
# Apenas schemas
npm run test:unit

# Apenas integração (precisa Docker)
npm run test:integration

# Apenas E2E (precisa Docker)
npm run test:e2e

# Com watch mode
npm run test:watch

# Com coverage
npm run test:coverage
```

## 🔧 Solução de Problemas

### **Erro: "Can't reach database server"**
```bash
# Solução 1: Executar apenas testes unitários
npm run test:unit

# Solução 2: Iniciar Docker
npm run docker:dev
npm run test

# Solução 3: Verificar ambiente
npm run test:check-env
```

### **Docker não está rodando**
1. Abrir Docker Desktop
2. Aguardar inicialização completa
3. Executar: `npm run docker:dev`
4. Executar: `npm run test`

### **Testes lentos**
- Use `npm run test:unit` para desenvolvimento rápido
- Use `npm run test:watch` para watch mode
- Use `npm run test:integration` apenas quando necessário

## 📊 Status Atual dos Testes

### ✅ **Funcionando Sem Docker:**
- **68 testes de schema** - Validação Zod
- **Tempo**: ~5 segundos
- **Cobertura**: Schemas de autenticação, boards, cards, columns

### 🔄 **Funcionando Com Docker:**
- **Testes de integração** - Controllers e serviços
- **Testes E2E** - Fluxos completos
- **Tempo**: ~30-60 segundos

## 🎯 Recomendações

### **Para Desenvolvimento Diário:**
```bash
npm run test:unit
```

### **Antes de Commits:**
```bash
npm run test:unit
npm run lint:fix
```

### **Antes de Deploy:**
```bash
npm run test:check-env
npm run test
npm run test:e2e
```

## 📝 Comandos Úteis

```bash
# Verificar ambiente
npm run test:check-env

# Testes rápidos
npm run test:unit

# Todos os testes (precisa Docker)
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E com interface
npm run test:e2e:ui

# E2E com navegador visível
npm run test:e2e:headed
```

---

**✅ Status**: Testes unitários funcionando perfeitamente sem Docker!
**🚀 Próximo passo**: Configurar Docker para testes de integração e E2E
